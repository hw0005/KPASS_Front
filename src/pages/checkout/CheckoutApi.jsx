import axiosClient from '../../api/axiosClient';

const CheckoutApi = {
    // 1. 주문 생성 및 5분 티켓 선점 (백엔드 Redisson 분산락 구간)
    createOrder: (orderData) => {
        return axiosClient.post('/api/v1/orders', orderData);
    },

    // 2. 토스페이먼츠 인증 완료 후 백엔드 최종 결제 승인 (Lettuce 멱등성 락 + 보상 트랜잭션 구간)
    confirmPayment: (confirmData) => {
        return axiosClient.post('/api/v1/payments/confirm', confirmData);
    },

    // 3. 5분 시간 초과 또는 사용자 취소 시 선점 해제
    cancelOrder: (orderId) => {
        return axiosClient.post(`/api/v1/orders/${orderId}/cancel`);
    },
};

export default CheckoutApi;