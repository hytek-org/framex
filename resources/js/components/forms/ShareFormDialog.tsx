import {
    Check,
    Code2,
    Copy,
    ExternalLink,
    Globe,
    Link2,
    Terminal,
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { FormField } from './DynamicForm';

interface ShareFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    form: {
        name: string;
        slug: string;
        is_active: boolean;
        fields?: FormField[];
    } | null;
    appUrl: string;
}

export function ShareFormDialog({
    open,
    onOpenChange,
    form,
    appUrl,
}: ShareFormDialogProps) {
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [iframeHeight, setIframeHeight] = useState('640');

    if (!form) {
        return null;
    }

    const baseUrl = appUrl || (typeof window !== 'undefined' ? window.location.origin : '');
    const publicUrl = `${baseUrl}/forms/${form.slug}`;
    const embedUrl = `${publicUrl}?embed=1`;
    const submitUrl = `${baseUrl}/forms/${form.slug}/submit`;

    const iframeSnippet = `<iframe\n  src="${embedUrl}"\n  width="100%"\n  height="${iframeHeight}"\n  frameborder="0"\n  style="border: 0; border-radius: 12px; width: 100%;"\n  title="${form.name.replace(/"/g, '&quot;')}"\n></iframe>`;

    const samplePayload: Record<string, any> = {};
    (form.fields || []).forEach((field) => {
        if (field.type === 'email') {
            samplePayload[field.name] = 'alex@company.com';
        } else if (field.type === 'checkbox') {
            samplePayload[field.name] = true;
        } else if (field.type === 'checkbox_group') {
            samplePayload[field.name] = field.options?.slice(0, 1) || ['Option 1'];
        } else if (field.type === 'select' || field.type === 'radio') {
            samplePayload[field.name] = field.options?.[0] || 'Option 1';
        } else if (field.type === 'number') {
            samplePayload[field.name] = 42;
        } else if (field.type === 'date') {
            samplePayload[field.name] = '2026-12-01';
        } else if (field.type === 'url') {
            samplePayload[field.name] = 'https://example.com';
        } else {
            samplePayload[field.name] = field.placeholder || `Sample ${field.label}`;
        }
    });

    const curlSnippet = `curl -X POST "${submitUrl}" \\\n  -H "Content-Type: application/json" \\\n  -H "Accept: application/json" \\\n  -d '${JSON.stringify(samplePayload, null, 2)}'`;

    const copyText = async (key: string, text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedKey(key);
            toast.success(`${label} copied to clipboard`);
            window.setTimeout(() => setCopiedKey(null), 2000);
        } catch {
            toast.error('Unable to access clipboard');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <div className="flex items-center gap-2.5">
                        <DialogTitle className="text-lg">Share & Embed "{form.name}"</DialogTitle>
                        <Badge
                            variant="outline"
                            className={
                                form.is_active
                                    ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300'
                                    : 'text-amber-700 bg-amber-50 dark:bg-amber-950/40 border-amber-300'
                            }
                        >
                            {form.is_active ? 'Live' : 'Paused'}
                        </Badge>
                    </div>
                    <DialogDescription>
                        Share the hosted form link directly with users, embed it inside any website via iframe, or submit programmatically via JSON API.
                    </DialogDescription>
                </DialogHeader>

                {!form.is_active && (
                    <div className="rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50/70 dark:bg-amber-950/30 px-3.5 py-2.5 text-xs text-amber-800 dark:text-amber-200">
                        This form is currently <strong>paused</strong>. Visitors opening the link will see a closed notice until you activate it.
                    </div>
                )}

                <Tabs defaultValue="link" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="link" className="gap-1.5 text-xs">
                            <Globe className="h-3.5 w-3.5" />
                            Hosted Link
                        </TabsTrigger>
                        <TabsTrigger value="embed" className="gap-1.5 text-xs">
                            <Code2 className="h-3.5 w-3.5" />
                            Website Embed
                        </TabsTrigger>
                        <TabsTrigger value="api" className="gap-1.5 text-xs">
                            <Terminal className="h-3.5 w-3.5" />
                            JSON API
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="link" className="space-y-4 pt-3">
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground">
                                Public Hosted Form URL
                            </Label>
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <Link2 className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                                    <Input
                                        readOnly
                                        value={publicUrl}
                                        className="pl-9 font-mono text-xs bg-muted/40"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => copyText('link', publicUrl, 'Form URL')}
                                    className="gap-1.5 shrink-0"
                                >
                                    {copiedKey === 'link' ? (
                                        <Check className="h-4 w-4 text-emerald-600" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                    Copy
                                </Button>
                                <Button type="button" size="sm" asChild className="gap-1.5 shrink-0">
                                    <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                                        Open
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                </Button>
                            </div>
                        </div>

                        <div className="rounded-xl border bg-muted/30 p-4 text-xs text-muted-foreground space-y-1">
                            <p className="font-medium text-foreground">Ready for immediate sharing</p>
                            <p>
                                Send this URL in emails, QR codes, social posts, or support portals. FrameX renders a responsive, mobile-friendly form with built-in validation and spam protection.
                            </p>
                        </div>
                    </TabsContent>

                    <TabsContent value="embed" className="space-y-4 pt-3">
                        <div className="flex items-center justify-between gap-4">
                            <Label className="text-xs font-medium text-muted-foreground">
                                Responsive HTML Iframe Snippet
                            </Label>
                            <div className="flex items-center gap-2">
                                <Label htmlFor="iframe-height" className="text-xs text-muted-foreground">
                                    Height (px):
                                </Label>
                                <Input
                                    id="iframe-height"
                                    type="number"
                                    min={300}
                                    max={2000}
                                    value={iframeHeight}
                                    onChange={(e) => setIframeHeight(e.target.value)}
                                    className="h-7 w-20 text-xs font-mono"
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <pre className="rounded-xl border bg-zinc-950 text-zinc-100 p-4 text-xs font-mono overflow-x-auto leading-relaxed">
                                {iframeSnippet}
                            </pre>
                            <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                onClick={() => copyText('embed', iframeSnippet, 'Embed code')}
                                className="absolute top-2.5 right-2.5 h-7 gap-1.5 text-xs"
                            >
                                {copiedKey === 'embed' ? (
                                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                                ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                )}
                                Copy
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="api" className="space-y-4 pt-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-muted-foreground">
                                POST Submission Endpoint
                            </Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    readOnly
                                    value={`POST ${submitUrl}`}
                                    className="font-mono text-xs bg-muted/40"
                                />
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => copyText('endpoint', submitUrl, 'Endpoint URL')}
                                    className="gap-1.5 shrink-0"
                                >
                                    {copiedKey === 'endpoint' ? (
                                        <Check className="h-4 w-4 text-emerald-600" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                    Copy
                                </Button>
                            </div>
                        </div>

                        <div className="relative">
                            <pre className="rounded-xl border bg-zinc-950 text-zinc-100 p-4 text-xs font-mono overflow-x-auto leading-relaxed max-h-64">
                                {curlSnippet}
                            </pre>
                            <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                onClick={() => copyText('curl', curlSnippet, 'cURL snippet')}
                                className="absolute top-2.5 right-2.5 h-7 gap-1.5 text-xs"
                            >
                                {copiedKey === 'curl' ? (
                                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                                ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                )}
                                Copy
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
