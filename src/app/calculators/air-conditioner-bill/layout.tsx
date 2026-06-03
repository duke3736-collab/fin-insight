import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '에어컨 전기세 계산기 | 인버터/정속형 누진세 전기요금 - FinInsight',
  description: '2026년 최신 한국전력 주택용 저압/고압 요금표 반영. 에어컨 종류(벽걸이, 스탠드, 시스템)별 사용시간에 따른 월 추가 전기요금을 누진세까지 적용해 계산해보세요.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
