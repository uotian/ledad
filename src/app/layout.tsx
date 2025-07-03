import type { Metadata } from "next";
import { Geist, Geist_Mono, Lexend } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ledad",
  description: "AI-powered multilingual chat application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${lexend.variable} antialiased bg-white/30 dark:bg-black/80`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div>{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
