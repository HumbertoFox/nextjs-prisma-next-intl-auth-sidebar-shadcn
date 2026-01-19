import { DashboardSidebarHeader } from '@/_components/dashboard-sidebar-header';
import { Button } from '@/_components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/_components/ui/dialog';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/_components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/_components/ui/table';
import { getCsrfToken } from '@/_lib/csrf';
import getVisiblePagination from '@/_lib/getvisiblepagination';
import prisma from '@/_lib/prisma';
import { deleteUserById } from '@/app/api/actions/deleteadminuser';
import { reactivateAdminUserById } from '@/app/api/actions/reactivateadminuser';
import { UserLock, UserPen, UserX } from 'lucide-react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations('AdminsPage.UsersPage.MetaData');
    return {
        title: t('Title')
    };
}

const pageSize = 10;

export default async function UsersPage(props: { searchParams?: Promise<{ page?: number; }>; }) {
    const t = await getTranslations('AdminsPage.UsersPage');
    const params = await props.searchParams;
    const rawPage = parseInt(String(params?.page ?? '1'), 10);
    const currentPage = Number.isNaN(rawPage) ? 1 : Math.max(1, rawPage);
    const [users, totalUsers] = await Promise.all([
        prisma.users.findMany({
            where: {
                role: 'USER',
            },
            select: {
                id: true,
                name: true,
                email: true,
                deleted_at: true,
            },
            skip: (currentPage - 1) * pageSize,
            take: pageSize
        }),
        prisma.users.count({
            where: {
                role: 'USER',
            }
        })
    ]);
    const totalPages = Math.ceil(totalUsers / pageSize);
    const csrfToken = await getCsrfToken();
    const breadcrumbItems = [
        { text: t('BreadcrumbDashboard'), href: '/dashboard' },
        { text: t('BreadcrumbAdmins'), href: '/dashboard/admins' },
        { text: t('BreadcrumbUsers'), },
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
                            {users.length === 0 && (
                                <TableRow className="text-red-600 cursor-default">
                                    <TableCell colSpan={5}>{t('TcNoUser')}</TableCell>
                                </TableRow>
                            )}
                            {users.map((user, index) => (
                                <TableRow key={user.id} className="cursor-default">
                                    <TableCell>{(currentPage - 1) * 10 + index + 1}</TableCell>
                                    <TableCell className="max-lg:hidden">{user.id}</TableCell>
                                    <TableCell className="max-lg:hidden">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell className="flex justify-evenly items-center my-1">
                                        {!user.deleted_at ? (
                                            <>
                                                <Link
                                                    href={`/dashboard/admins/${user.id}/update`}
                                                    title={t('TcLinkTitle', { UserName: user.name })}
                                                >
                                                    <UserPen
                                                        aria-label={t('TcLinkAriaLabelIcon', { UserName: user.name })}
                                                        className="size-6 text-yellow-600 hover:text-yellow-500 duration-300"
                                                    />
                                                </Link>

                                                <Dialog key={user.id}>
                                                    <DialogTrigger asChild>
                                                        <button
                                                            type="button"
                                                            title={t('DialogTriggerButtonTitleIf', { UserName: user.name })}
                                                        >
                                                            <UserX
                                                                aria-label={t('DialogTriggerAriaLabelIconIf', { UserName: user.name })}
                                                                className="size-6 text-red-600 cursor-pointer hover:text-red-500 duration-300"
                                                            />
                                                        </button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogTitle>
                                                            {t('DialogTitleIf')}
                                                        </DialogTitle>
                                                        <DialogDescription>
                                                            {t('DialogDescriptionIf', { UserName: user.name })}
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
                                                                    value={user.id}
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
                                            <Dialog key={user.email}>
                                                <DialogTrigger asChild>
                                                    <button
                                                        type="submit"
                                                        title={t('DialogTriggerButtonTitleElse', { UserName: user.name })}
                                                        className="cursor-pointer"
                                                    >
                                                        <UserLock
                                                            aria-label={t('DialogTriggerAriaLabelIconElse', { UserName: user.name })}
                                                            className="size-6 text-red-600 hover:text-green-500 duration-300"
                                                        />
                                                    </button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogTitle>
                                                        {t('DialogTitleElse')}
                                                    </DialogTitle>
                                                    <DialogDescription>
                                                        {t('DialogDescriptionElse', { UserName: user.name })}
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
                                                                value={user.id}
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
                {totalPages > 1 && (
                    <Pagination className="pb-2.5">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href={currentPage > 1 ? `?page=${currentPage - 1}` : '#'}
                                    aria-disabled={currentPage <= 1}
                                    className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                                />
                            </PaginationItem>
                            {getVisiblePagination(currentPage, totalPages).map((page, index) => (
                                <PaginationItem key={index}>
                                    {page === '...' ? (
                                        <PaginationLink
                                            href="#"
                                            aria-disabled
                                            className="pointer-events-none opacity-50"
                                        >
                                            ...
                                        </PaginationLink>
                                    ) : (
                                        <PaginationLink
                                            href={`?page=${page}`}
                                            isActive={currentPage === page}
                                        >
                                            {page}
                                        </PaginationLink>
                                    )}
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext
                                    href={currentPage < totalPages ? `?page=${currentPage + 1}` : '#'}
                                    aria-disabled={currentPage >= totalPages}
                                    className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}
            </div>
        </>
    );
}