"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import AdSenseBanner from "@/components/AdSenseBanner";
import KakaoShareButton from "@/components/KakaoShareButton";

interface RateItem {
  bank: string;
  name: string;
  condition: string;
  base: string;
  max: string;
  url: string;
}

const mockData: Record<string, RateItem[]> = {
  deposit: [
    { bank: '수협은행', name: 'Sh첫만남우대예금', condition: '첫거래 우대금리 제공', base: '3.02', max: '4.02', url: 'https://suhyup-bank.com' },
    { bank: '다올저축은행', name: 'Fi 리볼빙 정기예금', condition: '1년 주기 금리 갱신 우대', base: '3.85', max: '3.85', url: 'https://www.daolsb.co.kr' },
    { bank: 'SBI저축은행', name: '사이다정기예금', condition: '모바일앱 가입 전용 예금', base: '3.80', max: '3.80', url: 'https://www.sbisb.co.kr' },
    { bank: '케이뱅크', name: '코드K 정기예금', condition: '조건없이 누구나 가입 조건', base: '3.60', max: '3.60', url: 'https://www.kbanknow.com' },
    { bank: '신한은행', name: '쏠편한 정기예금', condition: '신한 쏠뱅크 전용 우대 금리', base: '3.00', max: '3.45', url: 'https://www.shinhan.com' },
    { bank: '국민은행', name: 'KB Star 정기예금', condition: '자동 해지 방지 예치 설정 지원', base: '3.45', max: '3.45', url: 'https://www.kbstar.com' }
  ],
  savings: [
    { bank: '신한은행', name: '청년처음적금', condition: '만 18세~39세 청년 특판 우대 제공', base: '3.50', max: '8.00', url: 'https://www.shinhan.com' },
    { bank: '국민은행', name: 'KB 온국민 건강적금', condition: '매월 걸음 수 달성 시 파격 우대', base: '2.00', max: '8.00', url: 'https://www.kbstar.com' },
    { bank: '웰컴저축은행', name: 'WELCOME 첫거래우대 m정기적금', condition: '첫 거래 고객 마이데이터 동의 우대', base: '3.70', max: '7.00', url: 'https://www.welcomebank.co.kr' },
    { bank: '기업은행', name: 'IBK탄소제로적금', condition: '에너지 절감 및 실천 기여 고객 우대', base: '3.00', max: '6.50', url: 'https://www.ibk.co.kr' }
  ],
  parking: [
    { bank: 'OK저축은행', name: 'OK짠테크통장', condition: '50만원 이하 연 7% 파격 적용', base: '7.00', max: '7.00', url: 'https://www.oksavingsbank.com' },
    { bank: '애큐온저축은행', name: '플러스자유예금', condition: '모바일 가입 및 제휴 실적 우대', base: '3.00', max: '3.80', url: 'https://www.acuonsb.co.kr' },
    { bank: '토스뱅크', name: '토스통장 (파킹)', condition: '매일 이자 받기 가능, 한도 제한 없음', base: '1.80', max: '1.80', url: 'https://www.tossbank.com' }
  ]
};

const bankColors: Record<string, { bg: string; text: string }> = {
  '케이뱅크': { bg: '#00a4e4', text: '#ffffff' },
  '카카오뱅크': { bg: '#ffeb00', text: '#1e1e1e' },
  '토스뱅크': { bg: '#0064ff', text: '#ffffff' },
  '신한은행': { bg: '#0046ff', text: '#ffffff' },
  '국민은행': { bg: '#ffcc00', text: '#4a3e3d' },
  '우리은행': { bg: '#2563eb', text: '#ffffff' },
  '하나은행': { bg: '#008375', text: '#ffffff' },
  '농협은행': { bg: '#00a854', text: '#ffffff' },
  '새마을금고': { bg: '#0055a5', text: '#ffffff' },
  '신협': { bg: '#005ca5', text: '#ffffff' },
  '저축은행': { bg: '#582c83', text: '#ffffff' }
};

