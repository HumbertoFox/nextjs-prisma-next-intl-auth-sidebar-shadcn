import { getTranslations } from 'next-intl/server';
import { HandleAvatarChangeResult } from './definitions';

export async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>): Promise<HandleAvatarChangeResult> {
    const t = await getTranslations('HandleAvatarChange');
    const file = e.target.files?.[0];
    if (!file) return {
        file: null,
        preview: null,
        error: null
    };

    if (![
        'image/jpeg',
        'image/png',
        'image/webp'
    ].includes(file.type)) {
        return {
            file: null,
            preview: null,
            error: t('FormatsAvatarAllowedError')
        };
    }

    if (file.size > 512 * 1024) {
        return {
            file: null,
            preview: null,
            error: t('MaxSizeAvatarError')
        };
    }

    try {
        const imageBitmap = await createImageBitmap(file);
        const { width, height } = imageBitmap;

        if (width > 512 || height > 512) {
            return {
                file: null,
                preview: null,
                error: t('MaxDimensionError', { Width: width, Height: height }),
            };
        }
    } catch {
        return {
            file: null,
            preview: null,
            error: t('TryErrorReturn')
        };
    }

    return {
        file,
        preview: URL.createObjectURL(file),
        error: null
    };
}