// 루트 레이아웃 — html/body는 [locale]/layout.tsx에서 렌더링
// 여기서는 globals.css만 임포트
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ALL Review — 전 세계 리뷰 플랫폼",
  description: "GPS 켜는 순간, 전 세계 어디서든 주변 장소 리뷰를 한눈에",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
