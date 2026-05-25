import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '2026 부동산 취득세 계산기 | 아파트 다주택자 중과세율 - FinInsight',
  description: '생애최초, 1주택자부터 다주택자까지, 2026년 기준 아파트 등 부동산 매매 시 발생하는 정확한 취등록세와 농특세를 계산합니다.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
