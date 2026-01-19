'use server';

import { regenerateCsrfToken, validateCsrfToken } from '@/_lib/csrf';
import { FormStatePasswordReset, passwordResetSchema } from '@/_lib/definitions';
import prisma from '@/_lib/prisma';
import { hash } from 'bcrypt-ts';
import { getTranslations } from 'next-intl/server';
import z from 'zod';

export async function resetPassword(state: FormStatePasswordReset, formData: FormData): Promise<FormStatePasswordReset> {
    const t = await getTranslations('ResetPasswordPage.ResetPasswordActions');
    const csrfToken = formData.get('csrfToken') as string;
    const isValidCsrf = await validateCsrfToken(csrfToken);

    if (!isValidCsrf) return { warning: t('') };

    const validatedFields = passwordResetSchema.safeParse({
        email: formData.get('email') as string,
        token: formData.get('token') as string,
        password: formData.get('password') as string,
        password_confirmation: formData.get('password_confirmation') as string
    });

    if (!validatedFields.success) return { errors: z.flattenError(validatedFields.error).fieldErrors };

    const { email, token, password } = validatedFields.data;

    const tokenExisting = await prisma.verification_tokens.findUnique({
        where: {
            identifier_token: {
                identifier: email,
                token
            }
        }
    });

    if (!tokenExisting) return { warning: t('ErrorInvalidToken') };

    const hashedPassword = await hash(password, 12);

    await prisma.users.update({
        where: {
            email,
        },
        data: {
            password: hashedPassword
        }
    });

    await prisma.verification_tokens.delete({
        where: {
            identifier_token: {
                identifier: email,
                token
            }
        }
    });

    await regenerateCsrfToken();

    return { message: t('MessageSeccess') };
}