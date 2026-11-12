import axiosClient from '../../api/axiosClient';

export const cartApi = {
    // 내 장바구니 목록 조회
    getMyCart: async () => {
        const response = await axiosClient.get('/api/v1/cart');
        return response.data?.data || [];
    },

    // 장바구니 담기
    addToCart: async (performance, quantity = 1) => {
        const response = await axiosClient.post('/api/v1/cart', {
            performanceId: performance.id || performance.performanceId || null,
            externalId: performance.externalId || null,
            quantity
        });
        return response.data;
    },

    // 수량 변경
    updateQuantity: async (cartId, quantity) => {
        const response = await axiosClient.patch(`/api/v1/cart/${cartId}`, null, {
            params: { quantity }
        });
        return response.data;
    },

    // 단건 삭제
    removeCartItem: async (cartId) => {
        const response = await axiosClient.delete(`/api/v1/cart/${cartId}`);
        return response.data;
    },

    // 선택 항목 일괄 삭제
    removeSelected: async (cartIds) => {
        const response = await axiosClient.post('/api/v1/cart/delete-selected', cartIds);
        return response.data;
    }
};