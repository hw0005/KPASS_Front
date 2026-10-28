import axiosClient from './axiosClient';

export const authApi = {
    login: async (email, password) => {
        const params = new URLSearchParams();
        params.append('email', email);
        params.append('password', password);

        const response = await axiosClient.post('/api/auth/login', params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        return response; // .data 제거
    },

    register: async ({ email, password, nickname, accountNumber }) => {
        const params = new URLSearchParams();
        params.append('email', email);
        params.append('password', password);
        params.append('nickname', nickname);
        if (accountNumber) {
            params.append('accountNumber', accountNumber);
        }

        const response = await axiosClient.post('/api/auth/register', params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        return response; // .data 제거
    }
};

// 1단계: 소셜 인가 코드 전달
export const socialLoginApi = async (provider, code) => {
    const response = await axiosClient.post(`/api/v1/auth/${provider}`, { code });
    return response; // ★ response.data 대신 response 리턴!
};

// 2단계: 계좌번호 포함한 소셜 회원가입 완료
export const completeOAuthRegisterApi = async (socialRegisterData) => {
    const response = await axiosClient.post('/api/v1/auth/oauth/register', socialRegisterData);
    return response; // ★ response.data 대신 response 리턴!
};