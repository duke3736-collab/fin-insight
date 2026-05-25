import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '2026 여름 물놀이 거지맵 | 가성비 계곡, 수영장, 무료 물놀이터 찾기 - FinInsight',
  description: '공짜로 즐기는 동네 바닥분수부터 가성비 최고 공공 수영장, 취사가능 계곡까지! 여름 피서를 가장 알뜰하게 보낼 수 있는 가성비 물놀이 지도를 확인하세요.',
  keywords: ['물놀이 거지맵', '가성비 물놀이', '무료 물놀이터', '취사가능 계곡', '여름 수영장', '해수욕장 개장일'],
  openGraph: {
    title: '🏝️ 2026 전국 여름 물놀이 거지맵',
    description: '공짜 동네 물놀이터부터 5천원 이하 가성비 수영장, 취사 가능한 계곡까지 지도로 한눈에!',
    type: 'website',
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
