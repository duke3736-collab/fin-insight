import React from 'react';

interface WordPressLinkProps {
  title: string;
  url: string;
}

export default function WordPressLink({ title, url }: WordPressLinkProps) {
  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="mt-4 flex items-center justify-between p-5 md:p-6 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer border border-indigo-400/50"
    >
      <div className="flex flex-col gap-2 pr-4">
        <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs font-black rounded-lg w-fit tracking-wide shadow-sm backdrop-blur-sm">
          💡 실전 인사이트 리포트
        </span>
        <span className="text-base md:text-lg font-extrabold text-white leading-snug line-clamp-2 group-hover:text-blue-50 transition-colors">
          {title}
        </span>
      </div>
      <div className="shrink-0 w-12 h-12 bg-white/10 border border-white/20 rounded-full flex items-center justify-center shadow-sm group-hover:bg-white group-hover:text-indigo-600 text-white transition-all duration-300">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6 transform group-hover:translate-x-1 transition-transform">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
        </svg>
      </div>
    </a>
  );
}
