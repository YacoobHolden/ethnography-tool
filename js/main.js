$(document).ready(function() {
	// Add utility functions
	var pages = $('.page');
	function showPage(id){
		pages.removeClass("active");
		$("#"+id).addClass("active");
	};
	
	// Setup required objects
	OAuth.initialize('utST7PNGeZd9L1lVvKUrwVHykrU');
	var result = {},
		currentUser,
		oauthClient;
	
	// Loads current user and checks if we have token - @todo add error handling
	function getCurrentUser(callback){
		var res = OAuth.create('google');
		// Check we have stored token
		if (res){
			// Get and store the current user
			res.me().done(function(me) {
				currentUser = me;
				callback && callback(true);
			}).fail(function(err) {
			  callback && callback(false);
			});
		} else {
			callback && callback(false);
		}
	};
	
	// Does oauth with google - @todo add error handling
	function googleOauth(callback){
		OAuth.popup('google', {cache: true} ).done(function(oauthClient) {
			// Store oauthClient
			oauthClient = oauthClient;
			// Update user
			getCurrentUser(function(success){
				if (success){
					callback(true);
				} else {
					callback(false);
				}
			})
		}).fail(function(err) {
			callback(false);
		});
	};
	
	// Setup topbar
	var topbar = $('#topbar'),
		date = topbar.find(".date"),
		time = topbar.find(".time");

	// Datepicker
	date.datepicker({
		format: 'dd/mm/yyyy',
		autoclose: true,
		disableTouchKeyboard: true
	});
	date.datepicker('update', new Date());
	// Timepicker
	time.timepicker({
		'noneOption': [
			{
				'label': 'Now',
				'value': 'Now'
			}
		 ]
	});
	time.timepicker('setTime', 'Now');

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
	
	// Add login button
	$('#login-button').on("click",function(){
		showPage('loader');
		googleOauth(function(success){
			if (success){
				showPage('main');
			} else {
				showPage('login');
			}
		});
	});
	
	// Main page logic
	getCurrentUser(function(success){
		if (success){
			showPage('main');
		} else {
			showPage('login');
		}
	});
});
