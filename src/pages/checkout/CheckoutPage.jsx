import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import CheckoutApi from './CheckoutApi';

// 프론트엔드 루트(.env)에 VITE_TOSS_CLIENT_KEY 설정 권장
const TOSS_CLIENT_KEY =
    import.meta.env.VITE_TOSS_CLIENT_KEY || 'test_ck_c19yMsX1ioSNn6RvjKEJt7XWzZwK94upvY';

export default function CheckoutPage() {
    const location = useLocation();
    const navigate = useNavigate();

    // 진입 경로 1: 공연 상세 페이지에서 바로 예매 (단건)
    const singleItem = location.state?.performance || null;
    // 진입 경로 2: 장바구니 페이지에서 선택 예매 (다건 배열)
    const cartItems = location.state?.cartItems || null;

    const seatPrices = singleItem?.seatPrices || [];
    const [selectedSeat, setSelectedSeat] = useState(seatPrices.length > 0 ? seatPrices[0] : null);
    const [ticketCount, setTicketCount] = useState(1);

    // 백엔드에서 생성된 5분 선점 주문 정보 ({ orderId, orderName, totalAmount, expiredAt })
    const [heldOrder, setHeldOrder] = useState(null);
    const [remainingSeconds, setRemainingSeconds] = useState(300);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!singleItem && (!cartItems || cartItems.length === 0)) {
            alert('잘못된 접근입니다. 메인 화면으로 이동합니다.');
            navigate('/kpass/main', { replace: true });
        }
    }, [singleItem, cartItems, navigate]);

    // 5분(300초) 실시간 카운트다운 타이머
    useEffect(() => {
        if (!heldOrder?.expiredAt) return;

        const updateTimer = () => {
            const expireTime = new Date(heldOrder.expiredAt).getTime();
            const diff = Math.max(0, Math.floor((expireTime - Date.now()) / 1000));
            setRemainingSeconds(diff);

            if (diff === 0) {
                alert('결제 대기 시간(5분)이 만료되어 티켓 선점이 해제되었습니다.');
                navigate('/kpass/cart', { replace: true });
            }
        };

        updateTimer();
        const timerId = setInterval(updateTimer, 1000);
        return () => clearInterval(timerId);
    }, [heldOrder, navigate]);

    if (!singleItem && (!cartItems || cartItems.length === 0)) return null;

    // 단건 / 장바구니 다건 항목을 동일한 구조로 정규화
    const displayItems = singleItem
        ? [
            {
                cartId: null,
                performanceId: singleItem.id ?? singleItem.performanceId ?? null,
                seatPriceId: selectedSeat?.id || null,
                title: singleItem.title,
                posterUrl: singleItem.posterUrl,
                venue: singleItem.venue,
                seatType: selectedSeat ? selectedSeat.seatType : '기본석',
                unitPrice: selectedSeat ? selectedSeat.price : singleItem.price || 0,
                quantity: ticketCount,
            },
        ]
        : cartItems.map((c) => ({
            cartId: c.cartItemId ?? c.cartId ?? null,
            performanceId: c.performanceId ?? c.id ?? null,
            seatPriceId: c.seatPriceId ?? null,
            title: c.title || c.performanceTitle,
            posterUrl: c.posterUrl,
            venue: c.venue || '',
            seatType: c.seatType || '기본석',
            unitPrice: Number(c.price ?? c.unitPrice ?? 0),
            quantity: Number(c.quantity ?? 1),
        }));

    const totalPrice = displayItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    const formatTime = (sec) => {
        const m = String(Math.floor(sec / 60)).padStart(2, '0');
        const s = String(sec % 60).padStart(2, '0');
        return `${m}:${s}`;
    };

    // 토스페이먼츠 SDK 결제창 호출
    const openTossPaymentWindow = async (orderInfo) => {
        const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);
        await tossPayments.requestPayment('카드', {
            amount: orderInfo.totalAmount,
            orderId: orderInfo.orderId,
            orderName: orderInfo.orderName,
            successUrl: `${window.location.origin}/kpass/payment/success`,
            failUrl: `${window.location.origin}/kpass/payment/fail`,
        });
    };

    const handlePayment = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            let orderInfo = heldOrder;

            // 최초 결제 클릭 시 백엔드에 주문 생성 및 5분 선점 요청
            if (!orderInfo) {
                const payload = {
                    memberCouponId: null,
                    items: displayItems.map((item) => ({
                        cartId: item.cartId,
                        performanceId: item.performanceId,
                        seatPriceId: item.seatPriceId,
                        seatType: item.seatType,
                        quantity: item.quantity,
                    })),
                    totalPrice: totalPrice, // 백엔드 DTO 필드명(totalPrice)과 일치시킴
                };

                const res = await CheckoutApi.createOrder(payload);
                const data = res?.data ?? res;

                // 백엔드 응답(orderUid, totalPrice)을 프론트 상태 규격(orderId, totalAmount)에 맞춤
                orderInfo = {
                    orderId: data.orderUid,
                    orderName: data.orderName,
                    totalAmount: data.totalPrice,
                    expiredAt: data.expiredAt,
                };
                setHeldOrder(orderInfo);
            }

            // 무료 공연(0원)은 PG 결제창 없이 즉시 완료
            if (totalPrice === 0) {
                alert('무료 공연 예매가 완료되었습니다.');
                navigate('/kpass/main', { replace: true });
                return;
            }

            await openTossPaymentWindow(orderInfo);
        } catch (error) {
            console.error('결제 에러 상세:', error);
            if (error?.code === 'USER_CANCEL') {
                alert('결제창을 닫았습니다. 남은 선점 시간 내에 다시 결제를 진행할 수 있습니다.');
            } else {
                const msg =
                    error.response?.data?.message ||
                    error?.message ||
                    '주문 생성 또는 결제 요청 중 오류가 발생했습니다.';
                alert(msg);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = async () => {
        if (heldOrder?.orderId) {
            try {
                await CheckoutApi.cancelOrder(heldOrder.orderId);
            } catch (e) {
                console.error('선점 주문 취소 실패:', e);
            }
        }
        navigate(-1);
    };

    return (
        <div style={{ backgroundColor: '#0d0e12', minHeight: '100vh', display: 'flex', flexDirection: 'column', color: '#ffffff' }}>
            <Header />

            <main style={{ flex: 1, maxWidth: '700px', width: '100%', margin: '0 auto', padding: '40px 20px 80px 20px', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        🎟️ 티켓 예매 / 결제
                    </h2>

                    {/* 5분 선점 타이머 배지 */}
                    {heldOrder && (
                        <div
                            style={{
                                backgroundColor: remainingSeconds <= 60 ? 'rgba(255, 51, 85, 0.2)' : '#1d202d',
                                border: `1px solid ${remainingSeconds <= 60 ? '#ff3355' : '#3b82f6'}`,
                                color: remainingSeconds <= 60 ? '#ff3355' : '#60a5fa',
                                padding: '6px 14px',
                                borderRadius: '20px',
                                fontSize: '0.9rem',
                                fontWeight: 'bold',
                            }}
                        >
                            ⏳ 결제 남은 시간 {formatTime(remainingSeconds)}
                        </div>
                    )}
                </div>

                <div style={{ backgroundColor: '#161820', border: '1px solid #2a2d3d', borderRadius: '12px', padding: '28px' }}>
                    {/* 주문 공연 목록 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #2a2d3d' }}>
                        {displayItems.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <img
                                    src={item.posterUrl}
                                    alt={item.title}
                                    style={{ width: '75px', height: '100px', objectFit: 'cover', borderRadius: '6px' }}
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/75x100/1c1e28/8c92a4?text=K-PASS';
                                    }}
                                />
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', color: '#ffffff' }}>{item.title}</h3>
                                    {item.venue && <p style={{ margin: '2px 0', color: '#9ca3af', fontSize: '0.85rem' }}>📍 {item.venue}</p>}
                                    <p style={{ margin: '4px 0 0 0', color: '#e5e7eb', fontSize: '0.88rem' }}>
                                        좌석: <strong>{item.seatType}</strong> · 수량: <strong>{item.quantity}매</strong> ·{' '}
                                        <span style={{ color: '#ff3355', fontWeight: 'bold' }}>
                                            {(item.unitPrice * item.quantity).toLocaleString()}원
                                        </span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 단건 바로 예매 & 아직 선점 전일 때만 좌석/수량 변경 허용 */}
                    {singleItem && !heldOrder && (
                        <>
                            {seatPrices.length > 0 && (
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '8px' }}>
                                        좌석 등급 선택
                                    </label>
                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                        {seatPrices.map((sp) => (
                                            <button
                                                key={sp.id || sp.seatType}
                                                type="button"
                                                onClick={() => setSelectedSeat(sp)}
                                                style={{
                                                    padding: '10px 16px',
                                                    backgroundColor: selectedSeat?.seatType === sp.seatType ? '#ff3355' : '#1d202d',
                                                    color: '#ffffff',
                                                    border: '1px solid #2a2d3d',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.88rem',
                                                }}
                                            >
                                                {sp.seatType} ({sp.price.toLocaleString()}원)
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <span style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>티켓 수량</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#0d0e12', padding: '4px 12px', borderRadius: '6px', border: '1px solid #2a2d3d' }}>
                                    <button
                                        type="button"
                                        onClick={() => setTicketCount((prev) => Math.max(1, prev - 1))}
                                        style={{ background: 'none', border: 'none', color: '#ffffff', fontSize: '1.2rem', cursor: 'pointer', padding: '0 8px' }}
                                    >
                                        -
                                    </button>
                                    <span style={{ fontSize: '1rem', fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{ticketCount}</span>
                                    <button
                                        type="button"
                                        onClick={() => setTicketCount((prev) => prev + 1)}
                                        style={{ background: 'none', border: 'none', color: '#ffffff', fontSize: '1.2rem', cursor: 'pointer', padding: '0 8px' }}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {/* 결제 요약 박스 */}
                    <div style={{ backgroundColor: '#1d202d', borderRadius: '8px', padding: '16px', marginBottom: '28px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem', color: '#a1a1aa' }}>
                            <span>총 예매 건수 / 매수</span>
                            <span>
                                {displayItems.length}건 / {displayItems.reduce((acc, i) => acc + i.quantity, 0)}매
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #2a2d3d', fontSize: '1.1rem', fontWeight: 'bold' }}>
                            <span>총 결제 금액</span>
                            <span style={{ color: '#ff3355' }}>
                                {totalPrice > 0 ? `${totalPrice.toLocaleString()}원` : '무료'}
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={handlePayment}
                            style={{
                                flex: 1,
                                padding: '14px 0',
                                background: isSubmitting ? '#4b5563' : 'linear-gradient(135deg, #ff3355 0%, #ff007a 100%)',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                boxShadow: '0 4px 12px rgba(255, 51, 85, 0.4)',
                            }}
                        >
                            {isSubmitting
                                ? '결제 준비 중...'
                                : heldOrder
                                    ? `결제창 다시 열기 (${totalPrice.toLocaleString()}원)`
                                    : totalPrice > 0
                                        ? `${totalPrice.toLocaleString()}원 결제하기`
                                        : '무료 예매 완료하기'}
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            style={{
                                padding: '14px 20px',
                                backgroundColor: '#2a2d3d',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                            }}
                        >
                            취소
                        </button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}