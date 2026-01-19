'use server';

import { regenerateCsrfToken, validateCsrfToken } from '@/_lib/csrf';
import { getUser } from '@/_lib/dal';
import prisma from '@/_lib/prisma';
import { revalidatePath } from 'next/cache';

export async function reactivateAdminUserById(formData: FormData) {
    const csrfToken = formData.get('csrfToken') as string;
    const isValidCsrf = await validateCsrfToken(csrfToken);

    if (!isValidCsrf) return;

    const userId = formData.get('userId') as string;

    const sessionUser = await getUser();
    if (!sessionUser || sessionUser.role !== 'ADMIN') return;

    if (!userId) return;

    const user = await prisma.users.update({
        where: {
            id: userId
        },
        data: {
            deleted_at: null
        }
    });

    await regenerateCsrfToken();

    if (user.role === 'ADMIN') {
        revalidatePath('/dashboard/admins')
    } else {
        revalidatePath('/dashboard/admins/users');
    };
}