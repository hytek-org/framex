import { Link } from '@inertiajs/react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center bg-background p-6 md:p-10">
            {/* Subtle enterprise ambient grid */}
            <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-64 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

            {/* Top bar */}
            <div className="absolute inset-x-0 top-0 flex items-center justify-between px-6 py-5 md:px-10">
                <Link
                    href={home()}
                    className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to home
                </Link>
                <div className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:inline-flex">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Protected by FrameX Security</span>
                </div>
            </div>

            <div className="w-full max-w-md">
                <div className="rounded-2xl border border-border/60 bg-card/95 p-7 shadow-sm backdrop-blur-sm sm:p-8">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col items-center gap-4">
                            <Link
                                href={home()}
                                className="flex items-center gap-2.5 font-medium transition-opacity hover:opacity-80"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-background shadow-xs">
                                    <AppLogoIcon className="size-6 fill-current text-foreground" />
                                </div>
                                <span className="text-lg font-semibold tracking-tight text-foreground">
                                    FrameX
                                </span>
                            </Link>

                            <div className="space-y-1.5 text-center">
                                <h1 className="text-xl font-semibold tracking-tight text-foreground">
                                    {title}
                                </h1>
                                {description && (
                                    <p className="text-center text-sm leading-relaxed text-muted-foreground">
                                        {description}
                                    </p>
                                )}
                            </div>
                        </div>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
