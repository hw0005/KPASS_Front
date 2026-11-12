import axiosClient from '../../api/axiosClient';

export const cartApi = {
    // 내 장바구니 목록 조회
    getMyCart: () => axiosClient.get("/api/v1/cart"),

    // 장바구니 담기
    addToCart: (data) => axiosClient.post("/api/v1/cart", data),

    // 수량 변경
    updateQuantity: (cartId, quantity) =>
        axiosClient.post("/api/v1/cart/update", null, { params: { cartId, quantity } }),
    // 단건 삭제
    removeCartItem: (cartId) =>
        axiosClient.post("/api/v1/cart/delete", null, { params: { cartId } }),

    // 선택 항목 일괄 삭제
    removeSelected: (cartIds) =>
        axiosClient.post("/api/v1/cart/delete-selected", null, {
            params: { cartIds },
            paramsSerializer: (params) =>
                params.cartIds.map((id) => `cartIds=${id}`).join("&"),
        }),
};