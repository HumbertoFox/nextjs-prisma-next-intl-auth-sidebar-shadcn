import RegisterAdminClient from './form-register-admin-client';
import { Metadata } from 'next';
import { Suspense } from 'react';
import { LoadingRegister } from '@/_components/loadings/loading-register';
import { getCsrfToken } from '@/_lib/csrf';
import { getIsAdmin } from '@/_lib/getisadmin';
import { getTranslations } from 'next-intl/server';

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('RegisterPage.MetaData');
  const isAdmin = await getIsAdmin();
  return {
    title: isAdmin ? t('User') : t('Admin')
  };
}

export default async function RegisterPage() {
  const t = await getTranslations('RegisterPage');
  const isAdmin = await getIsAdmin();
  const Title = isAdmin ? t('TextPropsUser') : t('TextPropsAdmin');
  const csrfToken = await getCsrfToken();
  return (
    <Suspense fallback={<LoadingRegister />}>
      <RegisterAdminClient
        TitleIntl={Title}
        csrfToken={csrfToken}
      />
    </Suspense>
  );
}