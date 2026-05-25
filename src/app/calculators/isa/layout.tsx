import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '2026 중개형 ISA 스마트 가이드 | 비과세 절세 혜택 총정리 - FinInsight',
  description: '2026년 개편되는 중개형 ISA 계좌의 비과세 혜택, 의무가입기간, 만기일 설정 꿀팁을 한눈에 정리했습니다.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
