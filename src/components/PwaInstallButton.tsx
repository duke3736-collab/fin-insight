"use client";

import { useEffect, useState } from "react";

export default function PwaInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIosInstruction, setShowIosInstruction] = useState(false);

  useEffect(() => {
    // Check if device is iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Show native install prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      // Show iOS instruction
      setShowIosInstruction(true);
      setTimeout(() => setShowIosInstruction(false), 5000); // Hide after 5s
    } else {
      // Fallback for desktop or non-supported browsers
      alert("브라우저 메뉴(점 3개)에서 '앱 설치' 또는 '홈 화면에 추가'를 클릭해 주세요.");
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button 
        onClick={handleInstallClick}
        className="inline-flex flex-col sm:flex-row items-center gap-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 p-4 rounded-2xl transition-all cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-1 text-left"
      >
        <div className="text-4xl animate-bounce">📱</div>
        <div>
          <div className="text-white font-extrabold text-lg">앱으로 다운받고 편하게 보세요!</div>
          <div className="text-indigo-200 text-sm mt-0.5">
            {deferredPrompt ? "지금 설치하기 👉 클릭" : "설치 방법 확인하기 👉 클릭"}
          </div>
        </div>
      </button>

      {/* iOS Instruction Tooltip */}
      {showIosInstruction && (
        <div className="mt-4 p-4 bg-slate-800 text-white text-sm rounded-xl border border-slate-700 shadow-2xl animate-in slide-in-from-top-2">
          아이폰(Safari) 유저이신가요? 🍎<br />
          화면 하단의 <b>공유버튼(<svg className="inline w-4 h-4 mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>)</b>을 누르고<br />
          <b>'홈 화면에 추가'</b>를 선택해 주세요!
        </div>
      )}
    </div>
  );
}
