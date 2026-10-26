import axios from "axios";

// 띄워둔 백엔드 인스턴스 주소들 (추가 가능)
const targetServers = ["http://localhost:8080", "http://localhost:8081"];

const axiosClient = axios.create({
  // baseURL은 비워둡니다 (인터셉터에서 채움)
    headers: {
    "Content-Type": "application/json",
    },
    withCredentials: true,
});

// ★ 핵심: 요청을 보내기 직전에 타겟 서버를 랜덤으로 선택하여 로드밸런싱 구현
axiosClient.interceptors.request.use((config) => {
    const randomIndex = Math.floor(Math.random() * targetServers.length);
    config.baseURL = targetServers[randomIndex];

    // 콘솔에서 이번 요청이 어느 포트로 가는지 확인용 (테스트 끝나면 삭제)
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
