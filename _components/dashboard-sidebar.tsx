'use client';

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail, } from '@/_components/ui/sidebar';
import AppLogoSvg from '@/_components/app-logo-svg';
import Link from 'next/link';
import { NavMainAdmins } from '@/_components/nav-main-admins';
import { LayoutGrid, UserRoundCog, UserRoundPlus, UsersRound } from 'lucide-react';
import { NavMainUsers } from '@/_components/nav-main-users';
import { NavUser } from '@/_components/nav-user';
import { NavMainItemProps, ProfileForm } from '@/_types';
import { useTranslations } from 'next-intl';

type DashboardSidebarProps = React.ComponentProps<typeof Sidebar> & {
    user: ProfileForm;
    isAdmin: boolean;
}

export default function DashboardSidebar({
    user,
    isAdmin,
    ...props
}: DashboardSidebarProps) {
    const t = useTranslations('DashboardPage.DashboardSidebar');
    const adminNavItems: NavMainItemProps[] = [
        { title: t('AdminNav.Admins'), href: '/dashboard/admins', icon: UserRoundCog },
        { title: t('AdminNav.Users'), href: '/dashboard/admins/users', icon: UsersRound },
        { title: t('AdminNav.RegisterUser'), href: '/dashboard/admins/register', icon: UserRoundPlus },
    ];
    const userNavItems: NavMainItemProps[] = [
        { title: t('UserNav.UserDashboard'), href: '/dashboard', icon: LayoutGrid, },
    ];
    return (
        <Sidebar
            collapsible="icon"
            variant="floating"
            {...props}
        >
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                        >
                            <Link
                                href="/dashboard"
                                prefetch
                            >
                                <AppLogoSvg />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            {isAdmin && (
                <SidebarContent>
                    <NavMainAdmins items={adminNavItems} />
                </SidebarContent>
            )}
            <SidebarContent>
                <NavMainUsers items={userNavItems} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}