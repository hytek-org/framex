import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import AppearanceToggleTab from '@/components/appearance-tabs';
import { FullAppLogoIcon } from '@/components/app-logo-icon';

export default function FrameXWelcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="FrameX - Cutting-Edge Full-Stack Starter Kit">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=manrope:400,500,600,700,800" rel="stylesheet" />
            </Head>
            <div className="flex min-h-screen flex-col bg-[#F7F7F8] text-[#1C2526] font-['Manrope'] dark:bg-[#0C1517] dark:text-[#E7ECEF]">
                {/* Header */}
                <header className="w-full px-6 py-4 bg-[#FFFFFF] shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:bg-[#172429] dark:shadow-[0_4px_20px_rgba(255,255,255,0.05)] lg:px-12 fixed top-0 z-50">
                    <nav className="flex items-center justify-between max-w-7xl mx-auto">
                        <div>
                            <FullAppLogoIcon className="w-40 h-10 fill-[#1C2526] dark:fill-[#E7ECEF]" />
                        </div>
                        <div className="flex items-center gap-8">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="px-6 py-2 text-sm font-semibold rounded-full bg-[#1C2526] text-[#FFFFFF] hover:bg-[#374649] dark:bg-[#E7ECEF] dark:text-[#1C2526] dark:hover:bg-[#C7D0D8] transition-all duration-300"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="px-6 py-2 text-sm font-medium text-[#1C2526] hover:text-[#5B6F73] dark:text-[#E7ECEF] dark:hover:text-[#A8B8C0] transition-colors duration-300"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="px-6 py-2 text-sm font-semibold rounded-full bg-[#1C2526] text-[#FFFFFF] hover:bg-[#374649] dark:bg-[#E7ECEF] dark:text-[#1C2526] dark:hover:bg-[#C7D0D8] transition-all duration-300"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </nav>
                </header>

                {/* Hero Section */}
                <section className="flex flex-col items-center text-center pt-32 pb-24 px-6 lg:pt-48 lg:pb-32 lg:px-12 bg-[linear-gradient(180deg,#FFFFFF_50%,#F7F7F8_100%)] dark:bg-[linear-gradient(180deg,#172429_50%,#0C1517_100%)]">
                    <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl leading-tight">
                        Unleash Your Web Vision with FrameX
                    </h1>
                    <p className="mt-6 max-w-3xl text-lg text-[#5B6F73] dark:text-[#A8B8C0] leading-relaxed">
                        FrameX is a state-of-the-art full-stack starter kit designed for rapid, scalable web development. Powered by Laravel, React, and TypeScript, it’s the perfect foundation for building innovative blogs, dashboards, communities, and SaaS platforms.
                    </p>
                    <div className="mt-12 flex gap-6">
                        <Link
                            href={route('register')}
                            className="px-8 py-3 text-base font-semibold rounded-full bg-[#1C2526] text-[#FFFFFF] hover:bg-[#374649] hover:shadow-[0_0_20px_rgba(0,0,0,0.15)] dark:bg-[#E7ECEF] dark:text-[#1C2526] dark:hover:bg-[#C7D0D8] dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all duration-300"
                        >
                            Start Building
                        </Link>
                        <a
                            href="https://docs.framex.dev"
                            target="_blank"
                            className="px-8 py-3 text-base font-semibold rounded-full border border-[#1C2526] text-[#1C2526] hover:bg-[#1C2526] hover:text-[#FFFFFF] dark:border-[#E7ECEF] dark:text-[#E7ECEF] dark:hover:bg-[#E7ECEF] dark:hover:text-[#1C2526] transition-all duration-300"
                        >
                            Explore Docs
                        </a>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20 px-6 lg:px-12 bg-[#F7F7F8] dark:bg-[#0C1517]">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-4xl font-bold text-center mb-12">Why Choose FrameX</h2>
                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="p-8 bg-[#FFFFFF] dark:bg-[#172429] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_40px_rgba(255,255,255,0.08)] hover:-translate-y-2 transition-transform duration-300">
                                <h3 className="text-xl font-semibold">Blazing Fast Development</h3>
                                <p className="mt-4 text-[#5B6F73] dark:text-[#A8B8C0] leading-relaxed">
                                    Pre-built Laravel backend with React + TypeScript frontend accelerates your development cycle.
                                </p>
                            </div>
                            <div className="p-8 bg-[#FFFFFF] dark:bg-[#172429] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_40px_rgba(255,255,255,0.08)] hover:-translate-y-2 transition-transform duration-300">
                                <h3 className="text-xl font-semibold">Robust Scalability</h3>
                                <p className="mt-4 text-[#5B6F73] dark:text-[#A8B8C0] leading-relaxed">
                                    Architected with modern standards to scale from small projects to enterprise-grade applications.
                                </p>
                            </div>
                            <div className="p-8 bg-[#FFFFFF] dark:bg-[#172429] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_40px_rgba(255,255,255,0.08)] hover:-translate-y-2 transition-transform duration-300">
                                <h3 className="text-xl font-semibold">Developer-Centric Tools</h3>
                                <p className="mt-4 text-[#5B6F73] dark:text-[#A8B8C0] leading-relaxed">
                                    Comprehensive docs, tutorials, and community support to streamline your workflow.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 px-6 text-center lg:px-12 bg-[#FFFFFF] dark:bg-[#172429]">
                    <h2 className="text-4xl font-bold">Ready to Innovate?</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-[#5B6F73] dark:text-[#A8B8C0] leading-relaxed">
                        Join thousands of developers worldwide using FrameX to create next-generation web applications.
                    </p>
                    <div className="mt-10">
                        <Link
                            href={route('register')}
                            className="px-8 py-3 text-base font-semibold rounded-full bg-[#1C2526] text-[#FFFFFF] hover:bg-[#374649] hover:shadow-[0_0_20px_rgba(0,0,0,0.15)] dark:bg-[#E7ECEF] dark:text-[#1C2526] dark:hover:bg-[#C7D0D8] dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all duration-300"
                        >
                            Get FrameX Now
                        </Link>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-12 px-6 bg-[#F7F7F8] dark:bg-[#0C1517] border-t border-[#E0E4E5] dark:border-[#2E3B40]">
                    <div className="max-w-7xl mx-auto flex flex-col items-center gap-8 sm:flex-row sm:justify-between">
                        <p className="text-sm text-[#5B6F73] dark:text-[#A8B8C0]">
                            © 2025 FrameX by Hytek. All rights reserved.
                        </p>
                        <div className="flex items-center gap-8">
                            <a href="https://github.com/orgs/hytek-org/framex" target="_blank" className="text-sm text-[#5B6F73] hover:text-[#1C2526] dark:text-[#A8B8C0] dark:hover:text-[#E7ECEF] transition-colors duration-300">
                                Documentation
                            </a>
                            <a href="https://github.com/orgs/hytek-org/framex" target="_blank" className="text-sm text-[#5B6F73] hover:text-[#1C2526] dark:text-[#A8B8C0] dark:hover:text-[#E7ECEF] transition-colors duration-300">
                                GitHub
                            </a>
                            <a href="https://github.com/orgs/hytek-org/framex" target="_blank" className="text-sm text-[#5B6F73] hover:text-[#1C2526] dark:text-[#A8B8C0] dark:hover:text-[#E7ECEF] transition-colors duration-300">
                                Community
                            </a>
                            <AppearanceToggleTab />
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}