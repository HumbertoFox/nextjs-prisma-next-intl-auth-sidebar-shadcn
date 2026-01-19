import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => {
    const locale = (await cookies()).get('nextLocale')?.value || 'en';
    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default
    };
})