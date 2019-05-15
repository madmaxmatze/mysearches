/* ***************************************************************************************************************************************************
	mySearches - Homepage Widget (http://mysearches.madmaxmatze.de) - for iGoogle
	--------------------------------------------------------------------------------------------------------
	Author: madmaxmatze (http://www.MadMaxMatze.de)
	Copyright: Jun 2006 - Jan 2008
	r335
  
	packer: http://dean.edwards.name/packer/
*************************************************************************************************************************************************** */

/* ***************************************************************************************************************************************************
	mySearches - Homepage Widget (http://mysearches.madmaxmatze.de) - for iGoogle
	--------------------------------------------------------------------------------------------------------
	Author: madmaxmatze (http://www.MadMaxMatze.de)
	Copyright: Jun 2006 - Jan 2008
	r335
  
	packer: http://dean.edwards.name/packer/
*************************************************************************************************************************************************** */

// http://code.google.com/intl/de-DE/apis/gadgets/docs/reference/

// http://github.com/typicaljoe/taffydb


/**
 *Search object represents one of the searches  
 */	
function MMMSearch_Search(_id, _section, _tab) {
	var id = _id;
	this.getId = function () {return id;};
	this.setId = function (_in) {id = _in;};

	this.getGeneralId = function () {return id.substr(3, 100);};
	
	var section = _section;
	this.getSection = function () {return section;};
	this.setSection = function (_section) {id = _section;};
	
	var tab = _tab;
	this.getTab = function () {return tab;};
	
	var name = "";
	this.getName = function () {return name;};
	this.setName = function (_in) {name = _in;};
	
	var url = "";
	this.getUrl = function () {return url;};
	this.setUrl = function (_in) {url = _in;};

	var searchUrl = "";
	this.getSearchUrl = function () {return searchUrl;};
	this.setSearchUrl = function (_in) {searchUrl = _in;};
	
	var description = "";
	this.getDescription = function () {return description;};
	this.setDescription = function (_in) {description = _in;};
	
	var enabled = false;
	this.isEnabled = function () {return enabled;};
	this.setEnabled = function(_in) {enabled = _in;};	
}


/**
 *Section object to create tab-structure and store searches
 */	
function MMMSearch_Section(_id, _tabid) {
	var id = _id;
	this.getId = function () {return id;};
	var tabId = _tabid;
	
	var searches = {};
	this.getSearches = function () {return searches;};
	this.addSearch = function(_searchId) {						// add a search to section
		searches[_searchId] = new MMMSearch_Search(_searchId, id, tabId);
		return searches[_searchId];
	};
}


/**
 *Tab object to create tab-Structure and store sections
 */	
function MMMSearch_Tab(_id) {
	var id = _id;
	this.getId = function () {return id;};
	
	var name = "";
	this.getName = function () {return name;};	
	this.setName = function (_in) {name = _in;};	

	var hovered = false;
	this.isHovered = function () {return hovered;};	
	this.setHovered = function (_in) {hovered = _in;};	
	
	var active = false;
	this.isActive = function () {return active;};	
	this.setActive = function (_in) {active = _in;};	
	
	var sections = [];
	this.getSections = function () {return sections;};
	this.addSection = function (_id) {					// add a section to a tab in the setup
		sections[_id] = new MMMSearch_Section(_id, this.getId());
		return sections[_id];
	};
}


/**
 * Wrapper for entire application logic
 * provides common interface to all funtions of the search module and User Prefs
 */	
function MMMSearch() {
	var	HTMLBuilder = new MMMSearch_HTMLBuilder(this);
	var _this = this;
	
	var sections = [
		"google",
		"shopping",
		"media",
		"knowledge", 
		"portals",
		"xxx",
		"community", 
		"diverse", 
		"bookmarking", 
		"finance", 
	 	"news", 
		"programming", 
		"torrent",
		"games", 
		"wow"
	];
	
	// substitute method for a real constructor 
	this.startModule = function(_host, _moduleId) {
		host = _host;
		moduleId = _moduleId;
		if (host == "local") {_this.loadPrefs(new MMMDummyPrefs());}
		if (host == "google") {_this.loadPrefs(new _IG_Prefs(moduleId));} 

		if (host == "google") {
            _this.saveToAnalytics();
        }

		// if the depot is started for the first time, set initial value for new_window
		if(_this.getPrefs("new_window") === "") {
			_this.setPrefs("new_window", "true");	
		}
		
		var activeTab = _this.getPrefs("active_tab");
		if (activeTab === "") {activeTab = "aa";}			// first show general search engines
		_this.addTab("settings");
		_this.setActiveTab(tabs[activeTab]);							// sets active tab

		// _this.sortSearches();		
		
		// sets some additional parameters to searches
		var es = _this.getPrefs("enabled_searches");
		for (var search in searches) {
			if (typeof searches[search] == "object") {
				var s = searches[search];
				
				 // pref.getLang()    getCountry()   --> http://code.google.com/intl/de-DE/apis/gadgets/docs/reference/#gadgets.Prefs
				
				if (_this.getTerm("user_language") == "de") {
					s.setUrl(s.getUrl().replace(/oogle\.com/, "oogle.de"));
					s.setSearchUrl(s.getSearchUrl().replace(/oogle\.com/, "oogle.de"));
					s.setName(s.getName().replace(/oogle\.com/, "oogle.de"));
				}
				s.setEnabled(es.search(search) != -1);		// enable or disable searches
			}
		}
		
		_this.showModel();
		// HTMLBuilder.showModule();
      //  HTMLBuilder.getHtmlObj("input").focus();
	};


	
	// SEARCHES /////////////////////////////////////////////////////////////////////
	var searches = {};
	this.getSearches = function () {return searches;};
	this.addSearch = function(_id, _name, _url, _searchUrl, _description) {				// pass addSearch method call to tab object - and then down to a section
		if (lastSection) {
			var fullId = lastTab.getId() + "_" + _id;
			searches[fullId] = lastSection.addSearch(fullId);
			searches[fullId].setName(_name);
			searches[fullId].setUrl(_url);
			searches[fullId].setSearchUrl(_searchUrl);
			searches[fullId].setDescription(_description);
		}
	};
	this.getEnabledSearchesString = function () {		// returns a string with all active searches, seperated by a semicolon (needed to save which searches are active)
		var enabledSearches = this.getEnabledSearches();
		var enabledSearchesString = "";
		var error = false;
		for (var id in enabledSearches) {
			if (enabledSearchesString.length < 1000) {
				enabledSearchesString += id + ";";
			} else {
				error = true;
			}
		}
		if (error) {
			alert ("You enabled to many searches - because of limitations from google some of them might not be saved.");
		}
		return enabledSearchesString;
	};
	
	this.getEnabledSearches = function () {		// returns a string with all active searches, seperated by a semicolon (needed to save which searches are active)
		var enabledSearches = {};
		$.each(_this.getSearches(), function(key, search) { 
			if (search.isEnabled()) {
				enabledSearches[key] = search;
			}
		});
		return enabledSearches;
	};
	this.setAllSearchesInTabEnabled = function(_tab, _enabled) {			// changes active state of all searches of a tab 
		var sections = _tab.getSections();
		for (var section in sections) {
			if (typeof sections[section] == "object") {
				var searches = sections[section].getSearches();
				for (var search in searches) {
					if (typeof searches[search] == "object") {
						searches[search].setEnabled(_enabled); 
						HTMLBuilder.refreshSearch(searches[search]);
					}
				}
			}
		}
		this.setPrefs ("enabled_searches", this.getEnabledSearchesString());
		HTMLBuilder.refreshContent();
	};
	this.flipSearchEnabled = function (_search) {					// change enable state of one search to the opposite
		_search.setEnabled(!_search.isEnabled()); 
		HTMLBuilder.refreshSearch(_search);
		HTMLBuilder.refreshContent();
		_this.setPrefs("enabled_searches", this.getEnabledSearchesString());
	};
	this.sortSearches = function () {					// sort Searches by ID
		var tmpSearches = {};
		for (var search in searches) {
			if (typeof searches[search] == "object") {
				tmpSearches[tmpSearches.length] = searches[search];			// build field for searching
			}
		}
		for (var i = 0; i < tmpSearches.length; i++) {		
			for (var j = i + 1; j < tmpSearches.length; j++) {		
				if (tmpSearches[i].getId().substring(3, 100) > tmpSearches[j].getId().substring(3, 100)) {
					var tmp = tmpSearches[i];
					tmpSearches[i] = tmpSearches[j];
					tmpSearches[j] = tmp;
				}
			}
		}

		
		searches =  {};
		var grouping = true;
		if (grouping) {
			for (i = 0; i < sections.length; i++) {		
				for (var k = 0; k < tmpSearches.length; k++) {		
					if (tmpSearches[k].getSection() == sections[i]) {
						searches[tmpSearches[k].getId()] = tmpSearches[k];
						tmpSearches.splice(k--, 1);
					}
				}
			}
		} else {
			for (i = 0; i < tmpSearches.length; i++) {		
				searches[tmpSearches[i].getId()] = tmpSearches[i];
			}
		}
	};
	
	
	
	// TAB ///////////////////////////////////////////////////////////////////
	var tabs = [];
	var lastTab = null;
	this.getTabs = function () {return tabs;};
	this.addTab = function(_tabId) {				
		tabs[_tabId] = new MMMSearch_Tab(_tabId);
		lastTab = tabs[_tabId];
	};
	var activeTab = null;
	this.getActiveTab = function () {return activeTab;};
	this.setActiveTab = function (_newActiveTab) {					// switch active tab
		if (activeTab != _newActiveTab) {
			_newActiveTab.setActive(true);
			
			if (activeTab) {
				activeTab.setActive(false);
				HTMLBuilder.refreshTab(activeTab);	
				HTMLBuilder.refreshTab(_newActiveTab);	
				HTMLBuilder.changeBox(_newActiveTab);
			}
			
			activeTab = _newActiveTab;
			_this.setPrefs('active_tab', _newActiveTab.getId());
		}
	};
	this.setHtml = function(_html) {lastTab.setHtml(_html);};	// pass addhtml method call to tab object
	this.addSection = function(_sectionName) {
		if (lastTab) {
			lastSection = lastTab.addSection(_sectionName);
		}
	};	// pass addsection method call to tab object

	

	
	// Environment-PREFS ///////////////////////////////////////////////////////////////////////////////
	var MMMSearch_prefs = null;
	var moduleId = "";
	var host = "";
	this.getPrefs = function (_prefname) {
		if (_prefname == "moduleId") {return moduleId;}
		if (_prefname == "host") {return host;}
		if (_prefname == "path") {
			// return "http://mysearches.googlecode.com/svn/trunk/";
			return (host == "local" ? "" : "http://mysearches.googlecode.com/svn/trunk/");
		}
	
		if (host == "netvibes") {
			var returnStr = widget.getValue("MMMSearch_" + _prefname);
			return (returnStr === null ? "" : returnStr);
		}
		if (host == "google" || host == "local") {return MMMSearch_prefs.getString("MMMSearch_" + _prefname);}
	};
	this.setPrefs = function(_pref, _value) {
		if (host == "netvibes") {
			widget.setValue("MMMSearch_" + _pref, _value);
		}
		if (host == "google" || host == "local") {
			MMMSearch_prefs.set("MMMSearch_" + _pref, _value);
		}
	};
	this.loadPrefs = function (_prefs) {MMMSearch_prefs = _prefs;};
	this.getTerm = function (_term) {
		var retVal = MMMSearch_prefs.getMsg(_term);
		return (retVal ? retVal : _term);
	};
	


	this.saveToAnalytics = function (_id) {
		if (typeof _IG_Analytics != 'undefined') {
			_IG_Analytics('UA-648146-4', '/mysearches' + (_id ? '/' + _id : ''));
		}
	};	
	
	
	// EVENTS ////////////////////////////////////////////////////////////////////////////////////////////////
	this.setOpenInNewWindow = function (_openInNewWindow) {			// change target='' property of all searches and the form
		this.setPrefs("new_window", _openInNewWindow);
		HTMLBuilder.refreshContent();
	};
	this.setShowLabels = function (_showLabels) {			// change target='' property of all searches and the form
		this.setPrefs("show_labels", _showLabels);
		HTMLBuilder.refreshContent();
	};
	
	
	
	
	this.showModel = function () {
		_this.spriteImage = _IG_GetCachedUrl(_this.getPrefs("path") + "img/icons.png");
		
		// css
		$("#MMMSearch_container").html("<style>\
			.spriteImage {background-image: url(" + _this.spriteImage + ");}\
			#MMMSearch_input_right {background-position: -" + (iconsMatching["mmmsearch_input_corners"]['x'] + 20) + "px -" + iconsMatching["mmmsearch_input_corners"]['y'] + "px;}\
			#MMMSearch_setup_button {background-position: -" + iconsMatching["mmmsearch_settings"]['x'] + "px -" + iconsMatching["mmmsearch_settings"]['y'] + "px;}\
			#MMMSearch_setup_button:hover {background-position: -" + iconsMatching["mmmsearch_settings_active"]['x'] + "px -" + iconsMatching["mmmsearch_settings_active"]['y'] + "px;}\
		</style>");
	
	
		// setup_button
		$('<a></a>')
			.attr("id", "MMMSearch_setup_button")
			.addClass("MMMSearch_setup_button spriteImage")
			.click (function () {
				alert ("dsfdsf");
			})
			.appendTo("#MMMSearch_container");
		//this.setEvent(div, "onmouseover", function () {_this.changeSetupButton(true);});
		//this.setEvent(div, "onmouseout", function () {_this.changeSetupButton(false);});
	//	this.setEvent(div, "onmousemove", function (e) {_this.onmousemove (e);});	
	
	
		// form
		//if (MMMSearch.getPrefs("new_window")) {this.setAttribute(form, "target", "_blank");}	
		$('<form></form>')
			.attr ({'method' : 'get', 'action' : 'http://www.google.com/search'})
			.submit(function (){
				_this.saveToAnalytics('aa_google');}
			)
			.appendTo("#MMMSearch_container");

			
		// input_container
		$('<div></div>')	
			.attr('id', 'MMMSearch_input_container')
			.addClass('MMMSearch_input_container spriteImage')
			.appendTo('#MMMSearch_container form');			
	
		$('<div></div>')	
			.attr('id', 'MMMSearch_input_right')
			.addClass('MMMSearch_input_right spriteImage')	
			.appendTo('.MMMSearch_input_container');			

		$('<div></div>')	
			.attr('id', 'MMMSearch_input_left')
			.addClass('MMMSearch_input_left spriteImage')	
			.appendTo('.MMMSearch_input_container');			
		
		//.attr("value", MMMSearch_inputText)
		$('<input></input>')
			.attr('name', 'q')
			.attr('id', 'MMMSearch_textinput')
			.addClass('MMMSearch_textinput')	
			.focus(function () {_this.onFocusInput(true);})
			.blur(function () {_this.onFocusInput(false);})
			.bind('keyup change', function () {_this.refreshAllSearchesLink();})
			.appendTo('.MMMSearch_input_container');	
			
			
		$('<div></div>')	
			.attr('id', 'MMMSearch_searchicons')
			.addClass('MMMSearch_searchicons')	
			.appendTo('#MMMSearch_container form');					
			
		_this.addIcons();
	};
	
	
	this.addIcons = function () {
		var enabledSearches = _this.getEnabledSearches();
		var enabledSearchesCount = 0;
		var lastSection = "";
		
		$.each(enabledSearches, function(key, search) { 
			if (search.isEnabled()) {
				$('#MMMSearch_searchicons').append(search);
			
				if (lastSection != search.getSection()) {
					if (_this.getPrefs("show_labels") == "true") {
						if (lastSection) {
							$('#MMMSearch_searchicons').append("<br>");
						}
						$('#MMMSearch_searchicons').append(MMMSearch.getTerm( "headline_" + search.getSection() ) + ": ");
					} else {
						if (lastSection) {
							$('<div></div>')
								.addClass('MMMSearch_devider spriteImage')
								.css("background-position" , "-" + iconsMatching['mmmsearch_divider']['x'] + "px -" + iconsMatching['mmmsearch_divider']['y'] + "px")
								.appendTo("#MMMSearch_searchicons");
						}
					}
					lastSection = search.getSection();
				}
				
				$('<a></a>')
					.attr("id", "icon" + search.getId())
					.addClass('icons spriteImage')
					.click (function () {
						_this.saveToAnalytics(search.getId());
					})
					.css("background-position" , "-" + iconsMatching[search.getGeneralId()]['x'] + "px -" + iconsMatching[search.getGeneralId()]['y'] + "px")
					.appendTo("#MMMSearch_searchicons");
			
					//this.setEvent (link, "onmouseover", function () {_this.onmouseover (_search.getName());});	
					//this.setEvent (link, "onmousemove", function (e) {_this.onmousemove (e);});	
					//this.setEvent (link, "onmouseout", function () {_this.onmouseout ();});	
					// if (MMMSearch.getPrefs("new_window")) {this.setAttribute(link, "target", "_blank");}
				
				enabledSearchesCount++;
			}
			
		});
		
		if (!enabledSearchesCount) {
			$('<div>' + _this.getTerm("button_setup") + '</div>')	
				.css('backgroundImage', 'url(' + _this.getPrefs('path') + 'img/mmmsearch_uparrow.gif)')
				.attr('id', 'MMMSearch_emptySearchesHint')
				.addClass('MMMSearch_emptySearchesHint')	
				.appendTo('#MMMSearch_searchicons');					
		}
	};
}













