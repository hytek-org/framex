import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function ErrorLayout({ children }: PropsWithChildren) {
    return (
         <div className="min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-300">
            <div className="flex min-h-screen flex-col">
                {/* Header */}
                <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-center">
                            <Link
                                href={route('home')}
                                className="flex items-center space-x-3 transition-opacity hover:opacity-80"
                                aria-label="Return to homepage"
                            >
                                <AppLogoIcon className='dark:fill-white size-8 ' />
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
                    <div className="w-full max-w-2xl">
                        <div className="text-center">
                            {children}
                            
                            {/* Actions */}
                            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    variant="outline"
                                    onClick={() => window.history.back()}
                                    className="px-8 py-3 border-2 border-zinc-300 dark:border-zinc-600 hover:border-zinc-400 dark:hover:border-zinc-500 bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-medium transition-all duration-200"
                                    aria-label="Go back to previous page"
                                >
                                    Go Back
                                </Button>
                                <Button
                                    asChild
                                    className="px-8 py-3 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium transition-all duration-200"
                                >
                                    <Link href={route('home')}>
                                        Back to Home
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-center">
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                © {new Date().getFullYear()} FrameX. All rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}