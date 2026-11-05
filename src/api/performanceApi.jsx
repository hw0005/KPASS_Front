import axiosClient from './axiosClient';

export const performanceApi = {
    // ⭕ [수정] params 객체를 이용하면 따옴표 실수 없이 안전하게 파라미터가 전달됩니다.
    getClosingSoonPerformances: async (page = 0, size = 30) => {
        const response = await axiosClient.post('/api/v1/performances/closing-soon', null, {
            params: { page, size }
        });
        return response.data;
    },

    searchPerformances: async (keyword, category, page = 0, size = 30) => {
        const response = await axiosClient.post('/api/v1/performances/search', null, {
            params: {
                title: keyword,
                category: category,
                page: page,
                size: size
            }
        });
        return response.data;
    }
};