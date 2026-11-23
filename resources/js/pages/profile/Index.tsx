import { Head } from "@inertiajs/react";
import { view } from "@/routes/profile";
import {
    UserRound,
    Mail,
    Phone,
    BriefcaseBusiness,
    Building2,
    ShieldCheck,
    ShieldAlert,
    CalendarDays,
    Clock3,
    Globe2,
    Palette,
    CalendarClock,
    CreditCard,
    Hash,
    CheckCircle2,
    CircleUserRound,
    Languages,
    Clock,
} from "lucide-react";

type Profile = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    avatar: string | null;
    jobTitle: string | null;
    department: string | null;
    isAdmin: boolean;
    emailVerifiedAt: string | null;
    timezone: string | null;
    locale: string | null;
    dateFormat: string | null;
    timeFormat: string | null;
    theme: string | null;
    plan: string;
    createdAt: string | null;
    updatedAt: string | null;
    lastLoginAt: string | null;
};

type PageProps = {
    profile: Profile;
    mustVerifyEmail: boolean;
    status?: string;
};

const formatDate = (
    value: string | null,
    options?: Intl.DateTimeFormatOptions,
) => {
    if (!value) return "Not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Not available";

    return new Intl.DateTimeFormat(
        undefined,
        options ?? {
            day: "numeric",
            month: "long",
            year: "numeric",
        },
    ).format(date);
};

const getInitials = (name: string) => {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");
};

function Section({
    title,
    description,
    icon: Icon,
    children,
}: {
    title: string;
    description: string;
    icon: typeof UserRound;
    children: React.ReactNode;
}) {
    return (
        <section className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex items-center gap-3 border-b border-border px-5 py-4 sm:px-6">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Icon className="size-[18px] text-muted-foreground" />
                </div>

                <div className="min-w-0">
                    <h2 className="text-sm font-semibold tracking-tight">
                        {title}
                    </h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        {description}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-x-8 px-5 sm:grid-cols-2 sm:px-6">
                {children}
            </div>
        </section>
    );
}

