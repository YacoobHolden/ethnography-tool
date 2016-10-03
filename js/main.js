$(document).ready(function() {
	/*
	* Build helper objects
	*/
	// Extend Handlebars
	var adaptors = {
		deviceType: {
			text: {
				"mobile" : "Mobile",
				"laptop" : "Laptop",
				"pc" : "PC",
				"tv" : "TV",
				"console" : "Console",
				"tablet" : "Tablet"
			},
			icons: {
				"mobile" : "fa-mobile",
				"laptop" : "fa-laptop",
				"pc" : "fa-desktop",
				"tv" : "fa-television",
				"console" : "fa-gamepad",
				"tablet" : "fa-tablet"
			}
		},
		usage: {
			text: {
				"solo" : "Solo",
				"sequential" : "Sequential",
				"parallel" : "Parallel"
			},
			icons: {
				"solo" : "fa-caret-right",
				"sequential" : "fa-long-arrow-right",
				"parallel" : "fa-exchange"
			}
		},
		place: {
			text: {
				"home" : "Home",
				"public" : "Public",
				"Transit" : "Transit"
			},
			icons: {
				"home" : "fa-home",
				"public" : "fa-building",
				"Transit" : "fa-bus"
			}
		},
		people: {
			text: {
				"none" : "0",
				"less" : "< 5",
				"more" : "≥ 5"
			},
			icons: {
				"none" : "fa-hand-rock-o",
				"less" : "fa-user",
				"more" : "fa-group"
			}
		},
		actions: {
			text: {
				"Messaging": "Messaging",
				"Gaming": "Gaming",
				"Browsing": "Browsing",
				"Social_Media": "Social Media",
				"View_Media": "View Media",
				"Work": "Work",
				"Other": "Other"
			},
			icons: {
				"Messaging": "fa-comment",
				"Gaming": "fa-gamepad",
				"Browsing": "fa-chrome",
				"Social_Media": "fa-facebook-official",
				"View_Media": "fa-youtube-square",
				"Work": "fa-briefcase",
				"Other": "fa-question-circle"
			}
		}
	};
	Handlebars.registerHelper('getTextForKey', function(type, key) {
		if (!adaptors[type]["text"][key]){
			return "Unknown"
		} else {
			return adaptors[type]["text"][key];
		}
	});
	Handlebars.registerHelper('getIconForKey', function(type, key) {
		if (!adaptors[type]["icons"][key]){
			return "fa-question-circle"
		} else {
			return adaptors[type]["icons"][key];
		}
	});	
	Handlebars.registerHelper('getTextForActions', function(record) {
		var returnText = "",
			first = true;
		for (var key in record){
			var text = adaptors.actions.text[key];
			if (text && record[key]){
				// Handle custom first value
				if (first){
					returnText = returnText + ' <div class="record-line"><div class="record-left">Actions</div><div class="record-right">' + text + '</div></div>';
					first = false;
				} else {
					returnText = returnText + ' <div class="record-line"><div class="record-left"></div><div class="record-right">' + text + '</div></div>';
				}
			}
		}
	
		return new Handlebars.SafeString(returnText);
	});
	Handlebars.registerHelper('getIconsForActions', function(record) {
		var returnText = "";
		for (var key in record){
			var icon = adaptors.actions.icons[key];
			if (icon && record[key]){
				returnText = returnText + ' <i class="fa ' + icon + '"></i>';
			}
		}
		
		return new Handlebars.SafeString(returnText);
	});
	Handlebars.registerHelper('prettyTime', function(time) {
		var splitText = time.split("T"),
			splitTime = splitText[1].split(":"),
			splitDate = splitText[0].split("-");
		
		return splitTime[0] + ":" + splitTime[1] + " " + splitDate[2] + "/" + splitDate[1];
	});
	
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
		// Add templating via Handlebars
		cache: {},
		template: function(name, data){
			var self = this,
				_template,
				result,
				templateName = "views/" + name + ".html",
				renderData = data ? data : {};

			if(self.cache[templateName]){
				_template = self.cache[templateName];
			}
			else {
				// Load the local file using requests API
				$.ajax({
					url: templateName,
					dataType: 'text',
					async: false,
					success: function(returned){
						// Remove characters for jquery
						result = returned.replace(/(\r\n|\n|\r|\t)/gm,'').trim();
						_template = returned;
					}
				});
			}

			// Cache the template, then compile with data
			self.cache[templateName] = _template;
			_template = Handlebars.compile(_template);
			result = _template(renderData);

			return result;
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
		},
		flashOverlay: function(type, time){
			var self = this,
				overlay = $("#overlay"),
				time = time || 1000,
				type = type || "success";
				
			overlay.show();
			overlay.find(".overlay-icon").hide();
			overlay.find("." + type).show();
			setTimeout(function(){
				overlay.fadeOut("slow");
			}, time);
		},
		updateStatistics: function(callback){
			var self = this;
			
			requests.getFormHistory(function(records){
				// First preprocess records
				records.sort(function(a, b){
					return new Date(b.Entry_DateTime) - new Date(a.Entry_DateTime);
				});
				// Then update records list
				self.updateRecordsList(records);
				
				// Click event to display list
				$("#today-filter").click();
				
				callback && callback();
			});
		},
		updateGraphs: function(records){
		
		},
		updateRecordsList: function(records){
			var self = this,
				adaptors = self.adaptors,
				recordList = $('.record-container');
			
			// Clear records
			recordList.empty();
			// Then build HTML
			for (var index in records){
				var currentRecord = records[index],
					recordLine = $(ui.template("recordLine", currentRecord));
				recordList.append(recordLine);
			}
			// Then bind events
			recordList.find('.record').on('click', function(){
				var $this = $(this),
					thisBottom = $this.find('.record-bottom');
				
				if ($this.hasClass("active")){
					$this.removeClass("active")
					thisBottom.removeClass('active');
				} else {
					recordList.find('.record-bottom').removeClass('active');
					recordList.find('.record').removeClass('active');
					thisBottom.addClass('active');
					$this.addClass("active");
				}
			});
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
  				callback && callback(true);
		  	}).fail(function(error) {
  				callback && callback(false);
			});
		},
		addNewEthnoResult: function(data, callback){
			var self = this;
			
			/*$.ajax({
				url: self.apiUrl + "/DataModels",
				method: "POST",
 			   	data:  JSON.stringify(data),
  			  	dataType: "json",
				contentType: 'application/json',
				processData: false
			}).done(function(returned) {
  				callback && callback(true);
		  	}).fail(function(error) {
  				callback && callback(false);
			});*/
				
			callback && callback(true);
		},
		getFormHistory: function(callback){
			var self = this;
			
			$.ajax({
				url: self.apiUrl + "/DataModels/" + currentUser.name,
				method: "GET",
  			  	dataType: "json",
				contentType: 'application/json'
			}).done(function(data) {
  				callback && callback(data);
		  	}).fail(function(error) {
  				callback && callback(false);
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
				ui.flashOverlay("error");
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
		
		// Add special behaviour for stats 
		if (toArea === "stats") {
			ui.showPage('loader');
			ui.updateStatistics(function(){
				ui.showPage('main');
				ui.showArea(toArea);
			});
		} else {
			ui.showArea(toArea);
		}
		
	});

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
				ui.flashOverlay("success");
			} else {
				ui.flashOverlay("error");
			}
		});
	});
	
	/*
	* Setup Ethno Page
	*/
	var quill = new Quill('#editor', {
		theme: 'snow',
		placeholder: 'Enter your auth-ethnographic report.',
	});
	
	// Handle done
	$("#eth-done").on("click",function(){
		// Get and validate results
		var text = quill.getText();
		
		// Pass result to API
		ui.showPage('loader');
		requests.addNewEthnoResult(text, function(success){
			ui.showPage('main');
			if (success){
				ui.flashOverlay("success");
			} else {
				ui.flashOverlay("error");
			}
		});
	});
	
	/*
	* Setup stats page
	*/
	var statsArea = $('#stats'),
		filterButtons = statsArea.find('.filter-buttons');
	statsArea.find("#today-filter").on("click",function(){
		filterButtons.removeClass("active");
		$(this).addClass("active");
		statsArea.find('.record').each(function(){
			var $this = $(this),
				date = $this.data("time"),
				today = new Date(),
				splitDate = date.split("T")[0].split("-");
			
			if (parseInt(today.getDate()) != parseInt(splitDate[2]) || parseInt(today.getMonth()+1) !== parseInt(splitDate[1]) 
				|| parseInt(today.getFullYear()) !== parseInt(splitDate[0])){
				$this.addClass("hidden");
			} else {
				$this.removeClass("hidden");
			}
		})
	});
	
	statsArea.find("#all-filter").on("click",function(){
		filterButtons.removeClass("active");
		$(this).addClass("active");
		statsArea.find('.record').removeClass("hidden");
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
