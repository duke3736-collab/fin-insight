import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DSR 계산기 | 총부채원리금상환비율 & 스트레스 DSR 3단계 대출 한도 자동 계산 - FinInsight',
  description: '최신 스트레스 DSR 규제(1.5%p 가산금리) 완벽 반영! 연소득, 기존 주택담보대출, 신용대출, 자동차 할부의 연간 원리금을 바탕으로 1금융권(40%), 2금융권(50%) DSR 한도와 추가 대출 가능 금액을 실시간으로 확인해보세요.',
  keywords: ['DSR 계산기', '총부채원리금상환비율', '스트레스 DSR', 'DSR 40%', 'DSR 50%', '대출 한도 계산기', '주택담보대출 DSR', '신용대출 DSR', '영끌 대출한도'],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
