import { Metadata } from 'next';
import AppearancePageClient from './appearance-client';
import LoadingAppearance from '@/_components/loadings/loading-appearance';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

export const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations('AppearancePage.MetaData');
    return {
        title: t('Title')
    };
}

export default function AppearancePage() {
    return (
        <Suspense fallback={<LoadingAppearance />}>
            <AppearancePageClient />
        </Suspense>
    );
}