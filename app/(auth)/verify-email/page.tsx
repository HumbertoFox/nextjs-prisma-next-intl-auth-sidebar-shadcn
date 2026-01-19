import { Suspense } from 'react';
import VerifyEmailClient from './verify-email-client';
import LoadingVerifyEmail from '@/_components/loadings/loading-verify-email';
import { Metadata } from 'next';
import { getCsrfToken } from '@/_lib/csrf';
import { getTranslations } from 'next-intl/server';

export const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations('VerifyEmailPage.MetaData');
    return {
        title: t('Title')
    };
}

export default async function VerifyEmailPage() {
    const csrfToken = await getCsrfToken();
    return (
        <Suspense fallback={<LoadingVerifyEmail />}>
            <VerifyEmailClient
                csrfToken={csrfToken}
            />
        </Suspense>
    );
}