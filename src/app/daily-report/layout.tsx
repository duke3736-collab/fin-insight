import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '데일리 금융 리포트 | 매일 아침 필수 경제 뉴스 - FinInsight',
  description: '바쁜 아침, 코다리 부장이 핵심만 요약해주는 실시간 주식, 부동산, 경제 금융 뉴스 리포트를 무료로 확인하세요.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
