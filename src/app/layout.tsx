import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "SPIDER//VERSE — Vijayasarathy B. | Developer Portfolio",
  description:
    "The digital portfolio of Vijayasarathy B, exploring AI, data science, and intelligent digital experiences.",
  keywords: [
    "developer",
    "portfolio",
    "Vijayasarathy B",
    "AI",
    "data science",
  ],
  authors: [{ name: "Vijayasarathy B" }],
  openGraph: {
    title: "SPIDER//VERSE — Vijayasarathy B.",
    description: "AI, data science, and intelligent digital experiences.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--sv-black)] text-[var(--sv-white)]">
        {children}
      </body>
    </html>
  );
}
