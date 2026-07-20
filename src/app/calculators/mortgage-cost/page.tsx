"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import AdSenseBanner from "@/components/AdSenseBanner";
import ShareButtons from "@/components/ShareButtons";
import WordPressLink from "@/components/WordPressLink";

type ClaimRate = 110 | 120 | 130;
type RegionType = "metropolitan" | "other";

export default function MortgageCostCalculatorPage() {
  // Inputs
  const [loanAmountStr, setLoanAmountStr] = useState("300,000,000"); // 대출 원금
  const [claimRate, setClaimRate] = useState<ClaimRate>(120); // 채권최고액 비율 (기본 120%)
  const [region, setRegion] = useState<RegionType>("metropolitan"); // 서울/특별시/광역시 (1%) vs 기타 시/군 (0.5%)
  const [bondDiscountRate, setBondDiscountRate] = useState<number>(9.5); // 국민주택채권 할인율 (%)
  const [includeCancellation, setIncludeCancellation] = useState<boolean>(false); // 말소비용 포함 여부

  // Number Format Helpers
  const formatNumber = (num: number) => Math.floor(num).toLocaleString("ko-KR");
  const removeCommas = (str: string) => str.replace(/,/g, "");
  const parseInputNumber = (str: string) => parseInt(removeCommas(str), 10) || 0;

  const handleLoanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = removeCommas(e.target.value).replace(/[^\d]/g, "");
    const num = parseInt(val, 10) || 0;
    setLoanAmountStr(formatNumber(Math.min(num, 100000000000))); // 1000억 제한
  };

  const setQuickLoan = (val: number) => setLoanAmountStr(formatNumber(val));

  const formatKRWText = (num: number) => {
    if (num <= 0) return "0원";
    const eok = Math.floor(num / 100000000);
    const man = Math.floor((num % 100000000) / 10000);
    let result = "";
    if (eok > 0) result += `${eok}억 `;
    if (man > 0) result += `${man.toLocaleString("ko-KR")}만 `;
    return result.trim() + "원";
  };

  // 인지세 계산 (대출 금액별 각 50% 반반 부담)
  const calcStampTax = (loan: number) => {
    if (loan <= 50000000) return 0;
    if (loan <= 100000000) return 70000;
    if (loan <= 1000000000) return 150000;
    return 350000;
  };

  // 계산 결과
  const result = useMemo(() => {
    const loanAmount = parseInputNumber(loanAmountStr);
    if (loanAmount <= 0) {
      return {
        loanAmount: 0,
        maxClaimAmount: 0,
        regTax: 0,
        eduTax: 0,
        courtFee: 0,
        bankTotal: 0,
        totalStampTax: 0,
        borrowerStampTax: 0,
        bondPurchaseAmount: 0,
        bondDiscountLoss: 0,
        borrowerTotal: 0,
        grandTotal: 0,
        cancellationFee: 0,
      };
    }

    // 1. 채권최고액
    const maxClaimAmount = Math.floor(loanAmount * (claimRate / 100));

    // 2. 은행 부담 비용 (등록면세 0.2%, 지방교육세 0.04%, 등기수수료 15,000원)
    const regTax = Math.floor(maxClaimAmount * 0.002);
    const eduTax = Math.floor(regTax * 0.20);
    const courtFee = 15000;
    const bankTotal = regTax + eduTax + courtFee;

    // 3. 차주(대출자) 부담 비용
    // 인지세 (50% 반반 부담)
    const totalStampTax = calcStampTax(loanAmount);
    const borrowerStampTax = Math.floor(totalStampTax / 2);

    // 국민주택채권 매입 및 즉시매각 손실금 (특별시/광역시 1%, 기타 0.5%)
    const bondRate = region === "metropolitan" ? 0.01 : 0.005;
    const bondPurchaseAmount = Math.floor(maxClaimAmount * bondRate);
    const bondDiscountLoss = Math.floor(bondPurchaseAmount * (bondDiscountRate / 100));

    // 말소 비용 (필요 시 약 55,000원)
    const cancellationFee = includeCancellation ? 55000 : 0;

    const borrowerTotal = borrowerStampTax + bondDiscountLoss + cancellationFee;

    // 전체 발생 비용 총액 (은행 인지세 50% 포함)
    const grandTotal = bankTotal + borrowerTotal + (totalStampTax - borrowerStampTax);

    return {
      loanAmount,
      maxClaimAmount,
      regTax,
      eduTax,
      courtFee,
      bankTotal,
      totalStampTax,
      borrowerStampTax,
      bondPurchaseAmount,
      bondDiscountLoss,
      borrowerTotal,
      grandTotal,
      cancellationFee,
    };
  }, [loanAmountStr, claimRate, region, bondDiscountRate, includeCancellation]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-indigo-700 via-blue-700 to-slate-900 rounded-3xl p-6 md:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-56 h-56 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-indigo-100 mb-3">
            대법원 및 공정거래위원회 규정 반영
          </span>
          <h1 className="text-2xl md:text-4xl font-extrabold mb-3 leading-tight">
            🏦 근저당 설정비용 계산기
          </h1>
          <p className="text-indigo-100 text-sm md:text-base max-w-2xl leading-relaxed">
            주택담보대출 금액을 입력하시면 <strong>채권최고액(120%)</strong>, <strong>금융기관 부담 비용</strong>, 
            <strong>차주(대출자) 실제 부담 비용(인지세 50% + 국민주택채권 할인)</strong>을 투명하게 계산해 드립니다.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
            
            {/* 1. 대출 원금 입력 */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                주택담보대출 예상 금액 (대출 원금)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={loanAmountStr}
                  onChange={handleLoanChange}
                  placeholder="0"
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3.5 text-right font-black text-slate-800 text-lg md:text-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-500">
                  원
                </span>
              </div>
              {loanAmountStr && (
                <div className="mt-1 text-right text-xs font-bold text-indigo-600">
                  ≈ {formatKRWText(parseInputNumber(loanAmountStr))} (채권최고액 {claimRate}%: {formatKRWText(result.maxClaimAmount)})
                </div>
              )}

              {/* Quick buttons */}
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {[100000000, 200000000, 300000000, 500000000, 700000000].map((val) => (
                  <button
                    key={val}
                    onClick={() => setQuickLoan(val)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                  >
                    +{val / 100000000}억
                  </button>
                ))}
              </div>
            </div>

            {/* 2. 채권최고액 비율 선택 */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                채권최고액 설정 비율
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[110, 120, 130].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setClaimRate(rate as ClaimRate)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                      claimRate === rate
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {rate}% {rate === 120 && "(기본 권장)"}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. 지역 및 채권 할인율 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs border-t border-slate-100 pt-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  부동산 소재지 (국민주택채권 비율)
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value as RegionType)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="metropolitan">서울 / 특별시 / 광역시 (1.0%)</option>
                  <option value="other">기타 시 / 군 지역 (0.5%)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  국민주택채권 할인율 (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={bondDiscountRate}
                  onChange={(e) => setBondDiscountRate(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-right font-bold text-slate-800 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* 말소 비용 옵션 */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
              <div>
                <span className="font-bold text-slate-700 block">
                  대출 완납 후 근저당 말소 예상 비용 포함
                </span>
                <span className="text-[11px] text-slate-400">
                  등록면세+지방교육세+등기수수료 (약 5.5만 원 추가)
                </span>
              </div>
              <button
                onClick={() => setIncludeCancellation(!includeCancellation)}
                className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                  includeCancellation ? "bg-indigo-600" : "bg-slate-300"
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full transition-transform ${
                    includeCancellation ? "translate-x-6" : "translate-x-0"
                  }`}
                ></div>
              </button>
            </div>

          </div>
        </div>

        {/* Right Dashboard / Results */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xl sticky top-20 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                <span>📋 설정비용 산출 결과</span>
              </h2>
            </div>

            {/* Borrower Cost Display */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-6 text-white space-y-2 relative overflow-hidden">
              <span className="text-xs text-indigo-200 font-bold block">
                대출자(차주) 실제 납부 예상 금액
              </span>
              <div className="text-3xl md:text-4xl font-black text-emerald-400 tracking-tight">
                {formatNumber(result.borrowerTotal)}
                <span className="text-xl font-normal text-white ml-1">원</span>
              </div>
              <p className="text-xs text-slate-300 font-semibold pt-1">
                ≈ {formatKRWText(result.borrowerTotal)} (인지세 50% + 국민주택채권 매각 손실)
              </p>
            </div>

            {/* Cost Breakdown Table */}
            <div className="space-y-4 text-xs md:text-sm">
              {/* 차주 부담 내역 */}
              <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-2">
                <span className="font-extrabold text-indigo-900 block text-xs">
                  👤 차주(대출자) 부담 내역
                </span>
                <div className="flex justify-between items-center text-slate-700">
                  <span>인지세 (50% 반반 부담)</span>
                  <span className="font-bold">{formatNumber(result.borrowerStampTax)} 원</span>
                </div>
                <div className="flex justify-between items-center text-slate-700">
                  <span>국민주택채권 즉시매각 손실금 ({bondDiscountRate}%)</span>
                  <span className="font-bold">{formatNumber(result.bondDiscountLoss)} 원</span>
                </div>
                {result.cancellationFee > 0 && (
                  <div className="flex justify-between items-center text-slate-700">
                    <span>근저당 말소 예상 비용</span>
                    <span className="font-bold">{formatNumber(result.cancellationFee)} 원</span>
                  </div>
                )}
              </div>

              {/* 은행 부담 내역 */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-extrabold text-slate-800 block text-xs">
                  🏦 금융기관(은행) 부담 내역
                </span>
                <div className="flex justify-between items-center text-slate-600">
                  <span>등록면허세 (0.2%)</span>
                  <span className="font-bold text-slate-800">{formatNumber(result.regTax)} 원</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>지방교육세 (등록세의 20%)</span>
                  <span className="font-bold text-slate-800">{formatNumber(result.eduTax)} 원</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>등기신청수수료</span>
                  <span className="font-bold text-slate-800">{formatNumber(result.courtFee)} 원</span>
                </div>
                <div className="flex justify-between items-center text-slate-600 border-t border-slate-200 pt-1.5 font-bold">
                  <span>은행 부담 총액</span>
                  <span className="text-slate-900">{formatNumber(result.bankTotal)} 원</span>
                </div>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="pt-2">
              <ShareButtons
                title="2026년 근저당 설정비용 계산기 - FinInsight"
                description={`대출금액 ${formatKRWText(result.loanAmount)} 기준 내 실제 부담 근저당 설정비용: 약 ${formatKRWText(result.borrowerTotal)}! 확인해보세요.`}
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
            📖 근저당권 설정비용 부담 주체 판례 가이드
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            2011년 대법원 판결 및 공정거래위원회 약관 개정에 따라 근저당 설정 시 발생하는 주비용(등록면허세, 지방교육세, 등기수수료, 감정평가수수료 등)은 **금융기관(은행)이 부담**하도록 확정되었습니다.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1">
                ⚖️ 대출자(차주)가 부담하는 항목
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                1. <strong>인지세:</strong> 대출 금액별 정액 인지세를 은행과 차주가 50%씩 반반 부담합니다.<br />
                2. <strong>국민주택채권 매각 손실금:</strong> 채권 매입 후 즉시 매각 시 발생하는 할인 손실금은 차주가 부담합니다.
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1">
                🏦 은행이 전액 부담하는 항목
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                등록면허세(0.2%), 지방교육세(0.04%), 법원 등기신청수수료(1.5만 원), 담보 평가 감정수수료, 법무사 설정대행 수수료는 **은행이 부담**합니다.
              </p>
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
                <span>Q. 채권최고액을 대출금의 120%로 설정하는 이유는 무엇인가요?</span>
                <span className="group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                은행은 차주가 연체할 경우를 대비하여 연체 이자 및 집행 비용을 감안해 대출 원금의 110%~120% 수준으로 채권최고액을 등기부등본에 설정합니다.
              </p>
            </details>

            <details className="group bg-slate-50 border border-slate-200 rounded-2xl p-4 cursor-pointer">
              <summary className="font-bold text-slate-800 text-sm flex justify-between items-center">
                <span>Q. 대출을 모두 갚으면 근저당이 자동으로 삭제되나요?</span>
                <span className="group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                아닙니다. 대출 원리금을 모두 완납하더라도 등기부등본상의 근저당 설정 기록은 자동으로 사라지지 않으며, 은행에서 근저당 말소 서류를 받아 말소 등기 신청(약 5만~7만 원 비용 발생)을 해야 등기부에서 지워집니다.
              </p>
            </details>
          </div>
        </div>

        {/* Related Calculators Links */}
        <div className="border-t border-slate-100 pt-6">
          <h3 className="text-xs font-bold text-slate-400 mb-3">연관된 대출 및 세금 계산기</h3>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/calculators/ltv"
              className="px-3 py-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl hover:bg-emerald-100 transition-colors"
            >
              🏠 LTV & 주담대 한도 계산기
            </Link>
            <Link
              href="/calculators/dsr"
              className="px-3 py-2 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl hover:bg-indigo-100 transition-colors"
            >
              📊 DSR & 대출 한도 계산기
            </Link>
            <Link
              href="/calculators/real-estate-tax"
              className="px-3 py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded-xl hover:bg-blue-100 transition-colors"
            >
              🏠 부동산 취득세 계산기
            </Link>
          </div>
        </div>

        {/* WordPress Link */}
        <WordPressLink
          title="2026년 근저당 설정비용 대출자 부담 항목 및 인지세 50% 절세 팁"
          url="https://weknews.com/%ea%b7%bc%ec%a0%80%eb%8b%b9-%ec%84%a4%ec%a0%95%eb%b9%84%ec%9a%a9-%ea%b3%84%ec%82%b0%ea%b8%b8/"
        />
      </div>
    </div>
  );
}
