export const PRIVACY_POLICY = {
  fr: {
    title: 'Politique de confidentialité — HeriTogo',
    lastUpdated: '14 octobre 2026',
    updatedLabel: 'Mise à jour',
    closeLabel: 'Fermer',
    understoodLabel: "J'ai lu et compris",
    sections: [
      {
        title: '1. Qui collecte les données ?',
        content:
          "HeriTogo, Lomé, Togo, est responsable du traitement. Contact : privacy@heritogo.tg. Nous proposons la découverte du patrimoine togolais et la mise en relation entre voyageurs et guides locaux certifiés.",
      },
      {
        title: '2. Quelles données ?',
        content:
          "Minimisation : nom, e-mail, mot de passe haché par le prestataire d’authentification (jamais en clair), rôle, langue, téléphone facultatif, données de réservation. Géolocalisation uniquement avec votre accord, en mémoire pendant le scan, jamais historisée. Notifications uniquement si vous les activez. Pour les guides, le KYC (pièces d’identité) est traité par un prestataire tiers : les documents ne transitent pas et ne sont jamais stockés sur nos serveurs. Historique de scans : uniquement sur votre appareil.",
      },
      {
        title: '3. Pourquoi ?',
        content:
          "Faire fonctionner le service (compte, scanner, carte, réservations), assurer la mise en relation et la sécurité des utilisateurs (guides vérifiés). Nous ne vendons pas vos données personnelles.",
      },
      {
        title: '4. Durée de conservation',
        content:
          "Compte et réservations : jusqu’à suppression du compte (effacement immédiat). Position GPS : éphémère, jamais en base. Session KYC : chez le prestataire ; HeriTogo ne conserve qu’un identifiant et un statut. Cookies de session : 7 jours.",
      },
      {
        title: '5. Sécurité',
        content:
          "Communications chiffrées (HTTPS/TLS). Mots de passe hachés (bcrypt / équivalent Supabase Auth). Cookies de session HttpOnly, Secure en production, SameSite=Lax. Accès limité à vos propres données.",
      },
      {
        title: '6. Vos droits',
        content:
          "Accès et rectification depuis le tableau de bord. Retrait du consentement géolocalisation ou notifications dans les paramètres. Suppression définitive du compte (droit à l’oubli). Gestion de vos choix publicitaires via le lien dédié en bas de page. Contact : privacy@heritogo.tg.",
      },
      {
        title: '7. Sous-traitants & Partenaires',
        content:
          "Supabase (hébergement et authentification), Google Gemini (analyse d’image le temps du scan), prestataire KYC (Stripe Identity le cas échéant), Google AdSense (régie publicitaire web), envoi d’e-mails transactionnels.",
      },
      {
        title: '8. Cookies et Publicité Google AdSense',
        content:
          "Notre application utilise des cookies essentiels au bon fonctionnement (session, authentification, langue et préférence de thème). Afin de financer la maintenance et l’accès libre à notre guide culturel, nous diffusons des annonces publicitaires via Google AdSense. Google et ses partenaires tiers utilisent des cookies (notamment le cookie DoubleClick) pour diffuser des annonces pertinentes en fonction de vos visites antérieures sur notre site ou d’autres sites internet. Pour les utilisateurs situés dans l’Espace Économique Européen (RGPD), un message de consentement certifié Google (Funding Choices) vous permet d’accepter ou de refuser la personnalisation des annonces et l’utilisation de traceurs tiers. Vous pouvez à tout moment modifier ou révoquer vos choix via le lien 'Gérer mes préférences de publicité' situé en bas de chaque page, ou directement sur https://adssettings.google.com ainsi que sur le portail www.aboutads.info.",
      },
      {
        title: '9. Enfants',
        content: "Le service n’est pas destiné aux moins de 16 ans.",
      },
      {
        title: '10. Contact',
        content: "privacy@heritogo.tg — HeriTogo, Lomé, Togo.",
      },
    ],
  },
  en: {
    title: 'Privacy Policy — HeriTogo',
    lastUpdated: '14 October 2026',
    updatedLabel: 'Updated',
    closeLabel: 'Close',
    understoodLabel: 'I have read and understood',
    sections: [
      {
        title: '1. Who collects data?',
        content:
          'HeriTogo, Lomé, Togo, is the data controller. Contact: privacy@heritogo.tg. We provide Togolese heritage discovery and matching between travellers and certified local guides.',
      },
      {
        title: '2. What data?',
        content:
          'Data minimisation: name, email, password hashed by the auth provider (never in plain text), role, language, optional phone, booking data. GPS only with your consent, in memory during a scan, never stored historically. Notifications only if you enable them. Guide KYC identity documents are processed by a third party; they never transit or sit on our servers. Scan history stays on your device.',
      },
      {
        title: '3. Why?',
        content:
          'To run the service (account, scanner, map, bookings) and keep users safe through verified guides. We do not sell your personal data.',
      },
      {
        title: '4. Retention',
        content:
          'Account and bookings until you delete your account (immediate hard delete). GPS is ephemeral. KYC files stay with the provider; we keep only a session id and status. Session cookies: 7 days.',
      },
      {
        title: '5. Security',
        content:
          'HTTPS/TLS, hashed passwords (bcrypt / Supabase Auth), HttpOnly session cookies (Secure in production, SameSite=Lax).',
      },
      {
        title: '6. Your rights',
        content:
          'Access and rectify data in the dashboard. Withdraw geolocation or notification consent in settings. Permanently delete your account. Manage advertising choices via the link in the footer. Contact privacy@heritogo.tg.',
      },
      {
        title: '7. Processors & Partners',
        content:
          'Supabase (hosting/auth), Google Gemini (scan image, processing time only), KYC provider (Stripe Identity when configured), Google AdSense (display advertising), transactional email.',
      },
      {
        title: '8. Cookies and Google AdSense Advertising',
        content:
          'We use essential cookies to operate the service (session, authentication, language, and theme preferences). To support free access to our cultural heritage guide, we display advertisements via Google AdSense. Google and its certified partners use cookies (such as the DoubleClick cookie) to serve ads based on your prior visits to this or other websites. For visitors in the European Economic Area (GDPR), a Google-certified consent message (Funding Choices) allows you to accept or refuse personalized advertising and third-party tracking. You can review or revoke your choices at any time by clicking "Manage ad preferences" in our footer, or directly via https://adssettings.google.com and www.aboutads.info.',
      },
      {
        title: '9. Children',
        content: 'The service is not intended for anyone under 16.',
      },
      {
        title: '10. Contact',
        content: 'privacy@heritogo.tg — HeriTogo, Lomé, Togo.',
      },
    ],
  },
  es: {
    title: 'Política de privacidad — HeriTogo',
    lastUpdated: '14 de octubre de 2026',
    updatedLabel: 'Actualizado',
    closeLabel: 'Cerrar',
    understoodLabel: 'He leído y entendido',
    sections: [
      {
        title: '1. ¿Quién recoge los datos?',
        content:
          'HeriTogo, Lomé, Togo, es el responsable del tratamiento. Contacto: privacy@heritogo.tg.',
      },
      {
        title: '2. ¿Qué datos?',
        content:
          'Minimización: perfil, reservas. GPS solo con consentimiento, en memoria, nunca historiado. El KYC de guías lo trata un tercero: los documentos de identidad no transitan ni se almacenan en nuestros servidores.',
      },
      {
        title: '3. ¿Para qué?',
        content:
          'Operar el servicio y la seguridad de la comunidad. No vendemos datos personales.',
      },
      {
        title: '4. Conservación',
        content:
          'Hasta borrar la cuenta. La posición GPS es efímera.',
      },
      {
        title: '5. Derechos',
        content:
          'Acceso, rectificación, retirada del consentimiento, gestión de preferencias publicitarias y supresión definitiva en ajustes o en privacy@heritogo.tg.',
      },
      {
        title: '6. Cookies y Publicidad Google AdSense',
        content:
          'Utilizamos cookies esenciales de sesión y navegación. Para financiar el acceso libre a la plataforma, mostramos anuncios mediante Google AdSense. Google y sus socios utilizan cookies de terceros (como DoubleClick) para mostrar anuncios basados en sus visitas previas. Los usuarios bajo el RGPD pueden configurar o revocar su consentimiento en cualquier momento mediante el enlace "Gestionar preferencias de publicidad" situado en el pie de página, o visitando https://adssettings.google.com y www.aboutads.info.',
      },
      {
        title: '7. Contacto',
        content: 'privacy@heritogo.tg — HeriTogo, Lomé, Togo.',
      },
    ],
  },
  zh: {
    title: '隐私政策 — HeriTogo',
    lastUpdated: '2026年10月14日',
    updatedLabel: '更新日期',
    closeLabel: '关闭',
    understoodLabel: '我已阅读并理解',
    sections: [
      {
        title: '1. 谁收集数据？',
        content: '数据控制者为 HeriTogo（多哥洛美）。联系邮箱：privacy@heritogo.tg。',
      },
      {
        title: '2. 收集哪些数据？',
        content:
          '最小化原则：账户与预订信息。定位仅在您同意后于扫描期间留在内存，不写入历史数据库。导游身份核验由第三方完成，证件从不经过或存储在我们的服务器上。',
      },
      {
        title: '3. 目的',
        content: '保障服务运行与用户安全。我们不出售您的个人数据。',
      },
      {
        title: '4. 保存期限',
        content: '账户删除后立即清除。GPS 为短暂处理。',
      },
      {
        title: '5. 您的权利',
        content: '访问、更正、撤回同意、管理广告偏好及删除账户：应用设置或联系 privacy@heritogo.tg。',
      },
      {
        title: '6. Cookie 与 Google AdSense 广告',
        content:
          '我们使用必要 Cookie 以保障网站基本功能。为维持多哥文化遗产指南的免费开放，我们接入了 Google AdSense 广告平台。Google 及其第三方合作伙伴会使用 Cookie（例如 DoubleClick Cookie）根据用户之前的访问记录展示相关广告。针对受 GDPR 保护的欧洲及国际用户，Google 认证的同意工具（Funding Choices）允许您选择同意或拒绝个性化广告与第三方追踪。您可随时通过页面底部的“管理广告偏好设置”链接，或访问 https://adssettings.google.com 及 www.aboutads.info 调整或撤回授权。',
      },
      {
        title: '7. 联系方式',
        content: 'privacy@heritogo.tg — HeriTogo, Lome, Togo.',
      },
    ],
  },
} as const

export type PrivacyPolicyLocale = keyof typeof PRIVACY_POLICY
