<?php

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        app(\Faker\Generator::class)->seed();
        factory(\App\Models\Employee\Employee::class, 'admin')->create();
        factory(\App\Models\Employee\Holiday::class)->times(10)->create();
        $kanton = factory(\App\Models\Service\RateGroup::class, 'kanton')->create();
        $andere = factory(\App\Models\Service\RateGroup::class, 'andere')->create();

        $rateUnits = factory(\App\Models\Service\RateUnit::class)
            ->times(5)
            ->create()
            ->map(function ($r) {
                return $r['id'];
            })
            ->toArray();

        factory(\App\Models\Service\Service::class)->times(10)->create()->each(function ($s) use ($kanton, $andere, $rateUnits) {

            $rateUnit = array_random($rateUnits);

            factory(\App\Models\Service\ServiceRate::class)->create([
                'rate_group_id' => $kanton,
                'service_id' => $s,
                'rate_unit_id' => $rateUnit
            ]);

            factory(\App\Models\Service\ServiceRate::class)->create([
                'rate_group_id' => $andere,
                'service_id' => $s,
                'rate_unit_id' => $rateUnit
            ]);
        });
    }
}