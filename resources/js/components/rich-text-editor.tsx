import { useEditor, EditorContent } from '@tiptap/react';
import type { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { TableKit } from '@tiptap/extension-table';
import { Placeholder } from '@tiptap/extensions';
import {
    Bold,
    Check,
    Code,
    Heading2,
    Heading3,
    ImagePlus,
    Italic,
    Link2,
    List,
    ListOrdered,
    Minus,
    Quote,
    Redo2,
    Rows3,
    Strikethrough,
    Table2,
    Trash2,
    Undo2,
    X,
    Columns3,
    Pilcrow,
    Code2,
    Heading4,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';


interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    error?: string;
    placeholder?: string;
}

type ToolbarButtonProps = {
    label: string;
    active?: boolean;
    disabled?: boolean;
    onClick: () => void;
    children: ReactNode;
};

const isSafeLinkUrl = (value: string) => {
    const url = value.trim();
    if (!url) return false;

    try {
        const parsed = new URL(url, 'https://framex.local');
        return ['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol);
    } catch {
        return false;
    }
};

const isSafeImageUrl = (value: string) => {
    const url = value.trim();
    if (!url || url.startsWith('//')) return false;

    // Allow same-origin paths such as /storage/article-image.webp and absolute HTTP(S) URLs.
    if (url.startsWith('/')) return true;

    try {
        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
        return false;
    }
};

const normalizeLinkUrl = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return '';
    const candidate = /^(https?:|mailto:|tel:)/i.test(trimmed)
        ? trimmed
        : `https://${trimmed}`;
    return isSafeLinkUrl(candidate) ? candidate : null;
};

const editorExtensions = [
    // Link is configured separately below; disabling StarterKit's v3 Link avoids duplicate marks.
    StarterKit.configure({ link: false } as never),
    Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        isAllowedUri: (url) => isSafeLinkUrl(url),
        HTMLAttributes: {
            class: 'blog-editor__link',
            target: '_blank',
            rel: 'noopener noreferrer nofollow',
        },
    }),
    Image.configure({
        allowBase64: false,
        HTMLAttributes: {
            class: 'blog-editor__image',
            loading: 'lazy',
            draggable: 'true',
        },
    }),
    TableKit.configure({
        table: {
            resizable: true,
            renderWrapper: true,
            HTMLAttributes: { class: 'blog-editor__table' },
        },
        tableHeader: { HTMLAttributes: { class: 'blog-editor__table-header' } },
        tableCell: { HTMLAttributes: { class: 'blog-editor__table-cell' } },
    }),
    Placeholder.configure({
        placeholder: 'Start writing your article… Use headings to create a clear structure.',
        showOnlyCurrent: false,
    }),
];

function ToolbarButton({
    label,
    active = false,
    disabled = false,
    onClick,
    children,
}: ToolbarButtonProps) {
    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            title={label}
            aria-label={label}
            aria-pressed={active}
            disabled={disabled}
            onClick={onClick}
            className={cn(
                'size-8 shrink-0 rounded-md text-muted-foreground hover:text-foreground',
                active && 'bg-accent text-accent-foreground shadow-sm',
            )}
        >
            {children}
        </Button>
    );
}

function ToolbarDivider() {
    return <span aria-hidden="true" className="mx-1 h-6 w-px shrink-0 bg-border" />;
}

