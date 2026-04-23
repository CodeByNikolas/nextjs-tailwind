import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Web3Providers } from "@/app/components/web3-providers";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TUM Blockchain Club",
  description: "Animated Web3 demo with Supabase comments and ERC-20 integration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Web3Providers>{children}</Web3Providers>
      </body>
    </html>
  );
}
