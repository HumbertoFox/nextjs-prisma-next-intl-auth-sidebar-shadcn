import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import LanguagePageClient from './language-client';
import LoadingLanguage from '@/_components/loadings/loading-language';
import { Suspense } from 'react';

export const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations('LanguagePage.MetaData');
    return {
        title: t('Title')
    };
}

export default function LanguagePage() {
    return (
        <Suspense fallback={<LoadingLanguage />}>
            <LanguagePageClient />
        </Suspense>
    );
}