function MMMSearch_HTMLBuilder(_MMMSearch) {
	var MMMSearch = _MMMSearch;
	var _this = this;

	
	
	this.showModule = function() {
		var tabs = MMMSearch.getTabs();
		for (var tab in tabs) {
			if (typeof tabs[tab] == "object") {
				this.setHtmlObj("tab" + tab, "MMMSearch_setup_tab_" + tab);
				this.setHtmlObj("box" + tab, "MMMSearch_setup_box_" + tab);
			}
		}

		var searches = MMMSearch.getSearches();
		for (var search in searches) {
			if (typeof searches[search] == "object") {
				this.setHtmlObj("icon" + search, "MMMSearch_" + search);
				this.setHtmlObj("label" + search, "MMMSearch_setupsearchlabel_" + search);
			}
		}
											 
	
		
		this.setHtmlObj("setuptabs",		"MMMSearch_setup_tabContainer");
		this.setHtmlObj("setuptab",			"MMMSearch_setup_tab");
		this.setHtmlObj("setupboxes",		"MMMSearch_setup_boxContainer");
		this.setHtmlObj("setupbox",			"MMMSearch_setup_box");
		this.setHtmlObj("setupbutton",		"MMMSearch_setup_button");
		this.setHtmlObj("homebutton",		"MMMSearch_home_button");
        this.setHtmlObj("mailbutton",       "MMMSearch_mail_button");
		this.setHtmlObj("hidegooglebutton",	"MMMSearch_googlehide_button");

		
		// div of text if no search is selected
		this.setHtmlObj("emptySearchesHint","MMMSearch_emptySearchesHint");
		this.setHtmlObj("bottomLink",		"MMMSearch_bottom_link");
		
		/*
		if (!document.getElementById("MMMSearch_container")) {
			document.write ("<div id='MMMSearch_container' class='MMMSearch_container'></div>");
		}
		*/
		
		var content = this.getHtmlObj("main");
		this.removeAllChildren(content);

		// just for the migration until i have the css in the xml file
//		this.appendChild(content, this.getDomOfCSS());
 
//		this.appendChild(content, this.getDomOfCounter());
		this.appendChild(content, this.getDomOfSetupButton());
		this.appendChild(content, this.getDomOfSetup());
		this.appendChild(content, this.getDomOfContent());
/*		if (MMMSearch.getPrefs('display_google') == "true" || MMMSearch.getPrefs('display_google') == "false") {
			this.appendChild(content, this.getDomOfHideGoogleButton());
		}
*/
		
		if (typeof _IG_RegisterOnloadHandler != "undefined") {
			_IG_RegisterOnloadHandler(function () {_this.adjustIFrameHeight();});
		}
		// switch display if configured
		// if (MMMSearch.getPrefs("host") == "google" || MMMSearch.getPrefs("host") == "local") {
		/*	if (MMMSearch.getPrefs("display_google") == "false") {
				_IG_RegisterOnloadHandler(function () {_this.changeDisplayGoogle();});
			}
		*/	
		//}
		
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
				var msg = new _IG_MiniMessage(MMMSearch.getPrefs("moduleId"));
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
	};
	

	
	/* return HTML-source code for setup of the module */
	this.getDomOfSetup = function() {
		var setup = this.createHtmlObj("setupcontainer");

		if (displaySetup) {
			this.setEvent(setup, "onselectstart", function () {return false;});
			
			// homebutton			
			var homebutton = this.appendChild(setup, this.newObject("a", this.getHtmlId("homebutton"), this.getHtmlId("homebutton")));
			homebutton.style.backgroundImage = "url" + "(" + MMMSearch.getPrefs("path") + "img/mmmsearch_home.gif)";
			homebutton.target = "_blank";
			homebutton.href = "http://www.madmaxmatze.de/mysearches";
			homebutton.innerHTML = " ";
			this.setEvent(homebutton, "onmouseover", function () {_this.changeHomeButton(true);});
			this.setEvent(homebutton, "onmouseout", function () {_this.changeHomeButton(false);});
			this.setEvent(homebutton, "onmousemove", function (e) {_this.onmousemove (e);});	
			
      
		      // mailbutton     
		      /*
              var mailbutton = this.appendChild(setup, this.newObject("a", this.getHtmlId("mailbutton"), this.getHtmlId("mailbutton")));
		      mailbutton.style.backgroundImage = "url" + "(" + MMMSearch.getPrefs("path") + "img/mmmsearch_mail.gif)";
		      mailbutton.href = "javascript: void(0);";
		      mailbutton.innerHTML = " ";
              this.setEvent(mailbutton, "onclick", function () {
                 // this is  not working within the iframe of the gadget
                 _share_this_gadget('Share Gadget: mySearches','http://www.google.com/ig/mailgadget?hl\x3dde\x26moduleurl\x3dhttp://mysearches.googlecode.com/svn/trunk/search.xml\x26mid\x3d122\x26source\x3dshare_gadget');
              });
              this.setEvent(mailbutton, "onmouseover", function () {_this.changeMailButton(true);});
		      this.setEvent(mailbutton, "onmouseout", function () {_this.changeMailButton(false);});
		      this.setEvent(mailbutton, "onmousemove", function (e) {_this.onmousemove (e);});  
		      */
      
      
        	// tabs and boxes
			var setupTabsContainer = this.appendChild(setup, this.createHtmlObj("setuptabs"));
			var setupBoxesContainer = this.appendChild(setup, this.createHtmlObj("setupboxes"));
	
			var tabs = MMMSearch.getTabs();
			
			// sort Tabs by language specific name
			/*
			var tmpTabs = new Array();
			for (var tab in tabs) {
				if (typeof tabs[tab] == "object") {
					tabs[tab].setName(MMMSearch.getTerm("tab_" + tab));
					tmpTabs[tmpTabs.length] = tabs[tab];
				}
			}
			
			tabs = new Array();
			for (var i = 0; i < tmpTabs.length; i++) {		
				for (var j = i + 1; j < tmpTabs.length - 2; j++) {		
					if (tmpTabs[i].getName() > tmpTabs[j].getName()) {
							var tmp = tmpTabs[i];
							tmpTabs[i] = tmpTabs[j];
							tmpTabs[j] = tmp;
					}
				}
				tabs[tmpTabs[i].getId()] = tmpTabs[i];
			}
			*/
			var i = 0;
			for (var tab in tabs) {
				if (typeof tabs[tab] == "object") {
					this.appendChild(setupTabsContainer, this.getDomOfTab(tabs[tab], i++));
				}
			}
			this.appendChild(setupBoxesContainer, this.getDomOfBox(MMMSearch.getActiveTab()));
			
			
		} else {
			setup.style.display = "none";
		}

        /*
		var div = this.appendChild(setup, _this.newDiv("", this.getHtmlId("bottomLink")));
		div.setAttribute("clear", "all");

		var a = this.appendChild(div, this.newObject("a"));
		this.setAttribute(a, "href", "http://madmaxmatze.de/mysearches");
		this.setAttribute(a, "target", "_blank");			
		this.setAttribute(a, "title", MMMSearch.getTerm("button_homepagelink_hint"));			
		a.innerHTML = "&raquo; " + MMMSearch.getTerm("button_homepagelink_text") + " &laquo;";
        */
    
		if (
			MMMSearch.getTerm("user_language") == "ar"
			|| MMMSearch.getTerm("user_language") == "es"
			|| MMMSearch.getTerm("user_language") == "fr"
			|| MMMSearch.getTerm("user_language") == "it"
			|| MMMSearch.getTerm("user_language") == "ru"
			|| MMMSearch.getTerm("user_language") == "pl"
			|| MMMSearch.getTerm("user_language") == "pt"
			|| MMMSearch.getTerm("user_language") == "no"
			|| MMMSearch.getTerm("user_language") == "unknown"
			|| MMMSearch.getTerm("user_language") == "cn") {
			div.innerHTML += "<br><br>Do you want to get this module in your language<br>or with search engines from your country?<br>&raquo; <a href='mailto:madmaxmatze+mysearches@gmail.com' target='_blank'>Just mail me</a> &laquo;";
		}
		
		return setup;
	};

	
	this.getDomOfTab = function (_tab, count) {
		var tabObj = this.newDiv(this.getHtmlId("tab" + _tab.getId()), _this.getDomClassOfTab(_tab));
			
		this.setEvent(tabObj, "onclick", function () {MMMSearchObj.setActiveTab(_tab);});
		this.setEvent(tabObj, "onmouseover", function () {
			_tab.setHovered(true);
			_this.refreshTab(_tab);
		});
		this.setEvent(tabObj, "onmouseout", function () {
			_tab.setHovered(false);
			_this.refreshTab(_tab);
		});
		if (count === 0) {
			tabObj.style.borderTopWidth = "1px";
			tabObj.style.borderTopStyle = "solid";
		}
		
		var imageUrl;
		var imageHeight = 12;
		if (_tab.getId() == "aa") {
			imageUrl = MMMSearch.getPrefs("path") + "img/globus.gif";
			imageHeight = 32;
		} else if (_tab.getId() == "settings") {
			imageUrl = MMMSearch.getPrefs("path") + "img/settings.gif";
			imageHeight = 29;
		} else {
			imageUrl = "http://www.finanznachrichten.de/images/flags/" + _tab.getId().toUpperCase() + ".gif";
		}
		
		var tabImage = _IG_GetImage(imageUrl);
		_this.setAttribute(tabImage, "alt", _tab.getName());
		_this.setAttribute(tabImage, "height", imageHeight);
		_this.appendChild (tabObj, tabImage);
	
		return tabObj;
	};



	this.getDomOfBox = function (_tab) {
		var box = this.newDiv(this.getHtmlId("setupbox"), this.getHtmlId("setupbox"));

		if (_tab.getId() != "settings") {
	/*
			var div = this.appendChild(box, this.newDiv("", "MMMSearch_setup_quantifier"));
			this.appendChild(div, this.newText(MMMSearch.getTerm("select_text") + ": "));
			
			var button = this.appendChild(div, this.newObject("button"));
			this.setAttribute(button, "title", "Activate all search engines");
			this.setEvent(button, "onclick", function () {MMMSearch.setAllSearchesInTabEnabled(_tab, true);});
			this.appendChild(button, this.newText(MMMSearch.getTerm("select_all")));

			button = this.appendChild(div, this.newObject("button"));
			this.setAttribute(button, "title", "Deactivate all search engines");
			this.setEvent(button, "onclick", function () {MMMSearch.setAllSearchesInTabEnabled(_tab, false);});
			this.appendChild(button, this.newText(MMMSearch.getTerm("select_none")));
	*/		
			var sections = _tab.getSections();
			for (var section in sections) {
				if (typeof sections[section] == "object") {
					this.appendChild(box, this.getDomOfSection(sections[section]));
				}
			}
		} else {
			this.appendChild(box, this.getSettingsHtml());
		}

		return box;
	};
	
	
	this.getDomOfSection = function(_section) {
		var sectionObj = this.newDiv("", "section");

		var sectionhead = this.appendChild(sectionObj, this.newDiv("", "sectionhead"));
		this.appendChild (sectionhead, this.newText(MMMSearch.getTerm("headline_" + _section.getId())));
		
		var searches = _section.getSearches();
		for (var search in searches) {
			if (typeof searches[search] == "object") {
				this.appendChild (sectionObj, this.getDomOfSearch(searches[search]));
			}
		}
		
		return sectionObj;
	};
	

	
	this.getDomOfSearch = function(_search) {
		var id = _search.getId();

		var searchObj = this.newDiv(this.getHtmlId("label" + id), "setupsearchlabel setupsearchlabel_" + _search.isEnabled());
		this.setEvent(searchObj, "onclick", function () {
			MMMSearch.flipSearchEnabled(_search);
		});

		if (typeof _IG_GetImage != "undefined") {
			var imageUrl = MMMSearch.getPrefs("path") + "img/icons/" + _search.getId().substr(3, 100) + ".png";
			var linkImage = _IG_GetImage(imageUrl);
			_this.setAttribute(linkImage, "width", 16);
			_this.setAttribute(linkImage, "height", 16);
			this.appendChild(searchObj, linkImage);
		}
		
		this.appendChild(searchObj, this.newText(_search.getName()));
		_this.setAttribute(searchObj, "title", _search.getDescription());
		
		return searchObj;
	};

	
	
	this.getSettingsHtml = function() {
		var html, div, input, select, option;
		
		html = _this.newDiv();
		div = _this.appendChild(html, _this.newDiv("", "setting"));

		input = _this.newObject("input", "newwindowinput", "newwindowinput");
		_this.setAttribute(input, "type", "checkbox");
		if (MMMSearch.getPrefs("new_window") == "true") {_this.setAttribute(input, "checked", "true");}
		_this.setEvent(input, "onclick", function () {MMMSearch.setOpenInNewWindow (document.getElementById("newwindowinput").checked);});
		// important to appand afterwards because of checkbox attribute
		_this.appendChild(div, input);
		_this.appendChild(div, _this.newText(MMMSearch.getTerm("tab_settings_new_window_for_search")));

		_this.appendChild(div, _this.newObject("br"));
		_this.appendChild(div, _this.newObject("br"));

		input = _this.newObject("input", "showLabels", "showLabels");
		_this.setAttribute(input, "type", "checkbox");
		if (MMMSearch.getPrefs("show_labels") == "true") {_this.setAttribute(input, "checked", "true");}
		_this.setEvent(input, "onclick", function () {MMMSearch.setShowLabels (document.getElementById("showLabels").checked);});
		// important to appand afterwards because of checkbox attribute
		_this.appendChild(div, input);
		_this.appendChild(div, _this.newText(MMMSearch.getTerm("tab_settings_show_labels")));

		_this.appendChild(div, _this.newObject("br"));
		
		return html;
	};


	/* return HTML-source code for content area of the module */
	this.getDomOfContent = function() {
		var a, div, input, form, img;

		form = this.createHtmlObj("content", "form");
		this.setEvent (form, "onsubmit", function (e) {MMMSearch.saveToAnalytics('aa_google');});	
		this.setAttribute(form, "method", "get");
		this.setAttribute(form, "action", "http://www.google.com/search");
		if (MMMSearch.getPrefs("new_window")) {this.setAttribute(form, "target", "_blank");}	
		
		var inputCont = form.appendChild(this.newDiv(this.getHtmlId("inputcontainer")));
		inputCont.style.backgroundImage ="url" + "(" + MMMSearch.getPrefs("path") + "img/mmmsearch_input.png)";
				
		div = inputCont.appendChild(this.newDiv(this.getHtmlId("inputbgright")));
		div.style.backgroundImage = "url" + "(" + MMMSearch.getPrefs("path") + "img/mmmsearch_input.png)";

		div = inputCont.appendChild(this.newDiv(this.getHtmlId("inputcenter")));

		input = div.appendChild(this.newObject("input", this.getHtmlId("input")));
		this.setAttribute(input, "value", MMMSearch_inputText);
		this.setAttribute(input, "name", "q");
		input.onfocus = function () {_this.onFocusInput(true);};
		input.onblur = function () {_this.onFocusInput(false);};
		input.onkeyup = function () {_this.refreshAllSearchesLink();};
		input.onchange = function () {_this.refreshAllSearchesLink();};
		
		_this.appendChild(form, this.getDomOfIcons());
			
		return form;
	};

	this.getDomOfIcons = function() {
		var ret = this.newDiv(this.getHtmlId("searchicons"));
		var enabledSearches = MMMSearch.getEnabledSearches();
		var enabledSearchesCount = 0;
		var lastSection = "";
		for (var search in enabledSearches) {
			if (typeof enabledSearches[search] == "object") {
				var thisSearch = enabledSearches[search];
				if (thisSearch.isEnabled()) {
					if (lastSection != thisSearch.getSection()) {
						if (MMMSearch.getPrefs("show_labels") == "true") {
							if (lastSection) {
								ret.appendChild(_this.newObject("<br>"));
							}
							ret.appendChild(document.createTextNode(MMMSearch.getTerm( "headline_" + thisSearch.getSection() ) + ": "));
						} else {
							if (lastSection) {
								var imageUrl = MMMSearch.getPrefs("path") + "img/mmmsearch_divider.png";
								var imageElement = _IG_GetImage(imageUrl);
								ret.appendChild(imageElement);
							}
						}
						lastSection = thisSearch.getSection();
					}
					ret.appendChild(this.getDomOfSearchLink(enabledSearches[search]));
					enabledSearchesCount++;
				}
			}
		}	
		
		if (!enabledSearchesCount) {
			var div = _this.appendChild(ret, _this.newDiv("", _this.getHtmlId("emptySearchesHint")));
			div.style.backgroundImage = "url('" + MMMSearch.getPrefs("path") + "img/mmmsearch_uparrow.gif')";
			div.appendChild (document.createTextNode(MMMSearch.getTerm("button_setup")));
		}

		return ret;	
	};
	
	
	this.getDomOfSearchLink = function (_search) {
		var link = this.newObject ("a", this.getHtmlId("icon" + _search.getId()));
		this.setEvent (link, "onmouseover", function () {_this.onmouseover (_search.getName());});	
		this.setEvent (link, "onmousemove", function (e) {_this.onmousemove (e);});	
		this.setEvent (link, "onmouseout", function () {_this.onmouseout ();});	
		this.setEvent (link, "onclick", function () {MMMSearch.saveToAnalytics(_search.getId());});	
		this.setAttribute(link, "href", (MMMSearch_inputText ? _search.getSearchUrl() + MMMSearch_inputText : _search.getUrl()));
		
		var icon = iconsMatching[_search.getId().substr(3, 100)];
		this.setAttribute(link, "style", "background: url(img/icons.png) -" + icon['x'] + "px -" + icon['y'] + "px;");
		
		if (MMMSearch.getPrefs("new_window")) {this.setAttribute(link, "target", "_blank");}
		
	/*	var imageUrl = MMMSearch.getPrefs("path") + "img/icons/" + _search.getId().substr(3, 100) + ".png";
		var linkImage = _IG_GetImage(imageUrl);
		_this.setAttribute(linkImage, "alt", _search.getName());
		_this.setAttribute(linkImage, "width", 16);
		_this.setAttribute(linkImage, "height", 16);
		link.appendChild(linkImage);
	*/
								
		// link.appendChild (this.newText(_search.getUrl()));

		
		return link;
	};
	

	
	/* return DOM Object to enable counter */
/*	this.getDomOfCounter = function() {
		var img = this.newObject("img", "", "hideCounterImage");
		this.setAttribute(img, "src", "https://c19.statcounter.com/counter.php?sc_project=1999550&java=0&security=e7b24881&invisible=1");
		return img;
	}
*/

	this.refreshSearch = function (_search) {
	//	var searchIcon = this.getHtmlObj("icon" + _search.getId());
		var searchLabel = this.getHtmlObj("label" + _search.getId());
		
		if (searchLabel) {
			searchLabel.className = "setupsearchlabel setupsearchlabel_" + _search.isEnabled();
			this.refreshSearchLink(_search);
		}
	};

	this.refreshSearchLink = function (_search){
		var searchIcon = this.getHtmlObj("icon" + _search.getId());
		if (searchIcon) {
			searchIcon.href = (MMMSearch_inputText ? _search.getSearchUrl() + MMMSearch_inputText : _search.getUrl());
		}
	};

	var MMMSearch_inputText = "";
	// when entering text in inputbox - searches icon links in the content area are changed
	this.refreshAllSearchesLink = function () {
		MMMSearch_inputText = this.getHtmlObj("input").value;
		
		var enabledSearches = MMMSearch.getEnabledSearches();
		for (var search in enabledSearches) {
			if (typeof enabledSearches[search] == "object") {
				this.refreshSearchLink(enabledSearches[search]);
			}
		}
	};	

	this.refreshTab = function(_tab) {
		if (this.getHtmlObj("tab" + _tab.getId())) {
			this.getHtmlObj("tab" + _tab.getId()).className = this.getDomClassOfTab(_tab);
		}
	};
	

	this.refreshContent = function() {
		this.replaceObject(this.getDomOfIcons(), this.getHtmlObj("searchicons"));
		this.adjustIFrameHeight();
	};
	
	this.changeBox = function(_tab) {
		this.removeAllChildren(this.getHtmlObj("setupboxes"));
		this.appendChild(this.getHtmlObj("setupboxes"), this.getDomOfBox(_tab));
	};
	
	this.getDomClassOfTab = function (_tab) {
		return this.getHtmlId("setuptab") + " active" + _tab.isActive() + " hovered" + (!_tab.isActive() && _tab.isHovered());
	};
/*
	this.changeDisplayGoogle = function() {
		var googleHeader = this.getHtmlObj("googleheader");
		if (googleHeader) {
			var MMMSearch_displayGoogle = (googleHeader.style.display == 'none');
			// if current display== =none --> switch to block and save true; else save false
			MMMSearch.setPrefs('display_google', MMMSearch_displayGoogle);
			
			MMMSearch_displayGoogle = (MMMSearch_displayGoogle ? 'block' : 'none');
			googleHeader.style.display = MMMSearch_displayGoogle;
			this.getHtmlObj("googlefooter").style.display = MMMSearch_displayGoogle;
			// this.changeHideGoogleButton(true);
			this.getHtmlObj("input").focus();
		}
	}
*/	
	
	var displaySetup = false;
	this.changeDisplaySetup = function() {
		displaySetup = !displaySetup;
		this.refreshDisplaySetup();
	};
	
	this.refreshDisplaySetup = function() {
		var setup = this.getHtmlObj("setupcontainer");
		if (displaySetup) {
			this.replaceObject(this.getDomOfSetup(), setup);
		} else {
			this.removeAllChildren(setup);
			setup.style.display = "none";
		}
		this.adjustIFrameHeight();
	};
	
	this.adjustIFrameHeight = function () {
		if (typeof _IG_AdjustIFrameHeight != "undefined") {
			_IG_AdjustIFrameHeight();
		}	
	};
	

	// event when focusing the input box
	this.onFocusInput = function (_focus) {
		var newImg = MMMSearch.getPrefs("path") + "img/mmmsearch_input" + (_focus ? "_focus" : "") + ".png";
		if (_focus) {
			this.getHtmlObj("input").select();	
		}
	    this.getHtmlObj("inputcontainer").style.backgroundImage = "url(" + newImg + ")";
		this.getHtmlObj("inputbgright").style.backgroundImage = "url(" + newImg + ")";
		return true;
	};

	
	

	/* 3 Mouse-Methods for the Hint-Text */
	this.onmousemove = function (e) {
		if (!e) {e = window.event;}  // cast event for stuppid IE
		var eventObj = e.target || e.srcElement;
		var hint = _this.getHtmlObj("hint");
		if (hint) {
			var x = (document.all ? e.x : e.layerX) + eventObj.offsetLeft;
			if (x + _this.getHtmlObj("hint").offsetWidth + 16 > _this.getHtmlObj("main").offsetWidth) {
				x = x - _this.getHtmlObj("hint").offsetWidth - 32;
			}

			var	y = (document.all ? e.y : e.layerY) + eventObj.offsetTop;
			if (y + _this.getHtmlObj("hint").offsetHeight + 16 > _this.getHtmlObj("main").offsetHeight) {
				y = y - _this.getHtmlObj("hint").offsetHeight - 32;
			}
			hint.style.left = (x + 16) + 'px';
			hint.style.top = (y + 16) + 'px';
		}
	};
	this.onmouseout = function () {
		_this.getHtmlObj("main").style.cursor = "default";
		_this.removeObject(_this.getHtmlObj("hint"));
	};
	this.onmouseover = function (_tooltiplabel) {
		_this.removeObject(_this.getHtmlObj("hint"));
		var div = document.createElement('div');
		div.appendChild (document.createTextNode(_tooltiplabel));
		var id = document.createAttribute('id');
		id.nodeValue = _this.getHtmlId("hint");
		div.setAttributeNode(id);
		_this.getHtmlObj("main").appendChild(div);
		_this.getHtmlObj("main").style.cursor = "pointer";
		if (document.all) {_this.onmousemove ();}
	};


}



