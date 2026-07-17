import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '기초생활수급자 소득인정액 모의계산기 - FinInsight',
  description: '2026년 최신 기준 중위소득 및 자산 공제 기준 반영. 가구원 수, 소득(근로·사업·기타), 재산(주거용·일반·금융), 자동차 및 부채 정보를 입력하여 소득인정액과 수급 가능 급여를 모의 계산해보세요.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
