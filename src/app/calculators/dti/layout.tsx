import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DTI 계산기 | 총부채상환비율 & 신규 주담대 대출 한도 자동 산출 - FinInsight',
  description: '최신 금융 규제 기준 DTI(총부채상환비율) 계산기입니다. 연소득, 신규/기존 주택담보대출 원리금, 기타대출 이자 상환액을 바탕으로 규제지역(50%), 비규제지역(60%) DTI 비율과 최대 가능 대출 금액을 실시간으로 확인해보세요.',
  keywords: ['DTI 계산기', '총부채상환비율', 'DTI 50%', 'DTI 60%', '주택담보대출 한도', 'DTI DSR 차이', '신주택담보대출', '부동산 대출 계산기'],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
