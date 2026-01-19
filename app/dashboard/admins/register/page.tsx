import { DashboardSidebarHeader } from '@/_components/dashboard-sidebar-header';
import { Metadata } from 'next';
import RegisterUser from '@/_components/form-register-user';
import { Suspense } from 'react';
import { LoadingRegister } from '@/_components/loadings/loading-register';
import { getCsrfToken } from '@/_lib/csrf';
import { getTranslations } from 'next-intl/server';

export const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations('AdminsPage.RegisterUsersPage.MetaData');
    return {
        title: t('Title')
    };
}

export default async function RegisterUsersPage() {
    const t = await getTranslations('AdminsPage.RegisterUsersPage');
    const breadcrumbItems = [
        { text: t('BreadcrumbDashboard'), href: '/dashboard' },
        { text: t('BreadcrumbAdmins'), href: '/dashboard/admins' },
        { text: t('BreadcrumbRegister'), },
    ];
    const csrfToken = await getCsrfToken();
    return (
        <>
            <DashboardSidebarHeader items={breadcrumbItems} />
            <Suspense fallback={<LoadingRegister />}>
                <RegisterUser
                    titleForm={t('TextPropsTitleForm')}
                    valueButton={t('TextPropsValueButton')}
                    csrfToken={csrfToken}
                />
            </Suspense>
        </>
    );
}