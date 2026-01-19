import { Suspense } from 'react';
import ResetPasswordClient from './reset-password-client';
import LoadingResetPassword from '@/_components/loadings/loading-reset-password';
import { Metadata } from 'next';
import { getCsrfToken } from '@/_lib/csrf';
import { getTranslations } from 'next-intl/server';

export const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations('ResetPasswordPage.MetaData');
    return {
        title: t('Title')
    };
}

export default async function ResetPasswordPage() {
    const csrfToken = await getCsrfToken();
    return (
        <Suspense fallback={<LoadingResetPassword />}>
            <ResetPasswordClient
                csrfToken={csrfToken}
            />
        </Suspense>
    );
}