'use server';

import { regenerateCsrfToken, validateCsrfToken } from '@/_lib/csrf';
import { FormStateEmailVerification } from '@/_lib/definitions';
import { sendEmailVerification } from '@/_lib/mail';
import prisma from '@/_lib/prisma';
import crypto from 'crypto';
import { getTranslations } from 'next-intl/server';

export async function handleEmailVerification(state: FormStateEmailVerification | undefined, formData: FormData) {
    const t = await getTranslations('VerifyEmailPage.HandleEmailVerificationActions');
    const csrfToken = formData.get('csrfToken') as string;
    const isValidCsrf = await validateCsrfToken(csrfToken);

    if (!isValidCsrf) return { error: t('ErrorIsValidCsrf') };

    const email = formData.get('email') as string;
    const token = formData.get('token') as string;

    if (!email && !token) return { error: t('ErrorNotAuthenticated') };

    const isCheckedUserEmail = await prisma.users.findUnique({
        where: {
            email
        }
    });

    if (isCheckedUserEmail?.email_verified) return { error: t('ErrorEmailVerified') };

    const tokenExisting = await prisma.verification_tokens.findFirst({
        where: {
            identifier: email
        }
    });

    if (!tokenExisting) return { error: t('ErrorInvalidToken') };

    if (tokenExisting && new Date() > tokenExisting.expires_at) {

        await prisma.verification_tokens.delete({
            where: {
                identifier_token: {
                    identifier: email,
                    token: tokenExisting.token
                }
            }
        });

        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        const verifyLink = `${process.env.NEXT_URL}/verify-email?token=${token}&email=${email}`;
        const response = await sendEmailVerification(email, verifyLink);

        if (!response.ok) {
            console.error("Error sending verification email:", response.error);
            return { error: t('ErrorSendingEmail') };
        }

        await prisma.verification_tokens.create({
            data: {
                identifier: email,
                token,
                expires_at: expires
            }
        });

        return { status: 'verification-link-sent' };
    }

    await prisma.verification_tokens.delete({
        where: {
            identifier_token: {
                identifier: email,
                token
            }
        }
    });

    await regenerateCsrfToken();

    return { success: t('MessageSuccess') };
}