import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '증여세 계산기 | 2026년 최신 세율 및 공제 한도 반영 - FinInsight',
  description: '2026년 최신 개정 증여세율 및 배우자(6억 원), 직계존비속(5천만 원/2억 원) 등 수증자 관계별 증여재산공제 한도액을 완벽 반영한 증여세 계산기입니다. 면제 한도와 세율을 자동으로 적용해 예상 증여세를 실시간으로 확인해보세요.',
  keywords: ['증여세 계산기', '2026년 증여세', '증여세율', '증여재산공제', '면제한도', '부부증여', '자녀증여', '증여세 면제', '절세 계산기'],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
