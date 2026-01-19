import { getTranslations } from 'next-intl/server';
import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    }
})

export const sendPasswordResetEmail = async (to: string, resetLink: string) => {
    const t = await getTranslations('ResetPasswordPage.SendPasswordResetEmail');
    try {
        const result = await transporter.sendMail({
            from: `'nextjs-starter-kit' <${process.env.SMTP_USER}>`,
            to,
            subject: t('SubJect'),
            html: `
                <p>${t('TextRequestedPassword')}</p>
                <p>${t('TextLinkCreatedPassword')}</p>
                <a href='${resetLink}'>${resetLink}</a>
                <p>${t('TextRequestIgnoreEmail')}</p>
            `,
        });
        return { ok: true, result };

    } catch (error) {
        return { ok: false, error };
    };
}

export const sendEmailVerification = async (to: string, link: string) => {
    const t = await getTranslations('VerifyEmailPage.SendEmailVerification');
    try {
        const result = await transporter.sendMail({
            from: `'nextjs-starter-kit' <${process.env.SMTP_USER}>`,
            to,
            subject: t('SubJect'),
            html: `
                <h2>${t('Title')}</h2>
                <p>${t('TextRequestedEmail')}</p>
                <a href='${link}'>${link}</a>
                <p>${t('TextRequestIgnoreEmail')}</p>
            `,
        });
        return { ok: true, result };
    } catch (error) {
        return { ok: false, error };
    };
}