var MMMSearchObj = new MMMSearch();

























/* ******************************************************************************************************************************************************
	SearchEngines definition 
*************************************************************************************************************************************************** */	

// create search object to which tabs, section and searches are added by the country specific JS-files --> MMMSearchObj must have exacly this name, because on client side this object is used !!!!!
var MMMSearchObj = new MMMSearch();




MMMSearchObj.addTab("au");
	MMMSearchObj.addSection("portals");
		MMMSearchObj.addSearch(
			'yahoo',
			'yahoo.au',
			'http://www.yahoo.au',
			'http://au.search.yahoo.com/search?p=',
			'');
		MMMSearchObj.addSearch(
			'ansearch'
			,'ansearch.com.au'
			,'http://www.ansearch.com.au'
			,'http://www.ansearch.com.au/search?s=all&a=all&cc=au&search='
			,''
		);
	MMMSearchObj.addSection("shopping");
		MMMSearchObj.addSearch(
			'ebay'
			,'ebay.au'	
			,'http://www.ebay.com.au'
			,'http://search.ebay.com.au/'
			,''
		);
		MMMSearchObj.addSearch(
			'doorone'		
			,'doorone.au'		
			,'http://doorone.com.au'
			,'http://doorone.com.au/xFS?KW='
			,''
		);	
		MMMSearchObj.addSearch(
			'ferret'		
			,'ferret.com.au'		
			,'http://www.ferret.com.au'
			,'http://www.ferret.com.au/search.asp?qu='
			,'Australian suppliers/products search'
		);	
			
	MMMSearchObj.addSection("news");
		MMMSearchObj.addSearch(
			'abc'
			,'abc.net.au'	
			,'http://www.abc.net.au'
			,'http://search.abc.net.au/search/search.cgi?sort=&collection=abcall&query='
			,'Main public broadcaster'
		);
		MMMSearchObj.addSearch(
			'newsau'
			,'news.com.au'	
			,'http://searchresults.news.com.au'
			,'http://searchresults.news.com.au/servlet/Search?site=ninews&queryterm='
			,''
		);
		
		
		



