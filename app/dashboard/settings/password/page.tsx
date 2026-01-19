import { Metadata } from 'next';
import PasswordPageClient from './password-client';
import LoadingPassword from '@/_components/loadings/loading-password';
import { Suspense } from 'react';
import { getCsrfToken } from '@/_lib/csrf';
import { getTranslations } from 'next-intl/server';

export const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations('PasswordPage.MetaData');
    return {
        title: t('Title')
    };
}

export default async function PasswordPage() {
    const csrfToken = await getCsrfToken();
    return (
        <Suspense fallback={<LoadingPassword />}>
            <PasswordPageClient
                csrfToken={csrfToken}
            />
        </Suspense>
    );
}