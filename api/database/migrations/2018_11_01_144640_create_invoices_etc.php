<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateInvoicesEtc extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('costgroups', function (Blueprint $table) {
            $table->unsignedInteger('number')->unique();
            $table->string('name');
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('invoices', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('accountant_id')->nullable();
            $table->foreign('accountant_id')->references('id')->on('employees')->onDelete('set null');
            $table->unsignedInteger('address_id')->nullable();
            $table->foreign('address_id')->references('id')->on('addresses')->onDelete('set null');
            $table->text('description');
            $table->date('end');
            $table->integer('fixed_price')->nullable();
            $table->unsignedInteger('project_id')->nullable();
            $table->foreign('project_id')->references('id')->on('projects')->onDelete('set null');
            $table->string('name');
            $table->date('start');
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('costgroup_invoice', function ($table) {
            $table->integer('costgroup_number')->unsigned();
            $table->foreign('costgroup_number')->references('number')->on('costgroups')->onDelete('cascade');
            $table->integer('invoice_id')->unsigned();
            $table->foreign('invoice_id')->references('id')->on('invoices')->onDelete('cascade');
        });

        Schema::create('invoice_positions', function (Blueprint $table) {
            $table->increments('id');
            $table->decimal('amount');
            $table->string('description');
            $table->unsignedInteger('invoice_id')->nullable();
            $table->foreign('invoice_id')->references('id')->on('invoices')->onDelete('cascade');
            $table->integer('order')->nullable();
            $table->integer('price_per_rate');
            $table->unsignedInteger('project_position_id')->nullable();
            $table->foreign('project_position_id')->references('id')->on('project_positions')->onDelete('restrict');
            $table->unsignedInteger('rate_unit_id')->nullable();
            $table->foreign('rate_unit_id')->references('id')->on('rate_units')->onDelete('set null');
            $table->decimal('vat', 4, 3);
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('invoice_discounts', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('invoice_id')->nullable();
            $table->foreign('invoice_id')->references('id')->on('invoices')->onDelete('cascade');
            $table->string('name');
            $table->boolean('percentage')->default(false);
            $table->decimal('value', 10, 3);
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('invoice_discounts');
        Schema::dropIfExists('invoice_positions');
        Schema::dropIfExists('costgroup_invoice');
        Schema::dropIfExists('invoices');
        Schema::dropIfExists('costgroups');
    }
}