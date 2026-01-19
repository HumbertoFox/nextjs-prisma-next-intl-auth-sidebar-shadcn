'use client';

import { InputError } from '@/_components/input-error';
import { Transition } from '@headlessui/react';
import { startTransition, useActionState, useEffect, useRef, useState } from 'react';
import { Button } from '@/_components/ui/button';
import { Input } from '@/_components/ui/input';
import { Label } from '@/_components/ui/label';
import { Eye, EyeClosed } from 'lucide-react';
import { updatePassword } from '@/app/api/actions/updatepassword';
import { csrfTokenProps } from '@/_types';
import { useTranslations } from 'next-intl';

export default function PasswordPageClient({
    csrfToken
}: csrfTokenProps) {
    const t = useTranslations('PasswordPage.PasswordPageClient');
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const [state, action, pending] = useActionState(updatePassword, undefined);
    const [showOldPassword, setShowOldPassword] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState<boolean>(false);
    const [recentlySuccessful, setrecentlySuccessful] = useState<boolean>(false);
    const [data, setData] = useState({
        current_password: '',
        password: '',
        password_confirmation: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setData({ ...data, [id]: value });
    };
    const toggleShowOldPassword = () => setShowOldPassword(!showOldPassword);
    const toggleShowPassword = () => setShowPassword(!showPassword);
    const toggleShowPasswordConfirm = () => setShowPasswordConfirm(!showPasswordConfirm);
    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        if (csrfToken) formData.append('csrfToken', csrfToken);
        startTransition(() => action(formData));
    };

    useEffect(() => {
        if (!state?.message) return;

        startTransition(() => setrecentlySuccessful(true));

        const timeout = setTimeout(() => {
            setrecentlySuccessful(false);
            setData({
                current_password: '',
                password: '',
                password_confirmation: ''
            });
            currentPasswordInput.current?.focus();
        }, 1000);

        return () => clearTimeout(timeout);
    }, [state?.message]);
    return (
        <>
            <div className="space-y-6">
                <div className="mb-8 my-1 space-y-0.5">
                    <h2 className="text-xl font-semibold tracking-tight">{t('Titleh2')}</h2>
                    <p className="text-muted-foreground text-sm">{t('ParagrafText')}</p>
                </div>
                <form
                    onSubmit={submit}
                    className="space-y-6"
                >
                    <div className="grid gap-2">
                        <Label htmlFor="current_password">{t('LabelCurrentPassword')}</Label>
                        <div className="relative">
                            <Input
                                id="current_password"
                                name="current_password"
                                tabIndex={1}
                                ref={currentPasswordInput}
                                value={data.current_password}
                                onChange={handleChange}
                                type={showOldPassword ? "text" : "password"}
                                autoComplete="current-password"
                                placeholder={t('PlaceholderCurrentPassword')}
                                required
                                className="block w-full"
                            />
                            <button
                                type="button"
                                title={showOldPassword ? t('ButtonTitlePasswordHide') : t('ButtonTitlePasswordShow')}
                                onClick={toggleShowOldPassword}
                                className="btn-icon-toggle"
                            >
                                {showOldPassword ? <Eye /> : <EyeClosed />}
                            </button>
                        </div>
                        {state?.errors?.current_password?.[0] && <InputError message={state.errors.current_password[0]} />}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">{t('LabelNewPassword')}</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                name="password"
                                tabIndex={2}
                                ref={passwordInput}
                                value={data.password}
                                onChange={handleChange}
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                placeholder={t('PlaceholderNewPassword')}
                                required
                                className="block w-full"
                            />
                            <button
                                type="button"
                                title={showPassword ? t('ButtonTitlePasswordHide') : t('ButtonTitlePasswordShow')}
                                onClick={toggleShowPassword}
                                className="btn-icon-toggle"
                            >
                                {showPassword ? <Eye /> : <EyeClosed />}
                            </button>
                        </div>
                        {state?.errors?.password?.[0] && <InputError message={state.errors.password[0]} />}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">{t('LabelConfirmNewPassword')}</Label>
                        <div className="relative">
                            <Input
                                id="password_confirmation"
                                name="password_confirmation"
                                tabIndex={3}
                                value={data.password_confirmation}
                                onChange={handleChange}
                                type={showPasswordConfirm ? "text" : "password"}
                                autoComplete="new-password"
                                placeholder={t('PlaceholderConfirmNewPassword')}
                                required
                                className="block w-full"
                            />
                            <button
                                type="button"
                                title={showPasswordConfirm ? t('ButtonTitlePasswordHide') : t('ButtonTitlePasswordShow')}
                                onClick={toggleShowPasswordConfirm}
                                className="btn-icon-toggle"
                            >
                                {showPasswordConfirm ? <Eye /> : <EyeClosed />}
                            </button>
                        </div>
                        {state?.errors?.password_confirmation?.[0] && <InputError message={state.errors.password_confirmation[0]} />}
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            type="submit"
                            tabIndex={4}
                            disabled={pending}
                        >
                            {t('ButtonSubmit')}
                        </Button>

                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-in-out"
                            enterFrom="opacity-0"
                            leave="transition ease-in-out"
                            leaveTo="opacity-0"
                        >
                            <p className="text-sm text-neutral-600">{t('ParagrafSaved')}</p>
                        </Transition>
                    </div>
                </form>
            </div>
        </>
    );
}
