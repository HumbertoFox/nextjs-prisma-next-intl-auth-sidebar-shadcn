'use server';

import { put } from '@vercel/blob';
import { createAdminSchema, FormStateCreateAdmin } from '@/_lib/definitions';
import { createSession } from '@/_lib/session';
import * as bcrypt from 'bcrypt-ts';
import z from 'zod';
import sharp from 'sharp';
import { regenerateCsrfToken, validateCsrfToken } from '@/_lib/csrf';
import prisma from '@/_lib/prisma';
import { getTranslations } from 'next-intl/server';

const MAX_FILE_SIZE = 512 * 1024;
const MAX_DIMENSION = 512;
const ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp'
];

export async function createAdmin(state: FormStateCreateAdmin, formData: FormData): Promise<FormStateCreateAdmin> {
    const t = await getTranslations('RegisterPage.CreateAdminActions');
    const csrfToken = formData.get('csrfToken') as string;
    const isValidCsrf = await validateCsrfToken(csrfToken);

    if (!isValidCsrf) return { warning: t('IsValidCsrfWarning') };

    const validatedFields = createAdminSchema.safeParse({
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        password_confirmation: formData.get('password_confirmation') as string
    });

    const file = formData.get('file') as File | null;

    if (!validatedFields.success) return { errors: z.flattenError(validatedFields.error).fieldErrors };

    const {
        name,
        email,
        password
    } = validatedFields.data;

    try {
        const existingUser = await prisma.users.findUnique({
            where: {
                email
            }
        });
        if (existingUser) return { warning: t('ExistingUserWarning') };

        const adminExists = await prisma.users.count({
            where: {
                role: 'ADMIN'
            }
        });
        const hasAdmin = adminExists > 0;

        const role = hasAdmin ? 'USER' : 'ADMIN';

        const hashedPassword = await bcrypt.hash(password, 12);

        let imageUrl: string | undefined;

        if (file && file.size > 0) {
            if (!ALLOWED_TYPES.includes(file.type)) return { errors: { avatar: [t('FormatsAvatarAllowedError')] } };

            if (file.size > MAX_FILE_SIZE) return { errors: { avatar: [t('MaxSizeAvatarError')] } };

            try {
                const buffer = Buffer.from(await file.arrayBuffer());
                const metadata = await sharp(buffer).metadata();
                const { width, height } = metadata;
                if (width > MAX_DIMENSION || height > MAX_DIMENSION) return { errors: { avatar: [t('MaxDimensionError', { Width: width, Height: height })] } };
            } catch {
                return { errors: { avatar: [t('TryErrorReturn')] } };
            }

            const uniqueFileName = `${crypto.randomUUID()}-${file.name}`;
            const blob = await put(`avatars/${uniqueFileName}`, file, {
                access: 'public',
            });

            imageUrl = blob.url;
        }

        const user = await prisma.users.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                avatar: imageUrl,
            }
        });

        await createSession(user.id, user.role);

        await regenerateCsrfToken();

        return { message: true };
    } catch (error) {
        console.error(error);
        return { warning: t('ErrorDataBaseReturn') };
    }
}