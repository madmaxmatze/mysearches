
/* 
	SearchExtension (http://www.searchextensions.com)
	--------------------------------------------------------------------------------------------------------
	Author: MadMaxMatze (http://www.MadMaxMatze.de)
	Copyright: Jun 2006 - Feb 2010
	
	igoogle: http://code.google.com/intl/de-DE/apis/gadgets/docs/reference/
	
	required: jquery, taffydb (http://github.com/typicaljoe/taffydb), js-packer (http://dean.edwards.name/packer/), spritemap generator
*/

var MMMSearchClass = function MMMSearch() {
	var _this = this;

	// Environment-PREFS ///////////////////////////////////////////////////////////////////////////////
	this.prefs = null;
	this.getPrefs = function (_prefname) {return _this.prefs.getString('MMMSearch_' + _prefname);};
	this.setPrefs = function(_pref, _value) {_this.prefs.set('MMMSearch_' + _pref, _value.toString());};
	this.getTerm = function (_term) {return _this.prefs.getMsg(_term) || _term;};
		
	this.init = function() {
		_this.host = 'local';
		_this.path = "";
		
		if (typeof(_IG_Prefs) !== 'undefined') {
			_this.host = 'igoogle';
			_this.path = 'http://mysearches.googlecode.com/svn/trunk/';
		    _this.saveToAnalytics();
		}
		
		if (!_this.prefs) {
			_this.prefs = new gadgets.Prefs();
		}
		
		// sort by cc, type, name
		var compareFunction = function (a, b) {if (a < b) {return -1;} else if (a > b ) {return 1;} else {return 0;}};
		_this.type = ['google','shopping','media','knowledge','portals','xxx','community','diverse','bookmarking','finance','news','programming','torrent','games','wow'];
		_this.searches.orderBy(function (a, b) {
			var cmp = compareFunction(a.cc, b.cc);
			if (cmp === 0) {
				cmp = compareFunction(jQuery.inArray(a.type, _this.type), jQuery.inArray(b.type, _this.type));
				if (cmp === 0) {
					cmp = compareFunction(a.name, b.name);
				}
			}	
			return cmp;
		});
		
		// set enabled = true attrbute to all tupel saved as enabled in config
		_this.searches.update({enabled:true}, {id:_this.getPrefs('enabled_searches').replace(/\;$/, '').split(/\;/)});

		// get tabs from searches field
		_this.tabs = _this.searches.uniqueValues('cc', {'cc':{'length':2}});
		_this.tabs = $.merge(_this.tabs, ['aa', 'settings']);
		
		/*
		if (_this.getTerm("user_language") == "de") {
			s.setUrl(s.getUrl().replace(/oogle\.com/, "oogle.de"));
			s.setSearchUrl(s.getSearchUrl().replace(/oogle\.com/, "oogle.de"));
			s.setName(s.getName().replace(/oogle\.com/, "oogle.de"));
		}
		*/
		
		// css
		var container = $('#MMMSearch_container')
			.hide()
			// gadgets.io.getProxyUrl(
			.html('<style>' +
				'html, body, div, span, form, a{margin:0; padding:0; border:0; outline:0; font-size:100%; vertical-align: baseline;	background:transparent;}' +
				':focus {outline: 0;}' +
				'.spriteImage {background-image:url(' + gadgets.io.getProxyUrl(_this.path + 'img/icons.png') + ');}' +
				'#MMMSearch_setup_boxContainer .sectionhead {white-space:nowrap; overflow:hidden; font-weight:bold; margin:10px 5px 0 5px; color:white; background-color:gray; padding:1px;}' +
				'#MMMSearch_setup_boxContainer .setupsearchlabel {white-space:nowrap; overflow:hidden; cursor:pointer; margin:1px 5px;}' +
				'#MMMSearch_setup_boxContainer .enabled {color:black; font-weight:bold;}' +
				'#MMMSearch_setup_boxContainer .spriteImage {border:0px solid white; margin-left:5px; margin-right:3px; vertical-align:middle; height:16px; width:16px; display:block; float:left;}' +
				'.MMMSearch_setup_tab {background-color:white; width:48px; text-align:center; z-index:2; margin-top:-1px; padding-bottom:1px; position:relative; border-left:1px solid black; border-bottom:1px solid black; border-top:1px solid black; font-size:0pt; line-height:0px; left:1px; color:black; overflow:hidden; white-space:nowrap; cursor:pointer;}' +
				'#MMMSearch_setup_tabContainer .hover {background-color:#e5ecf9;}' +
				'#MMMSearch_setup_tabContainer .active {width:51px; border-right:0px solid #e5ecf9; left:0px;}' +
				'#MMMSearch_setup_tabContainer img {border:0px solid white; margin:1px 0px; margin-left:4px;}' +
				'#MMMSearch_setup_tabContainer .active, #MMMSearch_setup_boxContainer {background-color:#e5ecf9;}' +
				'#MMMSearch_setup_tabContainer , .MMMSearch_setup_tab , #MMMSearch_setup_boxContainer {border-color:#838383;}' +
				'#MMMSearch_searchicons a {float: left; width:16px; height:16px; display: block; border:1px solid white; margin-right:2px; cursor:pointer;}' +
				'#MMMSearch_searchicons a div {float: left; width:16px; height:16px;}' +
				'#MMMSearch_searchicons .MMMSearch_devider {float: left; display: block; width: 8px; height: 16px; margin-right: 3px;}'+
			'</style>');
			
		container.resize(function () {
			gadgets.window.adjustHeight();
		});
		
		
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
	
		// setup_button
		$('<a></a>')
			.addClass("spriteImage")
			.hover(	function () {$(this).css("background-position", _this.getIconPos('mmmsearch_settings_active'));}, 
					function () {$(this).css("background-position", _this.getIconPos('mmmsearch_settings'));})
			.css({
				'background-position':_this.getIconPos('mmmsearch_settings'),
				'display':'block',
				'position':'absolute',
				'left':'1px',
				'top':'1px',
				'cursor':'pointer',
				'height':'19px',
				'width':'19px',
				'z-index':'10'
			})
			.click (_this.showSetup)
			.appendTo(container);
					
		// input_container
		$('<div></div>')	
			.css({'position':'relative', 'margin':'0 0 4px 26px', 'height':'20px'})
			.append($('<div></div>')	
				.attr('id', 'MMMSearch_input_left')
				.css({"background-position":_this.getIconPos('_corners_left'), 'position':'absolute', 'left':'0px', 'top':'0px', 'width':'15px', 'height':'20px'})
				.addClass('spriteImage'))
			.append ($('<div></div>')	
				.attr('id', 'MMMSearch_input_center')
				.css({"background-position":_this.getIconPos('mmmsearch_input_middle'), 'position':'relative', 'height':'20px', 'margin':'0 10px'})
				.addClass('spriteImage'))	
			.append($('<div></div>')	
				.attr('id', 'MMMSearch_input_right')
				.css({"background-position":_this.getIconPos('_corners_right'), 'position':'absolute', 'right':'0px', 'top':'0px', 'width':'15px', 'height':'20px'})
				.addClass('spriteImage'))
			.appendTo(container);			
	
			
		// form
		$('<form></form>')
			.attr ({'method' : 'get', 'action' : 'http://www.google.com/search', 'target':(_this.getPrefs('new_window') !== "false" ? "_blank" : "")})
			.submit(function (){
				_this.saveToAnalytics('aa_google');
			})
			.append (
				$('<input></input>')
					.attr('name', 'q')
					.attr('id', 'MMMSearch_textinput')
					.css({
						'font-family':'Tahoma',
						'font-size':'12px',
						'position':'absolute',
						'width':'100%',
						'left':'0',
						'right':'0',
						'padding':'0',
						'margin':'3px 0 0 0',
						'background-color':'transparent',
						'border':'0px solid red'
					})
					.focus (function () {
						$("#MMMSearch_input_right").css("background-position", _this.getIconPos('_corners_right_active'));
						$("#MMMSearch_input_left").css("background-position", _this.getIconPos('_corners_left_active'));
						$("#MMMSearch_input_center").css("background-position", _this.getIconPos('mmmsearch_input_middle_active'));
					})
					.blur (function () {
						$("#MMMSearch_input_right").css("background-position", _this.getIconPos('_corners_right'));
						$("#MMMSearch_input_left").css("background-position", _this.getIconPos('_corners_left'));
						$("#MMMSearch_input_center").css("background-position", _this.getIconPos('mmmsearch_input_middle'));
					})
					.bind('keyup change', _this.refreshIcons)
			)
			.appendTo("#MMMSearch_input_center");
		
		_this.redrawIcons();
		
		$('#MMMSearch_container').fadeIn();
	};

	this.saveToAnalytics = function (_id) {
		if (typeof _IG_Analytics !== 'undefined') {
			_IG_Analytics('UA-648146-4', '/mysearches' + (_id ? '/' + _id : ''));
		}
	};	

	this.redrawIcons = function () {
		var searchiconContainer = $('#MMMSearch_searchicons');
		
		if (searchiconContainer.length) {
			searchiconContainer.html("");
		} else {
			searchiconContainer = $('<div></div>')	
									.attr('id', 'MMMSearch_searchicons')
									.css({'font-size':'12px', 'font-weight':'bold'})
									.appendTo('#MMMSearch_container');					
		}
		
		var lastType = "";

		var enabledSearches = _this.searches.get(_this.searches.find({enabled:true}));
		$.each(enabledSearches, function (i, search) {
			if (lastType != search.type) {
				if (_this.getPrefs("show_labels") == "true") {
					if (lastType) {
						searchiconContainer.append('<br style="clear: both" />');
					}
					searchiconContainer.append("<div style='float: left'>" + _this.getTerm( "headline_" + search.type ) + ": </div>");
				} else {
					if (lastType) {
						$('<div></div>')
							.addClass('MMMSearch_devider spriteImage')
							.css("background-position", _this.getIconPos('mmmsearch_divider'))
							.appendTo(searchiconContainer);
					}
				}
				lastType = search.type;
			}
		
			$('<a></a>')
				.data({'surl': search.surl, 'url': search.url})
				.attr({"id":"icon"+search.id,
					title:search.label
				})
				.click (function () {
					_this.saveToAnalytics(search.id);
				})
				.append($('<div></div>')	
					.addClass('spriteImage')
					.css("background-position" , _this.getIconPos(search))
				)
				.hover(	function () {$(this).css({'border':'1px solid blue'});},
						function () {$(this).css({'border':'1px solid white'});})
				.appendTo(searchiconContainer);
		});
		
		_this.refreshIcons();
		
		if (!enabledSearches.length) {
			$('<div>' + _this.getTerm("button_setup") + '</div>')	
				.css('backgroundImage', 'url(' + _this.path + 'img/mmmsearch_uparrow.gif)')
				.attr('id', 'MMMSearch_emptySearchesHint')
				.addClass('MMMSearch_emptySearchesHint')	
				.css({
					'background-repeat':'no-repeat',
					'background-position':'left 2px',
					'color':'red',
					'font-size':'13pt',
					'font-weight':'bold',
					'padding-left':'20px',
					'text-align':'left'
				})
				.appendTo(searchiconContainer);					
		}
	};
	
	this.getIconPos = function (_key) {
		var icon = (typeof (_key) == "object" ? _this.icons[_key.icon || _key.name] : _this.icons[_key]);
		if (icon) {return "-"+icon.x+"px -"+icon.y+"px";}
	};
	
	this.refreshIcons = function () {
		var inputVal = $('#MMMSearch_textinput').val();
		$('#MMMSearch_searchicons .icons').each(function () {
			var icon = $(this);
			icon.attr({	'target':(_this.getPrefs("new_window") !== "false" ? "_blank" : ""),
						'href' : (inputVal ? icon.data('surl') + inputVal : icon.data('url'))
			});
		});
	};
	
	this.showSetup = function () {
		var setup = $("#MMMSearch_setup_container");
		
		if (!setup.length) {
			// Setup_container
			setup = $('<div></div>')	
				.attr('id', 'MMMSearch_setup_container')
				.css({'-moz-user-select':'none', 'position':'relative', 'margin':'0 0 5px 50px', 'overflow':'visible'})
				.hide()
				.prependTo('#MMMSearch_container');
		
			// homebutton	
			
			setup.append($('<a></a>')
							.attr({'target':'_blank', 'href':'http://www.searchextensions.com'})
							.addClass('spriteImage')
							.hover(	function () {$(this).css("background-position", _this.getIconPos('mmmsearch_home_active'));}, 
									function () {$(this).css("background-position", _this.getIconPos('mmmsearch_home'));})
							.css({
								'background-position':_this.getIconPos('mmmsearch_home'),
								'background-repeat':'no-repeat',
								'display':'block',
								'height':'19px',
								'left':'-26px',
								'position':'absolute',	
								'top':'1px',
								'width':'19px',
								'z-index':'10'
							}));
							
			var MMMSearch_setup_tabContainer = $('<div></div>')
				.attr({'id':'MMMSearch_setup_tabContainer'})
				.css({'position':'absolute', 'top':'27px', 'left':'-50px', 'width':'51px', 'z-index':2})
				.appendTo(setup);
			
			var MMMSearch_setup_boxContainer = $('<div></div>')
				.attr({'id':'MMMSearch_setup_boxContainer'})
				.css({'position':'relative', 'z-index':1, 'left':0,	'border':'1px solid gray', 'overflow':'auto', 'height':'318px', 'font-size':'9pt'})
				.appendTo(setup);
			
			var boxes = {};
			$.each(_this.tabs, function(index, tabId) {
				var thisTab = $('<div></div>')
					.data('tabId', tabId)
					.attr({'id':"tab"+tabId})
					.addClass('MMMSearch_setup_tab')
					.click(function () {
						var activeTab = $(this).data('tabId');
						_this.getPrefs("active_tab", activeTab);
						$("#MMMSearch_setup_tabContainer .active").removeClass("active");
						$("#MMMSearch_setup_boxContainer .MMMSearch_setup_box").slideUp();
						$("#MMMSearch_setup_tabContainer #tab" + activeTab).addClass("active");
						$("#MMMSearch_setup_boxContainer #box" + activeTab).slideDown();
					})
					.hover(	function() {$(this).addClass("hover");}, 
							function() {$(this).removeClass("hover");})
					.appendTo(MMMSearch_setup_tabContainer);

				if (tabId == "aa") {
					$('<img></img>')
						.attr({'src':_this.path + "img/globus.gif"})
						.appendTo(thisTab);
				} else {
					$('<div></div>')
						.addClass('spriteImage')
						.css({'margin' : '1px auto 0 auto', 'height':_this.icons[tabId].h + 'px', 'width':_this.icons[tabId].w + 'px', "background-position":_this.getIconPos(tabId)})
						.appendTo(thisTab);
				}
				
				boxes[tabId] = $('<div></div>')
					.attr({'id':'box'+tabId})
					.addClass('MMMSearch_setup_box')
					.hide()
					.appendTo(MMMSearch_setup_boxContainer);
			});

			// fill setting tab
			var boxsettings = $("#boxsettings")
				.append($('<input />')
					.attr({'type':'checkbox', 'checked' : (_this.getPrefs('new_window') !== "false")})
					.change (function () {
						var openInNewWindow = $(this).is(":checked");
						_this.setPrefs("new_window", openInNewWindow);
						$('#MMMSearch_container form').attr("target", (openInNewWindow ? "_blank" : ""));
						_this.refreshIcons();
					}))
				.append(_this.getTerm("tab_settings_new_window_for_search") + "<br /><br />")
				.append($('<input />')
					.attr({'type':'checkbox'})
					.change (function () {
						_this.setPrefs("show_labels", $(this).is(":checked"));
						_this.redrawIcons();
					}))
				.append(_this.getTerm("tab_settings_show_labels") + "<br />")
				.css({'clear':'both', 'text-align':'left', 'font-weight':'bold', 'margin':'10px 5px'});

			
			// fill all other tabs
			var lastType = "";
			var lastCC = "";
			_this.searches.forEach(function (search, i) {
				if (search.type != lastType || search.cc != lastCC) {
					$('<div></div>')
						.addClass('section')
						.append('<div class="sectionhead">' + _this.getTerm('headline_' + search.type) + '</div>')
						.appendTo(boxes[search.cc ? search.cc : "aa"]);
					lastType = search.type;
					lastCC = search.cc;
				}
			
				$('<div></div>')
					.data({id:search.id})
					.addClass('setupsearchlabel ' + (search.enabled ? "enabled" : ""))
					.attr({'title' : search.desc})
					.append($(
						$('<div></div>')	
							.addClass('spriteImage')
							.css({"background-position":_this.getIconPos(search)})
					))
					.append(search.label)
					.click(function () {
						var searchLabel = $(this);
						var isEnabled = searchLabel.toggleClass('enabled').hasClass('enabled');
						_this.searches.update({enabled:isEnabled},{id:searchLabel.data('id')});
						
						var enabledSearchesString = "";
						$.each(_this.searches.get(_this.searches.find({enabled:true})), function (index, search) {
							enabledSearchesString += (enabledSearchesString ? ";" : "") + search.id;
						});
						
						_this.setPrefs("enabled_searches", enabledSearchesString);
						_this.redrawIcons();
						
						searchLabel.fadeTo(0, (isEnabled ? 1 : 0.5));
					})
					.fadeTo(0, (search.enabled ? 1 : 0.5))
					.appendTo(boxes[search.cc ? search.cc : "aa"]);
			});
					
					
			var activeTab = _this.getPrefs("active_tab");			
			$("#tab" + (activeTab ? activeTab : "aa")).click();
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
MMMSearchObj.init();