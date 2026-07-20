import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LTV 계산기 | 규제지역·생애최초·방공제(MCI/MCG) 주담대 한도 자동 계산 - FinInsight',
  description: '최신 부동산 대출 규제 기준 LTV(주택담보인정비율) 계산기입니다. 조정대상지역/강남3구/용산 등 규제지역(50%), 비규제지역(70%), 생애최초(80%), 방공제 차감 여부 및 선순위 보증금을 반영한 실시간 가능 대출 한도를 산출해 드립니다.',
  keywords: ['LTV 계산기', '주택담보인정비율', '생애최초 LTV 80%', '방공제 계산', 'MCI MCG 보험', '규제지역 LTV', '주택담보대출 한도', '영끌 대출 계산'],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
