import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '근저당 설정비용 계산기 | 대출 채권최고액·인지세·국민주택채권 매각 할인비용 - FinInsight',
  description: '주택담보대출 실행 시 발생하는 근저당권 설정비용 자동 계산기입니다. 채권최고액(120%), 등록면허세(0.2%), 지방교육세(0.04%), 인지세(50% 부담), 국민주택채권 즉시매각 손실금 및 금융기관/차주별 부담 비용을 실시간으로 산출해 드립니다.',
  keywords: ['근저당 설정비용 계산기', '근저당권 설정비용', '대출 인지세 50%', '국민주택채권 할인율', '채권최고액 120%', '주택담보대출 비용', '근저당 말소비용', '대출 부대비용'],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
