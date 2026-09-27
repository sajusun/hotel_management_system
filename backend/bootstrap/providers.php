<?php

use App\Providers\AppServiceProvider;

return [
    AppServiceProvider::class,
    App\Providers\ModuleServiceProvider::class,
    App\Modules\Auth\Providers\AuthServiceProvider::class,
];
