'use client';

import { startTransition, useActionState, useEffect, useRef, useState } from 'react';
import { Button } from '@/_components/ui/button';
import { Input } from '@/_components/ui/input';
import { Label } from '@/_components/ui/label';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/_components/ui/dialog';
import { Eye, EyeClosed } from 'lucide-react';
import { deleteUser } from '@/app/api/actions/deleteuser';
import { useRouter } from 'next/navigation';
import { InputError } from '@/_components/input-error';
import { csrfTokenProps } from '@/_types';
import { useTranslations } from 'next-intl';

export default function DeleteUser({
    csrfToken
}: csrfTokenProps) {
    const t = useTranslations('ProfilePage.DeleteUser');
    const router = useRouter();
    const passwordInput = useRef<HTMLInputElement>(null);
    const [state, action, pending] = useActionState(deleteUser, undefined);
    const [showPassword, setshowPassword] = useState<boolean>(false);
    const [data, setData] = useState<{ password: string }>({ password: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setData({ ...data, [id]: value });
    };
    const toggleShowPassword = () => setshowPassword(!showPassword);

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('password', data.password);
        if (csrfToken) formData.append('csrfToken', csrfToken);
        startTransition(() => action(formData));
    };
    const handleClose = () => setData({ password: '' });

    useEffect(() => {
        if (state?.message) {
            router.push('/logout');
        };
    }, [state?.message, router]);
    return (
        <div className="space-y-6">
            <div className="space-y-4 rounded-lg border border-red-100 bg-red-50 p-4 dark:border-red-200/10 dark:bg-red-700/10">
                <div className="relative space-y-0.5 text-red-600 dark:text-red-100">
                    <p className="font-medium">{t('ParagrafNoticeOne')}</p>
                    <p className="text-sm">{t('ParagrafNoticeTwo')}</p>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="destructive">{t('DialogTrigger')}</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle>{t('DialogTitle')}</DialogTitle>
                        <DialogDescription>{t('DialogDescription')}</DialogDescription>
                        <form
                            className="space-y-6"
                            onSubmit={submit}
                        >
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="password"
                                    className="sr-only"
                                >
                                    {t('LabelPassword')}
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        ref={passwordInput}
                                        value={data.password}
                                        onChange={handleChange}
                                        placeholder={t('PlaceholderPassword')}
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

                            <DialogFooter className="gap-2">
                                <DialogClose asChild>
                                    <Button
                                        variant="secondary"
                                        onClick={handleClose}
                                    >
                                        {t('DialogClose')}
                                    </Button>
                                </DialogClose>

                                <Button
                                    type="submit"
                                    variant="destructive"
                                    disabled={pending}
                                    aria-busy={pending}
                                >
                                    {t('ButtonSubmitDelete')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}