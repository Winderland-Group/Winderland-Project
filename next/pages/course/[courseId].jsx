import Comment from "@/components/course/course-comment";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import Nav from "@/components/Header/Header";
import Footer from "@/components/footer/footer";
import { useAuth } from "@/hooks/use-auth";
import Head from "next/head";
import Swal from "sweetalert2";
import Arrtotop from "@/components/Header/arr";

export default function CourseIndex() {
  const [classSum, setClassSum] = useState([]);
  const { auth } = useAuth();
  const [userId, setUserId] = useState(null);
  useEffect(() => {
    if (auth.isAuth) {
      setUserId(auth.userData?.id);
      console.log("userId 是否已設定: " + auth?.isAuth);

      console.log("以下是auth內容");
      console.log(auth);
      console.log("======auth結束======");
    }
  }, [auth]);

  const router = useRouter();
  // const { courseId, series } = router.query;
  const { courseId, series } = router.query;
  console.log("本頁courseId抓取為:" + courseId);
  const [course, setCourse] = useState([]);
  const [theCourseAssigned, setCourseAssigned] = useState([]);
  const [comments, setComments] = useState([]);
  const [existing, setExisting] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [myCoursesId, setMyCoursesId] = useState([])
  
  let averageRating = 0;

  // 獲取課程總數，避免網址輸入不存在的課程導致顯示錯誤
  useEffect(() => {
      fetch(`http://localhost:3005/api/course?userId=${userId}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response not ok");
          }
          return response.json();
        })
        .then((data) => {
          const { classSum } = data;
          setClassSum(classSum);
          console.log("userId= " + userId);
          console.log("classSum numbers= " + classSum.length);
        })
        .catch((error) => {
          console.log(error);
        });
  }, [userId, courseId]);

  const seriesDefaultBtn = useRef(null);

  let apiUrl = `http://localhost:3005/api/course/${courseId}?userId=${userId}`;

  // 顯示影片
  const [showVideo, setShowVideo] = useState(false);
  const videoRefs = useRef(null);
  const handleClickPlayerBtn = ()=>{
    console.log("觸發play btn");
    setShowVideo(true)
    handlePlay()
    // videoRefs.current.currentTime = 0;
    // videoRefs.current.play();
  }
  const handlePlay = ()=>{
    setTimeout(()=>{
      document.getElementById('courseVideo').currentTime = 0;
      document.getElementById('courseVideo').play();
    }, 10)
  }

  // useEffect(() => {
  //   console.log("觸發播放");
  //   console.log(videoRefs.current);
  //   if (videoRefs.current) {
  //       videoRefs.current.currentTime = 0;
  //       videoRefs.current.play();
  //   }
  // }, [showVideo, videoRefs]);

  function querySeries01(e) {
    router.push(
      {
        pathname: `/course/${courseId}`,
        query: {},
      },
      undefined,
      { scroll: false }
    );
    seriesDefaultBtn.current.focus();
    seriesDefaultBtn.current.textContent = e.target.textContent;
  }

  function querySeries02(e) {
    router.push(
      {
        pathname: `/course/${courseId}`,
        query: { series: "timeOldToNew" },
      },
      undefined,
      { scroll: false }
    );
    seriesDefaultBtn.current.focus();
    seriesDefaultBtn.current.textContent = e.target.textContent;
  }

  function querySeries03(e) {
    router.push(
      {
        pathname: `/course/${courseId}`,
        query: { series: "scoreHtoL" },
      },
      undefined,
      { scroll: false }
    );
    seriesDefaultBtn.current.focus();
    seriesDefaultBtn.current.textContent = e.target.textContent;
  }

  function querySeries04(e) {
    router.push(
      {
        pathname: `/course/${courseId}`,
        query: { series: "scoreLtoH" },
      },
      undefined,
      { scroll: false }
    );
    seriesDefaultBtn.current.focus();
    seriesDefaultBtn.current.textContent = e.target.textContent;
  }

  useEffect(() => {
    if (series === "timeOldToNew") {
      apiUrl = `http://localhost:3005/api/course/${courseId}?userId=${userId}&series=timeOldToNew`;
    } else if (series === "scoreHtoL") {
      apiUrl = `http://localhost:3005/api/course/${courseId}?userId=${userId}&series=scoreHtoL`;
    } else if (series === "scoreLtoH") {
      apiUrl = `http://localhost:3005/api/course/${courseId}?userId=${userId}&series=scoreLtoH`;
    } else {
      apiUrl = `http://localhost:3005/api/course/${courseId}?userId=${userId}`;
    }
  }, [series, userId]);

  // 獲取當前使用者報名的課程
  useEffect(() => {
    console.log("偵測到 courseId 或 userId 有變動: "+courseId+" / "+userId);
    if (userId && classSum.length > 0) {
      fetch(`http://localhost:3005/api/course/mycourses/${userId}`)
        .then((response) => {
          console.log("送出fetch，URL=" + `http://localhost:3005/api/course/mycourses/${userId}`);
          if (!response.ok) {
            throw new Error("Network response not ok");
          }
          return response.json();
        })
        .then((data) => {
          const { myCourses } = data;
          setMyCourses(myCourses);
          console.log(myCourses);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [courseId, userId, classSum]);

  // myCoursesId.length 若 >0，代表這堂課有在目前登入的 user 的報名項目中
  useEffect(()=>{
    console.log(myCourses.length);
    if(myCourses.length>0){
     setMyCoursesId(
        myCourses.filter((mycourseItem)=>
        parseInt(mycourseItem.class_id)===parseInt(courseId))
        )}
  }, [myCourses])
  // 獲取當前課程資訊
  useEffect(() => {
    if (courseId && classSum.length > 0) {
      // console.log(courseId+"+"+classSum.length);
      if (!(classSum.length+1 > parseInt(courseId) && parseInt(courseId) > 0)) {
        
        router.push({
          pathname: "/course/1",
          query: {},
        });
        apiUrl = `http://localhost:3005/api/course/1?userId=${userId}`;
      }

      fetch(apiUrl)
        .then((response) => {
          console.log("送出fetch，URL=" + apiUrl);
          if (!response.ok) {
            throw new Error("Network response not ok");
          }
          return response.json();
        })
        .then((data) => {
          const { course, theCourseAssigned, comments, existing } = data;
          console.log(course);
          setCourse(course[0]);
          setCourseAssigned(theCourseAssigned);
          setComments(comments);
          setExisting(existing);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [courseId, classSum, series, userId]);

  // 寫入購物車
  function handleCourseWriteInCart() {
    if (courseId && userId) {
      // 彈出確認對話框
      Swal.fire({
        title: "請確認是否加入購物車",
        text: `確認將課程 "${course?.class_name}" 加入購物車嗎?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "確認",
        cancelButtonText: "取消",
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          // 用戶確認後執行POST請求
          fetch(
            `http://localhost:3005/api/course/${courseId}?userId=${userId}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(), // 根據需要加入POST數據
            }
          )
            .then((response) => {
              console.log(
                `送出POST fetch，URL=http://localhost:3005/api/course/${courseId}?userId=${userId}`
              );
              if (!response.ok) {
                throw new Error("Network response not ok");
              }
              return response.json();
            })
            .then((data) => {
              console.log("成功寫入購物車", data);
              // 成功後顯示成功提示框
              Swal.fire({
                title: "成功加入購物車",
                text: `課程 "${course?.class_name}" 已成功加入購物車`,
                icon: "success",
                confirmButtonText: "確認",
              });
            })
            .catch((error) => {
              console.log("發生錯誤:", error);
              // 如果請求失敗，顯示錯誤提示框
              Swal.fire({
                title: "發生錯誤",
                text: "無法將課程加入購物車，請稍後再試。",
                icon: "error",
                confirmButtonText: "確認",
              });
            });
        }
      });
    }
  }

  if (comments.length > 0) {
    averageRating = (
      comments.reduce((acc, v) => acc + v.rating, 0) / comments.length
    ).toFixed(1);
  } else {
    averageRating = "0";
  }
  function handleStartTimeStr(startTime) {
    const startDate = new Date(startTime);
    const today = new Date();
    const sixMonthsAgo = new Date(today);
    sixMonthsAgo.setMonth(today.getMonth() - 6);
    const threeMonthsAgo = new Date(today);
    threeMonthsAgo.setMonth(today.getMonth() - 3);
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);
    if (startDate < sixMonthsAgo) {
      return "半年前";
    } else if (startDate < threeMonthsAgo) {
      return "三個月前";
    } else if (startDate < oneMonthAgo) {
      return "一個月前";
    } else {
      return startTime;
    }
  }
  function handleDateFormat(dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}號`;
  }
  function handleTimeFormat(timeStr) {
    const timeVar = String(timeStr);
    return timeVar.split(":").slice(0, 2).join(":");
  }

  function handleCourseAddToFav() { }
  function handleCourseRmFromFav() { }

  // 新增收藏
  const [isBookmarked, setIsBookmarked] = useState(false);
  useEffect(() => {
    // 檢查課程是否已被收藏
    const checkBookmarkStatus = async () => {
      if (userId && courseId) {
        try {
          const response = await fetch(`http://localhost:3005/api/favorites/courses`, {
            method: 'GET',
            credentials: 'include',
          });
          const data = await response.json();
          if (data.status === 'success') {
            setIsBookmarked(data.data.some(bookmark => bookmark.class_id === parseInt(courseId)));
          }
        } catch (error) {
          console.error('Error checking bookmark status:', error);
        }
      }
    };

    checkBookmarkStatus();
  }, [userId, courseId]);

  const toggleBookmark = async () => {
    if (!userId || !courseId) {
      Swal.fire({
        title: '請先登入',
        text: '您需要登入才能收藏課程',
        icon: 'warning',
        confirmButtonText: '確定'
      });
      return;
    }

    try {
      const url = `http://localhost:3005/api/favorites/courses/${courseId}`;
      const method = isBookmarked ? 'DELETE' : 'POST';

      const response = await fetch(url, {
        method: method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.status === 'success') {
        setIsBookmarked(!isBookmarked);

        Swal.fire({
          icon: 'success',
          title: isBookmarked ? '已取消收藏' : '收藏成功',
          text: isBookmarked ? '課程已從您的收藏中移除' : '課程已添加到您的收藏',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);

      Swal.fire({
        icon: 'error',
        title: '操作失敗',
        text: '無法更改收藏狀態，請稍後再試',
        timer: 1500,
        showConfirmButton: false
      });
    }
  };

  return (
    <>
      <Head>
        <title>{`醺迷仙園｜${course?.class_name}`}</title>

        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <link rel="icon" href="/logo.png" />
      </Head>
      <div className="course_wrap">
        {/* Header */}
        <Nav />
        <Arrtotop />

        {/* page three course-detail start */}
        <div className="container-fluid m-0 px-0">
          <div className="container-fluid px-0">
            <div className="container-sm px-0">
              <div className="row px-10px m-0 justify-content-center justify-content-md-start px-10px my-4">
                <Link className={`px-0 col-auto`} href={"/course"}>
                  <div className="spac-1 btn-border-wine btn">
                    <i className="fa-solid fa-chevron-left me-1"></i>
                    回到課程首頁
                  </div>
                </Link>
              </div>
              <div className="row px-0 mx-0 pt-3 mb-4 d-none d-md-flex">
                <div className="col px-10px">
                  <span
                    className={`me-4 py-2 px-3 h6 ${course?.online === 1 ? "online-tag" : "underline-tag"
                      }`}
                  >
                    {course?.online === 1 ? "線上" : "實體"}
                  </span>
                  <span className="text-prim-dark spac-1 me-5 h6">
                    {course?.class_name}
                  </span>
                  <span className="text-prim-dark spac-1 h6">
                    <i className="bi bi-clock-history me-2" />
                    {handleStartTimeStr(course?.appointment_start)}
                  </span>
                </div>
              </div>
              {/* course-detail md 寬度時顯示 start */}
              <div className="container-fluid px-0 d-none d-md-block">
                <div
                  className="row px-0 m-0 md-screen-show d-none d-md-flex"
                  style={{ paddingBottom: "280px" }}
                >
                  <div className="col-8 px-10px">{console.log(myCourses?myCourses:"no mycourses")}
                    <div className="course-body d-flex align-items-center w-100">
                      <div className="course-leftcontent w-100 course-mycourse-box">
                        <div
                          className="course-video-video overflow-hidden w-100 position-relative"
                          href=""
                        >
                        {showVideo?
                          <div className={`course-img21 video-radius bg-black`}>
                            <video className={`media-contain`} controls width="300" height="200" id={`courseVideo`} ref={videoRefs} autoPlay>
                              <source src={`http://localhost:3005/uploads/course_and_tarot/${course?.video_path}`} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          </div>
                        :
                          <img
                            className="course-img21"
                            src={course.class_path?`http://localhost:3005/uploads/course_and_tarot/${course?.class_path}`:`http://localhost:3005/uploads/course_and_tarot/classImgDefault.png`}
                            alt=""
                          />
                        }
                          <div
                            className={`absolute-t0-l0 w-100 h-100 justify-content-center align-items-center ${(showVideo) || (course?.online === 0) || !myCourses || myCoursesId.length===0 ? "d-none" : "d-flex"
                              }`} onClick={handleClickPlayerBtn}
                          >
                              <i className="fa-solid fa-circle-play text-white opacity-50 course-detail-player-btn cursor-pointer" />
                          </div>
                        </div>
                        <div
                          className={`progress-bar-area ${course?.online === 1 ? "d-none" : "d-block"
                            }`}
                        >
                          <div className="course-process-header d-flex justify-content-between mt-4">
                            <span className="h6 text-sec-dark-blue spac-1">
                              限額總數-{course?.student_limit}人
                            </span>
                            <span className="h6 text-sec-dark-blue spac-1">
                              已報名-
                              {course?.assigned > 0
                                ? (
                                  (course?.assigned / course?.student_limit) *
                                  100
                                ).toFixed(0)
                                : "0"}
                              %
                            </span>
                          </div>
                          <div
                            className="progress mt-3 bg-sec-blue"
                            role="progressbar"
                            aria-label=""
                            aria-valuenow={0}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            style={{ height: "5px" }}
                          >
                            <div
                              className="progress-bar bg-sec-blue-dark"
                              style={{
                                width: `${course?.assigned > 0
                                  ? (
                                    (course?.assigned /
                                      course?.student_limit) *
                                    100
                                  ).toFixed(0)
                                  : "0"
                                  }%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="course-body-2 col px-10px ms-3 h-100">
                    <h2 className="spac-2 lh-15 text-prim-text-prim">
                      <strong>{course?.class_name}</strong>
                    </h2>

                    <div className="row align-items-center mt-3 justify-content-between mx-0 row-gap-3">
                      <h5 className="col-auto text-prim-text-prim spac-1">
                        by {course?.name}
                      </h5>
                      <div className="col-auto stars d-flex align-items-center px-0">
                        <i
                          className={`fa-solid fa-star ${averageRating > 0.5
                            ? "star-with-score"
                            : "star-without-score"
                            }`}
                        />
                        <i
                          className={`fa-solid fa-star ${averageRating > 1.5
                            ? "star-with-score"
                            : "star-without-score"
                            }`}
                        />
                        <i
                          className={`fa-solid fa-star ${averageRating > 2.5
                            ? "star-with-score"
                            : "star-without-score"
                            }`}
                        />
                        <i
                          className={`fa-solid fa-star ${averageRating > 3.5
                            ? "star-with-score"
                            : "star-without-score"
                            }`}
                        />
                        <i
                          className={`fa-solid fa-star ${averageRating > 4.5
                            ? "star-with-score"
                            : "star-without-score"
                            }`}
                        />
                        <span
                          className={`ms-2 spac-1 text-sec-dark-blue emmit1 ${averageRating > 0 ? "d-inline-block" : "d-none"
                            }`}
                        >
                          {averageRating}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`row mx-0 text-sec-dark-blue spac-1 mt-4 ${course?.online === 1 ? "d-none" : "d-flex"
                        }`}
                    >
                      <div className="col-12 p-0">
                        <p className="text-sec-dark-blue emmit1">
                          <i className="fa-regular fa-calendar-days me-1"></i>
                          上課日期：{handleDateFormat(course?.course_start)}-
                          {handleDateFormat(course?.course_end)}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`row mx-0 text-sec-dark-blue spac-1 mt-2 ${course?.online === 1 ? "d-none" : "d-flex"
                        }`}
                    >
                      <div className="col-12 p-0">
                        <p className="text-sec-dark-blue emmit1">
                          <i
                            className="fa-regular fa-clock me-1"
                            style={{ fontSize: "0.7rem" }}
                          ></i>
                          上課時間：{handleTimeFormat(course?.daily_start_time)}
                          -{handleTimeFormat(course?.daily_end_time)}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`row mx-0 spac-1 mt-2 ${course?.online === 1 ? "d-none" : "d-flex"
                        }`}
                    >
                      <div className="col-12 p-0">
                        <p className="text-sec-dark-blue emmit1">
                          <i
                            className="fa-regular fa-compass me-1"
                            style={{ fontSize: "0.7rem" }}
                          ></i>
                          上課地點：{course?.address}
                        </p>
                      </div>
                    </div>

                    <div className="row mt-5 justify-content-between align-items-center px-0 mx-0 row-gap-3">
                      <div className="col-auto">
                      {(myCourses && myCoursesId.length>0) ?
                          <span className="h5 spac-2 text-gray-light">
                            <strong>
                              <i className="fa-regular fa-circle-check me-2"></i>課程已報名 
                            </strong>
                          </span>
                      :
                      <span className="h2 spac-2 text-sec-orange">
                          <strong>
                            NT$
                            {course.price && (!course.sale_price || parseInt(course.sale_price)==0)
                              ? course.price.toLocaleString()
                              : course.sale_price && course.sale_price
                                ? course.sale_price.toLocaleString()
                                : 0}
                          </strong>
                      </span>}
                        
                        <p
                          className={`text-gray-light h5 spac-2 mt-3 ${((!course.sale_price) || parseInt(course.sale_price)==0 || (course.sale_price) && myCourses && myCoursesId.length>0) ? "d-none" : "d-block"
                              }`}
                        >
                          <del>
                            NT$
                            {course.sale_price && parseInt(course.sale_price)!=0
                              ? course.price.toLocaleString()
                              : 0}
                          </del>
                        </p>
                      </div>
                      {/* <a
                        href="/"
                        className="col-auto d-flex align-items-center mt-1"
                      > */}
                      <a
                        href="#"
                        className="col-auto d-flex align-items-center"
                        onClick={(e) => {
                          e.preventDefault();
                          toggleBookmark();
                        }}
                      >
                        <h5 className="text-prim-text-prim spac-2">收藏</h5>
                        <i
                          className={`ms-2 fa-${isBookmarked ? 'solid' : 'regular'} fa-bookmark text-prim-text-prim`}
                          style={{ fontSize: "1.7rem" }}
                        ></i>
                        {/* {existing.length > 0 ? (
                          <i
                            className="ms-2 fa-solid fa-bookmark text-prim-text-prim"
                            style={{ fontSize: "1.7rem" }}
                            onClick={handleCourseAddToFav}
                          ></i>
                        ) : (
                          <i
                            className="ms-2 fa-regular fa-bookmark text-prim-text-prim"
                            style={{ fontSize: "1.7rem" }}
                            onClick={handleCourseRmFromFav}
                          />
                        )} */}
                      </a>
                    </div>
                    {(myCourses && myCoursesId.length>0) ?
                        <div className={`row h-100 ${course?.online === 0 ?'d-none':'d-block'}`}>
                          <div className="col-12 d-flex align-items-end">
                            <button
                              type="button"
                              className="btn spac-3 btn-sec-orange w-100 mt-3 py-4"
                              onClick={handleClickPlayerBtn}
                            >
                              播放影片<i className="fa-solid fa-play ms-2"></i>
                            </button>
                          </div>
                        </div>
                      :
                        <div className="row h-100">
                          <div className="col-12 d-flex align-items-end">
                            <button
                              type="button"
                              className="btn spac-3 btn-sec-orange w-100 mt-3 py-4"
                              onClick={handleCourseWriteInCart}
                            >
                              加入購物車
                            </button>
                          </div>
                        </div>}
                    
                  </div>
                </div>

                {/* 置頂小卡 md 螢幕時顯示 start */}
                <div
                  className="container-fluid px-0 position-relative d-none d-md-block"
                  style={{ marginBlock: "-200px" }}
                >
                  <div className="container-sm px-0">
                    <div className="container-fluid bg-light-gray rounded-5 w-100 shadow">
                      <div className="container-sm px-0 teacher-intro-card">
                        <div className="row p-2 p-md-4 mx-2 align-items-center justify-content-center">
                          <div className="teacher-head col-auto me-3 px-0">
                            <img
                              className="course-img21"
                              src={`http://localhost:3005/uploads/course_and_tarot/${course?.teacher_path}`}
                              alt=""
                            />
                            
                          </div>
                          <div className="teacher-text-box col col-md-4 col-lg-7 ms-3">
                          <Link className="row align-items-center justify-content-between d-flex flex-row" href={`/course/teacher/${course?.teacher_id}`}>
                              <div className="teacher-card-name col">

                                  <h2 className="spac-2 text-prim-dark lh-15">
                                    {course?.name}
                                  </h2>
                                  <h5 className="spac-2 text-prim-dark lh-15">
                                    {course?.name_en}
                                  </h5>
                              </div>
                              
                              <div className="col-auto teacher-more d-flex align-items-center">
                                  <h5 className="spac-2 text-prim-dark lh-15 me-2">
                                    講師詳情
                                  </h5>
                                  <i className="fa-solid fa-chevron-right text-prim-dark mt-1" />
                              </div>
                            </Link>
                            <hr className="my-4" />
                            <h5 className="spac-2 text-prim-dark lh-15 text-justify teacher-intro-card-text">
                              {course?.description}
                            </h5>
                          </div>
                          <div className="teacher-starts col d-flex flex-column align-items-center justify-content-center pe-0">
                            <h1 className="spac-2 text-prim-text-prim ms-2">
                              {averageRating}
                            </h1>
                            {/* bigStar start */}
                            <div className="bigStar-box">
                              <i className="fa-solid fa-star bigStar bigStar-beneath  text-light-wine-border" />
                              <i
                                className="fa-solid fa-star bigStar bigStar-above"
                                style={{
                                  width: `${(averageRating / 5) * 100}%`,
                                }}
                              />
                            </div>
                            {/* bigStar end */}
                            <p className="text-prim-text-prim">教師平均評分</p>
                            <p className="text-prim-text-prim">
                              ({comments.length > 0 ? comments.length : 0}
                              &nbsp;則評分)
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* 置頂小卡 md 螢幕時顯示 end */}
              </div>
              {/* course-detail md 寬度時顯示 end */}
              {/* course-detail 手機時顯示 start */}
              <div className="row small-screen-show d-flex d-md-none px-0 mx-0">
                <div className="col-12 d-flex flex-column align-items-center px-0 mx-0">
                  <div
                    className="course-video-video position-relative mb-3"
                    href=""
                  >
                  {showVideo?
                    <div className={`course-img21 video-radius bg-black`}>
                      <video className={`media-contain`} controls width="300" height="200" id={`courseVideo`} ref={videoRefs}>
                        <source src={`http://localhost:3005/uploads/course_and_tarot/${course?.video_path}`} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  :
                  <img className="course-img21"
                      src={`http://localhost:3005/uploads/course_and_tarot/${course?.class_path}`} alt=""/>
                  }
                    
                            
                    <div className={`absolute-t0-l0 w-100 h-100 justify-content-center align-items-center ${(showVideo) || (course?.online === 0) || !myCourses || myCoursesId.length===0 ? "d-none" : "d-flex"
                              }`} onClick={handleClickPlayerBtn}>
                      <a href="">
                        <i className="fa-solid fa-circle-play text-white opacity-50 course-detail-player-btn cursor-pointer" />
                      </a>
                    </div>
                  </div>
                </div>
                <div className="course-body-2 col px-10px h-100 mx-0">
                  <h1 className="spac-2 lh-15 text-prim-text-prim">
                    <strong>{course?.class_name}</strong>
                  </h1>

                  <div
                    className={`row mx-0 text-sec-dark-blue spac-1 mt-4 ${course?.online === 1 ? "d-none" : "d-flex"
                      }`}
                  >
                    <div className="col-12 p-0">
                      <p className="text-sec-dark-blue">
                        <i className={`fa-regular fa-calendar-days me-1`}></i>
                        上課日期：{handleDateFormat(course?.course_start)}-
                        {handleDateFormat(course?.course_end)}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`row mx-0 text-sec-dark-blue spac-1 mt-2 ${course?.online === 1 ? "d-none" : "d-flex"
                      }`}
                  >
                    <div className="col-12 p-0">
                      <p className="text-sec-dark-blue">
                        <i
                          className="fa-regular fa-clock me-1"
                          style={{ fontSize: "0.9rem" }}
                        ></i>
                        上課時間：{handleTimeFormat(course?.daily_start_time)}-
                        {handleTimeFormat(course?.daily_end_time)}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`row mx-0 spac-1 mt-2 ${course?.online === 1 ? "d-none" : "d-flex"
                      }`}
                  >
                    <div className="col-12 p-0">
                      <p className="text-sec-dark-blue">
                        <i
                          className="fa-regular fa-compass me-1"
                          style={{ fontSize: "0.9rem" }}
                        ></i>
                        上課地點：{course?.address}
                      </p>
                    </div>
                  </div>

                  <div className="row align-items-center mt-3 justify-content-between mx-0">
                    <h5 className="col-auto text-prim-text-prim spac-1">
                      by {course?.name}
                    </h5>
                    <div className="col-auto stars mt-2 d-flex align-items-center">
                      <i className="fa-solid fa-star star-with-score" />
                      <i className="fa-solid fa-star star-with-score" />
                      <i className="fa-solid fa-star star-with-score" />
                      <i className="fa-solid fa-star star-with-score" />
                      <i className="fa-solid fa-star star-with-score" />
                      <span className="ms-2 spac-1 text-sec-dark-blue">
                        {averageRating}
                      </span>
                    </div>
                  </div>
                  <div className="row justify-content-between align-items-center mt-4 mx-0">
                    <span
                      className={`col-auto online-tag me-4 h6 ${course?.online === 1 ? "online-tag" : "underline-tag"
                        }`}
                    >
                      {course?.online === 1 ? "線上" : "實體"}
                    </span>

                    <span className="col-auto h6 d-flex align-items-center">
                      <span
                        className={`text-gray-light h5 spac-2 mt-3 me-4 ${((!course.sale_price) || parseInt(course.sale_price)==0 || (course.sale_price) && myCourses && myCoursesId.length>0) ? "d-none" : "d-block"
                              }`}
                      >
                        <del>
                          NT$
                          {course.sale_price && parseInt(course.sale_price)!=0
                            ? course.price.toLocaleString()
                            : 0}
                        </del>
                      </span>
                      {(myCourses && myCoursesId.length>0) ?
                        <span className="h5 spac-2 text-gray-light">
                          <strong>
                            <i className="fa-regular fa-circle-check me-2"></i>課程已報名 
                          </strong>
                        </span>
                      :
                      <span className="h2 spac-2 text-sec-orange">
                          <strong>
                            NT$
                            {course.price && (!course.sale_price || parseInt(course.sale_price)==0)
                              ? course.price.toLocaleString()
                              : course.sale_price
                                ? course.sale_price.toLocaleString()
                                : 0}
                          </strong>
                      </span>}
                      {course?.online === 0 && myCourses && myCoursesId.length>0
                        ?
                        <a
                        className="p-2 ms-2"
                        onClick={(e) => {
                          e.preventDefault();
                          toggleBookmark();
                        }}>
                          <i
                            className={`fa-${isBookmarked ? 'solid' : 'regular'} fa-bookmark text-prim-text-prim`}
                            style={{ fontSize: "2rem" }}
                          />
                        </a>
                        :
                        ""
                      }
                      
                    </span>
                  </div>

                  <div
                    className={`progress-bar-area mb-5 ${course?.online === 1 ? "d-none" : "d-block"
                      }`}
                  >
                    <div className="course-process-header d-flex justify-content-between mt-4">
                      <span className="h6 text-sec-dark-blue spac-1">
                        限額總數-{course?.student_limit}人
                      </span>
                      <span className="h6 text-sec-dark-blue spac-1">
                        已報名-
                        {/* {theCourseAssigned.length > 0
                                ? (
                                    (theCourseAssigned.length /
                                      course.student_limit) *
                                    100
                                  ).toFixed(0)
                                : "0"} */}
                        {course?.assigned > 0
                          ? (
                            (course?.assigned / course?.student_limit) *
                            100
                          ).toFixed(0)
                          : "0"}
                        %
                      </span>
                    </div>
                    <div
                      className="progress mt-3 bg-sec-blue"
                      role="progressbar"
                      aria-label=""
                      aria-valuenow={0}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      style={{ height: "8px" }}
                    >
                      <div
                        className="progress-bar bg-sec-blue-dark"
                        style={{
                          width: `${course?.assigned > 0
                            ? (
                              (course?.assigned / course?.student_limit) *
                              100
                            ).toFixed(0)
                            : "0"
                            }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="row teacher-sm-introduce my-5 mx-0 px-0">
                    <div className="teacher-head col-auto px-0">
                      <img
                        src={`http://localhost:3005/uploads/course_and_tarot/${course?.teacher_path}`}
                        alt=""
                      />
                    </div>
                    <div className="teacher-text-box col px-4">
                      <div>
                        <span className="h3 spac-2 text-prim-dark lh-15">
                          {course?.name}
                        </span>
                        <span className="h6 spac-2 text-prim-dark lh-15">
                          {course?.name_en}
                        </span>
                        <i className="fa-solid fa-chevron-right text-prim-dark mt-1" />
                      </div>
                      <hr className="my-4" />
                      <p className="spac-1 text-prim-dark lh-15 text-justify teacher-intro-card-text">
                        {course?.description}
                      </p>
                    </div>
                  </div>
                  <div className="row justify-content-between align-items-center my-3 px-0 mx-0">
                  {course?.online === 0 && myCourses && myCoursesId.length>0 ?
                    ""
                  :
                    <a
                      href="#"
                      className="col-auto p-2"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleBookmark();
                      }}>
                      <i
                        className={` fa-${isBookmarked ? 'solid' : 'regular'} fa-bookmark text-prim-text-prim`}
                        style={{ fontSize: "2rem" }}
                      />
                    </a>
                  }
                    
                    {(myCourses && myCoursesId.length>0) ?
                      <div className={`col pe-0 ${course?.online === 0 ?'d-none':'d-block'}`}>
                        <button className="btn w-100 spac-3 btn-sec-orange py-2" onClick={handleClickPlayerBtn}>
                          播放影片<i className="fa-solid fa-play ms-2"></i>
                        </button>
                      </div>
                      :
                      <div className="col pe-0 px-0 mx-0">
                        <button className="btn w-100 spac-3 btn-sec-orange py-2" onClick={handleCourseWriteInCart}>
                          <h6 className="text-white">加入購物車</h6>
                        </button>
                      </div>}
                    
                  </div>
                </div>
              </div>
              {/* course-detail 手機時顯示 end */}
            </div>
          </div>
          <div className="container-fluid rounded-top-5 course-detail-content-text">
            <div className="container-sm px-0 d-flex flex-column align-items-center">
              <div className="course-detail-content-text-widthControl">
                <div
                  className={`justify-content-center justify-content-md-start align-items-center ${course.class_summary ? "d-flex" : "d-none"
                    }`}
                >
                  <i className="fa-solid fa-square me-3 d-inline-block d-md-none" />
                  <span className="h4 text-prim-dark lh-15 spac-2">
                    <strong>課程摘要</strong>
                  </span>
                  <i className="fa-solid fa-square ms-3 d-inline-block d-md-none" />
                  <br />
                  <br />
                  <br />
                  <br />
                </div>
                <h5
                  className="text-prim-dark lh-15 spac-2"
                  style={{ whiteSpace: "pre-line" }}
                >
                  {course.class_summary ? course.class_summary : ""}
                </h5>
                <br />
                <br />
                <br />
                <br />
                <div
                  className={`justify-content-center justify-content-md-start align-items-center ${course.class_description ? "d-flex" : "d-none"
                    }`}
                >
                  <i className="fa-solid fa-square me-3 d-inline-block d-md-none" />
                  <span className="h4 text-prim-dark lh-15 spac-2">
                    <strong>課程內容</strong>
                  </span>
                  <i className="fa-solid fa-square ms-3 d-inline-block d-md-none" />
                  <br />
                  <br />
                  <br />
                  <br />
                </div>
                <h5
                  className="text-prim-dark lh-25 spac-2"
                  style={{ whiteSpace: "pre-line" }}
                >
                  {course.class_description ? course.class_description : ""}
                </h5>
                <br />
              </div>
            </div>
          </div>

          {/* course detail 評論 start */}
          <div className="container-fluid course-detail-comment-bg py-5 px-10px">
            <div className="container-sm">
              <div className="course-comment-header d-flex flex-column justify-content-center flex-md-row justify-content-md-between align-items-center my-3 row-gap-3">
                <h4 className="text-prim-text-prim lh-15 spac-2 text-center text-md-start">
                  學員回饋&nbsp;|&nbsp;Comment
                </h4>
                <div
                  className={`btn-group course-comment-filter ${comments && comments.length === 0 ? "d-none" : "d-block"
                    }`}
                >
                  <button
                    type="button"
                    className="btn btn-border-prim dropdown-toggle rounded-5 px-20px"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <span
                      className="p spac-1 text-prim-prim"
                      ref={seriesDefaultBtn}
                    >
                      預設排序
                    </span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow">
                    <li
                      className="dropdown-item p spac-1 text-prim-prim px-2 py-2 cursor-pointer"
                      onClick={querySeries01}
                    >
                      依時間新→舊
                      <i className="fa-solid fa-sort-down text-prim-prim ms-2"></i>
                    </li>
                    <li
                      className="dropdown-item p spac-1 text-prim-prim px-2 py-2 cursor-pointer"
                      onClick={querySeries02}
                    >
                      依時間舊→新
                      <i className="fa-solid fa-sort-up text-prim-prim ms-2"></i>
                    </li>
                    <li
                      className="dropdown-item p spac-1 text-prim-prim px-2 py-2 cursor-pointer"
                      onClick={querySeries03}
                    >
                      依評分高→低
                      <i className="fa-solid fa-arrow-down-wide-short text-prim-prim ms-2"></i>
                    </li>
                    <li
                      className="dropdown-item p spac-1 text-prim-prim px-2 py-2 cursor-pointer"
                      onClick={querySeries04}
                    >
                      依評分低→高
                      <i className="fa-solid fa-arrow-up-wide-short text-prim-prim ms-2"></i>
                    </li>
                  </ul>
                </div>
              </div>
              <div
                className={`course-comment-scorebars-box mb-5 mx-0 px-0 row ${comments && comments.length === 0
                  ? "d-none"
                  : "d-flex d-md-none"
                  }`}
              >
                <div className="col-auto d-flex flex-column align-items-center justify-content-center">
                  <h1 className="spac-2 text-prim-text-prim ms-2">
                    {averageRating}
                  </h1>
                  {/* bigStar start */}
                  <div className="bigStar-box">
                    <i className="fa-solid fa-star bigStar bigStar-beneath  text-light-wine-border" />
                    <i
                      className="fa-solid fa-star bigStar bigStar-above"
                      style={{ width: `${(averageRating / 5) * 100}%` }}
                    />
                  </div>
                  {/* bigStar end */}
                  <p className="text-prim-text-prim">
                    {comments?.length} 則評論
                  </p>
                </div>
                <div className="col course-comment-progress-bar d-flex flex-column justify-content-between">
                  {/* 單條評分bar start */}
                  <div className="row align-items-center">
                    <div className="col-10">
                      <div
                        className="progress bg-light-gray light-wine-border"
                        role="progressbar"
                        aria-label=""
                        aria-valuenow={0}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        style={{ height: "0.65rem" }}
                      >
                        <div
                          className="progress-bar bg-sec-yellow"
                          style={{
                            width: `${(comments.filter((v) => v.rating === 5).length /
                              comments?.length) *
                              100
                              }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="col px-0 text-center">
                      <p className="text-sec-dark-blue">
                        5 ( {comments.filter((v) => v.rating === 5).length} 則)
                      </p>
                    </div>
                  </div>
                  {/* 單條評分bar end */}
                  {/* 單條評分bar start */}
                  <div className="row align-items-center">
                    <div className="col-10">
                      <div
                        className="progress bg-light-gray light-wine-border"
                        role="progressbar"
                        aria-label=""
                        aria-valuenow={0}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        style={{ height: "0.65rem" }}
                      >
                        <div
                          className="progress-bar bg-sec-yellow"
                          style={{
                            width: `${(comments.filter((v) => v.rating === 4).length /
                              comments?.length) *
                              100
                              }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="col px-0 text-center">
                      <p className="text-sec-dark-blue">
                        4 ( {comments.filter((v) => v.rating === 4).length} 則)
                      </p>
                    </div>
                  </div>
                  {/* 單條評分bar end */}
                  {/* 單條評分bar start */}
                  <div className="row align-items-center">
                    <div className="col-10">
                      <div
                        className="progress bg-light-gray light-wine-border"
                        role="progressbar"
                        aria-label=""
                        aria-valuenow={0}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        style={{ height: "0.65rem" }}
                      >
                        <div
                          className="progress-bar bg-sec-yellow"
                          style={{
                            width: `${(comments.filter((v) => v.rating === 3).length /
                              comments?.length) *
                              100
                              }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="col px-0 text-center">
                      <p className="text-sec-dark-blue">
                        3 ( {comments.filter((v) => v.rating === 3).length} 則)
                      </p>
                    </div>
                  </div>
                  {/* 單條評分bar end */}
                  {/* 單條評分bar start */}
                  <div className="row align-items-center">
                    <div className="col-10">
                      <div
                        className="progress bg-light-gray light-wine-border"
                        role="progressbar"
                        aria-label=""
                        aria-valuenow={0}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        style={{ height: "0.65rem" }}
                      >
                        <div
                          className="progress-bar bg-sec-yellow"
                          style={{
                            width: `${(comments.filter((v) => v.rating === 2).length /
                              comments?.length) *
                              100
                              }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="col px-0 text-center">
                      <p className="text-sec-dark-blue">
                        2 ( {comments.filter((v) => v.rating === 2).length} 則)
                      </p>
                    </div>
                  </div>
                  {/* 單條評分bar end */}
                  {/* 單條評分bar start */}
                  <div className="row align-items-center">
                    <div className="col-10">
                      <div
                        className="progress bg-light-gray light-wine-border"
                        role="progressbar"
                        aria-label=""
                        aria-valuenow={0}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        style={{ height: "0.65rem" }}
                      >
                        <div
                          className="progress-bar bg-sec-yellow"
                          style={{
                            width: `${(comments.filter((v) => v.rating === 1).length /
                              comments?.length) *
                              100
                              }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="col px-0 text-center">
                      <p className="text-sec-dark-blue">
                        1 ( {comments.filter((v) => v.rating === 1).length} 則)
                      </p>
                    </div>
                  </div>
                  {/* 單條評分bar end */}
                </div>
              </div>
              {comments && comments.length > 0 ? (
                comments?.map((comment, index) => {
                  return (
                    <div
                      key={comment.id}
                      className="course-comment-area"
                      style={{ margin: "0 0 40px 0" }}
                    >
                      <Comment comment={comment} index={index + 1} />
                    </div>
                  );
                })
              ) : (
                <div className="row justify-content-center my-3">
                  <div
                    className="col-auto"
                    style={{
                      maxWidth: "400px",
                      maxHeight: "378px",
                      width: "100%",
                    }}
                  >
                    <Image
                      src={`http://localhost:3005/uploads/course_and_tarot/comments-no-result.png`}
                      alt="course list no result"
                      layout="responsive"
                      width={370}
                      height={350}
                      style={{
                        width: "100%",
                        height: "auto",
                        maxWidth: "100%",
                        maxHeight: "100%",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* course detail 評論 end */}
        </div>
        {/* page three course-detail end */}

        {/* page-nav-bar start */}
        <div className="container-fluid py-3 my-5">
          <div className="container-sm px-0">
            <div className="row justify-content-between px-0 mx-0">
            
              <Link className="col-auto px-0 mx-0" href="/course/teacher">
                <div
                  type="button"
                  className="btn-light-to-prim btn py-2 px-3 spac-1 d-flex justify-content-center align-items-center"
                >
                  查看所有講師<i className="fa-solid fa-chevron-right ms-2"></i>
                </div>
              </Link>
            </div>
          </div>
        </div>
        {/* page-nav-bar end */}

        {/* <footer></footer> */}
        {/* Bootstrap JavaScript Libraries */}
      </div>
      {/* Footer */}
      <Footer />
    </>
  );
}
