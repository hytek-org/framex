import { Form, Head, router, usePage } from '@inertiajs/react';
import { FileText, Trash2, Upload } from 'lucide-react';
import { useRef } from 'react';
import { EmptyState } from '@/components/shared/empty-state';
import { FadeIn } from '@/components/shared/motion';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type FileItem = { id: number; name: string; mime_type: string; size: number; created_at: string };
type Props = { files: FileItem[] };

function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default function FilesIndex({ files }: Props) {
    const { currentTeam } = usePage().props;
    const prefix = currentTeam ? `/${currentTeam.slug}` : '';
    const fileInput = useRef<HTMLInputElement>(null);

    return (
        <>
            <Head title="Files" />
            <div className="space-y-6 p-6">
                <FadeIn>
                    <PageHeader title="Files" description="Upload and manage workspace files.">
                        <Button size="sm" onClick={() => fileInput.current?.click()}>
                            <Upload className="mr-2 h-4 w-4" />Upload
                        </Button>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                router.post(`${prefix}/files`, formData as never);
                            }}
                            className="hidden"
                        >
                            <input
                                ref={fileInput}
                                type="file"
                                name="file"
                                onChange={(e) => {
                                    if (e.target.files?.length) {
                                        const fd = new FormData();
                                        fd.append('file', e.target.files[0]);
                                        router.post(`${prefix}/files`, fd as never);
                                    }
                                }}
                            />
                        </form>
                    </PageHeader>
                </FadeIn>
                <FadeIn delay={0.15}>
                    {files.length > 0 ? (
                        <div className="rounded-2xl border bg-card">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Size</TableHead>
                                        <TableHead>Uploaded</TableHead>
                                        <TableHead className="w-16" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {files.map((file) => (
                                        <TableRow key={file.id}>
                                            <TableCell className="font-medium">{file.name}</TableCell>
                                            <TableCell className="text-muted-foreground">{file.mime_type}</TableCell>
                                            <TableCell className="text-muted-foreground">{formatSize(file.size)}</TableCell>
                                            <TableCell className="text-muted-foreground">{file.created_at}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                                    onClick={() => router.delete(`${prefix}/files/${file.id}`)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <EmptyState icon={FileText} title="No files yet" description="Upload your first file to this workspace." action={{ label: 'Upload File', onClick: () => fileInput.current?.click() }} />
                    )}
                </FadeIn>
            </div>
        </>
    );
}

FilesIndex.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        { title: 'Dashboard', href: props.currentTeam ? `/${props.currentTeam.slug}/dashboard` : '/' },
        { title: 'Files', href: props.currentTeam ? `/${props.currentTeam.slug}/files` : '/files' },
    ],
});
