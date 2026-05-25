import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '예금 적금 최고 금리 비교 계산기 | 파킹통장 실시간 금리 - FinInsight',
  description: '2026년 1금융권, 저축은행 정기예금 및 파킹통장의 실시간 최고 금리를 비교하고 예상 이자를 계산해 보세요.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
