import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Eye, Calendar, User } from 'lucide-react';
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function BlogIndex({ blogs }: { blogs: any }) {
    const { delete: destroy } = useForm();
    const { currentTeam } = usePage().props as any;
    const teamPrefix = currentTeam?.slug ? `/${currentTeam.slug}` : '';

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Manage Blogs',
            href: `${teamPrefix}/manage/blogs`,
        },
    ];

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this blog?')) {
            destroy(`${teamPrefix}/manage/blogs/${id}`);
        }
    };

    return (
        <>
            <Head title="Manage Blogs" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Blogs</h1>
                        <p className="text-muted-foreground">Manage your enterprise blog posts</p>
                    </div>
                    <Button asChild>
                        <Link href={`${teamPrefix}/manage/blogs/create`}>
                            <Plus className="mr-2 h-4 w-4" />
                            New Post
                        </Link>
                    </Button>
                </div>

                <div className="surface-elevated overflow-hidden rounded-xl">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Author</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {blogs.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                        No blogs found. Create your first post.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                blogs.data.map((blog: any) => (
                                    <TableRow key={blog.id} className="group transition-colors hover:bg-muted/30">
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                {blog.cover_image ? (
                                                    <div className="h-10 w-10 overflow-hidden rounded-md border">
                                                        <img src={`/storage/${blog.cover_image}`} alt={blog.title} className="h-full w-full object-cover" />
                                                    </div>
                                                ) : (
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted">
                                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                )}
                                                <div>
                                                    <span className="block truncate max-w-[200px] sm:max-w-[300px]">{blog.title}</span>
                                                    <span className="text-xs text-muted-foreground truncate block">{blog.slug}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <User className="h-3 w-3" />
                                                {blog.user?.name || 'Unknown'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {blog.is_published ? (
                                                <Badge variant="default" className="bg-success text-success-foreground hover:bg-success/90">Published</Badge>
                                            ) : (
                                                <Badge variant="secondary">Draft</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-3 w-3" />
                                                {blog.published_at ? format(new Date(blog.published_at), 'MMM d, yyyy') : '—'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <a href={`/blogs/${blog.slug}`} target="_blank" rel="noreferrer">
                                                        <Eye className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`${teamPrefix}/manage/blogs/${blog.id}/edit`}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(blog.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
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
