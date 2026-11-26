import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import type { Team, User } from '@/types';

export function UserInfo({
    user,
    showEmail = false,
    team = null,
}: {
    user: User;
    showEmail?: boolean;
    team?: Team | null;
}) {
    const getInitials = useInitials();
    const avatarSrc = user.avatar
        ? user.avatar.startsWith('http://') ||
          user.avatar.startsWith('https://') ||
          user.avatar.startsWith('data:') ||
          user.avatar.startsWith('/')
            ? user.avatar
            : `/storage/${user.avatar}`
        : undefined;

    return (
        <>
            <Avatar className="h-8 w-8 overflow-hidden rounded-lg">
                {avatarSrc ? (
                    <AvatarImage src={avatarSrc} alt={user.name} className="object-cover" />
                ) : null}
                <AvatarFallback className="rounded-lg text-black dark:text-white">
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                {team ? (
                    <span className="truncate text-xs text-muted-foreground">
                        {team.name}
                    </span>
                ) : null}
                {!team && showEmail ? (
                    <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                    </span>
                ) : null}
            </div>
        </>
    );
}
