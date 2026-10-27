import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="kpass-footer">
            <div className="footer-container">
                <p className="footer-brand">K-PASS</p>
                <p className="footer-copyright">
                    © 2026 K-PASS High-Concurrency Ticketing Platform. All rights reserved.
                </p>
                <div className="footer-links">
                    <span>이용약관</span>
                    <span className="divider">|</span>
                    <span>개인정보처리방침</span>
                    <span className="divider">|</span>
                    <span>고객센터</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;