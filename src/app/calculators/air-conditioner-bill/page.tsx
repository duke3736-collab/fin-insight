"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import AdSenseBanner from "@/components/AdSenseBanner";
import ShareButtons from "@/components/ShareButtons";
import WordPressLink from "@/components/WordPressLink";

// 에어컨 프리셋 정보
const PRESETS = [
  { id: "700", name: "벽걸이형 소형 (700W)", value: 700 },
  { id: "1000", name: "벽걸이형 중형 (1000W)", value: 1000 },
  { id: "1600", name: "스탠드형 소형 (1600W)", value: 1600 },
  { id: "2200", name: "스탠드형 대형 (2200W)", value: 2200 },
  { id: "1200", name: "이동식 에어컨 (1200W)", value: 1200 },
  { id: "1800", name: "시스템 에어컨 1대 (1800W)", value: 1800 },
  { id: "custom", name: "직접 입력", value: 0 }
];

interface TariffResult {
  basePrice: number;
  energyPrice: number;
  adjustTotal: number;
  subTotal: number;
  vat: number;
  fund: number;
  total: number;
}

export default function AirConditionerBillPage() {
  const [currentMode, setCurrentMode] = useState<"simple" | "advanced">("simple");
  const [contractType, setContractType] = useState<"low" | "high">("low");
  const [preset, setPreset] = useState("700");
  const [power, setPower] = useState<number>(700);
  const [count, setCount] = useState<number>(1);
  const [hours, setHours] = useState<number>(6.0);
  const [days, setDays] = useState<number>(30);
  const [unitPrice, setUnitPrice] = useState<number>(160);
  const [baseUsage, setBaseUsage] = useState<number>(250);
  const [adjustPrice, setAdjustPrice] = useState<number>(0);
  
  const [showResult, setShowResult] = useState(false);
  const [calculatedData, setCalculatedData] = useState<{
    acName: string;
    power: number;
    count: number;
    hourKwh: number;
    dayKwh: number;
    monthKwh: number;
    addedDayPrice: number;
    addedMonthPrice: number;
    before?: TariffResult;
    after?: TariffResult;
    totalKwh?: number;
  } | null>(null);

  // 프리셋 변경 핸들러
  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setPreset(selectedId);
    if (selectedId !== "custom") {
      const selected = PRESETS.find(p => p.id === selectedId);
      if (selected) setPower(selected.value);
    }
  };

  // 프리셋 동기화 핸들러 (직접 입력값 변경 시 프리셋을 '직접 입력'으로 전환)
  const handlePowerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) || 0;
    setPower(val);
    const standardValues = ["700", "1000", "1600", "2200", "1200", "1800"];
    if (!standardValues.includes(val.toString())) {
      setPreset("custom");
    } else {
      setPreset(val.toString());
    }
  };

  // 한전 주택용 누진요금 계산 상세 함수
  const getKoreaTariffDetails = (kwh: number, isHighVolt: boolean, adjustUnit: number): TariffResult => {
    let basePrice = 0;
    let energyPrice = 0;

    if (!isHighVolt) {
      if (kwh <= 300) {
        basePrice = 910; energyPrice = kwh * 120.0;
      } else if (kwh <= 450) {
        basePrice = 1600; energyPrice = (300 * 120.0) + ((kwh - 300) * 214.6);
      } else {
        basePrice = 7300; energyPrice = (300 * 120.0) + (150 * 214.6) + ((kwh - 450) * 307.3);
      }
    } else {
      if (kwh <= 300) {
        basePrice = 730; energyPrice = kwh * 105.0;
      } else if (kwh <= 450) {
        basePrice = 1260; energyPrice = (300 * 105.0) + ((kwh - 300) * 174.0);
      } else {
        basePrice = 5700; energyPrice = (300 * 105.0) + (150 * 174.0) + ((kwh - 450) * 242.3);
      }
    }

    const adjustTotal = Math.floor(kwh * adjustUnit);
    const subTotal = basePrice + energyPrice + adjustTotal;
    const vat = Math.round(subTotal * 0.1);
    const fund = Math.floor(subTotal * 0.032 / 10) * 10;
    const total = Math.floor((subTotal + vat + fund) / 10) * 10;

    return { basePrice, energyPrice, adjustTotal, subTotal, vat, fund, total };
  };

  // 계산 수행
  const handleCalculate = () => {
    const selectedPreset = PRESETS.find(p => p.id === preset);
    const acName = selectedPreset ? selectedPreset.name.split(" (")[0] : "직접 입력 에어컨";
    
    const hourKwh = (power * count) / 1000;
    const dayKwh = hourKwh * hours;
    const monthKwh = dayKwh * days;

    let addedMonthPrice = 0;
    let addedDayPrice = 0;
    let before: TariffResult | undefined;
    let after: TariffResult | undefined;
    let totalKwh: number | undefined;

    if (currentMode === "simple") {
      addedMonthPrice = monthKwh * unitPrice;
      addedDayPrice = dayKwh * unitPrice;
    } else {
      totalKwh = baseUsage + monthKwh;
      const isHigh = contractType === "high";

      before = getKoreaTariffDetails(baseUsage, isHigh, adjustPrice);
      after = getKoreaTariffDetails(totalKwh, isHigh, adjustPrice);
      
      addedMonthPrice = Math.max(0, after.total - before.total);
      
      // 하루 분할 매칭 오차 보정
      const oneDayAfter = getKoreaTariffDetails(baseUsage + dayKwh, isHigh, adjustPrice);
      addedDayPrice = Math.max(0, oneDayAfter.total - before.total);
    }

    setCalculatedData({
      acName,
      power,
      count,
      hourKwh,
      dayKwh,
      monthKwh,
      addedDayPrice,
      addedMonthPrice,
      before,
      after,
      totalKwh
    });
    setShowResult(true);
    
    // 계산 완료 후 결과창 영역으로 부드럽게 스크롤
    setTimeout(() => {
      document.getElementById("result-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // 초기화
  const handleReset = () => {
    setPreset("700");
    setPower(700);
    setCount(1);
    setHours(6.0);
    setDays(30);
    setUnitPrice(160);
    setBaseUsage(250);
    setAdjustPrice(0);
    setShowResult(false);
    setCalculatedData(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Navigation */}
      <nav className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-4">
        <Link href="/" className="hover:text-slate-800">홈</Link>
        <span>›</span>
        <span>생활 계산기</span>
        <span>›</span>
        <span className="text-slate-800 font-bold">에어컨 전기세 계산기</span>
      </nav>

      {/* AdSense Top */}
      <AdSenseBanner dataAdSlot="4122383889" />

      {/* Widget Container */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-500 text-white p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="relative z-10 flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-xl">
              <span className="text-2xl">🔌</span>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">에어컨 전기세 계산기</h1>
              <p className="text-blue-100 text-sm mt-1">인버터/정속형, 주택용 저압/고압 누진 요금 완벽 분석</p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 md:p-8 space-y-6">
          {/* 계산 방식 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
            <label className="text-sm font-bold text-slate-700 md:text-right md:pr-6">계산 방식</label>
            <div className="md:col-span-2 flex gap-2">
              <button
                type="button"
                onClick={() => { setCurrentMode("simple"); setShowResult(false); }}
                className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                  currentMode === "simple"
                    ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/10"
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                }`}
              >
                간편 계산
              </button>
              <button
                type="button"
                onClick={() => { setCurrentMode("advanced"); setShowResult(false); }}
                className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                  currentMode === "advanced"
                    ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/10"
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                }`}
              >
                가정용 누진 참고 계산
              </button>
            </div>
          </div>

          {/* 에어컨 종류 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
            <label className="text-sm font-bold text-slate-700 md:text-right md:pr-6">에어컨 종류</label>
            <div className="md:col-span-2">
              <select
                id="preset"
                value={preset}
                onChange={handlePresetChange}
                className="w-full max-w-md bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              >
                {PRESETS.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 소비 전력 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
            <label className="text-sm font-bold text-slate-700 md:text-right md:pr-6">선택한 소비 전력</label>
            <div className="md:col-span-2 relative max-w-xs">
              <input
                type="number"
                value={power || ""}
                onChange={handlePowerChange}
                readOnly={preset !== "custom"}
                placeholder="직접 소비전력을 입력해 주세요"
                className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-4 pr-12 text-sm font-semibold text-slate-800 outline-none transition-all ${
                  preset === "custom"
                    ? "focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    : "bg-slate-100/80 text-slate-400 cursor-not-allowed"
                }`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">W</span>
            </div>
          </div>

          {/* 에어컨 대수 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
            <label className="text-sm font-bold text-slate-700 md:text-right md:pr-6">
              <span className="text-red-500 mr-0.5">*</span>에어컨 대수
            </label>
            <div className="md:col-span-2 relative max-w-xs">
              <input
                type="number"
                value={count}
                min={1}
                onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          {/* 하루 사용시간 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
            <label className="text-sm font-bold text-slate-700 md:text-right md:pr-6">
              <span className="text-red-500 mr-0.5">*</span>하루 사용시간
            </label>
            <div className="md:col-span-2 relative max-w-xs">
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="24"
                value={hours}
                onChange={(e) => setHours(Math.min(24, Math.max(0.1, parseFloat(e.target.value) || 0)))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-4 pr-16 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">시간</span>
            </div>
          </div>

          {/* 월 사용일수 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
            <label className="text-sm font-bold text-slate-700 md:text-right md:pr-6">
              <span className="text-red-500 mr-0.5">*</span>월 사용일수
            </label>
            <div className="md:col-span-2 relative max-w-xs">
              <input
                type="number"
                min="1"
                max="31"
                value={days}
                onChange={(e) => setDays(Math.min(31, Math.max(1, parseInt(e.target.value) || 30)))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-4 pr-12 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">일</span>
            </div>
          </div>

          {/* 간편 계산 전용 필드 */}
          {currentMode === "simple" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-start">
              <label className="text-sm font-bold text-slate-700 md:text-right md:pr-6 pt-3">
                <span className="text-red-500 mr-0.5">*</span>kWh당 단가
              </label>
              <div className="md:col-span-2 space-y-1">
                <div className="relative max-w-xs">
                  <input
                    type="number"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-4 pr-20 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">원/kWh</span>
                </div>
                <span className="text-[11px] text-slate-400 block max-w-md leading-relaxed">
                  ※ 가정용 전기요금은 누진제, 주택종별 세금에 따라 단가가 달라집니다. 자세한 계산을 원하시면 '가정용 누진 참고 계산' 방식을 선택하세요.
                </span>
              </div>
            </div>
          )}

          {/* 누진 참고 계산 전용 필드 */}
          {currentMode === "advanced" && (
            <div className="space-y-6 border-t border-slate-100 pt-6">
              {/* 가정용 계약종별 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                <label className="text-sm font-bold text-slate-700 md:text-right md:pr-6">가정용 계약종별</label>
                <div className="md:col-span-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setContractType("low")}
                    className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                      contractType === "low"
                        ? "bg-slate-800 border-slate-800 text-white"
                        : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    주택용 저압
                  </button>
                  <button
                    type="button"
                    onClick={() => setContractType("high")}
                    className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                      contractType === "high"
                        ? "bg-slate-800 border-slate-800 text-white"
                        : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    주택용 고압
                  </button>
                </div>
              </div>

              {/* 기존 월 사용량 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-start">
                <label className="text-sm font-bold text-slate-700 md:text-right md:pr-6 pt-3">
                  <span className="text-red-500 mr-0.5">*</span>기존 월 사용량
                </label>
                <div className="md:col-span-2 space-y-1">
                  <div className="relative max-w-xs">
                    <input
                      type="number"
                      value={baseUsage}
                      onChange={(e) => setBaseUsage(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-4 pr-16 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">kWh</span>
                  </div>
                  <span className="text-[11px] text-slate-400 block max-w-md leading-relaxed">
                    ※ 에어컨을 켜기 전, 순수 가전제품/전등으로 매월 사용하는 집 전체의 평균 전기 사용량입니다.
                  </span>
                </div>
              </div>

              {/* 연료비 조정 단가 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-start">
                <label className="text-sm font-bold text-slate-700 md:text-right md:pr-6 pt-3">연료비조정단가</label>
                <div className="md:col-span-2 space-y-1">
                  <div className="relative max-w-xs">
                    <input
                      type="number"
                      value={adjustPrice}
                      onChange={(e) => setAdjustPrice(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-4 pr-20 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">원/kWh</span>
                  </div>
                  <span className="text-[11px] text-slate-400 block max-w-md leading-relaxed">
                    ※ 모르면 기본값 0으로 두고 사용하세요. (전기요금 고지서의 항목 중 연료비조정단가를 말함)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Button Group */}
          <div className="flex justify-center gap-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={handleCalculate}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 text-sm flex items-center justify-center gap-1.5 active:scale-95"
            >
              <span>계산하기</span> <span>⚡</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold px-8 py-3.5 rounded-xl transition-all text-sm active:scale-95"
            >
              초기화
            </button>
          </div>
        </div>

        {/* Result Area */}
        {showResult && calculatedData && (
          <div id="result-section" className="bg-slate-50/50 border-t border-slate-200 p-6 md:p-8 space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 border-b border-slate-200 pb-3 mb-4">🖥️ 계산 결과</h2>

            {/* 1. 사용량 요약 */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-slate-100 px-4 py-3 font-bold text-sm text-slate-700">사용량 분석 요약</div>
              <div className="divide-y divide-slate-100">
                <div className="flex justify-between p-4 text-sm font-medium">
                  <span className="text-slate-500">선택 에어컨 사양</span>
                  <span className="text-slate-800 font-bold">{calculatedData.acName} / {calculatedData.count}대</span>
                </div>
                <div className="flex justify-between p-4 text-sm font-medium">
                  <span className="text-slate-500">제품 소비전력</span>
                  <span className="text-slate-800 font-bold">{calculatedData.power.toLocaleString()}W</span>
                </div>
                <div className="flex justify-between p-4 text-sm font-medium">
                  <span className="text-slate-500">1시간 사용량</span>
                  <span className="text-slate-800 font-bold">{calculatedData.hourKwh.toFixed(2)} kWh</span>
                </div>
                <div className="flex justify-between p-4 text-sm font-medium">
                  <span className="text-slate-500">하루 사용량 ({hours}시간)</span>
                  <span className="text-slate-800 font-bold">{calculatedData.dayKwh.toFixed(2)} kWh</span>
                </div>
                <div className="flex justify-between p-4 text-sm font-medium bg-blue-50/20">
                  <span className="text-blue-600 font-bold">예상 월간 총 사용량 ({days}일)</span>
                  <span className="text-blue-600 font-extrabold">{Math.round(calculatedData.monthKwh).toLocaleString()} kWh</span>
                </div>
              </div>
            </div>

            {/* 2. 예상 요금 요약 */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-slate-100 px-4 py-3 font-bold text-sm text-slate-700">요금 분석 요약 (추가 요금)</div>
              <div className="divide-y divide-slate-100">
                <div className="flex justify-between p-4 text-sm font-medium">
                  <span className="text-slate-500">하루 추가 예상 요금</span>
                  <span className="text-slate-800 font-bold">{Math.round(calculatedData.addedDayPrice).toLocaleString()} 원</span>
                </div>
                <div className="flex justify-between p-4 text-base font-extrabold bg-blue-500/5">
                  <span className="text-blue-600">월 추가 예상 전기세</span>
                  <span className="text-blue-600 text-lg font-black">{Math.round(calculatedData.addedMonthPrice).toLocaleString()} 원</span>
                </div>
                <div className="flex justify-between p-4 text-sm font-medium">
                  <span className="text-slate-500">한 시즌(3개월) 추가 예상 요금</span>
                  <span className="text-slate-800 font-bold">{Math.round(calculatedData.addedMonthPrice * 3).toLocaleString()} 원</span>
                </div>
                <div className="flex justify-between p-4 text-sm font-medium">
                  <span className="text-slate-500">연간(12개월) 누적 추가 예상 요금</span>
                  <span className="text-slate-800 font-bold">{Math.round(calculatedData.addedMonthPrice * 12).toLocaleString()} 원</span>
                </div>
              </div>
            </div>

            {/* 3. 누진 상세 결과 리포트 */}
            {currentMode === "advanced" && calculatedData.before && calculatedData.after && (
              <div className="space-y-4">
                <h3 className="text-md font-bold text-slate-800">📊 가정용 누진제 요금 변화 리포트</h3>
                
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 text-sm text-slate-700 leading-relaxed font-semibold">
                  기존 월 사용량 <span className="text-slate-900 font-bold">{baseUsage.toLocaleString()} kWh</span> 대비, 에어컨 사용 시 집 전체 사용량이 <span className="text-slate-900 font-bold">{Math.round(calculatedData.totalKwh || 0).toLocaleString()} kWh</span>로 증가하게 되며, 이에 따른 월 총 청구 요금은 기존 <span className="text-slate-600">{calculatedData.before.total.toLocaleString()}원</span>에서 <span className="text-blue-600 font-bold">{calculatedData.after.total.toLocaleString()}원</span>으로 변경됩니다. (순수 에어컨 추가 전기세 부담액: <span className="text-red-500 font-bold">{Math.round(calculatedData.addedMonthPrice).toLocaleString()}원</span>)
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200">
                        <th className="p-3 text-left font-bold text-slate-700">항목</th>
                        <th className="p-3 text-right font-bold text-slate-700">에어컨 사용 전</th>
                        <th className="p-3 text-right font-bold text-slate-700">에어컨 사용 후</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-right">
                      <tr>
                        <td className="p-3 text-left font-semibold text-slate-500">사용량 기준</td>
                        <td className="p-3 font-bold text-slate-800">{baseUsage.toLocaleString()} kWh</td>
                        <td className="p-3 font-bold text-slate-800">{Math.round(calculatedData.totalKwh || 0).toLocaleString()} kWh</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-left font-semibold text-slate-500">기본 요금</td>
                        <td className="p-3 text-slate-800">{calculatedData.before.basePrice.toLocaleString()} 원</td>
                        <td className="p-3 text-slate-800">{calculatedData.after.basePrice.toLocaleString()} 원</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-left font-semibold text-slate-500">전력량 요금</td>
                        <td className="p-3 text-slate-800">{calculatedData.before.energyPrice.toLocaleString()} 원</td>
                        <td className="p-3 text-slate-800">{calculatedData.after.energyPrice.toLocaleString()} 원</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-left font-semibold text-slate-500">연료비조정액</td>
                        <td className="p-3 text-slate-800">{calculatedData.before.adjustTotal.toLocaleString()} 원</td>
                        <td className="p-3 text-slate-800">{calculatedData.after.adjustTotal.toLocaleString()} 원</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-left font-semibold text-slate-500">전기요금 합계(세전)</td>
                        <td className="p-3 text-slate-800">{calculatedData.before.subTotal.toLocaleString()} 원</td>
                        <td className="p-3 text-slate-800">{calculatedData.after.subTotal.toLocaleString()} 원</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-left font-semibold text-slate-500">부가가치세 (10%)</td>
                        <td className="p-3 text-slate-800">{calculatedData.before.vat.toLocaleString()} 원</td>
                        <td className="p-3 text-slate-800">{calculatedData.after.vat.toLocaleString()} 원</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-left font-semibold text-slate-500">전력산업기반기금 (3.2%)</td>
                        <td className="p-3 text-slate-800">{calculatedData.before.fund.toLocaleString()} 원</td>
                        <td className="p-3 text-slate-800">{calculatedData.after.fund.toLocaleString()} 원</td>
                      </tr>
                      <tr className="bg-slate-50/80 font-bold border-t-2 border-slate-200">
                        <td className="p-3 text-left font-extrabold text-slate-700">최종 청구 요금</td>
                        <td className="p-3 text-slate-800 font-extrabold">{calculatedData.before.total.toLocaleString()} 원</td>
                        <td className="p-3 text-red-500 font-black text-base">{calculatedData.after.total.toLocaleString()} 원</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="pt-4">
              <ShareButtons 
                title="에어컨 전기세 누진세 계산기" 
                description={`선택한 에어컨의 소비전력과 가동시간에 따른 누진 전기 요금 모의 시뮬레이터 결과입니다!`} 
                kakaoAppKey="11032eefd7d0111cb94d93c0ab41eb01" 
              />
            </div>
          </div>
        )}
      </div>

      {/* SEO & Guide Section */}
      <article className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-10 mt-12">
        <section>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 border-b-2 border-slate-100 pb-3 mb-5">에어컨 인버터형 vs 정속형 구별법 및 전기세 절약 팁</h2>
          <p className="text-slate-800 text-[15px] leading-relaxed mb-4">
            에어컨은 작동 방식에 따라 크게 <strong>인버터형</strong>과 <strong>정속형</strong>으로 나뉩니다. 자신의 에어컨 형태에 맞춰 켜두는 방식을 다르게 해야 전기 요금을 최대 50%까지 절약할 수 있습니다.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🔄</span>
                <h3 className="font-extrabold text-slate-900">인버터형 에어컨 (2011년 이후 대다수 제품)</h3>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                설정 온도에 도달하면 실외기 모터 속도를 줄여 최소한의 전력으로 온도를 유지합니다.
                <br/><br/>
                <strong>💡 절약 팁:</strong> 켰다 껐다를 반복하지 말고 **계속 켜두는 것(외출 시 1~2시간은 유지)**이 전기세가 덜 나옵니다.
              </p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">⏱️</span>
                <h3 className="font-extrabold text-slate-900">정속형 에어컨 (구형 또는 일부 창문/이동식)</h3>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                설정 온도와 상관없이 실외기가 항상 100% 최대로 회전하며 냉방합니다.
                <br/><br/>
                <strong>💡 절약 팁:</strong> 처음 켤 때 강풍으로 온도를 빠르게 낮춘 후, **2~3시간 간격으로 껐다 켰다를 반복**해주는 것이 좋습니다.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 border-b-2 border-slate-100 pb-3 mb-5">주택용 전기요금 누진제 완벽 가이드</h2>
          <div className="bg-blue-50/40 p-6 rounded-2xl border border-blue-100 space-y-4">
            <p className="text-slate-800 text-[15px] leading-relaxed">
              가정용(주택용) 전기요금은 전력을 많이 쓸수록 누진세율이 적용되어 단가가 급격하게 올라갑니다. 하절기(7~8월)에는 누진 구간이 완화되어 적용됩니다.
            </p>
            <div className="overflow-x-auto text-xs">
              <table className="w-full border-collapse border border-blue-100 bg-white text-center">
                <thead>
                  <tr className="bg-blue-500/10">
                    <th className="p-2 border border-blue-100 font-bold" colSpan={2}>하절기 누진 구간 (7~8월)</th>
                    <th className="p-2 border border-blue-100 font-bold" colSpan={2}>기타 계절 누진 구간</th>
                  </tr>
                  <tr className="bg-slate-50">
                    <th className="p-2 border border-blue-100">사용량</th>
                    <th className="p-2 border border-blue-100">기본요금 / 전력량 단가</th>
                    <th className="p-2 border border-blue-100">사용량</th>
                    <th className="p-2 border border-blue-100">기본요금 / 전력량 단가</th>
                  </tr>
                </thead>
                <tbody className="text-slate-600">
                  <tr>
                    <td className="p-2 border border-blue-100">300 kWh 이하</td>
                    <td className="p-2 border border-blue-100">910원 / 120.0원</td>
                    <td className="p-2 border border-blue-100">200 kWh 이하</td>
                    <td className="p-2 border border-blue-100">910원 / 120.0원</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-blue-100">301 ~ 450 kWh</td>
                    <td className="p-2 border border-blue-100">1,600원 / 214.6원</td>
                    <td className="p-2 border border-blue-100">201 ~ 400 kWh</td>
                    <td className="p-2 border border-blue-100">1,600원 / 214.6원</td>
                  </tr>
                  <tr className="font-semibold text-red-500">
                    <td className="p-2 border border-blue-100">450 kWh 초과</td>
                    <td className="p-2 border border-blue-100">7,300원 / 307.3원</td>
                    <td className="p-2 border border-blue-100">400 kWh 초과</td>
                    <td className="p-2 border border-blue-100">7,300원 / 307.3원</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              ※ 위 표는 주택용 저압 기준이며, 주택용 고압(아파트 단일계약 등)은 기본 단가가 다소 저렴합니다. 본 계산기는 주택용 저압과 고압의 전 요금 체계를 완벽하게 나누어 지원합니다.
            </p>
          </div>
        </section>

        <section>
          <div className="flex flex-col gap-3 pt-6 border-t border-slate-100">
            <WordPressLink title="전기세 아끼는 올바른 에어컨 사용법 7가지" url="https://weknews.com/%ec%97%90%ec%96%b4%ec%bb%a8-%ec%a0%84%ea%b8%b0%ec%84%b8-%ec%95%84%eb%82%bc%eb%a0%a4%eb%a9%b4-%ec%9d%b4%eb%a0%87%ea%b2%8c/" />
            <WordPressLink title="여름철 전기 요금 한전 고지서 분석 가이드" url="https://weknews.com/%ec%a0%84%ea%b8%b0%ec%9a%94%ea%b8%88-%ea%b3%a0%ec%a7%80%ec%84%9c-%eb%b3%b4%eb%8a%94%eb%b2%95/" />
          </div>
        </section>
      </article>
    </div>
  );
}
