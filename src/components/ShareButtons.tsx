"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

interface ShareButtonsProps {
  title: string;
  description: string;
  kakaoAppKey: string;
  imageUrl?: string;
  linkUrl?: string;
}

export default function ShareButtons({ title, description, kakaoAppKey, imageUrl, linkUrl }: ShareButtonsProps) {
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    setCurrentUrl(linkUrl || window.location.href);
    
    // Initialize Kakao
    const initKakao = () => {
      if (window.Kakao && !window.Kakao.isInitialized() && kakaoAppKey) {
        window.Kakao.init(kakaoAppKey);
      }
    };
    initKakao();
  }, [kakaoAppKey, linkUrl]);

  const urlToShare = currentUrl;
  const encodedUrl = encodeURIComponent(urlToShare);
  const encodedTitle = encodeURIComponent(title);

  // Handlers
  const handleKakaoShare = () => {
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
          imageUrl: imageUrl || 'https://tools.weknews.com/icon-512x512.png',
          link: {
            mobileWebUrl: urlToShare,
            webUrl: urlToShare,
          },
        },
        buttons: [
          {
            title: '자세히 보기',
            link: {
              mobileWebUrl: urlToShare,
              webUrl: urlToShare,
            },
          },
        ],
      });
    } else {
      alert("카카오 SDK가 아직 로드되지 않았습니다. 잠시 후 다시 시도해 주세요.");
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(urlToShare);
      alert("링크가 복사되었습니다!");
    } catch (err) {
      alert("링크 복사에 실패했습니다.");
    }
  };

  return (
    <div className="w-full">
      <Script 
        src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js" 
        strategy="lazyOnload"
        onLoad={() => {
          if (window.Kakao && !window.Kakao.isInitialized() && kakaoAppKey) {
            window.Kakao.init(kakaoAppKey);
          }
        }}
      />
      
      <div className="flex flex-wrap items-center justify-center gap-3">
        {/* Facebook */}
        <a 
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-lg bg-[#1877F2] text-white flex items-center justify-center hover:opacity-80 transition-opacity"
          title="페이스북에 공유"
        >
          <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/></svg>
        </a>

        {/* X (Twitter) */}
        <a 
          href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center hover:opacity-80 transition-opacity"
          title="X에 공유"
        >
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        </a>

        {/* Telegram */}
        <a 
          href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-lg bg-[#0088cc] text-white flex items-center justify-center hover:opacity-80 transition-opacity"
          title="텔레그램에 공유"
        >
          <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.94z"/></svg>
        </a>

        {/* Naver Band */}
        <a 
          href={`https://band.us/plugin/share?body=${encodedTitle}%0A${encodedUrl}&route=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-lg bg-[#00c73c] text-white flex items-center justify-center hover:opacity-80 transition-opacity font-bold text-xs"
          title="네이버 밴드에 공유"
        >
          BAND
        </a>

        {/* Naver Blog */}
        <a 
          href={`https://share.naver.com/web/shareView.nhn?url=${encodedUrl}&title=${encodedTitle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-lg bg-[#03C75A] text-white flex items-center justify-center hover:opacity-80 transition-opacity font-black text-xl"
          title="네이버 블로그에 공유"
        >
          N
        </a>

        {/* Kakao */}
        <button 
          onClick={handleKakaoShare}
          className="w-10 h-10 rounded-lg bg-[#FEE500] text-[#000000] flex items-center justify-center hover:opacity-80 transition-opacity"
          title="카카오톡에 공유"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 3C6.47715 3 2 6.58172 2 11C2 13.8213 3.8647 16.3015 6.64335 17.6534L5.61794 21.4011C5.5452 21.6669 5.86445 21.8702 6.08801 21.7136L10.5181 18.614C10.9997 18.6508 11.4939 18.6667 12 18.6667C17.5228 18.6667 22 15.0849 22 11C22 6.58172 17.5228 3 12 3Z"/>
          </svg>
        </button>

        {/* Copy Link */}
        <button 
          onClick={handleCopyLink}
          className="w-10 h-10 rounded-lg bg-slate-500 text-white flex items-center justify-center hover:opacity-80 transition-opacity"
          title="링크 복사"
        >
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
        </button>
      </div>
    </div>
  );
}

// Add global type definition for Kakao
declare global {
  interface Window {
    Kakao: any;
  }
}
