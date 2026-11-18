import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowDown,
    ArrowLeft,
    ArrowUp,
    Calendar,
    CheckSquare,
    ChevronDown,
    ChevronUp,
    CircleDot,
    Columns2,
    Copy,
    ExternalLink,
    Eye,
    Globe,
    Hash,
    ListFilter,
    ListTodo,
    Loader2,
    Mail,
    Monitor,
    Phone,
    Plus,
    Save,
    Settings2,
    Share2,
    SlidersHorizontal,
    Smartphone,
    Sparkles,
    Trash2,
    Type,
    AlignLeft,
    X,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { DynamicForm, type FormField, type FormFieldType } from '@/components/forms/DynamicForm';
import { ShareFormDialog } from '@/components/forms/ShareFormDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

interface FormModel {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    submit_button_text?: string | null;
    success_message?: string | null;
    redirect_url?: string | null;
    is_active: boolean;
    notify_team?: boolean;
    submissions_count?: number;
    fields: FormField[];
}

interface Props {
    form?: FormModel | null;
    template?: string;
    appUrl?: string;
}

const FIELD_PALETTE: Array<{
    type: FormFieldType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    defaultLabel: string;
    defaultPlaceholder: string;
    hasOptions?: boolean;
}> = [
    { type: 'text', label: 'Short Text', icon: Type, defaultLabel: 'Text Field', defaultPlaceholder: 'Enter text...' },
    { type: 'email', label: 'Email', icon: Mail, defaultLabel: 'Email Address', defaultPlaceholder: 'you@company.com' },
    { type: 'textarea', label: 'Long Text', icon: AlignLeft, defaultLabel: 'Message', defaultPlaceholder: 'Share more details...' },
    { type: 'select', label: 'Dropdown', icon: ListFilter, defaultLabel: 'Select Option', defaultPlaceholder: 'Choose an option...', hasOptions: true },
    { type: 'radio', label: 'Single Choice', icon: CircleDot, defaultLabel: 'Choose One', defaultPlaceholder: '', hasOptions: true },
    { type: 'checkbox_group', label: 'Multi Choice', icon: ListTodo, defaultLabel: 'Select All That Apply', defaultPlaceholder: '', hasOptions: true },
    { type: 'checkbox', label: 'Consent Check', icon: CheckSquare, defaultLabel: 'I agree to the terms and privacy policy', defaultPlaceholder: '' },
    { type: 'number', label: 'Number', icon: Hash, defaultLabel: 'Number', defaultPlaceholder: '0' },
    { type: 'tel', label: 'Phone', icon: Phone, defaultLabel: 'Phone Number', defaultPlaceholder: '+1 (555) 000-0000' },
    { type: 'url', label: 'Website URL', icon: Globe, defaultLabel: 'Website', defaultPlaceholder: 'https://example.com' },
    { type: 'date', label: 'Date', icon: Calendar, defaultLabel: 'Preferred Date', defaultPlaceholder: '' },
];

const TEMPLATES: Record<
    string,
    {
        name: string;
        slug: string;
        description: string;
        submit_button_text: string;
        success_message: string;
        fields: FormField[];
    }
