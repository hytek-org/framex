<?php

namespace App\FrameX\Modules\ContentStudio\Events;

use App\FrameX\Modules\ContentStudio\Models\Content;
use App\FrameX\Modules\ContentStudio\Models\ContentRevision;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ContentRevisionRestored
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Content $content,
        public ContentRevision $revision,
        public ?User $restoredBy = null
    ) {}
}
