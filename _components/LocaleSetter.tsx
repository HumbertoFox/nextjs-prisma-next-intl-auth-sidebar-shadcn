'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LocaleSetter() {
    const router = useRouter();

    useEffect(() => {
        const cookieName = 'nextLocale';

        const existing = document.cookie
            .split('; ')
            .find((row) => row.startsWith(`${cookieName}=`))
            ?.split('=')[1];

        if (!existing) {
            const browserLocale = navigator.language.slice(0, 2) || 'en';
            document.cookie = `${cookieName}=${browserLocale}; path=/`;
            router.refresh();
        }
    }, [router]);

    return null;
}