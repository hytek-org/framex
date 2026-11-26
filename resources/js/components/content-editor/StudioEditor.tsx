/**
 * Backward-compatible adapter for existing Content Studio imports.
 * New code should import RichTextEditor directly from '@/components/rich-text-editor'.
 */
import type { JSONContent } from '@tiptap/core';
import { RichTextEditor } from '@/components/rich-text-editor';

export interface StudioEditorProps {
    content?: string | null;
    onChange: (html: string, json: JSONContent) => void;
    error?: string;
    placeholder?: string;
}

export function StudioEditor({ content, onChange, error, placeholder }: StudioEditorProps) {
    return (
        <RichTextEditor
            content={content}
            onChange={onChange}
            error={error}
            placeholder={placeholder}
        />
    );
}
