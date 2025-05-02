import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale, pathnames } from '@/app/i18n/config';

export default createMiddleware({
  defaultLocale,
  locales,
  pathnames,
  localePrefix: 'as-needed'
});

export const config = {
  matcher: [
    // Match all paths except api, _next, static files and images
    '/((?!api|_next|_vercel|.*\\.|favicon.ico).*)',
    '/'
  ]
};