import { EditorContent, useEditor } from "@tiptap/react";
import type { Editor, JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { TableKit } from "@tiptap/extension-table";
import { Placeholder } from "@tiptap/extensions";
import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    ArrowUp,
    Bold,
    Check,
    Code,
    Code2,
    Columns3,
    CornerDownLeft,
    Eraser,
    ExternalLink,
    Heading1,
    Heading2,
    Heading3,
    Heading4,
    Highlighter,
    ImagePlus,
    Italic,
    Link2,
    List,
    ListOrdered,
    Minus,
    Pilcrow,
    Plus,
    Quote,
    Redo2,
    Rows3,
    Strikethrough,
    Table2,
    Trash2,
    Underline as UnderlineIcon,
    Undo2,
    Unlink,
    X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, FormEvent, MouseEvent, ReactNode } from "react";
import { toast } from "sonner";

import { MediaPickerModal } from "@/components/content-editor/MediaPickerModal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface RichTextEditorProps {
    /** Existing HTML. Supports Blog `content` and Content Studio `body_html`. */
    content?: string | null;
    /** HTML is supplied first; the Tiptap JSON document is supplied second. */
    onChange: (html: string, json: JSONContent) => void;
    error?: string;
    placeholder?: string;
    minHeight?: number;
    className?: string;
}

type MediaPickerItem = {
    id: number;
    filename: string;
    url: string;
    mime_type: string;
    size: number;
    alt_text?: string | null;
};

type ToolbarButtonProps = {
    label: string;
    active?: boolean;
    disabled?: boolean;
    onClick: () => void;
    children: ReactNode;
};

type TableActionProps = {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
    disabled?: boolean;
    destructive?: boolean;
    active?: boolean;
};

const EMPTY_DOCUMENT = "<p></p>";
const TABLE_GRID_SIZE = 8;

function isSafeLinkUrl(value: string): boolean {
    const trimmed = value.trim();
    if (!trimmed || trimmed.startsWith("//")) return false;

    try {
        const parsed = new URL(trimmed, "https://framex.invalid");
        return ["http:", "https:", "mailto:", "tel:"].includes(parsed.protocol);
    } catch {
        return false;
    }
}

function normalizeLinkUrl(value: string): string | null {
    const trimmed = value.trim();
    if (!trimmed) return "";

    const candidate = /^(https?:|mailto:|tel:|\/|#)/i.test(trimmed)
        ? trimmed
        : `https://${trimmed}`;

    return isSafeLinkUrl(candidate) ? candidate : null;
}

function isSafeImageUrl(value: string): boolean {
    const trimmed = value.trim();
    if (!trimmed || trimmed.startsWith("//")) return false;
    if (trimmed.startsWith("/")) return true;

    try {
        const parsed = new URL(trimmed);
        return ["http:", "https:"].includes(parsed.protocol);
    } catch {
        return false;
    }
}

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
            onMouseDown={(event) => event.preventDefault()}
            onClick={onClick}
            className={cn(
                "size-8 shrink-0 rounded-lg text-muted-foreground transition-colors hover:text-foreground",
                active && "bg-accent text-accent-foreground shadow-xs",
            )}
        >
            {children}
        </Button>
    );
}

function ToolbarDivider() {
    return (
        <span
            aria-hidden="true"
            className="mx-1 h-5 w-px shrink-0 bg-border/80"
        />
    );
}

function TableAction({
    label,
    onClick,
    icon,
    disabled = false,
    destructive = false,
    active = false,
}: TableActionProps) {
    return (
        <Button
            type="button"
            size="sm"
            variant="ghost"
            title={label}
            aria-label={label}
            aria-pressed={active}
            disabled={disabled}
            onMouseDown={(event) => event.preventDefault()}
            onClick={onClick}
            className={cn(
                "h-7 shrink-0 gap-1.5 rounded-md px-2 text-xs font-medium text-muted-foreground hover:bg-background hover:text-foreground",
                active && "bg-accent text-accent-foreground",
                destructive &&
                    "text-destructive hover:bg-destructive/10 hover:text-destructive",
            )}
        >
            {icon}
            <span className="whitespace-nowrap">{label}</span>
        </Button>
    );
}

