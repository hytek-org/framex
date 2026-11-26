export type ContentStatusValue = 'draft' | 'in_review' | 'approved' | 'published' | 'scheduled' | 'archived';

export interface ContentTypeItem {
    id: number;
    name: string;
    slug: string;
    icon?: string | null;
}

export interface CategoryItem {
    id: number;
    name: string;
    slug: string;
    color?: string | null;
}

export interface ContentItem {
    id: number;
    title: string;
    slug: string;
    excerpt?: string | null;
    status: ContentStatusValue;
    cover_image?: string | null;
    published_at?: string | null;
    updated_at: string;
    content_type?: ContentTypeItem | null;
    category?: CategoryItem | null;
    author?: {
        id: number;
        name: string;
        email?: string;
    } | null;
}

export interface StatusCounts {
    all: number;
    draft: number;
    in_review: number;
    published: number;
    archived: number;
}

export interface ContentFiltersState {
    type?: string;
    status?: string;
    category?: string;
    search?: string;
    sort?: string;
    direction?: 'asc' | 'desc';
}

export interface PaginatedContents {
    data: ContentItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}
