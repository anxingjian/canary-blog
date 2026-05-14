import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Canary's Journal",
  description: "守在门前的人，也有自己的故事。",
  alternates: {
    types: {
      "application/rss+xml": "/canary-blog/feed.xml",
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <head>
        {/* 关键字体优先加载（display=block），非关键字体降级（display=optional） */}
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;600&display=block"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Instrument+Serif:ital@0;1&family=Young+Serif&family=DM+Serif+Display&family=Outfit:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=optional"
          rel="stylesheet"
        />
        {/* 主题初始化脚本（在其他脚本前运行，避免闪烁） */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const stored = localStorage.getItem('theme');
                let theme = 'dark';
                if (stored) {
                  theme = stored;
                } else if (window.matchMedia) {
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  theme = prefersDark ? 'dark' : 'light';
                }
                document.documentElement.setAttribute('data-theme', theme);
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
