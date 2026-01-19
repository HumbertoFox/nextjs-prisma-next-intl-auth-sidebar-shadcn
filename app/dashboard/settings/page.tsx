import { getUser } from '@/_lib/dal';
import SettingsPageClient from './settings-client';
import { UserDetailsProps } from '@/_types';
import { Metadata } from 'next';
import LoadingSettings from '@/_components/loadings/loading-settings';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

export const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations('SettingsPage.MetaData');
    return {
        title: t('Title')
    };
}

export default async function SettingsPage() {
    const user = await getUser() as UserDetailsProps;
    return (
        <Suspense fallback={<LoadingSettings />}>
            <SettingsPageClient user={user} />
        </Suspense>
    );
}