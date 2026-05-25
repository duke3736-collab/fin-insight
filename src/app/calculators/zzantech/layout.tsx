import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '짠테크 복리 수익 계산기 | 커피값 절약 효과 - FinInsight',
  description: '매일 아끼는 커피값, 담배값 등 소액 짠테크 금액이 10년 뒤 복리를 만나 얼마나 큰 목돈이 되는지 확인해 보세요.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
