'use server';

import { getUser } from '@/_lib/dal';
import { FormStatePasswordUpdate, passwordUpdateSchema } from '@/_lib/definitions';
import { compare, hash } from 'bcrypt-ts';
import { redirect } from 'next/navigation';
import z from 'zod';
import { revalidatePath } from 'next/cache';
import { regenerateCsrfToken, validateCsrfToken } from '@/_lib/csrf';
import prisma from '@/_lib/prisma';
import { getTranslations } from 'next-intl/server';

export async function updatePassword(state: FormStatePasswordUpdate, formData: FormData): Promise<FormStatePasswordUpdate> {
    const t = await getTranslations('PasswordPage.UpdatePasswordActions');
    const csrfToken = formData.get('csrfToken') as string;
    const isValidCsrf = await validateCsrfToken(csrfToken);

    if (!isValidCsrf) return { message: false };

    const validatedFields = passwordUpdateSchema.safeParse({
        current_password: formData.get('current_password') as string,
        password: formData.get('password') as string,
        password_confirmation: formData.get('password_confirmation') as string
    });

    if (!validatedFields.success) return { errors: z.flattenError(validatedFields.error).fieldErrors };

    const { current_password, password } = validatedFields.data;

    const sessionUser = await getUser();
    if (!sessionUser || !sessionUser?.id) return redirect('/');

    const authUser = await prisma.users.findUnique({
        where: {
            id: sessionUser.id
        },
        select: {
            password: true
        }
    });

    if (!authUser || !authUser.password) return redirect('/');

    const isValid = await compare(current_password, authUser.password);

    if (!isValid) return { errors: { current_password: [t('ErrorsPassword')] } };

    if (current_password === password) return { errors: { password: [t('ErrorsCurrentPassword')] } };

    const hashedPassword = await hash(password, 12);

    await prisma.users.update({
        where: {
            id: sessionUser.id,
        },
        data: {
            password: hashedPassword
        }
    });

    revalidatePath('/dashboard/settings/password');

    await regenerateCsrfToken();

    return { message: true };
}