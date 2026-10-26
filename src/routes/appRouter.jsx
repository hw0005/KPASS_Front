import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainPage from '../pages/main/MainPage';

const AppRouter = () => {
    return (
    <BrowserRouter>
        <Routes>
        <Route path="/" element={<MainPage />} />
        {/* 추후 추가될 도메인 라우트 위치 */}
        {/* <Route path="/login" element={<LoginPage />} /> */}
        {/* <Route path="/performance" element={<PerformancePage />} /> */}
        </Routes>
    </BrowserRouter>
    );
};

export default AppRouter;