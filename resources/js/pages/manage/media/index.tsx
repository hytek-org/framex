import { Head, router, usePage } from "@inertiajs/react";
import {
    Folder,
    FolderPlus,
    Image as ImageIcon,
    MoreVertical,
    Search,
    Trash2,
    Upload,
    Copy,
    Check,
    FileText,
} from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MediaItem {
    id: number;
    filename: string;
    path: string;
    url: string;
    mime_type: string;
    size: number;
    alt_text?: string | null;
    caption?: string | null;
    created_at: string;
}

interface MediaFolder {
    id: number;
    name: string;
    slug: string;
    media_count: number;
}

interface Props {
    media: {
        data: MediaItem[];
        current_page: number;
        last_page: number;
        total: number;
    };
    folders: MediaFolder[];
    currentFolder?: MediaFolder | null;
}

export default function Index({
    media,
    folders,
    currentFolder,
}: Props) {
    const { currentTeam } = usePage().props as any;
    const teamSlug = currentTeam?.slug || "";

    const [search, setSearch] = useState("");
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [folderDialogOpen, setFolderDialogOpen] = useState(false);
    const [folderName, setFolderName] = useState("");
    const [fileToUpload, setFileToUpload] = useState<File | null>(null);
    const [altText, setAltText] = useState("");
    const [caption, setCaption] = useState("");
    const [copiedId, setCopiedId] = useState<number | null>(null);

    const formatBytes = (bytes: number): string => {
        if (!bytes) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    };

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        if (!fileToUpload) return;

        const formData = new FormData();
        formData.append("file", fileToUpload);
        if (currentFolder)
            formData.append("folder_id", currentFolder.id.toString());
        if (altText) formData.append("alt_text", altText);
        if (caption) formData.append("caption", caption);

        router.post(`/${teamSlug}/media`, formData, {
            onSuccess: () => {
                setUploadDialogOpen(false);
                setFileToUpload(null);
                setAltText("");
                setCaption("");
            },
        });
    };

    const handleCreateFolder = (e: React.FormEvent) => {
        e.preventDefault();
        if (!folderName.trim()) return;

        router.post(
            `/${teamSlug}/media/folders`,
            {
                name: folderName,
                parent_id: currentFolder?.id ?? null,
            },
            {
                onSuccess: () => {
                    setFolderDialogOpen(false);
                    setFolderName("");
                },
            },
        );
    };

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this media item?")) {
            router.delete(`/${teamSlug}/media/${id}`);
        }
    };

    const handleCopyUrl = (item: MediaItem) => {
        navigator.clipboard.writeText(item.url);
        setCopiedId(item.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <>
            <Head title="Media Studio" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Media Studio
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Centralized asset library with folders, focal
                            points, and CDN URLs.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setFolderDialogOpen(true)}
                        >
                            <FolderPlus className="mr-2 h-4 w-4" />
                            New Folder
                        </Button>
                        <Button onClick={() => setUploadDialogOpen(true)}>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Media
                        </Button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search media files..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>

                {/* Folder Row */}
                {folders.length > 0 && (
                    <div>
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            Folders
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                            {folders.map((folder) => (
                                <button
                                    key={folder.id}
                                    onClick={() =>
                                        router.get(
                                            `/${teamSlug}/media?folder_id=${folder.id}`,
                                        )
                                    }
                                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 text-left transition-colors"
                                >
                                    <Folder className="h-5 w-5 text-indigo-500 shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium truncate">
                                            {folder.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {folder.media_count} items
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Media Grid */}
                <div>
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        Assets ({media.total})
                    </h2>

                    {media.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl text-center">
                            <ImageIcon className="h-10 w-10 text-muted-foreground/60 mb-3" />
                            <h3 className="font-medium text-foreground">
                                No media files found
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Upload your images, assets, or documents to get
                                started.
                            </p>
                            <Button onClick={() => setUploadDialogOpen(true)}>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload First Asset
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {media.data
                                .filter((item) =>
                                    item.filename
                                        .toLowerCase()
                                        .includes(search.toLowerCase()),
                                )
                                .map((item) => {
                                    const isImage =
                                        item.mime_type.startsWith("image/");
                                    return (
                                        <div
                                            key={item.id}
                                            className="group relative rounded-lg border bg-card overflow-hidden flex flex-col justify-between hover:border-primary/50 transition-colors shadow-sm"
                                        >
                                            {/* Preview Thumbnail */}
                                            <div className="aspect-square bg-muted/30 flex items-center justify-center overflow-hidden relative">
                                                {isImage ? (
                                                    <img
                                                        src={item.url}
                                                        alt={
                                                            item.alt_text ||
                                                            item.filename
                                                        }
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <FileText className="h-12 w-12 text-muted-foreground/50" />
                                                )}

                                                {/* Action Overlay */}
                                                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() =>
                                                            handleCopyUrl(item)
                                                        }
                                                        className="h-8 w-8 rounded-full bg-background/90 text-foreground shadow flex items-center justify-center hover:bg-background"
                                                        title="Copy URL"
                                                    >
                                                        {copiedId ===
                                                        item.id ? (
                                                            <Check className="h-4 w-4 text-emerald-500" />
                                                        ) : (
                                                            <Copy className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            asChild
                                                        >
                                                            <button className="h-8 w-8 rounded-full bg-background/90 text-foreground shadow flex items-center justify-center hover:bg-background">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleCopyUrl(
                                                                        item,
                                                                    )
                                                                }
                                                            >
                                                                <Copy className="mr-2 h-4 w-4" />
                                                                Copy URL
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        item.id,
                                                                    )
                                                                }
                                                                className="text-destructive focus:text-destructive"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>

                                            {/* Details */}
                                            <div className="p-2.5">
                                                <p
                                                    className="text-xs font-medium truncate"
                                                    title={item.filename}
                                                >
                                                    {item.filename}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                                    {formatBytes(item.size)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    )}
                </div>
            </div>

            {/* Upload Modal Dialog */}
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upload Media File</DialogTitle>
                    </DialogHeader>
                    <form
                        onSubmit={handleUpload}
                        className="flex flex-col gap-4 py-2"
                    >
                        <div>
                            <Input
                                type="file"
                                onChange={(e) =>
                                    setFileToUpload(e.target.files?.[0] || null)
                                }
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium">
                                Alt Text
                            </label>
                            <Input
                                placeholder="Describe the image for accessibility"
                                value={altText}
                                onChange={(e) => setAltText(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium">
                                Caption
                            </label>
                            <Input
                                placeholder="Optional caption"
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setUploadDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={!fileToUpload}>
                                Upload File
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Create Folder Dialog */}
            <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Media Folder</DialogTitle>
                    </DialogHeader>
                    <form
                        onSubmit={handleCreateFolder}
                        className="flex flex-col gap-4 py-2"
                    >
                        <div>
                            <label className="text-xs font-medium">
                                Folder Name
                            </label>
                            <Input
                                placeholder="e.g. Blog Covers, Brand Assets"
                                value={folderName}
                                onChange={(e) => setFolderName(e.target.value)}
                                autoFocus
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setFolderDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={!folderName.trim()}>
                                Create Folder
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

Index.layout = (props: { 
    currentTeam?: { slug?: string }; 
    currentFolder?: { name: string; slug: string } | null 
}) => {
    const teamSlug = props.currentTeam?.slug || "";
    const currentFolder = props.currentFolder;

    return {
        breadcrumbs: [
            { title: "Dashboard", href: `/${teamSlug}/dashboard` },
            { title: "Media Studio", href: `/${teamSlug}/media` },
            ...(currentFolder
                ? [{ title: currentFolder.name, href: "#" }]
                : []),
        ],
    };
};