import { usePage } from '@inertiajs/react';
import type { BreadcrumbItem } from '@/types';

type BreadcrumbResolver = (props: any) => BreadcrumbItem[];

const routes: Record<string, BreadcrumbResolver> = {
    'dashboard': (props) => [
        { title: 'Dashboard', href: props.currentTeam ? `/${props.currentTeam.slug}/dashboard` : '/' },
    ],
    'activity/index': (props) => [
        { title: 'Activity', href: props.currentTeam ? `/${props.currentTeam.slug}/activity` : '#' },
    ],
    'files/index': (props) => [
        { title: 'Files', href: props.currentTeam ? `/${props.currentTeam.slug}/files` : '#' },
    ],
    'manage/blogs/index': (props) => [
        { title: 'Blogs', href: props.currentTeam ? `/${props.currentTeam.slug}/manage/blogs` : '#' },
    ],
    'manage/blogs/create': (props) => [
        { title: 'Blogs', href: props.currentTeam ? `/${props.currentTeam.slug}/manage/blogs` : '#' },
        { title: 'Create', href: '' },
    ],
    'manage/blogs/edit': (props) => [
        { title: 'Blogs', href: props.currentTeam ? `/${props.currentTeam.slug}/manage/blogs` : '#' },
        { title: 'Edit', href: '' },
    ],
    'manage/categories/index': (props) => [
        { title: 'Categories', href: props.currentTeam ? `/${props.currentTeam.slug}/manage/categories` : '#' },
    ],
    'manage/tags/index': (props) => [
        { title: 'Tags', href: props.currentTeam ? `/${props.currentTeam.slug}/manage/tags` : '#' },
    ],
    'settings/profile': () => [
        { title: 'Settings', href: '/settings/profile' },
        { title: 'Profile', href: '/settings/profile' },
    ],
    'settings/security': () => [
        { title: 'Settings', href: '/settings/profile' },
        { title: 'Security', href: '/settings/security' },
    ],
    'settings/appearance': () => [
        { title: 'Settings', href: '/settings/profile' },
        { title: 'Appearance', href: '/settings/appearance' },
    ],
    'teams/index': () => [
        { title: 'Settings', href: '/settings/profile' },
        { title: 'Teams', href: '/settings/teams' },
    ],
    'teams/edit': (props) => [
        { title: 'Settings', href: '/settings/profile' },
        { title: 'Teams', href: '/settings/teams' },
        { title: props.team?.name || 'Edit Team', href: '' },
    ],
    'teams/show-invitation': () => [
        { title: 'Notifications', href: '/notifications' },
        { title: 'Invitation', href: '#' },
    ],
    'notifications/index': () => [
        { title: 'Notifications', href: '/notifications' },
    ],
    'api-tokens/index': () => [
        { title: 'API Tokens', href: '/api-tokens' },
    ],
    'billing/index': () => [
        { title: 'Billing', href: '/billing' },
    ],
    'admin/index': () => [
        { title: 'Admin', href: '/admin' },
    ],
};

export function useBreadcrumbs(): BreadcrumbItem[] {
    const page = usePage();
    const component = page.component;
    const props = page.props;

    if (routes[component]) {
        return routes[component](props);
    }
    
    return [];
}
