import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '재산세 계산기 | 주택·건물·토지 지방세 세부담상한 완벽 산출 - FinInsight',
  description: '최신 지방세법 기준 주택, 건물, 토지의 공시가격(공시가액)에 따른 재산세, 도시지역분, 지방교육세 자동 계산기입니다. 1세대 1주택자 특례 세율(공정시장가액비율 43~45%), 세부담상한선, 7월/9월 분할 납부 일정까지 한번에 확인하세요.',
  keywords: ['재산세 계산기', '주택 재산세', '토지 재산세', '건물 재산세', '공공공시가격', '공정시장가액비율', '1주택자 특례세율', '도시지역분', '지방교육세', '세부담상한'],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
