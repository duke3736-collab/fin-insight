"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import AdSenseBanner from "@/components/AdSenseBanner";
import ShareButtons from "@/components/ShareButtons";
import WordPressLink from "@/components/WordPressLink";

type PropertyCategory = "house" | "officetel" | "commercial";
type TransactionType = "sale" | "jeonse" | "monthly";
type OfficetelType = "residential_85" | "commercial_officetel";
type VatType = "general" | "simplified" | "none"; // 일반 10%, 간이 4%, 면제 0%

export default function RealtyBrokerageFeeCalculatorPage() {
  // Inputs
  const [category, setCategory] = useState<PropertyCategory>("house");
  const [txType, setTxType] = useState<TransactionType>("sale");
  const [officetelType, setOfficetelType] = useState<OfficetelType>("residential_85");

  const [depositStr, setDepositStr] = useState("500,000,000"); // 매매가 / 전세보증금 / 월세보증금
  const [rentStr, setRentStr] = useState("1,000,000"); // 월세액

  const [customRateStr, setCustomRateStr] = useState(""); // 직접 입력 협의 요율 (%)
  const [vatType, setVatType] = useState<VatType>("general"); // 부가세 일반과세 10% 기본

  // Number Format Helpers
  const formatNumber = (num: number) => Math.floor(num).toLocaleString("ko-KR");
  const removeCommas = (str: string) => str.replace(/,/g, "");
  const parseInputNumber = (str: string) => parseInt(removeCommas(str), 10) || 0;

  const handleDepositChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = removeCommas(e.target.value).replace(/[^\d]/g, "");
    const num = parseInt(val, 10) || 0;
    setDepositStr(formatNumber(Math.min(num, 100000000000))); // 1000억 제한
  };

  const handleRentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = removeCommas(e.target.value).replace(/[^\d]/g, "");
    const num = parseInt(val, 10) || 0;
    setRentStr(formatNumber(Math.min(num, 1000000000))); // 10억 제한
  };

  const setQuickPrice = (val: number) => setDepositStr(formatNumber(val));

  const formatKRWText = (num: number) => {
    if (num <= 0) return "0원";
    const eok = Math.floor(num / 100000000);
    const man = Math.floor((num % 100000000) / 10000);
    let result = "";
    if (eok > 0) result += `${eok}억 `;
    if (man > 0) result += `${man.toLocaleString("ko-KR")}만 `;
    return result.trim() + "원";
  };

  // 환산 보증금 및 실 거래 기준 가액 계산
  const transactionTargetValue = useMemo(() => {
    const deposit = parseInputNumber(depositStr);
    const rent = parseInputNumber(rentStr);

    if (txType !== "monthly") {
      return { value: deposit, isConverted: false, conversionFormula: "" };
    }

    // 월세 환산 보증금 1차: 보증금 + (월세 × 100)
    let converted = deposit + rent * 100;
    let formula = `보증금 ${formatNumber(deposit)}원 + (월세 ${formatNumber(rent)}원 × 100)`;

    // 환산 보증금이 5천만 원 미만일 경우 2차 재산정: 보증금 + (월세 × 70)
    if (converted < 50000000) {
      converted = deposit + rent * 70;
      formula = `보증금 ${formatNumber(deposit)}원 + (월세 ${formatNumber(rent)}원 × 70) [5천만 미만 우대]`;
    }

    return { value: converted, isConverted: true, conversionFormula: formula };
  }, [depositStr, rentStr, txType]);

  // 중개보수 상한 요율 및 한도액 산출
  const feeInfo = useMemo(() => {
    const targetVal = transactionTargetValue.value;
    if (targetVal <= 0) {
      return { maxRate: 0, appliedRate: 0, maxCapAmount: null, isCapped: false, legalMaxFee: 0, vat: 0, totalFee: 0 };
    }

    let maxRate = 0.9;
    let maxCapAmount: number | null = null;

    if (category === "house") {
      if (txType === "sale") {
        // 주택 매매
        if (targetVal < 50000000) {
          maxRate = 0.6;
          maxCapAmount = 250000;
        } else if (targetVal < 200000000) {
          maxRate = 0.5;
          maxCapAmount = 800000;
        } else if (targetVal < 900000000) {
          maxRate = 0.4;
        } else if (targetVal < 1200000000) {
          maxRate = 0.5;
        } else if (targetVal < 1500000000) {
          maxRate = 0.6;
        } else {
          maxRate = 0.7;
        }
      } else {
        // 주택 전세 / 월세
        if (targetVal < 50000000) {
          maxRate = 0.5;
          maxCapAmount = 200000;
        } else if (targetVal < 100000000) {
          maxRate = 0.4;
          maxCapAmount = 300000;
        } else if (targetVal < 600000000) {
          maxRate = 0.3;
        } else if (targetVal < 1200000000) {
          maxRate = 0.4;
        } else if (targetVal < 1500000000) {
          maxRate = 0.5;
        } else {
          maxRate = 0.6;
        }
      }
    } else if (category === "officetel") {
      if (officetelType === "residential_85") {
        maxRate = txType === "sale" ? 0.5 : 0.4;
      } else {
        maxRate = 0.9;
      }
    } else {
      // 상가, 토지, 공장
      maxRate = 0.9;
    }

    // 사용자 협의 요율 적용 여부
    const customRate = parseFloat(customRateStr);
    const appliedRate = !isNaN(customRate) && customRate > 0 ? Math.min(customRate, maxRate) : maxRate;

    // 수수료 계산
    let rawFee = Math.floor(targetVal * (appliedRate / 100));
    let isCapped = false;

    if (maxCapAmount !== null && rawFee > maxCapAmount) {
      rawFee = maxCapAmount;
      isCapped = true;
    }

    // 부가가치세 (VAT)
    let vatPercent = 0.10;
    if (vatType === "simplified") vatPercent = 0.04;
    else if (vatType === "none") vatPercent = 0;

    const vat = Math.floor(rawFee * vatPercent);
    const totalFee = rawFee + vat;

    return {
      maxRate,
      appliedRate,
      maxCapAmount,
      isCapped,
      legalMaxFee: rawFee,
      vat,
      totalFee,
    };
  }, [category, txType, officetelType, transactionTargetValue, customRateStr, vatType]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-amber-600 via-orange-600 to-slate-900 rounded-3xl p-6 md:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-56 h-56 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-amber-100 mb-3">
            2026년 개업공인중개사 중개보수 법정 요율표 반영
          </span>
          <h1 className="text-2xl md:text-4xl font-extrabold mb-3 leading-tight">
            🏠 부동산 중개수수료(복비) 자동 계산기
          </h1>
          <p className="text-amber-100 text-sm md:text-base max-w-2xl leading-relaxed">
            아파트·주택, 전세, 월세(환산보증금), 오피스텔, 상가·토지 거래의 <strong>법정 상한 복비 수수료</strong>와 
            <strong>부가가치세(10%)</strong>를 클릭 한 번으로 간편하게 계산해 드립니다.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
            
            {/* 1. 부동산 유형 선택 */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                1. 부동산 종류 선택
              </label>
              <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-2xl">
                <button
                  onClick={() => setCategory("house")}
                  className={`py-3 px-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
                    category === "house"
                      ? "bg-white text-amber-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  🏡 주택 (아파트·빌라)
                </button>
                <button
                  onClick={() => setCategory("officetel")}
                  className={`py-3 px-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
                    category === "officetel"
                      ? "bg-white text-amber-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  🏢 오피스텔
                </button>
                <button
                  onClick={() => setCategory("commercial")}
                  className={`py-3 px-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
                    category === "commercial"
                      ? "bg-white text-amber-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  🏪 상가·토지·기타
                </button>
              </div>
            </div>

            {/* 오피스텔 세부 세팅 */}
            {category === "officetel" && (
              <div className="p-3.5 bg-amber-50/70 border border-amber-100 rounded-2xl space-y-2 text-xs">
                <label className="block font-bold text-amber-900">
                  오피스텔 면적 및 용도 구분
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setOfficetelType("residential_85")}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all ${
                      officetelType === "residential_85"
                        ? "bg-amber-600 text-white border-amber-600"
                        : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    주거용 (85㎡ 이하, 욕실/부엌)
                    <span className="block text-[10px] font-normal opacity-90">매매 0.5% / 임대 0.4%</span>
                  </button>
                  <button
                    onClick={() => setOfficetelType("commercial_officetel")}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all ${
                      officetelType === "commercial_officetel"
                        ? "bg-amber-600 text-white border-amber-600"
                        : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    기타/업무용 (85㎡ 초과)
                    <span className="block text-[10px] font-normal opacity-90">상한 0.9% 이내</span>
                  </button>
                </div>
              </div>
            )}

            {/* 2. 거래 유형 선택 */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                2. 거래 방식 선택
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setTxType("sale")}
                  className={`py-3 px-2 rounded-2xl text-xs md:text-sm font-bold border transition-all ${
                    txType === "sale"
                      ? "bg-amber-600 text-white border-amber-600 shadow-md"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  🤝 매매 / 교환
                </button>
                <button
                  onClick={() => setTxType("jeonse")}
                  className={`py-3 px-2 rounded-2xl text-xs md:text-sm font-bold border transition-all ${
                    txType === "jeonse"
                      ? "bg-amber-600 text-white border-amber-600 shadow-md"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  🔑 전세
                </button>
                <button
                  onClick={() => setTxType("monthly")}
                  className={`py-3 px-2 rounded-2xl text-xs md:text-sm font-bold border transition-all ${
                    txType === "monthly"
                      ? "bg-amber-600 text-white border-amber-600 shadow-md"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  📅 월세
                </button>
              </div>
            </div>

            {/* 3. 거래금액 입력 */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {txType === "sale"
                    ? "매매가 / 거래금액 (원)"
                    : txType === "jeonse"
                    ? "전세 보증금 (원)"
                    : "월세 보증금 (원)"}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={depositStr}
                    onChange={handleDepositChange}
                    placeholder="0"
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3.5 text-right font-black text-slate-800 text-lg md:text-xl focus:outline-none focus:ring-2 focus:ring-amber-500 pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-500">
                    원
                  </span>
                </div>
                {depositStr && (
                  <div className="mt-1 text-right text-xs font-bold text-amber-600">
                    ≈ {formatKRWText(parseInputNumber(depositStr))}
                  </div>
                )}

                {/* Quick buttons */}
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {[50000000, 100000000, 300000000, 500000000, 900000000, 1200000000].map((val) => (
                    <button
                      key={val}
                      onClick={() => setQuickPrice(val)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                    >
                      +{val / 100000000 >= 1 ? `${val / 100000000}억` : `${val / 10000}만`}
                    </button>
                  ))}
                </div>
              </div>

              {/* 월세액 입력 */}
              {txType === "monthly" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    월세액 (원)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={rentStr}
                      onChange={handleRentChange}
                      placeholder="0"
                      className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-right font-black text-slate-800 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-amber-500 pr-12"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-500">
                      원
                    </span>
                  </div>
                  {transactionTargetValue.isConverted && (
                    <p className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium">
                      💡 <strong>환산 보증금:</strong> {formatNumber(transactionTargetValue.value)} 원
                      <span className="block text-[11px] text-amber-700 mt-0.5">
                        ({transactionTargetValue.conversionFormula})
                      </span>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* 4. 부가가치세 및 직접 요율 지정 */}
            <div className="border-t border-slate-100 pt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    중개업소 부가가치세 과세 유형
                  </label>
                  <select
                    value={vatType}
                    onChange={(e) => setVatType(e.target.value as VatType)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="general">일반과세자 (10% 별도 부과)</option>
                    <option value="simplified">간이과세자 (4% 부과)</option>
                    <option value="none">부가세 포함 / 면제 (0%)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    협의 중개 요율 직접 지정 (선택)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={customRateStr}
                      onChange={(e) => setCustomRateStr(e.target.value)}
                      placeholder={`상한 ${feeInfo.maxRate}% 이하`}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-right font-bold text-slate-800 focus:ring-1 focus:ring-amber-500 pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Dashboard / Results */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xl sticky top-20 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                <span>📋 중개수수료 계산 결과</span>
              </h2>
              <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-md">
                상한요율 {feeInfo.appliedRate}% 적용
              </span>
            </div>

            {/* Total Fee Main Display */}
            <div className="bg-gradient-to-br from-slate-900 to-amber-950 rounded-2xl p-6 text-white space-y-2 relative overflow-hidden">
              <span className="text-xs text-amber-200 font-bold block">
                최종 총 중개수수료 (부가세 포함)
              </span>
              <div className="text-3xl md:text-4xl font-black text-amber-400 tracking-tight">
                {formatNumber(feeInfo.totalFee)}
                <span className="text-xl font-normal text-white ml-1">원</span>
              </div>
              <p className="text-xs text-slate-300 font-semibold pt-1">
                ≈ {formatKRWText(feeInfo.totalFee)}
              </p>
            </div>

            {/* Fee Breakdown Table */}
            <div className="space-y-3 text-xs md:text-sm">
              <div className="flex justify-between items-center text-slate-600">
                <span>거래 산정 가액</span>
                <span className="font-bold text-slate-800">
                  {formatNumber(transactionTargetValue.value)} 원
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>적용 중개 요율</span>
                <span className="font-bold text-amber-600">{feeInfo.appliedRate}%</span>
              </div>
              {feeInfo.maxCapAmount !== null && (
                <div className="flex justify-between items-center text-slate-600">
                  <span>법정 한도액</span>
                  <span className="font-bold text-slate-800">
                    {formatNumber(feeInfo.maxCapAmount)} 원
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center text-slate-600">
                <span>순수 중개보수 (부가세 제외)</span>
                <span className="font-bold text-slate-800">
                  {formatNumber(feeInfo.legalMaxFee)} 원
                  {feeInfo.isCapped && (
                    <span className="text-[10px] text-rose-500 block text-right font-normal">
                      (한도액 제한 적용됨)
                    </span>
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>부가가치세 ({vatType === "general" ? "10%" : vatType === "simplified" ? "4%" : "면제"})</span>
                <span className="font-bold text-slate-800">{formatNumber(feeInfo.vat)} 원</span>
              </div>
            </div>

            {/* Guide Tip Card */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-[11px] text-slate-600">
              <span className="font-bold text-slate-800 block">💡 중개보수 협의 팁</span>
              <p>
                계산된 금액은 법률상 **최대 상한선**입니다. 개업공인중개사와 협의하여 상한율 이내에서 더 낮은 금액으로 수수료를 결정할 수 있습니다.
              </p>
            </div>

            {/* Share Buttons */}
            <div className="pt-2">
              <ShareButtons
                title="2026년 부동산 중개수수료(복비) 계산기 - FinInsight"
                description={`내 부동산 거래 예상 중개수수료: 약 ${formatKRWText(feeInfo.totalFee)} (상한 ${feeInfo.appliedRate}%)! 실시간 복비를 확인해보세요.`}
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

      {/* Info & FAQ Guide Section */}
      <div className="bg-white rounded-3xl p-6 md:p-10 border border-slate-200 shadow-sm space-y-8">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 mb-4 flex items-center gap-2">
            📖 2026년 개정 부동산 중개보수 법정 요율표 안내
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            공인중개사법에 따라 주택 및 일반 부동산 거래 시 개업공인중개사가 청구할 수 있는 중개보수는 법정 상한 요율 내로 제한됩니다.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1">
                🏡 주택 매매 요율 구간
              </h3>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>• 5천만 미만: 0.6% (한도 25만 원)</li>
                <li>• 5천만~2억 미만: 0.5% (한도 80만 원)</li>
                <li>• 2억~9억 미만: 0.4%</li>
                <li>• 9억~12억 미만: 0.5%</li>
                <li>• 12억~15억 미만: 0.6%</li>
                <li>• 15억 이상: 0.7% 이내 협의</li>
              </ul>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1">
                🔑 주택 임대차(전월세) 요율 구간
              </h3>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>• 5천만 미만: 0.5% (한도 20만 원)</li>
                <li>• 5천만~1억 미만: 0.4% (한도 30만 원)</li>
                <li>• 1억~6억 미만: 0.3%</li>
                <li>• 6억~12억 미만: 0.4%</li>
                <li>• 12억~15억 미만: 0.5%</li>
                <li>• 15억 이상: 0.6% 이내 협의</li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="border-t border-slate-100 pt-6 space-y-4">
          <h3 className="text-lg font-black text-slate-800">
            ❓ 자주 묻는 질문 (FAQ)
          </h3>

          <div className="space-y-3">
            <details className="group bg-slate-50 border border-slate-200 rounded-2xl p-4 cursor-pointer">
              <summary className="font-bold text-slate-800 text-sm flex justify-between items-center">
                <span>Q. 중개수수료 지급 시기는 언제인가요?</span>
                <span className="group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                공인중개사법에 따라 당사자 간 별도의 약정이 없는 한 **잔금 지급일(거래대금 지불이 완료된 날)**에 지급하는 것이 원칙입니다.
              </p>
            </details>

            <details className="group bg-slate-50 border border-slate-200 rounded-2xl p-4 cursor-pointer">
              <summary className="font-bold text-slate-800 text-sm flex justify-between items-center">
                <span>Q. 중개보수 현금영수증 발행 시 소득공제가 가능한가요?</span>
                <span className="group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                네, 부동산 중개업은 10만 원 이상 거래 시 현금영수증 의무발급 업종입니다. 낸 중개보수는 연말정산 시 **신용카드 등 사용금액 소득공제(현금영수증 30%)** 적용을 받을 수 있습니다.
              </p>
            </details>
          </div>
        </div>

        {/* Related Calculators Links */}
        <div className="border-t border-slate-100 pt-6">
          <h3 className="text-xs font-bold text-slate-400 mb-3">연관된 부동산 및 세금 계산기</h3>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/calculators/real-estate-tax"
              className="px-3 py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded-xl hover:bg-blue-100 transition-colors"
            >
              🏠 부동산 취득세 계산기
            </Link>
            <Link
              href="/calculators/property-tax"
              className="px-3 py-2 bg-teal-50 text-teal-700 text-xs font-bold rounded-xl hover:bg-teal-100 transition-colors"
            >
              🏢 2026년 재산세 계산기
            </Link>
            <Link
              href="/calculators/ltv"
              className="px-3 py-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl hover:bg-emerald-100 transition-colors"
            >
              🏠 2026년 LTV & 주담대 한도 계산기
            </Link>
          </div>
        </div>

        {/* WordPress Link */}
        <WordPressLink
          title="2026년 부동산 중개수수료 복비 요율표 및 현금영수증 절세법"
          url="https://weknews.com/%eb%b6%80%eb%8f%99%ec%82%b0-%ec%a4%91%ea%b0%9c%ec%88%98%ec%88%98%eb%a3%8c-%ea%b3%84%ec%82%b0%ea%b8%b8/"
        />
      </div>
    </div>
  );
}
