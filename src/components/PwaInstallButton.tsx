"use client";

import { useState, useEffect } from "react";

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstruction, setShowIOSInstruction] = useState(false);

  useEffect(() => {
    // Listen for the beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detect iOS (Safari doesn't support beforeinstallprompt)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      // We no longer need the prompt. Clear it up.
      setDeferredPrompt(null);
    } else if (isIOS) {
      // Show iOS instruction
      setShowIOSInstruction(true);
      setTimeout(() => setShowIOSInstruction(false), 5000); // Hide after 5 seconds
    } else {
      // Fallback for desktop or unsupported browsers
      alert("브라우저 메뉴(⋮)에서 '홈 화면에 추가' 또는 '앱 설치'를 선택해주세요.");
    }
  };

  return (
    <div className="relative mt-8 flex flex-col items-center">
      <button 
        onClick={handleInstallClick}
        className="group inline-flex flex-col sm:flex-row items-center gap-4 bg-white/10 hover:bg-white/20 active:bg-white/30 backdrop-blur-md border border-white/20 p-4 rounded-2xl cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        <div className="text-4xl group-hover:animate-bounce">📱</div>
        <div className="text-left">
          <div className="text-white font-bold flex items-center gap-2">
            스마트폰 앱으로 더 편하게 보세요!
            <span className="bg-indigo-500 text-xs px-2 py-0.5 rounded-full shadow-sm animate-pulse">설치하기</span>
          </div>
          <div className="text-indigo-200 text-sm mt-1">
            이 버튼을 눌러 홈 화면에 앱을 바로 추가하세요.
          </div>
        </div>
      </button>

      {/* iOS Instruction Tooltip */}
      {showIOSInstruction && (
        <div className="absolute top-full mt-4 bg-white text-slate-800 p-4 rounded-2xl shadow-2xl border border-slate-200 text-sm max-w-sm animate-in slide-in-from-top-2 z-50">
          <div className="font-bold mb-2 flex items-center gap-2">
            <span className="text-xl">🍎</span> 아이폰(iOS) 설치 방법
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-600">
            <li>화면 하단의 <b>공유 버튼(가운데 네모 화살표)</b>을 누르세요.</li>
            <li>메뉴를 위로 올려서 <b>'홈 화면에 추가'</b>를 선택하세요.</li>
            <li>우측 상단의 <b>'추가'</b>를 누르면 끝!</li>
          </ol>
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-t border-l border-slate-200 rotate-45"></div>
        </div>
      )}
    </div>
  );
}