> = {
    contact: {
        name: 'Contact Us',
        slug: 'contact-us',
        description: 'Have a question or project in mind? Send us a message and our team will respond within one business day.',
        submit_button_text: 'Send Message',
        success_message: 'Thanks for reaching out! Our team has received your message and will reply shortly.',
        fields: [
            { name: 'full_name', label: 'Full Name', type: 'text', placeholder: 'Jane Doe', required: true, width: 'half' },
            { name: 'email', label: 'Work Email', type: 'email', placeholder: 'jane@company.com', required: true, width: 'half' },
            {
                name: 'topic',
                label: 'Topic',
                type: 'select',
                placeholder: 'Select a topic...',
                required: true,
                width: 'full',
                options: ['General Inquiry', 'Sales & Pricing', 'Partnership', 'Press & Media'],
            },
            { name: 'message', label: 'Message', type: 'textarea', placeholder: 'Tell us how we can help...', required: true, width: 'full' },
        ],
    },
    lead: {
        name: 'Request a Product Demo',
        slug: 'request-demo',
        description: 'Schedule a personalized walkthrough of our platform tailored to your team.',
        submit_button_text: 'Book My Demo',
        success_message: 'Your demo request is confirmed! A solutions specialist will email you calendar times shortly.',
        fields: [
            { name: 'first_name', label: 'First Name', type: 'text', placeholder: 'Alex', required: true, width: 'half' },
            { name: 'last_name', label: 'Last Name', type: 'text', placeholder: 'Morgan', required: true, width: 'half' },
            { name: 'work_email', label: 'Work Email', type: 'email', placeholder: 'alex@acme.io', required: true, width: 'half' },
            { name: 'company', label: 'Company Name', type: 'text', placeholder: 'Acme Corp', required: true, width: 'half' },
            {
                name: 'team_size',
                label: 'Team Size',
                type: 'radio',
                required: true,
                width: 'full',
                options: ['1–10 people', '11–50 people', '51–250 people', '250+ Enterprise'],
            },
            { name: 'goals', label: 'What are you looking to build?', type: 'textarea', placeholder: 'Share your primary goals or timeline...', required: false, width: 'full' },
        ],
    },
    feedback: {
        name: 'Product Feedback Survey',
        slug: 'product-feedback',
        description: 'Help shape our roadmap by sharing what works well and where we can improve.',
        submit_button_text: 'Submit Feedback',
        success_message: 'Thank you for your feedback! Every response is reviewed directly by our product team.',
        fields: [
            {
                name: 'satisfaction',
                label: 'Overall experience',
                type: 'radio',
                required: true,
                width: 'full',
                options: ['Excellent', 'Good', 'Neutral', 'Needs Improvement'],
            },
            {
                name: 'favorite_areas',
                label: 'Which areas do you use most?',
                type: 'checkbox_group',
                required: false,
                width: 'full',
                options: ['Content Studio', 'Forms Engine', 'Webhooks & API', 'Team Permissions'],
            },
            { name: 'suggestions', label: 'Suggestions or feature requests', type: 'textarea', placeholder: 'What would make your workflow 10x faster?', required: true, width: 'full' },
            { name: 'email', label: 'Email (optional for follow-up)', type: 'email', placeholder: 'you@example.com', required: false, width: 'full' },
        ],
    },
    support: {
        name: 'Technical Support Request',
        slug: 'support-ticket',
        description: 'Experiencing an issue? Provide the details below so our engineers can investigate rapidly.',
        submit_button_text: 'Submit Ticket',
        success_message: 'Ticket received! Our support engineering team has been notified.',
        fields: [
            { name: 'name', label: 'Your Name', type: 'text', placeholder: 'Sam Patel', required: true, width: 'half' },
            { name: 'email', label: 'Account Email', type: 'email', placeholder: 'sam@company.com', required: true, width: 'half' },
            { name: 'subject', label: 'Issue Summary', type: 'text', placeholder: 'Brief description of the problem', required: true, width: 'full' },
            {
                name: 'priority',
                label: 'Urgency Level',
                type: 'select',
                required: true,
                width: 'half',
                options: ['Low — General Question', 'Normal — Workflow Impaired', 'High — Production Impact'],
            },
            { name: 'affected_url', label: 'Affected Page URL', type: 'url', placeholder: 'https://app.example.com/...', required: false, width: 'half' },
            { name: 'details', label: 'Steps to Reproduce', type: 'textarea', placeholder: 'Describe what happened and what you expected...', required: true, width: 'full' },
        ],
    },
};

