import React, { useCallback, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import {
    Bold,
    Italic,
    Strikethrough,
    Code,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Undo,
    Redo,
    ImageIcon,
    LinkIcon,
    Minus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MediaPickerModal } from './MediaPickerModal';

interface StudioEditorProps {
    content?: string | null;
    onChange: (html: string, json?: any) => void;
    error?: string;
    placeholder?: string;
}

export function StudioEditor({
    content = '',
    onChange,
    error,
    placeholder = 'Start writing your story or document...',
}: StudioEditorProps) {
    const [mediaModalOpen, setMediaModalOpen] = useState(false);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Image.configure({
                inline: false,
                HTMLAttributes: {
                    class: 'rounded-lg max-w-full h-auto my-4 border',
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline font-medium hover:opacity-80 transition-opacity',
                },
            }),
        ],
        content: content || '',
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[350px] p-4 text-sm leading-relaxed',
            },
        },
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            const json = editor.getJSON();
            onChange(html, json);
        },
    });

    const setLink = useCallback(() => {
        if (!editor) return;
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('Enter link URL', previousUrl);

        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    const handleMediaSelected = (media: { url: string; alt_text?: string | null }) => {
        if (editor) {
            editor.chain().focus().setImage({
                src: media.url,
                alt: media.alt_text || '',
            }).run();
        }
    };

    if (!editor) {
        return (
            <div className="border rounded-md p-4 min-h-[350px] flex items-center justify-center text-sm text-muted-foreground">
                Initializing editor...
            </div>
        );
    }

    return (
        <div className={cn('border rounded-md overflow-hidden bg-background focus-within:ring-1 focus-within:ring-primary', error && 'border-destructive')}>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-0.5 p-2 bg-muted/40 border-b">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={cn('h-8 w-8 p-0', editor.isActive('bold') && 'bg-muted text-primary')}
                    title="Bold (Ctrl+B)"
                >
                    <Bold className="h-4 w-4" />
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={cn('h-8 w-8 p-0', editor.isActive('italic') && 'bg-muted text-primary')}
                    title="Italic (Ctrl+I)"
                >
                    <Italic className="h-4 w-4" />
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={cn('h-8 w-8 p-0', editor.isActive('strike') && 'bg-muted text-primary')}
                    title="Strikethrough"
                >
                    <Strikethrough className="h-4 w-4" />
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    className={cn('h-8 w-8 p-0', editor.isActive('code') && 'bg-muted text-primary')}
                    title="Inline Code"
                >
                    <Code className="h-4 w-4" />
                </Button>

                <div className="w-[1px] h-5 bg-border mx-1" />

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={cn('h-8 w-8 p-0', editor.isActive('heading', { level: 1 }) && 'bg-muted text-primary')}
                    title="Heading 1"
                >
                    <Heading1 className="h-4 w-4" />
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={cn('h-8 w-8 p-0', editor.isActive('heading', { level: 2 }) && 'bg-muted text-primary')}
                    title="Heading 2"
                >
                    <Heading2 className="h-4 w-4" />
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={cn('h-8 w-8 p-0', editor.isActive('heading', { level: 3 }) && 'bg-muted text-primary')}
                    title="Heading 3"
                >
                    <Heading3 className="h-4 w-4" />
                </Button>

                <div className="w-[1px] h-5 bg-border mx-1" />

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={cn('h-8 w-8 p-0', editor.isActive('bulletList') && 'bg-muted text-primary')}
                    title="Bullet List"
                >
                    <List className="h-4 w-4" />
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={cn('h-8 w-8 p-0', editor.isActive('orderedList') && 'bg-muted text-primary')}
                    title="Numbered List"
                >
                    <ListOrdered className="h-4 w-4" />
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={cn('h-8 w-8 p-0', editor.isActive('blockquote') && 'bg-muted text-primary')}
                    title="Quote"
                >
                    <Quote className="h-4 w-4" />
                </Button>

                <div className="w-[1px] h-5 bg-border mx-1" />

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={setLink}
                    className={cn('h-8 w-8 p-0', editor.isActive('link') && 'bg-muted text-primary')}
                    title="Hyperlink"
                >
                    <LinkIcon className="h-4 w-4" />
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setMediaModalOpen(true)}
                    className="h-8 w-8 p-0"
                    title="Insert Media Studio Asset"
                >
                    <ImageIcon className="h-4 w-4" />
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    className="h-8 w-8 p-0"
                    title="Horizontal Divider"
                >
                    <Minus className="h-4 w-4" />
                </Button>

                <div className="w-[1px] h-5 bg-border mx-1 ml-auto" />

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    className="h-8 w-8 p-0"
                    title="Undo"
                >
                    <Undo className="h-4 w-4" />
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    className="h-8 w-8 p-0"
                    title="Redo"
                >
                    <Redo className="h-4 w-4" />
                </Button>
            </div>

            {/* Editable Canvas */}
            <EditorContent editor={editor} />

            {/* Media Selector Modal */}
            <MediaPickerModal
                open={mediaModalOpen}
                onClose={() => setMediaModalOpen(false)}
                onSelect={handleMediaSelected}
            />

            {error && <p className="text-xs text-destructive px-3 pb-2">{error}</p>}
        </div>
    );
}
