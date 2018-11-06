<?php

use App\Models\Service\RateUnit;
use Illuminate\Database\Eloquent\Factory;

/** @var Factory $factory */
$factory->define(RateUnit::class, function () {
    $faker = Faker\Factory::create('de_CH');
    $unit = $faker->lexify("??");

    return [
        'billing_unit' => "CHF / $unit",
        'effort_unit' => $unit,
        'factor' => $faker->optional(0.5, 1)->numberBetween(1, 1000),
        'is_time' => $faker->boolean,
        'name' => $faker->word,
        'archived' => $faker->randomElement([true, false, false, false, false]),
    ];
});
