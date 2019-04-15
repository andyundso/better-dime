<?php


namespace App\Models\Project;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use RichanFongdasen\EloquentBlameable\BlameableTrait;

class ProjectWorkType extends Model
{
    use SoftDeletes, BlameableTrait;

    protected $fillable = ['name'];

    public function project_location_tracker()
    {
        return $this->belongsTo(ProjectLocationTracker::class);
    }
}
