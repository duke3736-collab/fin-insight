import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '2026년 연봉 실수령액 계산기 | 4대보험 소득세 완벽 반영 - FinInsight',
  description: '2026년 최신 4대보험 요율 및 소득세를 반영한 직장인 연봉 실수령액을 1원 단위까지 정확하게 계산해 드립니다.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
