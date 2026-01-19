'use client';

import { usePathname } from 'next/navigation';
import { Button } from '@/_components/ui/button';
import Link from 'next/link';
import { cn } from '@/_lib/utils';
import { SidebarNavItemProps } from '@/_types';
import { useTranslations } from 'next-intl';

export default function SettingsLayoutClient() {
    const t = useTranslations('SettingsLayout.SettingsLayoutComponents');
    const currentPath = usePathname();
    const sidebarNavItems: SidebarNavItemProps[] = [
        { text: t('SidebarNavSettings'), href: '/dashboard/settings', },
        { text: t('SidebarNavProfile'), href: '/dashboard/settings/profile', },
        { text: t('SidebarNavPassword'), href: '/dashboard/settings/password', },
        { text: t('SidebarNavAppearance'), href: '/dashboard/settings/appearance', },
        { text: t('SidebarNavLanguage'), href: '/dashboard/settings/language', },
    ];
    return (
        <aside className="w-full max-w-xl lg:w-48">
            <nav className="flex flex-col space-y-1 space-x-0">
                {sidebarNavItems.map((item, index) => (
                    <Button
                        key={`${item.href}-${index}`}
                        size="sm"
                        variant="ghost"
                        asChild
                        className={cn('w-full justify-start', {
                            'bg-muted': currentPath === item.href,
                        })}
                    >
                        <Link href={item.href} prefetch>
                            {item.text}
                        </Link>
                    </Button>
                ))}
            </nav>
        </aside>
    );
}