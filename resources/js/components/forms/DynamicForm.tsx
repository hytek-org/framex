import {
    AlertCircle,
    CheckCircle2,
    ExternalLink,
    Loader2,
    RotateCcw,
    Send,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export type FormFieldType =
    | 'text'
    | 'email'
    | 'textarea'
    | 'number'
    | 'tel'
    | 'url'
    | 'date'
    | 'select'
    | 'radio'
    | 'checkbox'
    | 'checkbox_group';

export interface FormField {
    name: string;
    label: string;
    type: FormFieldType | string;
    placeholder?: string;
    help_text?: string;
    required?: boolean;
    width?: 'full' | 'half';
    options?: string[];
}

export interface DynamicFormProps {
    slug: string;
    fields: FormField[];
    submitButtonText?: string;
    successMessage?: string;
    redirectUrl?: string | null;
    className?: string;
    previewMode?: boolean;
    showProgress?: boolean;
    onSuccess?: (submissionId: number) => void;
}

function getCsrfHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    const metaToken = (
        document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null
    )?.content;

    if (metaToken) {
        headers['X-CSRF-TOKEN'] = metaToken;
    }

    const xsrfCookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];

    if (xsrfCookie) {
        headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfCookie);
    }

    return headers;
}

export function DynamicForm({
    slug,
    fields,
    submitButtonText = 'Submit',
    successMessage = 'Thank you! Your submission has been received.',
    redirectUrl = null,
    className = '',
    previewMode = false,
    showProgress = false,
    onSuccess,
}: DynamicFormProps) {
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submissionId, setSubmissionId] = useState<number | null>(null);
    const [serverMessage, setServerMessage] = useState<string>(successMessage);
    const [resolvedRedirect, setResolvedRedirect] = useState<string | null>(redirectUrl);

    useEffect(() => {
        setServerMessage(successMessage);
    }, [successMessage]);

    useEffect(() => {
        setResolvedRedirect(redirectUrl);
    }, [redirectUrl]);

    const requiredStats = useMemo(() => {
        const requiredFields = fields.filter((f) => f.required);
        if (requiredFields.length === 0) {
            return { total: 0, completed: 0, percent: 100 };
        }

        const completed = requiredFields.filter((f) => {
            const val = formData[f.name];
            if (f.type === 'checkbox') {
                return val === true;
            }
            if (f.type === 'checkbox_group') {
                return Array.isArray(val) && val.length > 0;
            }
            return val !== undefined && val !== null && String(val).trim() !== '';
        }).length;

        return {
            total: requiredFields.length,
            completed,
            percent: Math.round((completed / requiredFields.length) * 100),
        };
    }, [fields, formData]);

    const handleChange = (name: string, value: any) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name] || errors.form) {
            setErrors((prev) => {
                const updated = { ...prev };
                delete updated[name];
                delete updated.form;
                return updated;
            });
        }
    };

    const handleCheckboxGroupToggle = (name: string, option: string, checked: boolean) => {
        const current = Array.isArray(formData[name]) ? (formData[name] as string[]) : [];
        const next = checked
            ? [...current, option]
            : current.filter((item) => item !== option);
        handleChange(name, next);
    };

    const handleReset = () => {
        setFormData({});
        setErrors({});
        setSubmitted(false);
        setSubmissionId(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        // Client-side validation for checkbox_group required fields
        const clientErrors: Record<string, string> = {};
        for (const field of fields) {
            if (field.required) {
                const val = formData[field.name];
                if (field.type === 'checkbox_group' && (!Array.isArray(val) || val.length === 0)) {
                    clientErrors[field.name] = `Please select at least one option for ${field.label}.`;
                } else if (field.type === 'checkbox' && val !== true) {
                    clientErrors[field.name] = `${field.label} must be accepted.`;
                } else if (field.type === 'radio' && (!val || String(val).trim() === '')) {
                    clientErrors[field.name] = `Please select an option for ${field.label}.`;
                }
            }
        }

        if (Object.keys(clientErrors).length > 0) {
            setErrors(clientErrors);
            return;
        }

        if (previewMode) {
            setSubmitted(true);
            setSubmissionId(1001);
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`/forms/${slug}/submit`, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    ...getCsrfHeaders(),
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                if (data.errors) {
                    const formattedErrors: Record<string, string> = {};
                    Object.keys(data.errors).forEach((key) => {
                        const baseKey = key.split('.')[0];
                        if (!formattedErrors[baseKey]) {
                            formattedErrors[baseKey] = data.errors[key][0];
                        }
                    });
                    setErrors(formattedErrors);
                } else {
                    setErrors({
                        form:
                            data.message ||
                            'Submission failed. Please check your inputs and try again.',
                    });
                }
                return;
            }

            setSubmitted(true);
            if (data.message) {
                setServerMessage(data.message);
            }
            if (data.submission_id) {
                setSubmissionId(data.submission_id);
                onSuccess?.(data.submission_id);
            }

            const targetRedirect = data.redirect_url || redirectUrl;
            if (targetRedirect) {
                setResolvedRedirect(targetRedirect);
                window.setTimeout(() => {
                    window.location.href = targetRedirect;
                }, 1800);
            }
        } catch {
            setErrors({ form: 'Network error. Please check your connection and try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div
                className={`rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/30 p-8 text-center space-y-4 ${className}`}
            >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="space-y-1.5">
                    <h3 className="text-lg font-semibold text-foreground">
                        {previewMode ? 'Preview Submitted' : 'Response Recorded'}
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        {serverMessage}
                    </p>
                </div>

                {submissionId && (
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 dark:border-emerald-800 bg-background/80 px-3 py-1 text-xs font-mono text-muted-foreground">
                        Reference #{submissionId}
                        {previewMode && ' (Simulated)'}
                    </div>
                )}

                {resolvedRedirect && !previewMode && (
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Redirecting you shortly...
                        <a
                            href={resolvedRedirect}
                            className="inline-flex items-center gap-1 text-primary underline ml-1"
                        >
                            Continue now
                            <ExternalLink className="h-3 w-3" />
                        </a>
                    </p>
                )}

                {(!resolvedRedirect || previewMode) && (
                    <div className="pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleReset}
                            className="gap-1.5"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            {previewMode ? 'Reset Preview' : 'Submit Another Response'}
                        </Button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className={`space-y-5 ${className}`} noValidate={previewMode}>
            {/* Honeypot field for bot deterrence */}
            <input
                type="text"
                name="_gotcha"
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={formData._gotcha || ''}
                onChange={(e) => handleChange('_gotcha', e.target.value)}
            />

            {showProgress && requiredStats.total > 0 && (
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Completion progress</span>
                        <span className="font-mono font-medium text-foreground">
                            {requiredStats.completed} / {requiredStats.total} required
                        </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                            className="h-full rounded-full bg-primary transition-all duration-300"
                            style={{ width: `${requiredStats.percent}%` }}
                        />
                    </div>
                </div>
            )}

            {errors.form && (
                <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{errors.form}</span>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fields.map((field) => {
                    const colSpan = field.width === 'half' ? 'sm:col-span-1' : 'sm:col-span-2';
                    const fieldId = `field-${slug}-${field.name}`;
                    const options = (field.options || []).filter((o) => o.trim() !== '');
                    const fieldError = errors[field.name];

                    return (
                        <div key={field.name} className={`${colSpan} space-y-1.5`}>
                            {field.type !== 'checkbox' && (
                                <Label
                                    htmlFor={fieldId}
                                    className="text-sm font-medium text-foreground flex items-center gap-1"
                                >
                                    <span>{field.label}</span>
                                    {field.required && (
                                        <span className="text-destructive" aria-hidden="true">
                                            *
                                        </span>
                                    )}
                                </Label>
                            )}

                            {field.type === 'textarea' ? (
                                <Textarea
                                    id={fieldId}
                                    name={field.name}
                                    placeholder={field.placeholder}
                                    required={field.required}
                                    rows={4}
                                    value={formData[field.name] ?? ''}
                                    onChange={(e) => handleChange(field.name, e.target.value)}
                                    aria-invalid={!!fieldError}
                                    className="resize-y min-h-[100px]"
                                />
                            ) : field.type === 'select' ? (
                                <select
                                    id={fieldId}
                                    name={field.name}
                                    required={field.required}
                                    value={formData[field.name] ?? ''}
                                    onChange={(e) => handleChange(field.name, e.target.value)}
                                    aria-invalid={!!fieldError}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="">
                                        {field.placeholder || `Select ${field.label.toLowerCase()}...`}
                                    </option>
                                    {options.map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                            ) : field.type === 'radio' ? (
                                <div className="space-y-2 pt-1">
                                    {options.length === 0 ? (
                                        <p className="text-xs text-muted-foreground italic">
                                            No options configured.
                                        </p>
                                    ) : (
                                        options.map((opt, idx) => {
                                            const optId = `${fieldId}-opt-${idx}`;
                                            const isChecked = formData[field.name] === opt;
                                            return (
                                                <label
                                                    key={opt}
                                                    htmlFor={optId}
                                                    className={`flex items-center gap-3 rounded-lg border px-3.5 py-2.5 text-sm cursor-pointer transition-colors ${
                                                        isChecked
                                                            ? 'border-primary bg-primary/5 text-foreground'
                                                            : 'border-input hover:bg-muted/50 text-foreground'
                                                    }`}
                                                >
                                                    <input
                                                        id={optId}
                                                        type="radio"
                                                        name={field.name}
                                                        value={opt}
                                                        checked={isChecked}
                                                        onChange={() => handleChange(field.name, opt)}
                                                        className="h-4 w-4 border-border text-primary focus:ring-primary"
                                                    />
                                                    <span>{opt}</span>
                                                </label>
                                            );
                                        })
                                    )}
                                </div>
                            ) : field.type === 'checkbox_group' ? (
                                <div className="space-y-2 pt-1">
                                    {options.length === 0 ? (
                                        <p className="text-xs text-muted-foreground italic">
                                            No options configured.
                                        </p>
                                    ) : (
                                        options.map((opt, idx) => {
                                            const optId = `${fieldId}-chk-${idx}`;
                                            const selectedList = Array.isArray(formData[field.name])
                                                ? (formData[field.name] as string[])
                                                : [];
                                            const isChecked = selectedList.includes(opt);
                                            return (
                                                <label
                                                    key={opt}
                                                    htmlFor={optId}
                                                    className={`flex items-center gap-3 rounded-lg border px-3.5 py-2.5 text-sm cursor-pointer transition-colors ${
                                                        isChecked
                                                            ? 'border-primary bg-primary/5 text-foreground'
                                                            : 'border-input hover:bg-muted/50 text-foreground'
                                                    }`}
                                                >
                                                    <input
                                                        id={optId}
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={(e) =>
                                                            handleCheckboxGroupToggle(
                                                                field.name,
                                                                opt,
                                                                e.target.checked,
                                                            )
                                                        }
                                                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                                                    />
                                                    <span>{opt}</span>
                                                </label>
                                            );
                                        })
                                    )}
                                </div>
                            ) : field.type === 'checkbox' ? (
                                <label
                                    htmlFor={fieldId}
                                    className={`flex items-start gap-3 rounded-lg border p-3.5 cursor-pointer transition-colors ${
                                        formData[field.name]
                                            ? 'border-primary bg-primary/5'
                                            : 'border-input hover:bg-muted/40'
                                    }`}
                                >
                                    <input
                                        id={fieldId}
                                        type="checkbox"
                                        name={field.name}
                                        required={field.required}
                                        checked={!!formData[field.name]}
                                        onChange={(e) => handleChange(field.name, e.target.checked)}
                                        className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm leading-snug text-foreground">
                                        <span className="font-medium">{field.label}</span>
                                        {field.required && (
                                            <span className="text-destructive ml-1">*</span>
                                        )}
                                        {field.placeholder && (
                                            <span className="block text-xs text-muted-foreground mt-0.5">
                                                {field.placeholder}
                                            </span>
                                        )}
                                    </span>
                                </label>
                            ) : (
                                <Input
                                    id={fieldId}
                                    type={
                                        ['email', 'number', 'tel', 'url', 'date'].includes(field.type)
                                            ? field.type
                                            : 'text'
                                    }
                                    name={field.name}
                                    placeholder={field.placeholder}
                                    required={field.required}
                                    value={formData[field.name] ?? ''}
                                    onChange={(e) => handleChange(field.name, e.target.value)}
                                    aria-invalid={!!fieldError}
                                    className="h-10"
                                />
                            )}

                            {field.help_text && !fieldError && (
                                <p className="text-xs text-muted-foreground">{field.help_text}</p>
                            )}

                            {fieldError && (
                                <p className="text-xs text-destructive flex items-center gap-1">
                                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                    {fieldError}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="pt-2">
                <Button
                    type="submit"
                    disabled={isSubmitting || fields.length === 0}
                    size="lg"
                    className="w-full gap-2 font-medium"
                >
                    {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Send className="h-4 w-4" />
                    )}
                    {isSubmitting ? 'Submitting...' : submitButtonText}
                </Button>
            </div>
        </form>
    );
}
