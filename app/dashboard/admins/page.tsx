import { DashboardSidebarHeader } from '@/_components/dashboard-sidebar-header';
import { Button } from '@/_components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/_components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/_components/ui/table';
import { getCsrfToken } from '@/_lib/csrf';
import { getUser } from '@/_lib/dal';
import prisma from '@/_lib/prisma';
import { UserDetailsProps } from '@/_types';
import { deleteUserById } from '@/app/api/actions/deleteadminuser';
import { reactivateAdminUserById } from '@/app/api/actions/reactivateadminuser';
import { UserLock, UserRoundPen, UserRoundX } from 'lucide-react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations('AdminsPage.MetaData');
    return {
        title: t('Title')
    };
}

export default async function AdminsPage() {
    const t = await getTranslations('AdminsPage');
    const user = await getUser() as UserDetailsProps;
    const loggedAdmin = user.id;
    const admins = await prisma.users.findMany({
        where: {
            role: 'ADMIN'
        },
        select: {
            id: true,
            name: true,
            email: true,
            deleted_at: true,
        }
    });
    const csrfToken = await getCsrfToken();
    const breadcrumbItems = [
        { text: t('BreadcrumbDashboard'), href: '/dashboard' },
        { text: t('BreadcrumbAdmins') },
    ];
    return (
        <>
            <DashboardSidebarHeader items={breadcrumbItems} />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-screen flex-1 overflow-hidden rounded-xl border md:min-h-min">
                    <Table className="w-full text-center">
                        <TableHeader>
                            <TableRow className="cursor-default">
                                <TableHead className="text-center">{t('ThNumberList')}</TableHead>
                                <TableHead className="text-center max-lg:hidden">{t('ThId')}</TableHead>
                                <TableHead className="text-center max-lg:hidden">{t('ThName')}</TableHead>
                                <TableHead className="text-center">{t('ThEmail')}</TableHead>
                                <TableHead className="text-center">{t('ThActions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {admins.length === 0 && (
                                <TableRow className="text-red-600 cursor-default">
                                    <TableCell colSpan={5}>{t('TcNoAdmin')}</TableCell>
                                </TableRow>
                            )}
                            {admins.map((admin, index) => (
                                <TableRow
                                    key={index}
                                    className="cursor-default"
                                >
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell className="max-lg:hidden">{admin.id}</TableCell>
                                    <TableCell className="max-lg:hidden">{admin.name}</TableCell>
                                    <TableCell>{admin.email}</TableCell>
                                    <TableCell className="flex justify-evenly items-center my-1">
                                        {!admin.deleted_at ? (
                                            <>
                                                <Link
                                                    href={admin.id === loggedAdmin ? '/dashboard/settings/profile' : `/dashboard/admins/${admin.id}/update`}
                                                    title={t('TcLinkTitle', { AdminName: admin.name })}
                                                >
                                                    <UserRoundPen
                                                        aria-label={t('TcLinkAriaLabelIcon', { AdminName: admin.name })}
                                                        className="size-6 text-yellow-600 hover:text-yellow-500 duration-300"
                                                    />
                                                </Link>

                                                <Dialog key={admin.id}>
                                                    <DialogTrigger asChild>
                                                        {admin.id !== loggedAdmin && (
                                                            <button
                                                                type="button"
                                                                title={t('DialogTriggerButtonTitleIf', { AdminName: admin.name })}
                                                            >
                                                                <UserRoundX
                                                                    aria-label={t('DialogTriggerAriaLabelIconIf', { AdminName: admin.name })}
                                                                    className="size-6 text-red-600 cursor-pointer hover:text-red-500 duration-300"
                                                                />
                                                            </button>
                                                        )}
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogTitle>
                                                            {t('DialogTitleIf')}
                                                        </DialogTitle>
                                                        <DialogDescription>
                                                            {t('DialogDescriptionIf', { AdminName: admin.name })}
                                                        </DialogDescription>
                                                        <DialogFooter>
                                                            <DialogClose asChild>
                                                                <Button
                                                                    type="button"
                                                                    variant="secondary"
                                                                >
                                                                    {t('DialogCloseIf')}
                                                                </Button>
                                                            </DialogClose>
                                                            <form action={deleteUserById}>
                                                                <input
                                                                    type="hidden"
                                                                    name="csrfToken"
                                                                    value={csrfToken}
                                                                />
                                                                <input
                                                                    type="hidden"
                                                                    name="userId"
                                                                    value={admin.id}
                                                                />
                                                                <Button
                                                                    type="submit"
                                                                    variant="destructive"
                                                                >
                                                                    {t('ButtonSubmitDelete')}
                                                                </Button>
                                                            </form>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </>
                                        ) : (
                                            <Dialog key={admin.email}>
                                                <DialogTrigger asChild>
                                                    <button
                                                        type="button"
                                                        title={t('DialogTriggerButtonTitleElse', { AdminName: admin.name })}
                                                        className="cursor-pointer"
                                                    >
                                                        <UserLock
                                                            aria-label={t('DialogTriggerAriaLabelIconElse', { AdminName: admin.name })}
                                                            className="size-6 text-red-600 hover:text-green-500 duration-300"
                                                        />
                                                    </button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogTitle>
                                                        {t('DialogTitleElse')}
                                                    </DialogTitle>
                                                    <DialogDescription>
                                                        {t('DialogDescriptionElse', { AdminName: admin.name })}
                                                    </DialogDescription>
                                                    <DialogFooter>
                                                        <DialogClose asChild>
                                                            <Button
                                                                type="button"
                                                                variant="destructive"
                                                            >
                                                                {t('DialogCloseElse')}
                                                            </Button>
                                                        </DialogClose>
                                                        <form action={reactivateAdminUserById}>
                                                            <input
                                                                type="hidden"
                                                                name="csrfToken"
                                                                value={csrfToken}
                                                            />
                                                            <input
                                                                type="hidden"
                                                                name="userId"
                                                                value={admin.id}
                                                            />
                                                            <Button
                                                                type="submit"
                                                                variant="outline"
                                                            >
                                                                {t('ButtonSubmitActivate')}
                                                            </Button>
                                                        </form>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </>
    );
}