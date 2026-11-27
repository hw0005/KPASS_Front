import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import CheckoutApi from './CheckoutApi';
import axiosClient from '../../api/axiosClient';

const TOSS_CLIENT_KEY =
    import.meta.env.VITE_TOSS_CLIENT_KEY || 'test_ck_c19yMsX1ioSNn6RvjKEJt7XWzZwK94upvY';

export default function CheckoutPage() {
    const location = useLocation();
    const navigate = useNavigate();

    const singleItem = location.state?.performance || null;
    const cartItems = location.state?.cartItems || null;

    const seatPrices = singleItem?.seatPrices || [];
    const [selectedSeat, setSelectedSeat] = useState(seatPrices.length > 0 ? seatPrices[0] : null);
    const [ticketCount, setTicketCount] = useState(1);

    // 🎟️ 쿠폰 상태 관리
    const [myCoupons, setMyCoupons] = useState([]);
    const [availableEvents, setAvailableEvents] = useState([]);
    const [selectedMemberCouponId, setSelectedMemberCouponId] = useState('');
    const [issuingCode, setIssuingCode] = useState(null);

    // 5분 선점 주문 상태
    const [heldOrder, setHeldOrder] = useState(null);
    const [remainingSeconds, setRemainingSeconds] = useState(300);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!singleItem && (!cartItems || cartItems.length === 0)) {
            alert('잘못된 접근입니다. 메인 화면으로 이동합니다.');
            navigate('/kpass/main', { replace: true });
        }
    }, [singleItem, cartItems, navigate]);

    // 내 보유 쿠폰 & 발급 가능한 선착순 쿠폰 목록 조회 (POST)
    const fetchCouponData = useCallback(async () => {
        try {
            const [myRes, eventRes] = await Promise.all([
                axiosClient.post('/api/v1/coupons/my'),
                axiosClient.post('/api/v1/coupons/events'),
            ]);
            const myData = myRes?.data ?? myRes ?? [];
            const eventData = eventRes?.data ?? eventRes ?? [];
            setMyCoupons(Array.isArray(myData) ? myData : []);
            setAvailableEvents(Array.isArray(eventData) ? eventData : []);
        } catch (error) {
            console.error('쿠폰 목록 조회 실패:', error);
        }
    }, []);

    useEffect(() => {
        fetchCouponData();
    }, [fetchCouponData]);

    // 선착순 쿠폰 발급 요청 (POST)
    const handleIssueCoupon = async (code) => {
        if (issuingCode) return;
        setIssuingCode(code);
        try {
            const res = await axiosClient.post('/api/v1/coupons/issue', { code });
            const issued = res?.data ?? res;
            alert('🎉 선착순 쿠폰이 발급되었습니다!');
            await fetchCouponData();
            if (issued?.memberCouponId) {
                setSelectedMemberCouponId(String(issued.memberCouponId));
            }
        } catch (error) {
            const msg = error.response?.data?.message || '쿠폰 발급에 실패했습니다.';
            alert(msg);
        } finally {
            setIssuingCode(null);
        }
    };

    // 5분 카운트다운 타이머
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

    const originalTotalPrice = displayItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    // 선택된 쿠폰 및 최종 결제 금액 계산
    const selectedCouponObj = myCoupons.find(
        (c) => String(c.memberCouponId) === String(selectedMemberCouponId)
    );
    const discountAmount = selectedCouponObj ? Math.min(originalTotalPrice, selectedCouponObj.discountAmount) : 0;
    const finalTotalPrice = Math.max(0, originalTotalPrice - discountAmount);

    const formatTime = (sec) => {
        const m = String(Math.floor(sec / 60)).padStart(2, '0');
        const s = String(sec % 60).padStart(2, '0');
        return `${m}:${s}`;
    };

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

            if (!orderInfo) {
                const payload = {
                    memberCouponId: selectedMemberCouponId ? Number(selectedMemberCouponId) : null,
                    items: displayItems.map((item) => ({
                        cartId: item.cartId,
                        performanceId: item.performanceId,
                        seatPriceId: item.seatPriceId,
                        seatType: item.seatType,
                        quantity: item.quantity,
                    })),
                    totalPrice: finalTotalPrice,
                };

                const res = await CheckoutApi.createOrder(payload);
                const data = res?.data ?? res;

                orderInfo = {
                    orderId: data.orderUid,
                    orderName: data.orderName,
                    totalAmount: data.totalPrice,
                    expiredAt: data.expiredAt,
                };
                setHeldOrder(orderInfo);
            }

            if (orderInfo.totalAmount === 0) {
                alert('예매가 완료되었습니다.');
                navigate('/kpass/reservations', { replace: true });
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

            <main style={{ flex: 1, maxWidth: '700px', width: '100%', margin: '0 auto', padding: '28px 16px 80px 16px', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 'bold', margin: 0 }}>
                        🎟️ 티켓 예매 / 결제
                    </h2>

                    {heldOrder && (
                        <div
                            style={{
                                backgroundColor: remainingSeconds <= 60 ? 'rgba(255, 51, 85, 0.2)' : '#1d202d',
                                border: `1px solid ${remainingSeconds <= 60 ? '#ff3355' : '#3b82f6'}`,
                                color: remainingSeconds <= 60 ? '#ff3355' : '#60a5fa',
                                padding: '6px 14px',
                                borderRadius: '20px',
                                fontSize: '0.88rem',
                                fontWeight: 'bold',
                            }}
                        >
                            ⏳ 결제 남은 시간 {formatTime(remainingSeconds)}
                        </div>
                    )}
                </div>

                <div style={{ backgroundColor: '#161820', border: '1px solid #2a2d3d', borderRadius: '12px', padding: '22px' }}>
                    {/* 1. 주문 공연 목록 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '22px', paddingBottom: '18px', borderBottom: '1px solid #2a2d3d' }}>
                        {displayItems.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                                <img
                                    src={item.posterUrl}
                                    alt={item.title}
                                    style={{ width: '70px', height: '95px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }}
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/75x100/1c1e28/8c92a4?text=K-PASS';
                                    }}
                                />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h3 style={{ margin: '0 0 6px 0', fontSize: '1rem', color: '#ffffff' }}>{item.title}</h3>
                                    {item.venue && <p style={{ margin: '2px 0', color: '#9ca3af', fontSize: '0.82rem' }}>📍 {item.venue}</p>}
                                    <p style={{ margin: '4px 0 0 0', color: '#e5e7eb', fontSize: '0.86rem' }}>
                                        좌석: <strong>{item.seatType}</strong> · 수량: <strong>{item.quantity}매</strong> ·{' '}
                                        <span style={{ color: '#ff3355', fontWeight: 'bold' }}>
                                            {(item.unitPrice * item.quantity).toLocaleString()}원
                                        </span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 2. 좌석 및 수량 선택 (단건 & 선점 전) */}
                    {singleItem && !heldOrder && (
                        <>
                            {seatPrices.length > 0 && (
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: 'bold', marginBottom: '8px' }}>
                                        좌석 등급 선택
                                    </label>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {seatPrices.map((sp) => (
                                            <button
                                                key={sp.id || sp.seatType}
                                                type="button"
                                                onClick={() => setSelectedSeat(sp)}
                                                style={{
                                                    padding: '9px 14px',
                                                    backgroundColor: selectedSeat?.seatType === sp.seatType ? '#ff3355' : '#1d202d',
                                                    color: '#ffffff',
                                                    border: '1px solid #2a2d3d',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.85rem',
                                                }}
                                            >
                                                {sp.seatType} ({sp.price.toLocaleString()}원)
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
                                <span style={{ fontSize: '0.92rem', fontWeight: 'bold' }}>티켓 수량</span>
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

                    {/* 3. 🎁 선착순 쿠폰 발급 & 보유 쿠폰 적용 섹션 */}
                    <div style={{ marginBottom: '22px', padding: '16px', backgroundColor: '#12141c', borderRadius: '10px', border: '1px solid #2a2d3d' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <span style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#ffffff' }}>
                                🎁 할인 쿠폰 적용
                            </span>
                            <span style={{ fontSize: '0.78rem', color: '#818cf8', fontWeight: 'bold' }}>
                                사용 가능 {myCoupons.length}장
                            </span>
                        </div>

                        {/* 보유 쿠폰 선택 셀렉트 박스 */}
                        <select
                            disabled={!!heldOrder || originalTotalPrice === 0}
                            value={selectedMemberCouponId}
                            onChange={(e) => setSelectedMemberCouponId(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '11px 12px',
                                backgroundColor: '#1c1e28',
                                color: '#ffffff',
                                border: '1px solid #35394d',
                                borderRadius: '8px',
                                fontSize: '0.88rem',
                                marginBottom: availableEvents.length > 0 ? '14px' : '0',
                                cursor: heldOrder ? 'not-allowed' : 'pointer',
                            }}
                        >
                            <option value="">쿠폰을 선택하지 않음</option>
                            {myCoupons.map((mc) => (
                                <option key={mc.memberCouponId} value={mc.memberCouponId}>
                                    {mc.name} (-{mc.discountAmount.toLocaleString()}원 할인)
                                </option>
                            ))}
                        </select>

                        {/* 선착순 쿠폰 즉시 발급 배너 리스트 */}
                        {availableEvents.length > 0 && !heldOrder && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '10px', borderTop: '1px dashed #2a2d3d' }}>
                                <span style={{ fontSize: '0.76rem', color: '#9ca3af', fontWeight: 'bold' }}>
                                    ⚡ 지금 받을 수 있는 선착순 쿠폰 (1인 1매)
                                </span>
                                {availableEvents.map((ev) => (
                                    <div
                                        key={ev.code}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            gap: '10px',
                                            padding: '9px 12px',
                                            backgroundColor: '#191b24',
                                            borderRadius: '8px',
                                            border: '1px solid #2e3244',
                                        }}
                                    >
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ fontSize: '0.84rem', fontWeight: 'bold', color: '#ffffff' }}>
                                                {ev.name} <span style={{ color: '#ff3355' }}>(-{ev.discountAmount.toLocaleString()}원)</span>
                                            </div>
                                            <div style={{ fontSize: '0.73rem', color: '#9ca3af' }}>
                                                남은 수량: {ev.remainQuantity} / {ev.totalQuantity}매
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            disabled={ev.alreadyIssued || ev.remainQuantity <= 0 || issuingCode === ev.code}
                                            onClick={() => handleIssueCoupon(ev.code)}
                                            style={{
                                                padding: '7px 12px',
                                                borderRadius: '6px',
                                                border: 'none',
                                                fontSize: '0.78rem',
                                                fontWeight: 'bold',
                                                whiteSpace: 'nowrap',
                                                cursor: ev.alreadyIssued || ev.remainQuantity <= 0 ? 'default' : 'pointer',
                                                backgroundColor: ev.alreadyIssued
                                                    ? '#2a2d3d'
                                                    : ev.remainQuantity <= 0
                                                        ? '#3f2329'
                                                        : '#6c5ce7',
                                                color: ev.alreadyIssued ? '#9ca3af' : '#ffffff',
                                            }}
                                        >
                                            {ev.alreadyIssued
                                                ? '발급완료'
                                                : ev.remainQuantity <= 0
                                                    ? '선착순 마감'
                                                    : issuingCode === ev.code
                                                        ? '발급중...'
                                                        : '쿠폰 받기'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 4. 결제 요약 박스 */}
                    <div style={{ backgroundColor: '#1d202d', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.86rem', color: '#a1a1aa' }}>
                            <span>총 예매 건수 / 매수</span>
                            <span>
                                {displayItems.length}건 / {displayItems.reduce((acc, i) => acc + i.quantity, 0)}매
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.86rem', color: '#a1a1aa' }}>
                            <span>주문 금액</span>
                            <span>{originalTotalPrice.toLocaleString()}원</span>
                        </div>
                        {discountAmount > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.86rem', color: '#818cf8', fontWeight: 'bold' }}>
                                <span>쿠폰 할인 금액</span>
                                <span>-{discountAmount.toLocaleString()}원</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #2a2d3d', fontSize: '1.1rem', fontWeight: 'bold' }}>
                            <span>최종 결제 금액</span>
                            <span style={{ color: '#ff3355' }}>
                                {finalTotalPrice > 0 ? `${finalTotalPrice.toLocaleString()}원` : '무료'}
                            </span>
                        </div>
                    </div>

                    {/* 5. 결제 / 취소 버튼 */}
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
                                    ? `결제창 다시 열기 (${finalTotalPrice.toLocaleString()}원)`
                                    : finalTotalPrice > 0
                                        ? `${finalTotalPrice.toLocaleString()}원 결제하기`
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