import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Web3Provider } from "@/components/providers/Web3Provider";
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
  title: "Sentinel Treasury | Enterprise AI Treasury with Terminal 3",
  description:
    "Autonomous enterprise treasury powered by GPT-4.1 multi-agent pipeline and Terminal 3 verifiable identity, delegation, and audit. Live on Ethereum Sepolia.",
  keywords: ["Terminal 3", "AI agents", "treasury", "enterprise", "Sepolia", "delegation"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark h-full`}>
      <body className="min-h-full antialiased">
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
