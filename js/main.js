$(document).ready(function() {
	// Object to store results
	var result = {};

	// Handle form events
	var form = $('#form');
	form.find('.form-row').each(function(){
		var row = $(this),
			field = row.data('field'),
			cols = row.find('.form-col'),
			allowMulti = row.hasClass('allow-multi');
		
		// Set value in object so we can validate later
		result[field] = {};
	
		cols.each(function(){
			var col = $(this),
				value = col.data("value");
		
			col.on("click",function(){
				// Handle unset
				if (!col.hasClass("selected")){
					// Handle multi-options
					if (allowMulti){
						col.addClass("selected");

						result[field][value] = true;
					} else {
						cols.removeClass("selected");
						col.addClass("selected");
			
						result[field] = value;
					}
				} else {
					// Handle multi-options
					if (allowMulti){
						col.removeClass("selected");
						delete result[field][value];
					} else {
						col.removeClass("selected");

						result[field] = undefined;
					}
				}
				// Remove error marking
				row.removeClass("error-row");
			});
		});
	});
	
	// Handle done
	$("#done").on("click",function(){
		// Validate results
		var error = false,
			keys = Object.keys(result);
		
		for (var index in keys){
			var key = keys[index];
			if ($.isEmptyObject(result[key])){
				var errorRow = form.find('.form-row[data-field="' + key + '"]');
				errorRow.addClass("error-row");
				error = true;
			}
		}
		
		// Do not continue if we have an error
		if (error){
			return;
		}
		
		// Pass result to API
		console.log(JSON.stringify(result));
	});
});
