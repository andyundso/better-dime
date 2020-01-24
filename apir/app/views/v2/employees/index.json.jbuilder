json.partial! 'pagination', pagination: @employees
json.set! :data do
  json.array! @employees do |user|
    json.extract! user, :id, :email, :is_admin, :created_at, :updated_at, :first_name, :last_name, :can_login, :archived, :holidays_per_year, :deleted_at, :employee_group_id, :first_vacation_takeover
    json.set! :group_name, user.employee_group&.name
    json.group do
      json.extract! user.employee_group, :id, :name, :created_at, :updated_at, :deleted_at, :created_by, :updated_by, :deleted_by
    end
  end
end
json.set! :linki, sort_url(@q, :id, :desc) 
