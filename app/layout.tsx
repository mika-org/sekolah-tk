import type { Metadata } from "next";
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
    url: "https://tkistiqamah.sch.id",
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
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={poppins.variable}>
      <body
        className="font-sans antialiased"
      >
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
