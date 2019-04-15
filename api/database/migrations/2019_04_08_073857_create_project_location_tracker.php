<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateProjectLocationTracker extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('project_locations', function (Blueprint $table) {
            $table->increments('id');
            $table->text('name');

            $table->softDeletes();
            $table->timestamps();

            $table->integer('created_by')->nullable();
            $table->integer('updated_by')->nullable();
            $table->integer('deleted_by')->nullable();
        });

        Schema::create('project_work_types', function (Blueprint $table) {
            $table->increments('id');
            $table->text('name');

            $table->softDeletes();
            $table->timestamps();

            $table->integer('created_by')->nullable();
            $table->integer('updated_by')->nullable();
            $table->integer('deleted_by')->nullable();
        });

        Schema::create('project_location_trackers', function (Blueprint $table) {
            $table->increments('id');
            $table->date('date');
            $table->unsignedInteger('project_id')->nullable();
            $table->unsignedInteger('project_location_id')->nullable();
            $table->unsignedInteger('project_work_type_id')->nullable();
            $table->foreign('project_id')->references('id')->on('projects')->onDelete('cascade');
            $table->foreign('project_location_id')->references('id')->on('project_locations')->onDelete('cascade');
            $table->foreign('project_work_type_id')->references('id')->on('project_work_types')->onDelete('cascade');

            $table->softDeletes();
            $table->timestamps();

            $table->integer('created_by')->nullable();
            $table->integer('updated_by')->nullable();
            $table->integer('deleted_by')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('project_location_trackers');
        Schema::dropIfExists('project_locations');
        Schema::dropIfExists('project_work_types');
    }
}
