import { CommandMenu } from '@/components/shared/command-menu';
import { Toaster } from '@/components/ui/sonner';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AppLayoutTemplate>
            {children}
            <CommandMenu />
            <Toaster />
        </AppLayoutTemplate>
    );
}
