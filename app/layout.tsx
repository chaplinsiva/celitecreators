import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import LayoutWrapper from "../components/LayoutWrapper";
import GoogleAnalytics from "../components/GoogleAnalytics";
import AttributionTracker from "../components/AttributionTracker";
import { AppProvider } from "../context/AppContext";
import { LoginModalProvider } from "../context/LoginModalContext";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import SnowEffect from "../components/SnowEffect";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://celitemarket.in'),
  title: {
    default: "Celite Market – Creative Digital Asset Marketplace",
    template: '%s | Celite Market',
  },
  description: "Celite Market is India's premier pay-per-product digital marketplace. Buy and download After Effects templates, sound effects, stock music, 3D models & web templates with lifetime access.",
  keywords: [
    'celite market',
    'celitemarket',
    'celitemarket.in',
    'after effects templates',
    'wedding template after effects',
    'save the date template',
    'save the date after effects',
    'wedding video template',
    'motion graphics templates',
    'sound effects',
    'stock music',
    '3d models',
    'pay per product marketplace',
    'digital creator assets',
  ],
  authors: [{ name: 'Celite Market', url: 'https://celitemarket.in' }],
  creator: 'Celite Market',
  publisher: 'Celite Market',
  applicationName: 'Celite Market',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://celitemarket.in',
    siteName: 'Celite Market',
    title: "Celite Market – Creative Digital Asset Marketplace",
    description: "Download premium After Effects templates, wedding save the date videos, sound effects, stock music & 3D models with pay-per-product lifetime access.",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Celite Market - Creative Digital Assets Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Celite Market – Creative Digital Asset Marketplace",
    description: "Download premium After Effects templates, wedding save the date videos, sound effects & 3D models on Celite Market.",
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || "mu0b1r8cVV-lONA0H4XZMax5pzpvzy1plDlTONFX4w4",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-WQE6FX8VET';

  return (
    <html lang="en" className="dark bg-black text-white" style={{ backgroundColor: '#000000', color: '#ffffff' }} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon-48x48.png" sizes="48x48" type="image/png" />
        <link rel="icon" href="/favicon-96x96.png" sizes="96x96" type="image/png" />
        <link rel="icon" href="/icon-192.png" sizes="192x192" type="image/png" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />

        {/* Structured Data for Site Identity and Sitelinks */}
        <Script
          id="schema-sitelinks"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Celite Market",
              "alternateName": [
                "CeliteMarket",
                "CeliteMarket.in",
                "Celite Market India",
                "Celite",
                "celite market"
              ],
              "url": "https://celitemarket.in",
              "description": "Celite Market is India's premier pay-per-product digital marketplace. Buy and download After Effects templates, sound effects, stock music, 3D models & web templates with lifetime access.",
              "potentialAction": [
                {
                  "@type": "SearchAction",
                  "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": "https://celitemarket.in/video-templates?search={search_term_string}"
                  },
                  "query-input": "required name=search_term_string"
                }
              ],
              "publisher": {
                "@type": "Organization",
                "name": "Celite Market",
                "url": "https://celitemarket.in",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://celitemarket.in/logo.png"
                }
              }
            })
          }}
        />

        {/* Organization Schema */}
        <Script
          id="schema-organization"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Celite Market",
              "legalName": "Celite Market",
              "alternateName": "CeliteMarket",
              "url": "https://celitemarket.in",
              "logo": "https://celitemarket.in/logo.png",
              "description": "India's premier pay-per-product digital assets marketplace for After Effects templates, 3D models, sound effects, stock music, and web templates.",
              "sameAs": [
                "https://twitter.com/celite",
                "https://facebook.com/celite",
                "https://instagram.com/celitemarket.in"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "url": "https://celitemarket.in/contact"
              },
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Creative Digital Assets",
                "itemListElement": [
                  {
                    "@type": "OfferCatalog",
                    "name": "After Effects Video Templates",
                    "itemListElement": [
                      { "@type": "Offer", "name": "Save the Date After Effects Templates", "url": "https://celitemarket.in/video-templates/after-effects/save-date" },
                      { "@type": "Offer", "name": "Wedding Invitation Video Templates", "url": "https://celitemarket.in/video-templates" },
                      { "@type": "Offer", "name": "Cinematic Movie Title Templates", "url": "https://celitemarket.in/video-templates" }
                    ]
                  },
                  {
                    "@type": "OfferCatalog",
                    "name": "Audio & 3D Assets",
                    "itemListElement": [
                      { "@type": "Offer", "name": "Royalty-Free Stock Music", "url": "https://celitemarket.in/stock-musics" },
                      { "@type": "Offer", "name": "Sound Effects Library", "url": "https://celitemarket.in/sound-effects" },
                      { "@type": "Offer", "name": "3D Models & Game Assets", "url": "https://celitemarket.in/3d-models" }
                    ]
                  }
                ]
              }
            })
          }}
        />

        {/* SiteNavigationElement for Sitelinks */}
        <Script
          id="schema-navigation"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "SiteNavigationElement",
                  "name": "After Effects Video Templates",
                  "url": "https://celitemarket.in/video-templates"
                },
                {
                  "@type": "SiteNavigationElement",
                  "name": "Save the Date Video Templates",
                  "url": "https://celitemarket.in/save-date"
                },
                {
                  "@type": "SiteNavigationElement",
                  "name": "Royalty-Free Stock Music",
                  "url": "https://celitemarket.in/stock-musics"
                },
                {
                  "@type": "SiteNavigationElement",
                  "name": "Sound Effects (SFX)",
                  "url": "https://celitemarket.in/sound-effects"
                },
                {
                  "@type": "SiteNavigationElement",
                  "name": "3D Models",
                  "url": "https://celitemarket.in/3d-models"
                },
                {
                  "@type": "SiteNavigationElement",
                  "name": "Website Templates",
                  "url": "https://celitemarket.in/web-templates"
                },
                {
                  "@type": "SiteNavigationElement",
                  "name": "Start Selling as Creator",
                  "url": "https://celitemarket.in/start-selling"
                }
              ]
            })
          }}
        />
      </head>
      <body className={`${inter.variable} antialiased bg-black text-white min-h-screen group/body`} style={{ fontStyle: 'normal', fontSynthesis: 'none', backgroundColor: '#000000', color: '#ffffff' }}>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5327132249014590"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
        <AppProvider>
          <LoginModalProvider>
            <Suspense fallback={null}>
              <AttributionTracker />
            </Suspense>
            <GoogleAnalytics />
            <SpeedInsights />
            <Analytics />
            <SnowEffect />
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </LoginModalProvider>
        </AppProvider>
      </body>
    </html>
  );
}
