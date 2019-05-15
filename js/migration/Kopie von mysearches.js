/* 
	SearchExtension (http://www.searchextensions.com)
	--------------------------------------------------------------------------------------------------------
	Author: MadMaxMatze (http://www.MadMaxMatze.de)
	Copyright: Jun 2006 - Feb 2010
	
	igoogle: http://code.google.com/intl/de-DE/apis/gadgets/docs/reference/
	
	required: jquery, taffydb (http://github.com/typicaljoe/taffydb), js-packer (http://dean.edwards.name/packer/), spritemap generator

	TODO: embed image as binary into js
*/

var MMMSearchClass = function MMMSearch() {
	var _this = this;

	// Environment-PREFS ///////////////////////////////////////////////////////////////////////////////
	this.prefs = null;
	this.savePrefs = function(_prefKey, _value) {
		if (_this.host == 'igoogle') {
			_this.googleGadgetPrefs.set('prefs', encodeURIComponent($.toJSON(_this.prefs)));
		}
	};
	this.getTerm = function (_term) {
		if (_this.host == 'igoogle') {
			return _this.googleGadgetPrefs.getMsg(_term) || _term;
		}
	};
	this.getLang = function () {
		if (_this.host == 'igoogle') {
			return _this.googleGadgetPrefs.getLang();
		}
	}; 
	
	this.init = function() {
		_this.host = 'local';
		_this.path = "";
		
		if (typeof(gadgets) !== 'undefined') {
			_this.host = 'igoogle';
			_this.path = 'http://mysearches.googlecode.com/svn/trunk/';
		    
			_this.googleGadgetPrefs = new gadgets.Prefs();
			var tmpPrefs = _this.googleGadgetPrefs.getString('prefs');
			
			if (tmpPrefs) {
				_this.prefs = $.evalJSON(decodeURIComponent(tmpPrefs));
			} else {
				_this.prefs	= {
					'tab' : _this.googleGadgetPrefs.getString('MMMSearch_active_tab'),
					'mySearches' : {},
					'newW' : (_this.googleGadgetPrefs.getString('MMMSearch_new_window') !== "false"),   // so default is true
					'labels' : (_this.googleGadgetPrefs.getString('MMMSearch_show_labels') == "true"),	// so default is false
					'info' : _this.googleGadgetPrefs.getString('MMMSearch_info')
				};
				
				var tmpEnabledSearches = _this.googleGadgetPrefs.getString('MMMSearch_enabled_searches');
				tmpEnabledSearches = tmpEnabledSearches.split(";");
				$.each(tmpEnabledSearches, function (index, searchId) {
					if (searchId) {_this.prefs.mySearches[searchId] = 1;}
				});
				_this.googleGadgetPrefs.set('MMMSearch_enabled_searches', "");
				_this.savePrefs();
			}
		}
		
		_this.saveToAnalytics();
	
		// sort by cc, type, name
		var compareFunction = function (a, b) {if (a < b) {return -1;} else if (a > b ) {return 1;} else {return 0;}};
		_this.type = {'google':10,'shopping':20,'media':30,'knowledge':40,'portals':50,'xxx':60,'community':70,'diverse':80,'bookmarking':90,'finance':100,'news':110,'programming':120,'torrent':130,'games':140,'wow':150};
		_this.searches.sort(function (a, b) {
			var cmp = compareFunction(a.cc, b.cc);
			if (cmp === 0) {
				cmp = compareFunction(_this.type[a.type], _this.type[b.type]);
				if (cmp === 0) {
					cmp = compareFunction(a.name, b.name);
				}
			}	
			return cmp;
		});
	
	
		// get tabs from searches field
		_this.tabs = [];
		var lastCC;
		var lang = _this.getLang();
		$.each (_this.searches, function (i, search) {
			if (search.cc && search.cc != lastCC) {lastCC = search.cc; _this.tabs.push(search.cc);}
			
			// change link for german users
			if (lang == "de") {
				_this.searches[i].url = _this.searches[i].url.replace(/oogle\.com/, "oogle.de");
				_this.searches[i].surl = _this.searches[i].surl.replace(/oogle\.com/, "oogle.de");
				_this.searches[i].label = _this.searches[i].label.replace(/oogle\.com/, "oogle.de");
			}
		});
		_this.tabs.push('aa');
		_this.tabs.push('settings');
	
		
		var containerStr = '<style>' +
			'html, body, div, span, form, a{margin:0; padding:0; border:0; outline:0; font-size:100%; vertical-align: baseline;	background:transparent;}' +
			':focus {outline: 0;}' +			// gadgets.io.getProxyUrl(    ' + _this.path + 'img/icons.png' + '
			'.spriteImage {background-image:url(http://static.searchextensions.com/icons.png);}' +
			'#settings_button:hover {background-position:' + _this.getIconPos('mmmsearch_settings_active') + ' !important;}' +
			'#home_button:hover {background-position:' + _this.getIconPos('mmmsearch_home') + '; background-repeat:no-repeat; display:block; height:19px; left:-26px; position:absolute; top:1px; width:19px; z-index:10}' +
			'#home_button:hover {background-position:' + _this.getIconPos('mmmsearch_home_active') + ' !important;}' +
			'#MMMSearch_setup_boxContainer .sectionhead {white-space:nowrap; overflow:hidden; font-weight:bold; margin:10px 5px 0 5px; color:white; background-color:gray; padding:1px;}' +
			'#MMMSearch_setup_boxContainer .setupsearchlabel {font-weight:normal; white-space:nowrap; overflow:hidden; cursor:pointer; margin:1px 5px; filter:alpha(opacity=50); opacity: 0.5; -moz-opacity:0.5;}' +
			'#MMMSearch_setup_boxContainer .enabled {filter:alpha(opacity=100); opacity:1; -moz-opacity:1; color:black; font-weight:bold;}' +
			'#MMMSearch_setup_boxContainer .spriteImage {border:0px solid white; margin-left:5px; margin-right:3px; vertical-align:middle; height:16px; width:16px; display:block; float:left;}' +
			'.MMMSearch_setup_tab {background-color:white; width:48px; text-align:center; z-index:2; margin-top:-1px; padding-bottom:1px; position:relative; border-left:1px solid black; border-bottom:1px solid black; border-top:1px solid black; font-size:0pt; line-height:0px; left:1px; color:black; overflow:hidden; white-space:nowrap; cursor:pointer;}' +
			'#MMMSearch_setup_tabContainer .hover {background-color:#e5ecf9;}' +
			'#MMMSearch_setup_tabContainer .active {width:51px; border-right:0px solid #e5ecf9; left:0px;}' +
			'#MMMSearch_setup_tabContainer img {border:0px solid white; margin:1px 0px; margin-left:4px;}' +
			'#MMMSearch_setup_tabContainer .active, #MMMSearch_setup_boxContainer {background-color:#e5ecf9;}' +
			'#MMMSearch_setup_tabContainer , .MMMSearch_setup_tab , #MMMSearch_setup_boxContainer {border-color:#838383;}' +
			'#MMMSearch_searchicons a {float: left; width:16px; height:16px; display: block; border:1px solid white; margin-right:2px; cursor:pointer;}' +
			'#MMMSearch_searchicons a:hover {border:1px solid blue;}' +
			'#MMMSearch_searchicons a div {float: left; width:16px; height:16px;}' +
			'#MMMSearch_searchicons .MMMSearch_devider {float: left; display: block; width: 8px; height: 16px; margin: 1px 3px 1px 0;}'+
		'</style>' +
		'' +
		'<a id="settings_button" class="spriteImage" style="background-position:' + _this.getIconPos('mmmsearch_settings') + '; display:block; position:absolute; left:1px; top:1px; cursor:pointer; height:19px; width:19px; z-index:10;"></a>' +
		'<div id="form_container" style="position:relative; margin:0 0 4px 26px; height:20px">' +
			'<div id="MMMSearch_input_left" class="spriteImage" style="background-position:' + _this.getIconPos('_corners_left') + ';position:absolute;left:0px;top:0px;width:15px;height:20px"></div>' +
			'<div id="MMMSearch_input_center" class="spriteImage" style="background-position:' + _this.getIconPos('mmmsearch_input_middle') + ';position:relative;height:20px;margin:0 10px;">' + 
				'<form id="form" method="get" action="http://www.google.com/search" ' + (_this.prefs.newW ? ' target="_blank" ' : '') + '>' + 
					'<input name="q" id="MMMSearch_textinput" style="font-family:Tahoma; font-size:12px; position:absolute; width:100%; left:0; right:0; padding:0; margin:3px 0 0 0; background-color:transparent; border:0px solid red;" >' +
				'</form>' +
			'</div>' +
			'<div id="MMMSearch_input_right" class="spriteImage" style="background-position:' + _this.getIconPos('_corners_right') + ';position:absolute; right:0px; top:0px; width:15px; height:20px;"></div>' +
		'</div>' + 
		'<div style="clear:both"></div>';

		$('#MMMSearch_container').html(containerStr)
			.resize(function () {
				gadgets.window.adjustHeight($(this).height());
			});
		$('#settings_button').click(_this.showSetup);
		$('#form').submit(function (){_this.saveToAnalytics('aa_google');});
		$('#MMMSearch_textinput')
			.bind('focus blur', function (event) {
				$("#MMMSearch_input_right").css("background-position", _this.getIconPos('_corners_right' + (event.type == "focus" ? '_active': '')));
				$("#MMMSearch_input_left").css("background-position", _this.getIconPos('_corners_left' + (event.type == "focus" ? '_active': '')));
				$("#MMMSearch_input_center").css("background-position", _this.getIconPos('mmmsearch_input_middle' + (event.type == "focus" ? '_active': '')));
			})
			.bind('keyup change', _this.refreshIcons)
			.focus();
		
		_this.redrawIcons();
	};

	this.saveToAnalytics = function (_id) {
		if (typeof _IG_Analytics !== 'undefined') {
			_IG_Analytics('UA-648146-4', '/mysearches' + (_id ? '/' + _id : ''));
		}
	};	

	this.redrawIcons = function () {
		var iconStr = "";
		var lastType = "";
		
		// tooooooo slow!! (need 63ms instead of 1 in ie) 
		// var enabledSearches = _this.searches.get({id:_this.getPrefs('enabled_searches').replace(/\;$/, '').split(/\;/)});
		$.each(_this.searches, function (i, search) {
			if (_this.prefs.mySearches[search.id]) {
				if (lastType != search.type) {
					if (_this.prefs.labels) {
						if (lastType) {
							iconStr += '<br style="clear: both" />';
						}
						iconStr += '<div style="float: left;">' + _this.getTerm('headline_' + search.type ) + ': </div>';
					} else {
						if (lastType) {
							iconStr += '<div class="MMMSearch_devider spriteImage" style="background-position: ' + _this.getIconPos('mmmsearch_divider') + '"></div>';
						}
					}
					lastType = search.type;
				}
				iconStr +=	'<a href="' + search.url + '" rel="' + search.url + '" rev="' + search.surl + '" id="icon' + search.id + '" title="' + search.label + '">' +
								'<div class="spriteImage" style="background-position:' + _this.getIconPos(search) + '"></div>' +
							'</a>';
			}
		});

		if (!lastType) {
			iconStr = iconStr + '<div id="MMMSearch_emptySearchesHint" style="backgroundImage: url(' + gadgets.io.getProxyUrl(_this.path + 'img/mmmsearch_uparrow.gif') + '); background-repeat:no-repeat; background-position:left 2px; color:red; font-size:13pt;	font-weight:bold; padding-left:20px; text-align:left">' + _this.getTerm("button_setup") + '</div>';
		}
		
		var searchiconContainer = $('#MMMSearch_searchicons');
		if (searchiconContainer.length > 0) {
			searchiconContainer.html(iconStr);
		} else {
			iconStr = '<div id="MMMSearch_searchicons" style="font-size:12px; font-weight: bold">' + iconStr + '</div>';
			$('#form_container').after(iconStr);
		}
		
		_this.refreshIcons();
	};
	
	this.getIconPos = function (_key) {
		var icon = (typeof (_key) == "object" ? _this.icons[_key.icon || _key.name] : _this.icons[_key]);
		if (icon) {return "-"+icon.x+"px -"+icon.y+"px";}
	};
	
	this.refreshIcons = function () {
		var inputVal = $('#MMMSearch_textinput').val();
		$('#MMMSearch_searchicons a').each(function () {
			var icon = $(this);
			icon.attr({	'target':(_this.prefs.newW ? "_blank" : ""),
						'href':(inputVal ? icon.attr("rev") + inputVal : icon.attr("rel"))
			});
			
			if (!icon.click) {
				icon.click (function () {
					alert ('sdfsdf');
					_this.saveToAnalytics($(this).attr('id').substr(4, 100));
				});
			}
		});
	};
	
	this.showSetup = function () {
		var setup = $("#MMMSearch_setup_container");
	
		if (!setup.length) {
			var tabStr = "";
			$.each(_this.tabs, function(index, tabId) {
				tabStr += '<div class="MMMSearch_setup_tab' + (tabId == _this.prefs.tab ? ' active' : '') + '" id="tab' + tabId + '">' + 
							(tabId == 'aa' ? '<img src="' + gadgets.io.getProxyUrl(_this.path + 'img/globus.gif') + '" />' : '<div class="spriteImage" style="margin:1px auto 0 auto; height:' + _this.icons[tabId].h + 'px; width:' + _this.icons[tabId].w + 'px; background-position:' + _this.getIconPos(tabId) + '"></div>') +
						'</div>';
			});
					
			// fill all other tabs
			var lastType = "";
			var lastCC = "";
			var boxes = {};
			$.each(_this.searches, function (i, search) {
				var boxId = search.cc ? search.cc : "aa";
				if (!boxes[boxId]) {boxes[boxId] = "";}
				
				if (search.type != lastType || search.cc != lastCC) {
					boxes[boxId] += '<div class="sectionhead">' + _this.getTerm('headline_' + search.type) + "</div>";
					lastType = search.type;
					lastCC = search.cc;
				}
				boxes[boxId] += '<div id="label' + search.id + '" class="setupsearchlabel ' + (_this.prefs.mySearches[search.id] ? "enabled" : "") + '" title="' + search.desc + '">' +
									'<div class="spriteImage" style="background-position:' + _this.getIconPos(search) + '"></div>' +
									search.label +
								'</div>';
			});
			
			boxes.settings = "";
			var setupStr = "";
			$.each (boxes, function (key, boxContent) {
				setupStr += '<div id="box' + key + '" class="MMMSearch_setup_box" style="display: ' + (key == _this.prefs.tab ? 'block' : 'none') + '">' + boxContent + "</div>";
			});
			
			// Setup_container
			setup = $('<div></div>')	
				.attr('id', 'MMMSearch_setup_container')
				.css({'-moz-user-select':'none', 'position':'relative', 'margin':'0 0 5px 50px', 'overflow':'visible'})
				.append('<a id="home_button" class="spriteImage" target="_blank" href="http://www.searchextensions.com"></a>' + 
						'<div id="MMMSearch_setup_tabContainer" style="position:absolute; top:27px; left:-50px; width:51px; z-index:2">' + 
							tabStr +
						'</div>' +
						'<div id="MMMSearch_setup_boxContainer" style="position:relative; z-index:1; left:0; border:1px solid gray; overflow:auto; height:318px; font-size:9pt;">' + 
							setupStr + 
						'</div>')
				.hide()
				.prependTo('#MMMSearch_container');
			
			$("#MMMSearch_setup_boxContainer").click (function (event) {
				var searchLabel = $(event.target);
				var searchLabelIsEnabled = searchLabel.toggleClass('enabled').hasClass('enabled');
				var searchLabelId = searchLabel.attr('id').substr(5);
				
				if (searchLabelIsEnabled) {
					_this.prefs.mySearches[searchLabelId] = 1;
				} else {
					delete (_this.prefs.mySearches[searchLabelId]);
				}
				_this.savePrefs();
				
				_this.redrawIcons();
			});

			$("#MMMSearch_setup_tabContainer")
				.find(".MMMSearch_setup_tab")
					.click(function () {
						_this.prefs.tab = $(this).attr('id').substr(3, 100);
						_this.savePrefs();
						$("#MMMSearch_setup_tabContainer .active").removeClass("active");
						$("#MMMSearch_setup_boxContainer .MMMSearch_setup_box").slideUp();
						$("#MMMSearch_setup_tabContainer #tab" + _this.prefs.tab).addClass("active");
						$("#MMMSearch_setup_boxContainer #box" + _this.prefs.tab).slideDown();
					})
					.hover(	function() {$(this).addClass("hover");}, 
							function() {$(this).removeClass("hover");});
			
			
			// fill setting tab
			$("#boxsettings")
				.append($('<input />')
					.attr({id:'new_window' ,'type':'checkbox'})
					.change (function () {
						_this.prefs.newW = $(this).is(":checked");
						_this.savePrefs();
						$('#MMMSearch_container form').attr("target", (_this.prefs.newW ? "_blank" : ""));
						_this.refreshIcons();
					}))
				.append(_this.getTerm("tab_settings_new_window_for_search") + "<br /><br />")
				.append($('<input />')
					.attr({'id':'show_labels', 'type':'checkbox'})
					.change (function () {
						_this.prefs.labels = $(this).is(":checked");
						_this.savePrefs();
						_this.redrawIcons();
					}))
				.append(_this.getTerm("tab_settings_show_labels") + "<br />")
				.css({'clear':'both', 'text-align':'left', 'font-weight':'bold', 'margin':'10px 5px'});

			if (_this.prefs.newW) {
				$("#new_window").attr("checked", "true");
			}
			if (_this.prefs.labels) {
				$("#show_labels").attr("checked", "true");
			}
		}
		
		setup.toggle('fast');
		
		/*
		var l = _this.getTerm("user_language");
		if (l == "ar" || l == "fr" || l == "it" || l == "ru" || l == "pl" || l == "pt" || l == "no" || l == "unknown" || l == "cn") {
			setup.append("<br><br>Do you want to get this module in your language<br>or with search engines from your country?<br>&raquo; <a href='mailto:madmaxmatze+mysearches@gmail.com' target='_blank'>Just mail me</a> &laquo;");
		}
		*/
	};
};

