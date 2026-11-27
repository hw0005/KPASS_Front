import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import './Header.css';

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const couponBoxRef = useRef(null);

    const nickname = localStorage.getItem('nickname') || sessionStorage.getItem('nickname') || '회원';

    // 🎁 실시간 선착순 쿠폰 상태
    const [couponEvents, setCouponEvents] = useState([]);
    const [isCouponOpen, setIsCouponOpen] = useState(false);
    const [issuingCode, setIssuingCode] = useState(null);

    const fetchCouponEvents = async () => {
        try {
            const res = await axiosClient.post('/api/v1/coupons/events');
            const list = res?.data ?? res ?? [];
            setCouponEvents(Array.isArray(list) ? list : []);
        } catch (error) {
            console.error('쿠폰 이벤트 조회 실패:', error);
        }
    };

    useEffect(() => {
        fetchCouponEvents();
    }, []);

    // 팝오버 바깥 클릭 시 자동 닫힘
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (couponBoxRef.current && !couponBoxRef.current.contains(e.target)) {
                setIsCouponOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleIssueCoupon = async (code) => {
        if (issuingCode) return;
        setIssuingCode(code);
        try {
            await axiosClient.post('/api/v1/coupons/issue', { code });
            alert('🎉 선착순 쿠폰이 발급되었습니다! 예매/결제 시 바로 사용할 수 있습니다.');
            await fetchCouponEvents();
        } catch (error) {
            const msg = error.response?.data?.message || '쿠폰 발급에 실패했습니다.';
            alert(msg);
        } finally {
            setIssuingCode(null);
        }
    };

    // 아직 받지 않은 발급 가능 쿠폰 개수
    const availableCount = couponEvents.filter(
        (ev) => !ev.alreadyIssued && ev.remainQuantity > 0
    ).length;

    const handleLogout = async () => {
        try {
            await axiosClient.post('/api/v1/auth/logout');
        } catch (error) {
            console.error('로그아웃 API 호출 실패:', error);
        } finally {
            localStorage.removeItem('nickname');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('token');

            sessionStorage.removeItem('nickname');
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('refreshToken');
            sessionStorage.removeItem('token');

            alert('로그아웃되었습니다.');
            navigate('/kpass/login');
        }
    };

    const navItems = [
        { label: '🔍 검색', path: '/kpass/search' },
        { label: '🤖 AI 추천', path: '/kpass/ai' },
        { label: '📍 지도', path: '/kpass/map' },
        { label: '🛒 장바구니', path: '/kpass/cart' },
        { label: '🎫 예매내역', path: '/kpass/reservations' },
    ];

    return (
        <header className="kpass-header">
            <div className="header-inner">
                {/* 1. K-PASS 로고 */}
                <h1 className="header-logo" onClick={() => navigate('/kpass/main')}>
                    K-PASS
                </h1>

                {/* 2. 네비게이션 메뉴 + 실시간 선착순 쿠폰 버튼 */}
                <nav className="header-nav">
                    {navItems.map((item) => (
                        <button
                            key={item.path}
                            type="button"
                            onClick={() => navigate(item.path)}
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            {item.label}
                        </button>
                    ))}

                    {/* 🎁 실시간 선착순 쿠폰 드롭다운 트리거 */}
                    <div ref={couponBoxRef} style={{ position: 'relative', display: 'inline-block' }}>
                        <button
                            type="button"
                            onClick={() => setIsCouponOpen((prev) => !prev)}
                            className={`nav-item ${isCouponOpen ? 'active' : ''}`}
                            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                        >
                            <span>🎁 선착순 쿠폰</span>
                            {availableCount > 0 && (
                                <span
                                    style={{
                                        backgroundColor: '#ff3355',
                                        color: '#ffffff',
                                        fontSize: '0.68rem',
                                        fontWeight: 'bold',
                                        padding: '1px 6px',
                                        borderRadius: '10px',
                                        lineHeight: 1.3,
                                    }}
                                >
                                    {availableCount}
                                </span>
                            )}
                        </button>

                        {/* 실시간 쿠폰 발급 드롭다운 패널 */}
                        {isCouponOpen && (
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 'calc(100% + 10px)',
                                    right: 0,
                                    width: '310px',
                                    maxWidth: '90vw',
                                    backgroundColor: '#161820',
                                    border: '1px solid #35394d',
                                    borderRadius: '12px',
                                    padding: '14px',
                                    boxShadow: '0 10px 28px rgba(0, 0, 0, 0.65)',
                                    zIndex: 1000,
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '10px',
                                        paddingBottom: '8px',
                                        borderBottom: '1px solid #2a2d3d',
                                    }}
                                >
                                    <span style={{ fontSize: '0.88rem', fontWeight: 'bold', color: '#ffffff' }}>
                                        ⚡ 실시간 선착순 쿠폰
                                    </span>
                                    <span style={{ fontSize: '0.72rem', color: '#818cf8' }}>
                                        1인 1매 한정
                                    </span>
                                </div>

                                {couponEvents.length === 0 ? (
                                    <p style={{ fontSize: '0.8rem', color: '#9ca3af', textAlign: 'center', margin: '16px 0' }}>
                                        현재 진행 중인 선착순 쿠폰이 없습니다.
                                    </p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '260px', overflowY: 'auto' }}>
                                        {couponEvents.map((ev) => {
                                            const isSoldOut = ev.remainQuantity <= 0;
                                            const isDisabled = ev.alreadyIssued || isSoldOut || issuingCode === ev.code;

                                            return (
                                                <div
                                                    key={ev.code}
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        gap: '10px',
                                                        padding: '10px 12px',
                                                        backgroundColor: '#1d202d',
                                                        border: '1px solid #2e3244',
                                                        borderRadius: '8px',
                                                    }}
                                                >
                                                    <div style={{ minWidth: 0 }}>
                                                        <div style={{ fontSize: '0.82rem', fontWeight: 'bold', color: '#ffffff', wordBreak: 'keep-all' }}>
                                                            {ev.name}
                                                        </div>
                                                        <div style={{ fontSize: '0.76rem', color: '#ff4d6d', fontWeight: 'bold', marginTop: '2px' }}>
                                                            -{ev.discountAmount.toLocaleString()}원 할인
                                                        </div>
                                                        <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '2px' }}>
                                                            남은 수량 {ev.remainQuantity} / {ev.totalQuantity}매
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        disabled={isDisabled}
                                                        onClick={() => handleIssueCoupon(ev.code)}
                                                        style={{
                                                            padding: '7px 11px',
                                                            borderRadius: '6px',
                                                            border: 'none',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 'bold',
                                                            whiteSpace: 'nowrap',
                                                            cursor: isDisabled ? 'default' : 'pointer',
                                                            backgroundColor: ev.alreadyIssued
                                                                ? '#2a2d3d'
                                                                : isSoldOut
                                                                    ? '#3f2329'
                                                                    : '#6c5ce7',
                                                            color: ev.alreadyIssued ? '#9ca3af' : '#ffffff',
                                                        }}
                                                    >
                                                        {ev.alreadyIssued
                                                            ? '발급완료'
                                                            : isSoldOut
                                                                ? '마감'
                                                                : issuingCode === ev.code
                                                                    ? '발급중'
                                                                    : '쿠폰받기'}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </nav>

                {/* 3. 회원 전용 영역 */}
                <div className="header-user-info">
                    <span className="welcome-msg">
                        <strong>{nickname}</strong>님 환영합니다!
                    </span>
                    <button type="button" onClick={handleLogout} className="logout-btn">
                        로그아웃
                    </button>
                </div>
            </div>
        </header>
    );
}