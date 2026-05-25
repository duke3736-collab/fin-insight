import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'D-Day 1억 모으기 목표 달성기 시각화 - FinInsight',
  description: '내집마련, 1억 모으기 등 재무 목표까지 남은 금액과 진척도를 시각적인 게이지로 한눈에 확인하고 동기부여를 얻어보세요.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
