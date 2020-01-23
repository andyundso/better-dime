<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\BaseController;
use App\Models\GlobalSettings;
use App\Models\Invoice\InvoiceCostgroupDistribution;
use App\Models\Invoice\Invoice;
use App\Models\Invoice\InvoiceDiscount;
use App\Models\Invoice\InvoicePosition;
use App\Services\AddressLabelBuilder;
use App\Services\CostBreakdown;
use App\Services\PDF\GroupMarkdownToDiv;
use App\Services\PDF\PDF;
use App\Services\ProjectEffortReportFetcher;
use App\Services\TwigFilters;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Input;
use Parsedown;

class InvoiceController extends BaseController
{
    public function delete($id)
    {
        Invoice::findOrFail($id)->delete();
        return 'Entity deleted';
    }

    public function duplicate($id)
    {
        $invoice = Invoice::findOrFail($id);
        return self::get($this->duplicateObject($invoice, ['costgroup_distributions', 'discounts', 'positions']));
    }

    public function get($id)
    {
        return Invoice::with(['costgroup_distributions', 'discounts', 'positions'])->findOrFail($id)->append(['breakdown', 'offer_id', 'sibling_invoice_ids', 'position_groupings']);
    }

    public function index(Request $request)
    {
        $query = $this->getFilteredQuery(Invoice::query(), $request, ['id', 'name', 'description']);
        return $this->getPaginatedQuery($query, $request);
    }

    public function post(Request $request)
    {
        $this->validateRequest($request);
        $invoice = Invoice::create(Input::toArray());

        foreach (Input::get('costgroup_distributions') as $costgroup) {
            /** @var InvoiceCostgroupDistribution $cd */
            $cd = InvoiceCostgroupDistribution::make($costgroup);
            $cd->invoice()->associate($invoice);
            $cd->save();
        }

        foreach (Input::get('discounts') as $discount) {
            /** @var InvoiceDiscount $id */
            $id = InvoiceDiscount::make($discount);
            $id->invoice()->associate($invoice);
            $id->save();
        }

        foreach (Input::get('positions') as $position) {
            /** @var InvoicePosition $ip */
            $ip = InvoicePosition::make($position);
            $ip->invoice()->associate($invoice);
            $ip->save();
        }

        return self::get($invoice->id);
    }

    public function print($id)
    {
        // initialize stuff
        $invoice = Invoice::with(['accountant', 'address', 'costgroup_distributions', 'project'])->findOrFail($id)->append('distribution_of_costgroups');
        $parsedown = new Parsedown();

        // group h1 / h2 / h3 and the following tags to divs
        $description = GroupMarkdownToDiv::group($parsedown->text($invoice->description));

        // render address
        $addressLabel = AddressLabelBuilder::build($invoice);

        $settings = GlobalSettings::all()->first();

        // some projects used to be split with ; instead of ,
        $legacySplit = explode(";", $invoice->name)[0];
        $splitName = $this->replaceUmlaute(explode(",", $legacySplit)[0]);
        $downloadName = "Rechnung_" . $invoice->id . "_" . $splitName . "_" . Carbon::parse($invoice->ending)->format("Y_m_d");

        // initialize PDF, render view and pass it back
        $pdf = new PDF(
            'invoice',
            [
                'addressLabel' => $addressLabel,
                'breakdown' => CostBreakdown::calculate($invoice),
                'invoice' => $invoice,
                'description' => $description,
                'title' => $downloadName,
            ]
        );

        return $pdf->print($downloadName, Carbon::parse($invoice->ending));
    }

