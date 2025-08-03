import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "Callus - Forge your fitness, mark by mark",
  description:
    "Track anywhere. Own your data. No paywalls, no gimmicks — just a clean, addictively smooth experience that gets you hooked on showing up.",
  keywords:
    "fitness, workout tracker, strength training, personal training, exercise app, forge fitness",
  authors: [{ name: "Ramki Pitchala" }],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Callus - Forge your fitness, mark by mark",
    description:
      "Track anywhere. Own your data. No paywalls, no gimmicks — just a clean, addictively smooth experience that gets you hooked on showing up.",
    type: "website",
    images: [
      {
        url: "https://callus.fit/og.png",
        width: 1200,
        height: 630,
        alt: "Callus - Fitness tracking app with barbell icon",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
