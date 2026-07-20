"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import AdSenseBanner from "@/components/AdSenseBanner";
import ShareButtons from "@/components/ShareButtons";
import WordPressLink from "@/components/WordPressLink";

type PropertyType = "residential" | "commercial" | "land";
type HouseOwnership = "single" | "multi";
type CommercialType = "standard" | "factory" | "entertainment";
type LandType = "general" | "separate" | "farm" | "factory" | "entertainment";

export default function PropertyTaxCalculatorPage() {
  // Tab & Property selector
  const [propertyType, setPropertyType] = useState<PropertyType>("residential");
  
  // Inputs
  const [priceStr, setPriceStr] = useState("500,000,000"); // 공시가격 / 시가표준액
  const [houseOwnership, setHouseOwnership] = useState<HouseOwnership>("single");
  const [includeCityAreaTax, setIncludeCityAreaTax] = useState(true);
  const [prevTaxStr, setPrevTaxStr] = useState(""); // 직전연도 세액 (선택)
  
  // Sub-types
  const [commercialType, setCommercialType] = useState<CommercialType>("standard");
  const [landType, setLandType] = useState<LandType>("general");

  // Number Format Helpers
  const formatNumber = (num: number) => Math.floor(num).toLocaleString("ko-KR");
  const removeCommas = (str: string) => str.replace(/,/g, "");

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = removeCommas(e.target.value);
    if (value === "") {
      setPriceStr("");
      return;
    }
    if (!/^\d*$/.test(value)) {
      value = value.replace(/[^\d]/g, "");
    }
    const num = parseInt(value, 10);
    if (num > 1000000000000) { // 1조 원 한도
      setPriceStr(formatNumber(1000000000000));
    } else {
      setPriceStr(formatNumber(num || 0));
    }
  };

  const handlePrevTaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = removeCommas(e.target.value);
    if (value === "") {
      setPrevTaxStr("");
      return;
    }
    if (!/^\d*$/.test(value)) {
      value = value.replace(/[^\d]/g, "");
    }
    const num = parseInt(value, 10);
    setPrevTaxStr(formatNumber(num || 0));
  };

  const setQuickPrice = (val: number) => setPriceStr(formatNumber(val));

  // Korean monetary string helper (e.g. 5억 5,000만 원)
  const formatKRWText = (num: number) => {
    if (num <= 0) return "0원";
    const eok = Math.floor(num / 100000000);
    const man = Math.floor((num % 100000000) / 10000);
    const remainder = Math.floor(num % 10000);

    let result = "";
    if (eok > 0) result += `${eok}억 `;
    if (man > 0) result += `${man.toLocaleString("ko-KR")}만 `;
    if (remainder > 0 && eok === 0 && man === 0) result += `${remainder.toLocaleString("ko-KR")}`;
    
    return result.trim() + "원";
  };

  // Main Calculation Logic
  const calculationResult = useMemo(() => {
    const price = parseInt(removeCommas(priceStr), 10) || 0;
    const prevTax = parseInt(removeCommas(prevTaxStr), 10) || 0;

    if (price <= 0) {
      return {
        price: 0,
        fairMarketRate: 0,
        taxBase: 0,
        baseTax: 0,
        cappedTax: 0,
        isCapped: false,
        capRate: 0,
        cityAreaTax: 0,
        localEduTax: 0,
        totalTax: 0,
        specialRateApplied: false,
        paymentSchedule: { july: 0, september: 0, isSplit: false },
        comprehensiveTaxNotice: false,
      };
    }

    let fairMarketRate = 0.6; // 기본 공정시장가액비율
    let baseTax = 0;
    let specialRateApplied = false;
    let capRate = 1.3; // 기본 세부담상한

    if (propertyType === "residential") {
      // 1. 주택 공정시장가액비율 (2024~2026년 기준 1주택 특례)
      if (houseOwnership === "single") {
        if (price <= 300000000) {
          fairMarketRate = 0.43;
          capRate = 1.05;
        } else if (price <= 600000000) {
          fairMarketRate = 0.44;
          capRate = 1.10;
        } else {
          fairMarketRate = 0.45;
          capRate = 1.30;
        }
      } else {
        fairMarketRate = 0.60;
        if (price <= 300000000) capRate = 1.05;
        else if (price <= 600000000) capRate = 1.10;
        else capRate = 1.30;
      }

      const taxBase = Math.floor(price * fairMarketRate);

      // 2. 주택 재산세 산출 (1세대 1주택 공시가 9억 이하 특례세율 적용)
      if (houseOwnership === "single" && price <= 900000000) {
        specialRateApplied = true;
        if (taxBase <= 60000000) {
          baseTax = taxBase * 0.0005;
        } else if (taxBase <= 150000000) {
          baseTax = 30000 + (taxBase - 60000000) * 0.0015;
        } else if (taxBase <= 300000000) {
          baseTax = 165000 + (taxBase - 150000000) * 0.0025;
        } else {
          baseTax = 540000 + (taxBase - 300000000) * 0.0035;
        }
      } else {
        // 일반 세율
        if (taxBase <= 60000000) {
          baseTax = taxBase * 0.001;
        } else if (taxBase <= 150000000) {
          baseTax = 60000 + (taxBase - 60000000) * 0.0015;
        } else if (taxBase <= 300000000) {
          baseTax = 195000 + (taxBase - 150000000) * 0.0025;
        } else {
          baseTax = 570000 + (taxBase - 300000000) * 0.004;
        }
      }

      baseTax = Math.floor(baseTax);

      // 세부담 상한 검토
      let cappedTax = baseTax;
      let isCapped = false;
      if (prevTax > 0) {
        const maxAllowed = Math.floor(prevTax * capRate);
        if (baseTax > maxAllowed) {
          cappedTax = maxAllowed;
          isCapped = true;
        }
      }

      // 도시지역분 & 지방교육세
      const cityAreaTax = includeCityAreaTax ? Math.floor(taxBase * 0.0014) : 0;
      const localEduTax = Math.floor(cappedTax * 0.20);
      const totalTax = cappedTax + cityAreaTax + localEduTax;

      // 주택 납부 분할 (20만 원 기준)
      let july = 0;
      let september = 0;
      let isSplit = false;

      if (totalTax <= 200000) {
        july = totalTax;
        september = 0;
        isSplit = false;
      } else {
        july = Math.floor(totalTax / 2);
        september = totalTax - july;
        isSplit = true;
      }

      // 종합부동산세 안내 대상 (1주택 공시가 12억 초과, 다주택 공시가 9억 초과)
      const comprehensiveTaxNotice = (houseOwnership === "single" && price > 1200000000) || (houseOwnership === "multi" && price > 900000000);

      return {
        price,
        fairMarketRate,
        taxBase,
        baseTax,
        cappedTax,
        isCapped,
        capRate,
        cityAreaTax,
        localEduTax,
        totalTax,
        specialRateApplied,
        paymentSchedule: { july, september, isSplit },
        comprehensiveTaxNotice,
      };
    } else if (propertyType === "commercial") {
      // 건축물
      fairMarketRate = 0.70;
      const taxBase = Math.floor(price * fairMarketRate);

      let rate = 0.0025;
      if (commercialType === "factory") rate = 0.0050;
      else if (commercialType === "entertainment") rate = 0.0400;

      baseTax = Math.floor(taxBase * rate);
      
      let cappedTax = baseTax;
      let isCapped = false;
      if (prevTax > 0) {
        const maxAllowed = Math.floor(prevTax * 1.50); // 일반 건물 150% 상한
        if (baseTax > maxAllowed) {
          cappedTax = maxAllowed;
          isCapped = true;
        }
      }

      const cityAreaTax = includeCityAreaTax ? Math.floor(taxBase * 0.0014) : 0;
      const localEduTax = Math.floor(cappedTax * 0.20);
      const totalTax = cappedTax + cityAreaTax + localEduTax;

      return {
        price,
        fairMarketRate,
        taxBase,
        baseTax,
        cappedTax,
        isCapped,
        capRate: 1.50,
        cityAreaTax,
        localEduTax,
        totalTax,
        specialRateApplied: false,
        paymentSchedule: { july: totalTax, september: 0, isSplit: false },
        comprehensiveTaxNotice: false,
      };
    } else {
      // 토지
      fairMarketRate = 0.70;
      const taxBase = Math.floor(price * fairMarketRate);

      if (landType === "general") {
        // 종합합산
        if (taxBase <= 50000000) {
          baseTax = taxBase * 0.002;
        } else if (taxBase <= 100000000) {
          baseTax = 100000 + (taxBase - 50000000) * 0.003;
        } else {
          baseTax = 250000 + (taxBase - 100000000) * 0.005;
        }
      } else if (landType === "separate") {
        // 별도합산
        if (taxBase <= 200000000) {
          baseTax = taxBase * 0.002;
        } else if (taxBase <= 1000000000) {
          baseTax = 400000 + (taxBase - 200000000) * 0.003;
        } else {
          baseTax = 2800000 + (taxBase - 1000000000) * 0.004;
        }
      } else if (landType === "farm") {
        baseTax = taxBase * 0.0007; // 농지/임야 0.07%
      } else if (landType === "factory") {
        baseTax = taxBase * 0.0020; // 공장용지 0.2%
      } else {
        baseTax = taxBase * 0.0400; // 회원제 골프장/고급오락장 4.0%
      }

      baseTax = Math.floor(baseTax);

      let cappedTax = baseTax;
      let isCapped = false;
      if (prevTax > 0) {
        const maxAllowed = Math.floor(prevTax * 1.50); // 토지 150% 상한
        if (baseTax > maxAllowed) {
          cappedTax = maxAllowed;
          isCapped = true;
        }
      }

      const cityAreaTax = includeCityAreaTax ? Math.floor(taxBase * 0.0014) : 0;
      const localEduTax = Math.floor(cappedTax * 0.20);
      const totalTax = cappedTax + cityAreaTax + localEduTax;

      return {
        price,
        fairMarketRate,
        taxBase,
        baseTax,
        cappedTax,
        isCapped,
        capRate: 1.50,
        cityAreaTax,
        localEduTax,
        totalTax,
        specialRateApplied: false,
        paymentSchedule: { july: 0, september: totalTax, isSplit: false },
        comprehensiveTaxNotice: false,
      };
    }
  }, [priceStr, propertyType, houseOwnership, includeCityAreaTax, prevTaxStr, commercialType, landType]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header Title Banner */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-800 rounded-3xl p-6 md:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-56 h-56 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-blue-100 mb-3">
            2026년 최신 지방세법 개정안 반영
          </span>
          <h1 className="text-2xl md:text-4xl font-extrabold mb-3 leading-tight">
            🏢 2026년 재산세 자동 계산기
          </h1>
          <p className="text-blue-100 text-sm md:text-base max-w-2xl leading-relaxed">
            주택, 건물, 토지의 공시가격(시가표준액)을 입력하시면 <strong>1세대 1주택자 특례 세률</strong>, 
            <strong>공정시장가액비율(43~45%)</strong>, <strong>도시지역분</strong>, <strong>지방교육세</strong> 및 
            7월/9월 분할 납부액까지 실시간으로 계산해 드립니다.
          </p>
        </div>
      </div>

      {/* Main Form Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
            
            {/* 1. 과세 물건 선택 */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                1. 보유 부동산 유형 선택
              </label>
              <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-2xl">
                <button
                  onClick={() => setPropertyType("residential")}
                  className={`py-3 px-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
                    propertyType === "residential"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  🏠 주택 (아파트·빌라)
                </button>
                <button
                  onClick={() => setPropertyType("commercial")}
                  className={`py-3 px-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
                    propertyType === "commercial"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  🏬 건물 (상가·사무실)
                </button>
                <button
                  onClick={() => setPropertyType("land")}
                  className={`py-3 px-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
                    propertyType === "land"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  🏞️ 토지 (나대지·농지)
                </button>
              </div>
            </div>

            {/* 2. 상세 옵션 (주택: 세대 주택 수 / 건물 / 토지 유형) */}
            {propertyType === "residential" && (
              <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl space-y-3">
                <label className="block text-xs font-extrabold text-blue-900">
                  세대 주택 수 구분을 선택하세요
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setHouseOwnership("single")}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                      houseOwnership === "single"
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    ✨ 1세대 1주택자 (특례 세율 적용)
                  </button>
                  <button
                    onClick={() => setHouseOwnership("multi")}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                      houseOwnership === "multi"
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    🏢 다주택자 / 법인 (일반 세율)
                  </button>
                </div>
                <p className="text-[11px] text-blue-700 leading-snug">
                  * 1세대 1주택자는 공시가격 9억원 이하 주택에 대해 0.05%p 인하된 특례 세율과 43~45%의 인하된 공정시장가액비율이 자동 적용됩니다.
                </p>
              </div>
            )}

            {propertyType === "commercial" && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  건축물 용도 구분
                </label>
                <select
                  value={commercialType}
                  onChange={(e) => setCommercialType(e.target.value as CommercialType)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="standard">일반 건축물 (상가·사무실 등, 0.25%)</option>
                  <option value="factory">주거지역 내 공장용 건축물 (0.50%)</option>
                  <option value="entertainment">골프장 / 고급오락장용 건축물 (4.00%)</option>
                </select>
              </div>
            )}

            {propertyType === "land" && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  토지 과세 구분을 선택하세요
                </label>
                <select
                  value={landType}
                  onChange={(e) => setLandType(e.target.value as LandType)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="general">종합합산 (일반 나대지·잡종지·기준초과 토지)</option>
                  <option value="separate">별도합산 (일반 건축물의 부속토지 등)</option>
                  <option value="farm">분리과세 (농지·임야·목장용지, 0.07%)</option>
                  <option value="factory">분리과세 (공장용지, 0.20%)</option>
                  <option value="entertainment">분리과세 (회원제 골프장·고급오락장, 4.00%)</option>
                </select>
              </div>
            )}

            {/* 3. 공시가격 입력 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-slate-700">
                  {propertyType === "residential"
                    ? "주택 공시가격 (공동/단독주택 공시가격)"
                    : propertyType === "commercial"
                    ? "건물 시가표준액"
                    : "토지 개별공시지가 (합산가)"}
                </label>
                <a
                  href="https://www.realtyprice.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
                >
                  공시가격 조회하기 ↗
                </a>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={priceStr}
                  onChange={handlePriceChange}
                  placeholder="0"
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3.5 text-right font-black text-slate-800 text-lg md:text-xl focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-500">
                  원
                </span>
              </div>
              {priceStr && (
                <div className="mt-1.5 text-right text-xs font-bold text-blue-600">
                  ≈ {formatKRWText(parseInt(removeCommas(priceStr), 10) || 0)}
                </div>
              )}

              {/* 빠른 금액 버튼 */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {[100000000, 300000000, 500000000, 900000000, 1200000000, 1500000000, 2000000000].map((val) => (
                  <button
                    key={val}
                    onClick={() => setQuickPrice(val)}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                  >
                    +{val >= 100000000 ? `${val / 100000000}억` : `${val / 10000}만`}
                  </button>
                ))}
                <button
                  onClick={() => setPriceStr("")}
                  className="px-2 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-semibold rounded-lg transition-colors ml-auto"
                >
                  초기화
                </button>
              </div>
            </div>

            {/* 4. 부가 옵션 (도시지역분 / 직전연도 세액) */}
            <div className="border-t border-slate-100 pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-700 block">
                    도시지역분 과세 포함 여부
                  </span>
                  <span className="text-[11px] text-slate-400">
                    대부분 도시지역 소재 부동산은 대상입니다 (과세표준의 0.14%)
                  </span>
                </div>
                <button
                  onClick={() => setIncludeCityAreaTax(!includeCityAreaTax)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                    includeCityAreaTax ? "bg-blue-600" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      includeCityAreaTax ? "translate-x-6" : "translate-x-0"
                    }`}
                  ></div>
                </button>
              </div>

              {/* 직전연도 세액 입력 (세부담상한 한도 계산) */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    직전연도 재산세액 (선택 입력)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    세부담상한선(105%~130%) 적용 시 입력
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={prevTaxStr}
                    onChange={handlePrevTaxChange}
                    placeholder="입력 시 상한 제한 세액 계산"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-right font-bold text-slate-800 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    원
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xl sticky top-20 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                <span>📋 예상 세액 산출 결과</span>
              </h2>
              {calculationResult.specialRateApplied && (
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[11px] font-bold rounded-md">
                  1주택 특례 적용
                </span>
              )}
            </div>

            {/* Total Tax Display */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white space-y-2 relative overflow-hidden">
              <span className="text-xs text-slate-400 font-bold block">
                총 납부 예상 세액 (재산세+도시지역분+지방교육세)
              </span>
              <div className="text-3xl md:text-4xl font-black text-emerald-400 tracking-tight">
                {formatNumber(calculationResult.totalTax)}
                <span className="text-xl font-normal text-white ml-1">원</span>
              </div>
              <p className="text-xs text-slate-300 font-semibold pt-1">
                ≈ {formatKRWText(calculationResult.totalTax)}
              </p>
            </div>

            {/* Comprehensive Real Estate Tax Warning Alert */}
            {calculationResult.comprehensiveTaxNotice && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-800">
                  <span>⚠️</span>
                  <span>종합부동산세(종부세) 과세대상 가능성</span>
                </div>
                <p className="text-[11px] text-amber-700 leading-snug">
                  보유 주택 공시가격이 종부세 공제기준(1세대 1주택자 12억 원, 다주택자 9억 원)을 초과하므로 12월에 추가 종부세가 부과될 수 있습니다.
                </p>
              </div>
            )}

            {/* Breakdown Table */}
            <div className="space-y-3 text-xs md:text-sm">
              <div className="flex justify-between items-center text-slate-600">
                <span>과세표준 (공정시장가율 {(calculationResult.fairMarketRate * 100).toFixed(0)}%)</span>
                <span className="font-bold text-slate-800">{formatNumber(calculationResult.taxBase)} 원</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>순수 재산세액</span>
                <span className="font-bold text-slate-800">
                  {formatNumber(calculationResult.baseTax)} 원
                  {calculationResult.isCapped && (
                    <span className="text-[10px] text-rose-500 block text-right font-normal">
                      (상한제한 적용: {formatNumber(calculationResult.cappedTax)}원)
                    </span>
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>도시지역분 (0.14%)</span>
                <span className="font-bold text-slate-800">{formatNumber(calculationResult.cityAreaTax)} 원</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>지방교육세 (재산세의 20%)</span>
                <span className="font-bold text-slate-800">{formatNumber(calculationResult.localEduTax)} 원</span>
              </div>
            </div>

            {/* Payment Schedule Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-extrabold text-slate-700 flex items-center justify-between">
                <span>📅 납부 일정 및 금액</span>
                {calculationResult.paymentSchedule.isSplit && (
                  <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-bold border border-blue-200">
                    2회 분납 대상 (20만원 초과)
                  </span>
                )}
              </h3>

              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-blue-600 block">1차 (7월 납부)</span>
                  <span className="text-[10px] text-slate-400 block">7.16 ~ 7.31</span>
                  <span className="font-extrabold text-slate-800 block text-sm">
                    {formatNumber(calculationResult.paymentSchedule.july)}원
                  </span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-indigo-600 block">2차 (9월 납부)</span>
                  <span className="text-[10px] text-slate-400 block">9.16 ~ 9.30</span>
                  <span className="font-extrabold text-slate-800 block text-sm">
                    {formatNumber(calculationResult.paymentSchedule.september)}원
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 text-center">
                * 주택 재산세는 20만 원 이하일 경우 7월에 전액(100%) 일시 부과될 수 있습니다.
              </p>
            </div>

            {/* Share Buttons */}
            <div className="pt-2">
              <ShareButtons
                title="2026년 재산세 계산기 - FinInsight"
                description={`내 부동산 예상 재산세: 약 ${formatNumber(calculationResult.totalTax)}원! 실시간 재산세, 도시지역분, 지방교육세를 바로 계산해보세요.`}
                kakaoAppKey={process.env.NEXT_PUBLIC_KAKAO_APP_KEY || ""}
              />
            </div>
          </div>
        </div>
      </div>

      {/* AdSense Banner */}
      <div className="my-8">
        <AdSenseBanner dataAdSlot="1234567890" />
      </div>

      {/* Information & FAQ Guide Section */}
      <div className="bg-white rounded-3xl p-6 md:p-10 border border-slate-200 shadow-sm space-y-8">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 mb-4 flex items-center gap-2">
            💡 2026년 재산세 부과 기준 및 완벽 계산 가이드
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            재산세는 매년 <strong>6월 1일(과세기준일)</strong> 기준 부동산(주택, 토지, 건물 등)을 소유하고 있는 사람에게 부과되는 대표적인 지방세입니다. 6월 1일 당일 소유권을 가지고 있는 경우 1년 치 재산세를 납부할 의무가 생깁니다.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1">
                📌 공정시장가액비율이란?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                세금을 계산할 때 공시가격 그대로를 적용하지 않고 일정 비율을 곱해 과세표준을 만듭니다. 
                2026년 기준 <strong>1세대 1주택자 특례</strong>는 공시가격 3억 이하 43%, 6억 이하 44%, 6억 초과 45%가 적용되며 다주택자는 60%, 토지/건물은 70%가 적용됩니다.
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1">
                🛡️ 1세대 1주택자 특례 세율 혜택
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                공시가격 9억 원 이하인 1세대 1주택 소유자는 구역별 재산세율이 일반 세율 대비 <strong>구간별 0.05%p 인하</strong>된 특례 세율(0.05% ~ 0.35%)이 적용되어 세 부담이 절감됩니다.
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1">
                📈 세부담 상한제란?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                공시가격이 급등하여 재산세가 전년 대비 급격히 증가하는 것을 방지하기 위해 상한을 둡니다. 
                주택 공시가격 3억 이하(105%), 6억 이하(110%), 6억 초과(130%) 한도를 넘지 않도록 제한합니다.
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1">
                🗓️ 재산세 납부 기간
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>주택:</strong> 1차 7월 16일~31일 (50%), 2차 9월 16일~30일 (50%)<br />
                <strong>건물:</strong> 7월 16일~31일 전액 납부<br />
                <strong>토지:</strong> 9월 16일~30일 전액 납부
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Accordion Section */}
        <div className="border-t border-slate-100 pt-6 space-y-4">
          <h3 className="text-lg font-black text-slate-800">
            ❓ 자주 묻는 질문 (FAQ)
          </h3>

          <div className="space-y-3">
            <details className="group bg-slate-50 border border-slate-200 rounded-2xl p-4 cursor-pointer">
              <summary className="font-bold text-slate-800 text-sm flex justify-between items-center">
                <span>Q. 6월 2일에 집을 매매하여 이사했습니다. 올해 재산세는 누구 납부인가요?</span>
                <span className="group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                재산세 과세기준일은 <strong>매년 6월 1일</strong>입니다. 6월 1일 현재 잔금을 지급했거나 등기를 마친 매수인(양수인)이 당해 연도 전체 재산세를 납부해야 합니다. 6월 2일 매수셨다면 6월 1일 당시 소유자였던 전 주인이 1년 치 재산세를 납부합니다.
              </p>
            </details>

            <details className="group bg-slate-50 border border-slate-200 rounded-2xl p-4 cursor-pointer">
              <summary className="font-bold text-slate-800 text-sm flex justify-between items-center">
                <span>Q. 오피스텔도 주택 재산세가 적용되나요?</span>
                <span className="group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                오피스텔은 기본적으로 업무시설(건물+토지) 재산세가 부과됩니다. 단, 주거용으로 관할 지자체에 재산세 주거용 변동 신고를 마친 경우 주택 재산세율 및 공정시장가액비율이 적용될 수 있습니다.
              </p>
            </details>

            <details className="group bg-slate-50 border border-slate-200 rounded-2xl p-4 cursor-pointer">
              <summary className="font-bold text-slate-800 text-sm flex justify-between items-center">
                <span>Q. 재산세와 종합부동산세(종부세)는 어떻게 다른가요?</span>
                <span className="group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                <strong>재산세</strong>는 지자체에서 부과하는 지방세로 모든 부동산 소유자에게 부과됩니다. 반면 <strong>종합부동산세</strong>는 국세청에서 부과하는 국세로 인별 보유 주택 공시가격 합계가 일정 기준(1주택자 12억 원, 다주택자 9억 원)을 초과할 때 12월에 추가 부과됩니다.
              </p>
            </details>
          </div>
        </div>

        {/* Related Calculators Links */}
        <div className="border-t border-slate-100 pt-6">
          <h3 className="text-xs font-bold text-slate-400 mb-3">연관된 세금 및 부동산 계산기</h3>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/calculators/real-estate-tax"
              className="px-3 py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded-xl hover:bg-blue-100 transition-colors"
            >
              🏠 부동산 취득세 계산기
            </Link>
            <Link
              href="/calculators/gift-tax"
              className="px-3 py-2 bg-violet-50 text-violet-700 text-xs font-bold rounded-xl hover:bg-violet-100 transition-colors"
            >
              🎁 증여세 계산기
            </Link>
            <Link
              href="/calculators/inheritance-tax"
              className="px-3 py-2 bg-purple-50 text-purple-700 text-xs font-bold rounded-xl hover:bg-purple-100 transition-colors"
            >
              🪦 상속세 계산기
            </Link>
            <Link
              href="/calculators/apartment-roi"
              className="px-3 py-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl hover:bg-emerald-100 transition-colors"
            >
              📈 아파트 투자 수익률 계산기
            </Link>
          </div>
        </div>

        {/* WordPress Link */}
        <WordPressLink title="2026년 재산세 계산 및 세부담상한 절세 가이드" url="https://weknews.com/%eb%b6%80%eb%8f%99%ec%82%b0-%ec%9e%ac%ec%82%b0%ec%84%b8-%ea%b3%84%ec%82%b0%ea%b8%b0/" />
      </div>
    </div>
  );
}
