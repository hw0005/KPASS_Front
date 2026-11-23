import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import axiosClient from '../../api/axiosClient';

export default function MyReservationsPage() {
    const navigate = useNavigate();
    const [reservations, setReservations] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(true);

    const PAGE_SIZE = 10;

    useEffect(() => {
        const fetchMyReservations = async () => {
            setLoading(true);
            try {
                const res = await axiosClient.get('/api/v1/reservation/me', {
                    params: { page, size: PAGE_SIZE },
                });
                const pageData = res?.data?.data ?? res?.data ?? res;

                setReservations(Array.isArray(pageData?.content) ? pageData.content : []);
                setTotalPages(pageData?.totalPages ?? 0);
                setTotalElements(pageData?.totalElements ?? 0);
            } catch (error) {
                console.error('예매 내역 조회 실패:', error);
                alert('예매 내역을 불러오는 중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchMyReservations();
    }, [page]);

    const formatDateTime = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    };

    return (
        <div style={{ backgroundColor: '#0d0e12', minHeight: '100vh', display: 'flex', flexDirection: 'column', color: '#ffffff' }}>
            <Header />

            <main style={{ flex: 1, maxWidth: '840px', width: '100%', margin: '0 auto', padding: '40px 20px 80px 20px', boxSizing: 'border-box' }}>
                {/* 상단 타이틀 & 총 건수 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        🎫 내 예매 확정 내역
                    </h2>
                    <span style={{ fontSize: '0.9rem', color: '#9ca3af' }}>
                        총 <strong style={{ color: '#ff3355' }}>{totalElements}</strong>건
                    </span>
                </div>

                {/* 본문 리스트 */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>
                        예매 내역을 불러오는 중입니다...
                    </div>
                ) : reservations.length === 0 ? (
                    <div style={{ backgroundColor: '#161820', border: '1px solid #2a2d3d', borderRadius: '12px', padding: '64px 20px', textAlign: 'center' }}>
                        <p style={{ color: '#9ca3af', fontSize: '1rem', marginBottom: '20px' }}>
                            아직 확정된 예매 내역이 없습니다.
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate('/kpass/main')}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: '#ff3355',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                            }}
                        >
                            공연 둘러보기
                        </button>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {reservations.map((order, idx) => {
                                const isFree = Number(order.totalPrice) === 0;
                                const paymentMethod = order.method || (isFree ? '무료 예매' : '카드');
                                const completedTime = order.approvedAt || order.createdAt;

                                return (
                                    <div
                                        key={order.id || order.reservationId || order.orderUid || idx}
                                        style={{
                                            backgroundColor: '#161820',
                                            border: '1px solid #2a2d3d',
                                            borderRadius: '12px',
                                            padding: '22px 24px',
                                        }}
                                    >
                                        {/* 카드 상단: 결제/예매 일시, 주문번호, 상태 배지 */}
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                paddingBottom: '12px',
                                                marginBottom: '14px',
                                                borderBottom: '1px solid #2a2d3d',
                                                flexWrap: 'wrap',
                                                gap: '8px',
                                            }}
                                        >
                                            <div>
                                                <span style={{ fontSize: '0.85rem', color: '#d1d5db', fontWeight: 'bold', marginRight: '12px' }}>
                                                    {formatDateTime(completedTime)}
                                                </span>
                                                <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                                    주문번호 {order.orderUid}
                                                </span>
                                            </div>

                                            <span
                                                style={{
                                                    padding: '4px 12px',
                                                    borderRadius: '12px',
                                                    fontSize: '0.78rem',
                                                    fontWeight: 'bold',
                                                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                                    color: '#34d399',
                                                    border: '1px solid #059669',
                                                }}
                                            >
                                                예매 완료
                                            </span>
                                        </div>

                                        {/* 카드 중단: 주문명 및 매수/결제수단 */}
                                        <div style={{ marginBottom: '16px' }}>
                                            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: '#ffffff' }}>
                                                {order.orderName}
                                            </h3>
                                            <div style={{ display: 'flex', gap: '16px', fontSize: '0.88rem', color: '#9ca3af', flexWrap: 'wrap' }}>
                                                <span>
                                                    예매 수량: <strong style={{ color: '#e5e7eb' }}>{order.ticketQuantity}매</strong>
                                                </span>
                                                <span>
                                                    결제 수단: <strong style={{ color: '#e5e7eb' }}>{paymentMethod}</strong>
                                                </span>
                                            </div>
                                        </div>

                                        {/* 카드 하단: 최종 결제 금액 */}
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                paddingTop: '12px',
                                                borderTop: '1px solid #2a2d3d',
                                            }}
                                        >
                                            <span style={{ fontSize: '0.88rem', color: '#9ca3af' }}>최종 결제 금액</span>
                                            <span style={{ fontSize: '1.15rem', fontWeight: 'bold', color: '#ff3355' }}>
                                                {isFree ? '무료' : `${Number(order.totalPrice).toLocaleString()}원`}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* 하단 페이지네이션 */}
                        {totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '32px' }}>
                                <button
                                    type="button"
                                    disabled={page === 0}
                                    onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                                    style={{
                                        padding: '8px 14px',
                                        borderRadius: '6px',
                                        border: '1px solid #2a2d3d',
                                        backgroundColor: '#161820',
                                        color: page === 0 ? '#4b5563' : '#ffffff',
                                        cursor: page === 0 ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    이전
                                </button>

                                {Array.from({ length: totalPages }, (_, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setPage(idx)}
                                        style={{
                                            padding: '8px 13px',
                                            borderRadius: '6px',
                                            border: page === idx ? '1px solid #ff3355' : '1px solid #2a2d3d',
                                            backgroundColor: page === idx ? '#ff3355' : '#161820',
                                            color: '#ffffff',
                                            fontWeight: page === idx ? 'bold' : 'normal',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}

                                <button
                                    type="button"
                                    disabled={page >= totalPages - 1}
                                    onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
                                    style={{
                                        padding: '8px 14px',
                                        borderRadius: '6px',
                                        border: '1px solid #2a2d3d',
                                        backgroundColor: '#161820',
                                        color: page >= totalPages - 1 ? '#4b5563' : '#ffffff',
                                        cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    다음
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
}