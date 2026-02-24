import type { Metadata } from "next";
import { Sarabun } from "next/font/google";
import "./globals.css";
import MouseGuard from "./components/MouseGuard";

const sarabun = Sarabun({
  weight: ['300', '400', '500', '700'],
  subsets: ["thai", "latin"],
  variable: "--font-sarabun",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "ระบบเลือกตั้ง สาขาวิทยาการคอมพิวเตอร์",
  description: "ระบบเลือกตั้ง สาขาวิทยาการคอมพิวเตอร์ ปี 2569",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${sarabun.variable} antialiased bg-slate-50 text-slate-900`}
      >
        <MouseGuard />
        {children}
      </body>
    </html>
  );
}
