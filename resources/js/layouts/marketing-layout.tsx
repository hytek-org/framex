import { Toaster } from '@/components/ui/sonner';
import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';
import { CommandMenu } from '@/components/shared/command-menu';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main>{children}</main>
            <Footer />
            <CommandMenu />
            <Toaster />
        </div>
    );
}
