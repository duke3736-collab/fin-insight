import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '아파트 부동산 투자 수익률 계산기 | 갭투자 취등록세 계산 - FinInsight',
  description: '레버리지(대출) 및 전세를 활용한 갭투자 시 아파트의 실제 투자 수익률(ROI)과 취등록세를 정확하게 계산해 줍니다.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
