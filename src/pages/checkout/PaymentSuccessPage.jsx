import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import CheckoutApi from './CheckoutApi';

export default function PaymentSuccessPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const isRequestedRef = useRef(false);

    const [status, setStatus] = useState('LOADING'); // LOADING | SUCCESS | ERROR
    const [receipt, setReceipt] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (isRequestedRef.current) return;
        isRequestedRef.current = true;

        const paymentKey = searchParams.get('paymentKey');
        const orderId = searchParams.get('orderId');
        const amount = Number(searchParams.get('amount'));

        if (!paymentKey || !orderId || !amount) {
            setStatus('ERROR');
            setErrorMessage('유효하지 않은 결제 승인 파라미터입니다.');
            return;
        }

        const confirm = async () => {
            try {
                const result = await CheckoutApi.confirmPayment({
                    paymentKey,
                    orderId,
                    amount,
                });
                setReceipt(result);
                setStatus('SUCCESS');
            } catch (error) {
                setStatus('ERROR');
                setErrorMessage(
                    error.response?.data?.message || '결제 승인 처리에 실패했습니다. 결제는 자동 취소되었습니다.'
                );
            }
        };

        confirm();
    }, [searchParams]);

    return (
        <div style={{ backgroundColor: '#0d0e12', minHeight: '100vh', display: 'flex', flexDirection: 'column', color: '#ffffff' }}>
            <Header />

            <main style={{ flex: 1, maxWidth: '560px', width: '100%', margin: '0 auto', padding: '60px 20px', boxSizing: 'border-box', textAlign: 'center' }}>
                <div style={{ backgroundColor: '#161820', border: '1px solid #2a2d3d', borderRadius: '12px', padding: '36px 28px' }}>
                    {status === 'LOADING' && (
                        <>
                            <h2 style={{ fontSize: '1.3rem', marginBottom: '12px' }}>⏳ 결제 승인 처리 중입니다...</h2>
                            <p style={{ color: '#9ca3af', fontSize: '0.92rem' }}>잠시만 기다려 주세요. 페이지를 새로고침하지 마세요.</p>
                        </>
                    )}

                    {status === 'SUCCESS' && (
                        <>
                            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎉</div>
                            <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>티켓 예매 및 결제가 완료되었습니다!</h2>
                            <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '24px' }}>
                                주문번호: {receipt?.orderId || searchParams.get('orderId')}
                            </p>

                            <div style={{ backgroundColor: '#1d202d', borderRadius: '8px', padding: '16px', marginBottom: '28px', textAlign: 'left', fontSize: '0.92rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ color: '#a1a1aa' }}>상품명</span>
                                    <strong>{receipt?.orderName || '공연 티켓'}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#a1a1aa' }}>최종 결제 금액</span>
                                    <strong style={{ color: '#ff3355' }}>
                                        {Number(searchParams.get('amount')).toLocaleString()}원
                                    </strong>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => navigate('/kpass/main', { replace: true })}
                                style={{
                                    width: '100%',
                                    padding: '14px 0',
                                    background: 'linear-gradient(135deg, #ff3355 0%, #ff007a 100%)',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                }}
                            >
                                메인으로 돌아가기
                            </button>
                        </>
                    )}

                    {status === 'ERROR' && (
                        <>
                            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>⚠️</div>
                            <h2 style={{ fontSize: '1.35rem', marginBottom: '10px', color: '#ff3355' }}>결제 승인 실패</h2>
                            <p style={{ color: '#d1d5db', fontSize: '0.92rem', marginBottom: '28px' }}>{errorMessage}</p>

                            <button
                                type="button"
                                onClick={() => navigate('/kpass/cart', { replace: true })}
                                style={{
                                    width: '100%',
                                    padding: '14px 0',
                                    backgroundColor: '#2a2d3d',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '0.95rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                }}
                            >
                                장바구니로 돌아가기
                            </button>
                        </>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}