function toSlug(value: string): string {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

function toFieldKey(label: string, fallbackIndex: number): string {
    const key = label
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
    if (!key || /^[0-9]/.test(key)) {
        return `field_${fallbackIndex}`;
    }
    return key;
}

function supportsOptions(type: string): boolean {
    return type === 'select' || type === 'radio' || type === 'checkbox_group';
}

export default function FormBuilder({ form, template = '', appUrl = '' }: Props) {
    const { currentTeam } = usePage().props as any;
    const teamSlug = currentTeam?.slug || '';
    const isEdit = !!form;

    const initialTemplate = !isEdit && template && TEMPLATES[template] ? TEMPLATES[template] : TEMPLATES.contact;

    const { data, setData, post, put, processing, errors } = useForm<{
        name: string;
        slug: string;
        description: string;
        submit_button_text: string;
        success_message: string;
        redirect_url: string;
        is_active: boolean;
        notify_team: boolean;
        fields: FormField[];
    }>({
        name: form?.name ?? (template && TEMPLATES[template] ? initialTemplate.name : ''),
        slug: form?.slug ?? (template && TEMPLATES[template] ? initialTemplate.slug : ''),
        description: form?.description ?? (template && TEMPLATES[template] ? initialTemplate.description : ''),
        submit_button_text: form?.submit_button_text || initialTemplate.submit_button_text || 'Submit',
        success_message:
            form?.success_message ||
            initialTemplate.success_message ||
            'Thank you! Your submission has been received.',
        redirect_url: form?.redirect_url || '',
        is_active: form?.is_active ?? true,
        notify_team: form?.notify_team ?? true,
        fields:
            form?.fields && form.fields.length > 0
                ? form.fields.map((f) => ({
                      ...f,
                      width: f.width || 'full',
                      options: f.options || [],
                  }))
                : initialTemplate.fields,
    });

    const [expandedIdx, setExpandedIdx] = useState<number | null>(0);
    const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');
    const [previewViewport, setPreviewViewport] = useState<'desktop' | 'mobile'>('desktop');
    const [slugTouched, setSlugTouched] = useState(isEdit);
    const [shareOpen, setShareOpen] = useState(false);

    const baseUrl = appUrl || (typeof window !== 'undefined' ? window.location.origin : '');
    const previewSlug = data.slug || toSlug(data.name) || 'your-form';

    const errorList = useMemo(() => Object.entries(errors), [errors]);

    const applyTemplate = (templateKey: string) => {
        const tpl = TEMPLATES[templateKey];
        if (!tpl) {
            return;
        }
        setData({
            ...data,
            name: tpl.name,
            slug: tpl.slug,
            description: tpl.description,
            submit_button_text: tpl.submit_button_text,
            success_message: tpl.success_message,
            fields: tpl.fields.map((f) => ({ ...f, options: f.options ? [...f.options] : [] })),
        });
        setExpandedIdx(0);
    };

    const addFieldOfType = (type: FormFieldType) => {
        const meta = FIELD_PALETTE.find((item) => item.type === type) || FIELD_PALETTE[0];
        const existingNames = new Set(data.fields.map((f) => f.name));
        let baseName = toFieldKey(meta.defaultLabel, data.fields.length + 1);
        let suffix = 2;
        while (existingNames.has(baseName)) {
            baseName = `${toFieldKey(meta.defaultLabel, data.fields.length + 1)}_${suffix}`;
            suffix++;
        }

        const newField: FormField = {
            name: baseName,
            label: meta.defaultLabel,
            type,
            placeholder: meta.defaultPlaceholder,
            help_text: '',
            required: false,
            width: 'full',
            options: meta.hasOptions ? ['Option 1', 'Option 2', 'Option 3'] : [],
        };

        const nextFields = [...data.fields, newField];
        setData('fields', nextFields);
        setExpandedIdx(nextFields.length - 1);
    };

    const updateField = (index: number, patch: Partial<FormField>) => {
        const updated = [...data.fields];
        const current = { ...updated[index], ...patch };

        if (patch.type && supportsOptions(patch.type) && (!current.options || current.options.length === 0)) {
            current.options = ['Option 1', 'Option 2'];
        }

        updated[index] = current;
        setData('fields', updated);
    };

    const removeField = (index: number) => {
        const nextFields = data.fields.filter((_, i) => i !== index);
        setData('fields', nextFields);
        if (expandedIdx === index) {
            setExpandedIdx(null);
        } else if (expandedIdx !== null && expandedIdx > index) {
            setExpandedIdx(expandedIdx - 1);
        }
    };

    const duplicateField = (index: number) => {
        const source = data.fields[index];
        const existingNames = new Set(data.fields.map((f) => f.name));
        let copyName = `${source.name}_copy`;
        let n = 2;
        while (existingNames.has(copyName)) {
            copyName = `${source.name}_copy_${n}`;
            n++;
        }
        const clone: FormField = {
            ...source,
            name: copyName,
            label: `${source.label} (Copy)`,
            options: source.options ? [...source.options] : [],
        };
        const nextFields = [
            ...data.fields.slice(0, index + 1),
            clone,
            ...data.fields.slice(index + 1),
        ];
        setData('fields', nextFields);
        setExpandedIdx(index + 1);
    };

    const moveField = (index: number, direction: -1 | 1) => {
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= data.fields.length) {
            return;
        }
        const nextFields = [...data.fields];
        const [moved] = nextFields.splice(index, 1);
        nextFields.splice(targetIndex, 0, moved);
        setData('fields', nextFields);
        setExpandedIdx(targetIndex);
    };

    const updateOption = (fieldIdx: number, optIdx: number, value: string) => {
        const opts = [...(data.fields[fieldIdx].options || [])];
        opts[optIdx] = value;
        updateField(fieldIdx, { options: opts });
    };

    const addOption = (fieldIdx: number) => {
        const opts = [...(data.fields[fieldIdx].options || [])];
        opts.push(`Option ${opts.length + 1}`);
        updateField(fieldIdx, { options: opts });
    };

    const removeOption = (fieldIdx: number, optIdx: number) => {
        const opts = (data.fields[fieldIdx].options || []).filter((_, i) => i !== optIdx);
        updateField(fieldIdx, { options: opts });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit && form) {
            put(`/${teamSlug}/forms/${form.id}`, { preserveScroll: true });
        } else {
            post(`/${teamSlug}/forms`, { preserveScroll: true });
        }
    };

    return (
        <>
            <Head title={isEdit ? `Edit ${data.name || 'Form'}` : 'Form Builder Studio'} />

            <div className="flex flex-col min-h-[calc(100vh-4rem)]">
                {/* Sticky Studio Header */}
                <div className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-4 sm:px-6 py-3">
                    <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <Button variant="ghost" size="sm" asChild className="shrink-0">
                                <Link href={`/${teamSlug}/forms`}>
                                    <ArrowLeft className="h-4 w-4 mr-1" />
                                    Forms
                                </Link>
                            </Button>
                            <div className="h-5 w-px bg-border hidden sm:block" />
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-base font-semibold tracking-tight text-foreground truncate">
                                        {data.name || (isEdit ? 'Untitled Form' : 'New Dynamic Form')}
                                    </h1>
                                    <Badge
                                        variant="outline"
                                        className={
                                            data.is_active
                                                ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-[10px]'
                                                : 'text-muted-foreground text-[10px]'
                                        }
                                    >
                                        {data.is_active ? 'Active' : 'Paused'}
                                    </Badge>
                                </div>
                                <p className="text-[11px] font-mono text-muted-foreground truncate">
                                    /forms/{previewSlug}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* View Switcher */}
                            <div className="hidden lg:inline-flex items-center rounded-lg border bg-muted/40 p-0.5">
                                <button
                                    type="button"
                                    onClick={() => setViewMode('split')}
                                    className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                                        viewMode === 'split'
                                            ? 'bg-background text-foreground shadow-xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <Columns2 className="h-3.5 w-3.5" />
                                    Split
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode('editor')}
                                    className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                                        viewMode === 'editor'
                                            ? 'bg-background text-foreground shadow-xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <SlidersHorizontal className="h-3.5 w-3.5" />
                                    Editor
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode('preview')}
                                    className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                                        viewMode === 'preview'
                                            ? 'bg-background text-foreground shadow-xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <Eye className="h-3.5 w-3.5" />
                                    Preview
                                </button>
                            </div>

                            {isEdit && form && (
                                <>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShareOpen(true)}
                                        className="gap-1.5"
                                    >
                                        <Share2 className="h-3.5 w-3.5" />
                                        <span className="hidden sm:inline">Share</span>
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        asChild
                                        className="gap-1.5"
                                    >
                                        <a
                                            href={`/forms/${form.slug}${!form.is_active ? '?preview=1' : ''}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                            <span className="hidden sm:inline">Open</span>
                                        </a>
                                    </Button>
                                </>
                            )}

                            <Button
                                type="button"
                                size="sm"
                                onClick={handleSubmit}
                                disabled={processing}
                                className="gap-1.5"
                            >
                                {processing ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                {processing
                                    ? 'Saving...'
                                    : isEdit
                                      ? 'Save Changes'
                                      : 'Publish Form'}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Validation Error Summary Banner */}
                {errorList.length > 0 && (
                    <div className="px-4 sm:px-6 pt-4 max-w-[1600px] w-full mx-auto">
                        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive space-y-1">
                            <div className="flex items-center gap-2 font-semibold">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                Please fix the following before saving:
                            </div>
                            <ul className="list-disc list-inside space-y-0.5 pl-1">
                                {errorList.map(([key, msg]) => (
                                    <li key={key}>{msg}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Starter Template Bar (Create Mode) */}
                {!isEdit && (
                    <div className="px-4 sm:px-6 pt-4 max-w-[1600px] w-full mx-auto">
                        <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-muted/30 px-3.5 py-2.5">
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground mr-1">
                                <Sparkles className="h-3.5 w-3.5 text-primary" />
                                Quick Templates:
                            </span>
                            {Object.entries(TEMPLATES).map(([key, tpl]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => applyTemplate(key)}
                                    className="rounded-lg border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:border-primary/60 hover:text-primary transition-colors"
                                >
                                    {tpl.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Main Split Workspace */}
                <div className="flex-1 px-4 sm:px-6 py-5 max-w-[1600px] w-full mx-auto">
                    <div
                        className={`grid gap-6 items-start ${
                            viewMode === 'split'
                                ? 'grid-cols-1 lg:grid-cols-12'
                                : 'grid-cols-1'
                        }`}
                    >
                        {/* LEFT: Studio Editor */}
                        {viewMode !== 'preview' && (
                            <div
                                className={
                                    viewMode === 'split'
                                        ? 'lg:col-span-6 xl:col-span-6 space-y-4'
                                        : 'max-w-3xl mx-auto w-full space-y-4'
                                }
                            >
                                <Tabs defaultValue="fields" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="fields" className="gap-1.5 text-xs">
                                            <SlidersHorizontal className="h-3.5 w-3.5" />
                                            Fields ({data.fields.length})
                                        </TabsTrigger>
                                        <TabsTrigger value="settings" className="gap-1.5 text-xs">
                                            <Settings2 className="h-3.5 w-3.5" />
                                            Form Settings
                                        </TabsTrigger>
                                    </TabsList>

                                    {/* FIELDS TAB */}
                                    <TabsContent value="fields" className="space-y-4 pt-3">
                                        {/* Quick Title & Description Bar */}
                                        <div className="rounded-xl border bg-card p-4 space-y-3 shadow-xs">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="quick-name" className="text-xs font-medium">
                                                        Form Title <span className="text-destructive">*</span>
                                                    </Label>
                                                    <Input
                                                        id="quick-name"
                                                        value={data.name}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            setData((prev) => ({
                                                                ...prev,
                                                                name: val,
                                                                slug: !slugTouched ? toSlug(val) : prev.slug,
                                                            }));
                                                        }}
                                                        placeholder="e.g., Contact Sales"
                                                        className="h-9"
                                                    />
                                                    {errors.name && (
                                                        <p className="text-[11px] text-destructive">{errors.name}</p>
                                                    )}
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="quick-slug" className="text-xs font-medium">
                                                        Public URL Slug
                                                    </Label>
                                                    <div className="flex items-center rounded-md border border-input bg-background focus-within:ring-1 focus-within:ring-ring overflow-hidden h-9">
                                                        <span className="px-2.5 text-xs font-mono text-muted-foreground bg-muted/50 h-full flex items-center border-r">
                                                            /forms/
                                                        </span>
                                                        <input
                                                            id="quick-slug"
                                                            value={data.slug}
                                                            onChange={(e) => {
                                                                setSlugTouched(true);
                                                                setData('slug', e.target.value);
                                                            }}
                                                            placeholder="contact-sales"
                                                            className="flex-1 bg-transparent px-2.5 text-xs font-mono focus:outline-none"
                                                        />
                                                    </div>
                                                    {errors.slug && (
                                                        <p className="text-[11px] text-destructive">{errors.slug}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Add Field Palette */}
                                        <div className="rounded-xl border bg-card p-4 space-y-2.5 shadow-xs">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-semibold text-foreground">
                                                    Add Field
                                                </span>
                                                <span className="text-[11px] text-muted-foreground">
                                                    Click any type to append
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {FIELD_PALETTE.map((item) => {
                                                    const Icon = item.icon;
                                                    return (
                                                        <button
                                                            key={item.type}
                                                            type="button"
                                                            onClick={() => addFieldOfType(item.type)}
                                                            className="inline-flex items-center gap-1.5 rounded-lg border bg-background hover:border-primary/60 hover:bg-primary/5 px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors"
                                                        >
                                                            <Icon className="h-3.5 w-3.5 text-primary" />
                                                            {item.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Field Schema List */}
                                        <div className="space-y-2.5">
                                            {data.fields.length === 0 ? (
                                                <div className="rounded-xl border border-dashed bg-muted/20 p-10 text-center space-y-2">
                                                    <p className="text-sm font-medium text-foreground">
                                                        No fields added yet
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Click a field type from the palette above to start building your form.
                                                    </p>
                                                </div>
                                            ) : (
                                                data.fields.map((field, idx) => {
                                                    const isExpanded = expandedIdx === idx;
                                                    const meta = FIELD_PALETTE.find((p) => p.type === field.type);
                                                    const Icon = meta?.icon || Type;
                                                    const fieldNameErr = (errors as Record<string, string>)[
                                                        `fields.${idx}.name`
                                                    ];
                                                    const fieldLabelErr = (errors as Record<string, string>)[
                                                        `fields.${idx}.label`
                                                    ];

                                                    return (
                                                        <div
                                                            key={idx}
                                                            className={`rounded-xl border bg-card transition-all ${
                                                                isExpanded
                                                                    ? 'border-primary/50 shadow-sm ring-1 ring-primary/10'
                                                                    : 'hover:border-border/80 shadow-xs'
                                                            }`}
                                                        >
                                                            {/* Field Card Header */}
                                                            <div
                                                                onClick={() =>
                                                                    setExpandedIdx(isExpanded ? null : idx)
                                                                }
                                                                className="flex items-center justify-between gap-2 px-3.5 py-2.5 cursor-pointer select-none"
                                                            >
                                                                <div className="flex items-center gap-2.5 min-w-0">
                                                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                                                        <Icon className="h-3.5 w-3.5" />
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <div className="flex items-center gap-1.5">
                                                                            <span className="text-sm font-medium text-foreground truncate">
                                                                                {field.label || 'Untitled Field'}
                                                                            </span>
                                                                            {field.required && (
                                                                                <Badge
                                                                                    variant="secondary"
                                                                                    className="text-[10px] h-4 px-1.5"
                                                                                >
                                                                                    Required
                                                                                </Badge>
                                                                            )}
                                                                            {field.width === 'half' && (
                                                                                <Badge
                                                                                    variant="outline"
                                                                                    className="text-[10px] h-4 px-1.5"
                                                                                >
                                                                                    50%
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                        <div className="text-[11px] font-mono text-muted-foreground">
                                                                            {field.name} · {meta?.label || field.type}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div
                                                                    className="flex items-center gap-0.5 shrink-0"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-7 w-7"
                                                                        disabled={idx === 0}
                                                                        onClick={() => moveField(idx, -1)}
                                                                        aria-label="Move field up"
                                                                    >
                                                                        <ArrowUp className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-7 w-7"
                                                                        disabled={idx === data.fields.length - 1}
                                                                        onClick={() => moveField(idx, 1)}
                                                                        aria-label="Move field down"
                                                                    >
                                                                        <ArrowDown className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-7 w-7"
                                                                        onClick={() => duplicateField(idx)}
                                                                        aria-label="Duplicate field"
                                                                    >
                                                                        <Copy className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                                        onClick={() => removeField(idx)}
                                                                        aria-label="Remove field"
                                                                    >
                                                                        <Trash2 className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-7 w-7"
                                                                        onClick={() =>
                                                                            setExpandedIdx(isExpanded ? null : idx)
                                                                        }
                                                                        aria-label="Toggle field details"
                                                                    >
                                                                        {isExpanded ? (
                                                                            <ChevronUp className="h-4 w-4" />
                                                                        ) : (
                                                                            <ChevronDown className="h-4 w-4" />
                                                                        )}
                                                                    </Button>
                                                                </div>
                                                            </div>

                                                            {/* Field Card Expanded Editor */}
                                                            {isExpanded && (
                                                                <div className="border-t px-4 py-4 space-y-4 bg-muted/15">
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                        <div className="space-y-1">
                                                                            <Label className="text-xs">
                                                                                Field Label *
                                                                            </Label>
                                                                            <Input
                                                                                value={field.label}
                                                                                onChange={(e) =>
                                                                                    updateField(idx, {
                                                                                        label: e.target.value,
                                                                                    })
                                                                                }
                                                                                placeholder="Full Name"
                                                                                className="h-8 text-xs"
                                                                            />
                                                                            {fieldLabelErr && (
                                                                                <p className="text-[11px] text-destructive">
                                                                                    {fieldLabelErr}
                                                                                </p>
                                                                            )}
                                                                        </div>

                                                                        <div className="space-y-1">
                                                                            <Label className="text-xs">
                                                                                JSON Key (name) *
                                                                            </Label>
                                                                            <Input
                                                                                value={field.name}
                                                                                onChange={(e) =>
                                                                                    updateField(idx, {
                                                                                        name: e.target.value,
                                                                                    })
                                                                                }
                                                                                placeholder="full_name"
                                                                                className="h-8 text-xs font-mono"
                                                                            />
                                                                            {fieldNameErr && (
                                                                                <p className="text-[11px] text-destructive">
                                                                                    {fieldNameErr}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                        <div className="space-y-1">
                                                                            <Label className="text-xs">
                                                                                Input Type
                                                                            </Label>
                                                                            <select
                                                                                value={field.type}
                                                                                onChange={(e) =>
                                                                                    updateField(idx, {
                                                                                        type: e.target.value,
                                                                                    })
                                                                                }
                                                                                className="h-8 w-full rounded-md border border-input bg-background px-2.5 text-xs"
                                                                            >
                                                                                {FIELD_PALETTE.map((opt) => (
                                                                                    <option
                                                                                        key={opt.type}
                                                                                        value={opt.type}
                                                                                    >
                                                                                        {opt.label}
                                                                                    </option>
                                                                                ))}
                                                                            </select>
                                                                        </div>

                                                                        <div className="space-y-1">
                                                                            <Label className="text-xs">
                                                                                Column Width
                                                                            </Label>
                                                                            <div className="grid grid-cols-2 gap-1.5">
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() =>
                                                                                        updateField(idx, {
                                                                                            width: 'full',
                                                                                        })
                                                                                    }
                                                                                    className={`h-8 rounded-md border text-xs font-medium transition-colors ${
                                                                                        (field.width || 'full') ===
                                                                                        'full'
                                                                                            ? 'border-primary bg-primary/10 text-primary'
                                                                                            : 'border-input bg-background text-muted-foreground'
                                                                                    }`}
                                                                                >
                                                                                    Full (100%)
                                                                                </button>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() =>
                                                                                        updateField(idx, {
                                                                                            width: 'half',
                                                                                        })
                                                                                    }
                                                                                    className={`h-8 rounded-md border text-xs font-medium transition-colors ${
                                                                                        field.width === 'half'
                                                                                            ? 'border-primary bg-primary/10 text-primary'
                                                                                            : 'border-input bg-background text-muted-foreground'
                                                                                    }`}
                                                                                >
                                                                                    Half (50%)
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                        <div className="space-y-1">
                                                                            <Label className="text-xs">
                                                                                Placeholder
                                                                            </Label>
                                                                            <Input
                                                                                value={field.placeholder || ''}
                                                                                onChange={(e) =>
                                                                                    updateField(idx, {
                                                                                        placeholder: e.target.value,
                                                                                    })
                                                                                }
                                                                                placeholder="Hint text inside input..."
                                                                                className="h-8 text-xs"
                                                                            />
                                                                        </div>

                                                                        <div className="space-y-1">
                                                                            <Label className="text-xs">
                                                                                Help Text
                                                                            </Label>
                                                                            <Input
                                                                                value={field.help_text || ''}
                                                                                onChange={(e) =>
                                                                                    updateField(idx, {
                                                                                        help_text: e.target.value,
                                                                                    })
                                                                                }
                                                                                placeholder="Shown below the field..."
                                                                                className="h-8 text-xs"
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    {/* Options Editor for Select / Radio / Checkbox Group */}
                                                                    {supportsOptions(field.type) && (
                                                                        <div className="space-y-2 rounded-lg border bg-background p-3">
                                                                            <div className="flex items-center justify-between">
                                                                                <Label className="text-xs font-semibold">
                                                                                    Choice Options
                                                                                </Label>
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="outline"
                                                                                    size="sm"
                                                                                    onClick={() => addOption(idx)}
                                                                                    className="h-6 px-2 text-[11px] gap-1"
                                                                                >
                                                                                    <Plus className="h-3 w-3" />
                                                                                    Add Option
                                                                                </Button>
                                                                            </div>
                                                                            <div className="space-y-1.5">
                                                                                {(field.options || []).map(
                                                                                    (opt, optIdx) => (
                                                                                        <div
                                                                                            key={optIdx}
                                                                                            className="flex items-center gap-1.5"
                                                                                        >
                                                                                            <Input
                                                                                                value={opt}
                                                                                                onChange={(e) =>
                                                                                                    updateOption(
                                                                                                        idx,
                                                                                                        optIdx,
                                                                                                        e.target.value,
                                                                                                    )
                                                                                                }
                                                                                                placeholder={`Option ${optIdx + 1}`}
                                                                                                className="h-7 text-xs"
                                                                                            />
                                                                                            <Button
                                                                                                type="button"
                                                                                                variant="ghost"
                                                                                                size="icon"
                                                                                                className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                                                                                                onClick={() =>
                                                                                                    removeOption(
                                                                                                        idx,
                                                                                                        optIdx,
                                                                                                    )
                                                                                                }
                                                                                                disabled={
                                                                                                    (field.options
                                                                                                        ?.length || 0) <= 1
                                                                                                }
                                                                                            >
                                                                                                <X className="h-3.5 w-3.5" />
                                                                                            </Button>
                                                                                        </div>
                                                                                    ),
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    <div className="flex items-center justify-between pt-2 border-t">
                                                                        <Label
                                                                            htmlFor={`req-${idx}`}
                                                                            className="text-xs font-medium cursor-pointer"
                                                                        >
                                                                            Required field
                                                                        </Label>
                                                                        <Switch
                                                                            id={`req-${idx}`}
                                                                            checked={!!field.required}
                                                                            onCheckedChange={(checked) =>
                                                                                updateField(idx, {
                                                                                    required: checked,
                                                                                })
                                                                            }
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </TabsContent>

                                    {/* SETTINGS TAB */}
                                    <TabsContent value="settings" className="space-y-4 pt-3">
                                        <div className="rounded-xl border bg-card p-5 space-y-4 shadow-xs">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="settings-desc" className="text-xs font-medium">
                                                    Form Description / Intro Copy
                                                </Label>
                                                <Textarea
                                                    id="settings-desc"
                                                    value={data.description}
                                                    onChange={(e) => setData('description', e.target.value)}
                                                    rows={3}
                                                    placeholder="Explain the purpose of this form to visitors..."
                                                    className="text-sm"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label htmlFor="settings-btn" className="text-xs font-medium">
                                                    Submit Button Label
                                                </Label>
                                                <Input
                                                    id="settings-btn"
                                                    value={data.submit_button_text}
                                                    onChange={(e) =>
                                                        setData('submit_button_text', e.target.value)
                                                    }
                                                    placeholder="Submit"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label htmlFor="settings-success" className="text-xs font-medium">
                                                    Confirmation / Success Message
                                                </Label>
                                                <Textarea
                                                    id="settings-success"
                                                    value={data.success_message}
                                                    onChange={(e) =>
                                                        setData('success_message', e.target.value)
                                                    }
                                                    rows={2}
                                                    placeholder="Thank you! Your submission has been received."
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label htmlFor="settings-redirect" className="text-xs font-medium">
                                                    Post-Submission Redirect URL (Optional)
                                                </Label>
                                                <Input
                                                    id="settings-redirect"
                                                    type="url"
                                                    value={data.redirect_url}
                                                    onChange={(e) => setData('redirect_url', e.target.value)}
                                                    placeholder="https://yoursite.com/thank-you"
                                                />
                                                <p className="text-[11px] text-muted-foreground">
                                                    Leave blank to show the built-in confirmation card.
                                                </p>
                                                {errors.redirect_url && (
                                                    <p className="text-[11px] text-destructive">
                                                        {errors.redirect_url}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-3 pt-3 border-t">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div>
                                                        <Label
                                                            htmlFor="settings-active"
                                                            className="text-sm font-medium cursor-pointer"
                                                        >
                                                            Active & Accepting Submissions
                                                        </Label>
                                                        <p className="text-xs text-muted-foreground">
                                                            When paused, public visitors see a closed notice instead of the form.
                                                        </p>
                                                    </div>
                                                    <Switch
                                                        id="settings-active"
                                                        checked={data.is_active}
                                                        onCheckedChange={(checked) =>
                                                            setData('is_active', checked)
                                                        }
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between gap-4">
                                                    <div>
                                                        <Label
                                                            htmlFor="settings-notify"
                                                            className="text-sm font-medium cursor-pointer"
                                                        >
                                                            Notify Team Members
                                                        </Label>
                                                        <p className="text-xs text-muted-foreground">
                                                            Send an in-app notification to workspace members on every new response.
                                                        </p>
                                                    </div>
                                                    <Switch
                                                        id="settings-notify"
                                                        checked={data.notify_team}
                                                        onCheckedChange={(checked) =>
                                                            setData('notify_team', checked)
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        )}

                        {/* RIGHT: Real-Time Interactive Live Preview */}
                        {viewMode !== 'editor' && (
                            <div
                                className={
                                    viewMode === 'split'
                                        ? 'lg:col-span-6 xl:col-span-6 lg:sticky lg:top-20'
                                        : 'max-w-3xl mx-auto w-full'
                                }
                            >
                                <div className="rounded-2xl border bg-muted/30 overflow-hidden shadow-xs">
                                    {/* Mock Browser Top Bar */}
                                    <div className="flex items-center justify-between gap-3 border-b bg-card px-4 py-2.5">
                                        <div className="flex items-center gap-1.5">
                                            <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
                                            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                                        </div>

                                        <div className="flex-1 max-w-xs mx-auto rounded-md border bg-muted/50 px-3 py-1 text-center font-mono text-[11px] text-muted-foreground truncate">
                                            {baseUrl.replace(/^https?:\/\//, '')}/forms/{previewSlug}
                                        </div>

                                        <div className="flex items-center gap-1 rounded-md border bg-muted/40 p-0.5">
                                            <button
                                                type="button"
                                                onClick={() => setPreviewViewport('desktop')}
                                                className={`p-1 rounded transition-colors ${
                                                    previewViewport === 'desktop'
                                                        ? 'bg-background text-foreground shadow-xs'
                                                        : 'text-muted-foreground'
                                                }`}
                                                aria-label="Desktop preview"
                                            >
                                                <Monitor className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setPreviewViewport('mobile')}
                                                className={`p-1 rounded transition-colors ${
                                                    previewViewport === 'mobile'
                                                        ? 'bg-background text-foreground shadow-xs'
                                                        : 'text-muted-foreground'
                                                }`}
                                                aria-label="Mobile preview"
                                            >
                                                <Smartphone className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Live Preview Canvas */}
                                    <div className="p-4 sm:p-8 flex justify-center min-h-[540px] max-h-[calc(100vh-11rem)] overflow-y-auto">
                                        <div
                                            className={`w-full transition-all duration-200 ${
                                                previewViewport === 'mobile'
                                                    ? 'max-w-[390px]'
                                                    : 'max-w-xl'
                                            }`}
                                        >
                                            <div className="rounded-2xl border bg-card shadow-md overflow-hidden">
                                                <div className="h-1.5 w-full bg-gradient-to-r from-primary/80 via-primary to-primary/60" />
                                                <div className="p-6 sm:p-8 space-y-6">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <Badge
                                                                variant="secondary"
                                                                className="text-[11px]"
                                                            >
                                                                {currentTeam?.name || 'Workspace'}
                                                            </Badge>
                                                            <span className="text-[11px] text-muted-foreground">
                                                                Live Interactive Preview
                                                            </span>
                                                        </div>
                                                        <h2 className="text-xl font-bold tracking-tight text-foreground">
                                                            {data.name || 'Untitled Form'}
                                                        </h2>
                                                        {data.description && (
                                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                                {data.description}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <DynamicForm
                                                        slug={previewSlug}
                                                        fields={data.fields}
                                                        submitButtonText={
                                                            data.submit_button_text || 'Submit'
                                                        }
                                                        successMessage={data.success_message}
                                                        redirectUrl={data.redirect_url || null}
                                                        previewMode
                                                        showProgress={data.fields.length >= 4}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isEdit && form && (
                <ShareFormDialog
                    open={shareOpen}
                    onOpenChange={setShareOpen}
                    form={{
                        name: data.name || form.name,
                        slug: form.slug,
                        is_active: data.is_active,
                        fields: data.fields,
                    }}
                    appUrl={baseUrl}
                />
            )}
        </>
    );
}

FormBuilder.layout = (props: { currentTeam?: { slug?: string } }) => {
    const teamSlug = props.currentTeam?.slug || '';

    return {
        breadcrumbs: [
            { title: 'Dashboard', href: `/${teamSlug}/dashboard` },
            { title: 'Forms Engine', href: `/${teamSlug}/forms` },
            { title: 'Builder Studio', href: `/${teamSlug}/forms/create` },
        ],
    };
};