function Detail({
    label,
    value,
    icon: Icon,
    verified,
}: {
    label: string;
    value: string | null | undefined;
    icon: typeof UserRound;
    verified?: boolean;
}) {
    return (
        <div className="flex min-w-0 items-start gap-3 border-b border-border py-4 last:border-0">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/70">
                <Icon className="size-4 text-muted-foreground" />
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">
                    {label}
                </p>

                <div className="mt-1 flex flex-wrap items-center gap-2">
                    <p className="break-words text-sm font-medium">
                        {value?.trim() || "Not provided"}
                    </p>

                    {verified !== undefined && (
                        <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                verified
                                    ? "bg-emerald-500/10 text-emerald-600"
                                    : "bg-amber-500/10 text-amber-600"
                            }`}
                        >
                            {verified ? (
                                <CheckCircle2 className="size-3" />
                            ) : (
                                <ShieldAlert className="size-3" />
                            )}
                            {verified ? "Verified" : "Unverified"}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function Index({ profile, mustVerifyEmail, status }: PageProps) {
    const emailVerified = Boolean(profile.emailVerifiedAt);

    const accountCreated = formatDate(profile.createdAt);

    return (
        <>
            <Head title="My Profile" />

            <div className="mx-auto w-full max-w-6xl space-y-6 pb-10">
                {/* Page heading */}
                <div>
                  

                    <div className="mt-6">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            My Profile
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            View your personal information and account details.
                        </p>
                    </div>
                </div>

                {/* Flash message */}
                {status && (
                    <div className="flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="size-4 shrink-0" />
                        {status}
                    </div>
                )}

                {/* Profile overview */}
                <div className="overflow-hidden rounded-xl border border-border bg-card">
                    <div className="h-24 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent" />

                    <div className="px-5 pb-5 sm:px-7">
                        <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div className="flex min-w-0 items-end gap-4">
                                {profile.avatar ? (
                                    <img
                                        src={`/storage/${profile.avatar}`}
                                        alt={profile.name}
                                        className="size-20 shrink-0 rounded-2xl border-4 border-card bg-muted object-cover shadow-sm"
                                    />
                                ) : (
                                    <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl border-4 border-card bg-primary text-2xl font-bold text-primary-foreground shadow-sm">
                                        {getInitials(profile.name) || "U"}
                                    </div>
                                )}

                                <div className="min-w-0 pb-1">
                                    <h2 className="truncate text-xl font-semibold tracking-tight">
                                        {profile.name}
                                    </h2>

                                    <p className="mt-1 truncate text-sm text-muted-foreground">
                                        {profile.email}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 pb-1">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium">
                                    <span
                                        className={`size-1.5 rounded-full ${
                                            emailVerified
                                                ? "bg-emerald-500"
                                                : "bg-amber-500"
                                        }`}
                                    />
                                    {emailVerified
                                        ? "Email verified"
                                        : "Email unverified"}
                                </span>

                                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium">
                                    <ShieldCheck className="size-3.5 text-muted-foreground" />
                                    {profile.isAdmin
                                        ? "Administrator"
                                        : "Member"}
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-3 border-t border-border pt-5 sm:grid-cols-3">
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Account ID
                                </p>
                                <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold">
                                    <Hash className="size-3.5 text-muted-foreground" />
                                    {profile.id}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Member since
                                </p>
                                <p className="mt-1 text-sm font-semibold">
                                    {accountCreated}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Account type
                                </p>
                                <p className="mt-1 text-sm font-semibold">
                                    {profile.isAdmin
                                        ? "Administrator"
                                        : "Standard account"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Verification notice */}
                {mustVerifyEmail && !emailVerified && (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                        <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-600" />

                        <div>
                            <p className="text-sm font-semibold">
                                Email verification required
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Your email address has not yet been verified.
                                Some account features may require verification.
                            </p>
                        </div>
                    </div>
                )}

                {/* Personal information */}
                <Section
                    title="Personal information"
                    description="Your basic identity and contact details."
                    icon={UserRound}
                >
                    <Detail
                        label="Full name"
                        value={profile.name}
                        icon={CircleUserRound}
                    />

                    <Detail
                        label="Email address"
                        value={profile.email}
                        icon={Mail}
                        verified={emailVerified}
                    />

                    <Detail
                        label="Phone number"
                        value={profile.phone}
                        icon={Phone}
                    />
                </Section>

                {/* Professional information */}
                <Section
                    title="Professional information"
                    description="Your role and organizational details."
                    icon={BriefcaseBusiness}
                >
                    <Detail
                        label="Job title"
                        value={profile.jobTitle}
                        icon={BriefcaseBusiness}
                    />

                    <Detail
                        label="Department"
                        value={profile.department}
                        icon={Building2}
                    />

                    <Detail
                        label="Account role"
                        value={profile.isAdmin ? "Administrator" : "Member"}
                        icon={ShieldCheck}
                    />
                </Section>

                {/* Subscription */}
                <Section
                    title="Subscription & plan"
                    description="Your current account subscription information."
                    icon={CreditCard}
                >
                    <Detail
                        label="Current plan"
                        value={profile.plan}
                        icon={CreditCard}
                    />

                    <Detail
                        label="Account status"
                        value="Active"
                        icon={CheckCircle2}
                    />
                </Section>

                {/* Regional preferences */}
                <Section
                    title="Regional preferences"
                    description="Your language, timezone and display preferences."
                    icon={Globe2}
                >
                    <Detail
                        label="Timezone"
                        value={profile.timezone}
                        icon={Globe2}
                    />

                    <Detail
                        label="Language / Locale"
                        value={profile.locale}
                        icon={Languages}
                    />

                    <Detail
                        label="Date format"
                        value={profile.dateFormat}
                        icon={CalendarDays}
                    />

                    <Detail
                        label="Time format"
                        value={profile.timeFormat}
                        icon={Clock}
                    />

                    <Detail
                        label="Appearance"
                        value={profile.theme}
                        icon={Palette}
                    />
                </Section>

                {/* Account activity */}
                <Section
                    title="Account activity"
                    description="Important dates associated with your account."
                    icon={CalendarClock}
                >
                    <Detail
                        label="Account created"
                        value={formatDate(profile.createdAt)}
                        icon={CalendarDays}
                    />

                    <Detail
                        label="Last updated"
                        value={formatDate(profile.updatedAt, {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                        icon={Clock3}
                    />

                    <Detail
                        label="Last login"
                        value={formatDate(profile.lastLoginAt, {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                        icon={Clock3}
                    />
                </Section>

                {/* Footer */}
                <div className="flex flex-col gap-2 border-t border-border pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                    <p>Account information is displayed in read-only mode.</p>

                    <p className="flex items-center gap-1.5">
                        <ShieldCheck className="size-3.5" />
                        Secure account overview
                    </p>
                </div>
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: "Profile",
            href: view(),
        },
    ],
};
