"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import AdSenseBanner from "@/components/AdSenseBanner";
import ShareButtons from "@/components/ShareButtons";
import WordPressLink from "@/components/WordPressLink";

export default function CardDeductionCalculatorPage() {
  // Inputs
  const [salaryStr, setSalaryStr] = useState("50,000,000"); // 총급여액

  const [creditCardStr, setCreditCardStr] = useState("15,000,000"); // 신용카드
  const [checkCardStr, setCheckCardStr] = useState("8,000,000"); // 체크카드 / 현금영수증
  const [cultureStr, setCultureStr] = useState("500,000"); // 도서공연 등
  const [marketStr, setMarketStr] = useState("1,000,000"); // 전통시장
  const [transitStr, setTransitStr] = useState("1,200,000"); // 대중교통

  // Number Format Helpers
  const formatNumber = (num: number) => Math.floor(num).toLocaleString("ko-KR");
  const removeCommas = (str: string) => str.replace(/,/g, "");
  const parseInputNumber = (str: string) => parseInt(removeCommas(str), 10) || 0;

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = removeCommas(e.target.value).replace(/[^\d]/g, "");
    const num = parseInt(val, 10) || 0;
    setSalaryStr(formatNumber(Math.min(num, 1000000000))); // 10억 제한
  };

  const setQuickSalary = (val: number) => setSalaryStr(formatNumber(val));

  const formatKRWText = (num: number) => {
    if (num <= 0) return "0원";
    const eok = Math.floor(num / 100000000);
    const man = Math.floor((num % 100000000) / 10000);
    let result = "";
    if (eok > 0) result += `${eok}억 `;
    if (man > 0) result += `${man.toLocaleString("ko-KR")}만 `;
    return result.trim() + "원";
  };

  // 소득공제 산출 로직
  const result = useMemo(() => {
    const salary = parseInputNumber(salaryStr);
    const credit = parseInputNumber(creditCardStr);
    const check = parseInputNumber(checkCardStr);
    const culture = parseInputNumber(cultureStr);
    const market = parseInputNumber(marketStr);
    const transit = parseInputNumber(transitStr);

    const totalExpense = credit + check + culture + market + transit;
    const threshold = Math.floor(salary * 0.25); // 총급여 25% 문턱

    if (salary <= 0 || totalExpense <= 0 || totalExpense < threshold) {
      const neededMore = Math.max(0, threshold - totalExpense);
      return {
        salary,
        totalExpense,
        threshold,
        neededMore,
        isThresholdReached: false,
        basicDeduction: 0,
        extraDeduction: 0,
        finalDeduction: 0,
        marginalTaxRate: 0,
        estimatedRefund: 0,
        basicCap: salary <= 70000000 ? 3000000 : salary <= 120000000 ? 2500000 : 2000000,
        deductionBreakdown: { credit: 0, check: 0, culture: 0, market: 0, transit: 0 },
      };
    }

    // 25% 문턱 차감 순서: 낮은 공제율 수단부터 차감 (신용카드 15% -> 체크카드 30% -> 도서공연 30% -> 전통시장 40% -> 대중교통 80%)
    let remainingThreshold = threshold;

    // 1. 신용카드 (15%)
    const creditUsedForThreshold = Math.min(credit, remainingThreshold);
    const creditEligible = credit - creditUsedForThreshold;
    remainingThreshold -= creditUsedForThreshold;

    // 2. 체크카드/현금영수증 (30%)
    const checkUsedForThreshold = Math.min(check, remainingThreshold);
    const checkEligible = check - checkUsedForThreshold;
    remainingThreshold -= checkUsedForThreshold;

    // 3. 도서공연 등 (30%, 총급여 7천만 이하 대상)
    const isCultureEligibleBySalary = salary <= 70000000;
    const actualCulture = isCultureEligibleBySalary ? culture : 0;
    const cultureUsedForThreshold = Math.min(actualCulture, remainingThreshold);
    const cultureEligible = actualCulture - cultureUsedForThreshold;
    remainingThreshold -= cultureUsedForThreshold;

    // 4. 전통시장 (40%)
    const marketUsedForThreshold = Math.min(market, remainingThreshold);
    const marketEligible = market - marketUsedForThreshold;
    remainingThreshold -= marketUsedForThreshold;

    // 5. 대중교통 (80%)
    const transitUsedForThreshold = Math.min(transit, remainingThreshold);
    const transitEligible = transit - transitUsedForThreshold;
    remainingThreshold -= transitUsedForThreshold;

    // 각 카테고리별 공제액 계산
    const creditDeduction = Math.floor(creditEligible * 0.15);
    const checkDeduction = Math.floor(checkEligible * 0.30);
    const cultureDeduction = Math.floor(cultureEligible * 0.30);
    const marketDeduction = Math.floor(marketEligible * 0.40);
    const transitDeduction = Math.floor(transitEligible * 0.80);

    // 기본 공제 한도 캡 (일반+신용+체크+도서공연)
    let basicCap = 3000000;
    if (salary > 120000000) basicCap = 2000000;
    else if (salary > 70000000) basicCap = 2500000;

    const rawBasicDeduction = creditDeduction + checkDeduction + cultureDeduction;
    const basicDeduction = Math.min(rawBasicDeduction, basicCap);
    const basicCapExceeded = Math.max(0, rawBasicDeduction - basicCap);

    // 추가 공제 한도 (전통시장 + 대중교통 + 도서공연 초과분)
    let extraCap = salary <= 70000000 ? 3000000 : 2000000;
    const rawExtraDeduction = marketDeduction + transitDeduction + (isCultureEligibleBySalary ? 0 : cultureDeduction);
    const extraDeduction = Math.min(rawExtraDeduction, extraCap);

    const finalDeduction = basicDeduction + extraDeduction;

    // 대략적인 과세표준 구간에 따른 한계 소득세율 (지방세 10% 포함)
    let marginalTaxRate = 0.165; // 기본 15% (+지방세 1.5%)
    if (salary <= 25000000) marginalTaxRate = 0.066; // 6% (+지방세 0.6%)
    else if (salary <= 60000000) marginalTaxRate = 0.165; // 15% (+지방세 1.5%)
    else if (salary <= 100000000) marginalTaxRate = 0.264; // 24% (+지방세 2.4%)
    else marginalTaxRate = 0.385; // 35% (+지방세 3.5%)

    const estimatedRefund = Math.floor(finalDeduction * marginalTaxRate);

    return {
      salary,
      totalExpense,
      threshold,
      neededMore: 0,
      isThresholdReached: true,
      basicDeduction,
      extraDeduction,
      finalDeduction,
      marginalTaxRate: marginalTaxRate * 100,
      estimatedRefund,
      basicCap,
      deductionBreakdown: {
        credit: creditDeduction,
        check: checkDeduction,
        culture: cultureDeduction,
        market: marketDeduction,
        transit: transitDeduction,
      },
    };
  }, [salaryStr, creditCardStr, checkCardStr, cultureStr, marketStr, transitStr]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-indigo-600 via-blue-700 to-slate-900 rounded-3xl p-6 md:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-56 h-56 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-indigo-100 mb-3">
            최신 연말정산 개정 세법 완벽 반영
          </span>
          <h1 className="text-2xl md:text-4xl font-extrabold mb-3 leading-tight">
            💳 연말정산 카드·현금 소득공제 계산기
          </h1>
          <p className="text-indigo-100 text-sm md:text-base max-w-2xl leading-relaxed">
            총급여액과 수단별(신용카드, 체크카드, 현금영수증, 전통시장, 대중교통) 연간 지출액을 입력하여 
            <strong>최종 소득공제 한도액</strong>과 <strong>예상 세금 환급액(절세효과)</strong>을 즉시 확인해 보세요.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
            
            {/* 1. 총급여액 입력 */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                세전 연간 총급여액 (원)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={salaryStr}
                  onChange={handleSalaryChange}
                  placeholder="0"
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3.5 text-right font-black text-slate-800 text-lg md:text-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-500">
                  원
                </span>
              </div>
              {salaryStr && (
                <div className="mt-1 text-right text-xs font-bold text-indigo-600">
                  ≈ {formatKRWText(parseInputNumber(salaryStr))} (소득공제 시작 문턱 25%: {formatKRWText(result.threshold)})
                </div>
              )}

              {/* Quick buttons */}
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {[30000000, 50000000, 70000000, 100000000].map((val) => (
                  <button
                    key={val}
                    onClick={() => setQuickSalary(val)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                  >
                    +{val / 100000000 >= 1 ? `${val / 100000000}억` : `${val / 10000}만`}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. 결제 수단별 연간 사용 금액 */}
            <div className="space-y-4 border-t border-slate-100 pt-4">
              <h2 className="text-base font-extrabold text-slate-800 border-b border-slate-100 pb-3">
                결제 수단 및 사용처별 연간 지출액
              </h2>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-slate-700">
                      💳 신용카드 연간 사용액 (공제율 15%)
                    </label>
                  </div>
                  <input
                    type="text"
                    value={creditCardStr}
                    onChange={(e) =>
                      setCreditCardStr(formatNumber(parseInt(removeCommas(e.target.value), 10) || 0))
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-right font-bold text-slate-800 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-slate-700">
                      🏦 체크카드 / 직불카드 / 현금영수증 (공제율 30%)
                    </label>
                  </div>
                  <input
                    type="text"
                    value={checkCardStr}
                    onChange={(e) =>
                      setCheckCardStr(formatNumber(parseInt(removeCommas(e.target.value), 10) || 0))
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-right font-bold text-slate-800 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-slate-700">
                      📚 도서·공연·미술관·박물관·영화관람 (공제율 30%)
                    </label>
                    <span className="text-[10px] text-slate-400">총급여 7천만 이하 대상</span>
                  </div>
                  <input
                    type="text"
                    value={cultureStr}
                    onChange={(e) =>
                      setCultureStr(formatNumber(parseInt(removeCommas(e.target.value), 10) || 0))
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-right font-bold text-slate-800 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-slate-700">
                      🏬 전통시장 사용액 (공제율 40%)
                    </label>
                  </div>
                  <input
                    type="text"
                    value={marketStr}
                    onChange={(e) =>
                      setMarketStr(formatNumber(parseInt(removeCommas(e.target.value), 10) || 0))
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-right font-bold text-slate-800 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-slate-700">
                      🚌 대중교통 이용액 (공제율 80%)
                    </label>
                  </div>
                  <input
                    type="text"
                    value={transitStr}
                    onChange={(e) =>
                      setTransitStr(formatNumber(parseInt(removeCommas(e.target.value), 10) || 0))
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-right font-bold text-slate-800 focus:ring-1 focus:ring-indigo-500"
                  />
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
                <span>📋 소득공제 및 절세 진단</span>
              </h2>
              <span
                className={`px-2.5 py-1 text-[11px] font-extrabold rounded-md ${
                  result.isThresholdReached
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {result.isThresholdReached ? "공제 문턱(25%) 달성" : "문턱 미달"}
              </span>
            </div>

            {/* Threshold Progress Bar */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-700">총 지출액: {formatKRWText(result.totalExpense)}</span>
                <span className="text-indigo-600">공제 문턱: {formatKRWText(result.threshold)}</span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    result.isThresholdReached ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      result.threshold > 0 ? (result.totalExpense / result.threshold) * 100 : 0
                    )}%`,
                  }}
                ></div>
              </div>
              {!result.isThresholdReached && (
                <p className="text-[11px] text-amber-700 font-semibold text-center pt-1">
                  💡 총급여의 25% 미달로 소득공제가 발생하지 않습니다.<br />
                  (추가로 {formatKRWText(result.neededMore)} 더 사용 시 공제 시작)
                </p>
              )}
            </div>

            {/* Final Deduction & Refund Display */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-6 text-white space-y-3 relative overflow-hidden">
              <span className="text-xs text-indigo-200 font-bold block">
                최종 총 소득공제 금액 (기본 + 추가한도)
              </span>
              <div className="text-3xl md:text-4xl font-black text-indigo-300 tracking-tight">
                {formatNumber(result.finalDeduction)}
                <span className="text-xl font-normal text-white ml-1">원</span>
              </div>

              <div className="border-t border-indigo-900/60 pt-3 flex justify-between items-center text-xs">
                <span className="text-slate-300">예상 세금 환급/절세액:</span>
                <span className="text-emerald-400 font-extrabold text-sm">
                  ≈ {formatNumber(result.estimatedRefund)} 원
                </span>
              </div>
            </div>

            {/* Breakdown Table */}
            <div className="space-y-2 text-xs md:text-sm border-t border-slate-100 pt-3">
              <div className="flex justify-between items-center text-slate-600">
                <span>신용카드 공제액 (15%)</span>
                <span className="font-bold text-slate-800">{formatNumber(result.deductionBreakdown.credit)} 원</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>체크카드/현금 공제액 (30%)</span>
                <span className="font-bold text-slate-800">{formatNumber(result.deductionBreakdown.check)} 원</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>도서/공연 공제액 (30%)</span>
                <span className="font-bold text-slate-800">{formatNumber(result.deductionBreakdown.culture)} 원</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>전통시장 공제액 (40%)</span>
                <span className="font-bold text-slate-800">{formatNumber(result.deductionBreakdown.market)} 원</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>대중교통 공제액 (80%)</span>
                <span className="font-bold text-slate-800">{formatNumber(result.deductionBreakdown.transit)} 원</span>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="pt-2">
              <ShareButtons
                title="2026년 연말정산 카드·현금 소득공제 계산기 - FinInsight"
                description={`내 예상 소득공제 금액: ${formatKRWText(result.finalDeduction)}! 예상 세금 환급액 약 ${formatKRWText(result.estimatedRefund)} 확인하기.`}
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
            📖 카드·현금 영수증 연말정산 절세 황금 전략
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            신용카드와 체크카드, 현금영수증을 똑똑하게 나누어 사용하면 연말정산 환급금을 극대화할 수 있습니다.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1">
                💡 25% 황금비율 지출 전략
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                공제 문턱인 <strong>총급여 25%까지는 포인트 혜택이 좋은 신용카드</strong>를 사용하고, 25%를 초과하는 금액부터는 <strong>공제율이 2배 높은 체크카드/현금영수증(30%)</strong>을 사용하는 것이 가장 유리합니다.
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1">
                🚌 대중교통 80% & 전통시장 40% 한도 혜택
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                대중교통(80%)과 전통시장(40%)은 공제율이 높을 뿐만 아니라, 카드 기본 소득공제 한도가 찬 경우에도 <strong>추가 한도(200만~300만 원)</strong>가 적용되므로 알뜰하게 챙겨야 합니다.
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
                <span>Q. 신용카드로 결제한 의료비나 학원비도 소득공제가 되나요?</span>
                <span className="group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                의료비와 미취학 아동 학원비는 신용카드 사용금액 소득공제와 의료비/교육비 세액공제를 **중복 혜택** 받을 수 있습니다. 단, 취득세/재산세 등 세금, 아파트 관리비, 국세/지방세, 상품권 구매 등은 공제 대상에서 제외됩니다.
              </p>
            </details>

            <details className="group bg-slate-50 border border-slate-200 rounded-2xl p-4 cursor-pointer">
              <summary className="font-bold text-slate-800 text-sm flex justify-between items-center">
                <span>Q. 맞벌이 부부는 카드를 누구 명의로 몰아서 써야 하나요?</span>
                <span className="group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                일반적으로 **총급여가 적은 배우자**가 25% 문턱을 빨리 넘을 수 있어 유리한 경우가 많지만, 소득세율 구간(24% 이상 고소득자)에 따라 절세 금액 차이가 크므로 부부 소득 수준을 함께 검토해야 합니다.
              </p>
            </details>
          </div>
        </div>

        {/* Related Calculators Links */}
        <div className="border-t border-slate-100 pt-6">
          <h3 className="text-xs font-bold text-slate-400 mb-3">연관된 절세 및 급여 계산기</h3>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/calculators/salary"
              className="px-3 py-2 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl hover:bg-indigo-100 transition-colors"
            >
              💸 연봉 실수령액 계산기
            </Link>
            <Link
              href="/calculators/isa"
              className="px-3 py-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl hover:bg-emerald-100 transition-colors"
            >
              🧮 ISA 비과세 및 연금 절세 계산기
            </Link>
            <Link
              href="/calculators/severance"
              className="px-3 py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded-xl hover:bg-blue-100 transition-colors"
            >
              💼 퇴직금 및 IRP 절세 계산기
            </Link>
          </div>
        </div>

        {/* WordPress Link */}
        <WordPressLink
          title="2026년 연말정산 신용카드 vs 체크카드 최적 황금 비율 공제 전략"
          url="https://weknews.com/%ec%8b%a0%ec%9a%a9%ec%b9%b4%eb%93%9c-%ec%86%8c%eb%93%9d%ea%b3%b5%ec%a0%9c-%ea%b3%84%ec%82%b0%ea%b8%b8/"
        />
      </div>
    </div>
  );
}