MMMSearchObj.addTab("at");
	MMMSearchObj.addSection("portals");
		MMMSearchObj.addSearch(
			'yahoo'
			,'yahoo.at'
			,'http://www.yahoo.at'
			,'http://at.search.yahoo.com/search?p='
			,''
		);		
		
	MMMSearchObj.addSection("shopping");
		MMMSearchObj.addSearch(
			'amazon'		
			,'amazon.at'
			,'http://www.amazon.de/gp/redirect.html?ie=UTF8&location=http%3A%2F%2Famazon.at%2F&site-redirect=at&tag=wwwmadmaxmatd-21&linkCode=ur2&camp=1638&creative=6742'
			,'http://www.amazon.de/gp/search?tag=wwwmadmaxmatd-21&index=blended&location=http%3A%2F%2Famazon.at%2F&site-redirect=at&linkCode=ur2&camp=1638&creative=6742&keywords='
			,''
		);	
		MMMSearchObj.addSearch(
			'ebay'
			,'ebay.at'	
			,'http://ebay.at'
			,'http://search.ebay.at/'
			,''
		);
		/*
		 * no search link in affili.net for ottoversand.at
		 */
		MMMSearchObj.addSearch(
			'otto'
			,'ottoversand.at'
			,'http://partners.webmasterplan.com/click.asp?ref=436362&site=3433&type=b33&bnb=33'
			,'http://partners.webmasterplan.com/click.asp?ref=436362&site=3433&type=b33&bnb=33&'
			,''
		);
		MMMSearchObj.addSearch(
			'geizhals'		
			,'geizhals.at'		
			,'http://geizhals.at'
			,'http://geizhals.at/?fs='
			,''
		);







MMMSearchObj.addTab("ca");
	MMMSearchObj.addSection("portals");
		MMMSearchObj.addSearch(
			'yahoo'
			,'yahoo.ca'
			,'http://www.yahoo.ca'
			,'http://ca.search.yahoo.com/search?p='
			,''
		);

		
MMMSearchObj.addSection("shopping");
		MMMSearchObj.addSearch(
			'ebay'
			,'ebay.ca'	
			,'http://www.ebay.ca'
			,'http://search.ebay.ca/'
			,''
		);
        MMMSearchObj.addSearch(
			'amazon'		
			,'amazon.ca'
			,'http://www.amazon.ca/gp/redirect.html?ie=UTF8&location=http%3A%2F%2Fwww.amazon.ca%2F&tag=mysearches05-20&linkCode=ur2&camp=15121&creative=330641'
			,'http://www.amazon.ca/gp/search?ie=UTF8&tag=mysearches05-20&index=blended&linkCode=ur2&camp=15121&creative=330641&keywords='
			,''
		);	

MMMSearchObj.addTab("ch");
	MMMSearchObj.addSection("portals");
		MMMSearchObj.addSearch(
			'yahoo'
			,'yahoo.ch'
			,'http://www.yahoo.ch'
			,'http://ch.search.yahoo.com/search?p='
			,''
		);		
		MMMSearchObj.addSearch(
			'searchch'	
			,'search.ch'			
			,'http://www.search.ch'
			,'http://www.search.ch/search.html?loc=ch&q='
			,'The Swiss Search Engine'
		);
		
	MMMSearchObj.addSection("shopping");
		MMMSearchObj.addSearch(
			'ebay'
			,'ebay.ch'	
			,'http://ebay.ch'
			,'http://search.ebay.ch/'
			,''
		);
		
		
		MMMSearchObj.addSearch(
			'toppreise'
			,'toppreise.ch'
			,'http://www.toppreise.ch'
			,'http://www.toppreise.ch/index.php?search='
			,'Preissuchmaschine Toppreise.ch'
		);
		MMMSearchObj.addSearch(
			'ricardo'
			,'ricardo.ch'
			,'http://www.ricardo.ch'
			,'http://my.ricardo.ch/search/search.asp?txtSearch='
			,''
		);		
		MMMSearchObj.addSearch(
			'1advd'
			,'1a-dvdshop.ch'
			,'http://www.1a-dvdshop.ch'
			,'http://www.1a-dvdshop.ch/DefaultTOP.asp?sb='
			,'1a-dvd Shop'
		);		

	


	
MMMSearchObj.addTab("cn");
	MMMSearchObj.addSection("portals");
		MMMSearchObj.addSearch(
			'baidu'
			,'baidu.com'
			,'http://www.baidu.com'
			,'http://www.baidu.com/s?wd='
			,''
		);	





