import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';

export default function CheckoutPage() {
    const location = useLocation();
    const navigate = useNavigate();

    const item = location.state?.performance;
    const seatPrices = item?.seatPrices || [];

    const [selectedSeat, setSelectedSeat] = useState(seatPrices.length > 0 ? seatPrices[0] : null);
    const [ticketCount, setTicketCount] = useState(1);

    useEffect(() => {
        if (!item) {
            alert('잘못된 접근입니다. 메인 화면으로 이동합니다.');
            navigate('/kpass/main', { replace: true });
        }
    }, [item, navigate]);

    if (!item) return null;

    const unitPrice = selectedSeat ? selectedSeat.price : (item.price || 0);
    const totalPrice = unitPrice * ticketCount;

    const handlePayment = () => {
        // 결제 요청 백엔드 API 연결 위치
        alert(`${item.title}\n[${selectedSeat ? selectedSeat.seatType : '기본석'}] ${ticketCount}매 (${totalPrice.toLocaleString()}원) 결제가 완료되었습니다.`);
        navigate('/kpass/main');
    };

    return (
        <div style={{ backgroundColor: '#0d0e12', minHeight: '100vh', display: 'flex', flexDirection: 'column', color: '#ffffff' }}>
            <Header />

            <main style={{ flex: 1, maxWidth: '700px', width: '100%', margin: '0 auto', padding: '40px 20px 80px 20px', boxSizing: 'border-box' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🎟️ 티켓 예매 / 결제
                </h2>

                <div style={{ backgroundColor: '#161820', border: '1px solid #2a2d3d', borderRadius: '12px', padding: '28px' }}>
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #2a2d3d' }}>
                        <img
                            src={item.posterUrl}
                            alt={item.title}
                            style={{ width: '90px', height: '120px', objectFit: 'cover', borderRadius: '6px' }}
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/90x120/1c1e28/8c92a4?text=K-PASS'; }}
                        />
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', color: '#ffffff' }}>{item.title}</h3>
                            <p style={{ margin: '2px 0', color: '#9ca3af', fontSize: '0.85rem' }}>📍 {item.venue}</p>
                            <p style={{ margin: '2px 0', color: '#9ca3af', fontSize: '0.85rem' }}>📅 {item.startDate} ~ {item.endDate}</p>
                        </div>
                    </div>

                    {/* PerformanceSeatPrice 기반 좌석 선택 */}
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
                                            fontSize: '0.88rem'
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

                    <div style={{ backgroundColor: '#1d202d', borderRadius: '8px', padding: '16px', marginBottom: '28px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem', color: '#a1a1aa' }}>
                            <span>선택 좌석 / 단가</span>
                            <span>{selectedSeat ? `${selectedSeat.seatType} / ${unitPrice.toLocaleString()}원` : `${unitPrice.toLocaleString()}원`}</span>
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
                            onClick={handlePayment}
                            style={{
                                flex: 1, padding: '14px 0',
                                background: 'linear-gradient(135deg, #ff3355 0%, #ff007a 100%)',
                                color: '#ffffff', border: 'none', borderRadius: '8px',
                                fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(255, 51, 85, 0.4)'
                            }}
                        >
                            {totalPrice > 0 ? `${totalPrice.toLocaleString()}원 결제하기` : '무료 예매 완료하기'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            style={{
                                padding: '14px 20px', backgroundColor: '#2a2d3d',
                                color: '#ffffff', border: 'none', borderRadius: '8px',
                                fontSize: '0.9rem', cursor: 'pointer'
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