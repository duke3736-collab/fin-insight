"use client";

import { useEffect } from "react";
import Script from "next/script";

interface KakaoShareButtonProps {
  title: string;
  description: string;
  kakaoAppKey: string; // From Kakao Developers
}

export default function KakaoShareButton({ title, description, kakaoAppKey }: KakaoShareButtonProps) {
  
  useEffect(() => {
    // Initialize Kakao SDK when the component mounts if not already initialized
    const initKakao = () => {
      if (window.Kakao && !window.Kakao.isInitialized() && kakaoAppKey) {
        window.Kakao.init(kakaoAppKey);
      }
    };
    
    // Attempt initialization in case script loaded fast
    initKakao();
  }, [kakaoAppKey]);

  const handleShare = () => {
    if (!kakaoAppKey) {
      alert("카카오 공유 키가 아직 설정되지 않았습니다.");
      return;
    }

    if (window.Kakao && window.Kakao.isInitialized()) {
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: title,
          description: description,
          imageUrl: 'https://tools.weknews.com/icon-512x512.png', // Replace with a real banner image later
          link: {
            mobileWebUrl: window.location.href,
            webUrl: window.location.href,
          },
        },
        buttons: [
          {
            title: '계산 결과 확인하기',
            link: {
              mobileWebUrl: window.location.href,
              webUrl: window.location.href,
            },
          },
        ],
      });
    } else {
      alert("카카오 SDK가 아직 로드되지 않았습니다. 잠시 후 다시 시도해 주세요.");
    }
  };

  return (
    <>
      <Script 
        src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js" 
        strategy="lazyOnload"
        onLoad={() => {
          if (window.Kakao && !window.Kakao.isInitialized() && kakaoAppKey) {
            window.Kakao.init(kakaoAppKey);
          }
        }}
      />
      <button 
        onClick={handleShare}
        className="flex items-center justify-center gap-2 w-full mt-4 py-3 bg-[#FEE500] hover:bg-[#F4DC00] text-[#000000] opacity-90 font-bold rounded-xl transition-all shadow-sm"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 3C6.47715 3 2 6.58172 2 11C2 13.8213 3.8647 16.3015 6.64335 17.6534L5.61794 21.4011C5.5452 21.6669 5.86445 21.8702 6.08801 21.7136L10.5181 18.614C10.9997 18.6508 11.4939 18.6667 12 18.6667C17.5228 18.6667 22 15.0849 22 11C22 6.58172 17.5228 3 12 3Z" fill="currentColor"/>
        </svg>
        카카오톡으로 공유하기
      </button>
    </>
  );
}

// Add global type definition for Kakao
declare global {
  interface Window {
    Kakao: any;
  }
}
