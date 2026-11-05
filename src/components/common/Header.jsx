import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();

    // ⭕ 로그인 시 저장된 닉네임 가져오기 (만약의 경우를 대비해 '회원' 기본값 지정)
    const nickname = localStorage.getItem('nickname') || sessionStorage.getItem('nickname') || '회원';

    const handleLogout = () => {
        localStorage.removeItem('nickname');
        localStorage.removeItem('token');
        sessionStorage.removeItem('nickname');
        sessionStorage.removeItem('token');
        alert('로그아웃되었습니다.');
        navigate('/kpass/login');
    };

    return (
        <header style={{
            backgroundColor: '#161820',
            borderBottom: '1px solid #2a2d3d',
            padding: '12px 24px',
            position: 'sticky',
            top: 0,
            zIndex: 1000
        }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                {/* 1. K-PASS 로고 */}
                <h1
                    onClick={() => navigate('/kpass/main')}
                    style={{ margin: 0, fontSize: '1.4rem', fontWeight: 'bold', color: '#ff3355', cursor: 'pointer' }}
                >
                    K-PASS
                </h1>

                {/* 2. 4대 핵심 네비게이션 메뉴 */}
                <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                    <button
                        type="button"
                        onClick={() => navigate('/kpass/search')}
                        style={{ background: 'none', border: 'none', color: location.pathname === '/kpass/search' ? '#ff3355' : '#a1a1aa', fontSize: '0.95rem', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        🔍 검색
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/kpass/ai')}
                        style={{ background: 'none', border: 'none', color: location.pathname === '/kpass/ai' ? '#ff3355' : '#a1a1aa', fontSize: '0.95rem', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        🤖 AI 추천
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/kpass/map')}
                        style={{ background: 'none', border: 'none', color: location.pathname === '/kpass/map' ? '#ff3355' : '#a1a1aa', fontSize: '0.95rem', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        📍 지도
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/kpass/cart')}
                        style={{ background: 'none', border: 'none', color: location.pathname === '/kpass/cart' ? '#ff3355' : '#a1a1aa', fontSize: '0.95rem', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        🛒 장바구니
                    </button>
                </nav>

                {/* 3. 회원 전용 영역 (닉네임 + 로그아웃 버튼 고정) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '0.9rem', color: '#ffffff' }}>
                        <strong style={{ color: '#818cf8' }}>{nickname}</strong>님 환영합니다!
                    </span>
                    <button
                        type="button"
                        onClick={handleLogout}
                        style={{
                            padding: '6px 12px',
                            backgroundColor: '#2a2d3d',
                            color: '#a1a1aa',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            cursor: 'pointer'
                        }}
                    >
                        로그아웃
                    </button>
                </div>

            </div>
        </header>
    );
}