import React, { useState } from 'react';
import { authApi } from '../../api/authApi';

const RegisterPage = ({ onSwitchToLogin }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        nickname: '',
        accountNumber: ''
    });

    const [errorMessage, setErrorMessage] = useState('');
    const [fieldErrors, setFieldErrors] = useState({
        email: '',
        nickname: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({ ...prev, [name]: '' }));
        }

        if (name === 'accountNumber') {
            const onlyNumbers = value.replace(/[^0-9]/g, '');
            setFormData((prev) => ({ ...prev, [name]: onlyNumbers }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setFieldErrors({ email: '', nickname: '' });

        try {
            console.log('1. [회원가입 요청 전송]:', formData);

            const res = await authApi.register(formData);
            console.log('2. [회원가입 성공 응답]:', res);

            alert('회원가입이 완료되었습니다! 로그인 해주세요.');
            onSwitchToLogin();

        } catch (err) {
            console.error('3. [회원가입 에러 발생]:', err);

            const errorData = err.response?.data;
            const backendCode = errorData?.code;
            const backendMessage = errorData?.message || '회원가입 처리 중 오류가 발생했습니다.';

            console.error('4. [백엔드 에러 코드]:', backendCode);

            if (backendCode === 'M001') { // 이메일 중복 (DUPLICATE_EMAIL)
                setFieldErrors((prev) => ({ ...prev, email: backendMessage }));
            } else if (backendCode === 'M002') { // 닉네임 중복 (DUPLICATE_NICKNAME)
                setFieldErrors((prev) => ({ ...prev, nickname: backendMessage }));
            } else { // 공통 / 서버 오류
                setErrorMessage(backendMessage);
            }
        }
    };

    return (
        <div className="auth-form-content fade-in">
            <h2 className="auth-title">K-PASS 회원가입</h2>
            <p className="auth-subtitle">안전한 티켓 예매를 위한 회원 정보를 입력해주세요</p>

            {errorMessage && <div className="auth-error-box">⚠️ {errorMessage}</div>}

            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="reg-email">이메일</label>
                    <input
                        id="reg-email"
                        type="email"
                        name="email"
                        placeholder="example@kpass.com"
                        value={formData.email}
                        onChange={handleChange}
                        className={fieldErrors.email ? 'input-error' : ''}
                        required
                    />
                    {fieldErrors.email && (
                        <span className="field-error-span">⚠️ {fieldErrors.email}</span>
                    )}
                </div>

                <div className="input-group">
                    <label htmlFor="reg-password">비밀번호</label>
                    <input
                        id="reg-password"
                        type="password"
                        name="password"
                        placeholder="비밀번호 설정"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="nickname">닉네임</label>
                    <input
                        id="nickname"
                        type="text"
                        name="nickname"
                        placeholder="사용할 닉네임"
                        value={formData.nickname}
                        onChange={handleChange}
                        className={fieldErrors.nickname ? 'input-error' : ''}
                        required
                    />
                    {fieldErrors.nickname && (
                        <span className="field-error-span">⚠️ {fieldErrors.nickname}</span>
                    )}
                </div>

                <div className="input-group">
                    <label htmlFor="accountNumber">계좌번호</label>
                    <input
                        id="accountNumber"
                        type="text"
                        name="accountNumber"
                        placeholder="숫자만 입력 (필수)"
                        value={formData.accountNumber}
                        onChange={handleChange}
                        maxLength={16}
                        required
                    />
                </div>

                <button type="submit" className="submit-btn primary-btn">
                    가입하기
                </button>
            </form>

            <p className="switch-text">
                이미 계정이 있으신가요?{' '}
                <span onClick={onSwitchToLogin} className="link-span">
                    로그인 하러가기
                </span>
            </p>
        </div>
    );
};

export default RegisterPage;