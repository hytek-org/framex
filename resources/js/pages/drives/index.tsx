import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowDownAZ,
    ArrowDownWideNarrow,
    ArrowUpAZ,
    ArrowUpWideNarrow,
    Check,
    ChevronRight,
    Download,
    FileImage,
    FileText,
    Folder,
    FolderPlus,
    Grid2X2,
    HardDrive,
    ImagePlus,
    List,
    LoaderCircle,
    MoreHorizontal,
    Move,
    Pencil,
    RotateCcw,
    RotateCw,
    Search,
    Share2,
    Trash2,
    Upload,
    X,
} from 'lucide-react';
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ChangeEvent,
    type DragEvent,
    type FormEvent,
} from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

type FolderItem = {
    id: number;
    name: string;
    parent_id: number | null;
    parent_name?: string | null;
    created_at: string;
};

type FileItem = {
    id: number;
    name: string;
    mime_type: string;
    size: number;
    folder_id: number | null;
    folder_name: string | null;
    uploader_name: string | null;
    created_at: string | null;
    can_preview: boolean;
    preview_kind: 'image' | 'pdf' | null;
};

type Paginator<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
    total: number;
};

type Props = {
    files: Paginator<FileItem>;
    folders: Paginator<FolderItem>;
    currentFolder: Pick<FolderItem, 'id' | 'name' | 'parent_id'> | null;
    breadcrumbs: { id: number; name: string }[];
    filters: { q: string; sort: 'name' | 'date' | 'size'; direction: 'asc' | 'desc' };
    limits?: { max_file_bytes: number; max_folder_depth: number };
};

type DialogState =
    | { kind: 'create-folder'; value: string }
    | { kind: 'rename-file'; id: number; value: string }
    | { kind: 'rename-folder'; id: number; value: string }
    | null;

type DeleteState = { kind: 'file' | 'folder'; id: number; name: string } | null;
type MoveState = { kind: 'file' | 'folder'; id: number; name: string; fromFolderId: number | null } | null;

const ALLOWED_EXTENSIONS = new Set([
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
    'txt', 'csv', 'png', 'jpg', 'jpeg', 'webp', 'gif',
]);
const MAX_UPLOAD_BYTES = 102400;
const IMAGE_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

function extensionOf(name: string): string {
    return name.includes('.') ? name.split('.').pop()?.toLowerCase() ?? '' : '';
}

function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatMime(mime: string): string {
    const labels: Record<string, string> = {
        'application/pdf': 'PDF',
        'application/msword': 'Word',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
        'application/vnd.ms-excel': 'Excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
        'application/vnd.ms-powerpoint': 'PowerPoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint',
        'text/plain': 'Text',
        'text/csv': 'CSV',
        'image/jpeg': 'JPEG',
        'image/png': 'PNG',
        'image/webp': 'WEBP',
        'image/gif': 'GIF',
    };
    return labels[mime] ?? mime.split('/').pop()?.toUpperCase() ?? 'FILE';
}

function isTextFile(file: File): boolean {
    return ['txt', 'csv'].includes(extensionOf(file.name));
}

function isImageFile(file: File): boolean {
    return IMAGE_MIMES.has(file.type) || ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(extensionOf(file.name));
}

async function rotateImageFile(file: File, degrees: number): Promise<File> {
    if (degrees % 360 === 0) return file;
    if (typeof createImageBitmap === 'undefined') {
        throw new Error('Image editing is not supported by this browser.');
    }

    const bitmap = await createImageBitmap(file);
    const radians = (degrees * Math.PI) / 180;
    const quarterTurn = Math.abs(degrees % 180) === 90;
    const canvas = document.createElement('canvas');
    canvas.width = quarterTurn ? bitmap.height : bitmap.width;
    canvas.height = quarterTurn ? bitmap.width : bitmap.height;

    const context = canvas.getContext('2d');
    if (!context) {
        bitmap.close();
        throw new Error('Unable to prepare the image for editing.');
    }

    context.translate(canvas.width / 2, canvas.height / 2);
    context.rotate(radians);
    context.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);
    bitmap.close();

    const expectedMime = ({
        jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp',
    } as Record<string, string>)[extensionOf(file.name)] ?? file.type;
    const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((result) => {
            if (result) resolve(result);
            else reject(new Error('Unable to export the edited image.'));
        }, expectedMime);
    });

    if (blob.type !== expectedMime) {
        throw new Error('This browser cannot export the image in its original format. Reset the rotation or choose another image.');
    }
    if (blob.size > MAX_UPLOAD_BYTES) {
        throw new Error('The edited image exceeds the 100 KB upload limit. Choose a smaller image.');
    }

    return new File([blob], file.name, { type: blob.type, lastModified: Date.now() });
}

