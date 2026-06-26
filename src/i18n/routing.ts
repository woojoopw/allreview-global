import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['ko', 'en', 'ja', 'zh', 'es', 'fr', 'de', 'pt', 'hi', 'id', 'th', 'vi'],
  defaultLocale: 'ko',
});
