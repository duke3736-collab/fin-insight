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
      className="mt-6 flex items-center justify-between p-4 bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded-xl transition-all group cursor-pointer"
    >
      <div className="flex flex-col">
        <span className="text-xs font-black text-sky-600 mb-1 tracking-wide">블로그에서 자세히 알아보기</span>
        <span className="text-sm md:text-base font-bold text-slate-800 group-hover:text-sky-700 transition-colors line-clamp-1">{title}</span>
      </div>
      <div className="shrink-0 ml-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:shadow group-hover:scale-110 transition-transform text-sky-500">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
        </svg>
      </div>
    </a>
  );
}
