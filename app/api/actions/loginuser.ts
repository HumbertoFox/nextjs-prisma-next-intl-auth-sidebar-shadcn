'use server';

import { FormStateLoginUser, signInSchema } from '@/_lib/definitions';
import { compare } from 'bcrypt-ts';
import { createSession } from '@/_lib/session';
import z from 'zod';
import { regenerateCsrfToken, validateCsrfToken } from '@/_lib/csrf';
import prisma from '@/_lib/prisma';
import { getTranslations } from 'next-intl/server';

export async function loginUser(state: FormStateLoginUser, formData: FormData): Promise<FormStateLoginUser> {
    const t = await getTranslations('LoginPage.LoginUserActions');
    const csrfToken = formData.get('csrfToken') as string;
    const isValidCsrf = await validateCsrfToken(csrfToken);

    if (!isValidCsrf) return { warning: t('ErrorIsValidCsrf') };

    const validatedFields = signInSchema.safeParse({
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    });

    if (!validatedFields.success) return { errors: z.flattenError(validatedFields.error).fieldErrors };

    const { email, password } = validatedFields.data;

    try {
        const user = await prisma.users.findUnique({
            where: {
                email
            }
        });

        if (!user || !user.password) return { warning: t('ErrorWarning') };

        const isPasswordValid = await compare(password, user.password);

        if (!isPasswordValid) return { warning: t('ErrorWarning') };

        await createSession(user.id, user.role);

        await regenerateCsrfToken();

        return { message: t('MessageSuccess') };
    } catch (error) {
        console.error('Unknown error occurred:', error);
        return { warning: t('ErrorDataBaseConected') };
    };
}