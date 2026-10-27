import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthContainerPage from '../pages/auth/AuthContainerPage';
import MainPage from '../pages/main/MainPage';

const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* 루트 접속 시 로그인 화면으로 리다이렉트 */}
                <Route path="/" element={<Navigate to="/kpass/login" replace />} />
                
                {/* 인증 관련 라우트 */}
                <Route path="/kpass/login" element={<AuthContainerPage mode="login" />} />
                <Route path="/kpass/register" element={<AuthContainerPage mode="register" />} />
                
                {/* 메인 화면 라우트 */}
                <Route path="/kpass/main" element={<MainPage />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;