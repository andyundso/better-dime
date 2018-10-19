<?php

use App\Modules\Employee\Models\Employee;

abstract class TestCase extends Laravel\Lumen\Testing\TestCase
{
    /**
     * Creates the application.
     *
     * @return \Laravel\Lumen\Application
     */
    public function createApplication()
    {
        return require __DIR__.'/../bootstrap/app.php';
    }

    public function asAdmin()
    {
        $user = factory(Employee::class)->create([
            "is_admin" => true
        ]);
        return $this->actingAs($user);
    }

    public function asUser()
    {
        $user = factory(Employee::class)->create([
            "is_admin" => false
        ]);
        return $this->actingAs($user);
    }

    public function responseToArray()
    {
        return json_decode($this->response->getContent(), true);
    }

    public function assertResponseMatchesTemplate(array $template = [])
    {
        $decodedResponse = $this->responseToArray();

        foreach ($template as $key => $value) {
            $this->assertArraySubset([$key => $value], $decodedResponse);
        }
    }
}
