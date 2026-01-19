import { DashboardSidebarHeader } from '@/_components/dashboard-sidebar-header';
import RegisterUpdateUserForm from '@/_components/form-register-user';
import { LoadingRegister } from '@/_components/loadings/loading-register';
import { getCsrfToken } from '@/_lib/csrf';
import prisma from '@/_lib/prisma';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations('AdminsPage.UpdateUserPage.MetaData');
    return {
        title: t('Title')
    };
}

export default async function UpdateUserPage({
    params,
}: { params: Promise<{ id: string }> }) {
    const t = await getTranslations('AdminsPage.UpdateUserPage');
    const breadcrumbItems = [
        { text: t('BreadcrumbDashboard'), href: '/dashboard' },
        { text: t('BreadcrumbAdmins'), href: '/dashboard/admins' },
        { text: t('BreadcrumbUpdateUser'), },
    ];
    const { id } = await params;
    const user = await prisma.users.findUnique({
        where: {
            id
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatar: true,
        }
    });
    if (!user) redirect('/dashboard');
    const csrfToken = await getCsrfToken();
    return (
        <>
            <DashboardSidebarHeader items={breadcrumbItems} />
            <Suspense fallback={<LoadingRegister />}>
                <RegisterUpdateUserForm
                    user={user}
                    isEdit={true}
                    titleForm={t('TextPropsTitleFrom')}
                    valueButton={t('TextPropsValueButton')}
                    csrfToken={csrfToken}
                />
            </Suspense>
        </>
    );
}