import { Pathnames } from 'next-intl/navigation';

export const locales = ['en', 'zh'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];

export const pathnames = {
  '/': '/',
  '/gallery': '/gallery',
  '/blog': '/blog',
  '/blog/[slug]': '/blog/[slug]'
} satisfies Pathnames<typeof locales>;

export const localePrefix = 'as-needed';

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}