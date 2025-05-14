import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function ErrorLayout({ children }: PropsWithChildren) {
    return (
        <div className="relative min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-zinc-800 overflow-hidden">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_60%,_rgba(100,230,255,0.5)_0%,_transparent_70%)] dark:bg-[radial-gradient(circle_at_center,_rgba(100,230,255,0.2)_0%,_transparent_75%)]  " />
            <div className="relative flex min-h-screen flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
                <header className="absolute top-6 sm:top-8 ">
                    <Link
                        href={route('home')}
                        className="group flex items-center space-x-2 transition-transform hover:scale-105"
                        aria-label="Return to homepage"
                    >
                        <AppLogoIcon />

                    </Link>
                </header>

                <main className="relative z-10 w-full max-w-4xl mx-auto mt-5">
                    <section className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md rounded-2xl shadow-xl p-6 sm:p-8 ">
                        <div className='mx-auto flex flex-col items-center justify-center'>
                            {children}
                        </div>
                        <div className="mt-8 flex justify-center">
                            <Button
                                variant="link"
                                onClick={() => window.history.back()}

                                aria-label="Go back to previous page"
                            >
                                <span className="relative z-10 group-hover:text-white">Go Back</span>
                                <span className="absolute inset-0 bg-primary-700 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
                            </Button>
                        </div>
                    </section>
                </main>

                {/* Footer decoration */}
                <footer className="absolute bottom-4 text-zinc-500 dark:text-zinc-400 text-sm">
                    © {new Date().getFullYear()} FrameX. All rights reserved.
                </footer>
            </div>
        </div>
    );
}