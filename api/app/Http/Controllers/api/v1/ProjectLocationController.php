<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\BaseController;
use App\Models\Project\ProjectLocation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Input;

class ProjectLocationController extends BaseController
{
    public function delete($id)
    {
        ProjectLocation::findOrFail($id)->delete();
        return 'Entity deleted';
    }

    public function get($id)
    {
        return ProjectLocation::findOrFail($id);
    }

    public function index()
    {
        return ProjectLocation::all();
    }

    public function post(Request $request)
    {
        $this->validateRequest($request);
        $projectLocation = ProjectLocation::create(Input::toArray());

        return self::get($projectLocation->id);
    }

    public function put($id, Request $request)
    {
        $this->validateRequest($request);
        ProjectLocation::findOrFail($id)->update(Input::toArray());
        return self::get($id);
    }

    private function validateRequest(Request $request)
    {
        $this->validate($request, [
            'name' => 'required|string'
        ]);
    }
}
