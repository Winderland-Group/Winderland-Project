import express from 'express'
import 'dotenv/config.js'
import connection from '##/configs/mysql.js'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import { fileURLToPath } from 'url'
import path from 'path'

const router = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// multer的設定值 - START
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, path.join(__dirname, '..', 'public', 'uploads', 'article'))
  },
  filename: function (req, file, callback) {
    const uniqueSuffix = uuidv4()
    callback(null, uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({ storage: storage })
// multer的設定值 - END

router.get('/all', async (req, res) => {
  try {
    let query = `SELECT a.*, 
        GROUP_CONCAT(ia.path) AS images,
        DATE(a.update_time) AS update_date
      FROM article a
      LEFT JOIN images_article ia ON a.id = ia.article_id
      WHERE a.poster = 'Admin'
      GROUP BY a.id
    `
    const [articles] = await connection.execute(query)

    // 返回文章數據和總頁數
    res.json({ articles })
    // console.log(totalPages)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: '無法查詢資料' })
  }
})

router.get('/', async (req, res) => {
  try {
    const {
      search = '',
      category = '',
      dateFilter = '',
      startDate = '',
      endDate = '',
      page = 1,
      limit = 6,
    } = req.query

    const categoryMap = {
      knowledge: '葡萄酒小知識',
      regional: '產區特色',
      varieties: '葡萄品種介紹',
      pairing: '搭配餐點推薦',
      cocktail: '調酒知識',
    }

    let baseQuery = `
      FROM article a
      LEFT JOIN images_article ia ON a.id = ia.article_id
    `

    const params = []

    let whereClause = ''
    if (search) {
      whereClause += ' WHERE a.title LIKE ?'
      params.push(`%${search}%`)
    }

    if (category) {
      const categoryName = categoryMap[category] || category
      if (params.length > 0) {
        whereClause += ' AND a.category = ?'
      } else {
        whereClause += ' WHERE a.category = ?'
      }
      params.push(categoryName)
    }

    if (dateFilter) {
      let dateCondition
      switch (dateFilter) {
        case '本日':
          dateCondition = `DATE(a.update_time) = CURDATE()`
          break
        case '本週':
          dateCondition = `YEARWEEK(a.update_time, 1) = YEARWEEK(CURDATE(), 1)`
          break
        case '本月':
          dateCondition = `MONTH(a.update_time) = MONTH(CURDATE()) AND YEAR(a.update_time) = YEAR(CURDATE())`
          break
        case '近半年':
          dateCondition = `a.update_time >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)`
          break
        case '近一年':
          dateCondition = `a.update_time >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)`
          break
        case '一年以上':
          dateCondition = `a.update_time < DATE_SUB(CURDATE(), INTERVAL 1 YEAR)`
          break
        default:
          dateCondition = ''
      }

      if (dateCondition) {
        if (params.length > 0) {
          whereClause += ` AND ${dateCondition}`
        } else {
          whereClause += ` WHERE ${dateCondition}`
        }
      }
    }

    if (startDate && endDate) {
      if (params.length > 0) {
        whereClause += ' AND DATE(a.update_time) BETWEEN ? AND ?'
      } else {
        whereClause += ' WHERE DATE(a.update_time) BETWEEN ? AND ?'
      }
      params.push(startDate, endDate)
    }

    // 計算符合條件的總文章數
    const totalQuery = `SELECT COUNT(DISTINCT a.id) as total ${baseQuery} ${whereClause}`
    const [totalResult] = await connection.execute(totalQuery, params)
    const totalPages = Math.ceil(totalResult[0].total / limit)
    console.log(totalResult)

    // 查詢當前頁面的文章
    let query = `
      SELECT a.*, 
        GROUP_CONCAT(ia.path) AS images,
        DATE(a.update_time) AS update_date
      ${baseQuery} 
      ${whereClause}
      GROUP BY a.id
    `
    const offset = (page - 1) * limit
    query += ` ORDER BY a.update_time DESC LIMIT ? OFFSET ?`
    params.push(Number(limit), Number(offset))

    const [articles] = await connection.execute(query, params)

    // 返回文章數據和總頁數
    res.json({ articles, totalPages })
    // console.log(totalPages)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: '無法查詢資料' })
  }
})

// 文章細節頁
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    let query = `SELECT a.*,
      GROUP_CONCAT(ia.path) AS images,
      DATE(a.update_time) AS update_date 
      FROM article a
      LEFT JOIN images_article ia ON a.id = ia.article_id
      WHERE a.id = ? AND a.valid = '1'
      GROUP BY a.id
    `
    const [article] = await connection.execute(query, [id])
    if (article.length === 0) {
      return res.json([])
    }

    res.json(article[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: '無法查詢資料' })
  }
})