    public function print_esr($id)
    {
        // initialize stuff
        $invoice = Invoice::with(['address'])->findOrFail($id);
        $breakdown = CostBreakdown::calculate($invoice);

        // format total
        $total = is_null($breakdown['fixedPrice']) ? $breakdown['total'] : $breakdown['fixedPrice'];
        $formatedTotal = \number_format(round(($total / 100 + 0.000001) * 20) / 20, 2, '', '');

        $splitted = str_split($formatedTotal);
        $first_part = "";
        $first_part .= implode('', array_slice($splitted, 0, -2));
        $first_part .= " ";
        $first_part .= implode('', array_slice($splitted, -2, 2));

        // render address
        $addressLabel = AddressLabelBuilder::build($invoice, true);

        $settings = GlobalSettings::all()->first();

        // some projects used to be split with ; instead of ,
        $legacySplit = explode(";", $invoice->name)[0];
        $splitName = $this->replaceUmlaute(explode(",", $legacySplit)[0]);
        $downloadName = "Einzahlungsschein_" . $invoice->id . "_" . $splitName . "_" . Carbon::parse($invoice->ending)->format("Y_m_d");

        // initialize PDF, render view and pass it back
        $pdf = new PDF(
            'esr',
            [
                'addressLabel' => $addressLabel,
                'breakdown' => $breakdown,
                'invoice' => $invoice,
                'formatted_total' => $first_part,
                'title' => $downloadName,
            ],
            false
        );

        return $pdf->print($downloadName, Carbon::parse($invoice->ending));
    }

    public function printEffortReport($id)
    {
        $invoice = Invoice::findOrFail($id);

        if ($invoice->project) {
            $commentsAndEffortsPerDate = ProjectEffortReportFetcher::fetch($invoice->project->id, $invoice->beginning, $invoice->ending);
            $parsedown = new Parsedown();
            $description = GroupMarkdownToDiv::group($parsedown->text($invoice->description));

            // some projects used to be split with ; instead of ,
            $legacySplit = explode(";", $invoice->name)[0];
            $splitName = $this->replaceUmlaute(explode(",", $legacySplit)[0]);
            $downloadName = "Aufwandrapport_Rechnung_" . $invoice->id . "_" . $splitName . "_" . Carbon::parse($invoice->ending)->format("Y_m_d");

            // initialize PDF, render view and pass it back
            $pdf = new PDF(
                'invoice_effort_report',
                [
                    'content' => $commentsAndEffortsPerDate,
                    'description' => $description,
                    'invoice' => $invoice,
                    'title' => $downloadName
                ]
            );

            return $pdf->print($downloadName, Carbon::now());
        } else {
            return response('Invoice ' . $invoice->id . ' has no project assigned!', 400);
        }
    }

    private function replaceUmlaute($string)
    {
        $search = array("Ä", "Ö", "Ü", "ä", "ö", "ü", "ß", "´");
        $replace = array("Ae", "Oe", "Ue", "ae", "oe", "ue", "ss", "");
        return str_replace($search, $replace, $string);
    }

    public function put($id, Request $request)
    {
        $this->validateRequest($request);
        /** @var Invoice $invoice */
        $invoice = Invoice::findOrFail($id);
        try {
            DB::beginTransaction();
            $invoice->update(Input::toArray());
            $this->executeNestedUpdate(Input::get('costgroup_distributions'), $invoice->costgroup_distributions, InvoiceCostgroupDistribution::class, 'invoice', $invoice);

            $this->executeNestedUpdate(Input::get('discounts'), $invoice->discounts, InvoiceDiscount::class, 'invoice', $invoice);

            $this->executeNestedUpdate(Input::get('positions'), $invoice->positions, InvoicePosition::class, 'invoice', $invoice);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
        DB::commit();

        return self::get($id);
    }

    private function validateRequest(Request $request)
    {
        $this->validate($request, [
            'accountant_id' => 'required|integer',
            'address_id' => 'required|integer',
            'costgroup_distributions' => 'required|array',
            'costgroup_distributions.*.costgroup_number' => 'required|integer',
            'costgroup_distributions.*.weight' => 'required|integer',
            'description' => 'required|string',
            'discounts' => 'present|array',
            'discounts.*.name' => 'required|string|max:255',
            'discounts.*.percentage' => 'required|boolean',
            'discounts.*.value' => 'required|numeric',
            'ending' => 'required|date',
            'fixed_price' => 'integer|nullable',
            'fixed_price_vat' => 'numeric|nullable',
            'positions' => 'present|array',
            'positions.*.amount' => 'required|numeric',
            'positions.*.description' => 'required|string|max:255',
            'positions.*.order' => 'integer|nullable',
            'positions.*.price_per_rate' => 'required|integer',
            'positions.*.project_position_id' => 'integer|nullable',
            'positions.*.rate_unit_id' => 'required|integer',
            'positions.*.vat' => 'required|numeric',
            'project_id' => 'nullable|integer',
            'name' => 'required|string',
            'beginning' => 'required|date'
        ]);
    }
}
