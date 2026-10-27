import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';

const LoginPage = ({ onSwitchToRegister }) => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [errorMessage, setErrorMessage] = useState('');
    const [fieldErrors, setFieldErrors] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({ ...prev, [name]: '' }));
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setFieldErrors({ email: '', password: '' });

        try {
            console.log('1. [로그인 요청 전송]:', formData);

            const res = await authApi.login(formData.email, formData.password);
            console.log('2. [로그인 성공 응답]:', res);

            alert('로그인에 성공했습니다!');
            navigate('/kpass/main'); // 메인 페이지로 이동

        } catch (err) {
            console.error('3. [로그인 에러 발생]:', err);

            const errorData = err.response?.data;
            const backendCode = errorData?.code;
            const backendMessage = errorData?.message || '로그인 처리 중 오류가 발생했습니다.';

            if (backendCode === 'M003') { // MEMBER_NOT_FOUND
                setFieldErrors((prev) => ({ ...prev, email: backendMessage }));
            } else if (backendCode === 'M004' || backendCode === 'INVALID_PASSWORD') { // 비밀번호 불일치
                setFieldErrors((prev) => ({ ...prev, password: backendMessage }));
            } else {
                setErrorMessage(backendMessage);
            }
        }
    };

    // 스프링 Security OAuth2 인증 엔드포인트로 리다이렉트
    const handleOAuthLogin = (provider) => {
        const backendBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081';
        window.location.href = `${backendBaseUrl}/oauth2/authorization/${provider}`;
    };

    return (
        <div className="auth-form-content fade-in">
            <h2 className="auth-title">K-PASS 로그인</h2>
            <p className="auth-subtitle">서비스 이용을 위해 계정 정보를 입력해주세요</p>

            {errorMessage && <div className="auth-error-box">⚠️ {errorMessage}</div>}

            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="login-email">이메일</label>
                    <input
                        id="login-email"
                        type="email"
                        name="email"
                        placeholder="example@kpass.com"
                        value={formData.email}
                        onChange={handleChange}
                        className={fieldErrors.email ? 'input-error' : ''}
                        autoComplete="username"
                        required
                    />
                    {fieldErrors.email && (
                        <span className="field-error-span">⚠️ {fieldErrors.email}</span>
                    )}
                </div>

                <div className="input-group">
                    <label htmlFor="login-password">비밀번호</label>
                    <input
                        id="login-password"
                        type="password"
                        name="password"
                        placeholder="비밀번호 입력"
                        value={formData.password}
                        onChange={handleChange}
                        className={fieldErrors.password ? 'input-error' : ''}
                        autoComplete="current-password"
                        required
                    />
                    {fieldErrors.password && (
                        <span className="field-error-span">⚠️ {fieldErrors.password}</span>
                    )}
                </div>

                <button type="submit" className="submit-btn primary-btn">
                    로그인
                </button>
            </form>

            {/* OAuth2 구분선 */}
            <div className="oauth-divider">
                <span>또는 소셜 계정으로 로그인</span>
            </div>

            {/* 소셜 로그인 버튼 영역 */}
            <div className="social-login-group">
                <button
                    type="button"
                    className="social-btn btn-kakao"
                    onClick={() => handleOAuthLogin('kakao')}
                >
                    카카오 로그인
                </button>
                <button
                    type="button"
                    className="social-btn btn-naver"
                    onClick={() => handleOAuthLogin('naver')}
                >
                    네이버 로그인
                </button>
                <button
                    type="button"
                    className="social-btn btn-google"
                    onClick={() => handleOAuthLogin('google')}
                >
                    Google 로그인
                </button>
            </div>

            <p className="switch-text">
                아직 계정이 없으신가요?{' '}
                <span onClick={onSwitchToRegister} className="link-span">
                    회원가입 하러가기
                </span>
            </p>
        </div>
    );
};

export default LoginPage;