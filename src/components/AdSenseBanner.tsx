"use client";

import { useEffect, useRef } from "react";

interface AdSenseBannerProps {
  dataAdSlot: string; // The 10-digit ad slot ID from AdSense
  className?: string;
}

export default function AdSenseBanner({ dataAdSlot, className = "" }: AdSenseBannerProps) {
  const adRef = useRef<HTMLModElement>(null);
  const isLoaded = useRef(false);

  useEffect(() => {
    // Prevent pushing the ad multiple times in development/React strict mode
    if (!isLoaded.current && adRef.current) {
      try {
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        (window as any).adsbygoogle.push({});
        isLoaded.current = true;
      } catch (err) {
        console.error("AdSense error", err);
      }
    }
  }, []);

  return (
    <div className={`w-full overflow-hidden flex justify-center items-center bg-slate-50 border border-slate-100 rounded-xl my-4 min-h-[100px] relative ${className}`}>
      {/* Placeholder text for development/when ads are blocked */}
      <span className="absolute text-slate-300 text-xs font-bold tracking-widest uppercase z-0 pointer-events-none">
        Advertisement
      </span>
      
      <ins
        ref={adRef}
        className="adsbygoogle relative z-10"
        style={{ display: "block" }}
        data-ad-client="ca-pub-6635245275061755" // Using the user's specific Publisher ID
        data-ad-slot={dataAdSlot} // This requires the specific Ad Slot ID
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
}
