"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import AdSenseBanner from "@/components/AdSenseBanner";
import ShareButtons from "@/components/ShareButtons";
import WordPressLink from "@/components/WordPressLink";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PartTimeSalaryCalculator() {
  const [hourly, setHourly] = useState(10320);
  const [dailyHours, setDailyHours] = useState(8);
  const [monthlyDays, setMonthlyDays] = useState(22);
  const [weeklyOvertime, setWeeklyOvertime] = useState(0);
  const [monthlyOvertime, setMonthlyOvertime] = useState(0);
  
  const [includeHoliday, setIncludeHoliday] = useState(true);
  const [includeTax, setIncludeTax] = useState(false);
  const [isProbation, setIsProbation] = useState(false);

  const formatNumber = (num: number) => Math.round(num).toLocaleString('ko-KR');

  const result = useMemo(() => {
    const basePay = hourly * dailyHours * monthlyDays;
    const holidayPay = includeHoliday ? hourly * 8 * 4.345 : 0;
    const otPay = (weeklyOvertime * 4.345 * hourly * 1.5) + (monthlyOvertime * hourly * 1.5);
    
    const totalBefore = basePay + holidayPay + otPay;
    const probationDeduction = isProbation ? totalBefore * 0.1 : 0;
    const tax = includeTax ? (totalBefore - probationDeduction) * 0.13 : 0;
    const finalPay = totalBefore - probationDeduction - tax;

    return {
      basePay,
      holidayPay,
      otPay,
      totalBefore,
      probationDeduction,
      tax,
      finalPay
    };
  }, [hourly, dailyHours, monthlyDays, weeklyOvertime, monthlyOvertime, includeHoliday, includeTax, isProbation]);

  const chartData = {
    labels: ['기본급', '주휴수당', '연장수당', '수습차감', '세금'],
    datasets: [{
      data: [
        result.basePay, 
        result.holidayPay, 
        result.otPay, 
        Math.abs(result.probationDeduction), 
        Math.abs(result.tax)
      ],
      backgroundColor: ['#f43f5e', '#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
      borderColor: '#fff',
      borderWidth: 3
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: { position: 'bottom' as const, labels: { padding: 12, font: { size: 13 } } },
      tooltip: { callbacks: { label: (ctx: any) => ' ' + formatNumber(Math.abs(ctx.raw)) + '원' } }
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <nav className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-4">
        <Link href="/" className="hover:text-slate-800">홈</Link>
        <span>›</span>
        <span>투자 계산기</span>
        <span>›</span>
        <span className="text-slate-800">알바 급여 계산기</span>
      </nav>

      <AdSenseBanner dataAdSlot="4122383889" />

      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden p-6 md:p-10 text-slate-800">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center px-4 py-1.5 bg-pink-50 text-pink-600 font-bold rounded-full text-xs mb-6 border border-pink-100">
            ✨ 2026년 최저시급 10,320원 반영
          </div>
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl shadow-lg mb-4 text-2xl text-white">
            ⏰
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">알바 급여 계산기</h1>
          <p className="text-slate-500 font-medium text-sm">주휴수당, 세금, 수습기간까지 한 번에 완벽 계산</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">시급 (원)</label>
              <input 
                type="number" 
                value={hourly || ''} 
                onChange={e => setHourly(parseFloat(e.target.value) || 0)} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-800 text-lg font-bold outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">일일 근무시간</label>
                <input 
                  type="number" step="0.5"
                  value={dailyHours || ''} 
                  onChange={e => setDailyHours(parseFloat(e.target.value) || 0)} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-800 font-bold outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">월 근무일수</label>
                <input 
                  type="number" 
                  value={monthlyDays || ''} 
                  onChange={e => setMonthlyDays(parseFloat(e.target.value) || 0)} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-800 font-bold outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">주 연장시간</label>
                <input 
                  type="number" step="0.5"
                  value={weeklyOvertime || ''} 
                  onChange={e => setWeeklyOvertime(parseFloat(e.target.value) || 0)} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-800 font-bold outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">월 연장시간</label>
                <input 
                  type="number" step="0.5"
                  value={monthlyOvertime || ''} 
                  onChange={e => setMonthlyOvertime(parseFloat(e.target.value) || 0)} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-800 font-bold outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all" 
                />
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-100">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={includeHoliday}
                  onChange={e => setIncludeHoliday(e.target.checked)}
                  className="w-5 h-5 rounded text-pink-500 focus:ring-pink-500 border-gray-300 cursor-pointer"
                />
                <span className="font-semibold text-slate-700 group-hover:text-pink-600 transition-colors">주휴수당 포함 (주 15시간 이상)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={includeTax}
                  onChange={e => setIncludeTax(e.target.checked)}
                  className="w-5 h-5 rounded text-pink-500 focus:ring-pink-500 border-gray-300 cursor-pointer"
                />
                <span className="font-semibold text-slate-700 group-hover:text-pink-600 transition-colors">세금・4대보험 공제 (약 13%)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={isProbation}
                  onChange={e => setIsProbation(e.target.checked)}
                  className="w-5 h-5 rounded text-pink-500 focus:ring-pink-500 border-gray-300 cursor-pointer"
                />
                <span className="font-semibold text-slate-700 group-hover:text-pink-600 transition-colors">수습 기간 적용 (90% 지급)</span>
              </label>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 md:p-8 border border-slate-200 h-full flex flex-col">
            <div className="text-center mb-6 pb-6 border-b border-slate-200">
              <div className="text-sm font-bold text-slate-500 mb-2">최종 예상 월급</div>
              <div className="text-4xl md:text-5xl font-black tracking-tight text-pink-600">
                {formatNumber(result.finalPay)}원
              </div>
            </div>
            
            <div className="space-y-3 text-sm font-medium mb-8">
              <div className="flex justify-between text-slate-700"><span>기본급</span><span>{formatNumber(result.basePay)}원</span></div>
              {result.holidayPay > 0 && <div className="flex justify-between text-emerald-600"><span>주휴수당</span><span>+{formatNumber(result.holidayPay)}원</span></div>}
              {result.otPay > 0 && <div className="flex justify-between text-emerald-600"><span>연장수당</span><span>+{formatNumber(result.otPay)}원</span></div>}
              {result.probationDeduction > 0 && <div className="flex justify-between text-amber-600"><span>수습 차감</span><span>-{formatNumber(result.probationDeduction)}원</span></div>}
              {result.tax > 0 && <div className="flex justify-between text-rose-500"><span>세금・공제</span><span>-{formatNumber(result.tax)}원</span></div>}
            </div>

            <div className="mt-auto h-52 relative flex justify-center">
              <Doughnut data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="mt-8">
           <ShareButtons 
             title="2026년 알바 급여 계산기 (최저시급 반영)" 
             description="내 알바비 정확하게 얼마일까? 주휴수당, 세금 공제까지 한 번에!" 
             kakaoAppKey="11032eefd7d0111cb94d93c0ab41eb01" 
           />
        </div>
      </div>

      <article className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm mt-12 space-y-8">
        <section className="prose prose-slate max-w-none">
          <h2 className="text-xl font-extrabold text-slate-900 mb-4">알바급여계산기 기본 계산법 단계별로 따라하기</h2>
          <p>알바급여계산기 사용하는 게 처음이시라면, 아래 단계대로 따라 해보세요. 아주 간단합니다!</p>

          <h3>단계 1: 시급 × 일한 시간</h3>
          <p><strong>기본 계산 공식</strong>: 시급 × 일한 시간<br/>
          <strong>예시)</strong> 카페에서 하루 6시간 일했다면<br />
          10,320원 × 6 = <strong>61,920원 (세전)</strong></p>

          <h3>단계 2: 주급 계산</h3>
          <p>주 3일, 하루 5시간 근무 = 주 15시간<br />
          <strong>기본 주급</strong> = 10,320원 × 15 = <strong>154,800원</strong></p>

          <h3>단계 3: 월급 환산</h3>
          <p>한 달을 대략 <strong>4.345주</strong>로 계산합니다.<br />
          주급 × 4.345 = 월급 예상액</p>

          <hr className="my-8" />

          <h2>주휴수당, 이거 모르면 매달 손해!</h2>
          <p>주 15시간 이상 근무하고 소정근로일에 개근하면 받을 수 있는 <strong>유급휴일 수당</strong>입니다. 많은 알바생들이 이걸 모르고 그냥 지나칩니다.</p>
          <p><strong>주휴수당 계산 공식</strong><br />
          (1주일 소정근로시간 ÷ 40) × 8시간 × 시급</p>
          <ul>
              <li><strong>주 20시간 알바생</strong><br />
              (20 ÷ 40) × 8 × 10,320 = <strong>41,280원</strong> (주휴수당)</li>
              <li><strong>총 주급</strong>: 기본 206,400원 + 주휴 41,280원 = <strong>247,680원</strong></li>
          </ul>

          <hr className="my-8" />

          <h2>연장·야간·휴일 수당까지 추가 계산</h2>
          <ul>
              <li><strong>연장근로</strong> (1일 8시간 초과): 시급 × <strong>1.5배</strong></li>
              <li><strong>야간근로</strong> (22시~06시): 시급 × <strong>0.5배 가산</strong></li>
              <li><strong>휴일근로</strong>: 시급 × <strong>2배</strong> (또는 대체휴일 + 1.5배)</li>
          </ul>
          <p>5인 이상 사업장은 위 가산수당을 <strong>반드시</strong> 줘야 합니다. 계산기에서 연장시간만 입력하면 자동으로 나와요.</p>

          <hr className="my-8" />

          <h2>실수령액이 줄어드는 이유와 대처법</h2>
          <ul>
              <li>4대보험 공제 (국민연금, 건강보험, 고용보험, 산재보험)</li>
              <li>소득세 (3.3% 프리랜서 신고 등)</li>
          </ul>
          <p><strong>꿀팁</strong>: 주 15시간 미만으로 초단시간 근무하면 4대보험 대부분을 내지 않아 실수령액이 더 높습니다.</p>
        </section>
        
        <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-slate-100">
          <WordPressLink title="퇴직금 계산기로 내 예상 퇴직금 확인하기" url="/calculators/severance" />
          <WordPressLink title="연봉 실수령액 계산기로 직장인 실수령액 확인" url="/calculators/salary" />
        </div>
      </article>
    </div>
  );
}
