import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '실업급여 계산기 및 구직급여 수급일수 조회 - FinInsight',
  description: '2026년 최신 최저임금(10,320원) 반영 실업급여(구직급여) 모의계산기. 나이, 고용보험 가입기간, 근로시간 및 평균 임금에 따른 예상 수급액과 지급 일수를 즉시 계산해보세요.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