function TableGridPicker({
    editor,
    open,
    onOpenChange,
    disabled = false,
}: {
    editor: Editor;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    disabled?: boolean;
}) {
    const [hoverGrid, setHoverGrid] = useState({ rows: 3, cols: 3 });
    const [withHeaderRow, setWithHeaderRow] = useState(true);

    const insertTable = (rows: number, cols: number) => {
        editor.chain().focus().insertTable({ rows, cols, withHeaderRow }).run();
        onOpenChange(false);
        setHoverGrid({ rows: 3, cols: 3 });
    };

    return (
        <Popover
            open={open}
            onOpenChange={(nextOpen) => {
                onOpenChange(nextOpen);
                if (!nextOpen) editor.commands.focus();
            }}
        >
            <PopoverTrigger
                type="button"
                title={disabled ? "Already inside a table" : "Insert table"}
                aria-label="Insert table"
                aria-expanded={open}
                disabled={disabled}
                onMouseDown={(event) => event.preventDefault()}
                className={cn(
                    "inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-50",
                    open && "bg-accent text-accent-foreground",
                )}
            >
                <Table2 className="size-4" />
            </PopoverTrigger>
            <PopoverContent
                align="start"
                sideOffset={8}
                className="w-[min(19rem,calc(100vw-2rem))] rounded-xl p-4 shadow-xl"
            >
                <div className="space-y-3.5">
                    <div className="flex items-start justify-between gap-3">
                        <div className="space-y-0.5">
                            <p className="text-sm font-semibold">
                                Insert table
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Pick rows and columns.
                            </p>
                        </div>
                        <span className="rounded-md border bg-muted/50 px-2 py-0.5 font-mono text-[11px] font-medium tabular-nums text-foreground">
                            {hoverGrid.rows} × {hoverGrid.cols}
                        </span>
                    </div>

                    <div
                        className="framex-rich-editor__table-grid"
                        role="group"
                        aria-label="Choose table dimensions"
                    >
                        {Array.from(
                            { length: TABLE_GRID_SIZE * TABLE_GRID_SIZE },
                            (_, index) => {
                                const row =
                                    Math.floor(index / TABLE_GRID_SIZE) + 1;
                                const col = (index % TABLE_GRID_SIZE) + 1;
                                const active =
                                    row <= hoverGrid.rows &&
                                    col <= hoverGrid.cols;

                                return (
                                    <button
                                        key={`${row}-${col}`}
                                        type="button"
                                        onMouseDown={(event) =>
                                            event.preventDefault()
                                        }
                                        aria-label={`Insert ${row} rows by ${col} columns`}
                                        aria-pressed={
                                            hoverGrid.rows === row &&
                                            hoverGrid.cols === col
                                        }
                                        onMouseEnter={() =>
                                            setHoverGrid({
                                                rows: row,
                                                cols: col,
                                            })
                                        }
                                        onFocus={() =>
                                            setHoverGrid({
                                                rows: row,
                                                cols: col,
                                            })
                                        }
                                        onClick={() => insertTable(row, col)}
                                        className={cn(
                                            "framex-rich-editor__table-grid-cell",
                                            active && "is-active",
                                            hoverGrid.rows === row &&
                                                hoverGrid.cols === col &&
                                                "is-current",
                                        )}
                                    />
                                );
                            },
                        )}
                    </div>

                    <div className="flex items-center justify-between gap-3 border-t pt-3">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="framex-table-header-row"
                                checked={withHeaderRow}
                                onCheckedChange={(checked) =>
                                    setWithHeaderRow(checked === true)
                                }
                            />
                            <Label
                                htmlFor="framex-table-header-row"
                                className="cursor-pointer text-xs font-medium text-muted-foreground"
                            >
                                Header row
                            </Label>
                        </div>
                        <Button
                            type="button"
                            size="sm"
                            className="h-8 rounded-lg px-3 text-xs"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() =>
                                insertTable(hoverGrid.rows, hoverGrid.cols)
                            }
                        >
                            Insert {hoverGrid.rows} × {hoverGrid.cols}
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}

