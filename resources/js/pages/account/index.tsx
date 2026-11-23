import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    ArrowUpRight,
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    Globe,
    KeyRound,
    Mail,
    Phone,
    Shield,
    ShieldCheck,
    Smartphone,
    User,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FadeIn, StaggerChildren, StaggerItem } from '@/components/shared/motion';
import { useInitials } from '@/hooks/use-initials';

type AuditEntry = {
    id: number;
    action: string;
    description: string;
    ip_address: string | null;
    created_at: string;
    created_at_human: string;
};

type Session = {
    id: string;
    ip_address: string | null;
    browser: string;
    platform: string;
    is_desktop: boolean;
    last_active: string;
    last_active_at: string;
};

type ProfileData = {
    name: string;
    email: string;
    avatar: string | null;
    phone: string | null;
    job_title: string | null;
    department: string | null;
    timezone: string;
    locale: string;
    theme: string;
    email_verified_at: string | null;
    two_factor_enabled: boolean;
    created_at: string;
    last_login_at: string | null;
    last_login_ip: string | null;
};

type Props = {
    profile: ProfileData;
    recentActivity: AuditEntry[];
    activeSessions: Session[];
};

export default function AccountOverview({ profile, recentActivity, activeSessions }: Props) {
    const getInitials = useInitials();

    return (
        <>
            <Head title="Account Overview" />

            <div className="space-y-8">
                {/* ── Enterprise Profile Hero Card ── */}
                <FadeIn>
                    <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-card via-card to-muted/20 p-6 md:p-8 shadow-xs">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-start sm:items-center gap-5">
                                <Avatar className="h-20 w-20 rounded-2xl border-2 border-background shadow-md">
                                    {profile.avatar ? (
                                        <AvatarImage src={`/storage/${profile.avatar}`} alt={profile.name} />
                                    ) : null}
                                    <AvatarFallback className="rounded-2xl text-xl font-semibold bg-primary/10 text-primary">
                                        {getInitials(profile.name)}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="space-y-1.5">
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                            {profile.name}
                                        </h1>
                                        {profile.email_verified_at ? (
                                            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                                                <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Verified Account
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium">
                                                <AlertCircle className="mr-1 h-3.5 w-3.5" /> Pending Verification
                                            </Badge>
                                        )}
                                    </div>

                                    <p className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                                        <span>{profile.email}</span>
                                        {profile.job_title && (
                                            <>
                                                <span>•</span>
                                                <span className="font-medium text-foreground">{profile.job_title}</span>
                                            </>
                                        )}
                                        {profile.department && (
                                            <>
                                                <span>•</span>
                                                <span>{profile.department}</span>
                                            </>
                                        )}
                                    </p>

                                    <div className="flex items-center gap-4 text-xs text-muted-foreground/80 pt-1">
                                        <span className="flex items-center gap-1">
                                            <Globe className="h-3.5 w-3.5" /> {profile.timezone}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3.5 w-3.5" /> Member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2.5 shrink-0">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/account/profile">Edit Profile</Link>
                                </Button>
                                <Button size="sm" asChild>
                                    <Link href="/account/security">Security</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </FadeIn>

                {/* ── Key Metrics & Status Grid ── */}
                <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StaggerItem>
                        <Card className="rounded-xl border shadow-2xs">
                            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Identity Status
                                </CardTitle>
                                <Mail className="h-4 w-4 text-primary" />
                            </CardHeader>
                            <CardContent className="p-4 pt-1">
                                <div className="text-lg font-semibold text-foreground">
                                    {profile.email_verified_at ? 'Email Verified' : 'Action Required'}
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {profile.email_verified_at
                                        ? 'Account credentials confirmed'
                                        : 'Please verify your primary email'}
                                </p>
                            </CardContent>
                        </Card>
                    </StaggerItem>

                    <StaggerItem>
                        <Card className="rounded-xl border shadow-2xs">
                            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Two-Factor (2FA)
                                </CardTitle>
                                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                            </CardHeader>
                            <CardContent className="p-4 pt-1">
                                <div className="text-lg font-semibold text-foreground">
                                    {profile.two_factor_enabled ? 'Protected' : 'Disabled'}
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {profile.two_factor_enabled
                                        ? 'TOTP / Authenticator active'
                                        : 'Recommend enabling 2FA'}
                                </p>
                            </CardContent>
                        </Card>
                    </StaggerItem>

                    <StaggerItem>
                        <Card className="rounded-xl border shadow-2xs">
                            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Active Devices
                                </CardTitle>
                                <Smartphone className="h-4 w-4 text-primary" />
                            </CardHeader>
                            <CardContent className="p-4 pt-1">
                                <div className="text-lg font-semibold text-foreground">
                                    {activeSessions.length} {activeSessions.length === 1 ? 'Device' : 'Devices'}
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Logged in and active
                                </p>
                            </CardContent>
                        </Card>
                    </StaggerItem>

                    <StaggerItem>
                        <Card className="rounded-xl border shadow-2xs">
                            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Last Access
                                </CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent className="p-4 pt-1">
                                <div className="text-lg font-semibold text-foreground">
                                    {profile.last_login_at
                                        ? new Date(profile.last_login_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                        : 'Current Session'}
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {profile.last_login_ip ? `IP: ${profile.last_login_ip}` : 'Authorized login'}
                                </p>
                            </CardContent>
                        </Card>
                    </StaggerItem>
                </StaggerChildren>

                {/* ── Two Column Details: Personal Info Summary + Recent Audit ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Left: Account Details breakdown */}
                    <FadeIn delay={0.1}>
                        <Card className="rounded-2xl border shadow-xs">
                            <CardHeader className="pb-3 border-b">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-base font-semibold">Account Details</CardTitle>
                                        <CardDescription className="text-xs">Summary of your personal attributes and regional preferences</CardDescription>
                                    </div>
                                    <Button variant="ghost" size="sm" asChild className="text-xs h-8">
                                        <Link href="/account/profile">Edit <ArrowUpRight className="ml-1 h-3.5 w-3.5" /></Link>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 p-0">
                                <dl className="divide-y text-sm">
                                    <div className="flex items-center justify-between px-6 py-3">
                                        <dt className="text-muted-foreground flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" /> Full Name
                                        </dt>
                                        <dd className="font-medium text-foreground">{profile.name}</dd>
                                    </div>
                                    <div className="flex items-center justify-between px-6 py-3">
                                        <dt className="text-muted-foreground flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" /> Email Address
                                        </dt>
                                        <dd className="font-medium text-foreground">{profile.email}</dd>
                                    </div>
                                    <div className="flex items-center justify-between px-6 py-3">
                                        <dt className="text-muted-foreground flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" /> Phone Number
                                        </dt>
                                        <dd className="font-medium text-foreground">{profile.phone || 'Not configured'}</dd>
                                    </div>
                                    <div className="flex items-center justify-between px-6 py-3">
                                        <dt className="text-muted-foreground flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-muted-foreground" /> Organization Unit
                                        </dt>
                                        <dd className="font-medium text-foreground">{profile.department || 'General'}</dd>
                                    </div>
                                    <div className="flex items-center justify-between px-6 py-3">
                                        <dt className="text-muted-foreground flex items-center gap-2">
                                            <Globe className="h-4 w-4 text-muted-foreground" /> Preferred Timezone
                                        </dt>
                                        <dd className="font-medium text-foreground">{profile.timezone}</dd>
                                    </div>
                                </dl>
                            </CardContent>
                        </Card>
                    </FadeIn>

                    {/* Right: Security & Recent Activity */}
                    <FadeIn delay={0.15}>
                        <Card className="rounded-2xl border shadow-xs">
                            <CardHeader className="pb-3 border-b">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-base font-semibold">Recent Security & Activity</CardTitle>
                                        <CardDescription className="text-xs">Audit events logged across your user profile</CardDescription>
                                    </div>
                                    <Button variant="ghost" size="sm" asChild className="text-xs h-8">
                                        <Link href="/account/activity">Full Log <ArrowUpRight className="ml-1 h-3.5 w-3.5" /></Link>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                                {recentActivity.length > 0 ? (
                                    <div className="space-y-3.5">
                                        {recentActivity.map((item) => (
                                            <div key={item.id} className="flex items-start justify-between gap-3 text-sm pb-3 border-b last:border-0 last:pb-0">
                                                <div className="space-y-0.5">
                                                    <p className="font-medium text-foreground">{item.description}</p>
                                                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                                                        <span>{item.created_at_human}</span>
                                                        {item.ip_address && (
                                                            <>
                                                                <span>•</span>
                                                                <span>IP {item.ip_address}</span>
                                                            </>
                                                        )}
                                                    </p>
                                                </div>
                                                <Badge variant="secondary" className="text-[11px] font-normal shrink-0">
                                                    {item.action}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center text-muted-foreground text-sm">
                                        <Activity className="h-8 w-8 mx-auto mb-2 opacity-40" />
                                        No recent account events logged yet.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </FadeIn>
                </div>
            </div>
        </>
    );
}

AccountOverview.layout = {
    breadcrumbs: [{ title: 'Account', href: '/account' }],
};
