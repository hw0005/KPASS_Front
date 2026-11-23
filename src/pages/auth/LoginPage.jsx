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
            console.log('2. [로그인 성공 응답 전체]:', res);

            // ⭕ 백엔드/Axios 응답 래핑 구조 완벽 대응 추출
            const responseData = res?.data?.data || res?.data || res;
            const userNickname = responseData?.nickname;
            const accessToken = responseData?.accessToken || responseData?.token;
            const refreshToken = responseData?.refreshToken;

            if (userNickname) {
                localStorage.setItem('nickname', userNickname);
            }

            if (accessToken) {
                localStorage.setItem('accessToken', accessToken);
            }

            if (refreshToken) {
                localStorage.setItem('refreshToken', refreshToken);
            }

            alert(`${userNickname || '회원'}님 로그인에 성공했습니다!`);
            navigate('/kpass/main');

        } catch (err) {
            console.error('로그인 에러:', err);
            const errorData = err.response?.data;
            const backendCode = errorData?.code;
            const backendMessage = errorData?.message || '로그인 처리 중 오류가 발생했습니다.';

            if (backendCode === 'M003') {
                setFieldErrors((prev) => ({ ...prev, email: backendMessage }));
            } else if (backendCode === 'M004' || backendCode === 'INVALID_PASSWORD') {
                setFieldErrors((prev) => ({ ...prev, password: backendMessage }));
            } else {
                setErrorMessage(backendMessage);
            }
        }
    };

    // 카카오 로그인
    const handleKakaoLogin = () => {
        const KAKAO_REST_API_KEY = "e9a0bdb04db0e49033e7594b30eb22e3";
        const REDIRECT_URI = "http://localhost:3000/oauth/callback/kakao";
        const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code&prompt=login`;

        window.location.href = kakaoAuthUrl;
    };

    // 네이버 로그인
    const handleNaverLogin = () => {
        const NAVER_CLIENT_ID = "QW0kcm4NVmTF3LrHKT7x";
        const REDIRECT_URI = encodeURIComponent("http://localhost:3000/oauth/callback/naver");
        const STATE = "naver_login_state";

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

            <div className="oauth-divider">
                <span>또는 소셜 계정으로 로그인</span>
            </div>

            <div className="social-login-group">
                <button
                    type="button"
                    className="social-btn btn-naver"
                    onClick={handleNaverLogin}
                >
                    네이버 로그인
                </button>
                <button
                    type="button"
                    className="social-btn btn-kakao"
                    onClick={handleKakaoLogin}
                >
                    카카오 로그인
                </button>
                <button
                    type="button"
                    className="social-btn btn-google"
                    onClick={handleGoogleLogin}
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