// 新增文章
router.post('/new', async (req, res) => {
  try {
    const { title, category, content, poster, update_time, valid } = req.body
    // 格式化 update_time
    const formattedUpdateTime = update_time.replace('T', ' ').slice(0, 19)
    const query = `
      INSERT INTO article (title, category, content, poster, update_time, valid)
      VALUES (?, ?, ?, ?, ?, ?)
    `

    // Execute the query to insert the article
    const [result] = await connection.execute(query, [
      title,
      category,
      content,
      poster,
      formattedUpdateTime,
      valid,
    ])

    res
      .status(201)
      .json({ message: '文章新增成功', articleId: result.insertId })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: '無法新增文章' })
  }
})

// 上傳首圖
router.post(
  '/upload-main-image/:articleId',
  upload.single('image'),
  async (req, res) => {
    const { articleId } = req.params

    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' })
    }

    const imagePath = `${req.file.filename}`
    try {
      const query = `INSERT INTO images_article (article_id, path) VALUES (?, ?)`
      await connection.execute(query, [articleId, imagePath])
      res.status(200).json({ message: 'Image uploaded successfully' })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Failed to save image path' })
    }
  }
)

// 上傳內嵌圖片
router.post(
  '/upload-inline-image/:articleId',
  upload.single('image'),
  async (req, res) => {
    const { articleId } = req.params

    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' })
    }

    const imagePath = `${req.file.filename}`

    try {
      const query = `INSERT INTO images_article (article_id, path) VALUES (?, ?)`
      await connection.execute(query, [articleId, imagePath])
      res.status(200).json({ message: 'Image uploaded successfully' })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Failed to save image path' })
    }
  }
)

// const fs = require('fs') // 如果你需要刪除實體檔案

// 更新文章並處理圖片
router.put(
  '/update/:articleId',
  upload.fields([{ name: 'mainImage' }, { name: 'inlineImages' }]),
  async (req, res) => {
    try {
      const { articleId } = req.params
      const {
        title,
        category,
        content,
        update_time,
        valid,
        existingInlineImages,
      } = req.body

      // 格式化 update_time
      const formattedUpdateTime = update_time.replace('T', ' ').slice(0, 19)

      // 更新文章数据
      const updateQuery = `
      UPDATE article 
      SET title = ?, category = ?, content = ?, update_time = ?, valid = ?
      WHERE id = ?
    `
      await connection.execute(updateQuery, [
        title,
        category,
        content,
        formattedUpdateTime,
        valid,
        articleId,
      ])

      // 获取当前所有的图片路径
      const [existingImages] = await connection.execute(
        `SELECT path FROM images_article WHERE article_id = ?`,
        [articleId]
      )
      // 排除第一笔数据
      const existingImagePaths = existingImages.map((img) => img.path).slice(1)
      console.log(existingImagePaths)
      // 处理现有内嵌图片
      const currentInlineImages = JSON.parse(existingInlineImages).slice(1)

      // 找出需要删除的图片
      const imagesToDelete = existingImagePaths.filter(
        (path) => !currentInlineImages.includes(path)
      )

      // 删除图片
      await Promise.all(
        imagesToDelete.map(async (imagePath) => {
          await connection.execute(
            `DELETE FROM images_article WHERE article_id = ? AND path = ?`,
            [articleId, imagePath]
          )
        })
      )

      // 添加主图
      if (req.files['mainImage']) {
        const newMainImagePath = req.files['mainImage'][0].filename

        // 获取当前主图路径
        const [currentMainImage] = await connection.execute(
          `SELECT path FROM images_article WHERE article_id = ? ORDER BY id ASC LIMIT 1`,
          [articleId]
        )

        const currentMainImagePath =
          currentMainImage.length > 0 ? currentMainImage[0].path : null

        // 只有当主图路径不同的时候才更新
        if (currentMainImagePath !== newMainImagePath) {
          await connection.execute(
            `INSERT INTO images_article (article_id, path) VALUES (?, ?) ON DUPLICATE KEY UPDATE path = VALUES(path)`,
            [articleId, newMainImagePath]
          )
        }
      }

      // 添加内嵌图片
      if (req.files['inlineImages']) {
        const inlineImagePaths = req.files['inlineImages'].map(
          (file) => file.filename
        )
        const existingInlineImagePaths = currentInlineImages

        // 找出需要添加的图片
        const imagesToAdd = inlineImagePaths.filter(
          (path) => !existingInlineImagePaths.includes(path)
        )

        // 添加新的图片
        await Promise.all(
          imagesToAdd.map(async (imagePath) => {
            await connection.execute(
              `INSERT INTO images_article (article_id, path) VALUES (?, ?) ON DUPLICATE KEY UPDATE path = VALUES(path)`,
              [articleId, imagePath]
            )
          })
        )
      }

      res.status(200).json({ message: '文章更新成功' })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: '無法更新文章' })
    }
  }
)

export default router
