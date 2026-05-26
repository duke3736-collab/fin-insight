"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import AdSenseBanner from "@/components/AdSenseBanner";
import ShareButtons from "@/components/ShareButtons";
import WordPressLink from "@/components/WordPressLink";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip
);

export default function IsaCalculatorPage() {
  const [activeTab, setActiveTab] = useState<"calc-tax" | "calc-pension">("calc-tax");

  // Tab 1 States
  const [userType, setUserType] = useState<"normal" | "seomin">("normal");
  const [assetType, setAssetType] = useState<"stock" | "etf">("stock");
  const [profitVal, setProfitVal] = useState<number>(500); // Unit: 10,000 KRW
  const [volumeVal, setVolumeVal] = useState<number>(3000); // Unit: 10,000 KRW

  // Tab 2 States
  const [rolloverVal, setRolloverVal] = useState<number>(3000); // Unit: 10,000 KRW
  const [incomeClass, setIncomeClass] = useState<"low" | "high">("low");

  const formatNumber = (num: number) => num.toLocaleString("ko-KR");

  // Tab 1 Calculations
  const taxSimResult = useMemo(() => {
    const profit = profitVal * 10000;
    const volume = volumeVal * 10000;

    // 1. General (Normal) Accounts
    const normalTax = Math.floor(profit * 0.154);
    const normalFee = Math.floor(volume * 0.0014); // Average standard rate (0.14%)
    const normalTotal = normalTax + normalFee;

    // 2. ISA Accounts
    // 2026 Revised limits: Normal = 5,000,000, Seomin = 10,000,000
    const taxFreeLimit = userType === 'normal' ? 5000000 : 10000000;
    let isaTax = 0;
    if (profit > taxFreeLimit) {
      isaTax = Math.floor((profit - taxFreeLimit) * 0.099);
    }

    const isaFeeRate = assetType === 'stock' ? 0.000036396 : 0.000042087;
    const isaFee = Math.floor(volume * isaFeeRate);
    const isaTotal = isaTax + isaFee;

    const totalSavings = Math.max(0, normalTotal - isaTotal);

    return { normalTotal, isaTotal, totalSavings };
  }, [profitVal, volumeVal, userType, assetType]);

  // Tab 2 Calculations
  const pensionSimResult = useMemo(() => {
    const rolloverAmount = rolloverVal * 10000;
    const rawTarget = Math.floor(rolloverAmount * 0.1);
    const pensionTarget = Math.min(3000000, rawTarget);

    const deductRate = incomeClass === 'low' ? 0.165 : 0.132;
    const actualRefund = Math.floor(pensionTarget * deductRate);

    return { pensionTarget, actualRefund };
  }, [rolloverVal, incomeClass]);

  const chartData = {
    labels: ['일반계좌 지출액', '중개형 ISA 지출액'],
    datasets: [{
      data: [taxSimResult.normalTotal, taxSimResult.isaTotal],
      backgroundColor: ['#f87171', '#2dd4bf'],
      borderWidth: 0,
      borderRadius: 12,
      barThickness: 45
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return context.raw.toLocaleString() + ' 원';
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(val: any) {
            return (val / 10000).toLocaleString() + '만 원';
          }
        }
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <nav className="flex justify-between items-center bg-white/90 border-b border-slate-200 px-4 py-3 backdrop-blur-md rounded-2xl mb-8">
        <h1 className="text-xl font-extrabold text-teal-600 flex items-center gap-2">
          <span>🛡️</span> ISA 2026 스마트 가이드
        </h1>
        <div className="hidden md:flex space-x-6 text-sm font-semibold">
          <a href="#simulator-section" className="hover:text-teal-600 text-slate-600">수수료 & 절세 시뮬레이터</a>
          <a href="#strategy-section" className="hover:text-teal-600 text-slate-600">만기 세팅 전략</a>
          <a href="#brokers-section" className="hover:text-teal-600 text-slate-600">증권사 TOP 3</a>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="px-4 pt-4 pb-12 text-center">
        <span className="inline-block px-3 py-1 bg-teal-100 text-teal-700 text-xs font-bold rounded-full mb-4">2026 개정세법 및 만기 이관 전략 반영</span>
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight text-slate-800">
          모르면 세금 폭탄! 중개형 ISA<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600">수수료 절감부터 연금 세액공제까지</span>
        </h2>
        <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-6">
          계좌만 만든다고 끝이 아닙니다. <b>평생 우대 수수료(0.003% 대)</b> 혜택을 지키고, <b>만기 자금을 연금저축으로 옮겨 추가 300만 원 세액공제</b>를 받는 프로 투자자의 루틴을 간편하게 계산해 보세요.
        </p>
      </header>
      
      <AdSenseBanner dataAdSlot="4122383889" />

      {/* Tab Container */}
      <main id="simulator-section" className="px-4">
        <div className="flex border-b border-slate-200 mb-8 bg-white rounded-xl p-1.5 shadow-sm">
          <button 
            onClick={() => setActiveTab('calc-tax')} 
            className={`flex-1 py-3 text-center text-sm font-bold rounded-lg transition-all ${activeTab === 'calc-tax' ? 'border-teal-400 text-teal-700 bg-teal-50 shadow-sm border' : 'text-slate-500 hover:text-slate-800'}`}
          >
            📈 수수료 & 절세 계산기
          </button>
          <button 
            onClick={() => setActiveTab('calc-pension')} 
            className={`flex-1 py-3 text-center text-sm font-bold rounded-lg transition-all ${activeTab === 'calc-pension' ? 'border-teal-400 text-teal-700 bg-teal-50 shadow-sm border' : 'text-slate-500 hover:text-slate-800'}`}
          >
            💰 만기 & 연금 이관 계산기
          </button>
        </div>

        {/* Tab 1: Tax & Fee Simulator */}
        {activeTab === 'calc-tax' && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
              <div className="mb-8">
                <h3 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <span className="bg-teal-500 text-white w-7 h-7 rounded-lg flex items-center justify-center text-sm">1</span>
                  거래 수수료 및 투자 비과세 절세 계산기
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  일반 주식 계좌 거래 시 빠져나가는 높은 수수료(0.14%) 및 세금(15.4%) 대비, <b>중개형 ISA 평생 우대 수수료</b>와 <b>2026년 기준 비과세 혜택</b> 적용 시 아낄 수 있는 실제 총금액을 실시간으로 확인해 보세요.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-10 items-center">
                <div className="space-y-6">
                  {/* User Type */}
                  <div>
                    <span className="block text-sm font-bold text-slate-700 mb-2">가입 조건 유형 선택</span>
                    <div className="grid grid-cols-2 gap-3">
                      <label className={`cursor-pointer border-2 rounded-xl p-3 flex flex-col items-center text-center transition-all ${userType === 'normal' ? 'border-teal-500 bg-teal-50/20' : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'}`}>
                        <input type="radio" name="userType" value="normal" checked={userType === 'normal'} onChange={() => setUserType('normal')} className="sr-only" />
                        <span className="font-bold text-sm text-slate-800">일반형</span>
                        <span className="text-xs text-slate-500 mt-1">비과세 한도 500만 원</span>
                      </label>
                      <label className={`cursor-pointer border-2 rounded-xl p-3 flex flex-col items-center text-center transition-all ${userType === 'seomin' ? 'border-teal-500 bg-teal-50/20' : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'}`}>
                        <input type="radio" name="userType" value="seomin" checked={userType === 'seomin'} onChange={() => setUserType('seomin')} className="sr-only" />
                        <span className="font-bold text-sm text-teal-600">서민형 (추천)</span>
                        <span className="text-xs text-slate-500 mt-1">비과세 한도 1,000만 원</span>
                      </label>
                    </div>
                  </div>

                  {/* Asset Type */}
                  <div>
                    <span className="block text-sm font-bold text-slate-700 mb-2">주요 투자 상품군</span>
                    <div className="grid grid-cols-2 gap-3">
                      <label className={`cursor-pointer border-2 rounded-xl p-3 flex justify-center items-center gap-2 text-center transition-all ${assetType === 'stock' ? 'border-teal-500 bg-teal-50/20' : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'}`}>
                        <input type="radio" name="assetType" value="stock" checked={assetType === 'stock'} onChange={() => setAssetType('stock')} className="sr-only" />
                        <span className="text-xs font-bold text-slate-700">국내 개별 주식<br/><span className="text-[10px] text-slate-400 font-normal">우대 수수료 0.0036396%</span></span>
                      </label>
                      <label className={`cursor-pointer border-2 rounded-xl p-3 flex justify-center items-center gap-2 text-center transition-all ${assetType === 'etf' ? 'border-teal-500 bg-teal-50/20' : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'}`}>
                        <input type="radio" name="assetType" value="etf" checked={assetType === 'etf'} onChange={() => setAssetType('etf')} className="sr-only" />
                        <span className="text-xs font-bold text-slate-700">국내 상장 ETF<br/><span className="text-[10px] text-slate-400 font-normal">우대 수수료 0.0042087%</span></span>
                      </label>
                    </div>
                  </div>

                  {/* Slider: Profit */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-bold text-slate-700">예상 투자 순수익 (배당금+차익)</label>
                      <span className="text-teal-600 font-extrabold text-lg"><span>{formatNumber(profitVal)}</span>만 원</span>
                    </div>
                    <input type="range" min="0" max="2000" step="50" value={profitVal} onChange={(e) => setProfitVal(parseInt(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-500" />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                      <span>0원</span>
                      <span>1,000만 원</span>
                      <span>2,000만 원</span>
                    </div>
                  </div>

                  {/* Slider: Volume */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-bold text-slate-700">연간 총 누적 거래 대금 (매수+매도)</label>
                      <span className="text-blue-600 font-extrabold text-lg"><span>{formatNumber(volumeVal)}</span>만 원</span>
                    </div>
                    <input type="range" min="0" max="10000" step="250" value={volumeVal} onChange={(e) => setVolumeVal(parseInt(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                      <span>0원</span>
                      <span>5,000만 원</span>
                      <span>1억 원</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Visual Result Chart & Summary */}
                <div className="space-y-6">
                  <div className="relative w-full h-[300px]">
                    <Bar data={chartData} options={chartOptions} />
                  </div>

                  <div className="p-5 rounded-2xl bg-teal-50/50 border border-teal-100 space-y-3">
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>일반 주식계좌 납부 비용 (세금+수수료)</span>
                      <span className="font-bold text-red-500">{formatNumber(taxSimResult.normalTotal)}원</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>중개형 ISA 계좌 납부 비용 (세금+우대수수료)</span>
                      <span className="font-bold text-teal-700">{formatNumber(taxSimResult.isaTotal)}원</span>
                    </div>
                    <div className="border-t border-teal-200/50 my-2 pt-2 flex justify-between items-center">
                      <div>
                        <span className="font-extrabold text-slate-800 text-sm">실제 순수익 절감금액</span>
                        <span className="block text-[10px] text-slate-400">(세금 비과세 + 거래 수수료 세이브)</span>
                      </div>
                      <span className="text-xl font-black text-teal-600">{formatNumber(taxSimResult.totalSavings)}원</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Pension Rollover Simulator */}
        {activeTab === 'calc-pension' && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
              <div className="mb-8">
                <h3 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <span className="bg-blue-500 text-white w-7 h-7 rounded-lg flex items-center justify-center text-sm">2</span>
                  ISA 만기 자금 연금저축 이관 세액공제 계산기
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  3년 만기 시 해지 원리금을 <b>연금저축(또는 IRP) 계좌로 이관</b>할 경우 지급받는 강력한 추가 세액공제 혜택을 시뮬레이션해 보세요. (이관액의 10%, 최대 300만 원 한도 세액공제)
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-10 items-center">
                <div className="space-y-6">
                  {/* Pension Rollover Slider */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-bold text-slate-700">연금계좌로 이관할 ISA 만기 자금</label>
                      <span className="text-blue-600 font-extrabold text-lg"><span>{formatNumber(rolloverVal)}</span>만 원</span>
                    </div>
                    <input type="range" min="0" max="10000" step="200" value={rolloverVal} onChange={(e) => setRolloverVal(parseInt(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                      <span>0원 (전환 안함)</span>
                      <span>5,000만 원</span>
                      <span>1억 원 (최대 납입액)</span>
                    </div>
                  </div>

                  {/* Income Class Selector */}
                  <div>
                    <span className="block text-sm font-bold text-slate-700 mb-2">나의 연간 총소득 구간</span>
                    <div className="grid grid-cols-2 gap-3">
                      <label className={`cursor-pointer border-2 rounded-xl p-3 flex flex-col items-center text-center transition-all ${incomeClass === 'low' ? 'border-blue-500 bg-blue-50/20' : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'}`}>
                        <input type="radio" name="incomeClass" value="low" checked={incomeClass === 'low'} onChange={() => setIncomeClass('low')} className="sr-only" />
                        <span className="font-bold text-sm text-slate-800">5,500만 원 이하</span>
                        <span className="text-xs text-blue-600 mt-1">세액공제율 16.5% 적용</span>
                      </label>
                      <label className={`cursor-pointer border-2 rounded-xl p-3 flex flex-col items-center text-center transition-all ${incomeClass === 'high' ? 'border-blue-500 bg-blue-50/20' : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'}`}>
                        <input type="radio" name="incomeClass" value="high" checked={incomeClass === 'high'} onChange={() => setIncomeClass('high')} className="sr-only" />
                        <span className="font-bold text-sm text-slate-800">5,500만 원 초과</span>
                        <span className="text-xs text-slate-500 mt-1">세액공제율 13.2% 적용</span>
                      </label>
                    </div>
                  </div>

                  {/* Highlight: Perfect Strategy Cycle Route */}
                  <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                    <span className="text-xs font-bold text-blue-700 block mb-2">💡 프로 재테크러들의 3년 절세 순환 루트</span>
                    <ol className="text-xs text-slate-600 space-y-1.5 list-decimal pl-4">
                      <li>만기일을 20년으로 길게 설정하여 납입한도 이월 및 장기복리 확보</li>
                      <li>가입 3년 경과 시점(의무기간 완수)에 계좌 해지 (비과세 정산)</li>
                      <li>해지 원리금을 60일 이내에 연금계좌로 이체하여 즉시 최대 300만 원 세액공제 확보</li>
                      <li>새로운 중개형 ISA를 재개설하여 비과세 한도(200만/400만)를 신규로 다시 생성!</li>
                    </ol>
                  </div>
                </div>

                {/* Right Column: Rollover results */}
                <div className="space-y-6">
                  <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-6 relative overflow-hidden">
                    <div className="absolute -right-10 -bottom-10 opacity-10 text-[10rem]">💰</div>
                    <div>
                      <span className="text-slate-400 text-xs font-semibold block uppercase">세액공제 대상 금액</span>
                      <h4 className="text-3xl font-black mt-1 text-teal-300">{formatNumber(pensionSimResult.pensionTarget)} 원</h4>
                      <p className="text-[11px] text-slate-500 mt-1">이관 금액의 10% (연금저축 한도 300만 원 캡 자동 적용)</p>
                    </div>

                    <hr className="border-slate-800" />

                    <div>
                      <span className="text-slate-400 text-xs font-semibold block">연말정산 시 실제 환급받을 가계 이득</span>
                      <h4 className="text-4xl font-black mt-2 text-yellow-300">{formatNumber(pensionSimResult.actualRefund)} 원</h4>
                      <p className="text-[11px] text-slate-400 mt-1">올해 연말정산 시 세이브되거나 현금으로 돌려받게 될 실질 환급액입니다.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <div className="px-4">
        <ShareButtons 
            title="2026 ISA 스마트 가이드" 
            description="중개형 ISA 수수료 절감액부터 만기 연금 전환 혜택까지 완벽히 분석하세요!" 
            kakaoAppKey="11032eefd7d0111cb94d93c0ab41eb01" 
        />
      </div>

      {/* Section 3: Maturity Configurator & Strategic Guide */}
      <section id="strategy-section" className="px-4 mt-12">
        <div className="bg-gradient-to-r from-teal-900 to-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-xl">
          <div className="max-w-3xl mb-10">
            <span className="text-xs font-bold text-teal-300 bg-teal-500/20 px-3 py-1 rounded-full">만기 설정 마스터 가이드</span>
            <h3 className="text-2xl md:text-3xl font-extrabold mt-4 mb-4">대충 설정했다간 15.4% 추징?<br/>만기 설정의 핵심 꿀팁</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              대부분의 개설 고객이 기본 3년이나 5년으로 만기 계약을 설정하지만, 재테크 고수들은 무조건 <b>'20년 이상'</b> 또는 가용 가능한 최대 계약 기간을 설정합니다. 왜 그럴까요?
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
              <div className="text-2xl mb-3">⏳</div>
              <h5 className="font-bold text-lg mb-2">만기일 도래 시 강제 정산</h5>
              <p className="text-xs text-slate-300 leading-relaxed">
                만기가 되면 원치 않더라도 계좌가 강제 폐쇄되고 주식/ETF를 전부 청산해야 하므로, 오랜 복리 효과가 끊기게 됩니다. 만기일은 무조건 길게 세팅하는 것이 좋습니다.
              </p>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
              <div className="text-2xl mb-3">🔄</div>
              <h5 className="font-bold text-lg mb-2">만기 후 연장은 불가능</h5>
              <p className="text-xs text-slate-300 leading-relaxed">
                만기일 당일이나 이미 지나버린 시점에는 증권사 앱에서 기한 연장이 불가능합니다. 연장은 무조건 <b>만기일 도래 최소 한 달 전</b>에 완료해 두셔야 안전합니다.
              </p>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
              <div className="text-2xl mb-3">💼</div>
              <h5 className="font-bold text-lg mb-2">3년 뒤 해지도 페널티 제로</h5>
              <p className="text-xs text-slate-300 leading-relaxed">
                만기일을 20년으로 길게 설정하더라도, 의무 가입 기간인 <b>3년만 지나면 언제든 페널티 없이</b> 해지하여 비과세 혜택 정산 및 출금이 가능합니다.
              </p>
            </div>
          </div>
          
          <div className="mt-8">
            <WordPressLink 
              title="중개형 ISA 만기일 설정 방법 변경 팁 3분 정리" 
              url="https://weknews.com/%ec%a4%91%ea%b0%9c%ed%98%95-isa-%eb%a7%8c%ea%b8%b0%ec%9d%bc-%ec%84%a4%ec%a0%95/" 
            />
          </div>
        </div>
      </section>

      {/* Section 4: Broker Matchmaker */}
      <section id="brokers-section" className="px-4 py-16">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">2026 5월 실시간 데이터 반영</span>
          <h3 className="text-2xl md:text-3xl font-extrabold text-slate-800 mt-2 mb-3">나에게 꼭 맞는 증권사 수수료 & 혜택 비교</h3>
          <p className="text-sm text-slate-500">MTS 비대면 채널 개설 시에만 적용되는 평생 우대 조건 및 숨겨진 증권사별 강점을 비교하세요.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Broker 1 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-teal-500 hover:shadow-lg transition-all flex flex-col justify-between">
            <div>
              <span className="text-xs font-extrabold text-slate-400 block mb-1">GLOBAL ASSETS</span>
              <h4 className="text-xl font-bold text-slate-800 mb-4">미래에셋증권</h4>
              <ul className="space-y-2.5 text-xs text-slate-600 mb-6">
                <li className="flex justify-between"><span>국내 주식 우대요율</span><strong className="text-slate-800">0.0036396%</strong></li>
                <li className="flex justify-between"><span>국내 ETF 우대요율</span><strong className="text-slate-800">0.0042087%</strong></li>
                <li className="border-t border-slate-100 my-1 pt-1"></li>
                <li className="text-slate-500">✔️ 해외 투자에 최적화된 환전 수수료 우대</li>
                <li className="text-slate-500">✔️ 연말까지 비대면 개설 시 평생 우대 자동 적용</li>
              </ul>
            </div>
            <a href="https://weknews.com" target="_blank" className="block w-full text-center py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all">혜택 자세히 보기</a>
          </div>

          {/* Broker 2 */}
          <div className="bg-white rounded-3xl p-6 border-2 border-teal-500 shadow-xl shadow-teal-50/50 hover:shadow-lg transition-all flex flex-col justify-between relative">
            <span className="absolute -top-3 right-6 bg-teal-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">HIT</span>
            <div>
              <span className="text-xs font-extrabold text-teal-500 block mb-1">MEMBER BENEFITS</span>
              <h4 className="text-xl font-bold text-slate-800 mb-4">삼성증권</h4>
              <ul className="space-y-2.5 text-xs text-slate-600 mb-6">
                <li className="flex justify-between"><span>국내 주식 우대요율</span><strong className="text-teal-600">0.0036396%</strong></li>
                <li className="flex justify-between"><span>국내 ETF 우대요율</span><strong className="text-teal-600">0.0042087%</strong></li>
                <li className="border-t border-slate-100 my-1 pt-1"></li>
                <li className="text-slate-500">✔️ 신규 야간 거래소(NXT) 수수료 면제</li>
                <li className="text-slate-500">✔️ 우수 운용사 주관 ETF 순매수 리워드 지급</li>
              </ul>
            </div>
            <a href="https://weknews.com" target="_blank" className="block w-full text-center py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold rounded-xl transition-all shadow-md">비대면 가입 신청하기</a>
          </div>

          {/* Broker 3 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-teal-500 hover:shadow-lg transition-all flex flex-col justify-between">
            <div>
              <span className="text-xs font-extrabold text-blue-500 block mb-1">IPO SPECIALTY</span>
              <h4 className="text-xl font-bold text-slate-800 mb-4">신한투자증권</h4>
              <ul className="space-y-2.5 text-xs text-slate-600 mb-6">
                <li className="flex justify-between"><span>국내 주식 우대요율</span><strong className="text-slate-800">0.0036396%</strong></li>
                <li className="flex justify-between"><span>국내 ETF 우대요율</span><strong className="text-slate-800">0.0042087%</strong></li>
                <li className="border-t border-slate-100 my-1 pt-1"></li>
                <li className="text-slate-500">✔️ ISA 1천만 원 예치 시 공모주 청약한도 300%</li>
                <li className="text-slate-500">✔️ 비대면 개설 즉시 모바일 커피 쿠폰 지급</li>
              </ul>
            </div>
            <a href="https://weknews.com" target="_blank" className="block w-full text-center py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all">이벤트 확인하기</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-10 border-t border-slate-200 text-xs text-slate-400 space-y-2">
        <p>© 2026 ISA Interactive Guide. All rights reserved.</p>
        <p>본 시뮬레이터 수수료 요율 및 세법은 weknews.com 포스팅 및 국세청 가이드를 준수하여 산출되었습니다.</p>
      </footer>
    </div>
  );
}
