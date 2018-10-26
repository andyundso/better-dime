<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\BaseController;
use App\Models\Offer\Offer;
use App\Models\Offer\OfferDiscount;
use App\Models\Offer\OfferPosition;
use App\Services\CostBreakdown;
use App\Services\GroupMarkdownToDiv;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Input;
use Laravel\Lumen\Application;
use Parsedown;

class OfferController extends BaseController
{
    public function delete($id)
    {
        Offer::findOrFail($id)->delete();
        return 'Entity deleted';
    }

    public function index()
    {
        return Offer::all();
    }

    public function get($id)
    {
        return Offer::with(['discounts', 'positions'])->findOrFail($id);
    }

    public function post(Request $request)
    {
        $this->validateRequest($request);
        $inputParams = Input::toArray();
        $inputParams['customer_type'] = $inputParams['customer_type'] == 'company' ? \App\Models\Customer\Company::class : \App\Models\Customer\Person::class;
        $offer = Offer::create(Input::toArray());

        if (Input::get('discounts')) {
            foreach (Input::get('discounts') as $discount) {
                /** @var OfferDiscount $od */
                $od = OfferDiscount::make($discount);
                $od->offer()->associate($offer);
                $od->save();
            }
        }

        if (Input::get('positions')) {
            foreach (Input::get('positions') as $position) {
                /** @var OfferPosition $op */
                $op = OfferPosition::make($position);
                $op->offer()->associate($offer);
                $op->save();
            }
        }

        return self::get($offer->id);
    }

    public function put($id, Request $request)
    {
        $this->validateRequest($request);
        $offer = Offer::findOrFail($id);
        try {
            DB::beginTransaction();
            $offer->update(Input::toArray());

            if (Input::get('discounts')) {
                $this->executeNestedUpdate(Input::get('discounts'), $offer->discounts, OfferDiscount::class, 'offer', $offer);
            }

            if (Input::get('positions')) {
                $this->executeNestedUpdate(Input::get('positions'), $offer->positions, OfferPosition::class, 'offer', $offer);
            }
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
        DB::commit();

        return self::get($id);
    }

    public function print($id)
    {
        // TODO extract common things (styles, images, etc.) into own PDFController as soon as Invoice print is ported
        // TODO fetch offer with project to pass project id to print
        // TODO make new general config with information about who created the invoice
        // intialize stuff
        $app = new Application();
        $offer = Offer::with(['accountant', 'customer'])->findOrFail($id);
        $parsedown = new Parsedown();
        /** @var \Barryvdh\DomPDF\PDF $pdf */
        $pdf = App::make('dompdf.wrapper');

        // group h1 / h2 / h3 and the following tags to divs
        $description = GroupMarkdownToDiv::group($parsedown->text($offer->description));

        // initialize DomPDF, render view and pass it back
        $pdf->getDomPDF()->set_option("isPhpEnabled", true);
        $pdf->loadView('offers.print', [
            'offer' => $offer,
            'breakdown' => CostBreakdown::calculate($offer),
            'basePath' => $app->basepath(),
            'description' => $description])->setPaper('a4', 'portrait');
        return $pdf->stream();
    }

    private function validateRequest(Request $request)
    {
        $this->validate($request, [
            'accountant_id' => 'required|integer',
            'address_id' => 'required|integer',
            'customer_id' => 'required|integer',
            'customer_type' => 'required|string|max:255',
            'description' => 'required|string',
            'discounts.*.name' => 'required|string|max:255',
            'discounts.*.percentage' => 'required|boolean',
            'discounts.*.value' => 'required|numeric',
            'fixed_price' => 'integer',
            'name' => 'required|string|max:255',
            'positions.*.amount' => 'required|integer',
            'positions.*.order' => 'required|integer',
            'positions.*.price_per_rate' => 'required|integer',
            'positions.*.rate_unit_id' => 'required|integer',
            'positions.*.service_id' => 'required|integer',
            'positions.*.vat' => 'required|numeric',
            'rate_group_id' => 'required|integer',
            'short_description' => 'required|string',
            'status' => 'required|integer'
        ]);
    }
}