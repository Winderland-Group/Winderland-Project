// @ 導入
import React, { useState } from 'react'
import { useRouter } from 'next/router'
import styles from '@/components/member/member.module.css'
import Image from 'next/image'
import Link from 'next/link'
import GoogleLogo from '@/components/icons/google-logo'
import 'bootstrap/dist/css/bootstrap.min.css'
import { useAuth } from '@/hooks/use-auth'
import Swal from 'sweetalert2'


// @ 預設導出
export default function LoginForm() {
  const { login, googleLogin , isLoading } = useAuth();
  const router = useRouter()

  // 狀態設置
  const [user, setUser] = useState({
    account: '',
    password: '',
  })

  // 記錄欄位錯誤訊息用
  const [errors, setErrors] = useState({
    account: '',
    password: '',
  })
  // 顯示密碼用
  const [showPassword, setShowPassword] = useState(false)

  // 添加 rememberMe 狀態
  const [rememberMe, setRememberMe] = useState(false);

  // 多欄位共用事件處理函式
  const handleFieldChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value })
  }

  // 表單送出事件處理函式
  const handleSubmit = async (e) => {
    e.preventDefault()
    // console.log('Account:', user.account);
    // console.log('Password:', user.password);

    // ! 表單檢查--- START ---
    // 建立一個新的錯誤訊息物件
    const newErrors = { account: '', password: '' }

    // 開始檢查
    if (!user.account) {
      newErrors.account = '帳號為必填'
    }

    if (!user.password) {
      newErrors.password = '密碼為必填'
    } else if (user.password.length < 6 || user.password.length > 12) {
      newErrors.password = '密碼最少6個字元至多12字元'
    }

    // 檢查完成後設定到錯誤狀態
    setErrors(newErrors)

    // newErrors物件中如果有屬性值不是空白字串時，代表有錯誤發生
    const hasErrors = Object.values(newErrors).some((v) => v)

    // 如果有錯誤發生，停止接下來的送到伺服器程式碼
    if (hasErrors) {
      return // 直接返回，不再執行後續代碼
    }
    // ! 表單檢查--- END ---


    try {
      const loginResult = await login(user.account, user.password, rememberMe);
      if (loginResult && loginResult.success) {
        // alert(loginResult.message);
        // 使用 SweetAlert2 替代 alert
        await Swal.fire({
          icon: 'success',
          title: '登入成功',
          text: loginResult.message,
          showConfirmButton: false,
          timer: 1500
        });
        router.push('/dashboard');
      } else {
        // 使用 SweetAlert2 替代 alert
        await Swal.fire({
          icon: 'error',
          title: '登入失敗',
          text: loginResult ? loginResult.message : '未知錯誤',
        });
      }
    } catch (error) {
      console.error('登入過程中發生錯誤:', error);
      // 使用 SweetAlert2 替代 alert
      await Swal.fire({
        icon: 'error',
        title: '錯誤',
        text: '登入過程中發生錯誤',
      });
    }
  }

  // 處理 Google 登入
  const handleGoogleLogin = async () => {
    if (isLoading) {
      // 如果 auth 狀態正在加載，顯示一個加載消息或返回
      Swal.fire({
        title: '請稍候',
        text: '正在初始化登入服務...',
        icon: 'info',
        showConfirmButton: false,
        timer: 1500
      });
      return;
    }

    try {
      const result = await googleLogin();
      if (result.success) {
        await Swal.fire({
          icon: 'success',
          title: '登入成功',
          text: 'Google 登入成功！',
          showConfirmButton: false,
          timer: 1500
        });
        router.push('/dashboard');
      } else {
        await Swal.fire({
          icon: 'error',
          title: '登入失敗',
          text: result.message || 'Google 登入失敗',
        });
      }
    } catch (error) {
      console.error('Google 登入過程中發生錯誤:', error);
      await Swal.fire({
        icon: 'error',
        title: '錯誤',
        text: 'Google 登入過程中發生錯誤',
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>; // 或者其他加載指示器
  }


  // @ 渲染
  return (
    <>
      {/* desk */}
      <div className={` d-none d-lg-block`}>
        <div>
          <div className={`${styles.tabContent} ms-5`}>
            {/* 01-login */}
            <form onSubmit={handleSubmit} >
              <div
                className={`${styles.tabPane} ${styles.fade} ${styles.show} ${styles.active} ${styles.loginContent}`}
                id="login"
                role="tabpanel"
                aria-labelledby="login-tab"
              >
                <label className={styles.label} htmlFor="login-account">
                  會員帳號
                </label>{' '}
                <br />
                <input
                  type="text"
                  name="account"
                  value={user.account}
                  className={styles.loginInput}
                  onChange={handleFieldChange}
                />
                <br />
                {/* 錯誤訊息 */}
                {errors.account && <span className={`${styles.error} ${styles.show} ${styles.errorAccount}`}>{errors.account}</span>}
                <br />
                <div
                  className={`d-flex justify-content-between align-items-center ${styles.pwdNotice}`}
                >
                  <label className={styles.label} htmlFor="login-pwd">
                    會員密碼
                  </label>{' '}
                  <br />

                  {/* 顯示密碼checkbox */}
                  <div
                    className={`${styles.formCheck} align-items-center d-flex`}
                  >
                    <input
                      className={`${styles.formCheckInput} me-2`}
                      type="checkbox"
                      checked={showPassword}
                      onChange={() => {
                        setShowPassword(!showPassword)
                      }}
                    />

                    <label
                      className={styles.formCheckLabel}
                      htmlFor="showPassword"
                    >
                      顯示密碼
                    </label>
                  </div>
                </div>
                {/* 密碼輸入欄 */}
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={styles.loginInput}
                  value={user.password}
                  onChange={handleFieldChange}
                />

                {errors.password && <span className={`${styles.error} ${styles.show} ${styles.errorPwd}`}>{errors.password}</span>}
                <div
                  className={`d-flex justify-content-between align-items-center ${styles.forgetPwd}`}
                >

                  {/* 記住我的登入 */}
                  <div
                    className={`${styles.formCheck} align-items-center d-flex`}
                  >
                    <input
                      className={`${styles.formCheckInput} me-2`}
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label
                      className={styles.formCheckLabel}
                      htmlFor="rememberMe"
                    >

                      記住我的登入
                    </label>
                  </div>
                  <Link
                    href="/member/forget-password"
                    className={styles.outlineButton}
                  >
                    忘記密碼？
                  </Link>
                </div>
                {/* 登入按鈕 */}
                <button
                  type="submit"
                  className={styles.button}
                  onClick={(e) => {
                    // LoginForm()
                    // 登入後跳轉到個人資料頁(使用router)
                    // router.push('/dashboard/profile')
                    e.preventDefault(); // 防止表單默認提交
                    handleSubmit(e); // 調用表單提交處理函數
                  }}>
                  登入
                </button>

                <div
                  className={`d-flex justify-content-center ${styles.noAccount}`}
                >
                  <p>目前還沒有帳號嗎？</p>{' '}
                  <Link href="/member/register"
                    className={styles.red}>加入我們</Link>
                </div>
                {/* 第三方登入 */}
                <div className={styles.fastLogin}>
                  <hr className={styles.hr} />
                  <div className={styles.buttonGruop}>
                    <button
                      className={`${styles.googleLogin} d-flex justify-content-center align-items-center`}
                      onClick={handleGoogleLogin}
                      type="button"  // 確保這不會觸發表單提交
                    >
                      <GoogleLogo className="mx-3" />
                      使用GOOGLE登入
                    </button>
                    <button
                      className={`${styles.lineLogin} d-flex justify-content-center align-items-center`}
                    >
                      <Image
                        src="/images/member/LINE_Brand_icon.png"
                        alt="Line登入"
                        width={50}
                        height={50}
                        className={`${styles.img} mx-2`}
                      />
                      使用LINE登入
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div> </div>
      </div>

      {/* RWD */}
      <div className="d-block d-lg-none">
        <div>
          <div className={`${styles.tabContent} ms-5`}>
            {/* login */}
            <form onSubmit={handleSubmit}>
              <div
                className={`tab-pane fade show active ${styles.loginContent}`}
                role="tabpanel"
                aria-labelledby="login-tab-rwd"
              >
                <label htmlFor="login-account">會員帳號</label> <br />
                <input
                  type="text"
                  name="account"
                  value={user.account}
                  className={styles.loginInput}
                  onChange={handleFieldChange}
                />
                <br />
                {/* 錯誤訊息 */}
                {errors.account && <span className={`${styles.error} ${styles.show} ${styles.errorAccount}`}>{errors.account}</span>}
                <br />
                <div
                  className={`d-flex justify-content-between align-items-center ${styles.pwdNotice}`}
                >
                  <label htmlFor="login-pwd">會員密碼</label> <br />
                  <div
                    className={`form-check align-items-center d-flex ${styles.formCheck}`}
                  >
                    <input
                      className={`${styles.formCheckInput} me-2`}
                      type="checkbox"
                      checked={showPassword}
                      onChange={() => {
                        setShowPassword(!showPassword)
                      }}
                      defaultValue=""
                    />
                    <label
                      className={`form-check-label ${styles.formCheckLabel}`}
                      htmlFor="showPassword"
                    >
                      {' '}
                      顯示密碼
                    </label>
                  </div>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={styles.loginInput}
                  value={user.password}
                  onChange={handleFieldChange}
                />
                {errors.password && <span className={`${styles.error} ${styles.show} ${styles.errorPwd}`}>{errors.password}</span>}
                <div
                  className={`d-flex justify-content-between align-items-center ${styles.forgetPwd}`}
                >
                  {/* 記住登入 */}
                  <div
                    className={`form-check align-items-center d-flex ${styles.formCheck}`}
                  >
                    <input
                      className={`${styles.formCheckInput} me-2`}
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label
                      className={`form-check-label ${styles.formCheckLabel}`}
                      htmlFor="rememberMe"
                    >
                      {' '}
                      記住我的登入
                    </label>
                  </div>

                  <Link
                    href="/member/forget-password"
                    className={styles.outlineButton}
                  >
                    忘記密碼？
                  </Link>
                </div>
                <button className={styles.loginButton}>登入</button>
                <div
                  className={`d-flex justify-content-center ${styles.noAccount}`}
                >
                  <p>目前還沒有帳號嗎？</p>
                  <Link href="/member/register"
                    className={styles.red}>加入我們</Link>

                </div>
                <div className={styles.fastLogin}>
                  <hr />
                  <div className={styles.buttonGroup}>
                    <button
                      className={`${styles.googleLogin} d-flex justify-content-center align-items-center`}
                    >
                      <GoogleLogo className="mx-3" />
                      使用GOOGLE登入
                    </button>
                    <button
                      className={`${styles.lineLogin} d-flex justify-content-center align-items-center`}
                    >
                      <Image
                        src="/images/member/LINE_Brand_icon.png"
                        alt="Line登入"
                        width={50}
                        height={50}
                        className={styles.img}
                      />
                      使用LINE登入
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
