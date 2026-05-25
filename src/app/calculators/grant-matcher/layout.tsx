import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '내 동네 숨은 정부 지원금 1분만에 찾기 - FinInsight',
  description: '청년, 육아, 소상공인 등 내 조건에 꼭 맞는 지역별 숨은 정부 지원금 혜택을 1분만에 빠르게 조회해 보세요.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
