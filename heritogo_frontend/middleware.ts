import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Match root and any language path, but skip API, static files, next assets
    '/',
    '/(fr|en|es|zh)/:path*',
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};
