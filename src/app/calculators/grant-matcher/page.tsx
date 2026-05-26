"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdSenseBanner from "@/components/AdSenseBanner";
import ShareButtons from "@/components/ShareButtons";
import WordPressLink from "@/components/WordPressLink";

type Category = 'all' | 'youth' | 'child' | 'senior' | 'smallbiz' | 'housing';

interface SubsidyItem {
    title: string;
    desc: string;
    url: string;
}

export default function SubsidyFinderPage() {
  const [region, setRegion] = useState<string>("");
  const [category, setCategory] = useState<Category>("all");
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [subsidyData, setSubsidyData] = useState<Record<Category, SubsidyItem[]>>({
      all: [], youth: [], child: [], senior: [], smallbiz: [], housing: []
  });
  const [displayedItems, setDisplayedItems] = useState<SubsidyItem[]>([]);
  
  const WP_DOMAIN = 'https://weknews.com';
  const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRroFNPaye9fhBftcTW3ilBuYOgZ_0nnsvEPP9tq1LlRlpcH3G0NA8GW1JVYvkXjeFEr5yMedc83Wwd/pub?output=csv';

  useEffect(() => {
      const fetchSubsidies = async () => {
          try {
              const response = await fetch(CSV_URL);
              const text = await response.text();
              
              const lines = text.split('\n');
              const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
              
              const newData: Record<Category, SubsidyItem[]> = {
                  all: [], youth: [], child: [], senior: [], smallbiz: [], housing: []
              };

              for (let i = 1; i < lines.length; i++) {
                  const line = lines[i].trim();
                  if (!line) continue;
                  
                  const values: string[] = [];
                  let current = '';
                  let inQuotes = false;
                  for (let char of line) {
                      if (char === '"') inQuotes = !inQuotes;
                      else if (char === ',' && !inQuotes) {
                          values.push(current.trim());
                          current = '';
                      } else {
                          current += char;
                      }
                  }
                  values.push(current.trim());

                  const row: any = {};
                  headers.forEach((header, index) => {
                      row[header] = values[index] ? values[index].replace(/^"|"$/g, '').trim() : '';
                  });

                  const cat = row.category ? row.category.toLowerCase() : 'all';
                  if (newData[cat as Category]) {
                      newData[cat as Category].push({
                          title: row.title,
                          desc: row.description,
                          url: row.url
                      });
                  }
              }
              setSubsidyData(newData);
          } catch (error) {
              console.error('Failed to load data:', error);
          }
      };
      fetchSubsidies();
  }, []);

  const handleSearch = () => {
      if (!region) {
          alert('지역을 선택해 주세요!');
          return;
      }
      setIsLoading(true);
      setHasSearched(false);
      
      setTimeout(() => {
          const allItems = subsidyData[category] || [];
          setDisplayedItems(allItems.slice(0, 3)); // Max 3 items
          setIsLoading(false);
          setHasSearched(true);
      }, 800);
  };

  const getCategoryName = (cat: Category) => {
      switch(cat) {
          case 'youth': return '청년';
          case 'child': return '육아';
          case 'senior': return '노인';
          case 'smallbiz': return '소상공인';
          case 'housing': return '주거';
          default: return '전체';
      }
  };

  const getRegionName = (val: string) => {
      const regions: Record<string, string> = {
          '11': '서울특별시', '26': '부산광역시', '27': '대구광역시', '28': '인천광역시', 
          '29': '광주광역시', '30': '대전광역시', '31': '울산광역시', '36': '세종특별자치시',
          '41': '경기도', '42': '강원도', '43': '충청북도', '44': '충청남도', '45': '전라북도',
          '46': '전라남도', '47': '경상북도', '48': '경상남도', '50': '제주특별자치도'
      };
      return regions[val] || '';
  };

  const handleBlogSearch = () => {
      const rName = getRegionName(region);
      const cName = getCategoryName(category);
      const query = `${cName === '전체' ? '지원금' : cName + ' 지원금'}`;
      window.open(`${WP_DOMAIN}/?s=${encodeURIComponent(query)}`, '_blank');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <nav className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-4">
        <Link href="/" className="hover:text-slate-800">홈</Link>
        <span>›</span>
        <span>생활 계산기</span>
        <span>›</span>
        <span className="text-slate-800">내 동네 지원금 찾기</span>
      </nav>

      <AdSenseBanner dataAdSlot="4122383889" />

      {/* Widget Container - Dark Glassmorphism Theme (matches wordpress style) */}
      <div className="relative overflow-hidden bg-slate-900 rounded-3xl shadow-2xl border border-blue-500/20 text-slate-100 p-8 md:p-12">
        
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-600/20 blur-3xl rounded-full"></div>
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-600/20 blur-3xl rounded-full"></div>
        </div>

        <div className="relative z-10 space-y-8">
            <div className="text-center space-y-2 mb-8">
                <span className="text-xs font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Duke Project</span>
                <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 pb-1">내 동네 지원금 찾기</h1>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-base font-semibold text-slate-300 mb-3">어느 지역에 사시나요?</label>
                    <div className="relative">
                        <select 
                            value={region} 
                            onChange={e => setRegion(e.target.value)} 
                            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-4 text-white text-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                        >
                            <option value="">지역을 선택하세요</option>
                            <option value="11">서울특별시</option>
                            <option value="26">부산광역시</option>
                            <option value="27">대구광역시</option>
                            <option value="28">인천광역시</option>
                            <option value="29">광주광역시</option>
                            <option value="30">대전광역시</option>
                            <option value="31">울산광역시</option>
                            <option value="36">세종특별자치시</option>
                            <option value="41">경기도</option>
                            <option value="42">강원도</option>
                            <option value="43">충청북도</option>
                            <option value="44">충청남도</option>
                            <option value="45">전라북도</option>
                            <option value="46">전라남도</option>
                            <option value="47">경상북도</option>
                            <option value="48">경상남도</option>
                            <option value="50">제주특별자치도</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            ▼
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-base font-semibold text-slate-300 mb-3">관심 카테고리</label>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { id: 'all', icon: '✨', label: '전체' },
                            { id: 'youth', icon: '🙋‍♂️', label: '청년' },
                            { id: 'child', icon: '👶', label: '육아' },
                            { id: 'senior', icon: '👴', label: '노인' },
                            { id: 'smallbiz', icon: '🏪', label: '소상공인' },
                            { id: 'housing', icon: '🏠', label: '주거' },
                        ].map((cat) => (
                            <button 
                                key={cat.id} 
                                onClick={() => setCategory(cat.id as Category)} 
                                className={`py-4 px-2 text-center rounded-xl transition-all border ${category === cat.id ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-transparent text-white shadow-lg shadow-blue-500/30 scale-[1.02]' : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700'}`}
                            >
                                <span className="block text-2xl mb-1">{cat.icon}</span>
                                <span className="block text-sm font-semibold">{cat.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <button 
                onClick={handleSearch} 
                disabled={isLoading} 
                className={`w-full py-4 md:py-5 rounded-xl text-white font-bold text-lg transition-all shadow-lg shadow-blue-500/30 flex justify-center items-center gap-2 mt-4 ${isLoading ? 'bg-slate-600 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/40'}`}
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        🕵️ 분석 중...
                    </>
                ) : '맞춤 지원금 찾기'}
            </button>

            {hasSearched && (
                <div className="pt-8 border-t border-slate-700/50 animate-in slide-in-from-bottom-4 duration-500 space-y-6">
                    <h2 className="text-lg font-bold text-slate-100">
                        <span className="text-blue-400 text-2xl mr-1">{displayedItems.length}</span>개의 추천 혜택을 찾았습니다!
                    </h2>
                    
                    <div className="space-y-3">
                        {displayedItems.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 bg-slate-800/30 rounded-xl border border-slate-700">
                                준비된 지원금이 없습니다. 다른 카테고리를 선택해 보세요!
                            </div>
                        ) : (
                            displayedItems.map((item, idx) => (
                                <a key={idx} href={item.url} target="_blank" rel="noopener noreferrer" className="block bg-slate-800/50 border border-slate-700 rounded-xl p-5 hover:border-blue-500 hover:bg-slate-800 border-l-4 border-l-blue-500 hover:-translate-y-1 transition-all">
                                    <h3 className="text-base font-bold text-slate-100 mb-2">{item.title} <span className="text-[10px] text-blue-400 font-medium ml-1 bg-blue-500/10 px-2 py-0.5 rounded-full">↗ 공식신청</span></h3>
                                    <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                                </a>
                            ))
                        )}
                    </div>

                    <div className="pt-4">
                        <button onClick={handleBlogSearch} className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_25px_rgba(59,130,246,0.7)] transition-all">
                            🎁 <b>{getRegionName(region)} {getCategoryName(category) !== '전체' ? getCategoryName(category) : ''}</b> 숨은 지원금 100% 타먹는 비법 보기 🚨
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
      
      <ShareButtons 
        title="내 동네 지원금 찾기" 
        description="나에게 꼭 맞는 숨은 정부지원금을 1분만에 빠르게 찾아보세요!" 
        kakaoAppKey="11032eefd7d0111cb94d93c0ab41eb01" 
      />

      <article className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm mt-12 space-y-8">
        <section>
          <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-slate-100">
            <WordPressLink title="2026 청년지원금 비수도권 중소기업 대상 안내" url="https://weknews.com/2026-%ec%b2%ad%eb%85%84%ec%a7%80%ec%9b%90%ea%b8%88-%eb%b9%84%ec%88%98%eb%8f%84%ea%b6%8c-%ec%a4%91%ec%86%8c%ea%b8%b0%ec%97%85/" />
            <WordPressLink title="고유가 피해지원금 2차 지급 대상 및 신청" url="https://weknews.com/%ea%b3%a0%ec%9c%a0%ea%b0%80-%ed%94%bc%ed%95%b4%ec%a7%80%ec%9b%90%ea%b8%88-2%ec%b0%a8-%ec%a7%80%ea%b8%89-%eb%8c%80%ec%83%81%ec%9d%80/" />
          </div>
        </section>
      </article>
    </div>
  );
}
