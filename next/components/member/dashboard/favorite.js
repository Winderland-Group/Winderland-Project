import React, { useState, useEffect } from 'react';
// import styles from '@/components/member/member.module.css'
import Image from 'next/image'
import 'bootstrap/dist/css/bootstrap.min.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
// import { faFilter } from '@fortawesome/free-solid-svg-icons'

import FavoriteAside from '@/components/member/dashboard/favorite/FavoriteAside'
import FavoriteFilterOffcanvas from '@/components/member/dashboard/favorite/FavoriteFilterOffcanvas';
import FavoriteP from './favorite/FavoriteP'
import FavoritePrwd from './favorite/FavoritePrwd'
import FavoriteC from './favorite/FavoriteC'
import FavoriteCrwd from './favorite/FavoriteCrwd'
import FavoriteA from './favorite/FavoriteA'
import FavoriteArwd from './favorite/FavoriteArwd'

export default function DashboardFavorite() {
  const [filter, setFilter] = useState('all');
  const [favorites, setFavorites] = useState({
    products: [],
    courses: [],
    articles: []
  });

  // useEffect(() => {
  //   fetchFavorites();
  // }, []);

  // const fetchFavorites = async () => {
  //   try {
  //     const productRes = await fetch('/api/favorites?type=products');
  //     const courseRes = await fetch('/api/favorites?type=courses');
  //     const articleRes = await fetch('/api/favorites?type=articles');

  //     const products = await productRes.json();
  //     const courses = await courseRes.json();
  //     const articles = await articleRes.json();

  //     setFavorites({
  //       products: products.data || [],
  //       courses: courses.data || [],
  //       articles: articles.data || []
  //     });
  //   } catch (error) {
  //     console.error('獲取收藏時出錯:', error);
  //   }
  // };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  return (
    <>
      {/* desk */}
      <div className=" container d-lg-flex  d-none d-lg-block mb-5">
        {/* 側欄 */}
        <FavoriteAside onFilterChange={handleFilterChange} />

        <div className="favorite-list mb-5">
        {(filter === 'all' || filter === 'products') && (
          <div className="favorite-p">
            <FavoriteP products={favorites.products} />
          </div>
        )}
        {(filter === 'all' || filter === 'courses') && (
          <div className="favorite-c">
            <FavoriteC courses={favorites.courses} />
          </div>
        )}
        {(filter === 'all' || filter === 'articles') && (
          <div className="favorite-a mb-5">
            <FavoriteA articles={favorites.articles} />
          </div>
        )}
      </div>
      </div>

      {/* rwd */}
      <div className="d-block d-lg-none" id="favorite-content-rwd">
        {/* 搜尋區 */}
        <div className="d-flex  align-items-center searchArea">
          <div className="search ms-4 mt-2 ">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="search_icon" />
            <input id="search" type="search" placeholder="搜 尋 關 鍵 字 " />
          </div>
          {/* 篩選手風琴元件 */}
          <FavoriteFilterOffcanvas />
        </div>

        {/* 收藏區 */}
        <div className="favorite-list-rwd container-fluid mb-5">
          {/* 商品收藏 */}
          <div className="favorite-p-rwd">
            <FavoritePrwd />
          </div>
          {/* 課程收藏 */}
          <div className="favorite-c-rwd">
            <FavoriteCrwd />
          </div>
          {/* 文章收藏 */}
          <div className="favorite-a mb-5">
            <FavoriteArwd />
          </div>
        </div>
      </div>
    </>
  )
}
