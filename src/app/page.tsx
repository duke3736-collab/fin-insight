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

      {/* Calculators Grid */}
      <section>
        <h2 className="text-2xl font-extrabold text-slate-800 mb-6 flex items-center gap-2">
          <span>📈 투자 계산기 모음</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <Link href="/calculators/isa" className="group flex flex-col p-6 bg-white rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-xl hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              🧮
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors">2026 ISA 실전 절세 계산기</h3>
            <p className="text-sm text-slate-500">
              일반형/서민형 비과세 한도 적용 및 연금 전환 추가 세액공제까지 완벽 계산.
            </p>
          </Link>

          <Link href="/calculators/deposit" className="group flex flex-col p-6 bg-white rounded-2xl border border-slate-200 hover:border-sky-500 hover:shadow-xl hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              📊
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-sky-600 transition-colors">예적금 최고 금리 찾기</h3>
            <p className="text-sm text-slate-500">
              실시간 1금융권·저축은행 정기예금, 파킹통장 최고 금리 비교
            </p>
          </Link>

          <Link href="/calculators/severance" className="group flex flex-col p-6 bg-white rounded-2xl border border-slate-200 hover:border-indigo-500 hover:shadow-xl hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              💼
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">퇴직금/IRP 계산기</h3>
            <p className="text-sm text-slate-500">
              근속연수에 따른 1일 평균임금 기반 예상 퇴직금 산정 및 IRP 세금 혜택 안내
            </p>
          </Link>

          <Link href="/calculators/broker-fee" className="group flex flex-col p-6 bg-white rounded-2xl border border-slate-200 hover:border-purple-500 hover:shadow-xl hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              📊
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-purple-600 transition-colors">증권사 수수료/세금 비교</h3>
            <p className="text-sm text-slate-500">
              국내주식 거래세, 해외주식 양도세, 증권사별 최적의 거래 수수료 찾기
            </p>
          </Link>

        </div>
      </section>
    </div>
  );
}
