import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
    Bell,
    BookOpen,
    CreditCard,
    FileText,
    FolderOpen,
    Key,
    LayoutGrid,
    Search,
    Settings,
    Tags,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { TeamSwitcher } from '@/components/team-switcher';
import { Badge } from '@/components/ui/badge';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const page = usePage();
    const { currentTeam, unreadNotificationsCount } = page.props;
    const dashboardUrl = currentTeam
        ? dashboard(currentTeam.slug)
        : '/';

    const teamPrefix = currentTeam ? `/${currentTeam.slug}` : '';

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboardUrl,
            icon: LayoutGrid,
        },
        {
            title: 'Activity',
            href: `${teamPrefix}/activity`,
            icon: Activity,
        },
        {
            title: 'Files',
            href: `${teamPrefix}/files`,
            icon: FileText,
        },
        {
            title: 'Blogs',
            href: `${teamPrefix}/manage/blogs`,
            icon: BookOpen,
        },
        {
            title: 'Categories',
            href: `${teamPrefix}/manage/categories`,
            icon: FolderOpen,
        },
        {
            title: 'Tags',
            href: `${teamPrefix}/manage/tags`,
            icon: Tags,
        },
    ];

    const secondaryNavItems: NavItem[] = [
        {
            title: 'Billing',
            href: '/billing',
            icon: CreditCard,
        },
        {
            title: 'API Tokens',
            href: '/api-tokens',
            icon: Key,
        },
        {
            title: 'Notifications',
            href: '/notifications',
            icon: Bell,
        },
        {
            title: 'Settings',
            href: '/settings/profile',
            icon: Settings,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboardUrl} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <TeamSwitcher />
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} label="Workspace" />
                <NavMain items={secondaryNavItems} label="Account" />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
