import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import './mainPage.css';

const REGIONS = [
    { label: '서울', value: 'SEOUL' },
    { label: '부산', value: 'BUSAN' },
    { label: '경기', value: 'GYEONGGI' },
    { label: '기타', value: 'OTHER' },
];

const DEFAULT_POSTER = 'https://via.placeholder.com/135x185/1c1e28/8c92a4?text=K-PASS';

const useCarousel = () => {
    const ref = useRef(null);
    const isDown = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);

    const slide = (direction) => {
        if (ref.current) {
            const scrollAmount = direction === 'left' ? -340 : 340;
            ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    const onMouseDown = (e) => {
        isDown.current = true;
        if (ref.current) {
            ref.current.style.cursor = 'grabbing';
            startX.current = e.pageX - ref.current.offsetLeft;
            scrollLeft.current = ref.current.scrollLeft;
        }
    };

    const onMouseLeave = () => {
        isDown.current = false;
        if (ref.current) ref.current.style.cursor = 'grab';
    };

    const onMouseUp = () => {
        isDown.current = false;
        if (ref.current) ref.current.style.cursor = 'grab';
    };

    const onMouseMove = (e) => {
        if (!isDown.current || !ref.current) return;
        e.preventDefault();
        const x = e.pageX - ref.current.offsetLeft;
        const walk = (x - startX.current) * 1.5;
        ref.current.scrollLeft = scrollLeft.current - walk;
    };

    return {
        ref,
        slide,
        dragProps: {
            onMouseDown,
            onMouseLeave,
            onMouseUp,
            onMouseMove,
        }
    };
};

export default function MainPage() {
    const navigate = useNavigate();

    // ⭕ 1. 세션/로컬 스토리지에서 동적으로 닉네임 가져오기 (없으면 기본값 '회원')
    const userNickname = localStorage.getItem('nickname') || sessionStorage.getItem('nickname') || '회원';

    const [data, setData] = useState(null);
    const [selectedRegion, setSelectedRegion] = useState('SEOUL');
    const [loading, setLoading] = useState(true);
    const [heroIndex, setHeroIndex] = useState(0);

    const hotCarousel = useCarousel();
    const regionCarousel = useCarousel();
    const closingCarousel = useCarousel();

    // ⭕ 2. URL 경로에서 식별자 ID 완전 제거 (CGV 스타일: state로만 데이터 전달)
    const handleGoDetail = (performanceItem) => {
        navigate('/kpass/detail', { state: { performance: performanceItem } });
    };

    const handleGoCheckout = (performanceItem) => {
        navigate('/kpass/checkout', { state: { performance: performanceItem } });
    };

    useEffect(() => {
        if (!data?.heroBanners?.length) return;
        const interval = setInterval(() => {
            setHeroIndex((prev) => (prev + 1) % data.heroBanners.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [data?.heroBanners]);

    const fetchMainData = async (region) => {
        try {
            setLoading(true);
            const res = await axiosClient.get('/api/v1/performances/main', { params: { region } });

            if (res && res.data) {
                console.log(res.data);

                setData(res.data);
            } else {
                setData(res);
            }
        } catch (error) {
            console.error('메인 데이터 로딩 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMainData(selectedRegion);
    }, [selectedRegion]);

    if (loading && !data) {
        return (
            <div style={{ backgroundColor: '#0d0e12', minHeight: '100vh', color: '#ffffff' }}>
                <Header nickname={userNickname} />
                <main style={{ textAlign: 'center', paddingTop: '100px' }}>
                    <h3 style={{ color: '#ffffff' }}>K-PASS 티켓 로딩 중...</h3>
                </main>
                <Footer />
            </div>
        );
    }

    const heroBanners = data?.heroBanners || [];
    const hero = heroBanners[heroIndex] || heroBanners[0];

    return (
        <div className="main-layout" style={{ backgroundColor: '#0d0e12', minHeight: '100vh', color: '#ffffff', userSelect: 'none' }}>
            {/* ⭕ 동적 닉네임 바인딩 */}
            <Header nickname={userNickname} />

            <main className="main-content" style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 16px 60px 16px' }}>

                {/* 1. 상단 추천 히어로 배너 */}
                {hero && (
                    <div
                        onClick={() => handleGoDetail(hero)}
                        style={{
                            position: 'relative', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '16px',
                            backgroundColor: '#161820', border: '1px solid #2a2d3d',
                            borderRadius: '10px', padding: '16px', marginBottom: '32px'
                        }}
                    >
                        <img
                            src={hero.posterUrl || DEFAULT_POSTER}
                            alt={hero.title}
                            style={{ width: '75px', height: '105px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }}
                            onError={(e) => { e.target.src = DEFAULT_POSTER; }}
                            onDragStart={(e) => e.preventDefault()}
                        />
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '0.72rem', color: '#818cf8', fontWeight: 'bold' }}>RECOMMENDED</span>
                                <span style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 'bold' }}>
                                    ({heroIndex + 1} / {heroBanners.length})
                                </span>
                            </div>
                            <h2 style={{ margin: '4px 0', fontSize: '1.15rem', color: '#ffffff' }}>{hero.title}</h2>
                            <p style={{ margin: 0, fontSize: '0.82rem', color: '#9ca3af' }}>📍 {hero.venue} | 📅 {hero.startDate} ~ {hero.endDate}</p>
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.95rem', color: '#ff3355', fontWeight: 'bold' }}>
                                {hero.price > 0 ? `${hero.price.toLocaleString()}원~` : '무료'}
                            </p>
                        </div>

                        {heroBanners.length > 1 && (
                            <div style={{ position: 'absolute', bottom: '12px', right: '16px', display: 'flex', gap: '6px' }}>
                                {heroBanners.map((_, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setHeroIndex(idx);
                                        }}
                                        style={{
                                            width: '8px', height: '8px', borderRadius: '50%', border: 'none',
                                            padding: 0, cursor: 'pointer',
                                            backgroundColor: idx === heroIndex ? '#ff3355' : '#4b526d',
                                            transition: 'background-color 0.2s'
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* 2. 🔥 K-PASS HOT TOP 10 */}
                <section style={{ marginBottom: '40px' }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '14px', color: '#ffffff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        🔥 K-PASS HOT TOP 10
                    </h3>

                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <button type="button" className="slide-btn prev" onClick={() => hotCarousel.slide('left')}>‹</button>

                        <div
                            ref={hotCarousel.ref}
                            {...hotCarousel.dragProps}
                            style={{
                                display: 'flex', gap: '14px', overflowX: 'auto',
                                padding: '4px 2px 10px 2px', width: '100%',
                                scrollbarWidth: 'none', cursor: 'grab'
                            }}
                        >
                            {data?.hotPerformances?.map((item, index) => (
                                <div key={item.externalId} style={{
                                    flex: '0 0 135px', width: '135px', minWidth: '135px',
                                    boxSizing: 'border-box', display: 'flex', flexDirection: 'column'
                                }}>
                                    <div
                                        onClick={() => handleGoDetail(item)}
                                        style={{ position: 'relative', width: '135px', height: '185px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#1c1e28', marginBottom: '8px', cursor: 'pointer' }}
                                    >
                                        <span style={{
                                            position: 'absolute', top: '6px', left: '6px',
                                            backgroundColor: '#ff3355', color: '#ffffff', fontSize: '0.68rem',
                                            fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', zIndex: 2
                                        }}>
                                            TOP {index + 1}
                                        </span>
                                        <img
                                            src={item.posterUrl || DEFAULT_POSTER}
                                            alt={item.title}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                            onError={(e) => { e.target.src = DEFAULT_POSTER; }}
                                            onDragStart={(e) => e.preventDefault()}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        <h4
                                            onClick={() => handleGoDetail(item)}
                                            style={{
                                                margin: '0 0 3px 0', fontSize: '0.83rem', fontWeight: 'bold', color: '#ffffff',
                                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer'
                                            }}
                                        >
                                            {item.title}
                                        </h4>
                                        <p style={{
                                            margin: '0 0 3px 0', fontSize: '0.72rem', color: '#9ca3af',
                                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                        }}>
                                            {item.venue}
                                        </p>
                                        <p style={{ margin: '0 0 8px 0', fontSize: '0.82rem', color: '#ff3355', fontWeight: 'bold' }}>
                                            {item.price > 0 ? `${item.price.toLocaleString()}원~` : '무료'}
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() => handleGoCheckout(item)}
                                            style={{
                                                marginTop: 'auto', width: '100%', padding: '6px 0',
                                                background: 'linear-gradient(135deg, #ff3355 0%, #ff007a 100%)',
                                                color: '#ffffff', border: 'none', borderRadius: '5px',
                                                fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer',
                                                boxShadow: '0 2px 8px rgba(255, 51, 85, 0.4)'
                                            }}
                                        >
                                            예매하기
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button type="button" className="slide-btn next" onClick={() => hotCarousel.slide('right')}>›</button>
                    </div>
                </section>

                {/* 3. 📍 지역별 추천 공연 */}
                <section style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <h3 style={{ fontSize: '1.2rem', margin: 0, color: '#ffffff', fontWeight: 'bold' }}>📍 지역별 추천 공연</h3>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            {REGIONS.map((tab) => (
                                <button
                                    key={tab.value}
                                    onClick={() => setSelectedRegion(tab.value)}
                                    style={{
                                        padding: '4px 12px', borderRadius: '16px', border: '1px solid #2a2d3d',
                                        backgroundColor: selectedRegion === tab.value ? '#6c5ce7' : '#161820',
                                        color: '#ffffff', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer'
                                    }}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <button type="button" className="slide-btn prev" onClick={() => regionCarousel.slide('left')}>‹</button>

                        <div
                            ref={regionCarousel.ref}
                            {...regionCarousel.dragProps}
                            style={{
                                display: 'flex', gap: '14px', overflowX: 'auto',
                                padding: '4px 2px 10px 2px', width: '100%',
                                scrollbarWidth: 'none', cursor: 'grab'
                            }}
                        >
                            {data?.regionalPerformances?.map((item) => (
                                <div key={item.externalId} style={{
                                    flex: '0 0 135px', width: '135px', minWidth: '135px',
                                    boxSizing: 'border-box', display: 'flex', flexDirection: 'column'
                                }}>
                                    <div
                                        onClick={() => handleGoDetail(item)}
                                        style={{ position: 'relative', width: '135px', height: '185px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#1c1e28', marginBottom: '8px', cursor: 'pointer' }}
                                    >
                                        <span style={{
                                            position: 'absolute', top: '6px', left: '6px',
                                            backgroundColor: 'rgba(0,0,0,0.75)', color: '#a5b4fc', fontSize: '0.68rem',
                                            fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', zIndex: 2
                                        }}>
                                            {item.region}
                                        </span>
                                        <img
                                            src={item.posterUrl || DEFAULT_POSTER}
                                            alt={item.title}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                            onError={(e) => { e.target.src = DEFAULT_POSTER; }}
                                            onDragStart={(e) => e.preventDefault()}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        <h4
                                            onClick={() => handleGoDetail(item)}
                                            style={{
                                                margin: '0 0 3px 0', fontSize: '0.83rem', fontWeight: 'bold', color: '#ffffff',
                                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer'
                                            }}
                                        >
                                            {item.title}
                                        </h4>
                                        <p style={{
                                            margin: '0 0 8px 0', fontSize: '0.72rem', color: '#9ca3af',
                                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                        }}>
                                            {item.venue}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => handleGoDetail(item)}
                                            style={{
                                                marginTop: 'auto', width: '100%', padding: '6px 0',
                                                backgroundColor: '#2a2d3d', color: '#ffffff', border: 'none', borderRadius: '5px',
                                                fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer'
                                            }}
                                        >
                                            상세보기
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button type="button" className="slide-btn next" onClick={() => regionCarousel.slide('right')}>›</button>
                    </div>
                </section>

                {/* 4. ⏳ 마감 임박 섹션 */}
                <section style={{ marginBottom: '40px' }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '14px', color: '#ffffff', fontWeight: 'bold' }}>⏳ 마감 임박! 놓치지 마세요</h3>

                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <button type="button" className="slide-btn prev" onClick={() => closingCarousel.slide('left')}>‹</button>

                        <div
                            ref={closingCarousel.ref}
                            {...closingCarousel.dragProps}
                            style={{
                                display: 'flex', gap: '14px', overflowX: 'auto',
                                padding: '4px 2px 10px 2px', width: '100%',
                                scrollbarWidth: 'none', cursor: 'grab'
                            }}
                        >
                            {data?.closingSoonPerformances?.map((item) => (
                                <div key={item.externalId} style={{
                                    flex: '0 0 135px', width: '135px', minWidth: '135px',
                                    boxSizing: 'border-box', display: 'flex', flexDirection: 'column'
                                }}>
                                    <div
                                        onClick={() => handleGoDetail(item)}
                                        style={{ position: 'relative', width: '135px', height: '185px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#1c1e28', marginBottom: '8px', cursor: 'pointer' }}
                                    >
                                        <span style={{
                                            position: 'absolute', top: '6px', left: '6px',
                                            backgroundColor: '#eb4d4b', color: '#ffffff', fontSize: '0.68rem',
                                            fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', zIndex: 2
                                        }}>
                                            마감임박
                                        </span>
                                        <img
                                            src={item.posterUrl || DEFAULT_POSTER}
                                            alt={item.title}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                            onError={(e) => { e.target.src = DEFAULT_POSTER; }}
                                            onDragStart={(e) => e.preventDefault()}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        <h4
                                            onClick={() => handleGoDetail(item)}
                                            style={{
                                                margin: '0 0 3px 0', fontSize: '0.83rem', fontWeight: 'bold', color: '#ffffff',
                                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer'
                                            }}
                                        >
                                            {item.title}
                                        </h4>
                                        <p style={{ margin: '0 0 8px 0', fontSize: '0.72rem', color: '#ff3355', fontWeight: 'bold' }}>
                                            ~{item.endDate} 마감
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => handleGoCheckout(item)}
                                            style={{
                                                marginTop: 'auto', width: '100%', padding: '6px 0',
                                                background: 'linear-gradient(135deg, #ff3355 0%, #ff007a 100%)',
                                                color: '#ffffff', border: 'none', borderRadius: '5px',
                                                fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer',
                                                boxShadow: '0 2px 8px rgba(255, 51, 85, 0.4)'
                                            }}
                                        >
                                            마감전 예매
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button type="button" className="slide-btn next" onClick={() => closingCarousel.slide('right')}>›</button>
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    );
}   