import axiosClient from './axiosClient';

export const authApi = {
    // 로그인 (스프링 @RequestParam 매핑)
    login: async (email, password) => {
        const params = new URLSearchParams();
        params.append('email', email);
        params.append('password', password);

        const response = await axiosClient.post('/api/auth/login', params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        return response.data;
    },

    // 회원가입 (계좌번호 포함 -> 백엔드에서 AES-256 암호화 처리)
    register: async ({ email, password, nickname, accountNumber }) => {
        const params = new URLSearchParams();
        params.append('email', email);
        params.append('password', password);
        params.append('nickname', nickname);
        if (accountNumber) {
            params.append('accountNumber', accountNumber); // 백엔드 encryptedAccountNumber 매핑
        }

        const response = await axiosClient.post('/api/auth/register', params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        return response.data;
    }
};