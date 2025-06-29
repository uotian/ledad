import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/containers/header";
import { ThemeProvider } from "@/components/theme-provider";
import { initializeDefaultRoom } from "@/lib/storage";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HooTalk",
  description: "AI-powered multilingual chat application",
};

// クライアントサイドでのみ実行される初期化関数
if (typeof window !== "undefined") {
  initializeDefaultRoom();
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white/30 dark:bg-black/80`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="overflow-y-auto">
            <Header />
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
