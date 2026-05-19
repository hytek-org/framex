import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { 
    Bold, Italic, Strikethrough, Code, Heading1, Heading2, 
    List, ListOrdered, Quote, Undo, Redo, ImageIcon, LinkIcon, X
} from 'lucide-react';
import { Button } from './ui/button';
import { useCallback } from 'react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    error?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null;
    }

    const setLink = useCallback(() => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        if (url === null) {
            return;
        }

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    const addImage = useCallback(() => {
        const url = window.prompt('URL');

        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    }, [editor]);

    return (
        <div className="flex flex-wrap gap-1 p-2 bg-muted/50 border-b rounded-t-md">
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={cn('h-8 w-8 p-1', editor.isActive('bold') && 'bg-muted')}
            >
                <Bold className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={cn('h-8 w-8 p-1', editor.isActive('italic') && 'bg-muted')}
            >
                <Italic className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={cn('h-8 w-8 p-1', editor.isActive('strike') && 'bg-muted')}
            >
                <Strikethrough className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={cn('h-8 w-8 p-1', editor.isActive('code') && 'bg-muted')}
            >
                <Code className="h-4 w-4" />
            </Button>
            <div className="w-[1px] h-6 bg-border mx-1 my-auto" />
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={cn('h-8 w-8 p-1', editor.isActive('heading', { level: 1 }) && 'bg-muted')}
            >
                <Heading1 className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={cn('h-8 w-8 p-1', editor.isActive('heading', { level: 2 }) && 'bg-muted')}
            >
                <Heading2 className="h-4 w-4" />
            </Button>
            <div className="w-[1px] h-6 bg-border mx-1 my-auto" />
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={cn('h-8 w-8 p-1', editor.isActive('bulletList') && 'bg-muted')}
            >
                <List className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={cn('h-8 w-8 p-1', editor.isActive('orderedList') && 'bg-muted')}
            >
                <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={cn('h-8 w-8 p-1', editor.isActive('blockquote') && 'bg-muted')}
            >
                <Quote className="h-4 w-4" />
            </Button>
            <div className="w-[1px] h-6 bg-border mx-1 my-auto" />
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={setLink}
                className={cn('h-8 w-8 p-1', editor.isActive('link') && 'bg-muted')}
            >
                <LinkIcon className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addImage}
                className="h-8 w-8 p-1"
            >
                <ImageIcon className="h-4 w-4" />
            </Button>
            <div className="w-[1px] h-6 bg-border mx-1 my-auto" />
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                className="h-8 w-8 p-1"
            >
                <Undo className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                className="h-8 w-8 p-1"
            >
                <Redo className="h-4 w-4" />
            </Button>
        </div>
    );
};

export function RichTextEditor({ content, onChange, error }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-md border border-border shadow-sm max-w-full h-auto',
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline underline-offset-4',
                },
            }),
        ],
        content: content,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[300px] p-4',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    return (
        <div className={cn(
            "flex flex-col border rounded-md shadow-sm bg-background overflow-hidden",
            error ? "border-destructive focus-within:ring-destructive" : "border-input focus-within:ring-1 focus-within:ring-ring"
        )}>
            <MenuBar editor={editor} />
            <div className="bg-background cursor-text" onClick={() => editor?.commands.focus()}>
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
