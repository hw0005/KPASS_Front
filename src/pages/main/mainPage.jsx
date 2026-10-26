import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

const MainPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axiosClient.get('/api/test')
            .then((res) => {
                setData(res);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    return (
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
            <h1>🚀 K-Pass AI Platform</h1>
            <p style={{ color: '#666', marginTop: '8px' }}>Vite React + Spring Boot 3 계층 연동 완료</p>
            <hr style={{ margin: '20px 0' }} />

            <h3>백엔드 (포트 8080) 응답 결과:</h3>
            {loading ? (
                <p>백엔드 서버 연동 중...</p>
            ) : data ? (
                <pre style={{ background: '#e9ecef', padding: '15px', borderRadius: '6px', marginTop: '10px' }}>
                    {JSON.stringify(data, null, 2)}
                </pre>
            ) : (
                <p style={{ color: 'red', marginTop: '10px' }}>⚠️ 백엔드 서버가 꺼져 있거나 연결할 수 없습니다.</p>
            )}
        </div>
    );
};

export default MainPage;