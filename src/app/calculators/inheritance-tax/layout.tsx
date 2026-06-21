import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '상속세 계산기 | 2026년 최신 세율 및 공제 한도 반영 - FinInsight',
  description: '2026년 최신 개정 상속세율 및 일괄공제(5억 원), 배우자 상속공제(최소 5억 원), 금융재산 상속공제를 완벽 반영한 상속세 계산기입니다. 공제 한도와 세율을 자동으로 적용해 예상 상속세를 실시간으로 확인해보세요.',
  keywords: ['상속세 계산기', '2026년 상속세', '상속세율', '일괄공제', '배우자공제', '배우자상속공제', '금융재산상속공제', '상속세 면제', '절세 계산기'],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
