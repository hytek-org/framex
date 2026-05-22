import { Form, Head, router } from '@inertiajs/react';
import { AlertTriangle, Check, Copy, Key, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { EmptyState } from '@/components/shared/empty-state';
import { FadeIn } from '@/components/shared/motion';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useClipboard } from '@/hooks/use-clipboard';

type Token = {
    id: number;
    name: string;
    last_used_at: string | null;
    created_at: string;
};

type Props = {
    tokens: Token[];
    plainTextToken?: string | null;
};

export default function ApiTokensIndex({ tokens, plainTextToken }: Props) {
    const [createOpen, setCreateOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [copiedText, copyToClipboard] = useClipboard();

    return (
        <>
            <Head title="API Tokens" />

            <div className="space-y-6 p-6">
                <FadeIn>
                    <PageHeader
                        title="API Tokens"
                        description="Create and manage API tokens for external integrations."
                    >
                        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Token
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create API Token</DialogTitle>
                                    <DialogDescription>
                                        Give your token a descriptive name.
                                    </DialogDescription>
                                </DialogHeader>
                                <Form
                                    action="/api-tokens"
                                    method="post"
                                    onSuccess={() => setCreateOpen(false)}
                                    className="space-y-4"
                                >
                                    {({ processing, errors }) => (
                                        <>
                                            <div className="space-y-2">
                                                <Label htmlFor="token-name">Token Name</Label>
                                                <Input
                                                    id="token-name"
                                                    name="name"
                                                    placeholder="e.g. CI/CD Pipeline"
                                                    autoFocus
                                                />
                                                {errors.name && (
                                                    <p className="text-xs text-destructive">
                                                        {errors.name}
                                                    </p>
                                                )}
                                            </div>
                                            <DialogFooter>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={() => setCreateOpen(false)}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button type="submit" disabled={processing}>
                                                    Create
                                                </Button>
                                            </DialogFooter>
                                        </>
                                    )}
                                </Form>
                            </DialogContent>
                        </Dialog>
                    </PageHeader>
                </FadeIn>

                {/* Plain text token banner */}
                {plainTextToken && (
                    <FadeIn>
                        <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">
                                    Copy your token now
                                </p>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    This token will only be shown once.
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                    <code className="flex-1 rounded-lg bg-muted px-3 py-2 font-mono text-xs text-foreground">
                                        {plainTextToken}
                                    </code>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => copyToClipboard(plainTextToken)}
                                    >
                                        {copiedText ? (
                                            <Check className="h-4 w-4" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </FadeIn>
                )}

                {/* Tokens table */}
                <FadeIn delay={0.15}>
                    {tokens.length > 0 ? (
                        <div className="rounded-2xl border bg-card">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Last Used</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="w-16" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tokens.map((token) => (
                                        <TableRow key={token.id}>
                                            <TableCell className="font-medium">
                                                {token.name}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {token.last_used_at || 'Never'}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {token.created_at}
                                            </TableCell>
                                            <TableCell>
                                                <Dialog
                                                    open={deleteId === token.id}
                                                    onOpenChange={(open) =>
                                                        setDeleteId(open ? token.id : null)
                                                    }
                                                >
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Revoke Token</DialogTitle>
                                                            <DialogDescription>
                                                                Are you sure you want to revoke{' '}
                                                                <span className="font-medium text-foreground">
                                                                    {token.name}
                                                                </span>
                                                                ? This action cannot be undone.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <DialogFooter>
                                                            <Button
                                                                variant="ghost"
                                                                onClick={() => setDeleteId(null)}
                                                            >
                                                                Cancel
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                onClick={() => {
                                                                    router.delete(
                                                                        `/api-tokens/${token.id}`,
                                                                    );
                                                                    setDeleteId(null);
                                                                }}
                                                            >
                                                                Revoke
                                                            </Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <EmptyState
                            icon={Key}
                            title="No API tokens"
                            description="Create your first API token to integrate with external services."
                            action={{
                                label: 'Create Token',
                                onClick: () => setCreateOpen(true),
                            }}
                        />
                    )}
                </FadeIn>
            </div>
        </>
    );
}


