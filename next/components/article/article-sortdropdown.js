import React from "react";
import { FaAngleDown } from "react-icons/fa6";

export default function ArticleSortdropdown() {
  return (
    <>
    
        <button
          className="btn btn-secondary a-sort-btn py-2"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          默認排序 <FaAngleDown style={{color:"var(--purple_light)"}} />
        </button>
        <ul className="dropdown-menu a-dropdown-menu dropdown-menu-end">
          <li>
            <a className="dropdown-item a-dropdown-item" href="#">
              <i className="fa-regular fa-clock" /> 最新發布
            </a>
          </li>
          <li>
            <a className="dropdown-item" href="#">
              <i className="fa-solid fa-fire" /> 熱門文章
            </a>
          </li>
        </ul>
    </>
  );
}
