<?php

namespace App\Services\Export;

use App\Models\Project\ProjectEffort;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class ServiceHoursPerProjectLocationWorkTypeReport implements FromArray, ShouldAutoSize
{
    private $efforts;

    public function __construct(Collection $projectEfforts)
    {
        $this->efforts = $projectEfforts;
    }

    public function array() : array
    {
        $sums = [];
        $services = [];

        foreach ($this->efforts as $projectEffort) {
            /** @var ProjectEffort $projectEffort */
            if (!is_null($projectEffort->project) && $projectEffort->project->locationTrackers->isNotEmpty()) {
                $locationTracker = $projectEffort->project->locationTrackers->where('date', $projectEffort->date)->first();
                if (!is_null($locationTracker)) {
                    $projectLocationName = $locationTracker->projectLocation->name;
                    $projectWorkTypeName = $locationTracker->projectWorkType->name;

                    $fullName = $projectLocationName.$projectWorkTypeName;

                    if (!isset($sums[$fullName])) {
                        $sums[$fullName] = [];
                        $sums[$fullName]['location_name'] = $projectLocationName;
                        $sums[$fullName]['work_type_name'] = $projectWorkTypeName;
                    }

                    if (!isset($sums[$fullName]['sums'][$projectEffort->service->name])) {
                        $sums[$fullName]['sums'][$projectEffort->service->name] = 0;
                    }

                    $value = $projectEffort->position->rate_unit->is_time ? $projectEffort->value / 60 : $projectEffort->value;
                    $sums[$fullName]['sums'][$projectEffort->service->name] += $value;

                    if (!in_array($projectEffort->service->name, $services)) {
                        array_push($services, $projectEffort->service->name);
                    }
                }
            }
        }

        $contentRows = [];

        // prepare the heading row
        $headingRow = array_merge(['Gebiet', 'Arbeit'], $services);
        $contentRows[] = $headingRow;

        foreach ($sums as $projectWithServicesSum) {
            $contentRow = [];

            $count = 0;
            foreach ($projectWithServicesSum['sums'] as $key => $pSums) {
                if ($services[$count] === $key) {
                    $contentRow[] = $pSums;
                } else {
                    $contentRow[] = '';
                }
                $count++;
            }

            array_unshift($contentRow, $projectWithServicesSum['location_name'], $projectWithServicesSum['work_type_name']);
            $contentRows[] = $contentRow;
        }

        return $contentRows;
    }
}