var MMMSearchObj = new MMMSearchClass();









	
	/*
		var infoNr = 25;
		var infoHTML = "<span style='color:#666;'>3. Oktober 2009:</span> Within the setup there is now beside the HOMEPAGE button a <b>CONTACT-Formular button</b>. So feel free to send your ideas, comment or feature-requests.";

		if (MMMSearch.getTerm("user_language") == "de") {
			infoHTML = "<span style='color:#666;'>3. Oct 2009:</span> Neben dem Homepage Link findet Ihr im Setup-Bereich nun auch einen <b>KONTAKT-LINK</b>. Bitte nutzt ihn, um mir Kommentare, Ideen oder Wünsche bezüglich dieses Modules zu schicken.";
		}
      
        // infoHTML += "<br><div style='height: 208px; width: 100%; background: url" + "(" + MMMSearch.getPrefs("path") + "img/feliz.png) center center no-repeat; display: block'> </div>";
    
		// defines when the infos should get hidden
		var endDay = 12;
		var endMonth = 10;
		var endYear = 2009;

		if ((parseInt(MMMSearch.getPrefs('info')) < parseInt(infoNr) || MMMSearch.getPrefs('info') == "") 
            && Date.UTC(endYear, endMonth - 1, endDay) - (new Date()).getTime() > 0) {
			if (MMMSearch.getEnabledSearchesString() != "") {
				var msg = new _IG_MiniMessage(_this.moduleId);
				var div = document.createElement("div");
				div.innerHTML = infoHTML;
				var statusMsg =  msg.createDismissibleMessage(div, 
					function () {
						MMMSearch.setPrefs('info', infoNr);
						_this.adjustIFrameHeight();
						return true;
					}
				);		
				statusMsg.style.padding = "2px";
				statusMsg.style.marginBottom = "5px";
				statusMsg.style.backgroundColor = "white";
			}
		}
	
	*/
	