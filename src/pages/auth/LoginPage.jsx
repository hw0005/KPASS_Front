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
    // const handleOAuthLogin = (provider) => {
    //     const backendBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081';
    //     window.location.href = `${backendBaseUrl}/oauth2/authorization/${provider}`;
    // };

    // 카카오 로그인
    const handleKakaoLogin = () => {
        // 프론트엔드 카카오 로그인 버튼 클릭 핸들러
        const KAKAO_REST_API_KEY = "e9a0bdb04db0e49033e7594b30eb22e3";
        const REDIRECT_URI = "http://localhost:3000/oauth/callback/kakao";

        // prompt=login 을 추가하면 기존 세션을 무시하고 무조건 로그인/동의창 노출
        const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code&prompt=login`;

        window.location.href = kakaoAuthUrl;
    };

    // 네이버 로그인
    const handleNaverLogin = () => {
        const NAVER_CLIENT_ID = "QW0kcm4NVmTF3LrHKT7x";
        const REDIRECT_URI = encodeURIComponent("http://localhost:3000/oauth/callback/naver");
        const STATE = "naver_login_state"; // 네이버 필수 파라미터

        const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=${STATE}`;

        window.location.href = naverAuthUrl;
    };

    // 구글 로그인
    const handleGoogleLogin = () => {
    const GOOGLE_CLIENT_ID = "425649387610-17lmlailht74579kds55fiuri1plkd08.apps.googleusercontent.com";
    const REDIRECT_URI = "http://localhost:3000/oauth/callback/google";
    const SCOPE = "email profile";

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${encodeURIComponent(SCOPE)}&prompt=select_account`;

    window.location.href = googleAuthUrl;
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
                    className="social-btn btn-naver"
                    onClick={() => handleNaverLogin('naver')}
                >
                    네이버 로그인
                </button>
                <button
                    type="button"
                    className="social-btn btn-kakao"
                    onClick={() => handleKakaoLogin('kakao')}
                >
                    카카오 로그인
                </button>
                <button
                    type="button"
                    className="social-btn btn-google"
                    onClick={() => handleGoogleLogin('google')}
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