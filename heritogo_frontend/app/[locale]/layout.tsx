import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import Navbar from "@/app/_components/Navbar";
import ServiceWorkerRegister from '@/app/_components/ServiceWorkerRegister';
import OnboardingTooltip from '@/app/_components/OnboardingTooltip';
import ThemeInitializer from '@/app/_components/ThemeInitializer';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { cookies } from 'next/headers';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';

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

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params
}: LayoutProps) {
  const { locale } = await params;

  // Validate locale
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Read theme from cookies
  const cookieStore = await cookies();
  const theme = cookieStore.get('theme')?.value || 'light';

  // Load translations
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      data-theme={theme}
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="theme-color" content="#16a34a"/>
        <link rel="shortcut icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="min-h-full flex flex-col pb-20 bg-base-100">
        <ThemeInitializer />
        <NextIntlClientProvider messages={messages}>
          <ServiceWorkerRegister />
          <Navbar />
          <OnboardingTooltip />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
