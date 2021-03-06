# frozen_string_literal: true

json.partial! "pagination", pagination: @companies
json.set! :data do
  json.array! @companies do |company|
    json.extract! company.decorate, :id, :type, :comment, :company_id, :department, :email, :first_name, :last_name, :hidden, :name, :rate_group_id, :salutation, :created_at, :updated_at, :deleted_at, :created_by, :updated_by, :deleted_by
    json.set! :addresses do
      json.array! company.addresses do |address|
        json.extract! address, :id, :city, :country, :customer_id, :description, :zip, :street, :supplement, :deleted_at, :created_at, :updated_at, :created_by, :updated_by, :deleted_by
      end
    end
    json.set! :people do
      json.array! company.people do |person|
        json.extract! person, :id, :type, :comment, :company_id, :department, :email, :first_name, :last_name, :hidden, :name, :rate_group_id, :salutation, :created_at, :updated_at, :deleted_at, :created_by, :updated_by, :deleted_by
      end
    end
    json.set! :persons do
      json.array! company.people do |person|
        json.extract! person, :id, :type, :comment, :company_id, :department, :email, :first_name, :last_name, :hidden, :name, :rate_group_id, :salutation, :created_at, :updated_at, :deleted_at, :created_by, :updated_by, :deleted_by
      end
    end
    json.set! :phone_numbers do
      json.array! company.phones do |phone|
        json.extract! phone, :id, :category, :customer_id, :number, :deleted_at, :created_at, :updated_at, :created_by, :updated_by, :deleted_by
      end
    end
  end
end
