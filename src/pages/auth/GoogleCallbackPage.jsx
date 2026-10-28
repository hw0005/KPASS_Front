import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { socialLoginApi, completeOAuthRegisterApi } from '../../api/authApi';

export default function GoogleCallbackPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [socialData, setSocialData] = useState(null);
    const [showAccountInput, setShowAccountInput] = useState(false);
    const [accountNumber, setAccountNumber] = useState('');

    useEffect(() => {
        const code = searchParams.get('code');

        if (code) {
            socialLoginApi('google', code)
                .then((res) => {
                    if (res && res.isRegistered) {
                        localStorage.setItem('accessToken', res.accessToken);
                        navigate('/kpass/main', { replace: true });
                    } else if (res && res.isRegistered === false) {
                        setSocialData(res);
                        setShowAccountInput(true);
                    }
                })
                .catch((err) => {
                    console.error("구글 로그인 실패 에러:", err);
                });
        }
    }, [searchParams, navigate]);

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();

        if (!accountNumber.trim()) {
            alert("계좌번호를 입력해주세요.");
            return;
        }

        try {
            const requestData = {
                provider: socialData.provider,
                providerId: socialData.providerId,
                email: socialData.email,
                nickname: socialData.nickname,
                profileImage: socialData.profileImage,
                accountNumber: accountNumber
            };

            const res = await completeOAuthRegisterApi(requestData);

            if (res && res.accessToken) {
                alert("회원가입이 완료되었습니다!");
                localStorage.setItem('accessToken', res.accessToken);
                navigate('/kpass/main', { replace: true });
            }
        } catch (error) {
            console.error("회원가입 처리 중 오류 발생:", error);
            alert("회원가입 처리에 실패했습니다.");
        }
    };

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            {!showAccountInput && <h2>구글 로그인 처리 중입니다...</h2>}

            {showAccountInput && (
                <div className="account-modal" style={{ border: '1px solid #ccc', padding: '30px', borderRadius: '10px' }}>
                    <h2>K-PASS 추가 정보 입력</h2>
                    <p><strong>{socialData?.nickname}</strong>님 환영합니다!</p>
                    <p>K-PASS 환급 서비스를 위해 계좌번호를 입력해 주세요.</p>

                    <form onSubmit={handleRegisterSubmit}>
                        <div style={{ marginBottom: '15px' }}>
                            <input
                                type="text"
                                placeholder="계좌번호를 입력하세요 (- 제외)"
                                value={accountNumber}
                                onChange={(e) => setAccountNumber(e.target.value)}
                                style={{ width: '80%', padding: '10px', fontSize: '16px' }}
                            />
                        </div>
                        <button type="submit" style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
                            가입 완료 및 서비스 시작
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}