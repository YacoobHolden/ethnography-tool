$(document).ready(function() {
	/* Set object to store results */
	var result = {};

	var form = $('#form');

	form.find('.form-row').each(function(){
		var row = $(this),
			field = row.data('field'),
			cols = row.find('.form-col'),
			allowMulti = row.hasClass('allow-multi');
	
		cols.each(function(){
			var col = $(this),
				value = col.data("value");
		
			col.on("click",function(){
				// Handle unset
				if (!col.hasClass("selected")){
					// Handle multi-options
					if (allowMulti){
						col.addClass("selected");
					
						// Use obj to store multis
						if (!result[field]){
							result[field] = {}
						}
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
			});
		});
	});
});
