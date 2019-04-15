<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\BaseController;
use App\Models\Project\ProjectWorkType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Input;

class ProjectWorkTypeController extends BaseController
{
    public function delete($id)
    {
        ProjectWorkType::findOrFail($id)->delete();
        return 'Entity deleted';
    }

    public function get($id)
    {
        return ProjectWorkType::findOrFail($id);
    }

    public function index()
    {
        return ProjectWorkType::all();
    }

    public function post(Request $request)
    {
        $this->validateRequest($request);
        $projectWorkType = ProjectWorkType::create(Input::toArray());

        return self::get($projectWorkType->id);
    }

    public function put($id, Request $request)
    {
        $this->validateRequest($request);
        ProjectWorkType::findOrFail($id)->update(Input::toArray());
        return self::get($id);
    }

    private function validateRequest(Request $request)
    {
        $this->validate($request, [
            'name' => 'required|string'
        ]);
    }
}
