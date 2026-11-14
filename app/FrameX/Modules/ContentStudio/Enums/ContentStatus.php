<?php

namespace App\FrameX\Modules\ContentStudio\Enums;

enum ContentStatus: string
{
    case Draft = 'draft';
    case InReview = 'in_review';
    case Approved = 'approved';
    case Published = 'published';
    case Scheduled = 'scheduled';
    case Archived = 'archived';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draft',
            self::InReview => 'In Review',
            self::Approved => 'Approved',
            self::Published => 'Published',
            self::Scheduled => 'Scheduled',
            self::Archived => 'Archived',
        };
    }

    public function badgeColor(): string
    {
        return match ($this) {
            self::Draft => 'neutral',
            self::InReview => 'amber',
            self::Approved => 'blue',
            self::Published => 'emerald',
            self::Scheduled => 'purple',
            self::Archived => 'rose',
        };
    }

    public function isPublic(): bool
    {
        return $this === self::Published;
    }
}
