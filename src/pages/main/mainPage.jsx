import React from 'react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import './MainPage.css';

const MainPage = () => {
    return (
        <div className="main-layout">
            <Header nickname="회원" />

            <main className="main-content">
                <section className="welcome-banner">
                    <h2>🎫 K-PASS 메인 화면</h2>
                    <p>인증 성공! 고성능 K-POP 티켓팅 서비스에 오신 것을 환영합니다.</p>
                </section>

                <section className="concert-section">
                    <h3>🔥 진행 중인 티켓팅 일정</h3>
                    <div className="concert-grid">
                        <div className="concert-card">
                            <span className="badge open">OPEN</span>
                            <h4>2026 K-POP 월드 투어</h4>
                            <p>장소: 서울 올림픽주경기장</p>
                            <p className="date">일시: 2026.11.15 19:00</p>
                            <button type="button" className="ticket-btn">
                                예매하기
                            </button>
                        </div>

                        <div className="concert-card">
                            <span className="badge upcoming">UPCOMING</span>
                            <h4>K-PASS 앙코르 콘서트</h4>
                            <p>장소: 고척스카이돔</p>
                            <p className="date">일시: 2026.12.01 18:00</p>
                            <button type="button" className="ticket-btn disabled" disabled>
                                오픈 대기
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default MainPage;