export const PRIVACY_POLICY = {
  fr: {
    title: 'Politique de confidentialité — HeriTogo',
    lastUpdated: '2 octobre 2026',
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
          "Faire fonctionner le service (compte, scanner, carte, réservations), assurer la mise en relation et la sécurité des utilisateurs (guides vérifiés). Nous ne vendons pas vos données et n’utilisons pas de publicité comportementale.",
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
          "Accès et rectification depuis le tableau de bord. Retrait du consentement géolocalisation ou notifications dans les paramètres. Suppression définitive du compte (droit à l’oubli). Contact : privacy@heritogo.tg.",
      },
      {
        title: '7. Sous-traitants',
        content:
          "Supabase (hébergement et authentification), Google Gemini (analyse d’image le temps du scan), prestataire KYC (Stripe Identity le cas échéant), envoi d’e-mails transactionnels.",
      },
      {
        title: '8. Cookies',
        content:
          "Cookies essentiels de session et de langue. Thème : cookie de préférence, refus possible. Pas de cookies publicitaires. Géolocalisation et notifications : consentements séparés.",
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
    lastUpdated: '2 October 2026',
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
          'To run the service (account, scanner, map, bookings) and keep users safe through verified guides. We do not sell data or run behavioural ads.',
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
          'Access and rectify data in the dashboard. Withdraw geolocation or notification consent in settings. Permanently delete your account. Contact privacy@heritogo.tg.',
      },
      {
        title: '7. Processors',
        content:
          'Supabase (hosting/auth), Google Gemini (scan image, processing time only), KYC provider (Stripe Identity when configured), transactional email.',
      },
      {
        title: '8. Cookies',
        content:
          'Essential session and language cookies. Theme cookie is optional. No advertising cookies. Geolocation and notifications are separate opt-ins.',
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
    lastUpdated: '2 de octubre de 2026',
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
          'Operar el servicio y la seguridad de la comunidad. No vendemos datos.',
      },
      {
        title: '4. Conservación',
        content:
          'Hasta borrar la cuenta. La posición GPS es efímera.',
      },
      {
        title: '5. Derechos',
        content:
          'Acceso, rectificación, retirada del consentimiento y supresión definitiva en ajustes o en privacy@heritogo.tg.',
      },
      {
        title: '6. Contacto',
        content: 'privacy@heritogo.tg — HeriTogo, Lomé, Togo.',
      },
    ],
  },
  zh: {
    title: '隐私政策 — HeriTogo',
    lastUpdated: '2026年10月2日',
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
        content: '保障服务运行与用户安全。我们不出售数据。',
      },
      {
        title: '4. 保存期限',
        content: '账户删除后立即清除。GPS 为短暂处理。',
      },
      {
        title: '5. 您的权利',
        content: '访问、更正、撤回同意、删除账户：应用设置或 privacy@heritogo.tg。',
      },
      {
        title: '6. 联系方式',
        content: 'privacy@heritogo.tg — HeriTogo, Lome, Togo.',
      },
    ],
  },
} as const

export type PrivacyPolicyLocale = keyof typeof PRIVACY_POLICY
