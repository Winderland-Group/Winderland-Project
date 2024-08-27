import React, { useState,  useEffect } from 'react'
import { useRouter } from 'next/router';
import CourseCardSm from '@/components/course/course-card-sm'


export default function CourseList({courses, comments, classAssigns}) {
  const router = useRouter()

  function handleHref(e, class_id) {
    e.preventDefault();
    router.push(`/course/${class_id}`);
  }

  return (
    <>
      <div className="container-fluid px-0">
            <div className="container-sm px-0 mb-5">
            
              <div className="row px-10px m-0 justify-content-center">
                <div className="col-auto col-md-12 course-card-header d-flex align-items-center">
                  <span className="col-auto h4 pe-2 spac-2 m-0">
                    <strong>推薦課程</strong>
                  </span>
                  <span className="col-auto text-gray-light spac-1">
                    ｜&nbsp;推薦您可能感興趣的課程
                  </span>
                </div>
              </div>
              <div className="row px-0 m-0 course-mycourse-box row-gap-5">

              {courses && courses.length>0 ?
              courses.map((course) => {
                const { class_id } = course;
                let averageRating = 0;
                let classAssignsQ = 0;

                  const filteredComments = comments.filter(comment => comment.entity_type === "class" && comment.entity_id === class_id);
                  if(filteredComments){
                    const ratings = filteredComments.map(comment => comment.rating);
                    averageRating = (ratings.reduce((acc, rating) => acc + rating, 0) / ratings.length).toFixed(1);;
                  }else{
                    averageRating = 0
                  }

                  const filteredclassAssigns = classAssigns.filter(classAssign => classAssign.class_id === class_id && classAssign.status !== 'cancelled');
                  if(filteredclassAssigns){
                    classAssignsQ = filteredclassAssigns.length;
                  }else{
                    classAssignsQ = 0
                  }
                
                
              return (
                <div key={class_id} onClick={(e)=>handleHref(e, class_id)} className='col-12 col-md-4 col-lg-3 px-10px d-flex flex-column align-items-center justify-content-between' title={`${course.class_name}`}>
                  <CourseCardSm course={course} averageRating={averageRating} classAssigns={classAssigns} classAssignsQ={classAssignsQ}/>
                </div> 
              );
            }) 
          :<div className='col-12 col-md-4 col-lg-3 px-10px'><h5 className="spac-1 text-gray">尚無相關無課程<i className="ms-2 fa-solid fa-wine-glass-empty"></i></h5></div>}
                

              </div>
            </div>
          </div>
    </>
  )
}
