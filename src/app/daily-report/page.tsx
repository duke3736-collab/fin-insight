"use client";

import { useState } from "react";
import Link from "next/link";
import AdSenseBanner from "@/components/AdSenseBanner";

export default function DailyReportPage() {
  const [status, setStatus] = useState<"idle" | "running" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("▶️ 1클릭 자동 실행 (백그라운드 동작)");

  const startDaily = async () => {
    setStatus("running");
    setMessage("⏳ 파이썬 스크립트 실행 중...");
    
    try {
      const response = await fetch('http://localhost:8888/api/run-daily', { method: 'POST' });
      if (response.ok) {
        setStatus("success");
        setMessage("✅ 리포트 생성 시작! (작업이 끝나면 이메일/바탕화면 확인)");
      } else {
        setStatus("error");
        setMessage("❌ 실행 실패 (서버 오류)");
      }
    } catch (err) {
      setStatus("error");
      setMessage("❌ 실행 실패 (위젯관리자_실행.command를 켜두셨나요?)");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <nav className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-4">
        <Link href="/" className="hover:text-slate-800">홈</Link>
        <span>›</span>
        <span className="text-slate-800">데일리 금융 리포트</span>
      </nav>

      <AdSenseBanner dataAdSlot="4122383889" />

      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-br from-indigo-600 to-blue-500 p-8 md:p-12 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-20 transform rotate-12 scale-150">📰</div>
            <div className="relative z-10">
                <h1 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">데일리 금융 리포트 (코다리 부장)</h1>
                <p className="text-indigo-100 text-lg max-w-lg mx-auto">
                    매일 아침 연예, 부동산, 정부지원금, 주식 뉴스를 수집해 자동으로 보고서를 생성하고 발송합니다.
                </p>
            </div>
        </div>

        <div className="p-8 md:p-12 space-y-8">
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800">✨ 코다리 부장의 주요 업무</h2>
                <ul className="space-y-3 text-slate-600">
                    <li className="flex items-center gap-3 pb-3 border-b border-slate-100">
                        <span className="text-xl">✅</span>
                        <span className="font-medium">구글 뉴스 & 트렌드 실시간 수집</span>
                    </li>
                    <li className="flex items-center gap-3 pb-3 border-b border-slate-100">
                        <span className="text-xl">✅</span>
                        <span className="font-medium">Gemini 2.5 Flash AI 수익 특화형 원고 12종 + 쇼핑 리포트 3종 작성</span>
                    </li>
                    <li className="flex items-center gap-3 pb-3 border-b border-slate-100">
                        <span className="text-xl">✅</span>
                        <span className="font-medium">바탕화면 HTML 리포트 생성</span>
                    </li>
                    <li className="flex items-center gap-3 pb-3 border-b border-slate-100">
                        <span className="text-xl">✅</span>
                        <span className="font-medium">지정된 이메일로 자동 발송</span>
                    </li>
                </ul>
            </div>

            <div className="bg-slate-900 rounded-2xl p-6 text-sky-400 font-mono text-sm leading-relaxed overflow-x-auto shadow-inner">
                <div className="text-slate-500 mb-2">// 수동 터미널 실행 시</div>
                <div>$ cd daily-content-factory</div>
                <div>$ python3 main.py</div>
            </div>

            <div className="pt-4">
                <button 
                    onClick={startDaily} 
                    disabled={status === "running"}
                    className={`w-full py-5 rounded-xl font-bold text-lg transition-all shadow-lg flex justify-center items-center gap-2 ${
                        status === "running" ? 'bg-slate-200 text-slate-500 cursor-not-allowed' :
                        status === "success" ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/30' :
                        status === "error" ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-rose-500/30' :
                        'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/30 hover:-translate-y-1 hover:shadow-xl'
                    }`}
                >
                    {status === "running" && (
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    )}
                    {message}
                </button>
            </div>
            
            {status === "error" && (
                <p className="text-sm text-rose-500 text-center mt-2 font-medium">
                    주의: 이 기능은 로컬 환경의 통합 위젯 관리자 백엔드(포트 8888)가 실행 중이어야 합니다. 바탕화면의 `위젯관리자_실행.command`를 실행해 주세요.
                </p>
            )}
        </div>
      </div>
    </div>
  );
}
