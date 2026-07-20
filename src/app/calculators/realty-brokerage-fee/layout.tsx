import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '부동산 중개수수료 계산기 | 매매·전세·월세 복비 상한요율 & 부가세 완벽 계산 - FinInsight',
  description: '최신 개정 개업공인중개사 중개보수 요율표 완벽 반영! 아파트·주택 매매, 전세, 월세(환산보증금 자동계산), 주거용 오피스텔, 상가, 토지의 법정 상한 중개수수료(복비) 및 부가가치세(10%)를 실시간으로 확인해보세요.',
  keywords: ['부동산 중개수수료 계산기', '복비 계산기', '중개보수 요율', '매매 중개수수료', '전세 중개수수료', '월세 환산보증금', '오피스텔 중개수수료', '상가 중개보수', '부동산 복비 부가세'],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
