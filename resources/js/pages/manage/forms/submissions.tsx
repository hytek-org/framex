import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Download,
    FileText,
    Calendar,
    Users,
} from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface SubmissionItem {
    id: number;
    data: Record<string, any>;
    ip_address?: string | null;
    status: string;
    created_at: string;
}

interface Props {
    form: {
        id: number;
        name: string;
        slug: string;
        fields: Array<{ name: string; label: string }>;
    };
    submissions: {
        data: SubmissionItem[];
        total: number;
        current_page: number;
        last_page: number;
    };
}

export default function SubmissionsIndex({ form, submissions }: Props) {
    const { currentTeam } = usePage().props as any;
    const teamSlug = currentTeam?.slug || '';
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            const res = await fetch(`/${teamSlug}/forms/${form.id}/submissions/export`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
            });

            if (!res.ok) throw new Error('Export failed');

            const data = await res.json();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${form.slug}-submissions-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (e) {
            alert('Failed to export submissions.');
        } finally {
            setIsExporting(false);
        }
    };

    const displayFields = (form.fields || []).slice(0, 4);

    return (
        <>
            <Head title={`${form.name} — Submissions`} />

            <div className="p-6 space-y-6 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={`/${teamSlug}/forms`}>
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                Forms
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-foreground">
                                {form.name} Submissions
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                Total {submissions.total} recorded responses
                            </p>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExport}
                        disabled={isExporting || submissions.total === 0}
                        className="gap-1.5"
                    >
                        <Download className="h-4 w-4" />
                        {isExporting ? 'Exporting...' : 'Export JSON'}
                    </Button>
                </div>

                <div className="border rounded-xl overflow-hidden bg-card shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-16">#ID</TableHead>
                                {displayFields.map((f) => (
                                    <TableHead key={f.name}>{f.label}</TableHead>
                                ))}
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {submissions.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={displayFields.length + 3} className="text-center py-12 text-muted-foreground">
                                        <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                                        No submissions recorded yet for this form.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                submissions.data.map((sub) => (
                                    <TableRow key={sub.id} className="hover:bg-muted/40">
                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                            #{sub.id}
                                        </TableCell>
                                        {displayFields.map((f) => (
                                            <TableCell key={f.name} className="text-sm">
                                                {sub.data?.[f.name] !== undefined ? (
                                                    typeof sub.data[f.name] === 'boolean' ? (
                                                        sub.data[f.name] ? 'Yes' : 'No'
                                                    ) : (
                                                        String(sub.data[f.name])
                                                    )
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </TableCell>
                                        ))}
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize text-[10px]">
                                                {sub.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {new Date(sub.created_at).toLocaleDateString()}
                                            </span>
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

SubmissionsIndex.layout = (props: { currentTeam?: { slug?: string } }) => {
    const teamSlug = props.currentTeam?.slug || '';

    return {
        breadcrumbs: [
            { title: 'Dashboard', href: `/${teamSlug}/dashboard` },
            { title: 'Forms Engine', href: `/${teamSlug}/forms` },
            { title: 'Submissions', href: '#' },
        ],
    };
};
