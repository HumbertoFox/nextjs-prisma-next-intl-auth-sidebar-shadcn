'use client';

import { Button } from '@/_components/ui/button';
import { Languages } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LanguagePageClient() {
    const t = useTranslations('LanguagePage.LanguagePageClient');
    const [locale, setLocale] = useState<string>();
    const router = useRouter();
    const changeLocale = (newLocale: string) => {
        setLocale(newLocale);
        document.cookie = `nextLocale=${newLocale};`;
        router.refresh();
    }
    useEffect(() => {
        const coockieLocale = document.cookie
            .split('; ')
            .find((row) => row.startsWith('nextLocale='))
            ?.split('=')[1];
        if (coockieLocale) {
            const timeout = setTimeout(() => {
                setLocale(coockieLocale);
            }, 0);
            return () => clearTimeout(timeout);
        } else {
            const browserLocale = navigator.language.slice(0, 2);
            const timeout = setTimeout(() => {
                setLocale(browserLocale);
            }, 0);
            document.cookie = `nextLocale=${browserLocale};`;
            router.refresh();
            return () => clearTimeout(timeout);
        }
    }, [router]);
    return (
        <>
            <div className="space-y-6">
                <div className="mb-8 my-1 space-y-0.5">
                    <h2 className="text-xl font-semibold tracking-tight">{t('Titleh2')}</h2>
                    <p className="text-muted-foreground text-sm">{t('ParagrafText')}</p>
                </div>
                <div className="space-x-4">
                    <Button
                        title={t('TitleButtonEn')}
                        disabled={locale === 'en'}
                        onClick={() => changeLocale('en')}
                        className="cursor-pointer"
                    >
                        <Languages />
                        EN
                    </Button>
                    <Button
                        title={t('TitleButtonPt')}
                        disabled={locale === 'pt'}
                        onClick={() => changeLocale('pt')}
                        className="cursor-pointer"
                    >
                        <Languages />
                        PT
                    </Button>
                </div>
            </div>
        </>
    );
}