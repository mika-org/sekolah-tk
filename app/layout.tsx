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
  title: "KB & TK Istiqamah Bandung",
  description: "Website Resmi Penerimaan Peserta Didik Baru (PPDB) KB & TK Istiqamah Bandung",
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
