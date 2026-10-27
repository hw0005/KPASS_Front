import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import '../../styles/auth.css';

const AuthContainerPage = ({ mode }) => {
    const navigate = useNavigate();
    const isRegisterMode = mode === 'register';

    return (
        <div className="auth-viewport">
            <div className="auth-card-container">
                <div className="auth-toggle-bar">
                    <div
                        className={`auth-toggle-slider ${isRegisterMode ? 'slide-right' : 'slide-left'}`}
                    />
                    <button
                        type="button"
                        className={`toggle-btn ${!isRegisterMode ? 'active' : ''}`}
                        onClick={() => navigate('/kpass/login')}
                    >
                        로그인
                    </button>
                    <button
                        type="button"
                        className={`toggle-btn ${isRegisterMode ? 'active' : ''}`}
                        onClick={() => navigate('/kpass/register')}
                    >
                        회원가입
                    </button>
                </div>

                <div className="auth-form-wrapper">
                    {!isRegisterMode ? (
                        <LoginPage onSwitchToRegister={() => navigate('/kpass/register')} />
                    ) : (
                        <RegisterPage onSwitchToLogin={() => navigate('/kpass/login')} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthContainerPage;