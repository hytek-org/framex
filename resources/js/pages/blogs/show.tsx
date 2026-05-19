import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BlogShow({ blog }: { blog: any }) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Head title={`${blog.title} - FrameX Blog`} />

            {/* Minimal Header */}
            <header className="border-b surface-panel sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="font-bold text-xl text-primary tracking-tight">FrameX</Link>
                    <nav className="flex gap-4">
                        <Link href="/pricing" className="text-sm font-medium hover:text-primary transition-colors">Pricing</Link>
                        <Link href="/features" className="text-sm font-medium hover:text-primary transition-colors">Features</Link>
                        <Link href="/blogs" className="text-sm font-medium text-primary transition-colors">Blog</Link>
                    </nav>
                </div>
            </header>

            <article className="pb-24">
                {/* Hero Section */}
                <header className="relative pt-24 pb-12 overflow-hidden gradient-mesh border-b">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <Button variant="ghost" size="sm" asChild className="mb-8 -ml-3">
                            <Link href="/blogs">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Blog
                            </Link>
                        </Button>

                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 animate-fade-in-up">
                            {blog.title}
                        </h1>

                        {blog.excerpt && (
                            <p className="text-xl text-muted-foreground mb-8 animate-fade-in-up stagger-1">
                                {blog.excerpt}
                            </p>
                        )}

                        <div className="flex items-center gap-6 text-muted-foreground animate-fade-in-up stagger-2">
                            <div className="flex items-center gap-2">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                    {blog.user?.name?.charAt(0) || 'A'}
                                </div>
                                <div className="text-sm">
                                    <p className="font-medium text-foreground">{blog.user?.name || 'Admin'}</p>
                                    <div className="flex items-center gap-1 text-xs">
                                        <Calendar className="h-3 w-3" />
                                        <time dateTime={blog.published_at}>
                                            {format(new Date(blog.published_at), 'MMMM d, yyyy')}
                                        </time>
                                    </div>
                                </div>
                            </div>

                            <Button variant="outline" size="sm" className="ml-auto rounded-full">
                                <Share2 className="mr-2 h-4 w-4" />
                                Share
                            </Button>
                        </div>
                    </div>
                </header>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                    {/* Cover Image */}
                    {blog.cover_image && (
                        <div className="mb-16 rounded-2xl overflow-hidden surface-elevated animate-fade-in-up stagger-3">
                            <img
                                src={`/storage/${blog.cover_image}`}
                                alt={blog.title}
                                className="w-full h-auto max-h-[600px] object-cover"
                            />
                        </div>
                    )}

                    {/* Content */}
                    <div
                        className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary prose-img:rounded-xl mx-auto animate-fade-in"
                        dangerouslySetInnerHTML={{ __html: blog.content }}
                    />
                </div>
            </article>
        </div>
    );
}
