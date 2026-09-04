import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '카드 프로모션 대시보드',
  description: '월별 신규 카드 발급 이벤트 혜택 및 조건 비교 대시보드',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
