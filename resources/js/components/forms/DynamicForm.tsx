import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Loader2, Send } from 'lucide-react';

export interface FormField {
    name: string;
    label: string;
    type: 'text' | 'email' | 'textarea' | 'number' | 'url' | 'checkbox' | string;
    placeholder?: string;
    required?: boolean;
}

export interface DynamicFormProps {
    slug: string;
    fields: FormField[];
    submitButtonText?: string;
    successMessage?: string;
    className?: string;
    onSuccess?: (submissionId: number) => void;
}

export function DynamicForm({
    slug,
    fields,
    submitButtonText = 'Submit',
    successMessage = 'Thank you! Your submission has been received.',
    className = '',
    onSuccess,
}: DynamicFormProps) {
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (name: string, value: any) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => {
                const updated = { ...prev };
                delete updated[name];
                return updated;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';

            const response = await fetch(`/forms/${slug}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.errors) {
                    const formattedErrors: Record<string, string> = {};
                    Object.keys(data.errors).forEach((key) => {
                        formattedErrors[key] = data.errors[key][0];
                    });
                    setErrors(formattedErrors);
                } else {
                    setErrors({ form: data.message || 'Submission failed. Please check your inputs.' });
                }
                return;
            }

            setSubmitted(true);
            if (onSuccess && data.submission_id) {
                onSuccess(data.submission_id);
            }
        } catch (err) {
            setErrors({ form: 'Network error. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className={`p-6 rounded-2xl border bg-emerald-50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-100 flex items-center gap-3 ${className}`}>
                <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <p className="text-sm font-medium">{successMessage}</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
            {/* Honeypot field for bot deterrence */}
            <input
                type="text"
                name="_gotcha"
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
                onChange={(e) => handleChange('_gotcha', e.target.value)}
            />

            {errors.form && (
                <div className="p-3 text-xs rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
                    {errors.form}
                </div>
            )}

            {fields.map((field) => (
                <div key={field.name} className="space-y-1.5">
                    <Label htmlFor={`field-${field.name}`} className="text-xs font-semibold">
                        {field.label}
                        {field.required && <span className="text-destructive ml-1">*</span>}
                    </Label>

                    {field.type === 'textarea' ? (
                        <textarea
                            id={`field-${field.name}`}
                            name={field.name}
                            placeholder={field.placeholder}
                            required={field.required}
                            rows={4}
                            value={formData[field.name] || ''}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                    ) : field.type === 'checkbox' ? (
                        <div className="flex items-center gap-2">
                            <input
                                id={`field-${field.name}`}
                                type="checkbox"
                                name={field.name}
                                required={field.required}
                                checked={!!formData[field.name]}
                                onChange={(e) => handleChange(field.name, e.target.checked)}
                                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                            />
                            <span className="text-xs text-muted-foreground">{field.placeholder || field.label}</span>
                        </div>
                    ) : (
                        <Input
                            id={`field-${field.name}`}
                            type={field.type}
                            name={field.name}
                            placeholder={field.placeholder}
                            required={field.required}
                            value={formData[field.name] || ''}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                        />
                    )}

                    {errors[field.name] && (
                        <p className="text-[11px] text-destructive">{errors[field.name]}</p>
                    )}
                </div>
            ))}

            <Button type="submit" disabled={isSubmitting} className="w-full gap-2">
                {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Send className="h-4 w-4" />
                )}
                {submitButtonText}
            </Button>
        </form>
    );
}
