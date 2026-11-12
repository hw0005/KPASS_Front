import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { performanceApi } from '../../api/performanceApi';

const DEFAULT_POSTER = 'https://via.placeholder.com/300x400/1c1e28/8c92a4?text=K-PASS';

export default function SearchPage() {
    const navigate = useNavigate();

    // 검색 필터 상태
    const [keyword, setKeyword] = useState('');
    const [category, setCategory] = useState('ALL');

    // 데이터 및 화면 상태
    const [performances, setPerformances] = useState([]);
    const [loading, setLoading] = useState(false);

    // 페이징 메타데이터 상태
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // ⭕ 데이터 로딩 함수 (비동기 state 오차 방지를 위해 파라미터 직접 전달 수용)
    const fetchPerformances = async (targetPage = page, targetCategory = category, targetKeyword = keyword) => {
        setLoading(true);
        try {
            const res = await performanceApi.searchPerformances(targetKeyword, targetCategory, targetPage);

            console.log("🔍 API 응답 데이터:", res);

            // 응답 DTO 필드 안전 추출
            const dataObj = res?.getAllDataListBySearchPage ? res : (res?.data || res || {});
            const list = dataObj?.getAllDataListBySearchPage || [];

            setPerformances(list);
            setTotalPages(dataObj?.totalPages || 0);
            setTotalElements(dataObj?.totalElements || 0); // ⭕ 총 개수 반영
        } catch (error) {
            console.error('공연 목록 조회 실패:', error);
            setPerformances([]);
            setTotalPages(0);
            setTotalElements(0);
        } finally {
            setLoading(false);
        }
    };

    // ⭕ page 변경 시 자동 조회
    useEffect(() => {
        fetchPerformances(page, category, keyword);
    }, [page]);

    // ⭕ 카테고리 드롭다운 변경 즉시 필터링 적용
    const handleCategoryChange = (e) => {
        const selectedCategory = e.target.value;
        setCategory(selectedCategory);
        setPage(0); // 1페이지(인덱스 0)로 리셋
        fetchPerformances(0, selectedCategory, keyword); // 최신 선택값으로 즉시 요청
    };

    // ⭕ 검색 버튼 클릭 / 엔터 입력시 실행
    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        setPage(0);
        fetchPerformances(0, category, keyword);
    };

    // 공연 마감 여부 체크 헬퍼
    const getStatusInfo = (item) => {
        if (!item) return { label: '진행중', bgColor: '#ff3355', textColor: '#ffffff', borderColor: 'transparent', isClosed: false };

        const today = new Date().toISOString().split('T')[0];
        const isClosed = (item.endDate && item.endDate < today) || (item.stockQuantity !== undefined && item.stockQuantity <= 0);

        if (isClosed) {
            return { label: '마감', bgColor: 'rgba(0, 0, 0, 0.75)', textColor: '#a1a1aa', borderColor: '#4b5563', isClosed: true };
        }
        return { label: '진행중', bgColor: '#ff3355', textColor: '#ffffff', borderColor: 'transparent', isClosed: false };
    };

    const handleItemClick = (item) => {
        navigate('/kpass/detail', { state: { performance: item } });
    };

    return (
        <div style={{ backgroundColor: '#0d0e12', minHeight: '100vh', display: 'flex', flexDirection: 'column', color: '#ffffff' }}>
            <Header />

            <main style={{ flex: 1, maxWidth: '1000px', width: '100%', margin: '0 auto', padding: '40px 20px 80px 20px', boxSizing: 'border-box' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🔍 K-PASS 공연 검색
                </h2>

                {/* 검색 필터 Form */}
                <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    <select
                        value={category}
                        onChange={handleCategoryChange}
                        style={{ padding: '14px 16px', backgroundColor: '#161820', color: '#ffffff', border: '1px solid #2a2d3d', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', cursor: 'pointer' }}
                    >
                        <option value="ALL">전체 장르</option>
                        <option value="CONCERT">콘서트 (대중음악)</option>
                        <option value="MUSICAL">뮤지컬</option>
                        <option value="THEATER">연극</option>
                        <option value="CLASSIC">클래식</option>
                        <option value="KOREAN_MUSIC">국악</option>
                    </select>

                    <input
                        type="text"
                        placeholder="공연 제목을 입력하세요..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        style={{ flex: 1, minWidth: '240px', padding: '14px 18px', backgroundColor: '#161820', color: '#ffffff', border: '1px solid #2a2d3d', borderRadius: '8px', fontSize: '1rem', outline: 'none' }}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        style={{ padding: '14px 28px', background: loading ? '#3f435a' : 'linear-gradient(135deg, #ff3355 0%, #ff007a 100%)', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}
                    >
                        {loading ? '검색 중...' : '검색'}
                    </button>
                </form>

                {/* 타이틀 및 필터링된 총 개수 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#a1a1aa' }}>
                        {category !== 'ALL' || keyword !== '' ? '🔍 검색 결과' : '🔥 전체 공연'}
                    </span>
                    <span style={{ fontSize: '0.9rem', color: '#818cf8' }}>
                        총 <strong style={{ color: '#ff3355' }}>{totalElements.toLocaleString()}</strong>건의 공연
                    </span>
                </div>

                {/* 공연 카드 목록 그리드 */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '80px 0', color: '#818cf8', fontSize: '1.1rem' }}>공연 정보를 불러오는 중입니다...</div>
                ) : !performances || performances.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 0', color: '#71717a' }}>조건에 해당되는 공연이 존재하지 않습니다.</div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                        {performances.map((item, index) => {
                            const status = getStatusInfo(item);
                            return (
                                <div
                                    key={item?.externalId || item?.id || index}
                                    onClick={() => handleItemClick(item)}
                                    style={{ backgroundColor: '#161820', border: '1px solid #2a2d3d', borderRadius: '10px', padding: '14px', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                                >
                                    <div style={{ position: 'relative', width: '100%', height: '260px', marginBottom: '12px' }}>
                                        <img
                                            src={item?.posterUrl || DEFAULT_POSTER}
                                            alt={item?.title || '공연 포스터'}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px', filter: status.isClosed ? 'brightness(0.65)' : 'none' }}
                                            onError={(e) => { e.target.src = DEFAULT_POSTER; }}
                                        />
                                        <span style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: status.bgColor, color: status.textColor, border: `1px solid ${status.borderColor}`, fontSize: '0.75rem', fontWeight: 'bold', padding: '4px 10px', borderRadius: '20px' }}>
                                            {status.label}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 'bold' }}>{item?.category || '공연'} | {item?.region || '전국'}</span>
                                    </div>
                                    <h3 style={{ fontSize: '1rem', margin: '0 0 8px 0', color: '#ffffff', flex: 1 }}>{item?.title || '제목 없음'}</h3>
                                    <p style={{ fontSize: '0.82rem', color: '#a1a1aa', margin: '2px 0' }}>📍 {item?.venue || '장소 미정'}</p>
                                    <p style={{ fontSize: '0.82rem', color: '#ff3355', fontWeight: 'bold', margin: '6px 0 0 0' }}>
                                        {item?.price && item.price > 0 ? `${item.price.toLocaleString()}원~` : '무료'}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* 10개 블록 단위 페이지네이션 */}
                {totalPages > 1 && (() => {
                    const PAGE_GROUP_SIZE = 10;
                    const currentGroup = Math.floor(page / PAGE_GROUP_SIZE);
                    const startPage = currentGroup * PAGE_GROUP_SIZE;
                    const endPage = Math.min(startPage + PAGE_GROUP_SIZE - 1, totalPages - 1);

                    const pageNumbers = [];
                    for (let i = startPage; i <= endPage; i++) {
                        pageNumbers.push(i);
                    }

                    const buttonStyle = {
                        padding: '8px 12px',
                        backgroundColor: '#161820',
                        color: '#ffffff',
                        border: '1px solid #2a2d3d',
                        borderRadius: '6px',
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    };

                    const disabledStyle = {
                        ...buttonStyle,
                        opacity: 0.3,
                        cursor: 'not-allowed'
                    };

                    return (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginTop: '40px' }}>
                            <span style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>
                                <strong style={{ color: '#ff3355' }}>{page + 1}</strong> / {totalPages} 페이지
                            </span>

                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
                                <button
                                    disabled={page === 0}
                                    onClick={() => setPage(0)}
                                    style={page === 0 ? disabledStyle : buttonStyle}
                                    title="첫 페이지로"
                                >
                                    «
                                </button>

                                <button
                                    disabled={page === 0}
                                    onClick={() => setPage(Math.max(0, page - 10))}
                                    style={page === 0 ? disabledStyle : buttonStyle}
                                    title="10페이지 이전"
                                >
                                    ‹
                                </button>

                                {pageNumbers.map((pageNum) => {
                                    const isCurrentPage = page === pageNum;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setPage(pageNum)}
                                            style={{
                                                ...buttonStyle,
                                                backgroundColor: isCurrentPage ? '#ff3355' : '#161820',
                                                color: isCurrentPage ? '#ffffff' : '#a1a1aa',
                                                borderColor: isCurrentPage ? '#ff3355' : '#2a2d3d',
                                                fontWeight: isCurrentPage ? 'bold' : 'normal',
                                                boxShadow: isCurrentPage ? '0 0 10px rgba(255, 51, 85, 0.5)' : 'none',
                                                transform: isCurrentPage ? 'scale(1.05)' : 'scale(1)'
                                            }}
                                        >
                                            {pageNum + 1}
                                        </button>
                                    );
                                })}

                                <button
                                    disabled={page >= totalPages - 1}
                                    onClick={() => setPage(Math.min(totalPages - 1, page + 10))}
                                    style={page >= totalPages - 1 ? disabledStyle : buttonStyle}
                                    title="10페이지 다음"
                                >
                                    ›
                                </button>

                                <button
                                    disabled={page >= totalPages - 1}
                                    onClick={() => setPage(totalPages - 1)}
                                    style={page >= totalPages - 1 ? disabledStyle : buttonStyle}
                                    title="마지막 페이지로"
                                >
                                    »
                                </button>
                            </div>
                        </div>
                    );
                })()}
            </main>

            <Footer />
        </div>
    );
}