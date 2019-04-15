<?php

namespace App\Services\Filter;

use App\Models\Project\ProjectLocationTracker;

class ProjectLocationTrackerFilter
{

    /**
     * Returns all project comments based on a few filters
     * @param array $params
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function fetch($params = [])
    {
        return ProjectLocationTracker::with(['projectWorkType:id,name', 'projectLocation:id,name'])->orderBy('date')->whereNull('deleted_at')
            ->when(!empty($params['end']), function ($query) use ($params) {
                return $query->where('date', '<=', $params['end']);
            })
            ->when(!empty($params['project_id']), function ($query) use ($params) {
                return $query->where('project_id', '=', $params['project_id']);
            })
            ->when(!empty($params['start']), function ($query) use ($params) {
                $query->where('date', '>=', $params['start']);
            })->get();
    }
}
