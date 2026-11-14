import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Plus,
    Trash2,
    Save,
    ArrowLeft,
    GripVertical,
    CheckCircle2,
} from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FormField {
    [key: string]: any;
    name: string;
    label: string;
    type: string;
    placeholder?: string;
    required: boolean;
}

interface Props {
    form?: {
        id: number;
        name: string;
        slug: string;
        description?: string;
        submit_button_text?: string;
        success_message?: string;
        redirect_url?: string;
        is_active: boolean;
        fields: FormField[];
    } | null;
}

export default function FormBuilder({ form }: Props) {
    const { currentTeam } = usePage().props as any;
    const teamSlug = currentTeam?.slug || '';

    const isEdit = !!form;

    const [name, setName] = useState(form?.name || '');
    const [slug, setSlug] = useState(form?.slug || '');
    const [description, setDescription] = useState(form?.description || '');
    const [submitButtonText, setSubmitButtonText] = useState(form?.submit_button_text || 'Submit');
    const [successMessage, setSuccessMessage] = useState(form?.success_message || 'Thank you! Your submission has been received.');
    const [redirectUrl, setRedirectUrl] = useState(form?.redirect_url || '');
    const [isActive, setIsActive] = useState(form?.is_active ?? true);

    const [fields, setFields] = useState<FormField[]>(
        form?.fields || [
            { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Jane Doe', required: true },
            ['email', 'Email Address', 'email', 'jane@example.com', true].reduce((_, __) => ({
                name: 'email', label: 'Email Address', type: 'email', placeholder: 'jane@example.com', required: true
            }), {} as FormField),
            { name: 'message', label: 'Message', type: 'textarea', placeholder: 'How can we help?', required: false },
        ]
    );

    const addField = () => {
        const id = fields.length + 1;
        setFields([
            ...fields,
            {
                name: `field_${id}`,
                label: `Field ${id}`,
                type: 'text',
                placeholder: '',
                required: false,
            },
        ]);
    };

    const removeField = (index: number) => {
        setFields(fields.filter((_, i) => i !== index));
    };

    const updateField = (index: number, key: keyof FormField, value: any) => {
        const updated = [...fields];
        updated[index] = { ...updated[index], [key]: value };
        setFields(updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            name,
            slug,
            description,
            submit_button_text: submitButtonText,
            success_message: successMessage,
            redirect_url: redirectUrl || null,
            is_active: isActive,
            fields,
        };

        if (isEdit) {
            router.put(`/${teamSlug}/forms/${form!.id}`, payload);
        } else {
            router.post(`/${teamSlug}/forms`, payload);
        }
    };

    return (
        <>
            <Head title={isEdit ? `Edit ${name}` : 'Create Form'} />

            <div className="p-6 space-y-6 max-w-4xl mx-auto">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={`/${teamSlug}/forms`}>
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                Back
                            </Link>
                        </Button>
                        <h1 className="text-xl font-bold tracking-tight text-foreground">
                            {isEdit ? 'Edit Form Schema' : 'Create Dynamic Form'}
                        </h1>
                    </div>

                    <Button onClick={handleSubmit} className="gap-2">
                        <Save className="h-4 w-4" />
                        {isEdit ? 'Save Changes' : 'Create Form'}
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Left: General Settings (1 col) */}
                    <div className="md:col-span-1 space-y-4 rounded-xl border bg-card p-5">
                        <h2 className="text-sm font-semibold text-foreground">Form Configuration</h2>

                        <div className="space-y-1.5">
                            <Label htmlFor="form-name" className="text-xs">Form Title *</Label>
                            <Input
                                id="form-name"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    if (!isEdit) {
                                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                                    }
                                }}
                                placeholder="Contact Sales"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="form-slug" className="text-xs">Slug</Label>
                            <Input
                                id="form-slug"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                placeholder="contact-sales"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="form-desc" className="text-xs">Description</Label>
                            <textarea
                                id="form-desc"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={2}
                                className="w-full rounded-md border border-input bg-transparent px-3 py-1.5 text-xs shadow-sm"
                                placeholder="Customer contact inquiry form"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="submit-btn" className="text-xs">Button Label</Label>
                            <Input
                                id="submit-btn"
                                value={submitButtonText}
                                onChange={(e) => setSubmitButtonText(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="success-msg" className="text-xs">Success Message</Label>
                            <textarea
                                id="success-msg"
                                value={successMessage}
                                onChange={(e) => setSuccessMessage(e.target.value)}
                                rows={2}
                                className="w-full rounded-md border border-input bg-transparent px-3 py-1.5 text-xs shadow-sm"
                            />
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t">
                            <input
                                id="form-active"
                                type="checkbox"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                                className="rounded border-border text-primary"
                            />
                            <Label htmlFor="form-active" className="text-xs cursor-pointer">
                                Active & accepting submissions
                            </Label>
                        </div>
                    </div>

                    {/* Right: Field Builder (2 cols) */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-foreground">Form Fields ({fields.length})</h2>
                            <Button size="sm" variant="outline" onClick={addField} className="text-xs gap-1.5">
                                <Plus className="h-3.5 w-3.5" />
                                Add Field
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {fields.map((field, idx) => (
                                <div
                                    key={idx}
                                    className="p-4 rounded-xl border bg-card shadow-sm space-y-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-mono font-medium text-muted-foreground">
                                            #{idx + 1} Field
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeField(idx)}
                                            className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-[11px]">Field Label</Label>
                                            <Input
                                                value={field.label}
                                                onChange={(e) => updateField(idx, 'label', e.target.value)}
                                                placeholder="First Name"
                                                className="h-8 text-xs"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <Label className="text-[11px]">Key (Name)</Label>
                                            <Input
                                                value={field.name}
                                                onChange={(e) => updateField(idx, 'name', e.target.value)}
                                                placeholder="first_name"
                                                className="h-8 text-xs font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 items-center">
                                        <div className="space-y-1">
                                            <Label className="text-[11px]">Field Type</Label>
                                            <select
                                                value={field.type}
                                                onChange={(e) => updateField(idx, 'type', e.target.value)}
                                                className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                                            >
                                                <option value="text">Text Input</option>
                                                <option value="email">Email Address</option>
                                                <option value="textarea">Multi-line Textarea</option>
                                                <option value="number">Number</option>
                                                <option value="url">Website URL</option>
                                                <option value="checkbox">Checkbox (Boolean)</option>
                                            </select>
                                        </div>

                                        <div className="flex items-center gap-2 pt-4">
                                            <input
                                                id={`req-${idx}`}
                                                type="checkbox"
                                                checked={field.required}
                                                onChange={(e) => updateField(idx, 'required', e.target.checked)}
                                                className="rounded border-border text-primary"
                                            />
                                            <Label htmlFor={`req-${idx}`} className="text-xs cursor-pointer">
                                                Required field
                                            </Label>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

FormBuilder.layout = (props: { currentTeam?: { slug?: string } }) => {
    const teamSlug = props.currentTeam?.slug || '';

    return {
        breadcrumbs: [
            { title: 'Dashboard', href: `/${teamSlug}/dashboard` },
            { title: 'Forms Engine', href: `/${teamSlug}/forms` },
            { title: 'Builder', href: `/${teamSlug}/forms/create` },
        ],
    };
};
