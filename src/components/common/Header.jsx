import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = ({ nickname = '회원' }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        alert('로그아웃 되었습니다.');
        navigate('/kpass/login');
    };

    return (
        <header className="kpass-header">
            <div className="header-logo" onClick={() => navigate('/kpass/main')}>
                K-PASS
            </div>
            <div className="header-user-info">
                <span className="welcome-msg">
                    안녕하세요, <strong>{nickname}님</strong>
                </span>
                <button type="button" className="logout-btn" onClick={handleLogout}>
                    로그아웃
                </button>
            </div>
        </header>
    );
};

export default Header;