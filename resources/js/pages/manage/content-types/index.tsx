import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    BookOpen,
    ChevronRight,
    Code2,
    FileText,
    Layers,
    Layout,
    Megaphone,
    Pencil,
    Plus,
    Shield,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface ContentTypeRecord {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    icon?: string | null;
    supports: string[];
    is_system: boolean;
    contents_count: number;
}

const ICONS: Record<string, { label: string; icon: typeof FileText }> = {
    'file-text': { label: 'Document', icon: FileText },
    layers: { label: 'Layers', icon: Layers },
    layout: { label: 'Layout / Page', icon: Layout },
    'book-open': { label: 'Book / Guide', icon: BookOpen },
    megaphone: { label: 'Announcement', icon: Megaphone },
    code: { label: 'Technical', icon: Code2 },
};

const SUPPORT_LABELS: Record<string, string> = {
    revisions: 'Revisions',
    taxonomies: 'Categories & Tags',
    seo: 'SEO Metadata',
    media: 'Media Library',
    workflow: 'Publishing Workflow',
};

export default function ContentTypesIndex({
    contentTypes,
    availableSupports,
}: {
    contentTypes: ContentTypeRecord[];
    availableSupports: string[];
}) {
    const { currentTeam } = usePage().props as {
        currentTeam?: { slug: string } | null;
    };
    const tp = currentTeam?.slug ? `/${currentTeam.slug}` : '';

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<ContentTypeRecord | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<ContentTypeRecord | null>(null);

    const form = useForm<{
        name: string;
        slug: string;
        description: string;
        icon: string;
        supports: string[];
    }>({
        name: '',
        slug: '',
        description: '',
        icon: 'file-text',
        supports: [...availableSupports],
    });

    const openCreate = () => {
        setEditing(null);
        form.setData({
            name: '',
            slug: '',
            description: '',
            icon: 'file-text',
            supports: [...availableSupports],
        });
        form.clearErrors();
        setDialogOpen(true);
    };

    const openEdit = (type: ContentTypeRecord) => {
        setEditing(type);
        form.setData({
            name: type.name,
            slug: type.slug,
            description: type.description ?? '',
            icon: type.icon ?? 'file-text',
            supports: type.supports ?? [...availableSupports],
        });
        form.clearErrors();
        setDialogOpen(true);
    };

    const toggleSupport = (feature: string, checked: boolean) => {
        const current = form.data.supports;
        form.setData(
            'supports',
            checked ? [...current, feature] : current.filter((item) => item !== feature),
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editing) {
            form.put(`${tp}/content/types/${editing.slug}`, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Content type updated.');
                    setDialogOpen(false);
                },
            });
        } else {
            form.post(`${tp}/content/types`, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Content type created.');
                    setDialogOpen(false);
                },
            });
        }
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        router.delete(`${tp}/content/types/${deleteTarget.slug}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Content type deleted.');
                setDeleteTarget(null);
            },
            onError: (errors) => {
                toast.error((errors as Record<string, string>).content_type || 'Unable to delete content type.');
                setDeleteTarget(null);
            },
        });
    };

    const customCount = contentTypes.filter((t) => !t.is_system).length;
    const totalItems = contentTypes.reduce((sum, t) => sum + (t.contents_count ?? 0), 0);

    return (
        <>
            <Head title="Content Types — Content Studio" />

            <div className="flex h-full flex-1 flex-col">
                {/* Header */}
                <div className="border-b border-border/60 bg-card/60 px-6 py-5 backdrop-blur-sm">
                    <div className="mx-auto max-w-6xl">
                        <nav className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Link href={`${tp}/content`} className="hover:text-foreground">
                                Content Studio
                            </Link>
                            <ChevronRight className="h-3 w-3" />
                            <span className="font-medium text-foreground">Content Types</span>
                        </nav>

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1A73E8]/10 text-[#1A73E8] dark:bg-[#8AB4F8]/15 dark:text-[#8AB4F8]">
                                        <Layers className="h-5 w-5" />
                                    </div>
                                    <h1 className="text-xl font-semibold tracking-tight text-foreground">
                                        Content Types
                                    </h1>
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Define structured content schemas and enabled editorial capabilities.
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" className="rounded-full" asChild>
                                    <Link href={`${tp}/content`}>Back to Studio</Link>
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={openCreate}
                                    className="rounded-full bg-[#1A73E8] text-white hover:bg-[#1557B0] dark:bg-[#8AB4F8] dark:text-[#041E49]"
                                >
                                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                                    New Content Type
                                </Button>
                            </div>
                        </div>

                        <div className="mt-5 flex gap-6 border-t border-border/50 pt-4">
                            <div>
                                <p className="text-xl font-semibold tabular-nums">{contentTypes.length}</p>
                                <p className="text-xs text-muted-foreground">Total Types</p>
                            </div>
                            <div className="w-px bg-border" />
                            <div>
                                <p className="text-xl font-semibold tabular-nums">{customCount}</p>
                                <p className="text-xs text-muted-foreground">Custom Types</p>
                            </div>
                            <div className="w-px bg-border" />
                            <div>
                                <p className="text-xl font-semibold tabular-nums">{totalItems}</p>
                                <p className="text-xs text-muted-foreground">Team Entries</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-auto p-6">
                    <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {contentTypes.map((type) => {
                            const IconComp = ICONS[type.icon || 'file-text']?.icon ?? FileText;
                            const canDelete = !type.is_system && type.contents_count === 0;

                            return (
                                <div
                                    key={type.id}
                                    className="flex flex-col rounded-2xl border border-border/60 bg-card p-5 shadow-2xs transition-shadow hover:shadow-sm"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1A73E8]/10 text-[#1A73E8] dark:bg-[#8AB4F8]/15 dark:text-[#8AB4F8]">
                                                <IconComp className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h2 className="text-base font-semibold text-foreground">
                                                        {type.name}
                                                    </h2>
                                                    {type.is_system && (
                                                        <Badge variant="secondary" className="gap-1 rounded-full text-[10px]">
                                                            <Shield className="h-2.5 w-2.5" />
                                                            System
                                                        </Badge>
                                                    )}
                                                </div>
                                                <code className="text-[11px] font-mono text-muted-foreground">
                                                    {type.slug}
                                                </code>
                                            </div>
                                        </div>

                                        <Badge variant="outline" className="rounded-full text-xs tabular-nums">
                                            {type.contents_count} items
                                        </Badge>
                                    </div>

                                    <p className="mt-3 flex-1 text-xs leading-relaxed text-muted-foreground">
                                        {type.description || 'No description provided.'}
                                    </p>

                                    <div className="mt-4 flex flex-wrap gap-1.5">
                                        {(type.supports ?? []).map((cap) => (
                                            <span
                                                key={cap}
                                                className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                                            >
                                                {SUPPORT_LABELS[cap] ?? cap}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="mt-5 flex items-center justify-end gap-2 border-t border-border/50 pt-3">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openEdit(type)}
                                            className="h-8 rounded-full px-3 text-xs"
                                        >
                                            <Pencil className="mr-1.5 h-3.5 w-3.5" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            disabled={!canDelete}
                                            onClick={() => setDeleteTarget(type)}
                                            title={
                                                type.is_system
                                                    ? 'System types cannot be deleted'
                                                    : type.contents_count > 0
                                                      ? 'Remove content items before deleting'
                                                      : 'Delete content type'
                                            }
                                            className="h-8 rounded-full px-3 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
                                        >
                                            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Create / Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editing ? `Edit ${editing.name}` : 'New Content Type'}
                        </DialogTitle>
                        <DialogDescription>
                            Configure the schema identity and enabled editorial features.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="ct-name">Name</Label>
                                <Input
                                    id="ct-name"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    placeholder="e.g. Case Study"
                                    required
                                />
                                {form.errors.name && (
                                    <p className="text-xs text-destructive">{form.errors.name}</p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="ct-slug">Slug</Label>
                                <Input
                                    id="ct-slug"
                                    value={form.data.slug}
                                    onChange={(e) => form.setData('slug', e.target.value)}
                                    placeholder="auto-generated"
                                />
                                {form.errors.slug && (
                                    <p className="text-xs text-destructive">{form.errors.slug}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="ct-icon">Icon</Label>
                            <Select
                                value={form.data.icon}
                                onValueChange={(v) => form.setData('icon', v)}
                            >
                                <SelectTrigger id="ct-icon">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(ICONS).map(([key, meta]) => (
                                        <SelectItem key={key} value={key}>
                                            {meta.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="ct-desc">Description</Label>
                            <Textarea
                                id="ct-desc"
                                rows={2}
                                value={form.data.description}
                                onChange={(e) => form.setData('description', e.target.value)}
                                placeholder="Describe what this content type is used for..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Enabled Capabilities</Label>
                            <div className="grid grid-cols-2 gap-2.5 rounded-xl border border-border/60 bg-muted/20 p-3">
                                {availableSupports.map((feature) => (
                                    <label
                                        key={feature}
                                        className="flex cursor-pointer items-center gap-2 text-xs text-foreground"
                                    >
                                        <Checkbox
                                            checked={form.data.supports.includes(feature)}
                                            onCheckedChange={(checked) =>
                                                toggleSupport(feature, Boolean(checked))
                                            }
                                        />
                                        <span>{SUPPORT_LABELS[feature] ?? feature}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="rounded-full bg-[#1A73E8] text-white hover:bg-[#1557B0] dark:bg-[#8AB4F8] dark:text-[#041E49]"
                            >
                                {form.processing
                                    ? 'Saving...'
                                    : editing
                                      ? 'Save Changes'
                                      : 'Create Type'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog
                open={Boolean(deleteTarget)}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Content Type?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove "{deleteTarget?.name ?? ''}". This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
