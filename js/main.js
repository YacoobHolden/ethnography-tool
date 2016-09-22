$(document).ready(function() {
	/*
	* Build helper objects
	*/
	// UI Helper - shortcuts to various UI needs
	ui = {
		pages: pages = $('.page'),
		areas: $('.area'),
		showPage: function (id){
			var self = this;
			self.pages.removeClass("active");
			$("#"+id).addClass("active");
		},
		showArea: function(id){
			var self = this;
			self.showPage("main");
			self.areas.removeClass("active");
			$("#"+id).addClass("active");
		}
	},
	// Auth Helper - shortcuts to authentication functions
	auth = {
		// Loads current user and checks if we have token - @todo add error handling
		getCurrentUser: function(callback){
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
		},
		// Does oauth with google - @todo add error handling
		googleOauth: function (callback){
			var self = this;
			OAuth.popup('google', {cache: true} ).done(function(oauthClient) {
				// Store oauthClient
				oauthClient = oauthClient;
				// Update user
				self.getCurrentUser(function(success){
					if (success){
						callback(true);
					} else {
						callback(false);
					}
				})
			}).fail(function(err) {
				callback(false);
			});
		}
	},
	// Request Helper
	requests = {
		
	},
	// Other helpers & stores
	OAuth.initialize('utST7PNGeZd9L1lVvKUrwVHykrU');
	var result = {},
		currentUser,
		oauthClient;	

	/*
	* Setup Login Page
	*/
	// Add login button
	$('#login-button').on("click",function(){
		ui.showPage('loader');
		auth.googleOauth(function(success){
			if (success){
				ui.showPage('main');
			} else {
				ui.showPage('login');
			}
		});
	});
	
	/*
	* Setup Main Page
	* Done by area
	*/
	
	/*
	* Setup Topbar Area
	*/
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
	// Add change area
	var areaChangers = $('.to-area');
	areaChangers.on("click", function(){
		var $this = $(this),
			toArea = $this.data("area");
		
		areaChangers.removeClass("active");
		$this.addClass("active");
		ui.showArea(toArea);
	})

	/*
	* Setup Form Area
	*/
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
		
		// Convert to result expected by API
		
		
		// Pass result to API
		console.log(JSON.stringify(result));
	});
	
	/*
	* Main Page Logic
	*/
	auth.getCurrentUser(function(success){
		if (success){
			ui.showPage('main');
		} else {
			ui.showPage('login');
		}
	});
});
