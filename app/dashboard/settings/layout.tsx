import Heading from '@/_components/heading';
import { Separator } from '@/_components/ui/separator';
import { getTranslations } from 'next-intl/server';
import { type PropsWithChildren } from 'react';
import SettingsLayoutClient from './settings-layout-client';

export default async function SettingsLayout({
    children,
}: PropsWithChildren) {
    const t = await getTranslations('SettingsLayout');
    return (
        <>
            <Heading
                title={t('Title')}
                description={t('Description')}
            />
            <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12 px-4">
                <SettingsLayoutClient />
                <Separator className="my-6 md:hidden" />
                <div className="flex-1 md:max-w-2xl">
                    <section className="max-w-xl flex flex-col gap-4 p-4">
                        {children}
                    </section>
                </div>
            </div>
        </>
    );
}