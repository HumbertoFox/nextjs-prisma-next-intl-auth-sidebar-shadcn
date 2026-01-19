'use client';

import { DashboardSidebarHeader } from '@/_components/dashboard-sidebar-header';
import { BreadcrumbItemProps, HeadingProps } from '@/_types';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

export default function Heading({
    title,
    description,
}: HeadingProps) {
    const t = useTranslations('SettingsPage.Heading');
    const currentPath = usePathname();
    const breadcrumbMap: Record<string, BreadcrumbItemProps[]> = {
        '/dashboard/settings': [
            { text: t('BreadcrumbDashboard'), href: '/dashboard' },
            { text: t('BreadcrumbSettings') },
        ],
        '/dashboard/settings/profile': [
            { text: t('BreadcrumbDashboard'), href: '/dashboard' },
            { text: t('BreadcrumbSettings'), href: '/dashboard/settings' },
            { text: t('BreadcrumbProfile') },
        ],
        '/dashboard/settings/password': [
            { text: t('BreadcrumbDashboard'), href: '/dashboard' },
            { text: t('BreadcrumbSettings'), href: '/dashboard/settings' },
            { text: t('BreadcrumbPassword') },
        ],
        '/dashboard/settings/appearance': [
            { text: t('BreadcrumbDashboard'), href: '/dashboard' },
            { text: t('BreadcrumbSettings'), href: '/dashboard/settings' },
            { text: t('BreadcrumbAppearance') },
        ],
        '/dashboard/settings/language': [
            { text: t('BreadcrumbDashboard'), href: '/dashboard' },
            { text: t('BreadcrumbSettings'), href: '/dashboard/settings' },
            { text: t('BreadcrumbLanguage') },
        ],
    };
    const breadcrumbItems = breadcrumbMap[currentPath] || [];

    return (
        <>
            <DashboardSidebarHeader items={breadcrumbItems} />
            <div className="mb-8 my-1 px-4 space-y-0.5">
                <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
                {description && <p className="text-muted-foreground text-sm">{description}</p>}
            </div>
        </>
    );
}