import { Head } from '@inertiajs/react';
import {
    ClipboardList,
    Eye,
    Lock,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';
import React from 'react';
import { DynamicForm, type FormField } from '@/components/forms/DynamicForm';
import { Badge } from '@/components/ui/badge';

interface PublicFormProps {
    form: {
        id: number;
        name: string;
        slug: string;
        description?: string | null;
        fields: FormField[];
        submit_button_text: string;
        success_message: string;
        redirect_url?: string | null;
        is_active: boolean;
        team_name?: string | null;
    };
    isEmbed: boolean;
    isPreview: boolean;
}

export default function PublicFormShow({ form, isEmbed, isPreview }: PublicFormProps) {
    const canSubmit = form.is_active || isPreview;

    if (isEmbed) {
        return (
            <>
                <Head title={form.name} />
                <div className="min-h-screen bg-background p-4 sm:p-6">
                    <div className="mx-auto max-w-2xl space-y-5">
                        <div className="space-y-1.5">
                            <h1 className="text-xl font-bold tracking-tight text-foreground">
                                {form.name}
                            </h1>
                            {form.description && (
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {form.description}
                                </p>
                            )}
                        </div>

                        {!canSubmit ? (
                            <div className="rounded-2xl border border-dashed bg-muted/30 p-8 text-center space-y-2">
                                <Lock className="h-7 w-7 mx-auto text-muted-foreground/60" />
                                <p className="text-sm font-medium text-foreground">
                                    This form is currently closed
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    It is not accepting new responses at this time.
                                </p>
                            </div>
                        ) : (
                            <DynamicForm
                                slug={form.slug}
                                fields={form.fields}
                                submitButtonText={form.submit_button_text}
                                successMessage={form.success_message}
                                redirectUrl={form.redirect_url}
                                previewMode={isPreview && !form.is_active}
                                showProgress={form.fields.length >= 4}
                            />
                        )}
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title={form.name} />
            <div className="min-h-screen bg-gradient-to-b from-muted/50 via-background to-background flex flex-col">
                {isPreview && (
                    <div className="bg-primary text-primary-foreground px-4 py-2 text-center text-xs font-medium flex items-center justify-center gap-2">
                        <Eye className="h-3.5 w-3.5" />
                        <span>
                            Team Preview Mode
                            {!form.is_active && ' — This form is currently paused; submissions are simulated.'}
                        </span>
                    </div>
                )}

                <main className="flex-1 flex items-center justify-center px-4 py-10 sm:py-16">
                    <div className="w-full max-w-2xl space-y-6">
                        <div className="rounded-2xl border bg-card shadow-lg shadow-black/[0.03] dark:shadow-black/20 overflow-hidden">
                            {/* Top subtle accent bar */}
                            <div className="h-1.5 w-full bg-gradient-to-r from-primary/80 via-primary to-primary/60" />

                            <div className="p-6 sm:p-10 space-y-8">
                                <div className="space-y-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        {form.team_name && (
                                            <Badge
                                                variant="secondary"
                                                className="gap-1.5 font-medium text-xs px-2.5 py-0.5"
                                            >
                                                <ClipboardList className="h-3 w-3 text-primary" />
                                                {form.team_name}
                                            </Badge>
                                        )}
                                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                                            Protected submission
                                        </span>
                                    </div>

                                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                                        {form.name}
                                    </h1>

                                    {form.description && (
                                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                                            {form.description}
                                        </p>
                                    )}
                                </div>

                                {!canSubmit ? (
                                    <div className="rounded-2xl border border-dashed bg-muted/30 p-10 text-center space-y-3">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                            <Lock className="h-5 w-5" />
                                        </div>
                                        <div className="space-y-1">
                                            <h2 className="text-base font-semibold text-foreground">
                                                This form is not accepting responses
                                            </h2>
                                            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                                                The form owner has paused submissions. Please check back later or contact the workspace team directly.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <DynamicForm
                                        slug={form.slug}
                                        fields={form.fields}
                                        submitButtonText={form.submit_button_text}
                                        successMessage={form.success_message}
                                        redirectUrl={form.redirect_url}
                                        previewMode={isPreview && !form.is_active}
                                        showProgress={form.fields.length >= 4}
                                    />
                                )}
                            </div>
                        </div>

                        <footer className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                            <Sparkles className="h-3.5 w-3.5 text-primary/70" />
                            <span>Powered by</span>
                            <span className="font-semibold text-foreground">FrameX Forms</span>
                        </footer>
                    </div>
                </main>
            </div>
        </>
    );
}
