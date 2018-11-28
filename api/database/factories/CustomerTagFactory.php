<?php

/** @var Factory $factory */
use Illuminate\Database\Eloquent\Factory;

$factory->define(\App\Models\Customer\CustomerTag::class, function () {
    $faker = Faker\Factory::create('de_CH');

    return [
        'archived' => $faker->boolean(20),
        'name' => $faker->word
    ];
});
