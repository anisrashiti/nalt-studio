import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "NALT Studio — Software for what’s next.",
  description:
    "We design and build digital systems for ambitious companies. Strategy / Design / Engineering. Prishtina, Kosovo.",
  icons: { icon: "/brand/nalt-icon.svg", apple: "/brand/apple-touch-icon.png" },
};

export const viewport: Viewport = { themeColor: "#080808" };

// Runs before the first paint. With JavaScript disabled, the complete hero stays visible.
const prepareIntro = `if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) document.documentElement.classList.add('intro-pending');`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: prepareIntro }} /></head>
      <body>{children}</body>
    </html>
  );
}
