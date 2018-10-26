<?php

namespace App\Models\Offer;

use App\Models\Service\RateUnit;
use App\Models\Service\Service;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class OfferPosition extends Model
{
    use SoftDeletes;

    protected $casts = [
        'amount' => 'float',
    ];

    protected $fillable = ['amount', 'offer_id', 'order', 'price_per_rate', 'rate_unit_id', 'service_id', 'vat'];

    public function offer()
    {
        return $this->belongsTo(Offer::class);
    }

    public function rate_unit()
    {
        return $this->belongsTo(RateUnit::class);
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    /**
     * Returns the multiplication of amount and price_per_rate, if both values are numeric
     * @return float|int
     */
    public function calculatedTotal()
    {
        if (is_numeric($this->price_per_rate) && is_numeric($this->amount)) {
            return $this->price_per_rate * $this->amount;
        } else {
            return 0;
        }
    }
}
