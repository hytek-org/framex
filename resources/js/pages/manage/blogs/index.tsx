import { Head, Link,  usePage, router } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    Plus, Edit, Trash2, Eye, Calendar, User, Tag, FolderOpen,
    Search,  MoreHorizontal, BookOpen, FileText
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow
} from '@/components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';



export default function BlogIndex({ blogs }: { blogs: any }) {
    const { currentTeam } = usePage().props as any;
    const tp = currentTeam?.slug ? `/${currentTeam.slug}` : '';
    const [search, setSearch] = useState('');

    const filtered = blogs.data.filter((b: any) =>
        b.title.toLowerCase().includes(search.toLowerCase())
    );

    const published = blogs.data.filter((b: any) => b.is_published).length;
    const drafts = blogs.data.length - published;

    return (
        <>
            <Head title="Blog Management" />

            <div className="flex h-full flex-1 flex-col gap-0">
                {/* Premium Header */}
                <div className="border-b bg-card/50 backdrop-blur-sm px-6 py-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <BookOpen className="h-5 w-5 text-primary" />
                                <h1 className="text-xl font-bold tracking-tight">Blog Management</h1>
                            </div>
                            <p className="text-sm text-muted-foreground">Create and manage your enterprise blog content</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`${tp}/manage/categories`}>
                                    <FolderOpen className="mr-1.5 h-3.5 w-3.5" /> Categories
                                </Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`${tp}/manage/tags`}>
                                    <Tag className="mr-1.5 h-3.5 w-3.5" /> Tags
                                </Link>
                            </Button>
                            <Button size="sm" asChild>
                                <Link href={`${tp}/manage/blogs/create`}>
                                    <Plus className="mr-1.5 h-3.5 w-3.5" /> New Post
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="mt-5 flex gap-6">
                        <div className="flex items-center gap-2 text-sm">
                            <div className="h-2 w-2 rounded-full bg-primary" />
                            <span className="font-semibold tabular-nums">{blogs.total}</span>
                            <span className="text-muted-foreground">Total Posts</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <div className="h-2 w-2 rounded-full bg-success" />
                            <span className="font-semibold tabular-nums">{published}</span>
                            <span className="text-muted-foreground">Published</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                            <span className="font-semibold tabular-nums">{drafts}</span>
                            <span className="text-muted-foreground">Drafts</span>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="px-6 py-3 border-b bg-muted/20">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                        <Input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search posts…"
                            className="pl-9 h-8 text-sm"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                <TableHead className="w-95">Post</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Tags</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="w-10" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-48 text-center">
                                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                            <FileText className="h-10 w-10 opacity-30" />
                                            <p className="text-sm font-medium">No posts found</p>
                                            <Button size="sm" variant="outline" asChild>
                                                <Link href={`${tp}/manage/blogs/create`}>Create your first post</Link>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((blog: any) => (
                                    <TableRow key={blog.id} className="group">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-12 w-20 shrink-0 overflow-hidden rounded-lg border bg-muted">
                                                    {blog.cover_image
                                                        ? <img src={`/storage/${blog.cover_image}`} className="h-full w-full object-cover" alt="" />
                                                        : <div className="h-full w-full bg-linear-to-br from-primary/10 to-primary/5 flex items-center justify-center"><BookOpen className="h-4 w-4 text-primary/30" /></div>
                                                    }
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-sm truncate max-w-55">{blog.title}</p>
                                                    <p className="text-xs text-muted-foreground truncate max-w-55">{blog.slug}</p>
                                                    {blog.user && (
                                                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                                            <User className="h-2.5 w-2.5" />
                                                            {blog.user.name}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {blog.category ? (
                                                <span
                                                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border"
                                                    style={{ borderColor: blog.category.color + '60', color: blog.category.color, backgroundColor: blog.category.color + '15' }}
                                                >
                                                    <FolderOpen className="h-2.5 w-2.5" />
                                                    {blog.category.name}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1 max-w-40">
                                                {blog.tags?.slice(0, 3).map((t: any) => (
                                                    <Badge key={t.id} variant="secondary" className="text-xs px-1.5 py-0 font-normal">
                                                        {t.name}
                                                    </Badge>
                                                ))}
                                                {blog.tags?.length > 3 && (
                                                    <Badge variant="outline" className="text-xs px-1.5 py-0">+{blog.tags.length - 3}</Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {blog.is_published
                                                ? <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 font-medium text-xs">Published</Badge>
                                                : <Badge variant="secondary" className="font-medium text-xs">Draft</Badge>
                                            }
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                            {blog.published_at ? (
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-3 w-3" />
                                                    {format(new Date(blog.published_at), 'MMM d, yyyy')}
                                                </div>
                                            ) : '—'}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40">
                                                    <DropdownMenuItem asChild>
                                                        <a href={`/blogs/${blog.slug}`} target="_blank" rel="noreferrer">
                                                            <Eye className="mr-2 h-3.5 w-3.5" /> Preview
                                                        </a>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`${tp}/manage/blogs/${blog.slug}/edit`}>
                                                            <Edit className="mr-2 h-3.5 w-3.5" /> Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                   <AlertDialog>
    <AlertDialogTrigger asChild>
        <DropdownMenuItem
            onSelect={(e) => e.preventDefault()}
            className="text-destructive focus:text-destructive focus:bg-destructive/10"
        >
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            Delete
        </DropdownMenuItem>
    </AlertDialogTrigger>

    <AlertDialogContent>
        <AlertDialogHeader>
            <AlertDialogTitle>
                Delete Blog Post?
            </AlertDialogTitle>

            <AlertDialogDescription>
                This action cannot be undone. This will permanently
                delete the blog post.
            </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
            <AlertDialogCancel className='cursor-pointer'>
                Cancel
            </AlertDialogCancel>

            <AlertDialogAction variant={'destructive'}
                onClick={() =>
                    router.delete(`${tp}/manage/blogs/${blog.slug}`)
                }
                className="bg-destructive cursor-pointer text-white hover:bg-destructive/90"
            >
                Delete
            </AlertDialogAction>
        </AlertDialogFooter>
    </AlertDialogContent>
</AlertDialog>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {blogs.last_page > 1 && (
                    <div className="border-t px-6 py-3 flex items-center justify-between text-sm text-muted-foreground">
                        <span>Showing {blogs.from}–{blogs.to} of {blogs.total}</span>
                        <div className="flex gap-1">
                            {blogs.links.map((link: any, i: number) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${link.active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'} ${!link.url ? 'opacity-40 pointer-events-none' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

BlogIndex.layout = {
    breadcrumbs: [
        {
            title: 'Blogs',
            href: '/manage/blogs',
        },
    ],
};