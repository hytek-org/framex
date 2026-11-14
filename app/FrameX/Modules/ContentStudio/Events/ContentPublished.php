<?php

namespace App\FrameX\Modules\ContentStudio\Events;

use App\FrameX\Modules\ContentStudio\Models\Content;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ContentPublished
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Content $content,
        public ?User $publishedBy = null
    ) {}
}
