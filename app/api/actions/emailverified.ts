'use server';

import { getUser } from '@/_lib/dal';
import { sendEmailVerification } from '@/_lib/mail';
import prisma from '@/_lib/prisma';
import crypto from 'crypto';

export async function emailVerifiedChecked() {
    const sessionUser = await getUser();
    if (!sessionUser || !sessionUser?.email) return null;

    const email = sessionUser.email;

    const tokenExisting = await prisma.verification_tokens.findFirst({
        where: {
            identifier: email
        }
    });

    const user = await prisma.users.findUnique({
        where: {
            email
        }
    });

    if (user?.email_verified) return null;

    if (tokenExisting && new Date() > tokenExisting.expires_at) return 'verification-link-sent';

    if (!tokenExisting) {
        const token = crypto.randomBytes(32).toString('hex');

        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await prisma.verification_tokens.create({
            data: {
                identifier: email,
                token,
                expires_at: expires
            }
        });

        const verifyLink = `${process.env.NEXT_URL}/verify-email?token=${token}&email=${email}`;
        await sendEmailVerification(email, verifyLink);

        return 'verification-link-sent';
    }

    return 'verification-link-sent';
}