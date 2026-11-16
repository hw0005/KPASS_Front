import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { cartApi } from '../cart/CartApi';

const DEFAULT_POSTER = 'https://via.placeholder.com/300x400/1c1e28/8c92a4?text=K-PASS';

export default function CartPage() {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // 현재 로그인된 계정의 DB 장바구니 불러오기
    const fetchMyCart = async () => {
        setLoading(true);
        try {
            localStorage.removeItem('kpass_cart');

            const res = await cartApi.getMyCart(); // ← 위쪽 변수명도 반드시 res로 통일
            setCartItems(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error('장바구니 조회 실패:', error);
            setCartItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyCart();
    }, []);

    const isAllChecked = cartItems.length > 0 && cartItems.every((item) => item.checked);

    const handleToggleAll = () => {
        const nextChecked = !isAllChecked;
        setCartItems(cartItems.map((item) => ({ ...item, checked: nextChecked })));
    };

    const handleToggleItem = (cartItemId) => {
        setCartItems(
            cartItems.map((item) =>
                item.cartItemId === cartItemId ? { ...item, checked: !item.checked } : item
            )
        );
    };

    const handleQuantityChange = async (cartItemId, delta) => {
        const target = cartItems.find((item) => item.cartItemId === cartItemId);
        if (!target) return;

        const nextQty = Math.max(1, (target.quantity || 1) + delta);
        if (nextQty === target.quantity) return;

        try {
            await cartApi.updateQuantity(cartItemId, nextQty);
            setCartItems(
                cartItems.map((item) =>
                    item.cartItemId === cartItemId ? { ...item, quantity: nextQty } : item
                )
            );
        } catch (error) {
            console.error('수량 변경 실패:', error);
        }
    };

    const handleRemoveItem = async (cartItemId) => {
        try {
            await cartApi.removeCartItem(cartItemId);
            setCartItems(cartItems.filter((item) => item.cartItemId !== cartItemId));
        } catch (error) {
            console.error('삭제 실패:', error);
        }
    };

    const handleRemoveSelected = async () => {
        const selectedIds = cartItems.filter((item) => item.checked).map((item) => item.cartItemId);
        if (selectedIds.length === 0) return;

        try {
            await cartApi.removeSelected(selectedIds);
            setCartItems(cartItems.filter((item) => !item.checked));
        } catch (error) {
            console.error('선택 삭제 실패:', error);
        }
    };

    const selectedItems = cartItems.filter((item) => item.checked);
    const totalTickets = selectedItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const totalPrice = selectedItems.reduce((sum, item) => {
        return sum + (Number(item.price) || 0) * (item.quantity || 1);
    }, 0);

    const handleProceedCheckout = () => {
        const selectedItems = cartItems.filter((item) => item.checked);
        if (selectedItems.length === 0) {
            alert('결제할 공연을 선택해주세요.');
            return;
        }
        navigate('/kpass/checkout', { state: { cartItems: selectedItems } });
    };

    return (
        <div style={{ backgroundColor: '#0d0e12', minHeight: '100vh', display: 'flex', flexDirection: 'column', color: '#ffffff' }}>
            <Header />

            <main style={{ flex: 1, maxWidth: '1000px', width: '100%', margin: '0 auto', padding: '40px 20px 80px 20px', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        🛒 내 장바구니
                    </h2>
                    <button
                        type="button"
                        onClick={() => navigate('/kpass/search')}
                        style={{ padding: '10px 16px', backgroundColor: '#161820', color: '#818cf8', border: '1px solid #2a2d3d', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        + 공연 더 둘러보기
                    </button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '80px 0', color: '#818cf8' }}>장바구니를 불러오는 중입니다...</div>
                ) : cartItems.length === 0 ? (
                    <div style={{ backgroundColor: '#161820', border: '1px solid #2a2d3d', borderRadius: '14px', padding: '80px 20px', textAlign: 'center' }}>
                        <p style={{ fontSize: '1.15rem', color: '#a1a1aa', marginBottom: '20px' }}>
                            장바구니에 담긴 공연이 없습니다.
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate('/kpass/search')}
                            style={{ padding: '14px 28px', background: 'linear-gradient(135deg, #ff3355 0%, #ff007a 100%)', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            공연 검색하러 가기
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                        <div style={{ flex: 2, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={{ backgroundColor: '#161820', border: '1px solid #2a2d3d', borderRadius: '10px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.92rem', color: '#e4e4e7' }}>
                                    <input
                                        type="checkbox"
                                        checked={isAllChecked}
                                        onChange={handleToggleAll}
                                        style={{ width: '17px', height: '17px', accentColor: '#ff3355', cursor: 'pointer' }}
                                    />
                                    <span>전체 선택 ({selectedItems.length}/{cartItems.length})</span>
                                </label>

                                <button
                                    type="button"
                                    onClick={handleRemoveSelected}
                                    style={{ backgroundColor: 'transparent', color: '#a1a1aa', border: '1px solid #2a2d3d', borderRadius: '6px', padding: '6px 12px', fontSize: '0.82rem', cursor: 'pointer' }}
                                >
                                    선택 삭제
                                </button>
                            </div>

                            {cartItems.map((item) => {
                                const unitPrice = Number(item.price) || 0;
                                const itemTotalPrice = unitPrice * (item.quantity || 1);

                                return (
                                    <div
                                        key={item.cartItemId}
                                        style={{ backgroundColor: '#161820', border: '1px solid #2a2d3d', borderRadius: '12px', padding: '18px', display: 'flex', gap: '16px', alignItems: 'center' }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={!!item.checked}
                                            onChange={() => handleToggleItem(item.cartItemId)}
                                            style={{ width: '18px', height: '18px', accentColor: '#ff3355', cursor: 'pointer', flexShrink: 0 }}
                                        />

                                        <img
                                            src={item.posterUrl || DEFAULT_POSTER}
                                            alt={item.title}
                                            onClick={() => navigate('/kpass/detail', { state: { performance: item } })}
                                            style={{ width: '80px', height: '110px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', flexShrink: 0 }}
                                            onError={(e) => { e.target.src = DEFAULT_POSTER; }}
                                        />

                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 'bold' }}>
                                                {item.category || '공연'} | {item.region || '전국'}
                                            </span>
                                            <h4
                                                onClick={() => navigate('/kpass/detail', { state: { performance: item } })}
                                                style={{ margin: '4px 0 6px 0', fontSize: '1.02rem', color: '#ffffff', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                            >
                                                {item.title}
                                            </h4>
                                            <p style={{ margin: '0 0 10px 0', fontSize: '0.82rem', color: '#a1a1aa' }}>
                                                📍 {item.venue || '장소 미정'} · 📅 {item.startDate || '-'}
                                            </p>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#0d0e12', border: '1px solid #2a2d3d', borderRadius: '6px' }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleQuantityChange(item.cartItemId, -1)}
                                                        style={{ width: '30px', height: '30px', backgroundColor: 'transparent', color: '#ffffff', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
                                                    >
                                                        -
                                                    </button>
                                                    <span style={{ padding: '0 12px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                                        {item.quantity || 1}매
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleQuantityChange(item.cartItemId, 1)}
                                                        style={{ width: '30px', height: '30px', backgroundColor: 'transparent', color: '#ffffff', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#ff3355' }}>
                                                    {unitPrice > 0 ? `${itemTotalPrice.toLocaleString()}원` : '무료'}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem(item.cartItemId)}
                                            title="삭제"
                                            style={{ backgroundColor: 'transparent', color: '#71717a', border: 'none', fontSize: '1.2rem', cursor: 'pointer', padding: '4px' }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        <div style={{ flex: 1, minWidth: '270px', backgroundColor: '#161820', border: '1px solid #2a2d3d', borderRadius: '14px', padding: '24px', position: 'sticky', top: '20px' }}>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 'bold', margin: '0 0 20px 0', paddingBottom: '14px', borderBottom: '1px solid #2a2d3d' }}>
                                예매 요약
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.92rem', color: '#a1a1aa', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>선택 공연 수</span>
                                    <strong style={{ color: '#ffffff' }}>{selectedItems.length}건</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>총 티켓 매수</span>
                                    <strong style={{ color: '#ffffff' }}>{totalTickets}매</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>예매 수수료</span>
                                    <strong style={{ color: '#818cf8' }}>0원 (무료)</strong>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #2a2d3d', marginBottom: '22px' }}>
                                <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>총 결제 금액</span>
                                <span style={{ fontSize: '1.35rem', fontWeight: 'bold', color: '#ff3355' }}>
                                    {totalPrice.toLocaleString()}원
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={handleProceedCheckout}
                                disabled={selectedItems.length === 0}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    background: selectedItems.length === 0 ? '#252834' : 'linear-gradient(135deg, #ff3355 0%, #ff007a 100%)',
                                    color: selectedItems.length === 0 ? '#71717a' : '#ffffff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '1.05rem',
                                    fontWeight: 'bold',
                                    cursor: selectedItems.length === 0 ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {selectedItems.length === 0 ? '공연을 선택해주세요' : `${totalPrice.toLocaleString()}원 예매하기`}
                            </button>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}