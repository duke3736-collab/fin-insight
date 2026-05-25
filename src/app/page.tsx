import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-3xl p-8 md:p-12 border border-emerald-100 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full mb-4">
            🔥 현재 가장 인기 있는 계산기
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-800 leading-tight mb-4">
            복잡한 금융 계산,<br />
            <span className="text-emerald-600">이제 1초 만에 확인하세요.</span>
          </h1>
          <p className="text-slate-600 text-lg mb-8">
            세금부터 수수료, 연금 전환 혜택까지. 스마트한 투자의 시작은 정확한 계산입니다.
          </p>
          <Link href="/calculators/isa" className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
            🧮 ISA 절세액 계산하기
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>
        </div>
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl"></div>
        <div className="absolute right-20 -top-20 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl"></div>
      </section>

      {/* Investment Calculators Grid */}
      <section id="investment">
        <h2 className="text-2xl font-extrabold text-slate-800 mb-6 flex items-center gap-2">
          <span>📈 투자 계산기</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <Link href="/calculators/isa" className="group flex flex-col p-6 bg-white rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-xl hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              🧮
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors">중개형 ISA 비과세 및 연금 전환 절세 계산기</h3>
            <p className="text-sm text-slate-500">
              일반형/서민형 비과세 한도 적용 및 연금 전환 추가 세액공제까지 완벽 계산.
            </p>
          </Link>

          <Link href="/calculators/broker-fee" className="group flex flex-col p-6 bg-white rounded-2xl border border-slate-200 hover:border-purple-500 hover:shadow-xl hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              📊
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-purple-600 transition-colors">국내/해외 주식 증권사 수수료 비교 계산기</h3>
            <p className="text-sm text-slate-500">
              국내주식 거래세, 해외주식 양도세, 증권사별 최적의 거래 수수료 찾기
            </p>
          </Link>

          <Link href="/calculators/growth-fund" className="group flex flex-col p-6 bg-white rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-xl hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              🛡️
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors">국민성장펀드 수익률 및 손실방어 계산기</h3>
            <p className="text-sm text-slate-500">
              정부의 20% 손실 방어 효과 시뮬레이션 및 ISA 비과세 계좌 수익금 산출
            </p>
          </Link>

          <Link href="/calculators/real-estate-tax" className="group flex flex-col p-6 bg-white rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-xl hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              🏠
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">부동산 취득세 계산기</h3>
            <p className="text-sm text-slate-500">
              주택 수, 조정대상지역, 전용면적까지 완벽 반영한 정확한 세액 산출
            </p>
          </Link>

          <Link href="/calculators/apartment-roi" className="group flex flex-col p-6 bg-white rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-xl hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              📈
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">아파트 투자 수익률 계산기</h3>
            <p className="text-sm text-slate-500">
              매매가, 부대비용, 임대수익을 종합한 내 진짜 투자 수익률 확인
            </p>
          </Link>

          <Link href="/calculators/gold-price" className="group flex flex-col p-6 bg-white rounded-2xl border border-slate-200 hover:border-amber-500 hover:shadow-xl hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              🪙
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-amber-600 transition-colors">실시간 금시세</h3>
            <p className="text-sm text-slate-500">
              1돈, 1g, 국제 시세(1oz) 기준 실시간 금 가격 조회
            </p>
          </Link>

          <Link href="/calculators/yield-snapshot" className="group flex flex-col p-6 bg-white rounded-2xl border border-slate-200 hover:border-indigo-500 hover:shadow-xl hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              📸
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">수익률 인증샷 메이커</h3>
            <p className="text-sm text-slate-500">
              내 주식 수익률을 예쁜 카드로 만들어 자랑해보세요!
            </p>
          </Link>

        </div>
      </section>

      {/* Life Calculators Grid */}
      <section id="life">
        <h2 className="text-2xl font-extrabold text-slate-800 mb-6 flex items-center gap-2">
          <span>☕ 생활 계산기</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          <Link href="/calculators/deposit" className="group flex flex-col p-6 bg-white rounded-2xl border border-slate-200 hover:border-sky-500 hover:shadow-xl hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              📊
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-sky-600 transition-colors">예금 적금 최고 금리 비교 계산기</h3>
            <p className="text-sm text-slate-500">
              실시간 1금융권·저축은행 정기예금, 파킹통장 최고 금리 비교
            </p>
          </Link>

          <Link href="/calculators/severance" className="group flex flex-col p-6 bg-white rounded-2xl border border-slate-200 hover:border-indigo-500 hover:shadow-xl hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              💼
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">퇴직금 계산기 및 IRP 세금 비교</h3>
            <p className="text-sm text-slate-500">
              근속연수에 따른 1일 평균임금 기반 예상 퇴직금 산정 및 IRP 세금 혜택 안내
            </p>
          </Link>

          <Link href="/calculators/salary" className="group flex flex-col p-6 bg-white rounded-2xl border border-slate-200 hover:border-indigo-500 hover:shadow-xl hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              💰
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">2026년 연봉 실수령액 계산기</h3>
            <p className="text-sm text-slate-500">
              2026년 기준 4대보험, 소득세 완벽 반영 및 직관적인 공제 비율 제공
            </p>
          </Link>

          <Link href="/calculators/zzantech" className="group flex flex-col p-6 bg-white rounded-2xl border border-slate-200 hover:border-purple-500 hover:shadow-xl hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              ☕
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-purple-600 transition-colors">짠테크 수익 계산기</h3>
            <p className="text-sm text-slate-500">
              오늘 아낀 커피값, 매달 참은 배달음식 값이 10년 뒤에 얼마가 될까요?
            </p>
          </Link>

          <Link href="/calculators/health-insurance" className="group flex flex-col p-6 bg-white rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-xl hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              🏥
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">직장인/지역가입자 건강보험료 계산기</h3>
            <p className="text-sm text-slate-500">
              2026년 최신 요율(7.19%) 반영, 재산/소득/자동차 기준 완벽 계산
            </p>
          </Link>

          <Link href="/calculators/grant-matcher" className="group flex flex-col p-6 bg-white rounded-2xl border border-slate-200 hover:border-sky-500 hover:shadow-xl hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              🎁
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-sky-600 transition-colors">내 동네 지원금 찾기</h3>
            <p className="text-sm text-slate-500">
              거주 지역과 관심 분야(청년, 육아, 소상공인 등)를 선택하여 숨은 지원금을 빠르게 찾아보세요.
            </p>
          </Link>

          <a href="https://map.weknews.com" target="_blank" rel="noopener noreferrer" className="group flex flex-col p-6 bg-white rounded-2xl border border-slate-200 hover:border-cyan-500 hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">HOT</div>
            <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              🏝️
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-cyan-600 transition-colors">전국 여름 물놀이 갓성비맵</h3>
            <p className="text-sm text-slate-500">
              공짜 바닥분수, 5천원 이하 가성비 수영장, 취사가능 계곡까지 지도로 한눈에!
            </p>
          </a>

          <Link href="/calculators/goal-tracker" className="group flex flex-col p-6 bg-white rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-xl hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              🎯
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors">D-Day 목표 달성기</h3>
            <p className="text-sm text-slate-500">
              내 목표 금액까지 얼마나 남았을까요? 진척도를 시각적으로 확인해보세요.
            </p>
          </Link>

          <Link href="/daily-report" className="group flex flex-col p-6 bg-white rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-xl hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              📰
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">데일리 금융 리포트</h3>
            <p className="text-sm text-slate-500">
              코다리 부장이 매일 아침 수집하고 요약해주는 금융 뉴스 리포트입니다.
            </p>
          </Link>

        </div>
      </section>
    </div>
  );
}
