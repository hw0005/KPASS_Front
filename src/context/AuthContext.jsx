import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    // 실행 시 localStorage에 토큰 존재 여부 확인
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            setIsLoggedIn(true);
        }
        setLoading(false);
    }, []);

    // 로그인 시 실행
    const login = (token) => {
        localStorage.setItem('accessToken', token || 'kpass_token');
        setIsLoggedIn(true);
    };

    // 로그아웃 시 실행
    const logout = () => {
        localStorage.removeItem('accessToken');
        setIsLoggedIn(false);
    };

    if (loading) return null;

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth는 반드시 AuthProvider 내부에서 사용되어야 합니다.');
    }
    return context;
};



