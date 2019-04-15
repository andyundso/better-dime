<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\BaseController;
use App\Models\Project\ProjectLocationTracker;
use App\Services\Filter\ProjectLocationTrackerFilter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Input;

class ProjectLocationTrackerController extends BaseController
{
    public function delete($id)
    {
        ProjectLocationTracker::findOrFail($id)->delete();
        return 'Entity deleted';
    }

    public function get($id)
    {
        return ProjectLocationTracker::findOrFail($id);
    }

    public function index(Request $request)
    {
        $validatedInput = $this->validate($request, [
            'end' => 'date',
            'project_id' => 'integer',
            'start' => 'date'
        ]);

        return ProjectLocationTrackerFilter::fetch($validatedInput);
    }

    public function post(Request $request)
    {
        $this->validateRequest($request);
        $projectLocationTracker = ProjectLocationTracker::create(Input::toArray());

        return self::get($projectLocationTracker->id);
    }

    public function put($id, Request $request)
    {
        $this->validateRequest($request);
        ProjectLocationTracker::findOrFail($id)->update(Input::toArray());
        return self::get($id);
    }

    private function validateRequest(Request $request)
    {
        $this->validate($request, [
            'date' => 'required|date',
            'project_id' => 'required|integer',
            'project_location_id' => 'required|integer',
            'project_work_type_id' => 'required|integer'
        ]);
    }
}
