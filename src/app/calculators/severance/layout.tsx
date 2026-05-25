import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '퇴직금 계산기 및 IRP 절세 세금 비교 - FinInsight',
  description: '예상 퇴직금 산정 및 IRP(개인형 퇴직연금) 계좌 이전 시 절세 혜택과 퇴직소득세를 한눈에 비교해 보세요.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
