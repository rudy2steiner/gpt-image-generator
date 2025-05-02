import { createSharedPathnamesNavigation } from 'next-intl/navigation';
import { locales, defaultLocale } from './i18n/config';

export { locales, defaultLocale };
export type Locale = (typeof locales)[number];

export const { Link, redirect, usePathname, useRouter } = createSharedPathnamesNavigation({
  locales,
  defaultLocale
});