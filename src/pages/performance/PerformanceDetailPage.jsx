import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { cartApi } from '../cart/CartApi';

const DEFAULT_POSTER = 'https://via.placeholder.com/300x400/1c1e28/8c92a4?text=K-PASS';

export default function PerformanceDetailPage() {
    const location = useLocation();
    const navigate = useNavigate();

    const performance = location.state?.performance;
    const userNickname = localStorage.getItem('nickname') || localStorage.getItem('userName') || '회원';

    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(performance?.likeCount || 0);
    const [submitting, setSubmitting] = useState(false);

    const [commentInput, setCommentInput] = useState('');
    const [comments, setComments] = useState([
        {
            id: 1,
            author: '티켓매니아',
            date: '2026-03-24',
            content: '라인업과 좌석 가격 정보 확인했습니다.'
        }
    ]);

    if (!performance) {
        return (
            <div style={{ backgroundColor: '#0d0e12', minHeight: '100vh', display: 'flex', flexDirection: 'column', color: '#ffffff' }}>
                <Header />
                <main style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '16px' }}>
                    <p style={{ color: '#a1a1aa', fontSize: '1.1rem' }}>공연 정보를 불러올 수 없습니다.</p>
                    <button
                        type="button"
                        onClick={() => navigate('/kpass/search')}
                        style={{ padding: '12px 24px', backgroundColor: '#ff3355', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        검색 목록으로 돌아가기
                    </button>
                </main>
                <Footer />
            </div>
        );
    }

    const today = new Date().toISOString().split('T')[0];
    const isClosed =
        (performance.endDate && performance.endDate < today) ||
        (performance.stockQuantity !== undefined && performance.stockQuantity <= 0);

    const handleLikeToggle = () => {
        if (liked) {
            setLiked(false);
            setLikeCount((prev) => Math.max(0, prev - 1));
        } else {
            setLiked(true);
            setLikeCount((prev) => prev + 1);
        }
    };

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (!commentInput.trim()) return;

        setComments([
            {
                id: Date.now(),
                author: userNickname,
                date: new Date().toISOString().split('T')[0],
                content: commentInput.trim()
            },
            ...comments
        ]);
        setCommentInput('');
    };

    // DB 장바구니 담기
    const handleAddToCart = async () => {
        if (isClosed || submitting) return;
        setSubmitting(true);
        try {
            await cartApi.addToCart(performance, 1);
            if (window.confirm('장바구니에 공연이 담겼습니다. 장바구니 페이지로 이동하시겠습니까?')) {
                navigate('/kpass/cart');
            }
        } catch (error) {
            console.error('장바구니 담기 실패:', error);
            alert(error.response?.data?.message || '로그인이 필요하거나 장바구니 담기에 실패했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    // 예매하기 (DB 장바구니에 담고 바로 이동)
    const handleReserve = async () => {
        if (isClosed || submitting) return;
        setSubmitting(true);
        try {
            await cartApi.addToCart(performance, 1);
            navigate('/kpass/cart');
        } catch (error) {
            console.error('예매 이동 실패:', error);
            alert(error.response?.data?.message || '로그인이 필요한 서비스입니다.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#0d0e12', minHeight: '100vh', display: 'flex', flexDirection: 'column', color: '#ffffff' }}>
            <Header />

            <main style={{ flex: 1, maxWidth: '960px', width: '100%', margin: '0 auto', padding: '40px 20px 80px 20px', boxSizing: 'border-box' }}>
                <div style={{ backgroundColor: '#161820', border: '1px solid #2a2d3d', borderRadius: '14px', padding: '28px', display: 'flex', gap: '32px', flexWrap: 'wrap', marginBottom: '28px' }}>
                    <div style={{ width: '240px', height: '330px', flexShrink: 0, position: 'relative' }}>
                        <img
                            src={performance.posterUrl || DEFAULT_POSTER}
                            alt={performance.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px', filter: isClosed ? 'brightness(0.6)' : 'none' }}
                            onError={(e) => { e.target.src = DEFAULT_POSTER; }}
                        />
                        {isClosed && (
                            <span style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: 'rgba(0, 0, 0, 0.8)', color: '#a1a1aa', border: '1px solid #4b5563', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                마감
                            </span>
                        )}
                    </div>

                    <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <span style={{ backgroundColor: '#1e2130', color: '#818cf8', padding: '5px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                    {performance.category || '공연'} | {performance.region || '전국'}
                                </span>

                                <button
                                    type="button"
                                    onClick={handleLikeToggle}
                                    style={{
                                        backgroundColor: liked ? 'rgba(255, 51, 85, 0.15)' : '#1e2130',
                                        color: liked ? '#ff3355' : '#a1a1aa',
                                        border: `1px solid ${liked ? '#ff3355' : '#2a2d3d'}`,
                                        borderRadius: '20px',
                                        padding: '6px 14px',
                                        fontSize: '0.88rem',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <span>{liked ? '♥' : '♡'}</span>
                                    <span>{likeCount}</span>
                                </button>
                            </div>

                            <h1 style={{ fontSize: '1.55rem', fontWeight: 'bold', margin: '0 0 18px 0', lineHeight: '1.4', color: '#ffffff' }}>
                                {performance.title}
                            </h1>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.92rem', color: '#a1a1aa' }}>
                                <p style={{ margin: 0 }}>📍 <strong style={{ color: '#d4d4d8' }}>장소:</strong> {performance.venue || '장소 정보 없음'}</p>
                                <p style={{ margin: 0 }}>📅 <strong style={{ color: '#d4d4d8' }}>기간:</strong> {performance.startDate || '-'} ~ {performance.endDate || '-'}</p>
                                <p style={{ margin: 0 }}>
                                    💰 <strong style={{ color: '#d4d4d8' }}>가격:</strong>{' '}
                                    <span style={{ color: isClosed ? '#71717a' : '#ff3355', fontWeight: 'bold' }}>
                                        {performance.price && performance.price > 0 ? `${performance.price.toLocaleString()}원` : '무료'}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '28px' }}>
                            {isClosed ? (
                                <button
                                    type="button"
                                    disabled
                                    style={{
                                        flex: 1,
                                        padding: '15px 20px',
                                        backgroundColor: '#252834',
                                        color: '#71717a',
                                        border: '1px solid #323646',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        fontWeight: 'bold',
                                        cursor: 'not-allowed'
                                    }}
                                >
                                    마감됐습니다
                                </button>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        disabled={submitting}
                                        onClick={handleReserve}
                                        style={{
                                            flex: 2,
                                            padding: '15px 20px',
                                            background: 'linear-gradient(135deg, #ff3355 0%, #ff007a 100%)',
                                            color: '#ffffff',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                            fontWeight: 'bold',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        예매하기
                                    </button>
                                    <button
                                        type="button"
                                        disabled={submitting}
                                        onClick={handleAddToCart}
                                        style={{
                                            flex: 1,
                                            padding: '15px 16px',
                                            backgroundColor: '#1e2130',
                                            color: '#818cf8',
                                            border: '1px solid #3b4269',
                                            borderRadius: '8px',
                                            fontSize: '0.95rem',
                                            fontWeight: 'bold',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        🛒 장바구니 담기
                                    </button>
                                </>
                            )}

                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                style={{
                                    padding: '15px 22px',
                                    backgroundColor: '#222530',
                                    color: '#d4d4d8',
                                    border: '1px solid #2a2d3d',
                                    borderRadius: '8px',
                                    fontSize: '0.95rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}
                            >
                                목록으로
                            </button>
                        </div>
                    </div>
                </div>

                {/* 공연 후기 및 관람평 */}
                <div style={{ backgroundColor: '#161820', border: '1px solid #2a2d3d', borderRadius: '14px', padding: '28px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '0 0 18px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        💬 공연 후기 및 관람평 <span style={{ color: '#ff3355' }}>({comments.length})</span>
                    </h3>

                    <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '22px' }}>
                        <input
                            type="text"
                            value={commentInput}
                            onChange={(e) => setCommentInput(e.target.value)}
                            placeholder={`${userNickname}님, 관람평이나 기대평을 남겨주세요...`}
                            style={{
                                flex: 1,
                                padding: '13px 16px',
                                backgroundColor: '#0d0e12',
                                color: '#ffffff',
                                border: '1px solid #2a2d3d',
                                borderRadius: '8px',
                                fontSize: '0.95rem',
                                outline: 'none'
                            }}
                        />
                        <button
                            type="submit"
                            style={{
                                padding: '13px 22px',
                                backgroundColor: '#252a40',
                                color: '#818cf8',
                                border: '1px solid #363d5e',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            등록
                        </button>
                    </form>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {comments.map((c) => (
                            <div key={c.id} style={{ backgroundColor: '#0d0e12', border: '1px solid #222533', borderRadius: '8px', padding: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <span style={{ color: '#818cf8', fontWeight: 'bold', fontSize: '0.88rem' }}>{c.author}</span>
                                    <span style={{ color: '#71717a', fontSize: '0.8rem' }}>{c.date}</span>
                                </div>
                                <p style={{ margin: 0, color: '#e4e4e7', fontSize: '0.92rem' }}>{c.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}