import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { QueryProvider } from "@/providers/QueryProvider";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CPH Deals — Best Deals in Copenhagen",
  description:
    "Find the best deals on activities, food & entertainment in Copenhagen. Updated daily from 8+ Danish deal sites.",
  keywords: [
    "Copenhagen deals",
    "København tilbud",
    "food deals Copenhagen",
    "activity deals",
    "restaurant deals",
    "CPH deals",
  ],
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "CPH Deals — Best Deals in Copenhagen",
    description:
      "Find the best deals on activities, food & entertainment in Copenhagen. Updated daily from 8+ Danish deal sites.",
    type: "website",
    locale: "en_DK",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CPH Deals",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CPH Deals — Best Deals in Copenhagen",
    description:
      "Find the best deals on activities, food & entertainment in Copenhagen.",
    images: ["/og-image.png"],
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
        <QueryProvider>{children}</QueryProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
