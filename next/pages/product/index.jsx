import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import CategoryTitle from "@/components/product-list/header/CategoryTitle";
import SortSearch from "@/components/product-list/sortSearch/SortSearch";
import MobileFliterAside from "@/components/product-list/aside/MobileFliterAside";
import PcFliterAside from "@/components/product-list/aside/PcFliterAside";
import ProductGroup from "@/components/product-list/productlist/ProductList";
import Nav from "@/components/Header/Header";
import Footer from "@/components/footer/footer";
import ListPageNation from "@/components/product-list/productlist/ListPageNation";

export default function ProductIndex() {
  const [products, setProducts] = useState([]);
  const [categories, setCategoryies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(16);
  const [totalItems, setTotalItems] = useState(0);
  const [currentSort, setCurrentSort] = useState("id_asc");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // 從URL讀取初始參數
    const {page,sort,search:urlSearch} = router.query;
    if(page) setCurrentPage(parseInt(page));
    if(sort) setCurrentSort(sort);
    if(urlSearch) setSearch(urlSearch);
  },[router.query])

  // 掛載後執行一個獲取數據的副作用
  // 使用axios發送get訊息到指定URL API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // response取得axios的回應數據(內容有很多但我們只要data)
        const response = await axios.get(
          `http://localhost:3005/api/product?sort=${currentSort}&page=${currentPage}&limit=${itemsPerPage}&search=${search}`
        );
        setProducts(response.data.products);
        setCategoryies(response.data.categories);
        setTotalPages(response.data.pagination.totalPages);
        setTotalItems(response.data.pagination.totalItems);

        setLoading(false);
      } catch (err) {
        setError("加載商品時出錯");
        setLoading(false);
      }
    };
    fetchProducts();

    // 更新URL
    const query = {page:currentPage,sort:currentSort};
    if(search) query.search = search;

    router.push({
      pathname:router.pathname,
      query:query,
    }, undefined, { shallow: true });
  }, [currentPage, itemsPerPage, currentSort,search]);

  // 更改頁數的函式
  const changePage = (newPage) => {
    setCurrentPage(newPage);
  };

  // 更改排序方式的函式
  const changeSort = (newSort) => {
    setCurrentSort(newSort);
    setCurrentPage(1);
  };

  // 搜尋功能
  const changeSearch = (newSearch) => {
    setSearch(newSearch);
    setCurrentPage(1);
    setCurrentSort("id_asc");
  };

  if (loading) return <div>加載中...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      <>
        <header>
          <Nav />
          {/* TOP的分類名稱 */}
          <CategoryTitle />
        </header>
        <div className="container">
          {/* 排序跟搜尋 */}
          <SortSearch
            changeSort={changeSort}
            currentSort={currentSort}
            search={search}
            changeSearch={changeSearch}
            totalItems={totalItems}
          />
          {/* 手機&平板版的開關aside */}
          <MobileFliterAside />
          {/* 主要內容 */}
          <div className="row main-content">
            {/* 電腦版篩選 */}
            <PcFliterAside categories={categories} />
            {/* 商品list */}
            <ProductGroup products={products} />
            {/* 分頁 */}
            <ListPageNation
              currentPage={currentPage}
              totalPages={totalPages}
              changePage={changePage}
            />
          </div>
        </div>
        <Footer />
      </>
    </>
  );
}