function LinkPopover({
    editor,
    open,
    onOpenChange,
}: {
    editor: Editor;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const [linkValue, setLinkValue] = useState("");
    const [linkError, setLinkError] = useState<string | null>(null);
    const linkInputRef = useRef<HTMLInputElement>(null);

    const isActive = editor.isActive("link");
    const currentHref =
        (editor.getAttributes("link").href as string | undefined) ?? "";

    const handleOpenChange = (nextOpen: boolean) => {
        if (nextOpen) {
            setLinkValue(currentHref);
            setLinkError(null);
        }
        onOpenChange(nextOpen);
    };

    useEffect(() => {
        if (open) {
            requestAnimationFrame(() => linkInputRef.current?.focus());
        }
    }, [open]);

    const applyLink = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const normalized = normalizeLinkUrl(linkValue);

        if (normalized === null) {
            setLinkError(
                "Enter a valid https://, mailto:, tel:, or /internal URL.",
            );
            return;
        }

        if (!normalized) {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
        } else {
            editor
                .chain()
                .focus()
                .extendMarkRange("link")
                .setLink({ href: normalized })
                .run();
        }

        onOpenChange(false);
        setLinkError(null);
    };

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger
                type="button"
                title="Insert or edit link"
                aria-label="Insert or edit link"
                aria-pressed={isActive || open}
                onMouseDown={(event) => event.preventDefault()}
                className={cn(
                    "inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                    (isActive || open) &&
                        "bg-accent text-accent-foreground shadow-xs",
                )}
            >
                <Link2 className="size-4" />
            </PopoverTrigger>
            <PopoverContent
                align="start"
                sideOffset={8}
                className="w-[min(22rem,calc(100vw-2rem))] rounded-xl p-4 shadow-xl"
            >
                <form onSubmit={applyLink} className="space-y-3">
                    <div className="space-y-1.5">
                        <Label
                            htmlFor="framex-editor-link"
                            className="text-xs font-semibold"
                        >
                            Link URL
                        </Label>
                        <Input
                            ref={linkInputRef}
                            id="framex-editor-link"
                            value={linkValue}
                            onChange={(event) => {
                                setLinkValue(event.target.value);
                                if (linkError) setLinkError(null);
                            }}
                            placeholder="https://example.com or /docs"
                            inputMode="url"
                            className="h-9 text-sm"
                        />
                        {linkError && (
                            <p
                                role="alert"
                                className="text-xs text-destructive"
                            >
                                {linkError}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                            <Button
                                type="submit"
                                size="sm"
                                className="h-8 gap-1.5 text-xs"
                            >
                                <Check className="size-3.5" /> Apply
                            </Button>
                            {isActive && currentHref && (
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="outline"
                                    className="size-8"
                                    title="Open link in new tab"
                                    asChild
                                >
                                    <a
                                        href={currentHref}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <ExternalLink className="size-3.5" />
                                    </a>
                                </Button>
                            )}
                        </div>
                        {isActive && (
                            <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="h-8 gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => {
                                    editor
                                        .chain()
                                        .focus()
                                        .extendMarkRange("link")
                                        .unsetLink()
                                        .run();
                                    onOpenChange(false);
                                }}
                            >
                                <Unlink className="size-3.5" /> Remove
                            </Button>
                        )}
                    </div>
                </form>
            </PopoverContent>
        </Popover>
    );
}

