<?php

namespace App\Models\Invoice;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Costgroup extends Model
{
    use SoftDeletes;

    protected $fillable = ['name', 'number'];

    protected $primaryKey = 'number';

    public $incrementing = false;

    public function invoices()
    {
        return $this->belongsToMany(Invoice::class);
    }
}