MMMSearchObj.addTab("de");
	MMMSearchObj.addSection("portals");
		MMMSearchObj.addSearch(
			'yahoo'
			,'yahoo.de'
			,'http://www.yahoo.de'
			,'http://de.search.yahoo.com/search?p='
			,''
		);
		MMMSearchObj.addSearch(
			'lycos'		
			,'lycos.de'	
			,'http://www.lycos.de'
			,'http://suche.lycos.de/cgi-bin/pursuit?query='
			,''
		);
		MMMSearchObj.addSearch(
			'web'		
			,'web.de'		
			,'http://www.web.de' 
			,'http://suche.web.de/search/web/?allparams=&smode=&webRb=int&su='
			,''
		);
		MMMSearchObj.addSearch(
			'dmoz'		
			,'dmoz.de'		
			,'http://www.dmoz.de' 
			,'http://search.dmoz.org/cgi-bin/search?all=no&cat=World%2FDeutsch&search='
			,''
		);
	
		
	MMMSearchObj.addSection("shopping");
		MMMSearchObj.addSearch(
			'ebay'
			,'ebay.de'
			,'http://ebay.de'
			,'http://search.ebay.de/'
			,''
		);
		MMMSearchObj.addSearch(
			'amazon'		
			,'amazon.de'
			,'http://www.amazon.de/gp/redirect.html?ie=UTF8&location=http%3A%2F%2Fwww.amazon.de%2F&site-redirect=de&tag=wwwmadmaxmatd-21&linkCode=ur2&camp=1638&creative=6742'
			,'http://www.amazon.de/gp/search?tag=wwwmadmaxmatd-21&index=blended&linkCode=ur2&camp=1638&creative=6742&keywords='
			,''
		);
		
        MMMSearchObj.addSearch(
			'otto'
			,'otto.de'
			,'http://partners.webmasterplan.com/click.asp?ref=436362&site=2950&type=b29&bnb=29'
			,'http://partners.webmasterplan.com/click.asp?ref=436362&site=2950&type=text&tnb=17&prd=yes&affdeep='
			,''
		);
		/*
        MMMSearchObj.addSearch(
			'quelle'
			,'quelle.de'
			,'http://partners.webmasterplan.com/click.asp?ref=436362&site=3657&type=b17&bnb=17'
			,'http://partners.webmasterplan.com/click.asp?ref=436362&site=3657&type=text&tnb=192&prd=yes&suche='
			,''
		);	
        */
		/*
		 * search link missing in affili net for qvc
		 */			
		/*
        MMMSearchObj.addSearch(
			'qvc'
			,'qvc.de'
			,'http://partners.webmasterplan.com/click.asp?ref=436362&site=2791&type=b105&bnb=105'
			,'http://partners.webmasterplan.com/click.asp?ref=436362&site=2791&type=b105&bnb=105&'
			,''
		);	
		MMMSearchObj.addSearch(
			'beateuhse'
			,'beate-uhse.de'
			,'http://partners.webmasterplan.com/click.asp?ref=436362&site=3830&type=text&tnb=1' 
			,'http://shop.beate-uhse.com/index.php?svAffiliate=096&svValue='
			,''
		);		
		*/
        MMMSearchObj.addSearch(
			'guenstiger'
			,'guenstiger.de'
			,'http://www3.guenstiger.de/gt/main.asp' 
			,'http://www3.guenstiger.de/gt/main.asp?suche='
			,'Preis-Suchmaschine'
		);
		MMMSearchObj.addSearch(
			'billiger'		
			,'billiger.de'
			,'http://www.billiger.de'
			,'http://www.billiger.de/suche.html?go=Suchen&userkatsuggest=&houston=1&searchstring='
			,''
		);
		MMMSearchObj.addSearch(
			'geizhals'		
			,'geizhals.at'		
			,'http://geizhals.at/deutschland'
			,'http://geizhals.at/deutschland/?fs='
			,''
		);
		MMMSearchObj.addSearch(
			'preistrend'		
			,'preistrend.de'		
			,'http://www.preistrend.de'
			,'http://preistrend.de/suchen.php?q='
			,''
		);		
		MMMSearchObj.addSearch(
			'evendi'		
			,'evendi.de'		
			,'http://www.evendi.de'
			,'http://www.evendi.de/jsp/eVendi2004/search.jsp?name='
			,''
		);		
		MMMSearchObj.addSearch(
			'doorone'		
			,'doorone.de'		
			,'http://www.doorone.de'
			,'http://www.doorone.de/xFS?KW='
			,''
		);		
		MMMSearchObj.addSearch(
			'testberichte'
			,'testberichte.de'
			,'http://www.testberichte.de'
			,'http://www.testberichte.de/d/search.php?searchstr='
			,''
		);
		MMMSearchObj.addSearch(
			'yatego'
			,'yatego.com'
			,'http://www.yatego.com'
			,'http://www.yatego.com/index.htm?cl=mallsearch&query='
			,''
		);
		MMMSearchObj.addSearch(
			'hardwareschotte'
			,'hardwareschotte.de'
			,'http://www.hardwareschotte.de'
			,'http://www.hardwareschotte.de/preise.php3?seachrange=all&searchstring='
			,''
		);
        /*
        MMMSearchObj.addSearch(
			'musicload'
			,'musicload.de'	
			,'http://partners.webmasterplan.com/click.asp?ref=436362&site=3752&type=text&tnb=1'
			,'http://partners.webmasterplan.com/click.asp?ref=436362&site=3752&type=text&tnb=8&prd=yes&stextenc='
			,''
		);
		MMMSearchObj.addSearch(
			'aolmusic'
			,'AOL Musikdownloads'	
			,'http://partners.webmasterplan.com/click.asp?ref=436362&site=3902&type=text&tnb=1'
			,'http://musikdownloads.aol.de/imcdms/search.do?ttp=AFF&dpt=AM&pid=MDL&platform=Google&SEMKEY=AffiliateMDL&nwid=affilinet&trid=&search='
			,''
		);
		MMMSearchObj.addSearch(
			'jamba'
			,'Jamba'	
			,'http://click.jamba.de/click.asp?ref=436362&site=2703&type=b54&bnb=54'
			,'http://click.jamba.de/click.asp?ref=436362&site=2703&type=text&tnb=64&pid='
			,''
		);
      */
		
			
	
	// http://www.socialmarker.com
	MMMSearchObj.addSection("bookmarking");	
		MMMSearchObj.addSearch(
			'misterwong'
			,'mister-wong.de'	
			,'http://www.mister-wong.de'
			,'http://www.mister-wong.de/search/?search_type=w&btn=suchen&keywords='
			,''
		);

		
	MMMSearchObj.addSection("knowledge");
		MMMSearchObj.addSearch(
			'wikipedia'	
			,'de.wikipedia'	
			,'http://de.wikipedia.org' 
			,'http://de.wikipedia.org/wiki/Spezial:Search?go=Artikel&search='
			,''
		);
		MMMSearchObj.addSearch(
			'dejure'	
			,'dejure.org'	
			,'http://dejure.org' 
			,'http://dejure.org/cgi-bin/suche?Suchenach='
			,''
		);
		
		
		// http://www.getabstract.com/www/statistics/StatsAffiliateLogin.jsp
		// http://www.getabstract.com/servlets/Affiliate?u=madmaxmatze
		MMMSearchObj.addSearch(
			'leocn'		
			,'leo.org CN'			
			,'http://dict.leo.org'
			,'http://dict.leo.org/chde?search='
			,''
		);		
		MMMSearchObj.addSearch(
			'leoen'		
			,'leo.org EN'			
			,'http://dict.leo.org'
			,'http://dict.leo.org/ende?search='
			,''
		);
		MMMSearchObj.addSearch(
			'leoes'		
			,'leo.org ES'			
			,'http://dict.leo.org'
			,'http://dict.leo.org/esde?search='
			,''
		);		
		MMMSearchObj.addSearch(
			'leofr'		
			,'leo.org FR'			
			,'http://dict.leo.org'
			,'http://dict.leo.org/frde?search='
			,''
		);		
		MMMSearchObj.addSearch(
			'leoit'		
			,'leo.org IT'			
			,'http://dict.leo.org'
			,'http://dict.leo.org/itde?search='
			,''
		);		
		MMMSearchObj.addSearch(
			'beolingusen'		
			,'dict.tu-chemnitz.de EN'			
			,'http://dict.tu-chemnitz.de/dings.cgi?lang=de;service=deen'
			,'http://dict.tu-chemnitz.de/dings.cgi?lang=de&service=deen&query='
			,''
		);		
		MMMSearchObj.addSearch(
			'beolinguses'		
			,'dict.tu-chemnitz.de ES'			
			,'http://dict.tu-chemnitz.de/dings.cgi?lang=de;service=dees'
			,'http://dict.tu-chemnitz.de/dings.cgi?lang=de&service=dees&query='
			,''
		);		
		MMMSearchObj.addSearch(
			'beolinguspt'		
			,'dict.tu-chemnitz.de PT'			
			,'http://dict.tu-chemnitz.de/dings.cgi?lang=de;service=dept'
			,'http://dict.tu-chemnitz.de/dings.cgi?lang=de&service=dept&query='
			,''
		);
	    
      
        MMMSearchObj.addSearch(
	      'babdecn'   
	      ,'bab.la DE-CN'     
	      ,'http://bab.la/woerterbuch/deutsch-chinesisch'
	      ,'http://bab.la/woerterbuch/deutsch-chinesisch/'
	      ,''
	    );    
		MMMSearchObj.addSearch(
			'babdeen'		
			,'bab.la DE-EN'			
			,'http://bab.la/woerterbuch/deutsch-englisch'
			,'http://bab.la/woerterbuch/deutsch-englisch/'
			,''
		);		
		MMMSearchObj.addSearch(
			'babdees'		
			,'bab.la DE-ES'			
			,'http://bab.la/woerterbuch/deutsch-spanisch'
			,'http://bab.la/woerterbuch/deutsch-spanisch/'
			,''
		);		
	      MMMSearchObj.addSearch(
	        'babdefr'   
	        ,'bab.la DE-FR'     
	        ,'http://bab.la/woerterbuch/deutsch-franzoesisch'
	        ,'http://bab.la/woerterbuch/deutsch-franzoesisch/'
	        ,''
	      );    
		MMMSearchObj.addSearch(
	      'babdepl'   
	      ,'bab.la DE-PL'     
	      ,'http://bab.la/woerterbuch/deutsch-polnisch'
	      ,'http://bab.la/woerterbuch/deutsch-polnisch/'
	      ,''
	    );    
	    MMMSearchObj.addSearch(
	        'babdept'   
	        ,'bab.la DE-PT'     
	        ,'http://bab.la/woerterbuch/deutsch-portugiesisch'
	        ,'http://bab.la/woerterbuch/deutsch-portugiesisch/'
	        ,''
	    );    
	    MMMSearchObj.addSearch(
	        'babderu'   
	        ,'bab.la DE-RU'     
	        ,'http://bab.la/woerterbuch/deutsch-russisch'
	        ,'http://bab.la/woerterbuch/deutsch-russisch/'
	        ,''
        );    
	    MMMSearchObj.addSearch(
			'babdetr'		
			,'bab.la DE-TR'			
			,'http://bab.la/woerterbuch/deutsch-tuerkisch'
			,'http://bab.la/woerterbuch/deutsch-tuerkisch/'
			,''
		);
			
		MMMSearchObj.addSearch(
			'uitmuntend'		
			,'uitmuntend.de DE-NL'			
			,'http://www.uitmuntend.de'
			,'http://www.uitmuntend.de/search.html?search='
			,''
		);			
		
		MMMSearchObj.addSearch(
			'woerterbuch'	
			,'woerterbuch.info'
			,'http://www.woerterbuch.info'
			,'http://www.woerterbuch.info/?s=thesaurus&query='
			,''
		);
		MMMSearchObj.addSearch(
			'duden'	
			,'duden.de'
			,'http://www.duden-suche.de/'
			,'http://www.duden-suche.de/suche/trefferliste.php?suchbegriff[AND]='
			,''
		);
		/* not existing anymore
		MMMSearchObj.addSearch(
			'langenscheidt'	
			,'langenscheidt.de'	
			,'http://www.langenscheidt.de' 
			,'http://www.langenscheidt.de/fremdwb/indexextra.html?qstr='
			,''
		);
		*/
	MMMSearchObj.addSearch(
			'canoo'		
			,'canoo.net'		
			,'http://www.canoo.net'
			,'http://www.canoo.net/services/Controller?MenuId=Search&service=canooNet&lang=de&input='
			,''
		);
		MMMSearchObj.addSearch(
			'dict'		
			,'dict.cc'
			,'http://www.dict.cc'
			,'http://www.dict.cc/?s='
			,''
		);
		MMMSearchObj.addSearch(
			'abkuerzungen'	
			,'abkuerzungen.de'	
			,'http://www.abkuerzungen.de'
			,'http://www.abkuerzungen.de/pc/html/result.php?language=DE&x=21&y=8&abbreviation='
			,''
		);	
		MMMSearchObj.addSearch(
			'werweisswas'	
			,'wer-weiss-was.de'	
			,'http://www.wer-weiss-was.de'
			,'http://www.wer-weiss-was.de/app/search/global?search_what=e&search_what=t&submit.search=1&bool=a&type=beginnings&searchtext='
			,''
		);	
		MMMSearchObj.addSearch(
			'dnb'	
			,'Dt. Nationalbibliothek'	
			,'http://www.d-nb.de'
			,'https://portal.d-nb.de/opac.htm?method=simpleSearch&query='
			,'Website der deutschen Nationalbibliothek'
		);	


		
			
	MMMSearchObj.addSection("community");		
		MMMSearchObj.addSearch(
			'studivz'		
			,'studiVZ.net'
			,'http://www.studivz.net'
			,'http://www.studivz.net/search.php?do_search=1&name='
			,''
		);
		MMMSearchObj.addSearch(
			'meinvz'		
			,'meinVZ.net'
			,'http://www.meinvz.net'
			,'http://www.meinvz.net/search.php?do_search=1&name='
			,''
		);
		MMMSearchObj.addSearch(
			'xing'		
			,'xing.com'
			,'http://www.xing.com'
			,'https://www.xing.com/app/search?op=universal&universal='
			,''
		);
		MMMSearchObj.addSearch(
			'lastfm'		
			,'lastfm.de'
			,'http://www.lastfm.de'
			,'http://www.lastfm.de/music/?q='
			,''
		);
		MMMSearchObj.addSearch(
			'stayfriends'
			,'stayfriends.de'
			,'http://www.stayfriends.de'
			,'http://www.stayfriends.de/j/ViewController?submitaction=suchen&action=personSearch&q='
			,'Schulfreunde wiederfinden'
		);

	

	MMMSearchObj.addSection("news");		
		MMMSearchObj.addSearch(
			'spiegel'		
			,'spiegel.de'
			,'http://www.spiegel.de'
			,'http://service.spiegel.de/digas/servlet/find?S='
			,''
		);		
		MMMSearchObj.addSearch(
			'yigg'		
			,'yigg.de'
			,'http://www.yigg.de'
			,'http://www.yigg.de/suche?domains=www.yigg.de&sa=Google-Suche&sitesearch=www.yigg.de&client=pub-1406192967534280&forid=1&channel=8430379320&ie=ISO-8859-1&oe=ISO-8859-1&cof=GALT%3A%23008000%3BGL%3A1%3BDIV%3A%23336699%3BVLC%3A663399%3BAH%3Acenter%3BBGC%3AFFFFFF%3BLBGC%3A336699%3BALC%3A0000FF%3BLC%3A0000FF%3BT%3A000000%3BGFNT%3A0000FF%3BGIMP%3A0000FF%3BFORID%3A11&hl=de&q='
			,''
		);		

		
	MMMSearchObj.addSection("finance");		
		MMMSearchObj.addSearch(
			'ftd'		
			,'ftd.de'
			,'http://ftd.de'
			,'http://ftd.de/recherche/suche.html?suchtyp=news&q='
			,''
		);		
		MMMSearchObj.addSearch(
			'finanznachrichten'		
			,'finanznachrichten.de'
			,'http://www.finanznachrichten.de'
			,'http://www.finanznachrichten.de/suche/suchergebnis.asp?words='
			,''
		);		
		MMMSearchObj.addSearch(
			'onvista'		
			,'onvista.de'
			,'http://www.onvista.de'
			,'http://www.onvista.de/suche.html?SEARCH_VALUE='
			,''
		);						
		MMMSearchObj.addSearch(
			'finanzen'		
			,'finanzen.net'
			,'http://www.finanzen.net'
			,'http://www.finanzen.net/suchergebnis.asp?frmAktiensucheTextfeld='
			,''
		);						
		MMMSearchObj.addSearch(
			'fimatex'		
			,'fimatex.de'
			,'http://partners.webmasterplan.com/click.asp?ref=436362&site=4077&type=text&tnb=1'
			,'http://www.fimatex.de/resultat_recherche_code.phtml?code='
			,''
		);								
		MMMSearchObj.addSearch(
			'dkb'		
			,'dkb.de'
			,'http://www.dkb.de'
			,'http://www.dkb.de/cgi-bin/kurse.pl?search='
			,'Kursabfrage'
		);								
			
			
	MMMSearchObj.addSection("diverse");
		MMMSearchObj.addSearch(
			'wettercom'
			,'wetter.com'		
			,'http://www.wetter.com'
			,'http://www.wetter.com/v2/?SID=&LANG=DE&LOC=7004&LOCFULL=7000&button1=suchen+++&search='
			,''
		);
		MMMSearchObj.addSearch(
			'wetterde'
			,'wetter.de'
			,'http://www.wetter.de'
			,'http://wetter.rtl.de/deutschland/uebersicht.php?ort='
			,''
		);
		MMMSearchObj.addSearch(
			'gelbeseiten'
			,'gelbeseiten.de'		
			,'http://www.gelbeseiten.de'
			,'http://www.gelbeseiten.de/yp/search.yp?subject='
			,''
		);
		MMMSearchObj.addSearch(
			'telefonbuch'
			,'telefonbuch.de'		
			,'http://www.telefonbuch.de'
			,'http://www.telefonbuch.de/?kw='
			,''
		);
		MMMSearchObj.addSearch(
			'oertliche'
			,'oertliche.de'		
			,'http://www.dasoertliche.de'
			,'http://www.dasoertliche.de/?kw='
			,''
		);
		MMMSearchObj.addSearch(
			'bahn'
			,'bahn.de'		
			,'http://www.bahn.de'
			,'http://www.bahn.de/bin/iquery?db=p&text='
			,''
		);		
		MMMSearchObj.addSearch(
			'ancestry'
			,'ancestry.de'		
			,'http://partners.webmasterplan.com/click.asp?ref=436362&site=4263&type=text&tnb=1'
			,'http://www.ancestry.de/learn/learningcenters/namedist.aspx?name='
			,'the from where your family is coming'
		);		
		MMMSearchObj.addSearch(
			'chefkoch'	
			,'chefkoch.de'	
			,'http://www.chefkoch.de'
			,'http://www.chefkoch.de/suche.php?from_form=1&suche='
			,''
		);				

	MMMSearchObj.addSection("media");
		MMMSearchObj.addSearch(
			'mytv'	
			,'mytv.de'	
			,'http://www.mytv.de'		
			,'http://www.mytv.de/search.html?q='
			,''
		);
		MMMSearchObj.addSearch(
			'myvideo'	
			,'myvideo.de'	
			,'http://www.myvideo.de'
			,'http://www.myvideo.de/online/page.php?P=117&volltext='
			,''
		);
		MMMSearchObj.addSearch(
			'ofdb'	
			,'ofdb.de'	
			,'http://www.ofdb.de'		
			,'http://www.ofdb.de/view.php?page=suchergebnis&SText='
			,''
		);
		MMMSearchObj.addSearch(
			'filmstarts'	
			,'filmstarts.de'	
			,'http://www.filmstarts.de'		
			,'http://www.google.com/custom?hl=de&oe=ISO-8859-1&client=pub-7697668210662178&cof=FORID:1%3BL:http://bilder.filmstarts.de/design/filmstarts/topbanner_google.jpg%3BLH:50%3BLW:660%3BGL:1%3BBGC:FFFFFF%3BT:%23000066%3BLC:%230a2155%3BVLC:%23000033%3BALC:%230a2155%3BGALT:%230A2155%3BGFNT:%23194198%3BGIMP:%23194198%3BDIV:%230a2155%3BLBGC:194198%3BAH:left%3BS:http://www.filmstarts.de%3B&domains=www.filmstarts.de&sitesearch=www.filmstarts.de&sa=X&oi=spell&resnum=0&ct=result&cd=1&spell=1&q='
			,''
		);
		MMMSearchObj.addSearch(
			'filmspiegel'	
			,'filmspiegel.de'	
			,'http://www.filmspiegel.de'		
			,'http://www.filmspiegel.de/suche/index.php?begriff='
			,''
		);
		MMMSearchObj.addSearch(
			'kino'	
			,'kino.de'	
			,'http://www.kino.de'		
			,'http://www.kino.de/search.php?mode=megaSearch&searchCategory=all&inputSearch='
			,''
		);		
		
		
		
	MMMSearchObj.addSection("programming");
		MMMSearchObj.addSearch(
			'selfhtml'	
			,'selfhtml.org'		
			,'http://de.selfhtml.org'		
			,'http://de.selfhtml.org/navigation/suche/index.htm?Suchanfrage='
			,''
		);



		
		
		
		
		
		
		
		
MMMSearchObj.addTab("dk");
	MMMSearchObj.addSection("portals");
		MMMSearchObj.addSearch(
			'yahoo'
			,'yahoo.dk'
			,'http://www.yahoo.dk'
			,'http://dk.search.yahoo.com/search?p='
			,''
		);
    
		MMMSearchObj.addSearch(
			'jubii'
			,'jubii.dk'
			,'http://www.jubii.dk'
			,'http://search.jubii.dk/cgi-bin/pursuit?cat=loc&query='
			,''
		);

		MMMSearchObj.addSearch(
			'eniro'	
			,'eniro.dk'	
			,'http://www.eniro.dk' 
			,'http://www.eniro.dk/query?what=web_local&search_word='
			,''
		);
	MMMSearchObj.addSection("knowledge");
		MMMSearchObj.addSearch(
			'wikipedia'	
			,'da.wikipedia'	
			,'http://da.wikipedia.org' 
			,'http://da.wikipedia.org/wiki/Speciel:Search?go=G%C3%A5+til&search='
			,''
		);
	MMMSearchObj.addSection("diverse");
		MMMSearchObj.addSearch(
			'krak'	
			,'krak.dk'	
			,'http://www.krak.dk' 
			,'http://www.krak.dk/Firma/Resultat.aspx?Query='
			,''
		);

					
	
MMMSearchObj.addTab("es");	
	MMMSearchObj.addSection("portals");	
		MMMSearchObj.addSearch(
			'yahoo'
			,'yahoo.es'
			,'http://www.yahoo.es'
			,'http://es.search.yahoo.com/search?p='
			,''
		);
		
	MMMSearchObj.addSection("shopping");	
		MMMSearchObj.addSearch(
			'ebay'
			,'ebay.es'	
			,'http://www.ebay.es'
			,'http://search.ebay.es/'
			,''
		);
	
	MMMSearchObj.addSection("knowledge");
		MMMSearchObj.addSearch(
			'wikipedia'	
			,'es.wikipedia'	
			,'http://es.wikipedia.org' 
			,'http://es.wikipedia.org/wiki/Especial:Search?go=Ir&search='
			,''
		);






