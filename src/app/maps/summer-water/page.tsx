"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Script from "next/script";
import KakaoShareButton from "@/components/KakaoShareButton";

type MapCategory = 'all' | 'free' | 'cheap' | 'beach' | 'valley';

interface WaterPlace {
    id: number;
    name: string;
    lat: number;
    lng: number;
    type: MapCategory; // free(무료물놀이터), cheap(가성비수영장), beach(해수욕장), valley(계곡)
    openDate: string; // YYYY-MM-DD
    price: string;
    tags: string[];
    description: string;
}

const DUMMY_DATA: WaterPlace[] = [
    {
        id: 1, name: "여의도 한강공원 수영장", lat: 37.52843, lng: 126.93307, type: 'cheap',
        openDate: "2026-06-20", price: "5,000원", tags: ["#가성비", "#야간개장", "#샤워가능"],
        description: "저렴한 가격에 한강뷰 야외 수영을 즐길 수 있는 최고의 가성비 명소입니다."
    },
    {
        id: 2, name: "광교 호수공원 바닥분수", lat: 37.28312, lng: 127.06456, type: 'free',
        openDate: "2026-05-01", price: "무료", tags: ["#공짜", "#아이와함께", "#텐트가능(지정구역)"],
        description: "아이들이 안전하게 뛰어놀 수 있는 무료 물놀이터입니다. 주차비만 내면 하루종일 놀 수 있어요!"
    },
    {
        id: 3, name: "해운대 해수욕장", lat: 35.15869, lng: 129.16038, type: 'beach',
        openDate: "2026-06-01", price: "무료 (파라솔 별도)", tags: ["#해수욕장", "#야간개장", "#취사불가"],
        description: "대한민국 대표 해수욕장! 부분 개장을 6월 1일부터 시작합니다."
    },
    {
        id: 4, name: "가평 명지계곡", lat: 37.91572, lng: 127.43936, type: 'valley',
        openDate: "상시 개방", price: "무료 (평상 대여 별도)", tags: ["#취사가능", "#계곡", "#텐트설치가능"],
        description: "맑은 물과 얕은 수심으로 가족 단위 피서객에게 인기가 많은 취사 가능 계곡입니다."
    },
    {
        id: 5, name: "서울숲 물놀이터", lat: 37.54438, lng: 127.03744, type: 'free',
        openDate: "2026-07-01", price: "무료", tags: ["#공짜", "#도심속피서", "#대중교통편리"],
        description: "도심 한복판에서 무료로 즐기는 여름 물놀이! 돗자리 펴고 쉬기 좋아요."
    }
];

// 카카오맵 타입 에러 방지
declare global {
    interface Window {
        kakao: any;
    }
}

