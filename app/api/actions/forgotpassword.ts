'use server';

import { sendPasswordResetEmail } from '@/_lib/mail';
import { FormStatePasswordForgot, passwordForgotSchema } from '@/_lib/definitions';
import crypto from 'crypto';
import z from 'zod';
import { regenerateCsrfToken, validateCsrfToken } from '@/_lib/csrf';
import prisma from '@/_lib/prisma';
import { getTranslations } from 'next-intl/server';

export async function forgotPassword(state: FormStatePasswordForgot, formData: FormData): Promise<FormStatePasswordForgot> {
    const t = await getTranslations('ForgotPasswordPage.ForgotPasswordActions');
    const csrfToken = formData.get('csrfToken') as string;
    const isValidCsrf = await validateCsrfToken(csrfToken);

    if (!isValidCsrf) return { error: t('ErrorIsValidCsrf') };

    const validatedFields = passwordForgotSchema.safeParse({ email: formData.get('email') as string });

    if (!validatedFields.success) return { errors: z.flattenError(validatedFields.error).fieldErrors };

    const { email } = validatedFields.data;

    const user = await prisma.users.findUnique({
        where: {
            email
        }
    });

    const genericMessage = {
        message: t('MessegeLinkSend')
    };

    if (!user) return genericMessage;

    const tokenExisting = await prisma.verification_tokens.findFirst({
        where: {
            identifier: email
        }
    });

    if (!tokenExisting) {
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 60 * 60 * 1000);

        const resetLink = `${process.env.NEXT_URL}/reset-password?token=${token}&email=${email}`;
        const response = await sendPasswordResetEmail(email, resetLink);

        if (!response.ok) {
            console.error("Error sending verification email:", response.error);
            return { error: 'email-send-error' };
        }

        await prisma.verification_tokens.delete({
            where: {
                identifier_token: {
                    identifier: email,
                    token: tokenExisting!.token
                }
            }
        });

        await prisma.verification_tokens.create({
            data: {
                identifier: email,
                token,
                expires_at: expires
            }
        });

        await regenerateCsrfToken();

        return genericMessage;
    }

    await regenerateCsrfToken();

    return genericMessage;
}