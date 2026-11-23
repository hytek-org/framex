<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone', 30)->nullable()->after('locale');
            $table->string('avatar', 2048)->nullable()->after('phone');
            $table->string('job_title', 255)->nullable()->after('avatar');
            $table->string('department', 255)->nullable()->after('job_title');
            $table->string('timezone', 64)->default('UTC')->after('department');
            $table->string('date_format', 32)->default('MMM D, YYYY')->after('timezone');
            $table->string('time_format', 16)->default('12h')->after('date_format');
            $table->string('theme', 16)->default('system')->after('time_format');
            $table->timestamp('last_login_at')->nullable()->after('theme');
            $table->string('last_login_ip', 45)->nullable()->after('last_login_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'phone',
                'avatar',
                'job_title',
                'department',
                'timezone',
                'date_format',
                'time_format',
                'theme',
                'last_login_at',
                'last_login_ip',
            ]);
        });
    }
};
