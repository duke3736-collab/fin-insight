import Link from "next/link";
import { fetchGoogleNews } from "@/lib/rss";
import PWAInstallButton from "@/components/PWAInstallButton";
import ShareButtons from "@/components/ShareButtons";

export const revalidate = 3600; // 1 hour

export default async function Home() {
  const latestNews = await fetchGoogleNews("경제 OR 주식 OR 가상화폐", 3);

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

          <Link href="/daily-report" className="block mt-8 bg-white/60 hover:bg-white backdrop-blur-sm border border-emerald-200/60 rounded-2xl p-5 shadow-md transition-all hover:shadow-xl hover:-translate-y-1 group relative overflow-hidden w-full max-w-md">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-xl animate-pulse">📰</span>
                <h3 className="font-extrabold text-slate-800 text-lg">오늘의 핵심 핫이슈</h3>
              </div>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full group-hover:bg-indigo-100 transition-colors flex items-center gap-1">전체보기 <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></span>
            </div>
            <ul className="space-y-2.5 relative z-10">
              {latestNews.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-slate-600 text-[15px] font-medium leading-snug">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                  <span className="truncate group-hover:text-slate-900 transition-colors">{item.title}</span>
                </li>
              ))}
              {latestNews.length === 0 && (
                <li className="text-sm text-slate-400">최신 뉴스를 불러오는 중입니다...</li>
              )}
            </ul>
          </Link>
          
          <div className="mt-8 flex flex-col items-start gap-4">
            <PWAInstallButton />
            <div className="bg-white/40 p-3 rounded-2xl border border-emerald-100">
              <ShareButtons 
                title="핀인사이트 - 똑똑한 금융 계산기" 
                description="복잡한 세금과 금융 계산을 한 번에! 나의 투자 수익률과 절세 혜택을 확인해보세요." 
                kakaoAppKey={process.env.NEXT_PUBLIC_KAKAO_APP_KEY || ""} 
              />
            </div>
          </div>
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

          <Link href="/calculators/gift-tax" className="group flex flex-col p-6 bg-white rounded-2xl border border-slate-200 hover:border-violet-500 hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-violet-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">NEW</div>
            <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              🎁
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-violet-600 transition-colors">증여세 계산기</h3>
            <p className="text-sm text-slate-500">
              관계별 공제·금융재산공제·세대생략 할증까지 완벽 반영한 증여세 자동 계산
            </p>
          </Link>

          <Link href="/calculators/inheritance-tax" className="group flex flex-col p-6 bg-white rounded-2xl border border-slate-200 hover:border-violet-500 hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-violet-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">NEW</div>
            <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              🪦
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-violet-600 transition-colors">상속세 계산기</h3>
            <p className="text-sm text-slate-500">
              일괄공제·배우자공제·금융재산상속공제 완벽 반영한 상속세 자동 계산
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

      {/* DRIVE MAP BANNER & AFFILIATE */}
      <div className="pb-8 space-y-4">
        <a href="https://drive.weknews.com/" target="_blank" rel="noopener noreferrer" className="block w-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-6 md:p-8 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all group overflow-hidden relative">
            <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
                <div className="flex items-center gap-4">
                    <span className="text-5xl group-hover:scale-110 transition-transform">🚗</span>
                    <div>
                        <h3 className="text-xl md:text-2xl font-black mb-1">답답할 땐? 전국 감성 드라이브 코스</h3>
                        <p className="text-orange-100 font-medium text-sm md:text-base">바다, 노을, 야경까지! 1초 만에 확인하는 인생 드라이브 코스 모음</p>
                    </div>
                </div>
                <span className="shrink-0 w-full md:w-auto text-center bg-white text-orange-600 font-black px-8 py-4 rounded-2xl shadow-md group-hover:bg-orange-50 transition-colors text-lg">
                    코스 보기 👉
                </span>
            </div>
        </a>

        <a href="https://link.coupang.com/a/d3Fm5zRXxs" target="_blank" rel="noopener noreferrer" className="block w-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-6 md:p-8 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all group overflow-hidden relative">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
                <div className="flex items-center gap-4">
                    <span className="text-5xl group-hover:animate-bounce">📚</span>
                    <div>
                        <h3 className="text-xl md:text-2xl font-black mb-1">재테크/부동산 베스트셀러 모음전</h3>
                        <p className="text-emerald-100 font-medium text-sm md:text-base">아는 만큼 돈이 됩니다! 지금 가장 핫한 경제 도서 확인하기</p>
                    </div>
                </div>
                <span className="shrink-0 w-full md:w-auto text-center bg-white text-emerald-600 font-black px-8 py-4 rounded-2xl shadow-md group-hover:bg-emerald-50 transition-colors text-lg">
                    추천 도서 보기 👉
                </span>
            </div>
            <div className="absolute bottom-2 right-4 text-[10px] text-white/40">파트너스 활동을 통해 일정액의 수수료를 제공받을 수 있음</div>
        </a>
      </div>

      {/* Life Calculators Grid */}
      <section id="life">
        <h2 className="text-2xl font-extrabold text-slate-800 mb-6 flex items-center gap-2">
          <span>☕ 생활 계산기</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          <Link href="/calculators/air-conditioner-bill" className="group flex flex-col p-6 bg-white rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">HOT</div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              🔌
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">에어컨 전기세 계산기</h3>
            <p className="text-sm text-slate-500">
              벽걸이, 스탠드, 시스템 에어컨 가동시간 및 누진세 구간별 예상 전기요금 계산
            </p>
          </Link>

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

          <Link href="/calculators/unemployment-benefit" className="group flex flex-col p-6 bg-white rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">NEW</div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              💸
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors">실업급여 모의계산기</h3>
            <p className="text-sm text-slate-500">
              2026년 최신 최저임금 반영 및 나이·근무기간에 따른 예상 구직급여액과 수급일수 계산
            </p>
          </Link>

          <Link href="/calculators/basic-livelihood" className="group flex flex-col p-6 bg-white rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">NEW</div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              🏠
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors">기초생활수급자 소득인정액 모의계산기</h3>
            <p className="text-sm text-slate-500">
              2026년 최신 중위소득 반영 및 소득·재산·부채·자동차 조건에 따른 수급 가부 및 모의 진단
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

          <Link href="/calculators/part-time-salary" className="group flex flex-col p-6 bg-white rounded-2xl border border-slate-200 hover:border-pink-500 hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">NEW</div>
            <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              ⏰
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-pink-600 transition-colors">2026년 알바 급여 계산기</h3>
            <p className="text-sm text-slate-500">
              최저시급 반영, 주휴수당, 세금, 수습기간 공제까지 한 번에 완벽 계산
            </p>
          </Link>

          <Link href="/calculators/pension-reduction" className="group flex flex-col p-6 bg-white rounded-2xl border border-slate-200 hover:border-indigo-500 hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">HOT</div>
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              👴
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">국민연금 감액기준 계산기</h3>
            <p className="text-sm text-slate-500">
              2026년 최신 개정법 완벽 반영! 소득 활동에 따른 연금 감액 및 2025년 환급 예상액 계산
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

          <a href="https://drive.weknews.com/" target="_blank" rel="noopener noreferrer" className="group flex flex-col p-6 bg-white rounded-2xl border border-slate-200 hover:border-orange-500 hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">HOT</div>
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              🚗
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-orange-600 transition-colors">전국 감성 드라이브 코스</h3>
            <p className="text-sm text-slate-500">
              바다, 노을, 벚꽃 명소 등 인생 드라이브 코스 총정리!
            </p>
          </a>

          <a href="https://map.weknews.com/" target="_blank" rel="noopener noreferrer" className="group flex flex-col p-6 bg-white rounded-2xl border border-slate-200 hover:border-cyan-500 hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden">
            <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              🏝️
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-cyan-600 transition-colors">전국 여름 물놀이 씨맵(Sea-Map)</h3>
            <p className="text-sm text-slate-500">
              공짜 바닥분수, 5천원 이하 가성비 수영장, 취사가능 계곡까지 지도로 한눈에!
            </p>
          </a>

          <a href="https://mystic.weknews.com/" target="_blank" rel="noopener noreferrer" className="group flex flex-col p-6 bg-white rounded-2xl border border-slate-200 hover:border-purple-500 hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-purple-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">NEW</div>
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              🔮
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-purple-600 transition-colors">미스틱 AI 무료 타로/사주</h3>
            <p className="text-sm text-slate-500">
              소름 돋는 AI 타로와 사주, 오늘의 운세를 평생 무료로 확인해보세요!
            </p>
          </a>

          <a href="https://download.weknews.com/" target="_blank" rel="noopener noreferrer" className="group flex flex-col p-6 bg-white rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">NEW</div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              ⚡
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">소프트웨어 금고 (무료 다운로드)</h3>
            <p className="text-sm text-slate-500">
              필수 PC 프로그램, 최신 AI 도구를 광고 없이 가장 빠르고 안전하게 다운로드하세요!
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


        </div>
      </section>
    </div>
  );
}
