import type { Auth } from '@/types/auth';
import type { Team } from '@/types/teams';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            currentTeam: Team | null;
            teams: Team[];
            locale: string;
            isAdmin: boolean;
            unreadNotificationsCount: number;
            billing: {
                plan: string;
                subscribed: boolean;
            } | null;
            [key: string]: unknown;
        };
    }
}
