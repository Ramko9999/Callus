import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

// UI chrome (toolbar, buttons) and slide copy both use the same sans face —
// Callus is a workout tracker, not a reading app, so there's no serif reader font.
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "Callus App Store Screenshots",
  description: "Screenshot generator for Callus",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${dmSans.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
