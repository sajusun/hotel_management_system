<?php

declare(strict_types=1);

namespace App\Modules\Auth\Providers;

use App\Modules\Auth\Services\VerificationService;
use App\Services\UserService;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // 1. Merge default module configuration
        if (file_exists(__DIR__ . '/../Config/verification.php')) {
            $this->mergeConfigFrom(__DIR__ . '/../Config/verification.php', 'verification');
        }

        // 2. Register Singletons
        $this->app->singleton(VerificationService::class, function () {
            return new VerificationService();
        });

        $this->app->singleton(UserService::class, function () {
            return new UserService();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // 1. Load module migrations
        if (is_dir(__DIR__ . '/../Database/Migrations')) {
            $this->loadMigrationsFrom(__DIR__ . '/../Database/Migrations');
        }

        // 2. Load API routes with /api/v1 prefix
        if (file_exists(__DIR__ . '/../Routes/api.php')) {
            Route::prefix('api/v1')
                ->middleware('api')
                ->group(__DIR__ . '/../Routes/api.php');
        }
    }
}
