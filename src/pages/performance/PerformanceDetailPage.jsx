import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';

const DEFAULT_POSTER = 'https://via.placeholder.com/300x400/1c1e28/8c92a4?text=K-PASS';

export default function PerformanceDetailPage() {
    const location = useLocation();
    const navigate = useNavigate();

    const item = location.state?.performance;
    const currentNickname = localStorage.getItem('nickname') || sessionStorage.getItem('nickname') || '익명유저';

    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(item?.likeCount || 0);

    const [comments, setComments] = useState([
        { id: 1, author: '티켓매니아', content: '라인업과 좌석 가격 정보 확인했습니다.', createdAt: '2026-03-24' }
    ]);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        if (!item) {
            alert('잘못된 접근이거나 선택된 공연 정보가 없습니다.');
            navigate('/kpass/search', { replace: true });
        }
    }, [item, navigate]);

    if (!item) return null;

    const handleToggleLike = () => {
        setIsLiked(!isLiked);
        setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
        // 백엔드 좋아요 증감 API 호출 위치
    };

    const handleAddComment = (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        const commentObj = {
            id: Date.now(),
            author: currentNickname,
            content: newComment,
            createdAt: new Date().toISOString().split('T')[0]
        };

        setComments([commentObj, ...comments]);
        setNewComment('');
        // 백엔드 댓글 등록 API 호출 위치
    };

    const handleGoCheckout = () => {
        navigate('/kpass/checkout', { state: { performance: item } });
    };

    return (
        <div style={{ backgroundColor: '#0d0e12', minHeight: '100vh', display: 'flex', flexDirection: 'column', color: '#ffffff' }}>
            <Header />

            <main style={{ flex: 1, maxWidth: '1000px', width: '100%', margin: '0 auto', padding: '40px 20px 80px 20px', boxSizing: 'border-box' }}>
                <div style={{
                    display: 'flex', gap: '32px', backgroundColor: '#161820',
                    border: '1px solid #2a2d3d', borderRadius: '12px', padding: '28px',
                    alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: '32px'
                }}>
                    <img
                        src={item.posterUrl || DEFAULT_POSTER}
                        alt={item.title}
                        style={{ width: '220px', height: '300px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }}
                        onError={(e) => { e.target.src = DEFAULT_POSTER; }}
                    />

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '280px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{
                                fontSize: '0.8rem', color: '#818cf8', fontWeight: 'bold',
                                backgroundColor: '#232636', padding: '4px 10px', borderRadius: '4px'
                            }}>
                                {item.category} | {item.region}
                            </span>

                            <button
                                type="button"
                                onClick={handleToggleLike}
                                style={{
                                    backgroundColor: isLiked ? 'rgba(255, 51, 85, 0.2)' : '#2a2d3d',
                                    border: isLiked ? '1px solid #ff3355' : '1px solid #3f435a',
                                    color: isLiked ? '#ff3355' : '#a1a1aa',
                                    borderRadius: '20px', padding: '6px 14px', fontSize: '0.85rem',
                                    fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                                }}
                            >
                                {isLiked ? '❤️' : '🤍'} {likeCount}
                            </button>
                        </div>

                        <h1 style={{ fontSize: '1.6rem', margin: 0, color: '#ffffff', fontWeight: 'bold', lineHeight: 1.3 }}>
                            {item.title}
                        </h1>

                        <div style={{ borderTop: '1px solid #2a2d3d', borderBottom: '1px solid #2a2d3d', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <p style={{ margin: 0, color: '#d4d4d8', fontSize: '0.92rem' }}>📍 <strong>장소:</strong> {item.venue} ({item.address || '주소 정보 없음'})</p>
                            <p style={{ margin: 0, color: '#d4d4d8', fontSize: '0.92rem' }}>📅 <strong>기간:</strong> {item.startDate} ~ {item.endDate}</p>
                            <p style={{ margin: 0, color: '#d4d4d8', fontSize: '0.92rem' }}>👁️ <strong>조회수:</strong> {item.viewCount}</p>

                            {/* seatPrices 엔티티 리스트 표시 */}
                            {item.seatPrices && item.seatPrices.length > 0 && (
                                <div style={{ marginTop: '8px' }}>
                                    <strong style={{ color: '#d4d4d8', fontSize: '0.92rem' }}>🪑 좌석별 가격:</strong>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                                        {item.seatPrices.map((sp) => (
                                            <span key={sp.id || sp.seatType} style={{ backgroundColor: '#232636', color: '#a1a1aa', fontSize: '0.8rem', padding: '4px 8px', borderRadius: '4px' }}>
                                                {sp.seatType}: <strong style={{ color: '#ff3355' }}>{sp.price?.toLocaleString()}원</strong>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                            <button
                                type="button"
                                onClick={handleGoCheckout}
                                style={{
                                    flex: 1, padding: '14px 0',
                                    background: 'linear-gradient(135deg, #ff3355 0%, #ff007a 100%)',
                                    color: '#ffffff', border: 'none', borderRadius: '8px',
                                    fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(255, 51, 85, 0.4)'
                                }}
                            >
                                예매하기
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                style={{
                                    padding: '14px 24px', backgroundColor: '#2a2d3d',
                                    color: '#ffffff', border: 'none', borderRadius: '8px',
                                    fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer'
                                }}
                            >
                                목록으로
                            </button>
                        </div>
                    </div>
                </div>

                <section style={{ backgroundColor: '#161820', border: '1px solid #2a2d3d', borderRadius: '12px', padding: '28px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        💬 공연 후기 및 관람평 <span style={{ color: '#ff3355', fontSize: '1rem' }}>({comments.length})</span>
                    </h3>

                    <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '12px', marginBottom: '28px' }}>
                        <input
                            type="text"
                            placeholder={`${currentNickname}님, 관람평이나 기대평을 남겨주세요...`}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            style={{
                                flex: 1, padding: '12px 16px', backgroundColor: '#0d0e12',
                                color: '#ffffff', border: '1px solid #2a2d3d', borderRadius: '8px', fontSize: '0.92rem', outline: 'none'
                            }}
                        />
                        <button
                            type="submit"
                            style={{
                                padding: '12px 20px', backgroundColor: '#232636', color: '#818cf8',
                                border: '1px solid #2a2d3d', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'
                            }}
                        >
                            등록
                        </button>
                    </form>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {comments.map((comment) => (
                            <div key={comment.id} style={{ padding: '16px', backgroundColor: '#111319', border: '1px solid #2a2d3d', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <strong style={{ fontSize: '0.9rem', color: '#818cf8' }}>{comment.author}</strong>
                                    <span style={{ fontSize: '0.78rem', color: '#71717a' }}>{comment.createdAt}</span>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#d4d4d8', lineHeight: 1.4 }}>{comment.content}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}