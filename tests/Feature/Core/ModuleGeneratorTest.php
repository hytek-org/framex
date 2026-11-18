<?php

use Illuminate\Support\Facades\File;

afterEach(function () {
    $testModulePath = app_path('FrameX/Modules/TestScaffold');
    if (File::isDirectory($testModulePath)) {
        File::deleteDirectory($testModulePath);
    }

    $testUiPath = resource_path('js/pages/manage/test-scaffold');
    if (File::isDirectory($testUiPath)) {
        File::deleteDirectory($testUiPath);
    }
});

test('it can scaffold a complete framex module via artisan command', function () {
    $this->artisan('framex:make-module', [
        'name' => 'TestScaffold',
        '--description' => 'A test scaffolded module',
    ])
        ->expectsOutputToContain('Creating FrameX module: TestScaffold')
        ->expectsOutputToContain('Module [TestScaffold] created successfully!')
        ->assertSuccessful();

    $moduleDir = app_path('FrameX/Modules/TestScaffold');
    expect(File::isDirectory($moduleDir))->toBeTrue()
        ->and(File::exists("{$moduleDir}/TestScaffoldModule.php"))->toBeTrue()
        ->and(File::exists("{$moduleDir}/Services/TestScaffoldService.php"))->toBeTrue()
        ->and(File::exists("{$moduleDir}/Controllers/TestScaffoldController.php"))->toBeTrue()
        ->and(File::exists("{$moduleDir}/Models/TestScaffold.php"))->toBeTrue();

    // Verify module class contents
    $moduleContent = File::get("{$moduleDir}/TestScaffoldModule.php");
    expect($moduleContent)->toContain('namespace App\FrameX\Modules\TestScaffold;')
        ->and($moduleContent)->toContain("return 'test-scaffold';")
        ->and($moduleContent)->toContain("return 'Test Scaffold';")
        ->and($moduleContent)->toContain("return 'A test scaffolded module';");
});

test('it scaffolds ui page when --with-ui flag is provided', function () {
    $this->artisan('framex:make-module', [
        'name' => 'TestScaffold',
        '--with-ui' => true,
    ])->assertSuccessful();

    $uiFile = resource_path('js/pages/manage/test-scaffold/index.tsx');
    expect(File::exists($uiFile))->toBeTrue();

    $uiContent = File::get($uiFile);
    expect($uiContent)->toContain('Test Scaffold')
        ->and($uiContent)->toContain('export default function TestScaffoldIndex');
});

test('it prevents creating a module if it already exists', function () {
    $moduleDir = app_path('FrameX/Modules/TestScaffold');
    File::ensureDirectoryExists($moduleDir);

    $this->artisan('framex:make-module', [
        'name' => 'TestScaffold',
    ])
        ->expectsOutputToContain('already exists')
        ->assertFailed();
});
