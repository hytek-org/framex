import { Head, usePage, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { AlertCircle, Check, CheckCircle, Clock, Mail, Shield, Sparkles, UserPlus2, Users, X, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import invitations from '@/routes/invitations';
import { PageTransition } from '@/components/shared/motion';
import { cn } from '@/lib/utils';

interface TeamInvitation {
  id: number;
  code: string;
  email: string;
  role: string;
  expires_at: string;
  accepted_at: string | null;
  team: {
    id: number;
    name: string;
    slug: string;
  };
  inviter: {
    id: number;
    name: string;
    email: string;
  };
}

export default function ShowInvitation() {
  const { invitation } = usePage().props as unknown as {
    invitation: TeamInvitation;
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const expiresAt = new Date(invitation.expires_at);
  const isExpired = expiresAt < new Date();
  const isAlreadyAccepted = invitation.accepted_at !== null;

  const handleAccept = () => {
    setIsSubmitting(true);
    router.post(invitations.accept({ invitation: invitation.code }).url,
      {},
      {
        onError: (errors: any) => {
          setError(errors.message || 'Failed to accept invitation');
          setIsSubmitting(false);
        },
      }
    );
  };

  const handleDecline = () => {
    if (confirm('Are you sure you want to decline this invitation?')) {
      setIsSubmitting(true);
      router.post(invitations.decline({ invitation: invitation.code }).url,
        {},
        {
          onError: (errors: any) => {
            setError(errors.message || 'Failed to decline invitation');
            setIsSubmitting(false);
          },
        }
      );
    }
  };

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      admin: 'Administrator',
      member: 'Member',
      owner: 'Owner',
    };
    return roles[role] || role;
  };

  const getRoleStyle = (role: string) => {
    const styles: Record<string, { bg: string; text: string; border: string; icon: any }> = {
      admin: {
        bg: 'bg-violet-500/10 dark:bg-violet-500/20',
        text: 'text-violet-700 dark:text-violet-300',
        border: 'border-violet-500/20 dark:border-violet-500/30',
        icon: Shield
      },
      owner: {
        bg: 'bg-amber-500/10 dark:bg-amber-500/20',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-500/20 dark:border-amber-500/30',
        icon: Sparkles
      },
      member: {
        bg: 'bg-blue-500/10 dark:bg-blue-500/20',
        text: 'text-blue-700 dark:text-blue-300',
        border: 'border-blue-500/20 dark:border-blue-500/30',
        icon: Users
      }
    };
    return styles[role] || {
      bg: 'bg-muted',
      text: 'text-muted-foreground',
      border: 'border-border',
      icon: Users
    };
  };

  const teamInitials = invitation.team.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const inviterInitials = invitation.inviter.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const gradients = [
    'from-indigo-600 via-indigo-600 to-cyan-500',
    'from-rose-500 via-pink-500 to-amber-400',
    'from-emerald-500 via-teal-500 to-cyan-500',
    'from-violet-600 via-purple-600 to-pink-500',
  ];
  const gradientClass = gradients[invitation.team.id % gradients.length];
  const roleStyle = getRoleStyle(invitation.role);
  const RoleIcon = roleStyle.icon;

  return (
    <PageTransition className="flex items-center justify-center p-4 py-8 md:py-16">
      <Head title="Team Invitation" />
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-border/80 bg-card/65 backdrop-blur-md shadow-2xl transition-all duration-300 hover:border-border">
        <div className="absolute -top-24 -left-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

        <div className="h-32 bg-gradient-to-r from-indigo-500/[0.03] via-purple-500/[0.03] to-pink-500/[0.03] border-b border-border/40 relative flex items-center justify-center">
          <div className="absolute bottom-0 translate-y-1/2 flex items-center justify-center">
            <div className="relative">
              <div className={cn("h-24 w-24 rounded-2xl flex items-center justify-center text-white text-3xl font-extrabold shadow-xl bg-gradient-to-tr transition-transform hover:scale-105 duration-300", gradientClass)}>
                {teamInitials}
              </div>
              <div 
                className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full border-4 border-card bg-muted text-foreground flex items-center justify-center text-xs font-bold shadow-md cursor-help"
                title={`Invited by ${invitation.inviter.name}`}
              >
                {inviterInitials}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-16 pb-8 px-6 sm:px-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Workspace Invitation
            </h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              You've been invited by <span className="font-semibold text-foreground">{invitation.inviter.name}</span> to collaborate on <span className="font-semibold text-foreground">{invitation.team.name}</span>.
            </p>
          </div>

          {isExpired && (
            <Alert variant="destructive" className="rounded-2xl border-destructive/20 bg-destructive/5 dark:bg-destructive/10">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                This invitation expired on {format(expiresAt, 'MMM d, yyyy')}. Please contact the team owner to request a new invite.
              </AlertDescription>
            </Alert>
          )}

          {isAlreadyAccepted && (
            <Alert className="rounded-2xl border-green-500/20 bg-green-500/5 dark:bg-green-500/10">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-sm text-green-800 dark:text-green-300">
                You have already joined this workspace. Enjoy collaborating!
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="rounded-2xl border-destructive/20 bg-destructive/5 dark:bg-destructive/10">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-4 rounded-2xl border border-border/40 bg-muted/15 p-4 transition-colors hover:bg-muted/20">
              <div className="p-2.5 rounded-xl border border-border bg-card text-muted-foreground shadow-xs">
                <Users className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Workspace Name</div>
                <div className="text-sm font-semibold text-foreground truncate">{invitation.team.name}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-border/40 bg-muted/15 p-4 transition-colors hover:bg-muted/20">
              <div className={cn("p-2.5 rounded-xl border shadow-xs", roleStyle.border, roleStyle.bg)}>
                <RoleIcon className={cn("h-5 w-5", roleStyle.text)} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Your Role</div>
                <div className="text-sm font-semibold text-foreground">{getRoleLabel(invitation.role)}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-border/40 bg-muted/15 p-4 transition-colors hover:bg-muted/20">
              <div className="p-2.5 rounded-xl border border-border bg-card text-muted-foreground shadow-xs">
                <Mail className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Invitation Sent To</div>
                <div className="text-sm font-semibold text-foreground truncate">{invitation.email}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-border/40 bg-muted/15 p-4 transition-colors hover:bg-muted/20">
              <div className="p-2.5 rounded-xl border border-border bg-card text-muted-foreground shadow-xs">
                <Clock className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Validity Period</div>
                <div className="text-sm font-semibold text-foreground">
                  {isExpired ? 'Expired' : 'Expires on'} {format(expiresAt, 'MMMM d, yyyy')}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border/40">
            <Button
              onClick={handleDecline}
              disabled={isSubmitting || isExpired || isAlreadyAccepted}
              variant="outline"
              className="flex-1 cursor-pointer py-6 rounded-2xl border-border/85 hover:bg-muted/70 text-muted-foreground hover:text-foreground font-semibold transition-all active:scale-98 select-none"
            >
              <X className="mr-2 h-4 w-4" />
              Decline
            </Button>
            <Button
              onClick={handleAccept}
              disabled={isSubmitting || isExpired || isAlreadyAccepted}
              className="flex-1 cursor-pointer py-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/15 hover:shadow-indigo-500/20 active:scale-98 transition-all font-semibold border-0 select-none"
            >
              {isAlreadyAccepted ? (
                <Check className="mr-2 h-4 w-4 animate-in fade-in zoom-in duration-300" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              {isAlreadyAccepted ? 'Joined' : 'Accept Invitation'}
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

ShowInvitation.layout = (page: React.ReactNode) => (
  <AppLayout breadcrumbs={[{ title: 'Notifications', href: '/notifications' }, { title: 'Invitation', href: '#' }]}>
    {page}
  </AppLayout>
);
