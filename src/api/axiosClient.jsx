import axios from "axios";

// 띄워둔 백엔드 인스턴스 주소들
const targetServers = ["http://localhost:8080", "http://localhost:8081"];

const axiosClient = axios.create({
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

// 요청 인터셉터: 로드밸런싱 + JWT 토큰 자동 첨부
axiosClient.interceptors.request.use((config) => {
    const randomIndex = Math.floor(Math.random() * targetServers.length);
    config.baseURL = targetServers[randomIndex];

    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(`[Load Balancer] 이번 요청은 ${config.baseURL} 로 향합니다.`);
    return config;
});

axiosClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        console.error("API Error:", error.response?.data || error.message);
        return Promise.reject(error);
    },
);

export default axiosClient;