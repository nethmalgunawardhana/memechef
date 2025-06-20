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
  title: "MemeChef - AI-Powered Recipe Creator & Cooking Game",
  description: "Transform random ingredients into amazing recipes with AI! Upload photos, get creative recipes, and enjoy a gamified cooking experience with achievements, combos, and chaos mode.",
  keywords: [
    "AI recipe generator",
    "cooking game",
    "food AI",
    "recipe creator",
    "ingredient analyzer",
    "cooking app",
    "food photography",
    "gamified cooking",
    "recipe sharing",
    "culinary AI"
  ],
  authors: [{ name: "MemeChef Team" }],
  creator: "MemeChef",
  publisher: "MemeChef",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://memechef.vercel.app/",
    siteName: "MemeChef",
    title: "MemeChef - AI-Powered Recipe Creator & Cooking Game",
    description: "Transform random ingredients into amazing recipes with AI! Upload photos, get creative recipes, and enjoy a gamified cooking experience.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "MemeChef - AI Recipe Creator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MemeChef - AI-Powered Recipe Creator & Cooking Game",
    description: "Transform random ingredients into amazing recipes with AI! Upload photos, get creative recipes, and enjoy a gamified cooking experience.",
    images: ["/twitter-image.jpg"],
    creator: "@memechef",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
  category: "food",
  classification: "Gaming, Food & Cooking, AI Tools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" prefix="og: https://ogp.me/ns#">
      <head>
        <link rel="canonical" href="https://memechef.vercel.app/" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#ff6b35" />
        <meta name="msapplication-TileColor" content="#ff6b35" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "MemeChef",
              "description": "AI-powered recipe creator and cooking game that transforms ingredients into amazing recipes",
              "url": "https://memechef.vercel.app/",
              "applicationCategory": "GameApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "author": {
                "@type": "Organization",
                "name": "MemeChef Team"
              },
              "keywords": "AI recipe generator, cooking game, food AI, recipe creator, ingredient analyzer",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "reviewCount": "1250"
              }
            })
          }}
        />
        {children}
      </body>
    </html>
  );
}
