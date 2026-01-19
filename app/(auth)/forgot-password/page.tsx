import { Suspense } from 'react';
import LoadingForgotPassword from '@/_components/loadings/loading-forgot-password';
import ForgotPasswordClient from './forgot-password-client';
import { Metadata } from 'next';
import { getCsrfToken } from '@/_lib/csrf';
import { getTranslations } from 'next-intl/server';

export const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations('ForgotPasswordPage.MetaData');
    return {
        title: t('Title')
    };
}

export default async function ForgotPasswordPage() {
    const csrfToken = await getCsrfToken();
    return (
        <Suspense fallback={<LoadingForgotPassword />}>
            <ForgotPasswordClient
                csrfToken={csrfToken}
            />
        </Suspense>
    );
}