function MenuBar({ editor }: { editor: Editor }) {
    const [activePanel, setActivePanel] = useState<'link' | 'image' | null>(null);
    const [linkValue, setLinkValue] = useState('');
    const [imageValue, setImageValue] = useState('');
    const [imageAlt, setImageAlt] = useState('');
    const [panelError, setPanelError] = useState<string | null>(null);
    const linkInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (activePanel === 'link') {
            linkInputRef.current?.focus();
        }
    }, [activePanel]);

    const openLinkPanel = () => {
        setPanelError(null);
        setLinkValue(editor.getAttributes('link').href ?? '');
        setActivePanel((current) => current === 'link' ? null : 'link');
    };

    const submitLink = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const normalized = normalizeLinkUrl(linkValue);

        if (normalized === null) {
            setPanelError('Enter a valid HTTP(S), mailto, or tel URL.');
            return;
        }

        if (!normalized) {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
        } else {
            editor.chain().focus().extendMarkRange('link').setLink({ href: normalized }).run();
        }

        setActivePanel(null);
        setPanelError(null);
    };

    const openImagePanel = () => {
        setPanelError(null);
        setImageValue('');
        setImageAlt('');
        setActivePanel((current) => current === 'image' ? null : 'image');
    };

    const submitImage = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!isSafeImageUrl(imageValue)) {
            setPanelError('Use a valid HTTP(S) image URL or a same-site path such as /storage/image.webp.');
            return;
        }

        editor.chain().focus().setImage({ src: imageValue.trim(), alt: imageAlt.trim() }).run();
        setActivePanel(null);
        setPanelError(null);
    };

    const insertTable = () => {
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    };

    const canUndo = editor.can().chain().focus().undo().run();
    const canRedo = editor.can().chain().focus().redo().run();
    const insideTable = editor.isActive('table');

    return (
        <div className="border-b bg-muted/20">
            <div className="flex flex-wrap items-center gap-1 px-3 py-2" role="toolbar" aria-label="Article formatting">
                <div className="flex items-center gap-0.5">
                    <ToolbarButton label="Paragraph" active={editor.isActive('paragraph')} onClick={() => editor.chain().focus().setParagraph().run()}>
                        <Pilcrow className="size-4" />
                    </ToolbarButton>
                
                    <ToolbarButton label="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                        <Heading2 className="size-4" />
                    </ToolbarButton>
                    <ToolbarButton label="Heading 3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
                        <Heading3 className="size-4" />
                    </ToolbarButton>
                    <ToolbarButton label="Heading 3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}>
                        <Heading4 className="size-4" />
                    </ToolbarButton>
                </div>

                <ToolbarDivider />

                <div className="flex items-center gap-0.5">
                    <ToolbarButton label="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
                        <Bold className="size-4" />
                    </ToolbarButton>
                    <ToolbarButton label="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
                        <Italic className="size-4" />
                    </ToolbarButton>
                    <ToolbarButton label="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
                        <Strikethrough className="size-4" />
                    </ToolbarButton>
                    <ToolbarButton label="Inline code" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}>
                        <Code className="size-4" />
                    </ToolbarButton>
                </div>

                <ToolbarDivider />

                <div className="flex items-center gap-0.5">
                    <ToolbarButton label="Bulleted list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
                        <List className="size-4" />
                    </ToolbarButton>
                    <ToolbarButton label="Numbered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
                        <ListOrdered className="size-4" />
                    </ToolbarButton>
                    <ToolbarButton label="Block quote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
                        <Quote className="size-4" />
                    </ToolbarButton>
                    <ToolbarButton label="Code block" active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
                        <Code2 className="size-4" />
                    </ToolbarButton>
                    <ToolbarButton label="Horizontal divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
                        <Minus className="size-4" />
                    </ToolbarButton>
                </div>

                <ToolbarDivider />

                <div className="flex items-center gap-0.5">
                    <ToolbarButton label="Insert or edit link" active={editor.isActive('link') || activePanel === 'link'} onClick={openLinkPanel}>
                        <Link2 className="size-4" />
                    </ToolbarButton>
                    <ToolbarButton label="Insert image by URL" active={activePanel === 'image'} onClick={openImagePanel}>
                        <ImagePlus className="size-4" />
                    </ToolbarButton>
                    <ToolbarButton label="Insert table" onClick={insertTable}>
                        <Table2 className="size-4" />
                    </ToolbarButton>
                </div>

                {insideTable && (
                    <>
                        <ToolbarDivider />
                        <div className="flex items-center gap-0.5">
                            <ToolbarButton label="Add row below" onClick={() => editor.chain().focus().addRowAfter().run()}>
                                <Rows3 className="size-4" />
                            </ToolbarButton>
                            <ToolbarButton label="Add column after" onClick={() => editor.chain().focus().addColumnAfter().run()}>
                                <Columns3 className="size-4" />
                            </ToolbarButton>
                            <ToolbarButton label="Delete table" onClick={() => editor.chain().focus().deleteTable().run()}>
                                <Trash2 className="size-4" />
                            </ToolbarButton>
                        </div>
                    </>
                )}

                <div className="ml-auto flex items-center gap-0.5">
                    <ToolbarButton label="Undo" disabled={!canUndo} onClick={() => editor.chain().focus().undo().run()}>
                        <Undo2 className="size-4" />
                    </ToolbarButton>
                    <ToolbarButton label="Redo" disabled={!canRedo} onClick={() => editor.chain().focus().redo().run()}>
                        <Redo2 className="size-4" />
                    </ToolbarButton>
                </div>
            </div>

            {activePanel && (
                <div className="border-t bg-background px-4 py-3">
                    {activePanel === 'link' ? (
                        <form onSubmit={submitLink} className="mx-auto flex max-w-3xl flex-wrap items-end gap-3">
                            <div className="min-w-0 flex-1 space-y-1.5">
                                <Label htmlFor="editor-link-url" className="text-xs">Link URL</Label>
                                <Input
                                    ref={linkInputRef}
                                    id="editor-link-url"
                                    type="text"
                                    inputMode="url"
                                    value={linkValue}
                                    onChange={(event) => setLinkValue(event.target.value)}
                                    placeholder="https://example.com"
                                    className="h-9"
                                />
                            </div>
                            {panelError && <p role="alert" className="w-full text-xs text-destructive">{panelError}</p>}
                            <div className="flex items-center gap-2">
                                <Button type="submit" size="sm" className="h-9">
                                    <Check className="mr-1.5 size-3.5" /> Apply link
                                </Button>
                                <Button type="button" size="sm" variant="ghost" className="h-9" onClick={() => setActivePanel(null)}>
                                    <X className="mr-1.5 size-3.5" /> Close
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={submitImage} className="mx-auto grid max-w-3xl grid-cols-1 items-end gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,220px)_auto]">
                            <div className="min-w-0 space-y-1.5">
                                <Label htmlFor="editor-image-url" className="text-xs">Image URL</Label>
                                <Input
                                    id="editor-image-url"
                                    type="text"
                                    inputMode="url"
                                    value={imageValue}
                                    onChange={(event) => setImageValue(event.target.value)}
                                    placeholder="https://example.com/image.webp or /storage/image.webp"
                                    className="h-9"
                                />
                            </div>
                            <div className="min-w-0 space-y-1.5">
                                <Label htmlFor="editor-image-alt" className="text-xs">Alt text</Label>
                                <Input
                                    id="editor-image-alt"
                                    value={imageAlt}
                                    onChange={(event) => setImageAlt(event.target.value)}
                                    placeholder="Describe the image"
                                    className="h-9"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Button type="submit" size="sm" className="h-9">
                                    <Check className="mr-1.5 size-3.5" /> Insert image
                                </Button>
                                <Button type="button" size="icon" variant="ghost" className="size-9" onClick={() => setActivePanel(null)} aria-label="Close image panel">
                                    <X className="size-4" />
                                </Button>
                            </div>
                            {panelError && <p role="alert" className="text-xs text-destructive sm:col-span-3">{panelError}</p>}
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}

export function RichTextEditor({
    content,
    onChange,
    error,
    placeholder,
}: RichTextEditorProps) {
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    const editor = useEditor({
        extensions: editorExtensions,
        content: content || '<p></p>',
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'blog-editor__content',
                'aria-label': 'Article content editor',
                spellcheck: 'true',
            },
        },
        onUpdate: ({ editor: activeEditor }) => {
            onChangeRef.current(activeEditor.getHTML());
        },
    });

    // Keep the editor in sync when a parent resets or replaces the form content.
    // emitUpdate:false avoids a controlled-component update loop.
    useEffect(() => {
        if (!editor) return;
        const nextContent = content || '<p></p>';
        if (editor.getHTML() !== nextContent) {
            editor.commands.setContent(nextContent, { emitUpdate: false });
        }
    }, [content, editor]);

    if (!editor) {
        return (
            <div className="flex min-h-[480px] items-center justify-center rounded-xl border bg-background text-sm text-muted-foreground">
                Loading editor…
            </div>
        );
    }

    return (
        <div
            className={cn(
                'blog-editor overflow-hidden rounded-xl border bg-background transition-shadow',
                'focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/15',
                error && 'border-destructive focus-within:border-destructive focus-within:ring-destructive/15',
            )}
        >
            <MenuBar editor={editor} />
            <div
                className="blog-editor__canvas cursor-text"
                onClick={() => editor.commands.focus()}
            >
                <EditorContent editor={editor} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t bg-muted/20 px-4 py-2 text-[11px] text-muted-foreground">
                <span>{placeholder || 'Tip: use headings to make longer articles easier to scan.'}</span>
                <span className="hidden sm:inline">Formatting is preserved when you save</span>
            </div>
        </div>
    );
}
