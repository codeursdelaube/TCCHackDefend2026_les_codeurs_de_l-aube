import type { Metadata } from "next";
import Script from "next/script";
import "@/app/globals.css";
import Navbar from "@/app/_components/Navbar";
import ServiceWorkerRegister from '@/app/_components/ServiceWorkerRegister';
import OnboardingTooltip from '@/app/_components/OnboardingTooltip';
import CookieConsentBanner from '@/app/_components/CookieConsentBanner';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { cookies } from 'next/headers';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import ChatBot from "../_components/ChatBot";

export const metadata: Metadata = {
  title: "Heritogo",
  description: "Le guide touristique intelligent du togo",
  manifest: '/manifest.json'
};

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();

  // Lire le cookie thème côté serveur
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get('heritogo_theme')?.value;
  const isDark = themeCookie === 'dark';

  return (
    // suppressHydrationWarning sur html — évite le mismatch className dark/light
    // car le script inline peut modifier la classe AVANT que React hydrate
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      style={{ fontFamily: 'var(--font-body)' }}
      className={isDark ? 'dark' : ''}
      suppressHydrationWarning
    >
      <head>
        {/*
          Script de detection theme - s'execute AVANT le premier paint.
          Evite le flash blanc vers sombre au chargement.
          suppressHydrationWarning sur html permet a React d'ignorer
          la difference entre le className serveur et client.
        */}
        <Script id="heritogo-theme-init" strategy="beforeInteractive">
          {`
              (function() {
                try {
                  var cookie = document.cookie.match(/heritogo_theme=([^;]+)/);
                  var saved = cookie ? cookie[1] : null;
                  if (!saved) {
                    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    saved = prefersDark ? 'dark' : 'light';
                    document.cookie = "heritogo_theme=" + saved + "; path=/; max-age=31536000; SameSite=Lax";
                  }
                  if (saved === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch(e) {}
              })();
          `}
        </Script>
        <meta name="theme-color" content="#004D40" />
        <link rel="shortcut icon" href="/icons/icon-192x192.png" />
      </head>

      <body
        className="min-h-full flex flex-col pb-20 bg-base-100 h-full antialiased"
      >
        <ThemeProvider>
          <NextIntlClientProvider messages={messages}>
            <ServiceWorkerRegister />
            <Navbar />
            <OnboardingTooltip />
            <CookieConsentBanner />
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
