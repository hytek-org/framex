import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Plus,
    FileText,
    MoreHorizontal,
    Edit,
    Trash2,
    Users,
    ClipboardList,
    CheckCircle2,
    ExternalLink,
    Code,
} from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface FormItem {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    is_active: boolean;
    submissions_count: number;
    fields: any[];
    created_at: string;
}

interface Props {
    forms: {
        data: FormItem[];
        current_page: number;
        last_page: number;
        total: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
}

export default function FormsIndex({ forms }: Props) {
    const { currentTeam } = usePage().props as any;
    const teamSlug = currentTeam?.slug || '';

    const handleDelete = (formId: number, name: string) => {
        if (confirm(`Are you sure you want to delete form "${name}"? All associated submissions will also be removed.`)) {
            router.delete(`/${teamSlug}/forms/${formId}`);
        }
    };

    return (
        <>
            <Head title="Forms Engine" />

            <div className="p-6 space-y-6 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <ClipboardList className="h-6 w-6 text-primary" />
                            Forms Engine
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Build dynamic forms, capture customer leads, and export submissions.
                        </p>
                    </div>

                    <Button asChild>
                        <Link href={`/${teamSlug}/forms/create`}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Form
                        </Link>
                    </Button>
                </div>

                <div className="border rounded-xl overflow-hidden bg-card shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Form Name</TableHead>
                                <TableHead>Endpoint Slug</TableHead>
                                <TableHead>Fields</TableHead>
                                <TableHead>Submissions</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-20"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {forms.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                        <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                                        No forms found. Create your first contact or lead capture form!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                forms.data.map((form) => (
                                    <TableRow key={form.id} className="hover:bg-muted/40">
                                        <TableCell className="font-semibold text-foreground">
                                            <Link
                                                href={`/${teamSlug}/forms/${form.id}/submissions`}
                                                className="hover:underline"
                                            >
                                                {form.name}
                                            </Link>
                                            {form.description && (
                                                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                                    {form.description}
                                                </p>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted">
                                                /forms/{form.slug}/submit
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {form.fields?.length || 0} fields
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="font-mono">
                                                {form.submissions_count} responses
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {form.is_active ? (
                                                <Badge variant="outline" className="text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300">
                                                    Active
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-muted-foreground">
                                                    Paused
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/${teamSlug}/forms/${form.id}/submissions`}>
                                                            <Users className="mr-2 h-4 w-4" />
                                                            View Submissions
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/${teamSlug}/forms/${form.id}/edit`}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit Schema
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(form.id, form.name)}
                                                        className="text-destructive focus:text-destructive"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </>
    );
}

FormsIndex.layout = (props: { currentTeam?: { slug?: string } }) => {
    const teamSlug = props.currentTeam?.slug || '';

    return {
        breadcrumbs: [
            { title: 'Dashboard', href: `/${teamSlug}/dashboard` },
            { title: 'Forms Engine', href: `/${teamSlug}/forms` },
        ],
    };
};
