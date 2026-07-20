import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '연말정산 신용카드·체크카드·현금영수증 소득공제 계산기 - FinInsight',
  description: '최신 연말정산 개정 세법 반영! 총급여액의 25% 문턱 조건, 신용카드(15%), 체크카드/현금영수증(30%), 대중교통(80%), 전통시장(40%), 도서공연 소득공제액 및 세금 환급 절세 금액을 실시간으로 산출해 드립니다.',
  keywords: ['연말정산 카드 소득공제 계산기', '신용카드 소득공제', '체크카드 현금영수증 소득공제', '총급여 25%', '연말정산 절세 전략', '대중교통 전통시장 소득공제', '연말정산 환급금 계산'],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
