import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Canary's Journal",
  description: "守在门前的人，也有自己的故事。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
