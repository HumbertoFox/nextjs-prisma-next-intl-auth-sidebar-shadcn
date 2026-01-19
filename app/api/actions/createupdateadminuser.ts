'use server';

import { put } from '@vercel/blob';
import { FormStateCreateUpdateAdminUser, getSignUpUpdateSchema } from '@/_lib/definitions';
import * as bcrypt from 'bcrypt-ts';
import z from 'zod';
import sharp from 'sharp';
import { revalidatePath } from 'next/cache';
import { getUser } from '@/_lib/dal';
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

export async function createUpdateAdminUser(state: FormStateCreateUpdateAdminUser, formData: FormData): Promise<FormStateCreateUpdateAdminUser> {
    const t = await getTranslations('AdminsPage.CreateUpdateAdminUserActions');
    const csrfToken = formData.get('csrfToken') as string;
    const isValidCsrf = await validateCsrfToken(csrfToken);

    if (!isValidCsrf) return { message: false };

    const schema = getSignUpUpdateSchema(formData);

    const validatedFields = schema.safeParse({
        name: formData.get('name') as string,
        email: (formData.get('email') as string),
        password: formData.get('password') as string,
        role: formData.get('role') as string,
        password_confirmation: formData.get('password_confirmation') as string
    });

    const id = formData.get('id') as string | undefined;
    const file = formData.get('file') as File | null;

    function revalidatePaths(role: string) {
        if (role === 'ADMIN') {
            revalidatePath('/dashboard/admins');
        } else {
            revalidatePath('/dashboard/admins/users');
        };
    }

    if (!validatedFields.success) return { errors: z.flattenError(validatedFields.error).fieldErrors };

    const {
        name,
        email,
        password,
        role
    } = validatedFields.data;

    const sessionUser = await getUser();
    if (!sessionUser || sessionUser.role !== 'ADMIN') return;

    try {
        const hashedPassword = password ? await bcrypt.hash(password, 12) : undefined;

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

        if (id) {
            const userInDb = await prisma.users.findUnique({
                where: {
                    id
                }
            });

            if (!userInDb || userInDb.deleted_at) return { message: false };

            const existingUser = await prisma.users.findUnique({
                where: {
                    email
                }
            });

            if (existingUser && existingUser.id !== id) return { errors: { email: [t('ErrorEmailInUse')] } };

            const hasChanges =
                userInDb.name !== name ||
                userInDb.email !== email ||
                userInDb.role !== role ||
                (hashedPassword && userInDb.password !== hashedPassword);

            if (!hasChanges) return { message: false };

            const updateUser = await prisma.users.update({
                where: {
                    id
                },
                data: {
                    name,
                    email,
                    role,
                    ...(hashedPassword && { password: hashedPassword }),
                    ...(imageUrl && { image: imageUrl }),
                }
            });

            if (!updateUser) return { message: false };
            revalidatePaths(updateUser.role);

            await regenerateCsrfToken();

            return { message: true };
        } else {
            const existingUser = await prisma.users.findUnique({
                where: {
                    email
                }
            });

            if (existingUser) return { errors: { email: [t('ErrorEmailInUse')] } };

            const newUser = await prisma.users.create({
                data: {
                    name,
                    email,
                    password: hashedPassword!,
                    role,
                    avatar: imageUrl ?? null,
                }
            });

            revalidatePaths(newUser.role);

            await regenerateCsrfToken();

            return { message: true };
        }
    } catch (error) {
        console.error(error);
        return { message: false };
    }
}