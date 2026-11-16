import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';

export default function PaymentFailPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const code = searchParams.get('code') || 'PAYMENT_FAILED';
    const message = searchParams.get('message') || '결제가 취소되었거나 승인에 실패했습니다.';

    return (
        <div style={{ backgroundColor: '#0d0e12', minHeight: '100vh', display: 'flex', flexDirection: 'column', color: '#ffffff' }}>
            <Header />

            <main style={{ flex: 1, maxWidth: '560px', width: '100%', margin: '0 auto', padding: '60px 20px', boxSizing: 'border-box', textAlign: 'center' }}>
                <div style={{ backgroundColor: '#161820', border: '1px solid #2a2d3d', borderRadius: '12px', padding: '36px 28px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '12px' }}>❌</div>
                    <h2 style={{ fontSize: '1.35rem', marginBottom: '10px' }}>결제가 완료되지 않았습니다</h2>
                    <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '6px' }}>에러 코드: {code}</p>
                    <p style={{ color: '#d1d5db', fontSize: '0.95rem', marginBottom: '28px' }}>{message}</p>

                    <button
                        type="button"
                        onClick={() => navigate('/kpass/cart', { replace: true })}
                        style={{
                            width: '100%',
                            padding: '14px 0',
                            backgroundColor: '#ff3355',
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
                </div>
            </main>

            <Footer />
        </div>
    );
}