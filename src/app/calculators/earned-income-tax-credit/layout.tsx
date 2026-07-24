import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '2026 근로장려금 & 자녀장려금 모의계산기 - FinInsight',
  description: '2026년 국세청 최신 개정법 완벽 반영! 가구 유형(단독/홑벌이/맞벌이), 총소득 및 재산 요건(1.7억/2.4억), 부양자녀 수에 따른 근로장려금과 자녀장려금 예상 지급액을 1초 만에 확인하세요.',
  keywords: ['근로장려금 계산기', '2026 근로장려금', '자녀장려금 계산기', '근로장려금 자격조건', '근로장려금 지급일', '근로장려금 신청자격', '근로장려금 재산요건', '국세청 근로장려금'],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
