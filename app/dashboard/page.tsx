import { DashboardSidebarHeader } from '@/_components/dashboard-sidebar-header';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations('DashboardPage.MetaData');
    return {
        title: t('Title')
    };
}

export default async function DashboardPage() {
    const t = await getTranslations('DashboardPage');
    const breadcrumbItems = [{ text: t('BreadCrunmbTextDashboard') },];
    return (
        <>
            <DashboardSidebarHeader items={breadcrumbItems} />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    {[...Array(3)].map((_, index) => (
                        <div key={index} className="bg-muted/50 aspect-video rounded-xl" />
                    ))}
                </div>
                <div className="bg-muted/50 min-h-screen flex-1 rounded-xl md:min-h-min" />
            </div>
        </>
    );
}