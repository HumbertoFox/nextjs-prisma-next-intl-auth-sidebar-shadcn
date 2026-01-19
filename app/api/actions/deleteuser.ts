'use server';

import { getUser } from '@/_lib/dal';
import { deleteUserSchema, FormStateUserDelete } from '@/_lib/definitions';
import * as bcrypt from 'bcrypt-ts';
import z from 'zod';
import { regenerateCsrfToken, validateCsrfToken } from '@/_lib/csrf';
import prisma from '@/_lib/prisma';
import { getTranslations } from 'next-intl/server';

export async function deleteUser(state: FormStateUserDelete, formData: FormData): Promise<FormStateUserDelete> {
    const t = await getTranslations('ProfilePage.DeleteUserActions');
    const csrfToken = formData.get('csrfToken') as string;
    const isValidCsrf = await validateCsrfToken(csrfToken);

    if (!isValidCsrf) return { message: false };

    const validatedFields = deleteUserSchema.safeParse({ password: formData.get('password') as string });

    if (!validatedFields.success) return { errors: z.flattenError(validatedFields.error).fieldErrors };

    const { password } = validatedFields.data;

    const sessionUser = await getUser();
    if (!sessionUser || !sessionUser?.id) return { message: false };

    const existingUser = await prisma.users.findUnique({
        where: {
            id: sessionUser.id
        }
    });

    if (!existingUser || !existingUser.password) return { message: false };

    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);

    if (!isPasswordCorrect) return { errors: { password: [t('ErrorsPssword')] } };

    await prisma.users.update({
        where: {
            id: sessionUser.id
        },
        data: {
            deleted_at: new Date()
        }
    });

    await regenerateCsrfToken();

    return { message: true };
}