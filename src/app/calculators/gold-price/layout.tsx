import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '실시간 금시세 조회 및 금 투자 수익률 계산기 - FinInsight',
  description: '오늘 금값 시세를 확인하고, 과거 구매가 대비 현재 금 투자 수익률을 수수료까지 반영해 계산해 보세요.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
