<?php


namespace App\Models\Project;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use RichanFongdasen\EloquentBlameable\BlameableTrait;

class ProjectLocationTracker extends Model
{
    use SoftDeletes, BlameableTrait;

    protected $fillable = ['name', 'date', 'project_id', 'project_location_id', 'project_work_type_id'];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function projectLocation()
    {
        return $this->belongsTo(ProjectLocation::class);
    }

    public function projectWorkType()
    {
        return $this->belongsTo(ProjectWorkType::class);
    }
}