MMMSearchObj.addTab("fr");	
	MMMSearchObj.addSection("portals");	
		MMMSearchObj.addSearch(
			'yahoo'
			,'yahoo.fr'
			,'http://www.yahoo.fr'
			,'http://fr.search.yahoo.com/search?p='
			,''
		);
		MMMSearchObj.addSearch(
			'dmoz'		
			,'dmoz.fr'		
			,'http://www.dmoz.fr' 
			,'http://dmoz.fr/default.asp?search='
			,''
		);		
		
	MMMSearchObj.addSection("shopping");	
		MMMSearchObj.addSearch(
			'amazon'		
			,'amazon.fr'
			,'http://www.amazon.fr/gp/redirect.html?ie=UTF8&location=http%3A%2F%2Fwww.amazon.fr%2F&tag=mysearches-21&linkCode=ur2&camp=1642&creative=6746'
			,'http://www.amazon.fr/gp/search?ie=UTF8&tag=mysearches-21&index=blended&linkCode=ur2&camp=1642&creative=6746&keywords='
			,''
		);	
		MMMSearchObj.addSearch(
			'ebay'
			,'ebay.fr'	
			,'http://www.ebay.fr'
			,'http://search.ebay.fr/'
			,''
		);
		MMMSearchObj.addSearch(
			'doorone'		
			,'doorone.fr'		
			,'http://www.doorone.fr'
			,'http://doorone.fr/xFS?KW='
			,''
		);			
	MMMSearchObj.addSection("knowledge");
		MMMSearchObj.addSearch(
			'wikipedia'	
			,'fr.wikipedia'	
			,'http://fr.wikipedia.org' 
			,'http://fr.wikipedia.org/wiki/Especial:Search?go=Ir&search='
			,''
		);
		


MMMSearchObj.addTab("it");	
	MMMSearchObj.addSection("portals");	
		MMMSearchObj.addSearch(
			'yahoo'
			,'yahoo.it'
			,'http://www.yahoo.it'
			,'http://it.search.yahoo.com/search?p='
			,''
		);
		
	MMMSearchObj.addSection("shopping");	
		MMMSearchObj.addSearch(
			'ebay'
			,'ebay.it'	
			,'http://www.ebay.it'
			,'http://search.ebay.it/'
			,''
		);
	MMMSearchObj.addSection("knowledge");
		MMMSearchObj.addSearch(
			'wikipedia'	
			,'it.wikipedia'	
			,'http://it.wikipedia.org' 
			,'http://it.wikipedia.org/wiki/Speciale:Search?go=Vai&search='
			,''
		);

		
		
		
MMMSearchObj.addTab ("jp");
    MMMSearchObj.addSection("portals");    
        MMMSearchObj.addSearch(
            'yahoo'
            ,'yahoo.co.jp'
            ,'http://www.yahoo.co.jp'
            ,'http://search.yahoo.co.jp/search?p='
            ,''
        );
        MMMSearchObj.addSearch(
            'greengoo'
            ,'green.goo.ne.jp'
            ,'http://green.goo.ne.jp'
            ,'http://green.search.goo.ne.jp/search?OE=UTF-8&IE=UTF-8&from=eco_search&MT='
            ,''
        );
	MMMSearchObj.addSection("shopping");
        MMMSearchObj.addSearch (
            'amazon'        
            ,'amazon.co.jp'    
            ,'http://www.amazon.co.jp'
			,'http://www.amazon.co.jp/exec/obidos/redirect?link_code=ur2&tag=wwwmadmaxmatd-21&camp=1638&creative=6742&path=external-search%3Fsearch-type=ss%26index=blended%26keyword='
            ,''
        );
        /*	Problems with japanese characters
        MMMSearchObj.addSearch (
            'rakuten'        
            ,'rakuten.co.jp'    
            ,'http://www.rakuten.co.jp'
			,'http://esearch.rakuten.co.jp/rms/sd/esearch/vc?sv=2&sitem='
            ,''
        );
        MMMSearchObj.addSearch (
            'yahooauctions'        
            ,'auctions.yahoo.co.jp'    
            ,'http://www.auctions.yahoo.co.jp'
			,'http://search.auctions.yahoo.co.jp/jp/search/auc?auccat=0&alocale=0jp&acc=jp&p='
            ,''
        );
		*/
        
        
	MMMSearchObj.addSection("knowledge");    
        MMMSearchObj.addSearch(
            'wikipedia'
            ,'ja.wikipedia'    
            ,'http://ja.wikipedia.org' 
            ,'http://ja.wikipedia.org/wiki/%E7%89%B9%E5%88%A5:Search?search='
            ,'' 
        );
	MMMSearchObj.addSection("diverse");    
		MMMSearchObj.addSearch(
            'gnavi'    
            ,'gnavi.co.jp'        
            ,'http://www.gnavi.co.jp'    
            ,'http://gsearch.gnavi.co.jp/rest/search.php?key='
            ,'restraunt search'
        );
	MMMSearchObj.addSection("programming");    
        MMMSearchObj.addSearch(
            'ruby'    
            ,'ruby-lang.org/ja'        
            ,'http://www.ruby-lang.org/ja'    
            ,'http://www.ruby-lang.org/ja/search/?q='
            ,'ruby official in japanese' 
        );
		
		

MMMSearchObj.addTab("nl");	
	MMMSearchObj.addSection("portals");	
		MMMSearchObj.addSearch(
			'yahoo'
			,'yahoo.nl'
			,'http://www.yahoo.nl'
			,'http://nl.search.yahoo.com/search?p='
			,''
		);	
		MMMSearchObj.addSearch(
			'vinden'		
			,'vinden.nl'	
			,'http://www.vinden.nl'
			,'http://www.vinden.nl/?q='
			,''
		);		
		MMMSearchObj.addSearch(
			'dmoz'		
			,'dmoz.nl'		
			,'http://www.dmoz.nl' 
			,'http://search.dmoz.org/cgi-bin/search?cat=World%2FNederlands&all=no&search='
			,''
		);		
	
	MMMSearchObj.addSection("shopping");	
		MMMSearchObj.addSearch(
			'ebay'
			,'ebay.nl'	
			,'http://www.ebay.nl'
			,'http://search.ebay.nl/'
			,''
		);
	MMMSearchObj.addSection("knowledge");
		MMMSearchObj.addSearch(
			'wikipedia'	
			,'nl.wikipedia'	
			,'http://nl.wikipedia.org' 
			,'http://nl.wikipedia.org/wiki/Speciaal:Search?go=Artikel&search='
			,''
		);
		MMMSearchObj.addSearch(
			'uitmuntend'		
			,'uitmuntend.de DE-NL'			
			,'http://www.uitmuntend.de'
			,'http://www.uitmuntend.de/search.html?search='
			,''
		);		
		
		
		

MMMSearchObj.addTab("se");
	MMMSearchObj.addSection("portals");	
		MMMSearchObj.addSearch(
			'yahoo'
			,'yahoo.se'
			,'http://se.yahoo.com/'
			,'http://se.search.yahoo.com/search?p='
			,''
		);
		MMMSearchObj.addSearch(
			'spray'		
			,'spray.se'	
			,'http://www.spray.se'
			,'http://lycossvar.spray.se/cgi-bin/pursuit?query='
			,''
		);	
		MMMSearchObj.addSearch(
			'eniro'	
			,'eniro.se'	
			,'http://www.eniro.se' 
			,'http://www.eniro.se/query?what=se&q='
			,''
		);
	
	MMMSearchObj.addSection("shopping");	
		MMMSearchObj.addSearch(
			'ebay'
			,'ebay.se'	
			,'http://www.ebay.se'
			,'http://www.ebay.se/listResults?browse=0&Query='
			,''
		);
	
	
	MMMSearchObj.addSection("knowledge");	
		MMMSearchObj.addSearch(
			'wikipedia'	
			,'sv.wikipedia'	
			,'http://sv.wikipedia.org' 
			,'http://sv.wikipedia.org/wiki/Special:Search?go=G%C3%A5+till&search='
			,''
		);
	
	
	MMMSearchObj.addSection("diverse");	
		MMMSearchObj.addSearch(
			'hitta'	
			,'hitta.se'	
			,'http://www.hitta.se' 
			,'http://www.hitta.se/SearchMixed.aspx?UCSB%3aTextBoxWho='
			,''
		);
	
	
	
	
MMMSearchObj.addTab("uk");
	MMMSearchObj.addSection("portals");	
		MMMSearchObj.addSearch(
			'yahoo'
			,'yahoo.co.uk'
			,'http://www.yahoo.co.uk'
			,'http://uk.search.yahoo.com/search?p='
			,''
		);
	
	MMMSearchObj.addSection("news");		
		MMMSearchObj.addSearch(
			'bbc'		
			,'bbc.co.uk'
			,'http://www.bbc.co.uk'
			,'http://search.bbc.co.uk/cgi-bin/search/results.pl?q='
			,''
		);	
		MMMSearchObj.addSearch(
			'guardian'		
			,'guardian.co.uk'
			,'http://www.guardian.co.uk'
			,'http://browse.guardian.co.uk/search?search='
			,''
		);
		MMMSearchObj.addSearch(
			'newscientist'		
			,'newscientist.com'
			,'http://www.newscientist.com'
			,'http://www.newscientist.com/search.ns?query='
			,''
		);
		
		http://www.newscientist.com/search.ns?query=test
		
	
	MMMSearchObj.addSection("shopping");
		MMMSearchObj.addSearch(
			'ebay'
			,'ebay.co.uk'	
			,'http://www.ebay.co.uk'
			,'http://search.ebay.co.uk/'
			,''
		);
		MMMSearchObj.addSearch(
			'amazon'		
			,'amazon.co.uk'	
			,'http://www.amazon.co.uk/gp/redirect.html?ie=UTF8&location=http%3A%2F%2Fwww.amazon.co.uk%2F&tag=mulseagad05-21&linkCode=ur2&camp=1634&creative=6738'
			,'http://www.amazon.co.uk/gp/search?ie=UTF8&tag=mulseagad05-21&index=blended&linkCode=ur2&camp=1634&creative=6738&keywords='
			,''
		);
		MMMSearchObj.addSearch(
			'doorone'		
			,'doorone.uk'		
			,'http://www.doorone.co.uk'
			,'http://doorone.co.uk/xFS?KW='
			,''
		);
		MMMSearchObj.addSearch(
			'play'		
			,'play.com'		
			,'http://www.play.com'
			,'http://www.play.com/Search.aspx?searchtype=allproducts&searchstring='
			,''
		);			

		
MMMSearchObj.addTab("us");
	MMMSearchObj.addSection("portals");
		MMMSearchObj.addSearch(
			'yahoo'
			,'yahoo.com'
			,'http://www.yahoo.com'
			,'http://search.yahoo.com/search?p='
			,''
		);
		MMMSearchObj.addSearch(
			'creativecommons'
			,'creativecommons.org'
			,'http://creativecommons.org'
			,'http://search.creativecommons.org/?q='
			,''
		);
		MMMSearchObj.addSearch(
			'metacrawler'		
			,'metacrawler.com'		
			,'http://www.metacrawler.com' 
			,'http://www.metacrawler.com/info.metac/search/web/'
			,''
		);				
	MMMSearchObj.addSection("shopping");
		MMMSearchObj.addSearch(
			'ebay'
			,'ebay.com'	
			,'http://www.ebay.com'
			,'http://search.ebay.com/'
			,''
		);
		MMMSearchObj.addSearch(
			'amazon'		
			,'amazon.com'	
			,'http://www.amazon.com/gp/redirect.html?ie=UTF8&location=http%3A%2F%2Fwww.amazon.com%2F&tag=mysearches-20&linkCode=ur2&camp=1789&creative=9325'
			,'http://www.amazon.com/gp/search?ie=UTF8&tag=mysearches-20&index=blended&linkCode=ur2&camp=1789&creative=9325&keywords='
			,''
		);		
		
		
	MMMSearchObj.addSection("finance");		
		MMMSearchObj.addSearch(
			'ft'		
			,'financialtimes.com'
			,'http://www.ft.com'
			,'http://search.ft.com/searchResults?queryText='
			,''
		);
	
	
	MMMSearchObj.addSection("knowledge");
		MMMSearchObj.addSearch(
			'wikipedia'	
			,'en.wikipedia'	
			,'http://en.wikipedia.org' 
			,'http://en.wikipedia.org/wiki/Spezial:Search?go=Artikel&search='
			,''
		);
		MMMSearchObj.addSearch(
			'about'
			,'about.com'
			,'http://www.about.com'
			,'http://search.about.com/fullsearch.htm?terms='
			,''
		);	
		MMMSearchObj.addSearch(
			'hakia'	
			,'hakia.com'	
			,'http://www.hakia.com' 
			,'http://www.hakia.com/search.aspx?q='
			,''
		);		
		MMMSearchObj.addSearch(
			'answer'	
			,'answer.com'	
			,'http://www.answer.com' 
			,'http://www.answers.com/main/ntquery?s='
			,'The worlds greatest encyclodictionalmanacapedia'
		);
		MMMSearchObj.addSearch(
			'thefreedictionary'	
			,'thefreedictionary.com'	
			,'http://www.thefreedictionary.com' 
			,'http://www.thefreedictionary.com/'
			,''
		);
		MMMSearchObj.addSearch(
			'wikihow'	
			,'wikihow.com'	
			,'http://www.wikihow.com' 
			,'http://www.wikihow.com/Special:LSearch?fulltext=Search&search='
			,''
		);		
		MMMSearchObj.addSearch(
			'acronymfinder'	
			,'acronymfinder.com'	
			,'http://www.acronymfinder.com'
			,'http://www.acronymfinder.com/af-query.asp?Acronym='
			,''
		);		
		MMMSearchObj.addSearch(
			'urbandictionary'	
			,'urbandictionary.com'	
			,'http://www.urbandictionary.com'
			,'http://www.urbandictionary.com/define.php?term='
			,''
		);		

		

		
		
MMMSearchObj.addTab("aa");
	MMMSearchObj.addSection("google");	
		MMMSearchObj.addSearch(
			'google'		
			,'google.com (ENTER)'
			,'http://google.com' 
			,'http://www.google.com/search?q='
			,'Also search google with ENTER'
		);
		MMMSearchObj.addSearch(
			'googleblogsearch'		
			,'blogsearch.google.com'
			,'http://blogsearch.google.com' 
			,'http://blogsearch.google.com/blogsearch?&ui=blg&q='
			,'Search for blogs'
		);		
        MMMSearchObj.addSearch(
		    'googlebookmarks'    
		    ,'google.com/bookmarks'
		    ,'http://www.google.com/bookmarks' 
		    ,'http://www.google.com/bookmarks/find?q='
		    ,'Search for your private bookmarks'
		);    
        MMMSearchObj.addSearch(
			'googlebooks'		
			,'books.google.com'
			,'http://books.google.com' 
			,'http://books.google.com/books?q='
			,''
		);
		MMMSearchObj.addSearch(
			'googlecodesearch'
			,'google.com/codesearch'
			,'http://www.google.com/codesearch'
			,'http://www.google.com/codesearch?q='
			,''
		);
		MMMSearchObj.addSearch(
			'googledirectory'
			,'directory.google.com'
			,'http://directory.google.com/'
			,'http://www.google.com/search?hl=en&cat=gwd%2FTop&q='
			,''
		);
        MMMSearchObj.addSearch(
	        'googledocs'
	        ,'docs.google.com'
	        ,'http://docs.google.com'
	        ,'http://docs.google.com/#search/'
	        ,''
	    );
 		MMMSearchObj.addSearch(
			'googlefinance'	
			,'finance.google.com'
			,'http://finance.google.com'	
			,'http://finance.google.com/finance?q='
			,''
		);
		MMMSearchObj.addSearch(
			'googlegroups'	
			,'groups.google.com'
			,'http://groups.google.com'	
			,'http://groups.google.com/groups/search?q='
			,''
		);
		MMMSearchObj.addSearch(
			'googlehistory'	
			,'google.com/history'
			,'http://www.google.com/history'	
			,'http://www.google.com/history/find?q='
			,''
		);
		MMMSearchObj.addSearch(
			'googleimages'	
			,'images.google.com'
			,'http://images.google.com'	
			,'http://images.google.com/images?q='
			,''
		);
		MMMSearchObj.addSearch(
			'googlegadget'		
			,'igoogle gadget directory'
			,'http://www.google.com/ig/directory'
			,'http://www.google.com/ig/directory?q='
			,'Gadget search in iGoogle directory'
		);		
		MMMSearchObj.addSearch(
			'googlejaiku'		
			,'jaiku.com'
			,'http://jaiku.com'
			,'http://jaiku.com/explore/find?query='
			,''
		);		
		MMMSearchObj.addSearch(
			'googleknol'		
			,'knol.google.com'
			,'http://knol.google.com'
			,'http://knol.google.com/k/knol/system/knol/pages/Search?restrict=general&q='
			,'A unit of knowledge'
		);		
	    MMMSearchObj.addSearch(
	      'googlelinux'    
	      ,'google.com/linux'
	      ,'http://www.google.com/linux'
	      ,'http://www.google.com/linux?q='
	      ,''
	    );      
        MMMSearchObj.addSearch(
			'googlelively'		
			,'lively.com'
			,'http://www.lively.com'
			,'http://www.lively.com/search?query='
			,'Create an avatar and chat with your friends in rooms you design'
		);			
		MMMSearchObj.addSearch(
			'googlemaps'		
			,'maps.google.com'
			,'http://maps.google.com'
			,'http://maps.google.com/maps?q='
			,''
		);
		MMMSearchObj.addSearch(
			'googlenews'		
			,'news.google.com'
			,'http://news.google.com'
			,'http://news.google.com/news?q='
			,''
		);
		MMMSearchObj.addSearch(
			'googleorkut'
			,'orkut.com'	
			,'http://www.orkut.com'
			,'http://www.orkut.com/UniversalSearch.aspx?origin=box&exp=1&q='
			,''
		);
		MMMSearchObj.addSearch(
			'googlepicasa'
			,'picasaweb.google.com'	
			,'http://picasaweb.google.com'
			,'http://picasaweb.google.com/lh/searchbrowse?q='
			,''
		);
        MMMSearchObj.addSearch(
	      'googlepatents'
	      ,'google.com/patents'
	      ,'http://www.google.com/patents'
	      ,'http://www.google.com/patents?q='
	      ,''
	    );
 		MMMSearchObj.addSearch(
			'googleproducts'
			,'google.com/products'
			,'http://www.google.com/products'
			,'http://www.google.com/products?q='
			,''
		);
		MMMSearchObj.addSearch(
			'googlescholar'
			,'scholar.google.com'	
			,'http://scholar.google.com'
			,'http://scholar.google.com/scholar?q='
			,''
		);
		MMMSearchObj.addSearch(
			'googlesites'	
			,'sites.google.com'	
			,'http://sites.google.com'
			,'http://sites.google.com/site/sites/system/app/pages/meta/search?q='
			,''
		);
        MMMSearchObj.addSearch(
			'googletranslate' 
			,'translate.google.com' 
			,'http://translate.google.com'
			,'http://translate.google.com/translate_t#auto|en|'
			,''
	    );
    	MMMSearchObj.addSearch(
			'googlevideo'	
			,'video.google.com'	
			,'http://video.google.com'
			,'http://video.google.com/videosearch?q='
			,''
		);
		MMMSearchObj.addSearch(
			'youtube'	
			,'youtube.com'	
			,'http://www.youtube.com'
			,'http://www.youtube.com/results?search_query='
			,''
		);
		MMMSearchObj.addSearch(
			'searchmash'	
			,'searchmash.com'	
			,'http://www.searchmash.com'
			,'http://www.searchmash.com/search/'
			,'Spezial Google search engine to test new features.'
		);
		MMMSearchObj.addSearch(
			'googlemodules'	
			,'googlemodules.com'	
			,'http://www.googlemodules.com'
			,'http://www.googlemodules.com/?mode=showSearchResults&q='
			,''
		);
		MMMSearchObj.addSearch(
			'gwb'	
			,'googlewatchblog.de'	
			,'http://www.googlewatchblog.de'
			,'http://www.googlewatchblog.de/index.php?s='
			,''
		);		
			

	MMMSearchObj.addSection("portals");	
		MMMSearchObj.addSearch(
			'live'
			,'live.com'	
			,'http://www.live.com'
			,'http://search.live.com/results.aspx?q='
			,''
		);
		MMMSearchObj.addSearch(
			'altavista'
			,'altavista.com'
			,'http://www.altavista.com'
			,'http://www.altavista.com/web/results?q='
			,''
		);
		MMMSearchObj.addSearch(
			'ask'
			,'ask.com'	
			,'http://www.ask.com'
			,'http://www.ask.com/web?q='
			,''
		);
		MMMSearchObj.addSearch(
			'yubnub'
			,'yubnub.org'	
			,'http://www.yubnub.org'
			,'http://yubnub.org/parser/parse?command='
			,''
		);
		MMMSearchObj.addSearch(
			'a9'
			,'a9.com'	
			,'http://opensearch.a9.com'
			,'http://a9.com/?q='
			,'search for more at once'
		);
        MMMSearchObj.addSearch(
	        'wolframalpha'
	        ,'wolframalpha.com' 
	        ,'http://wolframalpha.com'
	        ,'http://wolframalpha.com/input/?'
	        ,'computational knowledge engine'
	    );
		MMMSearchObj.addSearch(
			'snap'
			,'snap.com'	
			,'http://www.snap.com'
			,'http://www.snap.com/#'
			,'The other way to search'
		);
		MMMSearchObj.addSearch(
			'kartoo'
			,'kartoo.com'	
			,'http://www.kartoo.com'
			,'http://www.kartoo.com/flash04.php3?langue=en&q='
			,'The other way to search'
		);
		MMMSearchObj.addSearch(
			'cuil'
			,'cuil.com'	
			,'http://www.cuil.com'
			,'http://www.cuil.com/search?q='
			,'Cuil is an old Irish word for knowledge. For knowledge, ask Cuil.'
		);
		

		
	MMMSearchObj.addSection("xxx");	
		MMMSearchObj.addSearch(
			'boysfood'
			,'boysfood.com'	
			,'http://www.boysfood.com'
			,'http://www.boysfood.com/cgi-bin/bfn.cgi?search='
			,''
		);	
		MMMSearchObj.addSearch(
			'flurl'
			,'flurl.com'	
			,'http://www.flurl.com'
			,'http://www.flurl.com/search?q='
			,''
		);	
        MMMSearchObj.addSearch(
	        'freesextubes'
	        ,'freesextubes.com'  
	        ,'http://www.freesextubes.com'
	        ,'http://www.freesextubes.com/search/'
	        ,''
	    );  
		MMMSearchObj.addSearch(
			'kindgirls'
			,'kindgirls.com'	
			,'http://kindgirls.com'
			,'http://kindgirls.com/search.php?s='
			,''
		);	
        MMMSearchObj.addSearch(
	        'mrsnake'
            ,'mrsnake.com'  
            ,'http://www.mrsnake.com'
            ,'http://www.mrsnake.com/videos.php?q='
            ,''
        );  
    
    
		/*
        nicht mehr gut ! 
        MMMSearchObj.addSearch(
			'masterwanker'
			,'masterwanker.com'	
			,'http://www.masterwanker.com'
			,'http://www.masterwanker.com/?p=search&|0|'
			,''
		);
		now with login
		MMMSearchObj.addSearch(
			'megarotic'
			,'megarotic.com'	
			,'http://www.megarotic.com'
			,'http://www.flurl.com/search?sort_by=related&site_id=1083q='
			,''
		);
		*/
		MMMSearchObj.addSearch(
			'pornative'
			,'pornative.com'	
			,'http://www.pornative.com'
			,'http://www.pornative.com/search/rating/1.html?search='
			,''
		);
        MMMSearchObj.addSearch(
	        'pornhub'
	        ,'pornhub.com'  
	        ,'http://pornhub.com'
	        ,'http://www.pornhub.com/video/search?search='
	        ,''
	    );    
		MMMSearchObj.addSearch(
			'pornotube'
			,'pornotube.com'	
			,'http://pornotube.com'
			,'http://pornotube.com/search.php?q='
			,''
		);		
		MMMSearchObj.addSearch(
			'redtube'
			,'redtube.com'	
			,'http://www.redtube.com'
			,'http://www.redtube.com/?search='
			,''
		);
        MMMSearchObj.addSearch(
            'shufuni'
            ,'shufuni.com'  
            ,'http://www.shufuni.com'
            ,'http://www.shufuni.com/SearchResult.aspx?search='
            ,''
        );
        MMMSearchObj.addSearch(
	        'thesextubesite'
	        ,'thesextubesite.com'  
	        ,'http://www.thesextubesite.com'
	        ,'http://www.thesextubesite.com/search/'
	        ,''
	    );
		MMMSearchObj.addSearch(
			'tube8'
			,'tube8.com'	
			,'http://www.tube8.com'
			,'http://www.tube8.com/search.html?q='
			,''
		);
		MMMSearchObj.addSearch(
			'vidz'
			,'vidz.com'	
			,'http://www.vidz.com'
			,'http://www.vidz.com/search?q='
			,''
		);		
		MMMSearchObj.addSearch(
			'xmissyporn'
			,'xmissyporn.com'	
			,'http://www.xmissyporn.com'
			,'http://www.xmissyporn.com/index.php?amount=0&blogid=9&query='
			,''
		);
		MMMSearchObj.addSearch(
			'xnxx'
			,'xnxx.com'	
			,'http://www.xnxx.com'
			,'http://video.xnxx.com/?k='
			,''
		);
		MMMSearchObj.addSearch(
			'xtube'
			,'xtube.com'	
			,'http://www.xtube.com'
			,'http://www.xtube.com/results.php?type=video&search='
			,''
		);
		MMMSearchObj.addSearch(
			'xvideos'
			,'xvideos.com'	
			,'http://www.xvideos.com'
			,'http://www.xvideos.com/?k='
			,''
		);
		MMMSearchObj.addSearch(
			'youporn'
			,'youporn.com'	
			,'http://www.youporn.com'
			,'http://youporn.com/search?query='
			,''
		);
		MMMSearchObj.addSearch(
			'yourfilehost'
			,'yourfilehost.com'	
			,'http://www.yourfilehost.com'
			,'http://www.flurl.com/search?sort_by=related&site_id=147&q='
			,''
		);
			
		
