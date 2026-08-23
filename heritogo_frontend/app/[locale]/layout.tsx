import type { Metadata } from "next";
import Script from "next/script";
import "@/app/globals.css";
import Navbar from "@/app/_components/Navbar";
import ServiceWorkerRegister from '@/app/_components/ServiceWorkerRegister';
import OnboardingTooltip from '@/app/_components/OnboardingTooltip';
import CookieConsentBanner from '@/app/_components/CookieConsentBanner';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { cookies } from 'next/headers';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import { Toaster } from 'sonner';
import ChatBot from "../_components/ChatBot";
import SplashScreen from "@/components/SplashScreen";


const SEO_DATA: Record<string, { title: string; description: string; keywords: string[] }> = {
  fr: {
    title: 'HeriTogo — Guide Touristique & Patrimoine Culturel du Togo',
    description: 'Explorez les monuments historiques, la gastronomie authentique et réservez des guides certifiés au Togo avec notre scanner IA intelligent.',
    keywords: ['Togo', 'Tourisme Togo', 'Patrimoine togolais', 'Lomé', 'Koutammakou', 'Monuments Togo', 'Culture togolaise', 'Guide touristique Togo', 'Gastronomie togolaise', 'Fufu', 'Voyage Afrique'],
  },
  en: {
    title: 'HeriTogo — Togolese Heritage & Smart Tourism Guide',
    description: 'Discover historical monuments, authentic gastronomy, and book certified local guides in Togo with our AI-powered scanner.',
    keywords: ['Togo', 'Togo Tourism', 'Togolese Heritage', 'Lome', 'Koutammakou', 'Togo Monuments', 'African Culture', 'Togo Travel Guide', 'Togo Cuisine'],
  },
  es: {
    title: 'HeriTogo — Guía Turística y Patrimonio Cultural de Togo',
    description: 'Explore monumentos históricos, gastronomía auténtica y reserve guías locales certificados en Togo con nuestro escáner inteligente con IA.',
    keywords: ['Togo', 'Turismo Togo', 'Patrimonio Togo', 'Lomé', 'Koutammakou', 'Monumentos Togo', 'Cultura africana', 'Guía de viaje Togo'],
  },
  zh: {
    title: 'HeriTogo — 多哥文化遗产与智能旅游指南',
    description: '借助智能AI扫描仪，探索多哥历史古迹、地道美食并预订本地认证导游。',
    keywords: ['多哥', '多哥旅游', '多哥文化遗产', '洛美', '库塔马库', '多哥纪念碑', '非洲旅游', '多哥美食'],
  },
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://heritogo.codorah.com'
  const seo = SEO_DATA[locale] || SEO_DATA.fr

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: seo.title,
      template: `%s | HeriTogo`,
    },
    description: seo.description,
    keywords: seo.keywords,
    authors: [{ name: 'HeriTogo Team' }],
    creator: 'Eric & HeriTogo Team',
    publisher: 'HeriTogo',
    manifest: '/manifest.json',
    alternates: {
      canonical: `/${locale}`,
      languages: {
        fr: '/fr',
        en: '/en',
        es: '/es',
        zh: '/zh',
      },
    },
    openGraph: {
      type: 'website',
      locale: locale === 'zh' ? 'zh_CN' : locale === 'es' ? 'es_ES' : locale === 'en' ? 'en_US' : 'fr_FR',
      url: `${baseUrl}/${locale}`,
      title: seo.title,
      description: seo.description,
      siteName: 'HeriTogo',
      images: [
        {
          url: '/Hero2.png',
          width: 1200,
          height: 630,
          alt: seo.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
      images: ['/Hero2.png'],
      creator: '@heritogo',
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
      icon: '/icons/icon-192x192.png',
      apple: '/icons/icon-192x192.png',
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: 'HeriTogo',
      startupImage: [
        {
          url: '/Hero2.png',
        },
      ],
    },
    verification: {
      google: '7QFZxr2P9izuO8HXoYaLNfyL430UJhw1ZvdClseZQ7A',
    },
  }
}

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
  const themeCookie = cookieStore.get('heritogo_theme')?.value ?? cookieStore.get('theme')?.value;
  const isDark = themeCookie === 'dark';

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://heritogo.codorah.com';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${baseUrl}/#organization`,
        name: 'HeriTogo',
        url: baseUrl,
        logo: `${baseUrl}/icons/icon-512x512.png`,
        description: 'Guide touristique intelligent et valorisation du patrimoine culturel togolais avec IA.',
      },
      {
        '@type': 'WebSite',
        '@id': `${baseUrl}/#website`,
        url: baseUrl,
        name: 'HeriTogo',
        alternateName: ['Heritogo', 'HeriTogo Togo', 'HeriTogo Guide Culturel'],
        publisher: {
          '@id': `${baseUrl}/#organization`,
        },
        inLanguage: ['fr', 'en', 'es', 'zh'],
      },
      {
        '@type': 'SoftwareApplication',
        name: 'HeriTogo',
        applicationCategory: 'TravelApplication',
        operatingSystem: 'Any',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'XOF',
        },
      },
    ],
  };

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
                  var primaryCookie = document.cookie.match(/(?:^|; )heritogo_theme=([^;]+)/);
                  var legacyCookie = document.cookie.match(/(?:^|; )theme=([^;]+)/);
                  var saved = primaryCookie ? primaryCookie[1] : (legacyCookie ? legacyCookie[1] : 'light');
                  saved = saved === 'dark' ? 'dark' : 'light';
                  document.documentElement.classList.toggle('dark', saved === 'dark');
                  document.documentElement.dataset.theme = saved;
                  document.cookie = "heritogo_theme=" + saved + "; path=/; max-age=31536000; SameSite=Lax";
                  document.cookie = "theme=" + saved + "; path=/; max-age=31536000; SameSite=Lax";
                } catch(e) {}
              })();
          `}
        </Script>
        <meta name="theme-color" content="#1C2D52" />
        <meta name="google-site-verification" content="7QFZxr2P9izuO8HXoYaLNfyL430UJhw1ZvdClseZQ7A" />
        <link rel="icon" href="/icons/icon-192x192.png" type="image/png" sizes="192x192" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>

      <body
        className="min-h-full flex flex-col pb-20 bg-base-100 h-full antialiased"
      >
        <ThemeProvider>
          <SplashScreen />
          <AuthProvider>
            <NextIntlClientProvider messages={messages}>
              <ServiceWorkerRegister />
              <Navbar />
              <OnboardingTooltip />
              <CookieConsentBanner />
              {children}
              <ChatBot />

              <Toaster
                position="top-center"
                richColors
                closeButton
                toastOptions={{
                  style: {
                    borderRadius: '1.25rem',
                    border: '1px solid var(--border)',
                    fontFamily: 'var(--font-body)',
                  },
                }}
              />
            </NextIntlClientProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