export default function SummerWaterMapPage() {
    const [mapLoaded, setMapLoaded] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<MapCategory>('all');
    const [places, setPlaces] = useState<WaterPlace[]>(DUMMY_DATA);
    const [selectedPlace, setSelectedPlace] = useState<WaterPlace | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);

    const KAKAO_APP_KEY = "11032eefd7d0111cb94d93c0ab41eb01";

    const initMap = () => {
        if (!window.kakao || !window.kakao.maps) return;

        window.kakao.maps.load(() => {
            if (!mapContainerRef.current) return;
            const options = {
                center: new window.kakao.maps.LatLng(37.5665, 126.9780), // 서울시청 기본 중심
                level: 11, // 전국구 레벨
            };
            const map = new window.kakao.maps.Map(mapContainerRef.current, options);
            mapRef.current = map;
            setMapLoaded(true);
            renderMarkers(DUMMY_DATA, map);
        });
    };

    const getMarkerIcon = (type: MapCategory) => {
        switch(type) {
            case 'free': return '⛲'; // 무료 분수/물놀이터
            case 'cheap': return '🏊‍♂️'; // 가성비 수영장
            case 'beach': return '🏖️'; // 해수욕장
            case 'valley': return '⛺'; // 계곡
            default: return '📍';
        }
    };

    const renderMarkers = (data: WaterPlace[], mapInstance: any) => {
        if (!window.kakao) return;
        
        // 기존 마커 제거
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        data.forEach(place => {
            // 커스텀 마커 (이모지)
            const content = `
                <div class="bg-white rounded-full border-2 border-blue-500 shadow-lg px-2 py-1 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform" style="font-size: 20px;">
                    ${getMarkerIcon(place.type)}
                </div>
            `;
            
            const position = new window.kakao.maps.LatLng(place.lat, place.lng);
            
            const customOverlay = new window.kakao.maps.CustomOverlay({
                position: position,
                content: content,
                yAnchor: 1
            });
            
            customOverlay.setMap(mapInstance);
            markersRef.current.push(customOverlay);

            // 클릭 이벤트 처리를 위해 DOM 엘리먼트에 이벤트 추가 (Next.js/React 방식 우회)
            // CustomOverlay는 이벤트를 직접 받지 않으므로, 대신 투명한 기본 마커를 덧씌우거나 
            // 가장 쉬운 방법은 클릭 이벤트를 전체 맵에서 처리하는 것인데, 
            // 가성비를 위해 클릭 시 해당 장소를 하단에 띄우도록 합니다.
        });
    };

    useEffect(() => {
        if (mapLoaded && mapRef.current) {
            const filtered = selectedCategory === 'all' 
                ? places 
                : places.filter(p => p.type === selectedCategory);
            renderMarkers(filtered, mapRef.current);
            setSelectedPlace(null); // 필터 변경 시 선택 해제
        }
    }, [selectedCategory, mapLoaded, places]);

    // D-Day 계산기
    const calculateDday = (dateString: string) => {
        if (dateString === "상시 개방") return "상시 개방 🟢";
        const targetDate = new Date(dateString);
        const today = new Date();
        const diffTime = targetDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 0) return `개장까지 D-${diffDays} ⏳`;
        if (diffDays === 0) return `오늘 개장! 🎉`;
        return `현재 개장 중 🟢`;
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <Script 
                src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&autoload=false`}
                strategy="lazyOnload"
                onLoad={initMap}
            />

            <nav className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-4 px-4">
                <Link href="/" className="hover:text-slate-800">홈</Link>
                <span>›</span>
                <span className="text-slate-800">여름 물놀이 거지맵</span>
            </nav>

            <div className="px-4 text-center space-y-3 mb-8">
                <span className="inline-block px-3 py-1 bg-cyan-100 text-cyan-700 font-bold rounded-full text-xs tracking-wider">
                    가성비 피서 프로젝트
                </span>
                <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">
                    전국 여름 물놀이 거지맵 🏝️
                </h1>
                <p className="text-slate-500 font-medium">
                    무료 동네 바닥분수부터 취사 가능한 계곡까지! 가성비 넘치는 여름 피서를 준비하세요.
                </p>
            </div>

            {/* 거지맵 메인 컨테이너 */}
            <div className="bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-700/50 mx-4">
                
                {/* 1. 필터 버튼 (짠테크 필터) */}
                <div className="p-4 md:p-6 border-b border-slate-800 bg-slate-800/50">
                    <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
                        {[
                            { id: 'all', label: '전체보기 ✨' },
                            { id: 'free', label: '공짜 물놀이터 ⛲' },
                            { id: 'cheap', label: '가성비 수영장 🏊‍♂️' },
                            { id: 'valley', label: '취사가능 계곡 ⛺' },
                            { id: 'beach', label: '전국 해수욕장 🏖️' },
                        ].map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id as MapCategory)}
                                className={`shrink-0 px-4 py-2 rounded-full font-bold transition-all ${
                                    selectedCategory === cat.id 
                                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg shadow-cyan-500/30' 
                                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. 카카오 지도 영역 */}
                <div className="relative w-full h-[400px] md:h-[500px] bg-slate-800">
                    {!mapLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-800 z-10 text-slate-400 flex-col gap-3">
                            <svg className="animate-spin h-8 w-8 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <span className="font-semibold">전국 물놀이 명소 불러오는 중...</span>
                        </div>
                    )}
                    <div ref={mapContainerRef} className="w-full h-full"></div>

                    {/* 지도 위 플로팅 팁 */}
                    <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700">
                        <span className="text-white text-xs font-medium">👉 지도를 움직여 마커를 확인하세요!</span>
                    </div>
                </div>

                {/* 3. 리스트 영역 (클릭 대신 리스트에서 정보를 보는 UI) */}
                <div className="p-4 md:p-6 bg-slate-900">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <span className="text-cyan-400">🔥 추천 핫플레이스</span> 
                    </h2>
                    
                    <div className="space-y-4">
                        {(selectedCategory === 'all' ? places : places.filter(p => p.type === selectedCategory)).map(place => (
                            <div key={place.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-cyan-500/50 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                                        {getMarkerIcon(place.type)} {place.name}
                                    </h3>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                                        calculateDday(place.openDate).includes('개장 중') || calculateDday(place.openDate).includes('상시')
                                        ? 'bg-emerald-500/20 text-emerald-400' 
                                        : 'bg-rose-500/20 text-rose-400'
                                    }`}>
                                        {calculateDday(place.openDate)}
                                    </span>
                                </div>
                                
                                <p className="text-sm text-slate-300 mb-3 leading-relaxed">
                                    {place.description}
                                </p>
                                
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {place.tags.map((tag, idx) => (
                                        <span key={idx} className="text-xs font-semibold px-2 py-1 bg-slate-700 text-cyan-300 rounded-full">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/50">
                                    <div className="text-sm">
                                        <span className="text-slate-400">이용 요금: </span>
                                        <span className="font-bold text-emerald-400">{place.price}</span>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            if (mapRef.current) {
                                                mapRef.current.panTo(new window.kakao.maps.LatLng(place.lat, place.lng));
                                                mapRef.current.setLevel(5);
                                            }
                                            window.scrollTo({ top: 300, behavior: 'smooth' });
                                        }}
                                        className="text-xs font-bold text-white bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        지도에서 보기 📍
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            <div className="px-4 mt-8">
                <KakaoShareButton 
                    title="2026 전국 여름 물놀이 거지맵 🏝️" 
                    description="공짜 동네 물놀이터부터 5천원 이하 가성비 수영장, 취사 가능한 계곡까지! 우리 동네 꿀정보 확인하기" 
                    kakaoAppKey={KAKAO_APP_KEY}
                />
            </div>
            
        </div>
    );
}
