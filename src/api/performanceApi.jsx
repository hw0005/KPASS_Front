import axiosClient from './axiosClient';

export const performanceApi = {
    // params 객체를 이용하면 따옴표 실수 없이 안전하게 파라미터가 전달됩니다.
    getClosingSoonPerformances: async (page = 0, size = 30) => {
        const response = await axiosClient.post('/api/v1/performances/closing-soon', null, {
            params: { page, size }
        });
        return response.data?.data || response.data;
    },

    searchPerformances: async (keyword, category, page = 0, size = 30) => {
        // ⭕ 2번째 인자는 null로 비우고 3번째 인자 { params }로 전달
        const response = await axiosClient.post('/api/v1/performances/search', null, {
            params: {
                title: keyword || undefined,
                category: category === 'ALL' ? undefined : category,
                page: page,
                size: size
            }
        });
        return response.data?.data || response.data;
    }
};