import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '주식 수익률 인증샷 메이커 | 예쁜 템플릿 - FinInsight',
  description: '나만의 대박 주식 수익률을 세련되고 예쁜 디자인의 카드 템플릿으로 만들어 커뮤니티나 인스타그램에 자랑해 보세요.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
