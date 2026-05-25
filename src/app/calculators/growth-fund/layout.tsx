import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '국민성장펀드 수익률 및 손실방어 계산기 - FinInsight',
  description: '정부 지원 국민성장펀드의 예상 수익금과 원금 손실 방어 효과를 직관적으로 시뮬레이션 할 수 있습니다.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
