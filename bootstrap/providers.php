<?php

use App\FrameX\Core\FrameXServiceProvider;
use App\Providers\AppServiceProvider;
use App\Providers\FortifyServiceProvider;

return [
    AppServiceProvider::class,
    FortifyServiceProvider::class,
    FrameXServiceProvider::class,
];
