<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Str;

class FrameXMakeModuleCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'framex:make-module 
                            {name : The name of the module (e.g. ECommerce, Analytics, Crm)}
                            {--slug= : Custom slug identifier for the module}
                            {--description= : Description of the module}
                            {--with-api : Scaffold API routes for this module}
                            {--with-ui : Scaffold default Inertia React UI page}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Scaffold a new FrameX module with contracts, services, controllers, and models';

    public function __construct(
        protected Filesystem $files
    ) {
        parent::__construct();
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $rawName = $this->argument('name');
        $studlyName = Str::studly($rawName);
        $slug = $this->option('slug') ?: Str::kebab($rawName);
        $displayName = Str::headline($rawName);
        $description = $this->option('description') ?: "FrameX {$displayName} Module";

        $moduleDir = app_path("FrameX/Modules/{$studlyName}");

        if ($this->files->isDirectory($moduleDir)) {
            $this->error("FrameX Module [{$studlyName}] already exists at {$moduleDir}");

            return self::FAILURE;
        }

        $this->info("Creating FrameX module: {$studlyName} (id: {$slug})...");

        // 1. Create directory structure
        $this->files->makeDirectory($moduleDir, 0755, true);
        $this->files->makeDirectory("{$moduleDir}/Services", 0755, true);
        $this->files->makeDirectory("{$moduleDir}/Controllers", 0755, true);
        $this->files->makeDirectory("{$moduleDir}/Models", 0755, true);

        // 2. Prepare Replacements
        $replacements = [
            '{{namespace}}' => $studlyName,
            '{{class}}' => $studlyName,
            '{{slug}}' => $slug,
            '{{name}}' => $displayName,
            '{{description}}' => $description,
        ];

        // 3. Generate Module Class
        $this->generateFromStub('module.stub', "{$moduleDir}/{$studlyName}Module.php", $replacements);

        // 4. Generate Service Class
        $this->generateFromStub('service.stub', "{$moduleDir}/Services/{$studlyName}Service.php", $replacements);

        // 5. Generate Controller Class
        $this->generateFromStub('controller.stub', "{$moduleDir}/Controllers/{$studlyName}Controller.php", $replacements);

        // 6. Generate Model Class
        $this->generateFromStub('model.stub', "{$moduleDir}/Models/{$studlyName}.php", $replacements);

        // 7. Optional React UI Scaffolding
        if ($this->option('with-ui')) {
            $this->scaffoldUiPage($slug, $displayName, $studlyName);
        }

        $this->components->info("Module [{$studlyName}] created successfully!");
        $this->line('');
        $this->line('<fg=yellow>Next steps:</>');
        $this->line('1. Register the module in <fg=cyan>app/FrameX/Core/FrameXServiceProvider.php</>:');
        $this->line("   <fg=gray>\$registry->register(new \\App\\FrameX\\Modules\\{$studlyName}\\{$studlyName}Module);</>");
        $this->line('2. Verify registration with <fg=cyan>php artisan framex:modules:list</>');
        $this->line('');

        return self::SUCCESS;
    }

    /**
     * Generate a file from a stub template.
     *
     * @param  array<string, string>  $replacements
     */
    protected function generateFromStub(string $stubName, string $targetPath, array $replacements): void
    {
        $stubPath = base_path("stubs/framex/{$stubName}");

        if (! $this->files->exists($stubPath)) {
            $this->warn("Stub file not found: {$stubPath}. Skipping.");

            return;
        }

        $content = $this->files->get($stubPath);

        foreach ($replacements as $search => $replace) {
            $content = str_replace($search, $replace, $content);
        }

        $this->files->put($targetPath, $content);
        $this->line("  <fg=green>CREATED</> {$targetPath}");
    }

    /**
     * Scaffold default Inertia React UI page.
     */
    protected function scaffoldUiPage(string $slug, string $displayName, string $studlyName): void
    {
        $uiDir = resource_path("js/pages/manage/{$slug}");
        $uiFile = "{$uiDir}/index.tsx";

        if (! $this->files->isDirectory($uiDir)) {
            $this->files->makeDirectory($uiDir, 0755, true);
        }

        if (! $this->files->exists($uiFile)) {
            $content = <<<TSX
import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { type BreadcrumbItem } from '@/types';

interface Props {
    team: {
        id: number;
        name: string;
        slug: string;
    };
}

export default function {$studlyName}Index({ team }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: `/\${team.slug}/dashboard` },
        { title: '{$displayName}', href: `/\${team.slug}/manage/{$slug}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="{$displayName}" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                        {$displayName}
                    </h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Manage your {$displayName} module settings and workflows.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{$displayName} Overview</CardTitle>
                        <CardDescription>
                            Welcome to the {$displayName} management studio.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-neutral-600 dark:text-neutral-300">
                            Module successfully scaffolded and active for team {team.name}.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
TSX;
            $this->files->put($uiFile, $content);
            $this->line("  <fg=green>CREATED</> {$uiFile}");
        }
    }
}