const getBankStyle = (bankName: string) => {
  if (!bankName) return { bg: '#f1f5f9', text: '#64748b' };
  if (bankColors[bankName]) return bankColors[bankName];
  
  for (const key in bankColors) {
    if (bankName.includes(key)) {
      return bankColors[key];
    }
  }
  
  let hash = 0;
  for (let i = 0; i < bankName.length; i++) {
    hash = bankName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
  const bg = '#' + '00000'.substring(0, 6 - c.length) + c;
  const r = parseInt(bg.substring(1, 3), 16);
  const g = parseInt(bg.substring(3, 5), 16);
  const b = parseInt(bg.substring(5, 7), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return { bg, text: (yiq >= 128) ? '#1e293b' : '#ffffff' };
};

export default function DepositCalculatorPage() {
  const [currentTab, setCurrentTab] = useState<"deposit" | "savings" | "parking">("deposit");
  const [searchQuery, setSearchQuery] = useState("");
  const [bankData, setBankData] = useState<Record<string, RateItem[]>>({ deposit: [], savings: [], parking: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [updateDate, setUpdateDate] = useState("데이터 로딩 중...");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchCSV = async () => {
      try {
        const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT17x91ZqA6Lw_9a56uS-u4SjX3aG5t5d8G8M1Q6t5Z_U4a8K8F6z3P5d8_3M6/pub?gid=0&single=true&output=csv';
        const response = await fetch(CSV_URL);
        if (!response.ok) throw new Error("Failed to fetch");
        const text = await response.text();
        
        const lines = text.split('\n');
        if (lines.length < 2) throw new Error("Invalid CSV");
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const tempBankData: Record<string, RateItem[]> = { deposit: [], savings: [], parking: [] };
        let hasData = false;
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const values: string[] = [];
          let current = '';
          let inQuotes = false;
          
          for (let j = 0; j < line.length; j++) {
            const char = line[j];
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
          for (let k = 0; k < headers.length; k++) {
            row[headers[k]] = values[k] ? values[k].replace(/^"|"$/g, '').trim() : '';
          }
          
          const type = row.type ? row.type.toLowerCase().trim() : '';
          if (tempBankData[type]) {
            tempBankData[type].push({
              bank: row.bank, name: row.name, condition: row.condition,
              base: row.base, max: row.max, url: row.url
            });
            hasData = true;
          }
        }
        
        if (hasData) {
          setBankData(tempBankData);
          const now = new Date();
          setUpdateDate(`${now.getMonth() + 1}/${now.getDate()} 기준 업데이트됨`);
        } else {
          throw new Error("No data found");
        }
      } catch (err) {
        console.error(err);
        setBankData(mockData);
        setUpdateDate("현재 최신 데이터 제공 중");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCSV();
  }, []);

  const currentList = useMemo(() => {
    let list = bankData[currentTab] && bankData[currentTab].length > 0 ? bankData[currentTab] : mockData[currentTab];
    list = list.sort((a, b) => (parseFloat(b.max) || 0) - (parseFloat(a.max) || 0));
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(item => 
        item.bank.toLowerCase().includes(q) || item.name.toLowerCase().includes(q)
      );
    }
    return list;
  }, [bankData, currentTab, searchQuery]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <nav className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-4">
        <Link href="/" className="hover:text-slate-800">홈</Link>
        <span>›</span>
        <span>투자 계산기</span>
        <span>›</span>
        <span className="text-slate-800">예금 적금 최고 금리 찾기</span>
      </nav>

      <AdSenseBanner dataAdSlot="4122383889" />

      {/* Widget Container */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-500 text-white p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="relative z-10 flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">최고 금리 비교기</h1>
              <p className="text-indigo-100 text-sm mt-1">국내 1금융권, 저축은행 실시간 금리 순위</p>
            </div>
          </div>
          <div className="relative z-10 bg-black/20 text-indigo-50 text-xs font-bold px-3 py-1.5 rounded-full border border-white/10">
            {updateDate}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex p-4 md:p-6 pb-0 gap-2 overflow-x-auto">
          {[
            { id: "deposit", label: "정기예금" },
            { id: "savings", label: "정기적금" },
            { id: "parking", label: "파킹통장" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setCurrentTab(tab.id as any); setExpandedIndex(null); }}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm md:text-base transition-all whitespace-nowrap ${
                currentTab === tab.id 
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' 
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="p-4 md:p-6">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="은행명 또는 예적금 상품명 검색..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm font-medium text-slate-800 outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
            />
          </div>
        </div>

        {/* List */}
        <div className="px-2 md:px-4 pb-6 min-h-[300px]">
          {isLoading ? (
            <div className="flex justify-center items-center h-40 text-slate-400 font-medium text-sm">
              <div className="animate-pulse flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                최신 금리 정보를 로딩 중입니다...
              </div>
            </div>
          ) : currentList.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm font-medium bg-slate-50 rounded-xl mx-2 border border-slate-100">
              해당하는 상품이 없습니다.
            </div>
          ) : (
            <ul className="space-y-2">
              {currentList.map((item, index) => {
                const style = getBankStyle(item.bank);
                const isExpanded = expandedIndex === index;
                const maxVal = parseFloat(item.max) || 0;
                const baseVal = parseFloat(item.base) || 0;
                const primeRateText = (maxVal - baseVal) > 0 ? `+${(maxVal - baseVal).toFixed(2)}%` : '없음';

                return (
                  <li key={index} className={`border rounded-2xl transition-all overflow-hidden ${isExpanded ? 'border-sky-200 bg-sky-50/30' : 'border-slate-100 hover:border-slate-300'}`}>
                    <div 
                      className="flex items-center p-3 md:p-4 cursor-pointer"
                      onClick={() => setExpandedIndex(isExpanded ? null : index)}
                    >
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 mr-3 md:mr-4 shadow-sm" style={{ backgroundColor: style.bg, color: style.text }}>
                        {item.bank.substring(0, 2)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-slate-500 font-medium mb-1">{item.bank}</div>
                        <div className="text-sm md:text-base font-bold text-slate-800 truncate mb-1">{item.name}</div>
                        <div className="inline-block px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] md:text-xs rounded font-medium truncate max-w-full">
                          {item.condition || '기본 조건'}
                        </div>
                      </div>

                      <div className="text-right ml-2 md:ml-4 mr-2 md:mr-4 shrink-0">
                        <div className="text-base md:text-lg font-black text-rose-500 mb-0.5">
                          최고 {maxVal.toFixed(2)}%
                        </div>
                        <div className="text-[10px] md:text-xs text-slate-500 font-medium">
                          기본 {baseVal.toFixed(2)}%
                        </div>
                      </div>

                      <div className={`w-6 h-6 flex items-center justify-center text-slate-400 transition-transform ${isExpanded ? 'rotate-180 text-sky-500' : ''}`}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      </div>
                    </div>

                    {/* Expandable Detail */}
                    {isExpanded && (
                      <div className="px-4 pb-4 md:px-6 md:pb-6 bg-slate-50/50 border-t border-slate-100 animate-in slide-in-from-top-2">
                        <div className="grid grid-cols-3 gap-2 md:gap-4 my-4">
                          <div className="bg-white border border-slate-200 p-3 rounded-xl text-center shadow-sm">
                            <span className="block text-[10px] md:text-xs text-slate-500 font-bold mb-1">기본 금리</span>
                            <span className="block text-sm md:text-base font-bold text-slate-800">{baseVal.toFixed(2)}%</span>
                          </div>
                          <div className="bg-white border border-slate-200 p-3 rounded-xl text-center shadow-sm">
                            <span className="block text-[10px] md:text-xs text-slate-500 font-bold mb-1">우대 금리</span>
                            <span className="block text-sm md:text-base font-bold text-emerald-600">{primeRateText}</span>
                          </div>
                          <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl text-center shadow-sm">
                            <span className="block text-[10px] md:text-xs text-rose-600/70 font-bold mb-1">최고 금리</span>
                            <span className="block text-sm md:text-base font-black text-rose-600">{maxVal.toFixed(2)}%</span>
                          </div>
                        </div>

                        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm mb-4">
                          <div className="text-xs font-bold text-slate-800 mb-2">💡 우대 조건 요약</div>
                          <div className="text-xs md:text-sm text-slate-600 leading-relaxed">
                            {item.condition || '추가 우대 조건 정보가 없습니다.'}
                          </div>
                        </div>

                        {item.url && item.url !== '#' && (
                          <a 
                            href={item.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-sm shadow-indigo-600/20"
                          >
                            상품 상세 정보 & 바로가기
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                              <polyline points="15 3 21 3 21 9"></polyline>
                              <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                          </a>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          
          <KakaoShareButton 
            title="실시간 최고 금리 비교기" 
            description={`지금 가장 이자를 많이 주는 예금/적금/파킹통장은 어디일까요? 확인해보세요!`} 
            kakaoAppKey="11032eefd7d0111cb94d93c0ab41eb01" 
          />
        </div>

        <div className="bg-slate-50 border-t border-slate-100 p-4 text-center text-xs text-slate-400 font-medium">
          ※ 금리 정보는 참고용이며, 우대 금리 상세 조건은 반드시 해당 은행에서 다시 확인하세요.
        </div>
      </div>

      {/* SEO & Guide Section */}
      <article className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-10 mt-12">
        <section>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 border-b-2 border-slate-100 pb-3 mb-5">정기예금, 정기적금, 파킹통장의 차이점</h2>
          <p className="text-slate-800 text-[15px] leading-relaxed mb-4">
            안전하게 목돈을 모으고 불리기 위해서는 각 금융 상품의 특징을 정확히 이해하고 상황에 맞게 활용하는 것이 중요합니다.
          </p>
          <ul className="list-disc pl-6 space-y-3 text-slate-700 text-[15px]">
            <li><strong>정기예금:</strong> 이미 모아둔 목돈(예: 1,000만 원)을 일정 기간 동안 은행에 한 번에 예치하고 만기에 원금과 이자를 받는 상품입니다. 목돈을 굴릴 때 가장 기본이 됩니다.</li>
            <li><strong>정기적금:</strong> 매월 일정한 금액(예: 매월 50만 원)을 정해진 기간 동안 꾸준히 납입하여 만기에 목돈을 만드는 상품입니다. 종잣돈(시드머니)을 모으는 단계에서 유용합니다.</li>
            <li><strong>파킹통장 (CMA/수시입출금식):</strong> 자동차를 잠시 주차(Parking)하듯, 짧은 기간 돈을 맡겨도 하루 단위로 이자를 계산해 주는 수시입출금 통장입니다. 여유 자금이나 비상금을 보관하기 좋습니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 border-b-2 border-slate-100 pb-3 mb-5">최고 금리를 받기 위한 '우대 조건' 꿀팁</h2>
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <p className="text-slate-800 text-[15px] leading-relaxed mb-4">
              위 비교기에서 보이는 <strong>'최고 금리'</strong>는 은행이 제시하는 모든 <strong>우대 조건</strong>을 충족했을 때 받을 수 있는 금리입니다. 우대 조건은 주로 다음과 같습니다.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="font-bold text-indigo-600 mb-1">✅ 첫 거래 우대</div>
                <div className="text-sm text-slate-600">해당 은행을 처음 이용하거나, 최근 1년간 거래가 없었던 고객에게 제공되는 가장 흔하고 높은 혜택입니다.</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="font-bold text-indigo-600 mb-1">✅ 급여 이체 실적</div>
                <div className="text-sm text-slate-600">매월 일정 금액(보통 50만 원 이상)이 '급여'라는 이름으로 통장에 입금되면 우대금리가 적용됩니다.</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="font-bold text-indigo-600 mb-1">✅ 카드 사용 실적</div>
                <div className="text-sm text-slate-600">가입한 은행과 연계된 체크카드나 신용카드를 매월 일정 금액 이상 사용해야 하는 조건입니다.</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="font-bold text-indigo-600 mb-1">✅ 마이데이터 / 자동이체</div>
                <div className="text-sm text-slate-600">은행 앱에서 마이데이터 자산연결을 하거나 공과금 자동이체를 1건 이상 등록하는 조건입니다.</div>
              </div>
            </div>
            <p className="text-xs text-rose-500 font-bold mt-4">
              * 조건 충족이 까다롭다면, 기본 금리가 가장 높은 상품(파킹통장이나 인터넷전문은행)을 선택하는 것이 오히려 현명할 수 있습니다.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 border-b-2 border-slate-100 pb-3 mb-5">예금자보호법 완벽 이해하기</h2>
          <p className="text-slate-800 text-[15px] leading-relaxed">
            금리가 유독 높은 저축은행 상품에 가입할 때 많은 분들이 불안해하십니다. 하지만 대한민국은 <strong>예금자보호법</strong>에 의해 1금융권뿐만 아니라 저축은행, 신협, 새마을금고에 맡긴 돈도 안전하게 보호됩니다.
            <br/><br/>
            한 금융회사당 <strong>원금과 소정의 이자를 합쳐 1인당 최고 5,000만 원까지</strong>는 해당 은행이 파산하더라도 예금보험공사(새마을금고/신협은 자체 중앙회)에서 지급을 보장해 줍니다. 따라서 예치금이 5,000만 원을 초과한다면, 여러 저축은행에 4,500만 원씩 <strong>분산 예치(풍차돌리기)</strong> 하는 것이 가장 안전하고 스마트한 투자 방법입니다.
          </p>
        </section>
      </article>

    </div>
  );
}