export default function DriveIndex({
    files,
    folders,
    currentFolder,
    breadcrumbs,
    filters,
    limits,
}: Props) {
    const page = usePage().props as unknown as {
        currentTeam?: { slug?: string };
        current_team?: { slug?: string };
        errors?: Record<string, string>;
        flash?: { success?: string; warning?: string };
    };
    const teamSlug = page.currentTeam?.slug ?? page.current_team?.slug;
    const baseUrl = `${teamSlug ? `/${teamSlug}` : ''}/drive`;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [query, setQuery] = useState(filters.q);
    const [sort, setSort] = useState<Props['filters']['sort']>(filters.sort);
    const [direction, setDirection] = useState<Props['filters']['direction']>(filters.direction);
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [isNavigating, setIsNavigating] = useState(false);
    const [dialog, setDialog] = useState<DialogState>(null);
    const [deleteTarget, setDeleteTarget] = useState<DeleteState>(null);
    const [pendingMove, setPendingMove] = useState<MoveState>(null);
    const [isMoving, setIsMoving] = useState(false);
    const [moveError, setMoveError] = useState('');
    const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
    const [shareUrl, setShareUrl] = useState('');
    const [shareError, setShareError] = useState('');
    const [isSharing, setIsSharing] = useState(false);

    const [uploadOpen, setUploadOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [textDraft, setTextDraft] = useState('');
    const [rotation, setRotation] = useState(0);
    const [uploadError, setUploadError] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isPreparing, setIsPreparing] = useState(false);

    const maxBytes = limits?.max_file_bytes ?? MAX_UPLOAD_BYTES;
    const serverError = Object.values(page.errors ?? {}).find((value) => typeof value === 'string');
    const visibleError = uploadError || moveError || serverError;
    const warningMessage = page.flash?.warning;

    useEffect(() => {
        setQuery(filters.q);
        setSort(filters.sort);
        setDirection(filters.direction);
    }, [filters.q, filters.sort, filters.direction]);

    useEffect(() => {
        if (!selectedFile || (!isImageFile(selectedFile) && extensionOf(selectedFile.name) !== 'pdf')) {
            setPreviewUrl(null);
            return;
        }

        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [selectedFile]);

    const navigate = useCallback((folderId: number | null, nextQuery = query, nextSort = sort, nextDirection = direction) => {
        setIsNavigating(true);
        router.get(
            baseUrl,
            {
                folder: folderId ?? undefined,
                q: nextQuery.trim() || undefined,
                sort: nextSort,
                direction: nextDirection,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onFinish: () => setIsNavigating(false),
            },
        );
    }, [baseUrl, direction, query, sort]);

    const resetUploadDraft = useCallback(() => {
        setSelectedFile(null);
        setTextDraft('');
        setRotation(0);
        setUploadError('');
        setUploadProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, []);

    const chooseFile = useCallback(async (file?: File) => {
        if (!file) return;
        setUploadError('');
        const extension = extensionOf(file.name);

        if (!ALLOWED_EXTENSIONS.has(extension)) {
            setUploadError('This file format is not supported. Choose a PDF, Office document, text file, CSV, or supported image.');
            return;
        }
        if (file.size > maxBytes) {
            setUploadError(`Files must not exceed ${formatSize(maxBytes)}.`);
            return;
        }
        if (!file.size) {
            setUploadError('Empty files cannot be uploaded.');
            return;
        }

        setSelectedFile(file);
        setRotation(0);
        setTextDraft('');

        if (isTextFile(file)) {
            try {
                const contents = await file.text();
                if (contents.includes('\0')) throw new Error('This text file contains unsupported binary data.');
                setTextDraft(contents);
            } catch {
                setSelectedFile(null);
                setUploadError('Unable to read this text file.');
            }
        }
    }, [maxBytes]);

    function handleFileInput(event: ChangeEvent<HTMLInputElement>) {
        void chooseFile(event.target.files?.[0]);
    }

    function handleDrop(event: DragEvent<HTMLDivElement>) {
        event.preventDefault();
        void chooseFile(event.dataTransfer.files?.[0]);
    }

    function openUpload() {
        resetUploadDraft();
        setUploadOpen(true);
    }

    async function submitUpload(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!selectedFile || isUploading) return;

        setUploadError('');
        setIsPreparing(true);

        try {
            let finalFile = selectedFile;
            const extension = extensionOf(selectedFile.name);

            if (isTextFile(selectedFile)) {
                finalFile = new File([textDraft], selectedFile.name, {
                    type: extension === 'csv' ? 'text/csv' : 'text/plain',
                    lastModified: Date.now(),
                });
            } else if (isImageFile(selectedFile) && rotation % 360 !== 0 && extension !== 'gif') {
                finalFile = await rotateImageFile(selectedFile, rotation);
            }

            if (finalFile.size > maxBytes) {
                throw new Error(`The edited file exceeds ${formatSize(maxBytes)}.`);
            }

            const data = new FormData();
            data.append('file', finalFile);
            if (currentFolder) data.append('folder_id', String(currentFolder.id));

            setIsPreparing(false);
            setIsUploading(true);
            setUploadProgress(0);

            router.post(baseUrl, data, {
                forceFormData: true,
                onProgress: (progress) => setUploadProgress(progress?.percentage ?? 0),
                onSuccess: () => {
                    setUploadOpen(false);
                    resetUploadDraft();
                },
                onError: (errors) => {
                    setUploadError(errors.file ?? Object.values(errors)[0] ?? 'Upload failed. Please try again.');
                },
                onFinish: () => {
                    setIsUploading(false);
                    setIsPreparing(false);
                    setUploadProgress(0);
                },
            });
        } catch (error) {
            setIsPreparing(false);
            setUploadError(error instanceof Error ? error.message : 'Unable to prepare this file.');
        }
    }

    function submitNameDialog(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!dialog) return;

        const name = dialog.value.trim();
        if (!name) return;

        const options = { onSuccess: () => setDialog(null) };
        if (dialog.kind === 'create-folder') {
            router.post(`${baseUrl}/folders`, { name, parent_id: currentFolder?.id ?? null }, options);
        } else if (dialog.kind === 'rename-file') {
            router.patch(`${baseUrl}/${dialog.id}/rename`, { name }, options);
        } else {
            router.patch(`${baseUrl}/folders/${dialog.id}/rename`, { name }, options);
        }
    }

    function performMove() {
        if (!pendingMove || isMoving) return;

        const destinationId = currentFolder?.id ?? null;
        if (pendingMove.fromFolderId === destinationId) {
            setMoveError('This item is already in the selected destination. Open another folder or choose My Drive.');
            return;
        }

        setMoveError('');
        setIsMoving(true);
        router.patch(
            `${baseUrl}/move`,
            {
                kind: pendingMove.kind,
                id: pendingMove.id,
                folder_id: destinationId,
            },
            {
                preserveScroll: true,
                onSuccess: () => setPendingMove(null),
                onError: (errors) => {
                    setMoveError(errors.folder ?? errors.file ?? Object.values(errors)[0] ?? 'Move failed. Please try again.');
                },
                onFinish: () => setIsMoving(false),
            },
        );
    }

    async function createShareLink(kind: 'file' | 'folder', id: number) {
        if (isSharing) return;
        setIsSharing(true);
        setShareError('');
        setShareUrl('');
        try {
            const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
            const endpoint = kind === 'file' ? `${baseUrl}/${id}/share` : `${baseUrl}/folders/${id}/share`;
            const response = await fetch(endpoint, {
                method: 'POST',
                credentials: 'same-origin',
                headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(token ? { 'X-CSRF-TOKEN': token } : {}), 'X-Requested-With': 'XMLHttpRequest' },
                body: JSON.stringify({}),
            });
            const payload = await response.json().catch(() => ({}));
            if (!response.ok || typeof payload.url !== 'string') throw new Error(payload.message ?? 'Unable to create a share link. Please try again.');
            setShareUrl(payload.url);
            try { await navigator.clipboard.writeText(payload.url); } catch { /* URL remains available for manual copying. */ }
        } catch (error) {
            setShareError(error instanceof Error ? error.message : 'Unable to create a share link.');
        } finally {
            setIsSharing(false);
        }
    }

    function performDelete() {
        if (!deleteTarget) return;
        const url = deleteTarget.kind === 'file'
            ? `${baseUrl}/${deleteTarget.id}`
            : `${baseUrl}/folders/${deleteTarget.id}`;
        router.delete(url, { onSuccess: () => setDeleteTarget(null) });
    }

    const isSearch = filters.q.trim().length > 0;
    const noResults = folders.data.length === 0 && files.data.length === 0;
    const textFileEditing = selectedFile ? isTextFile(selectedFile) : false;
    const imageEditing = selectedFile ? isImageFile(selectedFile) && extensionOf(selectedFile.name) !== 'gif' : false;
    const selectedExtension = selectedFile ? extensionOf(selectedFile.name) : '';
    const textDraftSize = useMemo(() => new Blob([textDraft]).size, [textDraft]);
    const selectedSize = selectedFile
        ? textFileEditing ? textDraftSize : selectedFile.size
        : 0;

    return (
        <>
            <Head title="Drive" />

            <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
                {/* Page heading */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <HardDrive className="size-5" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-2xl font-semibold tracking-tight">Drive</h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                A shared, organized space for your team’s documents and images.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" onClick={() => setDialog({ kind: 'create-folder', value: '' })}>
                            <FolderPlus className="mr-2 size-4" /> New folder
                        </Button>
                        <Button onClick={openUpload}>
                            <Upload className="mr-2 size-4" /> Upload files
                        </Button>
                    </div>
                </div>

                {/* Search and view controls */}
                <div className="flex flex-col gap-3 rounded-2xl border bg-card p-3 shadow-sm sm:flex-row sm:items-center">
                    <form
                        className="flex min-w-0 flex-1 gap-2"
                        onSubmit={(event) => {
                            event.preventDefault();
                            navigate(currentFolder?.id ?? null, query);
                        }}
                    >
                        <div className="relative min-w-0 flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search all files and folders…"
                                maxLength={100}
                                className="h-10 border-0 bg-muted/50 pl-9 shadow-none focus-visible:ring-1"
                            />
                        </div>
                        <Button type="submit" variant="secondary" className="h-10">Search</Button>
                        {filters.q && (
                            <Button type="button" variant="ghost" size="icon" aria-label="Clear search" onClick={() => {
                                setQuery('');
                                navigate(currentFolder?.id ?? null, '');
                            }}>
                                <X className="size-4" />
                            </Button>
                        )}
                    </form>

                    <div className="flex items-center gap-2">
                        <Select
                            value={sort}
                            onValueChange={(value) => {
                                const nextSort = value as Props['filters']['sort'];
                                setSort(nextSort);
                                navigate(currentFolder?.id ?? null, query, nextSort, direction);
                            }}
                        >
                            <SelectTrigger className="h-10 w-34.5" aria-label="Sort items">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="date">Date modified</SelectItem>
                                <SelectItem value="name">Name</SelectItem>
                                <SelectItem value="size">File size</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            aria-label={direction === 'asc' ? 'Sort descending' : 'Sort ascending'}
                            onClick={() => {
                                const next = direction === 'asc' ? 'desc' : 'asc';
                                setDirection(next);
                                navigate(currentFolder?.id ?? null, query, sort, next);
                            }}
                        >
                            {sort === 'name'
                                ? direction === 'asc' ? <ArrowDownAZ className="size-4" /> : <ArrowUpAZ className="size-4" />
                                : direction === 'asc' ? <ArrowUpWideNarrow className="size-4" /> : <ArrowDownWideNarrow className="size-4" />}
                        </Button>
                        <div className="flex items-center rounded-lg border bg-background p-1">
                            <Button type="button" size="icon" variant={view === 'grid' ? 'secondary' : 'ghost'} className="size-8" aria-label="Grid view" aria-pressed={view === 'grid'} onClick={() => setView('grid')}>
                                <Grid2X2 className="size-4" />
                            </Button>
                            <Button type="button" size="icon" variant={view === 'list' ? 'secondary' : 'ghost'} className="size-8" aria-label="List view" aria-pressed={view === 'list'} onClick={() => setView('list')}>
                                <List className="size-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Breadcrumb navigation */}
                <div className="flex min-w-0 flex-wrap items-center gap-1 text-sm" aria-label="Folder breadcrumbs">
                    <Button type="button" variant="ghost" size="sm" className="h-8 px-2 font-medium" onClick={() => navigate(null)}>
                        My Drive
                    </Button>
                    {breadcrumbs.map((crumb) => (
                        <div key={crumb.id} className="flex min-w-0 items-center gap-1">
                            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className={`h-8 max-w-48 truncate px-2 ${currentFolder?.id === crumb.id ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}
                                onClick={() => navigate(crumb.id)}
                            >
                                {crumb.name}
                            </Button>
                        </div>
                    ))}
                    {isSearch && <Badge variant="secondary" className="ml-2">Search results</Badge>}
                </div>

                {/* Move mode */}
                {pendingMove && (
                    <div className="flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Move className="size-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium">Move “{pendingMove.name}”</p>
                                <p className="text-xs text-muted-foreground">Navigate to a destination folder, then choose Move here.</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button size="sm" disabled={isMoving} onClick={performMove}>
                                {isMoving ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <Move className="mr-2 size-4" />}
                                {isMoving ? 'Moving…' : 'Move here'}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => { setPendingMove(null); setMoveError(''); }}>Cancel</Button>
                        </div>
                    </div>
                )}

                {/* Feedback */}
                {(visibleError || warningMessage || page.flash?.success) && (
                    <div
                        className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${visibleError ? 'border-destructive/30 bg-destructive/5 text-destructive' : warningMessage ? 'border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400' : 'border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400'}`}
                        role={visibleError ? 'alert' : 'status'}
                    >
                        {visibleError ? <X className="mt-0.5 size-4 shrink-0" /> : <Check className="mt-0.5 size-4 shrink-0" />}
                        <span>{visibleError ?? warningMessage ?? page.flash?.success}</span>
                    </div>
                )}

                {/* Loading state */}
                {isNavigating && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
                        <LoaderCircle className="size-4 animate-spin" /> Loading Drive…
                    </div>
                )}

                {/* Folders */}
                {folders.data.length > 0 && (
                    <section className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-semibold">Folders</h2>
                                <p className="text-xs text-muted-foreground">{folders.total} {folders.total === 1 ? 'folder' : 'folders'}</p>
                            </div>
                        </div>

                        {view === 'grid' ? (
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {folders.data.map((folder) => (
                                    <div key={folder.id} className="group flex min-w-0 items-center gap-3 rounded-xl border bg-card p-3 transition-colors hover:border-primary/40 hover:bg-muted/30">
                                        <button type="button" className="flex min-w-0 flex-1 items-center gap-3 text-left" onClick={() => navigate(folder.id)}>
                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                                <Folder className="size-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">{folder.name}</p>
                                                <p className="truncate text-xs text-muted-foreground">{isSearch ? `In ${folder.parent_name ?? 'My Drive'}` : folder.created_at}</p>
                                            </div>
                                        </button>
                                        <ItemMenu
                                            onShare={() => void createShareLink('folder', folder.id)}
                                            onRename={() => setDialog({ kind: 'rename-folder', id: folder.id, value: folder.name })}
                                            onMove={() => { setMoveError(''); setPendingMove({ kind: 'folder', id: folder.id, name: folder.name, fromFolderId: folder.parent_id }); }}
                                            onDelete={() => setDeleteTarget({ kind: 'folder', id: folder.id, name: folder.name })}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="overflow-hidden rounded-xl border bg-card">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead className="hidden sm:table-cell">Location</TableHead>
                                            <TableHead className="hidden md:table-cell">Created</TableHead>
                                            <TableHead className="w-12" />
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {folders.data.map((folder) => (
                                            <TableRow key={folder.id}>
                                                <TableCell>
                                                    <button type="button" className="flex min-w-0 items-center gap-3 text-left" onClick={() => navigate(folder.id)}>
                                                        <Folder className="size-5 shrink-0 text-amber-500" />
                                                        <span className="truncate font-medium">{folder.name}</span>
                                                    </button>
                                                </TableCell>
                                                <TableCell className="hidden text-muted-foreground sm:table-cell">{folder.parent_name ?? 'My Drive'}</TableCell>
                                                <TableCell className="hidden text-muted-foreground md:table-cell">{folder.created_at}</TableCell>
                                                <TableCell>
                                                    <ItemMenu
                                                        onShare={() => void createShareLink('folder', folder.id)}
                                                        onRename={() => setDialog({ kind: 'rename-folder', id: folder.id, value: folder.name })}
                                                        onMove={() => { setMoveError(''); setPendingMove({ kind: 'folder', id: folder.id, name: folder.name, fromFolderId: folder.parent_id }); }}
                                                        onDelete={() => setDeleteTarget({ kind: 'folder', id: folder.id, name: folder.name })}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                        <Pagination current={folders.current_page} last={folders.last_page} previous={folders.prev_page_url} next={folders.next_page_url} />
                    </section>
                )}

                {/* Files */}
                {files.data.length > 0 && (
                    <section className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-semibold">Files</h2>
                                <p className="text-xs text-muted-foreground">{files.total} {files.total === 1 ? 'file' : 'files'}</p>
                            </div>
                        </div>

                        {view === 'grid' ? (
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {files.data.map((file) => (
                                    <div key={file.id} className="group min-w-0 rounded-xl border bg-card p-4 transition-colors hover:border-primary/40 hover:shadow-sm">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${file.preview_kind === 'image' ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400' : 'bg-primary/10 text-primary'}`}>
                                                {file.preview_kind === 'image' ? <FileImage className="size-5" /> : <FileText className="size-5" />}
                                            </div>
                                            <ItemMenu
                                                onShare={() => void createShareLink('file', file.id)}
                                                onRename={() => setDialog({ kind: 'rename-file', id: file.id, value: file.name })}
                                                onMove={() => { setMoveError(''); setPendingMove({ kind: 'file', id: file.id, name: file.name, fromFolderId: file.folder_id }); }}
                                                onDelete={() => setDeleteTarget({ kind: 'file', id: file.id, name: file.name })}
                                            />
                                        </div>
                                        <div className="mt-3 min-w-0">
                                            <p className="truncate text-sm font-medium" title={file.name}>{file.name}</p>
                                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                <Badge variant="secondary" className="font-normal">{formatMime(file.mime_type)}</Badge>
                                                <span>{formatSize(file.size)}</span>
                                            </div>
                                            <p className="mt-2 truncate text-xs text-muted-foreground" title={file.uploader_name ?? undefined}>
                                                {file.uploader_name ?? 'Unknown uploader'} · {file.created_at ?? '—'}
                                            </p>
                                            {isSearch && <p className="mt-1 truncate text-xs text-muted-foreground">In {file.folder_name ?? 'My Drive'}</p>}
                                        </div>
                                        <div className="mt-4 flex items-center gap-2 border-t pt-3">
                                            {file.can_preview && (
                                                <Button variant="outline" size="sm" className="flex-1" onClick={() => setPreviewFile(file)}>
                                                    <Search className="mr-2 size-3.5" /> Preview
                                                </Button>
                                            )}
                                            <Button asChild variant={file.can_preview ? 'ghost' : 'outline'} size="sm" className={file.can_preview ? '' : 'flex-1'}>
                                                <a href={`${baseUrl}/${file.id}/download`}>
                                                    <Download className="mr-2 size-3.5" /> Download
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="overflow-hidden rounded-xl border bg-card">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead className="hidden sm:table-cell">Type</TableHead>
                                            <TableHead className="hidden md:table-cell">Size</TableHead>
                                            <TableHead className="hidden lg:table-cell">Uploaded by</TableHead>
                                            <TableHead className="hidden md:table-cell">Uploaded</TableHead>
                                            <TableHead className="w-12" />
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {files.data.map((file) => (
                                            <TableRow key={file.id}>
                                                <TableCell>
                                                    <div className="flex min-w-0 items-center gap-3">
                                                        {file.preview_kind === 'image' ? <FileImage className="size-5 shrink-0 text-sky-500" /> : <FileText className="size-5 shrink-0 text-primary" />}
                                                        <div className="min-w-0">
                                                            <p className="truncate font-medium" title={file.name}>{file.name}</p>
                                                            {isSearch && <p className="truncate text-xs text-muted-foreground">{file.folder_name ?? 'My Drive'}</p>}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden text-muted-foreground sm:table-cell">{formatMime(file.mime_type)}</TableCell>
                                                <TableCell className="hidden text-muted-foreground md:table-cell">{formatSize(file.size)}</TableCell>
                                                <TableCell className="hidden text-muted-foreground lg:table-cell">{file.uploader_name ?? 'Unknown'}</TableCell>
                                                <TableCell className="hidden text-muted-foreground md:table-cell">{file.created_at ?? '—'}</TableCell>
                                                <TableCell>
                                                    <ItemMenu
                                                        onShare={() => void createShareLink('file', file.id)}
                                                        onPreview={file.can_preview ? () => setPreviewFile(file) : undefined}
                                                        onDownload={() => window.location.assign(`${baseUrl}/${file.id}/download`)}
                                                        onRename={() => setDialog({ kind: 'rename-file', id: file.id, value: file.name })}
                                                        onMove={() => { setMoveError(''); setPendingMove({ kind: 'file', id: file.id, name: file.name, fromFolderId: file.folder_id }); }}
                                                        onDelete={() => setDeleteTarget({ kind: 'file', id: file.id, name: file.name })}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                        <Pagination current={files.current_page} last={files.last_page} previous={files.prev_page_url} next={files.next_page_url} />
                    </section>
                )}

                {/* Empty view */}
                {noResults && (
                    <div className="flex min-h-85 flex-col items-center justify-center rounded-2xl border border-dashed bg-card/50 px-6 py-12 text-center">
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                            {isSearch ? <Search className="size-6" /> : <Folder className="size-6" />}
                        </div>
                        <h2 className="mt-4 text-base font-semibold">{isSearch ? 'No matching items' : 'This folder is empty'}</h2>
                        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                            {isSearch ? 'Try another search term or clear your search.' : 'Create a folder or upload a document to start organizing your team’s Drive.'}
                        </p>
                        {!isSearch && (
                            <div className="mt-5 flex flex-wrap justify-center gap-2">
                                <Button variant="outline" onClick={() => setDialog({ kind: 'create-folder', value: '' })}>
                                    <FolderPlus className="mr-2 size-4" /> New folder
                                </Button>
                                <Button onClick={openUpload}><Upload className="mr-2 size-4" /> Upload files</Button>
                            </div>
                        )}
                    </div>
                )}

                {/* Create / rename dialog */}
                <Dialog open={dialog !== null} onOpenChange={(open) => !open && setDialog(null)}>
                    <DialogContent className="sm:max-w-md">
                        <form onSubmit={submitNameDialog}>
                            <DialogHeader>
                                <DialogTitle>
                                    {dialog?.kind === 'create-folder' ? 'Create a folder' : 'Rename item'}
                                </DialogTitle>
                                <DialogDescription>
                                    {dialog?.kind === 'create-folder'
                                        ? `Create a folder${currentFolder ? ` inside ${currentFolder.name}` : ' in My Drive'}.`
                                        : 'Choose a clear name. File extensions must remain unchanged.'}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-5">
                                <Input
                                    autoFocus
                                    required
                                    maxLength={dialog?.kind === 'rename-file' ? 180 : 120}
                                    value={dialog?.value ?? ''}
                                    onChange={(event) => dialog && setDialog({ ...dialog, value: event.target.value })}
                                    placeholder={dialog?.kind === 'create-folder' ? 'Folder name' : 'New name'}
                                />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
                                <Button type="submit" disabled={!dialog?.value.trim()}>Save</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete confirmation */}
                <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete {deleteTarget?.kind}?</AlertDialogTitle>
                            <AlertDialogDescription>
                                {deleteTarget?.kind === 'folder'
                                    ? `“${deleteTarget.name}” can only be deleted when it is empty. Move or delete its contents first.`
                                    : `“${deleteTarget?.name}” will be permanently deleted. This action cannot be undone.`}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={performDelete} disabled={!deleteTarget} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Upload, preview and lightweight pre-upload editing */}
                <Dialog open={uploadOpen} onOpenChange={(open) => {
                    if (!open && !isUploading) {
                        setUploadOpen(false);
                        resetUploadDraft();
                    }
                }}>
                    <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
                        <form onSubmit={submitUpload}>
                            <DialogHeader>
                                <DialogTitle>Upload to Drive</DialogTitle>
                                <DialogDescription>
                                    Maximum {formatSize(maxBytes)} per file. Documents and supported raster images only.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-5">
                                {!selectedFile ? (
                                    <div
                                        onDragOver={(event) => event.preventDefault()}
                                        onDrop={handleDrop}
                                        className="flex min-h-52 flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-muted/20 px-6 py-8 text-center transition-colors hover:border-primary/50 hover:bg-muted/40"
                                    >
                                        <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                            <ImagePlus className="size-6" />
                                        </div>
                                        <p className="mt-4 text-sm font-medium">Drop a file here or browse</p>
                                        <p className="mt-1 max-w-sm text-xs text-muted-foreground">PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, PNG, JPG, WEBP or GIF.</p>
                                        <Button type="button" variant="outline" className="mt-4" onClick={() => fileInputRef.current?.click()}>
                                            <Upload className="mr-2 size-4" /> Choose file
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 rounded-xl border bg-muted/20 p-3">
                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                {isImageFile(selectedFile) ? <FileImage className="size-5" /> : <FileText className="size-5" />}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">{selectedFile.name}</p>
                                                <p className="text-xs text-muted-foreground">{formatSize(selectedSize)} · {selectedExtension.toUpperCase()}</p>
                                            </div>
                                            <Button type="button" variant="ghost" size="icon" aria-label="Choose a different file" disabled={isUploading} onClick={() => {
                                                resetUploadDraft();
                                                fileInputRef.current?.click();
                                            }}>
                                                <X className="size-4" />
                                            </Button>
                                        </div>

                                        {isImageFile(selectedFile) && previewUrl && (
                                            <div className="space-y-3 rounded-xl border bg-muted/20 p-3">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div>
                                                        <p className="text-sm font-medium">Image preview</p>
                                                        <p className="text-xs text-muted-foreground">Rotate the image before it is saved.</p>
                                                    </div>
                                                    {imageEditing && (
                                                        <div className="flex gap-1">
                                                            <Button type="button" variant="outline" size="icon" aria-label="Rotate image left" onClick={() => setRotation((value) => (value - 90 + 360) % 360)}>
                                                                <RotateCcw className="size-4" />
                                                            </Button>
                                                            <Button type="button" variant="outline" size="icon" aria-label="Rotate image right" onClick={() => setRotation((value) => (value + 90) % 360)}>
                                                                <RotateCw className="size-4" />
                                                            </Button>
                                                            <Button type="button" variant="ghost" size="icon" aria-label="Reset image rotation" onClick={() => setRotation(0)}>
                                                                <RotateCcw className="size-4" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex max-h-72 min-h-44 items-center justify-center overflow-hidden rounded-lg bg-background p-3">
                                                    <img src={previewUrl} alt="Selected upload preview" className="max-h-64 max-w-full object-contain transition-transform" style={{ transform: `rotate(${rotation}deg)` }} />
                                                </div>
                                                {selectedExtension === 'gif' && <p className="text-xs text-muted-foreground">Animated GIFs are previewed as supplied; image editing is disabled to preserve animation.</p>}
                                            </div>
                                        )}

                                        {selectedExtension === 'pdf' && previewUrl && (
                                            <div className="space-y-2 rounded-xl border bg-muted/20 p-3">
                                                <div>
                                                    <p className="text-sm font-medium">PDF preview</p>
                                                    <p className="text-xs text-muted-foreground">Review the document before uploading. PDF content editing is not available in this lightweight editor.</p>
                                                </div>
                                                <iframe title="Selected PDF preview" src={previewUrl} className="h-72 w-full rounded-lg border bg-background" />
                                            </div>
                                        )}

                                        {textFileEditing && (
                                            <div className="space-y-2 rounded-xl border bg-muted/20 p-3">
                                                <div>
                                                    <p className="text-sm font-medium">Edit text before upload</p>
                                                    <p className="text-xs text-muted-foreground">Changes are included in the uploaded TXT/CSV file.</p>
                                                </div>
                                                <Textarea
                                                    value={textDraft}
                                                    onChange={(event) => setTextDraft(event.target.value)}
                                                    spellCheck={false}
                                                    className="min-h-56 resize-y bg-background font-mono text-xs"
                                                />
                                                <p className={`text-right text-xs ${textDraftSize > maxBytes ? 'text-destructive' : 'text-muted-foreground'}`}>
                                                    {formatSize(textDraftSize)} / {formatSize(maxBytes)}
                                                </p>
                                            </div>
                                        )}

                                        {!isImageFile(selectedFile) && selectedExtension !== 'pdf' && !textFileEditing && (
                                            <div className="rounded-xl border border-dashed bg-muted/20 p-4">
                                                <div className="flex items-start gap-3">
                                                    <FileText className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                                                    <div>
                                                        <p className="text-sm font-medium">Document ready to upload</p>
                                                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                                            This Office format cannot be safely rendered or edited by the browser without an integrated document editor. The original file will be stored privately and downloaded through an authorized route.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {uploadError && <p className="text-sm text-destructive" role="alert">{uploadError}</p>}
                                {isUploading && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs text-muted-foreground"><span>Uploading securely…</span><span>{uploadProgress}%</span></div>
                                        <Progress value={uploadProgress} />
                                    </div>
                                )}
                            </div>

                            <DialogFooter className="gap-2">
                                <Button type="button" variant="outline" disabled={isUploading || isPreparing} onClick={() => {
                                    setUploadOpen(false);
                                    resetUploadDraft();
                                }}>Cancel</Button>
                                <Button type="submit" disabled={!selectedFile || isUploading || isPreparing || selectedSize > maxBytes}>
                                    {isPreparing || isUploading ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <Upload className="mr-2 size-4" />}
                                    {isPreparing ? 'Preparing…' : isUploading ? 'Uploading…' : 'Upload file'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={Boolean(shareUrl || shareError || isSharing)} onOpenChange={(open) => { if (!open && !isSharing) { setShareUrl(''); setShareError(''); } }}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Share link</DialogTitle>
                            <DialogDescription>Anyone with this link can view this item. The link expires after 7 days.</DialogDescription>
                        </DialogHeader>
                        {isSharing && <div className="flex items-center gap-2 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" /> Creating secure link…</div>}
                        {shareError && <p className="text-sm text-destructive" role="alert">{shareError}</p>}
                        {shareUrl && <div className="space-y-3"><Input readOnly value={shareUrl} onFocus={(event) => event.currentTarget.select()} /><p className="text-xs text-muted-foreground">Read-only access. Folder links include current and future contents. Anyone holding the link can access it until it expires.</p><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => { setShareUrl(''); setShareError(''); }}>Close</Button><Button type="button" onClick={() => void navigator.clipboard.writeText(shareUrl)}><Share2 className="mr-2 size-4" /> Copy link</Button></div></div>}
                    </DialogContent>
                </Dialog>

                {/* Authorized saved-file preview */}
                <Dialog open={previewFile !== null} onOpenChange={(open) => !open && setPreviewFile(null)}>
                    <DialogContent className="max-h-[92vh] max-w-5xl overflow-hidden">
                        <DialogHeader>
                            <DialogTitle className="truncate">{previewFile?.name ?? 'Preview'}</DialogTitle>
                            <DialogDescription>
                                Private preview · {previewFile ? formatMime(previewFile.mime_type) : ''}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex max-h-[72vh] min-h-64 items-center justify-center overflow-auto rounded-xl bg-muted/40 p-2">
                            {previewFile?.preview_kind === 'image' && (
                                <img src={`${baseUrl}/${previewFile.id}/preview`} alt={previewFile.name} className="max-h-[68vh] max-w-full rounded-lg object-contain" />
                            )}
                            {previewFile?.preview_kind === 'pdf' && (
                                <iframe title={`Preview ${previewFile.name}`} src={`${baseUrl}/${previewFile.id}/preview`} className="h-[68vh] w-full rounded-lg border bg-background" />
                            )}
                        </div>
                        <DialogFooter>
                            {previewFile && (
                                <Button asChild>
                                    <a href={`${baseUrl}/${previewFile.id}/download`}><Download className="mr-2 size-4" /> Download</a>
                                </Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.png,.jpg,.jpeg,.webp,.gif"
                    className="hidden"
                    onChange={handleFileInput}
                />
            </div>
        </>
    );
}

function ItemMenu({
    onShare,
    onPreview,
    onDownload,
    onRename,
    onMove,
    onDelete,
}: {
    onShare?: () => void;
    onPreview?: () => void;
    onDownload?: () => void;
    onRename: () => void;
    onMove: () => void;
    onDelete: () => void;
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="size-8 shrink-0" aria-label="Item actions">
                    <MoreHorizontal className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
                {onShare && <DropdownMenuItem onSelect={onShare}><Share2 className="mr-2 size-4" /> Share</DropdownMenuItem>}
                {onPreview && <DropdownMenuItem onSelect={onPreview}><Search className="mr-2 size-4" /> Preview</DropdownMenuItem>}
                {onDownload && <DropdownMenuItem onSelect={onDownload}><Download className="mr-2 size-4" /> Download</DropdownMenuItem>}
                <DropdownMenuItem onSelect={onRename}><Pencil className="mr-2 size-4" /> Rename</DropdownMenuItem>
                <DropdownMenuItem onSelect={onMove}><Move className="mr-2 size-4" /> Move</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={onDelete} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 size-4" /> Delete</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function Pagination({
    current,
    last,
    previous,
    next,
}: {
    current: number;
    last: number;
    previous: string | null;
    next: string | null;
}) {
    if (last <= 1) return null;
    return (
        <div className="flex items-center justify-end gap-2 text-sm">
            <span className="mr-2 text-xs text-muted-foreground">Page {current} of {last}</span>
            {previous ? (
                <Button asChild variant="outline" size="sm"><Link href={previous} preserveScroll>Previous</Link></Button>
            ) : (
                <Button variant="outline" size="sm" disabled>Previous</Button>
            )}
            {next ? (
                <Button asChild variant="outline" size="sm"><Link href={next} preserveScroll>Next</Link></Button>
            ) : (
                <Button variant="outline" size="sm" disabled>Next</Button>
            )}
        </div>
    );
}