function MenuBar({
    editor,
    onOpenMediaPicker,
}: {
    editor: Editor;
    onOpenMediaPicker: () => void;
}) {
    const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
    const [tablePopoverOpen, setTablePopoverOpen] = useState(false);
    const [editorTick, setEditorTick] = useState(0);

    useEffect(() => {
        const refresh = () => setEditorTick((tick) => tick + 1);
        editor.on("transaction", refresh);
        editor.on("selectionUpdate", refresh);

        return () => {
            editor.off("transaction", refresh);
            editor.off("selectionUpdate", refresh);
        };
    }, [editor]);

    const inTable =
        editor.isActive("table") ||
        editor.isActive("tableCell") ||
        editor.isActive("tableHeader");
    const canUndo = editor.can().chain().undo().run();
    const canRedo = editor.can().chain().redo().run();
    const canAddRowBefore =
        inTable && editor.can().chain().addRowBefore().run();
    const canAddRowAfter = inTable && editor.can().chain().addRowAfter().run();
    const canDeleteRow = inTable && editor.can().chain().deleteRow().run();
    const canAddColumnBefore =
        inTable && editor.can().chain().addColumnBefore().run();
    const canAddColumnAfter =
        inTable && editor.can().chain().addColumnAfter().run();
    const canDeleteColumn =
        inTable && editor.can().chain().deleteColumn().run();
    const canToggleHeaderRow =
        inTable && editor.can().chain().toggleHeaderRow().run();
    const canToggleHeaderColumn =
        inTable && editor.can().chain().toggleHeaderColumn().run();
    const canMergeCells = inTable && editor.can().chain().mergeCells().run();
    const canSplitCell = inTable && editor.can().chain().splitCell().run();
    const canDeleteTable = inTable && editor.can().chain().deleteTable().run();

    const insertParagraphAfterTable = () => {
        const { $from } = editor.state.selection;
        for (let depth = $from.depth; depth > 0; depth -= 1) {
            if ($from.node(depth).type.name === "table") {
                const afterPos = $from.after(depth);
                editor
                    .chain()
                    .focus()
                    .insertContentAt(afterPos, { type: "paragraph" })
                    .setTextSelection(afterPos + 1)
                    .run();
                return;
            }
        }
    };

    void editorTick;

    return (
        <div className="framex-rich-editor__toolbar-shell">
            <div className="framex-rich-editor__toolbar-scroll">
                <div
                    className="framex-rich-editor__toolbar"
                    role="toolbar"
                    aria-label="Rich text formatting"
                >
                    <div
                        className="framex-rich-editor__toolbar-group"
                        aria-label="Block style"
                    >
                        <ToolbarButton
                            label="Paragraph"
                            active={editor.isActive("paragraph")}
                            onClick={() =>
                                editor.chain().focus().setParagraph().run()
                            }
                        >
                            <Pilcrow className="size-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            label="Heading 1"
                            active={editor.isActive("heading", { level: 1 })}
                            onClick={() =>
                                editor
                                    .chain()
                                    .focus()
                                    .toggleHeading({ level: 1 })
                                    .run()
                            }
                        >
                            <Heading1 className="size-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            label="Heading 2"
                            active={editor.isActive("heading", { level: 2 })}
                            onClick={() =>
                                editor
                                    .chain()
                                    .focus()
                                    .toggleHeading({ level: 2 })
                                    .run()
                            }
                        >
                            <Heading2 className="size-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            label="Heading 3"
                            active={editor.isActive("heading", { level: 3 })}
                            onClick={() =>
                                editor
                                    .chain()
                                    .focus()
                                    .toggleHeading({ level: 3 })
                                    .run()
                            }
                        >
                            <Heading3 className="size-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            label="Heading 4"
                            active={editor.isActive("heading", { level: 4 })}
                            onClick={() =>
                                editor
                                    .chain()
                                    .focus()
                                    .toggleHeading({ level: 4 })
                                    .run()
                            }
                        >
                            <Heading4 className="size-4" />
                        </ToolbarButton>
                    </div>

                    <ToolbarDivider />

                    <div
                        className="framex-rich-editor__toolbar-group"
                        aria-label="Text formatting"
                    >
                        <ToolbarButton
                            label="Bold"
                            active={editor.isActive("bold")}
                            onClick={() =>
                                editor.chain().focus().toggleBold().run()
                            }
                        >
                            <Bold className="size-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            label="Italic"
                            active={editor.isActive("italic")}
                            onClick={() =>
                                editor.chain().focus().toggleItalic().run()
                            }
                        >
                            <Italic className="size-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            label="Underline"
                            active={editor.isActive("underline")}
                            onClick={() =>
                                editor.chain().focus().toggleUnderline().run()
                            }
                        >
                            <UnderlineIcon className="size-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            label="Strikethrough"
                            active={editor.isActive("strike")}
                            onClick={() =>
                                editor.chain().focus().toggleStrike().run()
                            }
                        >
                            <Strikethrough className="size-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            label="Inline code"
                            active={editor.isActive("code")}
                            onClick={() =>
                                editor.chain().focus().toggleCode().run()
                            }
                        >
                            <Code className="size-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            label="Highlight"
                            active={editor.isActive("highlight")}
                            onClick={() =>
                                editor.chain().focus().toggleHighlight().run()
                            }
                        >
                            <Highlighter className="size-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            label="Clear formatting"
                            onClick={() =>
                                editor
                                    .chain()
                                    .focus()
                                    .unsetAllMarks()
                                    .clearNodes()
                                    .run()
                            }
                        >
                            <Eraser className="size-4" />
                        </ToolbarButton>
                    </div>

                    <ToolbarDivider />

                    <div
                        className="framex-rich-editor__toolbar-group"
                        aria-label="Text alignment"
                    >
                        <ToolbarButton
                            label="Align left"
                            active={editor.isActive({ textAlign: "left" })}
                            onClick={() =>
                                editor
                                    .chain()
                                    .focus()
                                    .setTextAlign("left")
                                    .run()
                            }
                        >
                            <AlignLeft className="size-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            label="Align center"
                            active={editor.isActive({ textAlign: "center" })}
                            onClick={() =>
                                editor
                                    .chain()
                                    .focus()
                                    .setTextAlign("center")
                                    .run()
                            }
                        >
                            <AlignCenter className="size-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            label="Align right"
                            active={editor.isActive({ textAlign: "right" })}
                            onClick={() =>
                                editor
                                    .chain()
                                    .focus()
                                    .setTextAlign("right")
                                    .run()
                            }
                        >
                            <AlignRight className="size-4" />
                        </ToolbarButton>
                    </div>

                    <ToolbarDivider />

                    <div
                        className="framex-rich-editor__toolbar-group"
                        aria-label="Lists and blocks"
                    >
                        <ToolbarButton
                            label="Bulleted list"
                            active={editor.isActive("bulletList")}
                            onClick={() =>
                                editor.chain().focus().toggleBulletList().run()
                            }
                        >
                            <List className="size-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            label="Numbered list"
                            active={editor.isActive("orderedList")}
                            onClick={() =>
                                editor.chain().focus().toggleOrderedList().run()
                            }
                        >
                            <ListOrdered className="size-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            label="Block quote"
                            active={editor.isActive("blockquote")}
                            onClick={() =>
                                editor.chain().focus().toggleBlockquote().run()
                            }
                        >
                            <Quote className="size-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            label="Code block"
                            active={editor.isActive("codeBlock")}
                            onClick={() =>
                                editor.chain().focus().toggleCodeBlock().run()
                            }
                        >
                            <Code2 className="size-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            label="Horizontal divider"
                            onClick={() =>
                                editor.chain().focus().setHorizontalRule().run()
                            }
                        >
                            <Minus className="size-4" />
                        </ToolbarButton>
                    </div>

                    <ToolbarDivider />

                    <div
                        className="framex-rich-editor__toolbar-group"
                        aria-label="Insert content"
                    >
                        <LinkPopover
                            editor={editor}
                            open={linkPopoverOpen}
                            onOpenChange={setLinkPopoverOpen}
                        />
                        <ToolbarButton
                            label="Insert image from Media Studio"
                            onClick={onOpenMediaPicker}
                        >
                            <ImagePlus className="size-4" />
                        </ToolbarButton>
                        <TableGridPicker
                            editor={editor}
                            open={tablePopoverOpen}
                            onOpenChange={setTablePopoverOpen}
                            disabled={inTable}
                        />
                    </div>

                    <div className="framex-rich-editor__toolbar-history">
                        <ToolbarButton
                            label="Undo"
                            disabled={!canUndo}
                            onClick={() => editor.chain().focus().undo().run()}
                        >
                            <Undo2 className="size-4" />
                        </ToolbarButton>
                        <ToolbarButton
                            label="Redo"
                            disabled={!canRedo}
                            onClick={() => editor.chain().focus().redo().run()}
                        >
                            <Redo2 className="size-4" />
                        </ToolbarButton>
                    </div>
                </div>
            </div>

            {inTable && (
                <div className="framex-rich-editor__table-tools-scroll">
                    <div
                        className="framex-rich-editor__table-tools"
                        role="toolbar"
                        aria-label="Table editing tools"
                    >
                        <div className="framex-rich-editor__table-tools-heading">
                            <span className="framex-rich-editor__table-tools-icon">
                                <Table2 className="size-3.5" />
                            </span>
                            <span>Table</span>
                        </div>

                        <div
                            className="framex-rich-editor__table-tools-group"
                            role="group"
                            aria-label="Row actions"
                        >
                            <TableAction
                                label="Row above"
                                icon={<ArrowUp className="size-3.5" />}
                                disabled={!canAddRowBefore}
                                onClick={() =>
                                    editor.chain().focus().addRowBefore().run()
                                }
                            />
                            <TableAction
                                label="Row below"
                                icon={<ArrowDown className="size-3.5" />}
                                disabled={!canAddRowAfter}
                                onClick={() =>
                                    editor.chain().focus().addRowAfter().run()
                                }
                            />
                            <TableAction
                                label="Del row"
                                icon={<Rows3 className="size-3.5" />}
                                destructive
                                disabled={!canDeleteRow}
                                onClick={() =>
                                    editor.chain().focus().deleteRow().run()
                                }
                            />
                        </div>

                        <div
                            className="framex-rich-editor__table-tools-group"
                            role="group"
                            aria-label="Column actions"
                        >
                            <TableAction
                                label="Col left"
                                icon={<ArrowLeft className="size-3.5" />}
                                disabled={!canAddColumnBefore}
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .addColumnBefore()
                                        .run()
                                }
                            />
                            <TableAction
                                label="Col right"
                                icon={<ArrowRight className="size-3.5" />}
                                disabled={!canAddColumnAfter}
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .addColumnAfter()
                                        .run()
                                }
                            />
                            <TableAction
                                label="Del col"
                                icon={<Columns3 className="size-3.5" />}
                                destructive
                                disabled={!canDeleteColumn}
                                onClick={() =>
                                    editor.chain().focus().deleteColumn().run()
                                }
                            />
                        </div>

                        <div
                            className="framex-rich-editor__table-tools-group"
                            role="group"
                            aria-label="Cell actions"
                        >
                            <TableAction
                                label="Header row"
                                icon={<Rows3 className="size-3.5" />}
                                active={editor.isActive("tableHeader")}
                                disabled={!canToggleHeaderRow}
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .toggleHeaderRow()
                                        .run()
                                }
                            />
                            <TableAction
                                label="Header col"
                                icon={<Columns3 className="size-3.5" />}
                                disabled={!canToggleHeaderColumn}
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .toggleHeaderColumn()
                                        .run()
                                }
                            />
                            <TableAction
                                label="Merge"
                                icon={<Plus className="size-3.5" />}
                                disabled={!canMergeCells}
                                onClick={() =>
                                    editor.chain().focus().mergeCells().run()
                                }
                            />
                            <TableAction
                                label="Split"
                                icon={<X className="size-3.5" />}
                                disabled={!canSplitCell}
                                onClick={() =>
                                    editor.chain().focus().splitCell().run()
                                }
                            />
                        </div>

                        <div className="framex-rich-editor__table-tools-remove">
                            <TableAction
                                label="Exit table"
                                icon={<CornerDownLeft className="size-3.5" />}
                                onClick={insertParagraphAfterTable}
                            />
                            <TableAction
                                label="Delete table"
                                icon={<Trash2 className="size-3.5" />}
                                destructive
                                disabled={!canDeleteTable}
                                onClick={() =>
                                    editor.chain().focus().deleteTable().run()
                                }
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export function RichTextEditor({
    content,
    onChange,
    error,
    placeholder = "Start writing… Use headings, lists, and tables to structure your content.",
    minHeight = 420,
    className,
}: RichTextEditorProps) {
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    const lastEmittedHtmlRef = useRef<string | null>(null);
    const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
    const [selectionCoords, setSelectionCoords] = useState<{
        top: number;
        left: number;
    } | null>(null);
    const mediaSelectionRef = useRef<{ from: number; to: number } | null>(null);
    const editorContainerRef = useRef<HTMLDivElement>(null);

    const extensions = useMemo(
        () => [
            StarterKit.configure({
                link: false,
                heading: { levels: [1, 2, 3, 4] },
            }),
            Link.configure({
                openOnClick: false,
                autolink: true,
                linkOnPaste: true,
                isAllowedUri: (url) => isSafeLinkUrl(url),
                HTMLAttributes: {
                    class: "framex-rich-editor__link",
                    target: "_blank",
                    rel: "noopener noreferrer nofollow",
                },
            }),
            Image.configure({
                allowBase64: false,
                inline: false,
                HTMLAttributes: {
                    class: "framex-rich-editor__image",
                    loading: "lazy",
                    draggable: "true",
                },
            }),
            Highlight.configure({ multicolor: true }),
            TableKit.configure({
                table: {
                    resizable: true,
                    renderWrapper: true,
                    cellMinWidth: 120,
                    handleWidth: 6,
                    HTMLAttributes: { class: "framex-rich-editor__table" },
                },
                tableHeader: {
                    HTMLAttributes: {
                        class: "framex-rich-editor__table-header",
                    },
                },
                tableCell: {
                    HTMLAttributes: { class: "framex-rich-editor__table-cell" },
                },
            }),
            TextAlign.configure({ types: ["heading", "paragraph"] }),
            Placeholder.configure({
                placeholder,
                showOnlyCurrent: false,
            }),
        ],
        [placeholder],
    );

    const editor = useEditor({
        extensions,
        content: content || EMPTY_DOCUMENT,
        immediatelyRender: false,
        shouldRerenderOnTransaction: false,
        editorProps: {
            attributes: {
                class: "framex-rich-editor__content",
                "aria-label": "Rich text content editor",
                spellcheck: "true",
            },
        },
        onUpdate: ({ editor: activeEditor }) => {
            const html = activeEditor.getHTML();
            lastEmittedHtmlRef.current = html;
            onChangeRef.current(html, activeEditor.getJSON());
        },
    });

    // Floating selection toolbar
    useEffect(() => {
        if (!editor) return;

        const updateSelectionToolbar = () => {
            const { empty } = editor.state.selection;
            if (empty || editor.isActive("image") || editor.isActive("table")) {
                setSelectionCoords(null);
                return;
            }

            const domSelection = window.getSelection();
            const containerRect =
                editorContainerRef.current?.getBoundingClientRect();
            if (
                !domSelection ||
                domSelection.rangeCount === 0 ||
                !containerRect
            ) {
                setSelectionCoords(null);
                return;
            }

            const rect = domSelection.getRangeAt(0).getBoundingClientRect();
            if (rect.width === 0 && rect.height === 0) {
                setSelectionCoords(null);
                return;
            }

            const left = rect.left - containerRect.left + rect.width / 2 - 112;
            setSelectionCoords({
                top: Math.max(6, rect.top - containerRect.top - 48),
                left: Math.max(8, Math.min(left, containerRect.width - 232)),
            });
        };

        const clearSelectionToolbar = () => setSelectionCoords(null);
        editor.on("selectionUpdate", updateSelectionToolbar);
        editor.on("blur", clearSelectionToolbar);

        return () => {
            editor.off("selectionUpdate", updateSelectionToolbar);
            editor.off("blur", clearSelectionToolbar);
        };
    }, [editor]);

    // Sync external resets/restored revisions WITHOUT resetting cursor during active typing/table edits.
    useEffect(() => {
        if (!editor) return;
        const nextContent = content || EMPTY_DOCUMENT;
        if (nextContent === lastEmittedHtmlRef.current) return;
        if (editor.getHTML() !== nextContent) {
            editor.commands.setContent(nextContent, { emitUpdate: false });
        }
    }, [content, editor]);

    const handleCanvasClick = (event: MouseEvent<HTMLDivElement>) => {
        if (!editor) return;
        // Only focus when clicking empty canvas space, never hijack table cell clicks or drags.
        if (event.target === event.currentTarget) {
            editor.commands.focus("end");
        }
    };

    const openMediaPicker = useCallback(() => {
        if (!editor) return;
        mediaSelectionRef.current = {
            from: editor.state.selection.from,
            to: editor.state.selection.to,
        };
        setMediaPickerOpen(true);
    }, [editor]);

    const handleMediaSelected = useCallback(
        (media: MediaPickerItem) => {
            if (!editor) return;
            if (!media.mime_type?.startsWith("image/")) {
                toast.error(
                    "Choose an image asset to insert into the article.",
                );
                return;
            }
            if (!isSafeImageUrl(media.url)) {
                toast.error("This media item does not have a safe image URL.");
                return;
            }

            const selection = mediaSelectionRef.current;
            const chain = editor.chain().focus();
            if (selection) chain.setTextSelection(selection);
            chain
                .setImage({
                    src: media.url,
                    alt: media.alt_text || media.filename || "",
                })
                .run();
            mediaSelectionRef.current = null;
        },
        [editor],
    );

    const text = editor?.getText() ?? "";
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    const characterCount = text.length;
    const readingMinutes = Math.max(1, Math.ceil(wordCount / 200));

    const editorStyle: CSSProperties & {
        "--framex-editor-min-height": string;
    } = {
        "--framex-editor-min-height": `${minHeight}px`,
    };

    return (
        <div
            ref={editorContainerRef}
            className={cn(
                "framex-rich-editor relative rounded-xl border bg-background transition-colors",
                "focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/15",
                error &&
                    "border-destructive focus-within:border-destructive focus-within:ring-destructive/15",
                className,
            )}
            style={editorStyle}
        >
            {editor ? (
                <>
                    <MenuBar
                        editor={editor}
                        onOpenMediaPicker={openMediaPicker}
                    />

                    {selectionCoords && (
                        <div
                            style={{
                                top: selectionCoords.top,
                                left: selectionCoords.left,
                            }}
                            onMouseDown={(event) => event.preventDefault()}
                            className="framex-rich-editor__selection-tools absolute z-30 flex items-center gap-0.5 rounded-xl border bg-popover/95 p-1 shadow-lg backdrop-blur-md"
                            role="toolbar"
                            aria-label="Selected text formatting"
                        >
                            <ToolbarButton
                                label="Bold"
                                active={editor.isActive("bold")}
                                onClick={() =>
                                    editor.chain().focus().toggleBold().run()
                                }
                            >
                                <Bold className="size-3.5" />
                            </ToolbarButton>
                            <ToolbarButton
                                label="Italic"
                                active={editor.isActive("italic")}
                                onClick={() =>
                                    editor.chain().focus().toggleItalic().run()
                                }
                            >
                                <Italic className="size-3.5" />
                            </ToolbarButton>
                            <ToolbarButton
                                label="Underline"
                                active={editor.isActive("underline")}
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .toggleUnderline()
                                        .run()
                                }
                            >
                                <UnderlineIcon className="size-3.5" />
                            </ToolbarButton>
                            <ToolbarButton
                                label="Strikethrough"
                                active={editor.isActive("strike")}
                                onClick={() =>
                                    editor.chain().focus().toggleStrike().run()
                                }
                            >
                                <Strikethrough className="size-3.5" />
                            </ToolbarButton>
                            <ToolbarButton
                                label="Inline code"
                                active={editor.isActive("code")}
                                onClick={() =>
                                    editor.chain().focus().toggleCode().run()
                                }
                            >
                                <Code className="size-3.5" />
                            </ToolbarButton>
                            <ToolbarButton
                                label="Highlight"
                                active={editor.isActive("highlight")}
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .toggleHighlight()
                                        .run()
                                }
                            >
                                <Highlighter className="size-3.5" />
                            </ToolbarButton>
                        </div>
                    )}

                    <div
                        className="framex-rich-editor__canvas"
                        onClick={handleCanvasClick}
                    >
                        <EditorContent editor={editor} />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-b-xl border-t bg-muted/20 px-4 py-2 text-[11px] text-muted-foreground">
                        <span>
                            {wordCount.toLocaleString()} words ·{" "}
                            {characterCount.toLocaleString()} chars · ~
                            {readingMinutes} min read
                        </span>
                        <span className="hidden sm:inline">
                            Tip: Drag across table cells to merge, or use Exit
                            table to continue below.
                        </span>
                    </div>
                </>
            ) : (
                <div className="flex min-h-(--framex-editor-min-height) items-center justify-center bg-muted/10 text-sm text-muted-foreground">
                    Preparing editor…
                </div>
            )}

            {error && (
                <p
                    className="rounded-b-xl border-t border-destructive/20 bg-destructive/5 px-4 py-2 text-xs text-destructive"
                    role="alert"
                >
                    {error}
                </p>
            )}

            <MediaPickerModal
                open={mediaPickerOpen}
                onClose={() => setMediaPickerOpen(false)}
                onSelect={handleMediaSelected}
                title="Insert image from Media Studio"
            />
        </div>
    );
}
