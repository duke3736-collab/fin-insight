import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '2026년 주휴수당 계산기 | 최저시급·주급·월급 & 단시간 알바 완벽 산출 - FinInsight',
  description: '2026년 최신 최저임금 및 근로기준법 기준 주휴수당 자동 계산기입니다. 주 15시간 이상 근로 시 발생하는 주휴시간, 주휴수당 금액, 주급/월급 총액 및 주휴수당 포함 실효시급을 실시간으로 산출해 드립니다.',
  keywords: ['주휴수당 계산기', '2026년 주휴수당', '알바 주휴수당', '주휴수당 조건', '주 15시간 주휴수당', '최저시급 주휴수당', '주휴수당 포함 시급', '주급 계산기', '월급 계산기'],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
