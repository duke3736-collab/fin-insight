"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function SeveranceCalculatorPage() {
  const [joinDate, setJoinDate] = useState("");
  const [leaveDate, setLeaveDate] = useState("");
  const [basicPayStr, setBasicPayStr] = useState("");
  const [otherPayStr, setOtherPayStr] = useState("0");
  const [annualBonusStr, setAnnualBonusStr] = useState("0");
  const [leavePayStr, setLeavePayStr] = useState("0");
  const [isCalculated, setIsCalculated] = useState(false);

  // Results State
  const [totalWorkDays, setTotalWorkDays] = useState(0);
  const [targetPeriodDays, setTargetPeriodDays] = useState(0);
  const [totalBasePay, setTotalBasePay] = useState(0);
  const [bonusCalc, setBonusCalc] = useState(0);
  const [leaveCalc, setLeaveCalc] = useState(0);
  const [totalTargetWage, setTotalTargetWage] = useState(0);
  const [avgDailyWage, setAvgDailyWage] = useState(0);
  const [severancePay, setSeverancePay] = useState(0);
  const [isValid, setIsValid] = useState(true);

  // Formatter functions
  const formatNumber = (num: number) => Math.floor(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const removeCommas = (str: string) => str.replace(/,/g, "");

  const handleCurrencyChange = (setter: (val: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = removeCommas(e.target.value);
    if (value === "") {
      setter("");
      return;
    }
    if (!/^\d+$/.test(value)) {
      value = value.replace(/[^\d]/g, "");
    }
    setter(formatNumber(parseInt(value || "0", 10)));
  };

  const calculateDaysBetween = (startStr: string, endStr: string) => {
    if (!startStr || !endStr) return 0;
    const start = new Date(startStr);
    const end = new Date(endStr);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Update total days automatically when dates change
  useEffect(() => {
    if (joinDate && leaveDate) {
      setTotalWorkDays(calculateDaysBetween(joinDate, leaveDate));
    } else {
      setTotalWorkDays(0);
    }
  }, [joinDate, leaveDate]);

  const handleCalculate = () => {
    if (!joinDate || !leaveDate) {
      alert("입사일과 퇴사일을 입력해주세요.");
      return;
    }

    const workDays = calculateDaysBetween(joinDate, leaveDate);
    if (workDays < 0) {
      alert("퇴사일은 입사일보다 커야 합니다.");
      return;
    }

    // Target period (3 months before leave date)
    const end = new Date(leaveDate);
    const threeMonthsBefore = new Date(leaveDate);
    threeMonthsBefore.setMonth(threeMonthsBefore.getMonth() - 3);
    const targetPeriod = calculateDaysBetween(threeMonthsBefore.toISOString().split("T")[0], leaveDate);

    // Parsing Pay
    const basicPay = basicPayStr ? parseInt(removeCommas(basicPayStr), 10) : 0;
    const otherPay = otherPayStr ? parseInt(removeCommas(otherPayStr), 10) : 0;
    const annualBonus = annualBonusStr ? parseInt(removeCommas(annualBonusStr), 10) : 0;
    const leavePay = leavePayStr ? parseInt(removeCommas(leavePayStr), 10) : 0;

    // Calculation Logic
    const tBasePay = basicPay + otherPay;
    const tBonusCalc = Math.floor(annualBonus * (3 / 12));
    const tLeaveCalc = Math.floor(leavePay * (3 / 12));
    const tTotalTargetWage = tBasePay + tBonusCalc + tLeaveCalc;
    const tAvgDailyWage = targetPeriod > 0 ? (tTotalTargetWage / targetPeriod) : 0;
    const tSeverancePay = tAvgDailyWage * 30 * (workDays / 365);

    // Set Results
    setTotalWorkDays(workDays);
    setTargetPeriodDays(targetPeriod);
    setTotalBasePay(tBasePay);
    setBonusCalc(tBonusCalc);
    setLeaveCalc(tLeaveCalc);
    setTotalTargetWage(tTotalTargetWage);
    setAvgDailyWage(tAvgDailyWage);
    setSeverancePay(tSeverancePay);
    setIsValid(workDays >= 365);
    setIsCalculated(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-4">
        <Link href="/" className="hover:text-slate-800">홈</Link>
        <span>›</span>
        <span>직장인 계산기</span>
        <span>›</span>
        <span className="text-slate-800">퇴직금/IRP 계산기</span>
      </nav>

      {/* Dark Theme Calculator Container */}
      <div className="bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-800 overflow-hidden relative">
        {/* Subtle glow effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-violet-600/10 blur-[100px]"></div>
          <div className="absolute top-[40%] -right-[20%] w-[60%] h-[60%] rounded-full bg-cyan-600/10 blur-[100px]"></div>
        </div>

        <div className="relative p-6 md:p-10 text-slate-200">
          
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl shadow-lg shadow-violet-500/20 mb-4 text-2xl">
              💼
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2 tracking-tight">
              퇴직금 실전 계산기
            </h1>
            <p className="text-slate-400 text-sm">
              1일 평균임금 기반 예상 퇴직금 및 IRP 전환 세금 혜택
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Input Section */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-white border-b border-slate-700 pb-2 mb-4">📝 근무 및 급여 정보</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">입사일</label>
                  <input 
                    type="date" 
                    value={joinDate}
                    onChange={(e) => setJoinDate(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">퇴사일</label>
                  <input 
                    type="date" 
                    value={leaveDate}
                    onChange={(e) => setLeaveDate(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-violet-500 transition-colors"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">마지막 근무일의 다음 날</p>
                </div>
              </div>

              {joinDate && leaveDate && (
                <div className={`p-3 rounded-xl border text-center text-sm font-bold ${totalWorkDays < 365 ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                  총 재직일수: {formatNumber(totalWorkDays)}일
                </div>
              )}

              <div className="space-y-4 pt-4 border-t border-slate-700/50">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">퇴직 전 3개월 임금 총액</h3>
                
                <div>
                  <label className="block text-sm text-slate-300 mb-2">기본급 총액 (3개월 합산)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">₩</span>
                    <input 
                      type="text" 
                      value={basicPayStr}
                      onChange={handleCurrencyChange(setBasicPayStr)}
                      placeholder="9,000,000"
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-10 pr-10 text-white font-semibold outline-none focus:border-violet-500 text-right transition-colors"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">원</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">기타수당 총액 (3개월 합산)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">₩</span>
                    <input 
                      type="text" 
                      value={otherPayStr}
                      onChange={handleCurrencyChange(setOtherPayStr)}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-10 pr-10 text-white font-semibold outline-none focus:border-violet-500 text-right transition-colors"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">원</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-700/50">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">연간 상여금 및 연차수당</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">연간 상여금</label>
                    <input 
                      type="text" 
                      value={annualBonusStr}
                      onChange={handleCurrencyChange(setAnnualBonusStr)}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-white font-semibold outline-none focus:border-violet-500 text-right"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">미사용 연차수당</label>
                    <input 
                      type="text" 
                      value={leavePayStr}
                      onChange={handleCurrencyChange(setLeavePayStr)}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-white font-semibold outline-none focus:border-violet-500 text-right"
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={handleCalculate}
                className="w-full py-4 mt-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold rounded-xl shadow-lg shadow-violet-600/25 transition-all active:scale-[0.98]"
              >
                퇴직금 계산하기 →
              </button>
            </div>

            {/* Result Section */}
            <div className={`space-y-6 transition-opacity duration-500 ${isCalculated ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
              <h2 className="text-lg font-bold text-white border-b border-slate-700 pb-2 mb-4">📊 예상 결과</h2>
              
              <div className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 border border-violet-500/20 rounded-2xl p-6 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl"></div>
                <p className="text-violet-300 text-xs font-bold tracking-widest uppercase mb-2">예상 퇴직금 (세전)</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-xl font-medium text-violet-400">₩</span>
                  <span className="text-4xl md:text-5xl font-black text-white tracking-tight">
                    {formatNumber(severancePay)}
                  </span>
                </div>
                {!isValid && isCalculated && (
                  <p className="text-xs text-rose-400 mt-3 font-medium bg-rose-500/10 inline-block px-3 py-1 rounded-full border border-rose-500/20">
                    ⚠️ 근속기간 1년(365일) 미만으로 법정 퇴직금 지급 대상이 아닙니다.
                  </p>
                )}
              </div>

              <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-white mb-4">산정 상세 내역</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">산정 대상 기간 (3개월)</span>
                    <span className="text-white font-medium">{formatNumber(targetPeriodDays)}일</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">3개월간 임금 총액</span>
                    <span className="text-white font-bold">₩{formatNumber(totalTargetWage)}</span>
                  </div>
                  <div className="pl-4 space-y-1 mt-2 border-l-2 border-slate-700 text-xs">
                    <div className="flex justify-between items-center text-slate-500">
                      <span>기본급+기타수당</span>
                      <span>₩{formatNumber(totalBasePay)}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500">
                      <span>상여금 가산 (3/12)</span>
                      <span>₩{formatNumber(bonusCalc)}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500">
                      <span>연차수당 가산 (3/12)</span>
                      <span>₩{formatNumber(leaveCalc)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5">
                <span className="text-sm font-bold text-white">1일 평균임금</span>
                <span className="text-xl font-black text-emerald-400">₩{formatNumber(avgDailyWage)}</span>
              </div>
              
              <div className="text-center text-[11px] text-slate-500 bg-slate-800/30 p-3 rounded-lg border border-slate-800/50">
                계산 공식: 1일 평균임금 × 30일 × (총 재직일수 ÷ 365)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SEO & AdSense Ready Content */}
      <article className="max-w-none space-y-10 pb-12 mt-12 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        
        <section>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 border-b-2 border-slate-100 pb-3 mb-5">퇴직금 지급 기준과 계산 방법 알아보기</h2>
          <p className="text-slate-800 text-[15px] md:text-base leading-relaxed tracking-wide">
            근로자퇴직급여 보장법에 따라 사용자는 근로자가 퇴직할 때 계속근로기간 1년에 대하여 30일분 이상의 <strong>평균임금</strong>을 퇴직금으로 지급해야 합니다. 
            단, 근속기간이 1년(365일) 미만이거나 4주간을 평균하여 1주간의 소정근로시간이 15시간 미만인 근로자는 법정 퇴직금 지급 대상에서 제외됩니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 border-b-2 border-slate-100 pb-3 mb-5">평균임금이란? (통상임금과의 차이)</h2>
          <p className="text-slate-800 text-[15px] md:text-base leading-relaxed tracking-wide mb-5">
            <strong>평균임금</strong>은 퇴직금 산정의 핵심 기준이 됩니다. 이를 산정하여 퇴직금을 계산하는 이유는 근로자가 퇴직으로 인해 겪게 될 경제적 어려움을 최소화하고, 재직 당시의 생활 수준을 보장하기 위함입니다.
          </p>
          <ul className="list-disc pl-6 text-slate-800 text-[15px] md:text-base space-y-3 font-medium bg-slate-50 p-6 rounded-xl border border-slate-100">
            <li><strong>산정 기간:</strong> 퇴직일 이전 3개월간 지급된 임금의 총액을 그 기간의 총 일수로 나눈 금액입니다.</li>
            <li><strong>포함 내역:</strong> 기본급뿐만 아니라 식대, 직책수당, 연장/야간 근로수당 등 근로의 대가로 정기적이고 일률적으로 지급되는 모든 금품이 포함됩니다.</li>
            <li><strong>상여금 및 연차수당:</strong> 연간 지급된 상여금 총액과 퇴직 전 이미 발생한 연차수당의 경우, 각각 3개월분(3/12)만큼만 평균임금 산정에 가산됩니다.</li>
            <li><strong>통상임금과의 비교:</strong> 만약 산출된 평균임금이 근로자의 통상임금보다 적을 경우, 통상임금액을 평균임금으로 하여 퇴직금을 산정해야 합니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 border-b-2 border-slate-100 pb-3 mb-5">퇴직연금 (IRP) 계좌 활용의 엄청난 장점</h2>
          <p className="text-slate-800 text-[15px] md:text-base leading-relaxed tracking-wide">
            과거에는 퇴직금을 일반 급여 통장으로 받았지만, 현재 법적으로 퇴직금은 근로자의 <strong>개인형 퇴직연금(IRP) 계좌</strong>로 지급되는 것이 원칙입니다. 퇴직금을 일시금으로 인출하여 써버리지 않고 IRP 계좌에 보관하거나 연금으로 수령하면 강력한 절세 혜택이 주어집니다.
            <br/><br/>
            퇴직금을 수령할 때 부과되는 '퇴직소득세'를 IRP 계좌 이체 시점에는 내지 않고 과세가 이연되며, 향후 55세 이후에 연금 형태로 수령하게 되면 원래 내야 할 퇴직소득세의 <strong>30%~40%를 깎아주는 감세 혜택</strong>을 누릴 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 border-b-2 border-slate-100 pb-3 mb-5">자주 묻는 질문 (FAQ)</h2>
          <div className="space-y-6">
            <div className="bg-slate-50 p-5 rounded-xl">
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2 mb-2"><span className="text-violet-500">Q.</span> 수습기간도 퇴직금 산정 기간에 포함되나요?</h3>
              <p className="text-slate-700 text-base leading-relaxed pl-7">네, 맞습니다. 수습기간, 인턴기간, 아르바이트 기간을 거쳐 정규직으로 전환된 경우라도 실질적으로 근로관계가 단절되지 않고 계속 근무했다면 해당 기간을 모두 합산하여 근속기간을 산정해야 합니다.</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-xl">
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2 mb-2"><span className="text-violet-500">Q.</span> 실 수령액은 왜 계산기와 다를까요?</h3>
              <p className="text-slate-700 text-base leading-relaxed pl-7">본 계산기는 근로기준법에 따른 법정 최저 기준의 '세전' 퇴직금을 계산합니다. 실제 지급 시에는 퇴직소득세와 지방소득세가 원천징수되며, 회사마다 퇴직위로금 등 누진제가 적용되거나 단체협약에 의한 계산 방식 차이가 존재할 수 있습니다.</p>
            </div>
          </div>
        </section>
      </article>

    </div>
  );
}
