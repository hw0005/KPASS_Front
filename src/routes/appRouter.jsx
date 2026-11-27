import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// 인증 관련 페이지
import AuthContainerPage from '../pages/auth/AuthContainerPage';
import KakaoCallbackPage from '../pages/auth/KakaoCallbackPage';
import NaverCallbackPage from '../pages/auth/NaverCallbackPage';
import GoogleCallbackPage from '../pages/auth/GoogleCallbackPage';

// -------------------------메인, 상세, 결제 페이지
import MainPage from '../pages/main/MainPage';
import PerformanceDetailPage from '../pages/performance/PerformanceDetailPage';
import CheckoutPage from '../pages/checkout/CheckoutPage';
import PaymentSuccessPage from '../pages/checkout/PaymentSuccessPage';
import PaymentFailPage from '../pages/checkout/PaymentFailPage';
import SearchPage from '../pages/search/SearchPage';
import CartPage from '../pages/cart/CartPage';
import MyReservationsPage from '../pages/user/MyReservationsPage';
//-------------------------메인

//-- 지도
import MapPage from '../components/map/MapPage';




const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* 기본 경로 접속 시 로그인 페이지로 이동 */}
                <Route path="/" element={<Navigate to="/kpass/login" replace />} />

                {/* 1. 로그인 / 회원가입 */}
                <Route path="/kpass/login" element={<AuthContainerPage mode="login" />} />
                <Route path="/kpass/register" element={<AuthContainerPage mode="register" />} />

                {/* 2. 소셜 로그인 OAuth 콜백 */}
                <Route path="/oauth/callback/kakao" element={<KakaoCallbackPage />} />
                <Route path="/oauth/callback/naver" element={<NaverCallbackPage />} />
                <Route path="/oauth/callback/google" element={<GoogleCallbackPage />} />

                {/* 3. 메인 / 상세 / 결제 (URL ID 노출 없는 CGV 스타일) */}
                <Route path="/kpass/search" element={<SearchPage />} />
                <Route path="/kpass/main" element={<MainPage />} />
                <Route path="/kpass/detail" element={<PerformanceDetailPage />} />0
                <Route path="/kpass/checkout" element={<CheckoutPage />} />
                <Route path="/kpass/cart" element={<CartPage />} />
                <Route path="/kpass/reservations" element={<MyReservationsPage />} />

                {/* 지도 */}
                <Route path="/kpass/map" element={<MapPage />} />

                <Route path="/kpass/payment/success" element={<PaymentSuccessPage />} />
                <Route path="/kpass/payment/fail" element={<PaymentFailPage />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;