//		http://www.newsfilter.org
//	http://www.newsfilter.org/index.php?content=2&SearchText=girl	
		
		
		

	MMMSearchObj.addSection("knowledge");	
		MMMSearchObj.addSearch(
			'wikiwix'
			,'wikiwix.com'	
			,'http://www.wikiwix.com'
			,'http://www.wikiwix.com/index.php?art=true&action='
			,'The ultimate Wikipedia articles search engine'
		);
		MMMSearchObj.addSearch(
			'wikia'
			,'wikia.com'	
			,'http://alpha.search.wikia.com'
			,'http://re.search.wikia.com/search#'
			,'Search is part of the fundamental infrastructure of the Internet. And we are making it open source'
		);
		MMMSearchObj.addSearch(
			'onelook'
			,'onelook.com'	
			,'http://www.onelook.com'
			,'http://www.onelook.com/?w='
			,'One Click - Multi Dictionary Search'
		);
		MMMSearchObj.addSearch(
			'reference'	
			,'reference.com'	
			,'http://www.reference.com' 
			,'http://www.reference.com/browse/all/'
			,''
		);
		MMMSearchObj.addSearch(
			'thesaurus'	
			,'thesaurus.com'	
			,'http://www.thesaurus.com' 
			,'http://thesaurus.reference.com/browse/'
			,''
		);
		MMMSearchObj.addSearch(
			'dictionary'	
			,'dictionary.com'	
			,'http://www.dictionary.com' 
			,'http://dictionary.reference.com/browse/'
			,''
		);
		MMMSearchObj.addSearch(
			'archive'
			,'archive.org'	
			,'http://www.archive.org'
			,'http://www.archive.org/search.php?query='
			,'Universal Access to human knowledge'
		);
		MMMSearchObj.addSearch(
			'waybackmachine'
			,'WayBackMachine'	
			,'http://web.archive.org/collections/web.html'
			,'http://web.archive.org/archive_request_ng?url='
			,'Surf the web as it was'
		);
		/*
        MMMSearchObj.addSearch(
			'verbix_de'
			,'verbix.com German'	
			,'http://www.verbix.com/webverbix'
			,'http://www.verbix.com/webverbix/go.asp?language=ger&verb='
			,'Conjugate german verbs'
		);
		MMMSearchObj.addSearch(
			'verbix_es'
			,'verbix.com Spanish'	
			,'http://www.verbix.com/webverbix'
			,'http://www.verbix.com/webverbix/go.asp?language=esp&verb='
			,'Conjugate spanish verbs'
		);
		MMMSearchObj.addSearch(
			'verbix_fr'
			,'verbix.com French'	
			,'http://www.verbix.com/webverbix'
			,'http://www.verbix.com/webverbix/go.asp?language=fra&verb='
			,'Conjugate french verbs'
		);
		MMMSearchObj.addSearch(
			'verbix_it'
			,'verbix.com Italien'	
			,'http://www.verbix.com/webverbix'
			,'http://www.verbix.com/webverbix/go.asp?language=ita&verb='
			,'Conjugate italien verbs'
		);
		MMMSearchObj.addSearch(
			'verbix_pt'
			,'verbix.com Portuguese'	
			,'http://www.verbix.com/webverbix'
			,'http://www.verbix.com/webverbix/go.asp?language=por&verb='
			,'Conjugate portuguese verbs'
		);
        */

	MMMSearchObj.addSection("community");		
		MMMSearchObj.addSearch(
			'myspace'		
			,'myspace.com'
			,'http://www.myspace.com'
			,'http://searchservice.myspace.com/index.cfm?fuseaction=search&searchType=network&searchBy=First&Submit=Suchen&SearchBoxID=FindAFriend&f_first_name='
			,''
		);
		MMMSearchObj.addSearch(
			'facebook'		
			,'facebook.com'
			,'http://www.facebook.com'
			,'http://www.facebook.com/srch.php?nm='
			,'Facebook is a social utility that connects you with the people around you.'
		);
		MMMSearchObj.addSearch(
			'linkedin'		
			,'linkedin.com'
			,'http://www.linkedin.com'
			,'http://www.linkedin.com/search?search=&sortCriteria=4&rd=out&keywords='
			,'Share knowledge and tap into relationships.'
		);
		MMMSearchObj.addSearch(
			'hi5'		
			,'hi5.com'
			,'http://www.hi5.com'
			,'http://hi5.com/friend/processBrowseSearch.do?searchText='
			,'Discover, Connect, Communicate'
		);
		MMMSearchObj.addSearch(
			'wayn'		
			,'wayn.com'
			,'http://www.wayn.com'
			,'http://www.wayn.com/waynsearches.html?wci=namesearchresults&country=All%20Countries&forename=&surname='
			,'Where are you now?'
		);
		MMMSearchObj.addSearch(
			'classmates'		
			,'classmates.com'
			,'http://www.classmates.com'
			,'http://www.classmates.com/search/mastheadSearch.do?queryString='
			,'Real people, real names.'
		);
        MMMSearchObj.addSearch(
	      'twitter'    
	      ,'twitter.com'
	      ,'http://www.twitter.com'
	      ,'http://search.twitter.com/search?q='
	      ,'See what\'s happening — right now.'
	    );
		
    
    
		
	// http://www.socialmarker.com
	MMMSearchObj.addSection("bookmarking");	
		MMMSearchObj.addSearch(
			'digg'
			,'digg.com'	
			,'http://digg.com'
			,'http://digg.com/search?section=all&s='
			,''
		);
		MMMSearchObj.addSearch(
			'delicious'
			,'del.icio.us'	
			,'http://del.icio.us'
			,'http://del.icio.us/search/?fr=del_icio_us&type=all&p='
			,''
		);		
		MMMSearchObj.addSearch(
			'reddit'
			,'reddit.com'	
			,'http://reddit.com'
			,'http://reddit.com/search?q='
			,''
		);		
		
		

	MMMSearchObj.addSection("media");	
		MMMSearchObj.addSearch(
			'flickr'
			,'flickr.com'		
			,'http://flickr.com'				
			,'http://flickr.com/search/?q='
			,''
		);
		MMMSearchObj.addSearch(
			'hulu'
			,'hulu.com'		
			,'http://hulu.com'				
			,'http://www.hulu.com/videos/search?query='
			,''
		);
		MMMSearchObj.addSearch(
			'brightcove'
			,'brightcove.com'		
			,'http://www.brightcove.com'				
			,'http://www.brightcove.com/search/search.cfm?cx=011043846403879487989%3Aoa7iaakkyzm&cof=FORID%3A11%3BNB%3A1&q='
			,''
		);
		MMMSearchObj.addSearch(
			'livevideo'	
			,'livevideo.com'	
			,'http://www.livevideo.com'
			,'http://www.livevideo.com/media/search.aspx?d=1&tag='
			,''
		);		
		MMMSearchObj.addSearch(
			'purevideo'	
			,'purevideo.com'	
			,'http://www.purevideo.com'
			,'http://www.purevideo.com/video-'
			,'First Internet Video Meta Search'
		);		
		MMMSearchObj.addSearch(
			'imdb'
			,'imdb.com'		
			,'http://www.imdb.com'
			,'http://www.imdb.com/find?q='
			,''
		);
		MMMSearchObj.addSearch(
			'yahoovideo'
			,'video.yahoo.com'		
			,'http://video.yahoo.com'
			,'http://video.yahoo.com/video/search?p='
			,''
		);
		MMMSearchObj.addSearch(
			'photobucket'
			,'photobucket.com'		
			,'http://photobucket.com'
			,'http://photobucket.com/images/'
			,''
		);
		MMMSearchObj.addSearch(
			'dailymotion'
			,'dailymotion.com'		
			,'http://www.dailymotion.com'
			,'http://www.dailymotion.com/videos/relevance/search/'
			,''
		);
		MMMSearchObj.addSearch(
			'megavideo'
			,'megavideo.com'		
			,'http://www.megavideo.com'
			,'http://www.megavideo.com/?c=search&s='
			,''
		);
		MMMSearchObj.addSearch(
			'videojug'
			,'videojug.com'		
			,'http://www.videojug.com'
			,'http://www.videojug.com/search?keywords='
			,''
		);
		MMMSearchObj.addSearch(
			'teachertube'
			,'teachertube.com'		
			,'http://www.teachertube.com'
			,'http://www.teachertube.com/search_result.php?search_id='
			,'Teach the world'
		);	
		MMMSearchObj.addSearch(
			'metacafe'
			,'metacafe.com'		
			,'http://www.metacafe.com'
			,'http://www.metacafe.com/tags/'
			,''
		);
		MMMSearchObj.addSearch(
			'heavy'
			,'heavy.com'		
			,'http://www.heavy.com'
			,'http://www.heavy.com/search?action=videos&tag='
			,''
		);
		MMMSearchObj.addSearch(
			'alluc'
			,'alluc.org'		
			,'http://www.alluc.org'
			,'http://www12.alluc.org/alluc/no_cache/results.html?tx_ansearchit_resOverview%5Bsection%5D=3.&tx_ansearchit_resOverview%5BsWord%5D='
			,''
		);
		MMMSearchObj.addSearch(
			'fanpop'
			,'fanpop.com'		
			,'http://www.fanpop.com'
			,'http://www.fanpop.com/search/'
			,''
		);
		


		
				
	MMMSearchObj.addSection("programming");	
		MMMSearchObj.addSearch(
			'php'
			,'php.net'
			,'http://www.php.net'
			,'http://de3.php.net/manual-lookup.php?lang=de&pattern='
			,''
		);
		MMMSearchObj.addSearch(
			'msdn'	
			,'msdn.com'		
			,'http://www.msdn.microsoft.com'	
			,'http://search.msdn.microsoft.com/search/default.aspx?query='
			,''
		);
		MMMSearchObj.addSearch(
			'sourceforge'	
			,'sourceforge.net'		
			,'http://www.sourceforge.net'	
			,'http://sourceforge.net/search/?type_of_search=soft&words='
			,''
		);		
		MMMSearchObj.addSearch(
			'apidoc'	
			,'apidoc.org'		
			,'http://apidoc.org'	
			,'http://apidoc.org/search?q='
			,''
		);
		MMMSearchObj.addSearch(
            'ruby'    
            ,'ruby-lang.org'        
            ,'http://www.ruby-lang.org/en/'    
            ,'http://www.ruby-lang.org/en/search/?q='
            ,'ruby official'
        );
		MMMSearchObj.addSearch(
            'krugle'    
            ,'krugle.com'        
            ,'http://krugle.com'    
            ,'http://krugle.com/kse/files?query='
            ,'>>> find code'
        );		
		MMMSearchObj.addSearch(
            'koders'    
            ,'koders.com'        
            ,'http://www.koders.com'    
            ,'http://www.koders.com/default.aspx?s='
            ,''
        );			
		MMMSearchObj.addSearch(
            'perldoc'    
            ,'perldoc.perl.org'        
            ,'http://perldoc.perl.org'    
            ,'http://perldoc.perl.org/search.html?q='
            ,''
        );		
        MMMSearchObj.addSearch(
            'perlmonks'    
            ,'perlmonks.org'        
            ,'http://www.perlmonks.org'    
            ,'http://www.perlmonks.org/?node='
            ,''
        );		
        MMMSearchObj.addSearch(
            'portableapps'    
            ,'portableapps.com'        
            ,'http://www.portableapps.com'    
            ,'http://portableapps.com/search/node/'
            ,''
        );					
		MMMSearchObj.addSearch(
            'ajaxrain'    
            ,'ajaxrain.com'        
            ,'http://www.ajaxrain.com'    
            ,'http://www.ajaxrain.com/search.php?seVal='
            ,'JS libs'
        );					

		
		
		
	MMMSearchObj.addSection("torrent");	
		MMMSearchObj.addSearch(
			'torrentsearchbar'
			,'torrent-search-bar.com'	
			,'http://www.torrent-search-bar.com'
			,'http://www.google.com/custom?cx=007543263361953292879%3Aip0b-z8nzwc&sa=Search&cof=GFNT%3A%23000000%3BGALT%3A%23008000%3BLH%3A51%3BCX%3ATorrent%2520Search%3BVLC%3A%23663399%3BDIV%3A%23FFFFFF%3BFORID%3A1%3BT%3A%23000000%3BALC%3A%230000CC%3BLC%3A%230000CC%3BS%3Ahttp%3A%2F%2Fwww%2Etorrent-search-bar%2Ecom%2F%3BL%3Ahttp%3A%2F%2Fwww%2Etorrent-search-bar%2Ecom%2Ftorrent_search_logo_s%2Egif%3BGIMP%3A%23000000%3BLP%3A1%3BBGC%3A%23FFFFFF%3BAH%3Aleft&client=pub-4359655221859943&q='
			,''
		);
		MMMSearchObj.addSearch(
			'torrentsbooth'
			,'torrentsbooth.com'	
			,'http://www.torrentsbooth.com'
			,'http://www.torrentsbooth.com/torrentsearch.html?cx=003343599837851107519%3Ad8dqv2x7u-8&cof=FORID%3A10&q='
			,''
		);
		MMMSearchObj.addSearch(
			'torrentportal'
			,'torrentportal.com'	
			,'http://www.torrentportal.com'
			,'http://www.torrentportal.com/torrents-search.php?search='
			,''
		);
		MMMSearchObj.addSearch(
			'torrentscoop'
			,'torrentscoop.com'	
			,'http://torrentscoop.com'
			,'http://torrentscoop.com/results.php?google_ad_client=&cx=004204163392280045974%3A6_k16oycl5e&cof=FORID%3A10&q='
			,''
		);		
		MMMSearchObj.addSearch(
			'torrent-finder'
			,'torrent-finder.com'	
			,'http://www.torrent-finder.com'
			,'http://torrent-finder.com/show.php?Search=Search&PageLoad=oneattime&select=ALL&kywrd='
			,''
		);
	
		MMMSearchObj.addSearch(
			'btjunkie'
			,'btjunkie.org'	
			,'http://www.btjunkie.org'
			,'http://btjunkie.org/search?q='
			,''
		);		
		MMMSearchObj.addSearch(
			'isohunt'
			,'isohunt.com'	
			,'http://www.isohunt.com'
			,'http://www.isohunt.com/torrents/'
			,''
		);		
		MMMSearchObj.addSearch(
			'mininova'
			,'mininova.org'	
			,'http://www.mininova.org'
			,'http://www.mininova.org/search/?search='
			,''
		);
		MMMSearchObj.addSearch(
			'meganova'
			,'meganova.org'	
			,'http://www.meganova.org'
			,'http://www.meganova.org/search.php?order=5&search='
			,''
		);				
		MMMSearchObj.addSearch(
			'thepiratebay'
			,'thepiratebay.org'	
			,'http://www.thepiratebay.org'
			,'http://thepiratebay.org/search.php?orderby=se&q='
			,''
		);		
		MMMSearchObj.addSearch(
			'torrentspy'
			,'torrentspy.com'	
			,'http://www.torrentspy.com'
			,'http://www.torrentspy.com/search?query='
			,''
		);		

	/*	MMMSearchObj.addSearch(
			'binsearch'
			,'binsearch.info'	
			,'http://www.binsearch.info'
			,'http://www.binsearch.info/index.php?max=25&adv_g=&adv_age=7&adv_sort=date&minsize=&maxsize=&font=&postdate=&q='
			,''
		);
	*/	
		MMMSearchObj.addSearch(
			'yabse'
			,'yabse.com'	
			,'http://yabse.com'
			,'http://yabse.com/index.php?q='
			,''
		);

		
	MMMSearchObj.addSection("games");	
		MMMSearchObj.addSearch(
			'ign'
			,'ign.com'	
			,'http://www.ign.com'
			,'http://search.ign.com/products?query='
			,''
		);		
		MMMSearchObj.addSearch(
			'gamespot'
			,'gamespot.com'	
			,'http://www.gamespot.com'
			,'http://www.gamespot.com/search.html?type=11&stype=all&tag=search%3Bbutton&qs='
			,''
		);		
		MMMSearchObj.addSearch(
			'gamefaqs'
			,'gamefaqs.com'	
			,'http://www.gamefaqs.com'
			,'http://www.gamefaqs.com/search/index.html?game='
			,''
		);		
		MMMSearchObj.addSearch(
			'gamerankings'
			,'gamerankings.com'	
			,'http://www.gamerankings.com'
			,'http://www.gamerankings.com/itemrankings/simpleratings.asp?itemname='
			,''
		);		
	

		
			
	MMMSearchObj.addSection("wow");	
		MMMSearchObj.addSearch(
			'thottbot'
			,'thottbot.com'	
			,'http://www.thottbot.com'
			,'http://www.thottbot.com/?s='
			,''
		);		
		MMMSearchObj.addSearch(
			'allakhazam'
			,'allakhazam.com'	
			,'http://www.allakhazam.com'
			,'http://wow.allakhazam.com/search.html?q='
			,''
		);		
		MMMSearchObj.addSearch(
			'wowhead'
			,'wowhead.com'	
			,'http://www.wowhead.com'
			,'http://www.wowhead.com/?search='
			,''
		);		
		MMMSearchObj.addSearch(
			'goblinworkshop'
			,'goblinworkshop.com'	
			,'http://www.goblinworkshop.com'
			,'http://www.goblinworkshop.com/search2.html?s='
			,''
		);		
		MMMSearchObj.addSearch(
			'wowguru'
			,'wowguru.com'	
			,'http://www.wowguru.com'
			,'http://www.wowguru.com/db/search.php?q='
			,''
		);		
		MMMSearchObj.addSearch(
			'warcry'
			,'warcry.com'	
			,'http://www.warcry.com'
			,'http://wow.warcry.com/db/search.php?sh='
			,''
		);		
