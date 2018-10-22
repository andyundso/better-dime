<?php

use App\Models\Employee\Employee;
use Faker\Generator;
use Illuminate\Database\Eloquent\Factory;

/** @var Factory $factory */
$factory->define(Employee::class, function (Generator $faker) {
    return [
        'email' => $faker->email,
        'password' => $faker->password,
        'is_admin' => false
    ];
});

$factory->defineAs(Employee::class, 'admin', function () use ($factory) {
    $user = $factory->raw(Employee::class);
    $user['email'] ='office@stiftungswo.ch';
    $user['password'] = 'Welcome01';
    $user['is_admin'] = true;
    return $user;
});
