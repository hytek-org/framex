
import { Footer } from '@/components/marketing/footer';
import { Navbar } from '@/components/marketing/navbar';
import { CommandMenu } from '@/components/shared/command-menu';
import { Toaster } from '@/components/ui/sonner';


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
