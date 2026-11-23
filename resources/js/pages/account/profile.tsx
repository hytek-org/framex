import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';
import {
    AlertCircle,
    Building2,
    CheckCircle2,
    Mail,
    Phone,
    Trash2,
    Upload,
    User as UserIcon,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import InputError from '@/components/input-error';
import { FadeIn } from '@/components/shared/motion';
import { useInitials } from '@/hooks/use-initials';
import DeleteUser from '@/components/delete-user';

type ProfileUserData = {
    name: string;
    email: string;
    avatar: string | null;
    phone: string | null;
    job_title: string | null;
    department: string | null;
    timezone: string;
    locale: string;
};

type Props = {
    user: ProfileUserData;
    mustVerifyEmail: boolean;
    emailVerified: boolean;
    status?: string;
    timezones: string[];
};

export default function AccountProfile({ user, mustVerifyEmail, emailVerified, status, timezones }: Props) {
    const getInitials = useInitials();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const { data, setData, post, processing, errors, recentlySuccessful, reset } = useForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        job_title: user.job_title || '',
        department: user.department || '',
        timezone: user.timezone || 'UTC',
        locale: user.locale || 'en',
        avatar: null as File | null,
        remove_avatar: false,
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData((prev) => ({ ...prev, avatar: file, remove_avatar: false }));
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleRemoveAvatar = () => {
        setData((prev) => ({ ...prev, avatar: null, remove_avatar: true }));
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/account/profile', {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    const currentAvatar = previewUrl || (data.remove_avatar ? null : (user.avatar ? `/storage/${user.avatar}` : null));

    return (
        <>
            <Head title="Personal Information" />

            <div className="space-y-10">
                {/* ── Main Profile Form ── */}
                <FadeIn>
                    <Card className="rounded-2xl border shadow-xs">
                        <CardHeader className="pb-4 border-b">
                            <CardTitle className="text-lg font-semibold">Personal Information</CardTitle>
                            <CardDescription className="text-sm">
                                Update your public display identity, email communication address, and corporate affiliations.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="pt-6">
                            <form onSubmit={submit} className="space-y-8">
                                {/* Avatar Section */}
                                <div className="space-y-3">
                                    <Label className="text-sm font-semibold">Profile Photograph</Label>
                                    <div className="flex items-center gap-5">
                                        <Avatar className="h-20 w-20 rounded-2xl border-2 border-background shadow-sm">
                                            {currentAvatar ? (
                                                <AvatarImage src={currentAvatar} alt={data.name} />
                                            ) : null}
                                            <AvatarFallback className="rounded-2xl text-xl font-bold bg-primary/10 text-primary">
                                                {getInitials(data.name || 'User')}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    onChange={handleFileChange}
                                                    accept="image/png,image/jpeg,image/webp"
                                                    className="hidden"
                                                    id="avatar-upload"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="h-8 gap-1.5"
                                                >
                                                    <Upload className="h-3.5 w-3.5" /> Upload New Image
                                                </Button>

                                                {(currentAvatar || data.avatar) && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={handleRemoveAvatar}
                                                        className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" /> Remove
                                                    </Button>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                JPG, PNG or WebP. 2MB max resolution recommended.
                                            </p>
                                            <InputError message={errors.avatar} />
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Name & Email */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-sm font-medium">
                                            Full Name <span className="text-destructive">*</span>
                                        </Label>
                                        <div className="relative">
                                            <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                className="pl-9"
                                                required
                                                autoComplete="name"
                                                placeholder="e.g. Alex Morgan"
                                            />
                                        </div>
                                        <InputError message={errors.name} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-medium">
                                            Primary Email Address <span className="text-destructive">*</span>
                                        </Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className="pl-9"
                                                required
                                                autoComplete="email"
                                                placeholder="alex@company.com"
                                            />
                                        </div>
                                        <InputError message={errors.email} />

                                        {mustVerifyEmail && !emailVerified && (
                                            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5 text-xs text-amber-700 dark:text-amber-400 flex items-center justify-between gap-2 mt-2">
                                                <div className="flex items-center gap-1.5">
                                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                                    <span>Your email is not verified yet.</span>
                                                </div>
                                                <Button size="sm" variant="outline" asChild className="h-7 text-xs">
                                                    <Link href="/email/verification-notification" method="post" as="button">
                                                        Resend Link
                                                    </Link>
                                                </Button>
                                            </div>
                                        )}

                                        {status === 'verification-link-sent' && (
                                            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1">
                                                A new verification email has been dispatched.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Phone & Job Title */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-sm font-medium">
                                            Telephone Number
                                        </Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="phone"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                className="pl-9"
                                                placeholder="+1 (555) 019-2834"
                                            />
                                        </div>
                                        <InputError message={errors.phone} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="job_title" className="text-sm font-medium">
                                            Job Title
                                        </Label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="job_title"
                                                value={data.job_title}
                                                onChange={(e) => setData('job_title', e.target.value)}
                                                className="pl-9"
                                                placeholder="Lead Platform Architect"
                                            />
                                        </div>
                                        <InputError message={errors.job_title} />
                                    </div>
                                </div>

                                {/* Department & Timezone */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="department" className="text-sm font-medium">
                                            Department / Organization Unit
                                        </Label>
                                        <Input
                                            id="department"
                                            value={data.department}
                                            onChange={(e) => setData('department', e.target.value)}
                                            placeholder="Engineering & Cloud Services"
                                        />
                                        <InputError message={errors.department} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="timezone" className="text-sm font-medium">
                                            Primary Timezone
                                        </Label>
                                        <Select
                                            value={data.timezone}
                                            onValueChange={(val) => setData('timezone', val)}
                                        >
                                            <SelectTrigger id="timezone" className="w-full">
                                                <SelectValue placeholder="Select timezone" />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-60">
                                                {timezones.slice(0, 100).map((tz) => (
                                                    <SelectItem key={tz} value={tz}>
                                                        {tz}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.timezone} />
                                    </div>
                                </div>

                                {/* Submit button */}
                                <div className="flex items-center gap-4 pt-2">
                                    <Button type="submit" disabled={processing} className="min-w-28">
                                        {processing ? 'Saving...' : 'Save Changes'}
                                    </Button>

                                    {recentlySuccessful && (
                                        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                                            <CheckCircle2 className="h-4 w-4" /> Changes saved successfully.
                                        </p>
                                    )}
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </FadeIn>

                {/* ── Danger Zone: Delete User ── */}
                <FadeIn delay={0.15}>
                    <DeleteUser />
                </FadeIn>
            </div>
        </>
    );
}

AccountProfile.layout = {
    breadcrumbs: [
        { title: 'Account', href: '/account' },
        { title: 'Personal Info', href: '/account/profile' },
    ],
};
