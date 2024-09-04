import React, { useState } from "react";
import style from "@/components/member/dashboard/coupon/coupon.module.css";
import { FaCircleCheck } from "react-icons/fa6";

export default function CouponCardModal({
  coupon,
  onSelect,
  isChecked,
  isClaimed,
  isUsed,
}) {
  const handleCheck = () => {
    if (isClaimed | isUsed) {
      return; // 已經領取過的優惠券不能再選
    }
    onSelect(coupon); // 呼叫父元件的 onSelect 函式
  };

  const getCategoryClass = (category) => {
    switch (category) {
      case "倍數折扣":
        return {
          cardClass: style.couponDiscountCard,
          categoryClass: style.couponDiscountCategory,
        };
      case "金額折扣":
        return {
          cardClass: style.couponCard,
          categoryClass: style.couponC,
        };
      default:
        return {
          cardClass: "",
          categoryClass: "",
        };
    }
  };
  const couponcss = getCategoryClass(coupon.category);

  return (
    <>
      {/* 一組優惠券 */}

      <div
        className={`col-9 ms-3 px-4 py-3`}
        title={`低消＄${coupon.min_spend}`}
      >
        <div
          className={`row align-items-center py-3 ${couponcss.cardClass}`}
        >
          <div className={`col-auto pe-0`}>
            <p
              className={`p-2 m-0 ${couponcss.categoryClass}`}
            >
              {coupon.category}
            </p>
          </div>
          <div className={`col p-0`}>
            <p className={`${style.couponN} m-0`}>{coupon.name}</p>
          </div>
        </div>
      </div>
      {/* {console.log(coupon)} */}
      <a
        className={`${style.plusBottom} col-auto`}
        title={`低消＄${coupon.min_spend}`}
        onClick={handleCheck}
      >
        {isChecked | isClaimed ? (
          <FaCircleCheck
            className="ms-3"
            style={{ fontSize: "40px", color: "var(--blue)" }}
          />
        ) : isUsed ? (
          "已使用"
        ) : (
          "+領取"
        )}
      </a>
      {/* {console.log(isChecked)} */}
    </>
  );
}
