json.set! :current_page,	pagination.current_page
json.set! :first_page_url,	"/?page=666"
json.set! :last_page_url,	"/?page=666"
json.set! :last_page,	666
json.set! :from,	pagination.total_count
json.set! :next_page_url,	path_to_next_page(pagination)
json.set! :prev_page_url,	path_to_prev_page(pagination)
json.set! :path,	"/"
json.set! :per_page, pagination.limit_value
json.set! :to,	666
json.set! :total,	666
