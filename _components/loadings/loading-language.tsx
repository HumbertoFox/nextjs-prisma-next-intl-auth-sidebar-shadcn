'use client';

import { Skeleton } from '@/_components/ui/skeleton';

export default function LoadingLanguage() {
    return (
        <div className="space-y-6">
            <div className="mb-8 my-1 space-y-0.5">
                <Skeleton className="w-44 h-7" />
                <Skeleton className="w-64 h-5" />
            </div>
            <div className="flex gap-4">
                <Skeleton className="w-16 h-10" />
                <Skeleton className="w-16 h-10" />
            </div>
        </div>
    );
}