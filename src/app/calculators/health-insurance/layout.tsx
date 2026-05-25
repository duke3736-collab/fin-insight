import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '2026 직장인/지역가입자 건강보험료 계산기 - FinInsight',
  description: '2026년 최신 요율(7.19%)을 적용하여 재산, 소득, 자동차 기준 지역가입자 및 직장인 건보료를 정확히 산출합니다.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
