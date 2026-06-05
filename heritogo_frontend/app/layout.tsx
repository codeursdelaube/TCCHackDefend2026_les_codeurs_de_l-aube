import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./_components/Navbar";
import ServiceWorkerRegister from '@/app/_components/ServiceWorkerRegister';


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Heritogo",
  description: "Le guide touristique intelligent du togo",
  manifest: '/manifest.json'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="light"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="theme-color" content="#16a34a"/>
        <link rel="shortcut icon" href="/icons/icon-192x192.png"  />
      
      </head>
      <body className="min-h-full flex flex-col">
        <ServiceWorkerRegister />
        <Navbar/>
        {children}
        </body>
    </html>
  );
}
