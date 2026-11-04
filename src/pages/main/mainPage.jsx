import React, { useState, useEffect, useRef } from 'react';
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

export default function MainPage() {
    const [data, setData] = useState(null);
    const [selectedRegion, setSelectedRegion] = useState('SEOUL');
    const [loading, setLoading] = useState(true);

    const hotRef = useRef(null);
    const regionRef = useRef(null);
    const closingRef = useRef(null);

    const fetchMainData = async (region) => {
        try {
            setLoading(true);
            const res = await axiosClient.get('/api/v1/performances/main', { params: { region } });
            setData(res);
        } catch (error) {
            console.error('메인 데이터 로딩 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMainData(selectedRegion);
    }, [selectedRegion]);

    const slide = (ref, direction) => {
        if (ref.current) {
            const scrollAmount = direction === 'left' ? -340 : 340;
            ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if (loading && !data) {
        return (
            <div style={{ backgroundColor: '#0d0e12', minHeight: '100vh', color: '#ffffff' }}>
                <Header />
                <main style={{ textAlign: 'center', paddingTop: '100px' }}>
                    <h3>K-PASS 티켓 로딩 중...</h3>
                </main>
                <Footer />
            </div>
        );
    }

    const hero = data?.heroBanners?.[0];

    return (
        /* ⭕ 전체 메인 레이아웃에 어두운 배경 강제 적용 */
        <div className="main-layout" style={{ backgroundColor: '#0d0e12', minHeight: '100vh', color: '#ffffff' }}>
            <Header nickname="회원" />

            <main className="main-content" style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 16px 60px 16px' }}>

                {/* 1. 상단 추천 히어로 배너 */}
                {hero && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '16px',
                        backgroundColor: '#161820', border: '1px solid #2a2d3d',
                        borderRadius: '10px', padding: '16px', marginBottom: '32px'
                    }}>
                        <img
                            src={hero.posterUrl || DEFAULT_POSTER}
                            alt={hero.title}
                            style={{ width: '75px', height: '105px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }}
                            onError={(e) => { e.target.src = DEFAULT_POSTER; }}
                        />
                        <div>
                            <span style={{ fontSize: '0.72rem', color: '#818cf8', fontWeight: 'bold' }}>RECOMMENDED</span>
                            <h2 style={{ margin: '4px 0', fontSize: '1.15rem', color: '#ffffff' }}>{hero.title}</h2>
                            <p style={{ margin: 0, fontSize: '0.82rem', color: '#9ca3af' }}>📍 {hero.venue} | 📅 {hero.startDate} ~ {hero.endDate}</p>
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.95rem', color: '#ff3355', fontWeight: 'bold' }}>
                                {hero.price > 0 ? `${hero.price.toLocaleString()}원~` : '무료'}
                            </p>
                        </div>
                    </div>
                )}

                {/* 2. 🔥 K-PASS HOT TOP 10 (제목 색상 또렷하게 수정) */}
                <section style={{ marginBottom: '40px' }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '14px', color: '#ffffff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        🔥 K-PASS HOT TOP 10
                    </h3>

                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <button type="button" className="slide-btn prev" onClick={() => slide(hotRef, 'left')}>‹</button>

                        <div ref={hotRef} style={{
                            display: 'flex', gap: '14px', overflowX: 'auto',
                            scrollBehavior: 'smooth', padding: '4px 2px 10px 2px', width: '100%',
                            scrollbarWidth: 'none'
                        }}>
                            {data?.hotPerformances?.map((item, index) => (
                                <div key={item.externalId} style={{
                                    flex: '0 0 135px', width: '135px', minWidth: '135px',
                                    boxSizing: 'border-box', cursor: 'pointer',
                                    display: 'flex', flexDirection: 'column'
                                }}>
                                    <div style={{ position: 'relative', width: '135px', height: '185px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#1c1e28', marginBottom: '8px' }}>
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
                                        />
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        <h4 style={{
                                            margin: '0 0 3px 0', fontSize: '0.83rem', fontWeight: 'bold', color: '#ffffff',
                                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                        }}>
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

                                        <button type="button" style={{
                                            marginTop: 'auto', width: '100%', padding: '6px 0',
                                            background: 'linear-gradient(135deg, #ff3355 0%, #ff007a 100%)',
                                            color: '#ffffff', border: 'none', borderRadius: '5px',
                                            fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer',
                                            boxShadow: '0 2px 8px rgba(255, 51, 85, 0.4)'
                                        }}>
                                            예매하기
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button type="button" className="slide-btn next" onClick={() => slide(hotRef, 'right')}>›</button>
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
                        <button type="button" className="slide-btn prev" onClick={() => slide(regionRef, 'left')}>‹</button>

                        <div ref={regionRef} style={{
                            display: 'flex', gap: '14px', overflowX: 'auto',
                            scrollBehavior: 'smooth', padding: '4px 2px 10px 2px', width: '100%',
                            scrollbarWidth: 'none'
                        }}>
                            {data?.regionalPerformances?.map((item) => (
                                <div key={item.externalId} style={{
                                    flex: '0 0 135px', width: '135px', minWidth: '135px',
                                    boxSizing: 'border-box', cursor: 'pointer',
                                    display: 'flex', flexDirection: 'column'
                                }}>
                                    <div style={{ position: 'relative', width: '135px', height: '185px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#1c1e28', marginBottom: '8px' }}>
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
                                        />
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        <h4 style={{
                                            margin: '0 0 3px 0', fontSize: '0.83rem', fontWeight: 'bold', color: '#ffffff',
                                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                        }}>
                                            {item.title}
                                        </h4>
                                        <p style={{
                                            margin: '0 0 8px 0', fontSize: '0.72rem', color: '#9ca3af',
                                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                        }}>
                                            {item.venue}
                                        </p>
                                        <button type="button" style={{
                                            marginTop: 'auto', width: '100%', padding: '6px 0',
                                            backgroundColor: '#2a2d3d', color: '#ffffff', border: 'none', borderRadius: '5px',
                                            fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer'
                                        }}>
                                            상세보기
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button type="button" className="slide-btn next" onClick={() => slide(regionRef, 'right')}>›</button>
                    </div>
                </section>

                {/* 4. ⏳ 마감 임박 섹션 */}
                <section style={{ marginBottom: '40px' }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '14px', color: '#ffffff', fontWeight: 'bold' }}>⏳ 마감 임박! 놓치지 마세요</h3>

                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <button type="button" className="slide-btn prev" onClick={() => slide(closingRef, 'left')}>‹</button>

                        <div ref={closingRef} style={{
                            display: 'flex', gap: '14px', overflowX: 'auto',
                            scrollBehavior: 'smooth', padding: '4px 2px 10px 2px', width: '100%',
                            scrollbarWidth: 'none'
                        }}>
                            {data?.closingSoonPerformances?.map((item) => (
                                <div key={item.externalId} style={{
                                    flex: '0 0 135px', width: '135px', minWidth: '135px',
                                    boxSizing: 'border-box', cursor: 'pointer',
                                    display: 'flex', flexDirection: 'column'
                                }}>
                                    <div style={{ position: 'relative', width: '135px', height: '185px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#1c1e28', marginBottom: '8px' }}>
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
                                        />
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        <h4 style={{
                                            margin: '0 0 3px 0', fontSize: '0.83rem', fontWeight: 'bold', color: '#ffffff',
                                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                        }}>
                                            {item.title}
                                        </h4>
                                        <p style={{ margin: '0 0 8px 0', fontSize: '0.72rem', color: '#ff3355', fontWeight: 'bold' }}>
                                            ~{item.endDate} 마감
                                        </p>
                                        <button type="button" style={{
                                            marginTop: 'auto', width: '100%', padding: '6px 0',
                                            background: 'linear-gradient(135deg, #ff3355 0%, #ff007a 100%)',
                                            color: '#ffffff', border: 'none', borderRadius: '5px',
                                            fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer',
                                            boxShadow: '0 2px 8px rgba(255, 51, 85, 0.4)'
                                        }}>
                                            마감전 예매
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button type="button" className="slide-btn next" onClick={() => slide(closingRef, 'right')}>›</button>
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    );
}