import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import Navbar from "@/app/_components/Navbar";
import ServiceWorkerRegister from '@/app/_components/ServiceWorkerRegister';
import OnboardingTooltip from '@/app/_components/OnboardingTooltip';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { cookies } from 'next/headers'; // Important pour lire les cookies
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import ChatBot from "../_components/ChatBot";

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

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();

  // 1. Lire le cookie du thÃ¨me cÃ´tÃ© serveur
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get('heritogo_theme')?.value;
  
  // 2. DÃ©terminer la classe initiale (par dÃ©faut 'light' si aucun cookie)
  const isDark = themeCookie === 'dark';

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      style={{ fontFamily: 'var(--font-body)' }}
      className={isDark ? 'dark' : ''} // Le serveur injecte DIRECTEMENT la bonne classe ici !
    >
      <head>
        {/* Ce script sert uniquement au TOUT PREMIER chargement Ã  vie du site (si pas de cookie) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('heritogo_theme');
                  if (!saved) {
                    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    var theme = prefersDark ? 'dark' : 'light';
                    if (theme === 'dark') document.documentElement.classList.add('dark');
                    document.cookie = "heritogo_theme=" + theme + "; path=/; max-age=31536000";
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        <meta name="theme-color" content="#16a34a"/>
        <link rel="shortcut icon" href="/icons/icon-192x192.png" />
      </head>
      
      <body className={`min-h-full flex flex-col pb-20 bg-base-100 ${geistSans.variable} ${geistMono.variable} h-full antialiased`} >
        <ThemeProvider>
          <NextIntlClientProvider messages={messages}>
            <ServiceWorkerRegister />
            <Navbar />
            <OnboardingTooltip />
            {children}
            <footer>
              <ChatBot />
            </footer>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}


