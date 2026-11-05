import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    const navigate = useNavigate();

    return (
        <footer className="kpass-footer">
            <div className="footer-content">
                <div className="footer-brand">
                    <h3>K-PASS</h3>
                    <p>전국 5만여 개 공연 데이터를 실시간으로 만나는 스마트 티켓 플랫폼</p>
                </div>

                <div className="footer-links">
                    <div className="link-group">
                        <h4>서비스 바로가기</h4>
                        <span onClick={() => navigate('/kpass/main')}>메인 홈</span>
                        <span onClick={() => navigate('/kpass/search')}>대용량 공연 검색</span>
                        <span onClick={() => navigate('/kpass/ai-recommend')}>AI 맞춤 일정 생성</span>
                    </div>
                    <div className="link-group">
                        <h4>내 서비스</h4>
                        <span onClick={() => navigate('/kpass/map')}>전국 공연장 지도</span>
                        <span onClick={() => navigate('/kpass/cart')}>찜한 공연 / 장바구니</span>
                        <span onClick={() => navigate('/kpass/checkout')}>결제 / 예매 내역</span>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>© 2026 K-PASS Platform. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;