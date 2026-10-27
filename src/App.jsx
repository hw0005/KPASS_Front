import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthContainerPage from './pages/auth/AuthContainerPage';
import MainPage from './pages/main/MainPage';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* 기본 경로 접속 시 로그인 페이지로 리다이렉트 */}
                <Route path="/" element={<Navigate to="/kpass/login" replace />} />

                {/* URL 경로별 페이지 매핑 */}
                <Route path="/kpass/login" element={<AuthContainerPage mode="login" />} />
                <Route path="/kpass/register" element={<AuthContainerPage mode="register" />} />

                {/* 메인 페이지 라우트 */}
                <Route path="/kpass/main" element={<MainPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;