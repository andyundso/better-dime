<?php

namespace Tests\Unit\Models\Customer;

use App\Models\Customer\Address;
use App\Models\Customer\Company;
use App\Models\Customer\CustomerTag;
use App\Models\Customer\Person;
use App\Models\Service\RateGroup;
use Laravel\Lumen\Testing\DatabaseTransactions;

class CompanyTest extends \TestCase
{
    use DatabaseTransactions;

    public function testGetEmptyTagAttribute()
    {
        // should return empty array if no tags are assigned
        $company = factory(Company::class)->create();
        $this->assertEmpty($company->tags);
    }

    public function testGetPopulatedTagAttribute()
    {
        $company = factory(Company::class)->create();
        $company->customer_tags()->saveMany(factory(CustomerTag::class)->times(5)->make());
        $this->assertCount(5, $company->tags);
    }

    public function testRateGroupAssignment()
    {
        $rateGroup = factory(RateGroup::class)->create();
        $company = factory(Company::class)->create();
        $company->rate_group()->associate($rateGroup);
        $company->save();
        $this->assertEquals($rateGroup, $company->rate_group);
    }

    public function testPeopleAssignment()
    {
        $company = factory(Company::class)->create();
        $people = factory(Person::class)->times(2)->make();
        $company->people()->saveMany($people);
        $this->assertCount(2, $company->people);
    }

    public function testAddressDeletion()
    {
        $company = factory(Company::class)->create();
        $address = factory(Address::class)->make();
        $address->customer()->associate($company);
        $address->save();

        $company->delete();
        $this->assertNull(Address::find($address->id));
    }
}