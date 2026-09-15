import type { Metadata } from "next";
import Script from "next/script";
import { Poppins } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "KB & TK Istiqamah Bandung | Bermain Kreatif, Berakhlak & Islami",
    template: "%s | KB & TK Istiqamah Bandung"
  },
  description: "Website Resmi KB & TK Istiqamah Bandung. Mengembangkan potensi buah hati melalui bermain kreatif, pengenalan akhlak mulia sejak dini, dan kurikulum Islami terarah. Informasi pendaftaran PPDB online.",
  keywords: [
    "KB Istiqamah Bandung",
    "TK Istiqamah Bandung",
    "Sekolah TK Bandung",
    "Pendaftaran PPDB TK",
    "PAUD Islami Bandung",
    "Bermain Kreatif Anak",
    "Kurikulum Tilawati Anak"
  ],
  authors: [{ name: "KB & TK Istiqamah Bandung" }],
  creator: "KB & TK Istiqamah Bandung",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://tkistiqamah.com",
    title: "KB & TK Istiqamah Bandung - Bermain Kreatif, Berakhlak & Islami",
    description: "Website Resmi KB & TK Istiqamah Bandung. Mengembangkan potensi buah hati melalui bermain kreatif, pengenalan akhlak mulia sejak dini, dan kurikulum Islami terarah.",
    siteName: "KB & TK Istiqamah Bandung",
    images: [
      {
        url: "/images/Cover.png",
        width: 1200,
        height: 630,
        alt: "KB & TK Istiqamah Bandung Banner"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "KB & TK Istiqamah Bandung",
    description: "Website Resmi KB & TK Istiqamah Bandung. Informasi pendaftaran PPDB online.",
    images: ["/images/Cover.png"]
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={poppins.variable} suppressHydrationWarning>
      <body
        className="font-sans antialiased"
        suppressHydrationWarning
      >
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-2JZHXDWJ8H"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-2JZHXDWJ8H');
          `}
        </Script>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
