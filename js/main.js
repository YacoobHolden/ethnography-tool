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
		},
		oformat: function(value){
			if (parseInt(value) < 10){
				return "0"+value;
			}
			return value;
		},
		// Gets result data from UI
		getResults: function(){
			var self = this,
				result = {};
				form = $('#form');

			// Add initial values from form
			form.find('.form-row').each(function(){
				var row = $(this),
					field = row.data("field"),
					allowMulti = row.hasClass('allow-multi'),
					activeCols = row.find(".form-col.selected");
				
				// Only add if set - otherwise set as empty
				if (activeCols.length > 0){
					if (allowMulti) {
						activeCols.each(function(){
							result[$(this).data("value")] = true;
						});
					} else {
						result[field] = $(activeCols).data("value");
					}
				} else {
					result[field] = {};
				}
			});
			
			// Add other values
			var date = $(".date").datepicker("getDate");
			if (!date){
				date = new Date();
			}
			var time = $(".time").timepicker('getTime');
			if (!time){
				time = new Date();
			}
			result.Username = currentUser.name;
			result.Entry_DateTime = date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate() + "T" + self.oformat(time.getHours()) + 
				":" + self.oformat(time.getMinutes())  + ":00.000Z";
			
			return result;
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
		apiUrl: "https://hciwebapp.azurewebsites.net/api",
		// Add new form using data
		addNewForm: function(data, callback){
			var self = this;
			
			$.ajax({
				url: self.apiUrl + "/DataModels",
				method: "POST",
 			   	data:  JSON.stringify(data),
  			  	dataType: "json",
				contentType: 'application/json',
				processData: false
			}).done(function(returned) {
  				callback && callback(returned);
		  	}).fail(function(error) {
  				callback && callback(error);
			});
		}
	},
	// Other helpers & stores
	OAuth.initialize('utST7PNGeZd9L1lVvKUrwVHykrU');
	var currentUser,
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
			cols = row.find('.form-col'),
			allowMulti = row.hasClass('allow-multi');
		
		cols.each(function(){
			var col = $(this);
		
			col.on("click",function(){
				// Handle unset
				if (!col.hasClass("selected")){
					// Handle multi-options
					if (allowMulti){
						col.addClass("selected");
					} else {
						cols.removeClass("selected");
						col.addClass("selected");
					}
				} else {
					// Handle multi-options
					col.removeClass("selected");
				}
				// Remove error marking
				row.removeClass("error-row");
			});
		});
	});
	
	// Handle done
	$("#done").on("click",function(){
		// Get and validate results
		var result = ui.getResults(),
			error = false,
			keys = Object.keys(result);
		
		for (var index in keys){
			var key = keys[index];
			if ($.isPlainObject(result[key]) && $.isEmptyObject(result[key])){
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
		ui.showPage('loader');
		requests.addNewForm(result, function(success){
			ui.showPage('main');
			if (success){
				
			} else {
				
			}
		});
	});
	
	/*
	* Main Page Logic
	*/
	$.support.cors = true;
	auth.getCurrentUser(function(success){
		if (success){
			ui.showPage('main');
		} else {
			ui.showPage('login');
		}
	});
});
