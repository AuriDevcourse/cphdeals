import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { QueryProvider } from "@/providers/QueryProvider";
import { Agentation } from "agentation";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dealround — Best Deals in Copenhagen",
  description:
    "Find the best deals on activities, food & entertainment in Copenhagen. Updated daily from 8+ Danish deal sites.",
  keywords: [
    "Copenhagen deals",
    "København tilbud",
    "food deals Copenhagen",
    "activity deals",
    "restaurant deals",
    "Dealround",
  ],
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Dealround — Best Deals in Copenhagen",
    description:
      "Find the best deals on activities, food & entertainment in Copenhagen. Updated daily from 8+ Danish deal sites.",
    type: "website",
    locale: "en_DK",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Dealround",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dealround — Best Deals in Copenhagen",
    description:
      "Find the best deals on activities, food & entertainment in Copenhagen.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme:dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}})()`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} font-sans antialiased bg-zinc-50 dark:bg-zinc-950`}
      >
        <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-64 bg-gradient-to-b from-emerald-500/15 via-emerald-500/5 to-transparent dark:from-emerald-500/10 dark:via-emerald-500/3" />
        <QueryProvider>{children}</QueryProvider>
        {process.env.NODE_ENV === "development" && <Agentation />}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
