import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import Header from '../../components/common/Header';

const CATEGORIES = [
    { label: '전체', value: 'ALL' },
    { label: '뮤지컬', value: 'MUSICAL' },
    { label: '연극', value: 'THEATER' },
    { label: '콘서트', value: 'CONCERT' },
    { label: '클래식', value: 'CLASSIC' },
    { label: '국악', value: 'KOREAN_MUSIC' },
];

const DEFAULT_POSTER = 'https://via.placeholder.com/135x185/1c1e28/8c92a4?text=K-PASS';
const SEOUL_CENTER = { lat: 37.5665, lng: 126.9780 };

export default function MapPage() {
    const navigate = useNavigate();
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);
    const boundsRef = useRef(null);

    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [performances, setPerformances] = useState([]);
    const [selectedVenueGroup, setSelectedVenueGroup] = useState(null);
    const [loading, setLoading] = useState(false);

    // 📱 모바일 화면 감지 (768px 이하)
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleGoDetail = (performanceItem) => {
        navigate('/kpass/detail', { state: { performance: performanceItem } });
    };

    // 전국 전체보기 버튼 핸들러
    const handleResetBounds = () => {
        const map = mapInstanceRef.current;
        if (map && boundsRef.current) {
            setSelectedVenueGroup(null);
            map.setBounds(boundsRef.current);
        }
    };

    // 서울 중심으로 복귀 핸들러
    const handleFocusSeoul = () => {
        const map = mapInstanceRef.current;
        if (map && window.kakao) {
            setSelectedVenueGroup(null);
            map.setLevel(8);
            map.panTo(new window.kakao.maps.LatLng(SEOUL_CENTER.lat, SEOUL_CENTER.lng));
        }
    };

    // 1. 카테고리 변경 시 백엔드에서 향후 1개월 이내 공연 조회
    useEffect(() => {
        const fetchMapPerformances = async () => {
            setLoading(true);
            setSelectedVenueGroup(null);
            try {
                const res = await axiosClient.get('/api/v1/performances/map', {
                    params: { category: selectedCategory },
                });
                const list = res?.data || res || [];
                setPerformances(Array.isArray(list) ? list : []);
            } catch (error) {
                console.error('지도 공연 데이터 조회 실패:', error);
                setPerformances([]);
            } finally {
                setLoading(false);
            }
        };

        fetchMapPerformances();
    }, [selectedCategory]);

    // 2. 동일 공연장(venue) 기준으로 공연 묶기
    const venueGroups = useMemo(() => {
        const map = new Map();
        performances.forEach((item) => {
            if (!item.latitude || !item.longitude) return;

            if (!map.has(item.venue)) {
                map.set(item.venue, {
                    venue: item.venue,
                    address: item.address,
                    latitude: item.latitude,
                    longitude: item.longitude,
                    items: [],
                });
            }
            map.get(item.venue).items.push(item);
        });
        return Array.from(map.values());
    }, [performances]);

    // 3. 카카오맵 최초 1회 초기화 (서울 중심 기본 뷰)
    useEffect(() => {
        if (!window.kakao || !window.kakao.maps || !mapContainerRef.current) return;

        window.kakao.maps.load(() => {
            const options = {
                center: new window.kakao.maps.LatLng(SEOUL_CENTER.lat, SEOUL_CENTER.lng),
                level: 8,
            };
            mapInstanceRef.current = new window.kakao.maps.Map(mapContainerRef.current, options);
        });
    }, []);

    // 4. 필터링된 공연장 그룹 변경 시 마커 갱신
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !window.kakao) return;

        markersRef.current.forEach((marker) => marker.setMap(null));
        markersRef.current = [];

        if (venueGroups.length === 0) return;

        const bounds = new window.kakao.maps.LatLngBounds();

        venueGroups.forEach((group) => {
            const position = new window.kakao.maps.LatLng(group.latitude, group.longitude);
            const marker = new window.kakao.maps.Marker({
                map,
                position,
                title: `${group.venue} (${group.items.length}건)`,
            });

            window.kakao.maps.event.addListener(marker, 'click', () => {
                setSelectedVenueGroup(group);

                const currentLevel = map.getLevel();
                if (currentLevel > 4) {
                    map.setLevel(4, {
                        anchor: position,
                        animate: { duration: 300 },
                    });
                } else {
                    map.panTo(position);
                }
            });

            markersRef.current.push(marker);
            bounds.extend(position);
        });

        boundsRef.current = bounds;
    }, [venueGroups]);

    return (
        <div
            style={{
                backgroundColor: '#0d0e12',
                minHeight: '100vh',
                height: isMobile ? 'auto' : '100vh',
                display: 'flex',
                flexDirection: 'column',
                color: '#ffffff',
                userSelect: 'none',
                overflow: isMobile ? 'visible' : 'hidden',
            }}
        >
            <Header />

            {/* 메인 컨테이너 (PC: 좌우 분할 / 모바일: 상하 분할) */}
            <main
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: isMobile ? '12px' : '16px',
                    padding: isMobile ? '10px' : '16px',
                    minHeight: 0,
                }}
            >
                {/* 카카오맵 영역 */}
                <div
                    style={{
                        flex: isMobile ? 'none' : 2.3,
                        height: isMobile ? '54vh' : '100%',
                        position: 'relative',
                        borderRadius: '14px',
                        overflow: 'hidden',
                        border: '1px solid #2a2d3d',
                        backgroundColor: '#161820',
                    }}
                >
                    {/* 지도 위 상단 플로팅 헤더 & 카테고리 바 */}
                    <div
                        style={{
                            position: 'absolute',
                            top: isMobile ? '10px' : '16px',
                            left: isMobile ? '10px' : '16px',
                            right: isMobile ? '10px' : '16px',
                            zIndex: 10,
                            backgroundColor: 'rgba(13, 14, 18, 0.88)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid #2a2d3d',
                            borderRadius: '12px',
                            padding: isMobile ? '10px 12px' : '14px 18px',
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: isMobile ? '8px' : '12px',
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
                        }}
                    >
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <h2 style={{ margin: 0, fontSize: isMobile ? '1rem' : '1.15rem', fontWeight: 'bold' }}>
                                    📍 전국 공연장 지도
                                </h2>
                                <span
                                    style={{
                                        fontSize: isMobile ? '0.75rem' : '0.84rem',
                                        padding: isMobile ? '3px 9px' : '4px 12px',
                                        borderRadius: '20px',
                                        backgroundColor: 'rgba(255, 51, 85, 0.18)',
                                        border: '1px solid rgba(255, 51, 85, 0.45)',
                                        color: '#ff4d6d',
                                        fontWeight: 'bold',
                                    }}
                                >
                                    {isMobile
                                        ? `1개월 이내 · ${venueGroups.length}곳`
                                        : `향후 1개월 이내 · 공연장 ${venueGroups.length}곳 · 공연 ${performances.length}건`}
                                </span>
                            </div>
                            {!isMobile && (
                                <p style={{ margin: '5px 0 0 0', fontSize: '0.78rem', color: '#9ca3af' }}>
                                    카테고리를 선택하거나 지도 위 핀을 클릭하면 해당 지역으로 확대되며 공연 목록이 열립니다.
                                </p>
                            )}
                        </div>

                        {/* 카테고리 버튼 그룹 (모바일에서는 가로 스크롤 한 줄) */}
                        <div
                            style={{
                                display: 'flex',
                                gap: '6px',
                                width: isMobile ? '100%' : 'auto',
                                overflowX: isMobile ? 'auto' : 'visible',
                                flexWrap: isMobile ? 'nowrap' : 'wrap',
                                scrollbarWidth: 'none',
                            }}
                        >
                            {CATEGORIES.map((tab) => {
                                const isSelected = selectedCategory === tab.value;
                                return (
                                    <button
                                        key={tab.value}
                                        type="button"
                                        onClick={() => setSelectedCategory(tab.value)}
                                        style={{
                                            padding: isMobile ? '5px 12px' : '6px 14px',
                                            borderRadius: '20px',
                                            border: isSelected ? '1px solid #ff3355' : '1px solid #2a2d3d',
                                            backgroundColor: isSelected ? '#ff3355' : '#1c1e28',
                                            color: '#ffffff',
                                            fontSize: isMobile ? '0.76rem' : '0.8rem',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap',
                                            flexShrink: 0,
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 좌측 하단 빠른 시점 이동 버튼 그룹 */}
                    <div
                        style={{
                            position: 'absolute',
                            bottom: isMobile ? '12px' : '22px',
                            left: isMobile ? '10px' : '16px',
                            zIndex: 10,
                            display: 'flex',
                            gap: '8px',
                        }}
                    >
                        <button
                            type="button"
                            onClick={handleFocusSeoul}
                            style={{
                                padding: isMobile ? '6px 10px' : '8px 14px',
                                borderRadius: '10px',
                                border: '1px solid #2a2d3d',
                                backgroundColor: 'rgba(13, 14, 18, 0.9)',
                                color: '#ffffff',
                                fontSize: isMobile ? '0.74rem' : '0.8rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                            }}
                        >
                            🏙️ 서울 중심
                        </button>
                        <button
                            type="button"
                            onClick={handleResetBounds}
                            style={{
                                padding: isMobile ? '6px 10px' : '8px 14px',
                                borderRadius: '10px',
                                border: '1px solid #2a2d3d',
                                backgroundColor: 'rgba(13, 14, 18, 0.9)',
                                color: '#ffffff',
                                fontSize: isMobile ? '0.74rem' : '0.8rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                            }}
                        >
                            🗺️ 전국 전체보기
                        </button>
                    </div>

                    {/* 카카오맵 실제 렌더링 영역 */}
                    <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
                </div>

                {/* 공연장 상세 리스트 패널 */}
                <div
                    style={{
                        flex: 1,
                        minWidth: isMobile ? '100%' : '340px',
                        maxWidth: isMobile ? '100%' : '440px',
                        minHeight: isMobile ? '280px' : 'auto',
                        backgroundColor: '#161820',
                        borderRadius: '14px',
                        border: '1px solid #2a2d3d',
                        padding: isMobile ? '16px' : '20px',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    {loading ? (
                        <div style={{ margin: 'auto', textAlign: 'center', color: '#9ca3af', padding: '30px 0' }}>
                            공연장 정보를 불러오는 중...
                        </div>
                    ) : !selectedVenueGroup ? (
                        <div style={{ margin: 'auto', textAlign: 'center', color: '#9ca3af', padding: '24px 16px' }}>
                            <p style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#ffffff', marginBottom: '8px' }}>
                                지도에서 공연장 핀을 클릭해 주세요
                            </p>
                            <p style={{ fontSize: '0.8rem', margin: 0, lineHeight: 1.5 }}>
                                핀을 클릭하면 해당 공연장 위치로 자동 확대되며,<br />
                                진행 중인 공연 목록을 바로 확인할 수 있습니다.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div
                                style={{
                                    borderBottom: '1px solid #2a2d3d',
                                    paddingBottom: '12px',
                                    marginBottom: '14px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    gap: '10px',
                                }}
                            >
                                <div>
                                    <h3 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', color: '#ffffff' }}>
                                        {selectedVenueGroup.venue}
                                    </h3>
                                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#9ca3af' }}>
                                        📍 {selectedVenueGroup.address}
                                    </p>
                                </div>
                                <span
                                    style={{
                                        fontSize: '0.74rem',
                                        padding: '3px 9px',
                                        borderRadius: '12px',
                                        backgroundColor: '#252836',
                                        color: '#818cf8',
                                        fontWeight: 'bold',
                                        flexShrink: 0,
                                    }}
                                >
                                    {selectedVenueGroup.items.length}건
                                </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {selectedVenueGroup.items.map((perf) => (
                                    <div
                                        key={perf.externalId || perf.id}
                                        onClick={() => handleGoDetail(perf)}
                                        style={{
                                            display: 'flex',
                                            gap: '12px',
                                            padding: '10px',
                                            backgroundColor: '#1c1e28',
                                            border: '1px solid #2a2d3d',
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            transition: 'border-color 0.2s',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = '#ff3355';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = '#2a2d3d';
                                        }}
                                    >
                                        <img
                                            src={perf.posterUrl || DEFAULT_POSTER}
                                            alt={perf.title}
                                            onError={(e) => { e.target.src = DEFAULT_POSTER; }}
                                            style={{
                                                width: '68px',
                                                height: '92px',
                                                objectFit: 'cover',
                                                borderRadius: '6px',
                                                flexShrink: 0,
                                            }}
                                        />
                                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                            <span style={{ fontSize: '0.7rem', color: '#818cf8', fontWeight: 'bold' }}>
                                                {perf.category}
                                            </span>
                                            <h4
                                                style={{
                                                    margin: '3px 0 5px 0',
                                                    fontSize: '0.9rem',
                                                    fontWeight: 'bold',
                                                    color: '#ffffff',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}
                                            >
                                                {perf.title}
                                            </h4>
                                            <p style={{ margin: '0 0 6px 0', fontSize: '0.75rem', color: '#9ca3af' }}>
                                                📅 {perf.startDate} ~ {perf.endDate}
                                            </p>
                                            <p style={{ margin: 0, fontSize: '0.86rem', color: '#ff3355', fontWeight: 'bold' }}>
                                                {perf.price > 0 ? `${perf.price.toLocaleString()}원~` : '무료'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}