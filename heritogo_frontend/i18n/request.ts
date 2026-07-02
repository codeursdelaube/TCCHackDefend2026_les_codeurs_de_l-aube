import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

type Messages = Record<string, unknown>;

function mergeMessages(base: Messages, override: Messages): Messages {
  const merged: Messages = { ...base };

  for (const [key, value] of Object.entries(override)) {
    const baseValue = merged[key];

    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      baseValue &&
      typeof baseValue === 'object' &&
      !Array.isArray(baseValue)
    ) {
      merged[key] = mergeMessages(baseValue as Messages, value as Messages);
    } else {
      merged[key] = value;
    }
  }

  return merged;
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    locale = routing.defaultLocale;
  }

  const fallbackMessages = (await import('../messages/fr.json')).default as Messages;
  const localeMessages = locale === routing.defaultLocale
    ? fallbackMessages
    : (await import(`../messages/${locale}.json`)).default as Messages;

  return {
    locale,
    messages: mergeMessages(fallbackMessages, localeMessages)
  };
});
