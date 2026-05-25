import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '국내 해외 주식 증권사 수수료 비교 계산기 - FinInsight',
  description: '키움, 토스, 미래에셋 등 주요 증권사의 주식 매매 수수료 및 환전 우대율을 비교하여 가장 유리한 증권사를 찾아보세요.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
