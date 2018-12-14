<?php

namespace App\Models\Invoice;

use App\Models\Costgroup\Costgroup;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use RichanFongdasen\EloquentBlameable\BlameableTrait;

class InvoiceCostgroupDistribution extends Model
{
    use SoftDeletes, BlameableTrait;

    protected $fillable = ['costgroup_number', 'invoice_id', 'weight'];

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    public function costgroup()
    {
        return $this->belongsTo(Costgroup::class);
    }
}
