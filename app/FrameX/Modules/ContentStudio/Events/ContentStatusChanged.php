<?php

namespace App\FrameX\Modules\ContentStudio\Events;

use App\FrameX\Modules\ContentStudio\Enums\ContentStatus;
use App\FrameX\Modules\ContentStudio\Models\Content;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ContentStatusChanged
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Content $content,
        public ContentStatus $fromStatus,
        public ContentStatus $toStatus,
        public ?User $actor = null
    ) {}
}
