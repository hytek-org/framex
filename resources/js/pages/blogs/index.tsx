import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { ArrowRight, User } from 'lucide-react';


export default function BlogsIndex({ blogs }: { blogs: any }) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Head title="Blog - Latest News & Insights" />

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

            {/* Hero Section */}
            <section className="relative py-24 overflow-hidden border-b gradient-mesh">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20 animate-fade-in-up">
                        Latest Insights
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight animate-fade-in-up stagger-1">
                        Our <span className="text-gradient-brand">Blog</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-up stagger-2">
                        Discover the latest news, insights, and strategies to elevate your enterprise workflow.
                    </p>
                </div>
            </section>

            {/* Blog Grid */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {blogs.data.length === 0 ? (
                        <div className="text-center py-20 border-2 border-dashed rounded-xl surface-inset">
                            <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
                            <p className="text-muted-foreground">Check back soon for our latest insights.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {blogs.data.map((blog: any, index: number) => (
                                <Link
                                    href={`/blogs/${blog.slug}`}
                                    key={blog.id}
                                    className="group flex flex-col surface-elevated rounded-2xl overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] transition-all duration-300 transform hover:-translate-y-1"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="aspect-video w-full overflow-hidden bg-muted relative">
                                        {blog.cover_image ? (
                                            <img
                                                src={`/storage/${blog.cover_image}`}
                                                alt={blog.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                                <span className="text-primary/40 font-bold text-4xl">FrameX</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                                            <time dateTime={blog.published_at}>
                                                {format(new Date(blog.published_at), 'MMMM d, yyyy')}
                                            </time>
                                            <span>•</span>
                                            <div className="flex items-center gap-1">
                                                <User className="h-3 w-3" />
                                                {blog.user?.name || 'Admin'}
                                            </div>
                                        </div>
                                        <h2 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                                            {blog.title}
                                        </h2>
                                        <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-1">
                                            {blog.excerpt || blog.content?.replace(/(<([^>]+)>)/gi, "").substring(0, 150) + "..."}
                                        </p>
                                        <div className="mt-auto flex items-center text-sm font-semibold text-primary">
                                            Read article <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Pagination - Simple Implementation */}
                    {blogs.last_page > 1 && (
                        <div className="mt-16 flex justify-center gap-2">
                            {blogs.links.map((link: any, i: number) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${link.active
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted hover:bg-muted/80 text-foreground'
                                        } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
