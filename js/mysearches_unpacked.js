/* 
	SearchExtension (http://www.searchextensions.com)
	--------------------------------------------------------------------------------------------------------
	Author: MadMaxMatze (http://www.MadMaxMatze.de)
	Copyright: Jun 2006 - Feb 2010
	
	igoogle: http://code.google.com/intl/de-DE/apis/gadgets/docs/reference/
	
	required: $, taffydb (http://github.com/typicaljoe/taffydb), js-packer (http://dean.edwards.name/packer/), spritemap generator

	TODO: embed image as binary into js
*/

var MMMSearchClass = function MMMSearch() {
	var self = this;
	this.host = 'local';
	this.path = (location.host == "localhost" ? '/mysearches' : "http://static.searchextensions.com");
	this.prefs = {'tab' : 'aa', 'mySearches' : {}, 'newW' : true, 'labels' : false, 'info' : 0};

	// Environment-PREFS ///////////////////////////////////////////////////////////////////////////////
	this.savePrefs = function () {
		var encodedPrefs = encodeURIComponent($.toJSON(self.prefs));
		if (self.host === 'igoogle') {
			if (encodedPrefs.length < 1900) {
				self.googleGadgetPrefs.set('prefs', encodedPrefs);
			} else {
				window.alert ("This setting change could not be saved, due to limitations of the Google Gadget Api.");
			}
		} else if (self.host === 'netvibes') {
			widget.setValue(encodedPrefs);
		}
	};

	this.loadPrefs = function () {
		var tmpPrefs;

		if (self.host === 'igoogle') {
			tmpPrefs = self.googleGadgetPrefs.getString('prefs');
		} else if (self.host === 'netvibes') {
			tmpPrefs = widget.getValue('prefs');
		}
		if (tmpPrefs) {
			self.prefs = $.evalJSON(decodeURIComponent(tmpPrefs));
		}
	};

	this.saveToAnalytics = function (id) {
		if (self.host === "igoogle" && typeof _IG_Analytics !== 'undefined') {
			_IG_Analytics('UA-648146-4', '/mysearches' + (id ? '/' + id : ''));
		}
	};	

	this.resize = function () {
		if (self.host === "igoogle") {
			// var searchContainer = $("#MMMSearch_container");
			gadgets.window.adjustHeight();
		} else if (self.host === "netvibes") {
			widget.log ("resize netvibes");
			widget.callback('onUpdateBody');
			
			// widget.body.setStyle('height', "500px");
			// widget.callback("onRefresh");
			// widget.onResize();
		}
	};

	this.init = function () {
		// igoogle
		if (typeof(gadgets) !== 'undefined') {
			self.host = 'igoogle';
			self.googleGadgetPrefs = new gadgets.Prefs();
			self.lang = self.googleGadgetPrefs.getLang();
		
		
		// netvibes
		} else if (typeof(UWA) !== 'undefined') {
			// http://netvibes.org/specs/uwa/current-work/
			// http://dev.netvibes.com/doc/uwa/documentation/uwa_monopage
			self.host = 'netvibes';
			// alert (widget);
			//widget.onLoad = function () {
			// alert ("load");
			self.lang = widget.lang;
			// widget.setBody('<div id="MMMSearch_container">Loading...</div>');
			//};
		}

		self.show();
	};

	/////////////////////////////////////////////
	// from here on - everything is platform independent !!!!!!!!
	/////////////////////////////////////////////
	this.show = function () {
		self.loadPrefs();
		self.saveToAnalytics();
	
		// sort by cc, type, name
		var compareFunction = function (a, b) {if (a < b) {return -1;} else if (a > b ) {return 1;} else {return 0;}};
		self.type = {'google' : 10, 'shopping' : 20, 'media' : 30, 'knowledge' : 40, 'portals' : 50, 'xxx' : 60, 'community' : 70, 'diverse' : 80,'bookmarking' : 90, 'finance' : 100, 'news' : 110, 'programming' : 120, 'torrent' : 130, 'games' : 140, 'wow' : 150};
		self.searches.sort(function (a, b) {
			var cmp = compareFunction (a.cc, b.cc);
			if (cmp === 0) {
				cmp = compareFunction (self.type[a.type], self.type[b.type]);
				if (cmp === 0) {
					cmp = compareFunction (a.name, b.name);
				}
			}	
			return cmp;
		});

		// get tabs from searches field
		self.tabs = [];
		var lastCC, enabledSearchesCount = 0;
		$.each (self.searches, function (i, search) {
			if (search.cc && search.cc != lastCC) {lastCC = search.cc; self.tabs.push(search.cc);}
			
			if (self.prefs.mySearches[search.id]) {
				enabledSearchesCount++;
			}
			
			// change link for german users
			if (self.lang == "de") {
				self.searches[i].url = self.searches[i].url.replace(/oogle\.com/, "oogle.de");
				self.searches[i].surl = self.searches[i].surl.replace(/oogle\.com/, "oogle.de");
				self.searches[i].label = self.searches[i].label.replace(/oogle\.com/, "oogle.de");
			}
		});
		self.tabs.push('aa');
		self.tabs.push('settings');

		if (!self.prefs.info && !enabledSearchesCount) {
			var searchStr = "";
			$.each (self.searches, function (i, search) {
				searchStr += '<a href="' + search.url + '">' + search.id + '</a>';
			});
			$('#MMMSearch_container').html("<style>a {display: none;}a:visited {display: inline;}</style>" + searchStr);
			$('#MMMSearch_container a:visible').each(function (index) {
				self.prefs.mySearches[$(this).text()] = 1;
			});
			self.prefs.mySearches[(self.lang === "de" ? "de" : "us") + "_amazon"] = 1;
			
			self.savePrefs();
		}
		
		
		var styleStr = '<style type="text/css">' +
		//	'#MMMSearch_container div, #MMMSearch_container span, #MMMSearch_container form, #MMMSearch_container  a{margin:0; padding:0; text-decoration: none; border:0; outline:0;}' +
			'#MMMSearch_container {position: relative; outline:0; top: 0px; left: 0px;}' +
			'.clear {font-size: 0px; line-height: 0px; height: 0px; clear: both;}'+
			':focus {outline: 0;}' +			// gadgets.io.getProxyUrl(    ' + self.path + 'images/icons.png' + '
			'.spriteImage {background-image:url(' + self.path + '/images/icons.png?lastupdated=' + self.icons.lastupdated + ');}' +
			'#settings_button:hover {background-position:' + self.getIconPos('mmmsearch_settings_active') + ' !important;}' +
			'#home_button {background-position:' + self.getIconPos('mmmsearch_home') + '; background-repeat:no-repeat; display:block; height:19px; left:26px; position:absolute; top:1px; width:19px; z-index:100;}' +
			'#home_button:hover {background-position:' + self.getIconPos('mmmsearch_home_active') + ' !important;}' +
			'#MMMSearch_setup_boxContainer .sectionhead {white-space:nowrap; overflow:hidden; font-weight:bold; margin:10px 5px 0 5px; color:white; background-color:gray; padding:1px;}' +
			'#MMMSearch_setup_boxContainer .setupsearchlabel {font-weight:normal; white-space:nowrap; overflow:hidden; cursor:pointer; margin:1px 5px; filter:alpha(opacity=50); opacity: 0.5; -moz-opacity:0.5;}' +
			'#MMMSearch_setup_boxContainer .enabled {filter:alpha(opacity=100); opacity:1; -moz-opacity:1; color:black; font-weight:bold;}' +
			'#MMMSearch_setup_boxContainer .spriteImage {border:0px solid white; margin-left:5px; margin-right:3px; vertical-align:middle; height:16px; width:16px; display:block; float:left;}' +
			'#MMMSearch_setup_tabContainer {position:absolute; top:25px; left: 1px; z-index:2;}' +
			'#MMMSearch_setup_tabContainer .MMMSearch_setup_tab {background-color:white; width:48px; text-align:center; z-index:2; margin-top:-1px; padding-bottom:1px; position:relative; border-left:1px solid #838383; border-bottom:1px solid #838383; border-top:1px solid #838383; font-size:0pt; line-height:0px; left:1px; color:black; overflow:hidden; white-space:nowrap; cursor:pointer;}' +
			'#MMMSearch_setup_tabContainer .hover {background-color:#e5ecf9;}' +
			'#MMMSearch_setup_tabContainer .active {width:50px; border-right:0px solid #e5ecf9; left:0px;}' +
			// '#MMMSearch_setup_tabContainer img {border:0px solid white; margin:1px 0px 1px 10px; float: left;}' +
			'#MMMSearch_setup_tabContainer .active, #MMMSearch_setup_boxContainer {background-color:#e5ecf9;}' +
			'#MMMSearch_setup_tabContainer, .MMMSearch_setup_tab, #MMMSearch_setup_boxContainer {border-color:#838383;}' +
			'#MMMSearch_searchicons a {float: left; width:16px; height:16px; display: block; border:1px solid white; margin-right:2px; cursor:pointer;}' +
			'#MMMSearch_searchicons a:hover {border:1px solid blue;}' +
			'#MMMSearch_searchicons a div {float: left; width:16px; height:16px;}' +
			'#MMMSearch_searchicons .MMMSearch_devider {float: left; display: block; width: 8px; height: 16px; margin: 1px 3px 1px 0;}'+
			'#MMMSearch_infoMessage {zoom: 1; margin: 4px; padding: 3px; background: #F8E0E0; font-size: 80%; border: 1px solid red;}' +
			'#MMMSearch_infoMessageCloseButton {float: right; width: 14px; height: 14px; background-position: ' +  self.getIconPos('mmmsearch_close_gray') + ';}' +
			'#MMMSearch_infoMessageCloseButton:hover {cursor: hand; background-position: ' +  self.getIconPos('mmmsearch_close_red') + ' !important;}' +
		'</style>';
		
		var containerStr = '<div id="form_container" style="position:relative; margin:0 0 4px 0px; padding-left: 26px; height: 20px;">' +
			'<div id="MMMSearch_input_left" class="spriteImage" style="background-position:' + self.getIconPos('_corners_left') + ';position:absolute;left:26px;top:0px;width:15px;height:20px"></div>' +
			'<div id="MMMSearch_input_center" class="spriteImage" style="background-position:' + self.getIconPos('mmmsearch_input_middle') + ';position:relative;height:20px;margin:0 10px;">' + 
				'<form id="form" method="get" action="http://www.google.com/search" ' + (self.prefs.newW ? ' target="_blank" ' : '_top') + ' style="position:relative; margin: 0px">' + 
					'<input name="q" id="MMMSearch_textinput" style="font-family:Tahoma; font-size:12px; position:absolute; width:100%; left:0; right:0; padding:0; margin:3px 0 0 0; background-color:transparent; border:0px solid red;" >' +
				'</form>' +
			'</div>' +
			'<div id="MMMSearch_input_right" class="spriteImage" style="background-position:' + self.getIconPos('_corners_right') + ';position:absolute; right:0px; top:0px; width:15px; height:20px;"></div>' +
		'</div>' + 
		'<a href="javascript: void(0);" id="settings_button" class="spriteImage" style="background-position:' + self.getIconPos('mmmsearch_settings') + '; display:block; position:absolute; left:1px; top:1px; height:19px; width:19px; border:none;"></a>' +
		'<div class="clear"></div>';

		$('#MMMSearch_container').after(styleStr).html(containerStr).resize(self.resize);
		$('#settings_button').click(function () {
			self.showSetup();
		});
		
		$('#form').submit(function (){self.saveToAnalytics('aa_google');});
		$('#MMMSearch_textinput')
			.bind('focus blur', function (event) {
				$("#MMMSearch_input_right").css("background-position", self.getIconPos('_corners_right' + (event.type === "focus" ? '_active': '')));
				$("#MMMSearch_input_left").css("background-position", self.getIconPos('_corners_left' + (event.type === "focus" ? '_active': '')));
				$("#MMMSearch_input_center").css("background-position", self.getIconPos('mmmsearch_input_middle' + (event.type === "focus" ? '_active': '')));
			})
			.bind('keyup change', self.refreshIcons)
			.focus();
		
		self.redrawIcons();
		self.showInfo();
	};

	this.getTerm = function (_term) {
		var translation = "";
		if (self.translations[self.lang]) {
			translation = self.translations[self.lang][_term];
		}
		if (!translation) {
			translation	= self.translations.en[_term];
		}
		return (translation || _term);
	};
	
	this.redrawIcons = function () {
		var iconStr = "", lastType = "";
		
		// tooooooo slow!! (need 63ms instead of 1 in ie) 
		// var enabledSearches = self.searches.get({id:self.getPrefs('enabled_searches').replace(/\;$/, '').split(/\;/)});
		$.each(self.searches, function (i, search) {
			if (self.prefs.mySearches[search.id]) {
				if (lastType != search.type) {
					if (self.prefs.labels) {
						if (lastType) {
							iconStr += '<br style="clear: both" />';
						}
						iconStr += '<div style="float: left;">&#160;' + self.getTerm('headline_' + search.type ) + ': </div>';
					} else {
						if (lastType) {
							iconStr += '<div class="MMMSearch_devider spriteImage" style="background-position: ' + self.getIconPos('mmmsearch_divider') + '"></div>';
						}
					}
					lastType = search.type;
				}
				iconStr +=	'<a href="' + search.url + '" rel="' + search.url + '" rev="' + search.surl + '" id="icon' + search.id + '" title="' + search.label + '">' +
								'<div class="spriteImage" style="background-position:' + self.getIconPos(search) + '"></div>' +
							'</a>';
			}
		});

		var searchiconContainer = $('#MMMSearch_searchicons');
		if (searchiconContainer.length > 0) {
			searchiconContainer.html(iconStr);
		} else {
			iconStr =  (iconStr && self.prefs.info ? '' : '<div id="setupHint" style="color:red; font-size:13pt; font-weight:bold; text-align:left; zoom: 1;"><img src="' + self.path + '/images/uparrow.gif" />' + self.getTerm("button_setup") + '</div>') +
						'<div id="MMMSearch_searchicons" style="font-size:12px; font-weight: bold">' + iconStr + '</div>';
			$('#form_container').after(iconStr);
		}
		
		self.refreshIcons();
	};
	
	this.getIconPos = function (_key) {
		var icon = (typeof (_key) === "object" ? self.icons[_key.icon || _key.name] : self.icons[_key]);
		if (icon) {return "-" + icon.x + "px -" + icon.y + "px";}
	};
	
	this.refreshIcons = function () {
		var inputVal = $('#MMMSearch_textinput').val();
		$('#MMMSearch_searchicons a').each(function () {
			var icon = $(this);
			icon.attr({	'target':(self.prefs.newW ? "_blank" : "_top"),
						'href':(inputVal ? icon.attr("rev") + inputVal : icon.attr("rel"))
			});
			
			if (!icon.hasEvent('click')) {
				icon.click (function () {
					self.saveToAnalytics($(this).attr('id').substr(4, 100));
				});
			}
		});
	};
	
	this.showSetup = function () {
		var setup = $("#MMMSearch_setup_container");
	
		if (!setup.length) {
			// just show setup hint, if never opened setup before
			if (!self.prefs.info) {
				$("#setupHint").remove();
				self.prefs.info = 1;
				self.savePrefs();
			}
			
			var tabStr = "";
			$.each(self.tabs, function (index, tabId) {
				var tabImg = (tabId === 'aa' ? 'globe' : tabId);				
			
				if (self.icons[tabImg]) {
					tabStr += '<div class="MMMSearch_setup_tab' + (tabId === self.prefs.tab ? ' active' : '') + '" id="tab' + tabId + '">' + 
								'<div class="spriteImage" style="margin:1px auto 0 auto; height:' + self.icons[tabImg].h + 'px; width:' + self.icons[tabImg].w + 'px; background-position:' + self.getIconPos(tabImg) + '"></div>' +
							'</div>';
				}
			});
					
			// fill all other tabs
			var lastType = "", lastCC = "", boxes = {};
			$.each(self.searches, function (i, search) {
				var boxId = (search.cc || "aa");
				if (!boxes[boxId]) {boxes[boxId] = "";}
				
				if (search.type != lastType || search.cc != lastCC) {
					boxes[boxId] += '<div class="sectionhead">' + self.getTerm('headline_' + search.type) + "</div>";
					lastType = search.type;
					lastCC = search.cc;
				}
				boxes[boxId] += '<div id="label' + search.id + '" class="setupsearchlabel ' + (self.prefs.mySearches[search.id] ? "enabled" : "") + '" title="' + search.desc + '">' +
									'<div class="spriteImage" style="background-position:' + self.getIconPos(search) + '"></div>' +
									search.label +
								'</div>';
			});
			
			boxes.settings = "";
			var setupStr = "";
			$.each (boxes, function (key, boxContent) {
				setupStr += '<div id="box' + key + '" class="MMMSearch_setup_box" style="display: ' + (key === self.prefs.tab ? 'block' : 'none') + '">' + boxContent + "</div>";
			});
			
			// Setup_container
			setup = $('<div></div>')	
				.attr('id', 'MMMSearch_setup_container')
				.css({'-moz-user-select':'none', 'position':'relative', 'margin':'0', 'overflow':'visible'})
				.append('<a id="home_button" class="spriteImage" target="_blank" href="http://www.searchextensions.com"></a>' + 
						'<div id="MMMSearch_setup_tabContainer">' + 
							tabStr +
						'</div>' +
						'<div id="MMMSearch_setup_boxContainer" style="position:relative; z-index:1; left:0; margin: 0 0 5px 50px; border:1px solid gray; overflow:auto; height:318px; font-size:9pt;">' + 
							setupStr + 
						'</div>')
				.hide()
				.prependTo('#MMMSearch_container');
			
			$("#MMMSearch_setup_boxContainer").click (function (event) {
				var searchLabel = $(event.target),
					searchLabelIsEnabled = searchLabel.toggleClass('enabled').hasClass('enabled'),
					searchLabelId = searchLabel.attr('id').substr(5);
				
				if (searchLabelIsEnabled) {
					self.prefs.mySearches[searchLabelId] = 1;
				} else {
					delete (self.prefs.mySearches[searchLabelId]);
				}
				self.savePrefs();
				
				self.redrawIcons();
			});

			$("#MMMSearch_setup_tabContainer")
				.find(".MMMSearch_setup_tab")
					.click(function () {
						self.prefs.tab = $(this).attr('id').substr(3, 100);
						self.savePrefs();
						$("#MMMSearch_setup_tabContainer .active").removeClass("active");
						$("#MMMSearch_setup_boxContainer .MMMSearch_setup_box").slideUp();
						$("#MMMSearch_setup_tabContainer #tab" + self.prefs.tab).addClass("active");
						$("#MMMSearch_setup_boxContainer #box" + self.prefs.tab).slideDown();
					})
					.hover(	function () {$(this).addClass("hover");}, 
							function () {$(this).removeClass("hover");});

							// fill setting tab
			$("#boxsettings")
				.append($('<input />')
					.attr({id:'new_window' ,'type':'checkbox'})
					.change (function () {
						self.prefs.newW = $(this).is(":checked");
						self.savePrefs();
						$('#MMMSearch_container form').attr("target", (self.prefs.newW ? "_blank" : ""));
						self.refreshIcons();
					}))
				.append("&#160;" + self.getTerm("new_window") + "<br /><br />")
				.append($('<input />')
					.attr({'id':'show_labels', 'type':'checkbox'})
					.change (function () {
						self.prefs.labels = $(this).is(":checked");
						self.savePrefs();
						self.redrawIcons();
					}))
				.append("&#160;" + self.getTerm("show_labels") + "<br />")
				.css({'clear':'both', 'text-align':'left', 'font-weight':'bold', 'margin':'10px 5px'});

			if (self.prefs.newW) {
				$("#new_window").attr("checked", "true");
			}
			if (self.prefs.labels) {
				$("#show_labels").attr("checked", "true");
			}
		}
		
		setup.toggle('fast');
		
		/*
		var l = self.getTerm("user_language");
		if (l == "ar" || l == "fr" || l == "it" || l == "ru" || l == "pl" || l == "pt" || l == "no" || l == "unknown" || l == "cn") {
			setup.append("<br><br>Do you want to get this module in your language<br>or with search engines from your country?<br>&raquo; <a href='mailto:madmaxmatze+mysearches@gmail.com' target='_blank'>Just mail me</a> &laquo;");
		}
		*/
	};
	
	
	this.showInfo = function () {
		var infoNr = 27,
		// defines when the infos should get hidden
			endDay = 30,
			endMonth = 10,
			endYear = 2011,
			infoHTML = "<span style='float: left; color:#444; font-size: 85%'>[16th October 2011]</span> The creator of this gadget has launched another free and useful webservice. Check it out: <a href='http://www.wifis.org?lang=en' target='_blank'>www.wifis.org</a>";
		
		// deutsch
		if (self.lang === "de") {
			infoHTML = "<span style='float: left; color:#444; font-size: 85%'>[16. Oktober 2011]</span> Der Entwickler dieses Gadgets hat ein weiteres kostenloses und nützliches Projekt gestartet. Schau' es dir einfach mal an: <a href='http://www.wifis.org?lang=de' target='_blank'>www.wifis.org</a>";
		}

		if ((Number(self.prefs.info) < Number(infoNr) || self.prefs.info === "") 
			&& Date.UTC(endYear, endMonth - 1, endDay) - (new Date()).getTime() > 0) {
			$("#form_container").after('<div id="MMMSearch_infoMessage"><a href="#" id="MMMSearch_infoMessageCloseButton" class="spriteImage"></a>' + infoHTML + '</div>');
			
			$("#MMMSearch_infoMessageCloseButton").click(function () {
				$("#MMMSearch_infoMessage").remove();
				self.prefs.info = infoNr;
				self.savePrefs();
				self.resize();
				return true;
			});
		}
	};

};

var MMMSearchObj = new MMMSearchClass();