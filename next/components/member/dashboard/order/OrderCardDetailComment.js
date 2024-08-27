import React, { useState, useEffect } from 'react';
import styles from '@/components/member/dashboard/order/OrderCardDetailComment.module.css'

export default function OrderCardDetailComment({ orderUuid, items }) {
    const [commentableItems, setCommentableItems] = useState([]);
    const [comments, setComments] = useState({});
    const [submittedComments, setSubmittedComments] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hoveredRatings, setHoveredRatings] = useState({});


    useEffect(() => {
        fetchCommentableItems();
    }, [orderUuid]);


    const fetchCommentableItems = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`http://localhost:3005/api/orders/commentable-items/${orderUuid}`, {
                credentials: 'include',
            });

            if (!response.ok) throw new Error('Failed to fetch commentable items');
            const data = await response.json();
            setCommentableItems(data.data);
            setComments(data.data.reduce((acc, item) => ({
                ...acc,
                [item.item_id]: {
                    rating: item.existing_rating || 0,
                    text: item.existing_comment || ''
                }
            }), {}));
            setSubmittedComments(data.data.reduce((acc, item) => ({
                ...acc,
                [item.item_id]: item.is_commented ? {
                    rating: item.existing_rating,
                    text: item.existing_comment
                } : null
            }), {}));
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // 星星評價
    const handleRatingChange = (itemId, rating) => {
        if (!submittedComments[itemId]) {
            setComments(prev => ({ ...prev, [itemId]: { ...prev[itemId], rating } }));
            setHoveredRatings(prev => ({ ...prev, [itemId]: null }));
        }
    };

    const handleRatingHover = (itemId, rating) => {
        if (!submittedComments[itemId]) {
            setHoveredRatings(prev => ({ ...prev, [itemId]: rating }));
        }
    };

    const handleRatingLeave = (itemId) => {
        if (!submittedComments[itemId]) {
            setHoveredRatings(prev => ({ ...prev, [itemId]: null }));
        }
    };

    // 渲染評價星星的函數
    const renderRatingStars = (rating) => {
        return (
            <span className={styles.ratingStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={styles.ratingStar}>
                        {star <= rating ? '★' : '☆'}
                    </span>
                ))}
            </span>
        );
    };

    const handleCommentChange = (itemId, text) => {
        if (!submittedComments[itemId]) {
            setComments(prev => ({ ...prev, [itemId]: { ...prev[itemId], text } }));
        }
    };

    const handleSubmit = async (itemId, itemType) => {
        if (submittedComments[itemId]) return;

        try {
            const response = await fetch('http://localhost:3005/api/orders/submit-comment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    orderUuid,
                    itemId,
                    itemType,
                    rating: comments[itemId].rating,
                    commentText: comments[itemId].text
                }),
                credentials: 'include',
            });

            if (!response.ok) throw new Error('Failed to submit comment');
            setSubmittedComments(prev => ({ ...prev, [itemId]: comments[itemId] }));
        } catch (err) {
            setError(err.message);
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (commentableItems.length === 0) return <div>已超過評論時間或無可評論項目</div>;

    return (

        <div className={styles.orderComment}>

            {commentableItems.map(item => (
                <div key={item.item_id} className={`mb-3 ${styles.productComment}`}>

                    <h3 className={styles.productTitle}>
                        <span className={styles.itemType}>{item.item_type === 'product' ? '商品' : '課程'}－</span>
                        {item.item_name}

                    </h3>

                    {submittedComments[item.item_id] ? (

                        <div className={styles.commentDone}>
                            <p >已成功送出評論</p>
                            <p className='ms-5'>
                                {renderRatingStars(submittedComments[item.item_id].rating)}
                            </p>
                            <div className={`ms-5 ${styles.commentDoneText}`}>
                                {submittedComments[item.item_id].text}
                            </div>
                        </div>
                    ) : (
                        <div className="comment-area d-flex">
                            <div className={`mb-3 ${styles.commentText}`}>
                                <label htmlFor={`comment-${item.item_id}`} className={`form-label ${styles.formLabel}`}>
                                    {item.item_type === 'product' ? '商品評論' : '課程評論'}
                                </label>
                                <textarea
                                    id={`comment-${item.item_id}`}
                                    className={`form-control ${styles.textArea}`}
                                    rows={4}
                                    value={comments[item.item_id]?.text || ''}
                                    onChange={(e) => handleCommentChange(item.item_id, e.target.value)}
                                />
                            </div>

                            <div className={`mb-3 ${styles.commentRating}`}>


                                {/* 星級評分 */}
                                <label htmlFor={`rating-${item.item_id}`} className={`form-label ${styles.ratingLabel}`}>
                                    {item.item_type === 'product' ? '商品評分' : '課程評分'}
                                </label>

                                <div className="div">
                                    <div
                                        id={`rating-${item.item_id}`}
                                        className={`${styles.star} ${styles.starRating}`}
                                        onMouseLeave={() => handleRatingLeave(item.item_id)}
                                    >
                                        {[5, 4, 3, 2, 1].map(star => (
                                            <span
                                                key={star}
                                                onClick={() => handleRatingChange(item.item_id, star)}
                                                onMouseEnter={() => handleRatingHover(item.item_id, star)}
                                                className={star <= (hoveredRatings[item.item_id] || comments[item.item_id]?.rating || 0) ? styles.active : ''}
                                            >
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="div">
                                    <button
                                        className={styles.commentBtn}
                                        onClick={() => handleSubmit(item.item_id, item.item_type)}
                                    >
                                        送出
                                    </button>
                                </div>

                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}