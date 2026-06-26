'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    // 💡 Bloque le Service Worker en mode développement
    if (process.env.NODE_ENV === 'development') {
      return;
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('SW enregistré :', reg.scope))
        .catch((err) => console.error('SW erreur :', err));
    }
  }, []);

  return null;
}