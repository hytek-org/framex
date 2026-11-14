<?php

test('framex doctor command runs diagnostic health checks successfully', function () {
    $this->artisan('framex:doctor')
        ->expectsOutputToContain('PHP Version')
        ->expectsOutputToContain('Connection Status')
        ->expectsOutputToContain('Storage & Cache Writable')
        ->expectsOutputToContain('FrameX Modules Status')
        ->expectsOutputToContain('Registered Blueprints')
        ->assertSuccessful();
});
