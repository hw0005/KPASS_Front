import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';

const CATEGORIES = [
    { label: '전체', value: 'ALL' },
    { label: '뮤지컬', value: 'MUSICAL' },
    { label: '연극', value: 'THEATER' },
    { label: '콘서트', value: 'CONCERT' },
    { label: '클래식', value: 'CLASSIC' },
    { label: '국악', value: 'KOREAN_MUSIC' },
];

const DEFAULT_POSTER = 'https://via.placeholder.com/135x185/1c1e28/8c92a4?text=K-PASS';

export default function MapPage() {
    const navigate = useNavigate();
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);

    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [performances, setPerformances] = useState([]);
    const [selectedVenueGroup, setSelectedVenueGroup] = useState(null);
    const [loading, setLoading] = useState(false);

    // MainPage와 동일한 상세페이지 이동 핸들러 (URL에 ID 미노출)
    const handleGoDetail = (performanceItem) => {
        navigate('/kpass/detail', { state: { performance: performanceItem } });
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

    // 2. 동일 공연장(venue) 기준으로 공연 묶기 (한 공연장에서 여러 공연이 열릴 수 있음)
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

    // 3. 카카오맵 최초 1회 초기화
    useEffect(() => {
        if (!window.kakao || !window.kakao.maps || !mapContainerRef.current) return;

        const options = {
            center: new window.kakao.maps.LatLng(37.5665, 126.9780), // 서울 시청 기본 좌표
            level: 7,
        };
        mapInstanceRef.current = new window.kakao.maps.Map(mapContainerRef.current, options);
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
                map.panTo(position);
            });

            markersRef.current.push(marker);
            bounds.extend(position);
        });

        map.setBounds(bounds);
    }, [venueGroups]);

    return (
        <div style={{ backgroundColor: '#0d0e12', minHeight: '100vh', color: '#ffffff', userSelect: 'none' }}>
            <Header />

            <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px 60px 16px' }}>
                <div style={{ marginBottom: '18px' }}>
                    <h2 style={{ margin: '0 0 6px 0', fontSize: '1.35rem', fontWeight: 'bold' }}>
                        📍 전국 공연장 지도 (향후 1개월 이내)
                    </h2>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#9ca3af' }}>
                        카테고리를 선택하고 지도 위 마커를 클릭하면 해당 공연장에서 진행되는 공연을 바로 확인할 수 있습니다.
                    </p>
                </div>

                {/* 카테고리 필터 탭 */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
                    {CATEGORIES.map((tab) => {
                        const isSelected = selectedCategory === tab.value;
                        return (
                            <button
                                key={tab.value}
                                type="button"
                                onClick={() => setSelectedCategory(tab.value)}
                                style={{
                                    padding: '7px 16px',
                                    borderRadius: '20px',
                                    border: isSelected ? '1px solid #ff3355' : '1px solid #2a2d3d',
                                    backgroundColor: isSelected ? '#ff3355' : '#161820',
                                    color: '#ffffff',
                                    fontSize: '0.82rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* 좌측 카카오맵 + 우측 공연장 상세 리스트 패널 */}
                <div style={{ display: 'flex', gap: '18px', height: '560px' }}>
                    <div
                        ref={mapContainerRef}
                        style={{
                            flex: 1.8,
                            borderRadius: '12px',
                            overflow: 'hidden',
                            border: '1px solid #2a2d3d',
                            backgroundColor: '#161820',
                        }}
                    />

                    <div
                        style={{
                            flex: 1,
                            backgroundColor: '#161820',
                            borderRadius: '12px',
                            border: '1px solid #2a2d3d',
                            padding: '18px',
                            overflowY: 'auto',
                        }}
                    >
                        {loading ? (
                            <div style={{ textAlign: 'center', marginTop: '200px', color: '#9ca3af' }}>
                                공연장 정보를 불러오는 중...
                            </div>
                        ) : !selectedVenueGroup ? (
                            <div style={{ textAlign: 'center', marginTop: '180px', color: '#9ca3af' }}>
                                <p style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#ffffff', marginBottom: '6px' }}>
                                    지도에서 공연장 핀을 클릭해 주세요
                                </p>
                                <p style={{ fontSize: '0.8rem', margin: 0 }}>
                                    현재 표시된 공연장: 총 <strong style={{ color: '#ff3355' }}>{venueGroups.length}</strong>곳
                                </p>
                            </div>
                        ) : (
                            <>
                                <div style={{ borderBottom: '1px solid #2a2d3d', paddingBottom: '12px', marginBottom: '14px' }}>
                                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', color: '#ffffff' }}>
                                        {selectedVenueGroup.venue}
                                    </h3>
                                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#9ca3af' }}>
                                        {selectedVenueGroup.address}
                                    </p>
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
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <img
                                                src={perf.posterUrl || DEFAULT_POSTER}
                                                alt={perf.title}
                                                onError={(e) => { e.target.src = DEFAULT_POSTER; }}
                                                style={{
                                                    width: '64px',
                                                    height: '88px',
                                                    objectFit: 'cover',
                                                    borderRadius: '5px',
                                                    flexShrink: 0,
                                                }}
                                            />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <span style={{ fontSize: '0.7rem', color: '#818cf8', fontWeight: 'bold' }}>
                                                    {perf.category}
                                                </span>
                                                <h4
                                                    style={{
                                                        margin: '3px 0 4px 0',
                                                        fontSize: '0.88rem',
                                                        fontWeight: 'bold',
                                                        color: '#ffffff',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                    }}
                                                >
                                                    {perf.title}
                                                </h4>
                                                <p style={{ margin: '0 0 6px 0', fontSize: '0.74rem', color: '#9ca3af' }}>
                                                    📅 {perf.startDate} ~ {perf.endDate}
                                                </p>
                                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#ff3355', fontWeight: 'bold' }}>
                                                    {perf.price > 0 ? `${perf.price.toLocaleString()}원~` : '무료'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}