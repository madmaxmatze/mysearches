

/*
 * jQuery JSON Plugin (http://code.google.com/p/jquery-json/)
 * version: 2.1 (2009-08-14)
 *
 * This document is licensed as free software under the terms of the
 * MIT License: http://www.opensource.org/licenses/mit-license.php
 *
 * Brantley Harris wrote this plugin. It is based somewhat on the JSON.org 
 * website's http://www.json.org/json2.js, which proclaims:
 * "NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.", a sentiment that
 * I uphold.
 *
 * It is also influenced heavily by MochiKit's serializeJSON, which is 
 * copyrighted 2005 by Bob Ippolito.
 */
 
(function($) {
    /** jQuery.toJSON( json-serializble )
        Converts the given argument into a JSON respresentation.

        If an object has a "toJSON" function, that will be used to get the representation.
        Non-integer/string keys are skipped in the object, as are keys that point to a function.

        json-serializble:
            The *thing* to be converted.
     **/
    $.toJSON = function(o)
    {
        if (typeof(JSON) == 'object' && JSON.stringify)
            return JSON.stringify(o);
        
        var type = typeof(o);
    
        if (o === null)
            return "null";
    
        if (type == "undefined")
            return undefined;
        
        if (type == "number" || type == "boolean")
            return o + "";
    
        if (type == "string")
            return $.quoteString(o);
    
        if (type == 'object')
        {
            if (typeof o.toJSON == "function") 
                return $.toJSON( o.toJSON() );
            
            if (o.constructor === Date)
            {
                var month = o.getUTCMonth() + 1;
                if (month < 10) month = '0' + month;

                var day = o.getUTCDate();
                if (day < 10) day = '0' + day;

                var year = o.getUTCFullYear();
                
                var hours = o.getUTCHours();
                if (hours < 10) hours = '0' + hours;
                
                var minutes = o.getUTCMinutes();
                if (minutes < 10) minutes = '0' + minutes;
                
                var seconds = o.getUTCSeconds();
                if (seconds < 10) seconds = '0' + seconds;
                
                var milli = o.getUTCMilliseconds();
                if (milli < 100) milli = '0' + milli;
                if (milli < 10) milli = '0' + milli;

                return '"' + year + '-' + month + '-' + day + 'T' +
                             hours + ':' + minutes + ':' + seconds + 
                             '.' + milli + 'Z"'; 
            }

            if (o.constructor === Array) 
            {
                var ret = [];
                for (var i = 0; i < o.length; i++)
                    ret.push( $.toJSON(o[i]) || "null" );

                return "[" + ret.join(",") + "]";
            }
        
            var pairs = [];
            for (var k in o) {
                var name;
                var type = typeof k;

                if (type == "number")
                    name = '"' + k + '"';
                else if (type == "string")
                    name = $.quoteString(k);
                else
                    continue;  //skip non-string or number keys
            
                if (typeof o[k] == "function") 
                    continue;  //skip pairs where the value is a function.
            
                var val = $.toJSON(o[k]);
            
                pairs.push(name + ":" + val);
            }

            return "{" + pairs.join(", ") + "}";
        }
    };

    /** jQuery.evalJSON(src)
        Evaluates a given piece of json source.
     **/
    $.evalJSON = function(src)
    {
        if (typeof(JSON) == 'object' && JSON.parse)
            return JSON.parse(src);
        return eval("(" + src + ")");
    };
    
    /** jQuery.secureEvalJSON(src)
        Evals JSON in a way that is *more* secure.
    **/
    $.secureEvalJSON = function(src)
    {
        if (typeof(JSON) == 'object' && JSON.parse)
            return JSON.parse(src);
        
        var filtered = src;
        filtered = filtered.replace(/\\["\\\/bfnrtu]/g, '@');
        filtered = filtered.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']');
        filtered = filtered.replace(/(?:^|:|,)(?:\s*\[)+/g, '');
        
        if (/^[\],:{}\s]*$/.test(filtered))
            return eval("(" + src + ")");
        else
            throw new SyntaxError("Error parsing JSON, source is not valid.");
    };

    /** jQuery.quoteString(string)
        Returns a string-repr of a string, escaping quotes intelligently.  
        Mostly a support function for toJSON.
    
        Examples:
            >>> jQuery.quoteString("apple")
            "apple"
        
            >>> jQuery.quoteString('"Where are we going?", she asked.')
            "\"Where are we going?\", she asked."
     **/
    $.quoteString = function(string)
    {
        if (string.match(_escapeable))
        {
            return '"' + string.replace(_escapeable, function (a) 
            {
                var c = _meta[a];
                if (typeof c === 'string') return c;
                c = a.charCodeAt();
                return '\\u00' + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
            }) + '"';
        }
        return '"' + string + '"';
    };
    
    var _escapeable = /["\\\x00-\x1f\x7f-\x9f]/g;
    
    var _meta = {
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"' : '\\"',
        '\\': '\\\\'
    };
})(jQuery);


/*!
 * jQuery resize event - v1.0 - 2/10/2010
 * http://benalman.com/projects/jquery-resize-plugin/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */

// Script: jQuery resize event
//
// *Version: 1.0, Last updated: 2/10/2010*
// 
// Project Home - http://benalman.com/projects/jquery-resize-plugin/
// GitHub       - http://github.com/cowboy/jquery-resize/
// Source       - http://github.com/cowboy/jquery-resize/raw/master/jquery.ba-resize.js
// (Minified)   - http://github.com/cowboy/jquery-resize/raw/master/jquery.ba-resize.min.js (1.0kb)
// 
// About: License
// 
// Copyright (c) 2010 "Cowboy" Ben Alman,
// Dual licensed under the MIT and GPL licenses.
// http://benalman.com/about/license/
// 
// About: Examples
// 
// This working example, complete with fully commented code, illustrates a few
// ways in which this plugin can be used.
// 
// resize event - http://benalman.com/code/projects/jquery-resize/examples/resize/
// 
// About: Support and Testing
// 
// Information about what version or versions of jQuery this plugin has been
// tested with, what browsers it has been tested in, and where the unit tests
// reside (so you can test it yourself).
// 
// jQuery Versions - 1.3.2, 1.4.1, 1.4.2pre
// Browsers Tested - Internet Explorer 6-8, Firefox 2-3.6, Safari 3-4, Chrome, Opera 9.6-10.1.
// Unit Tests      - http://benalman.com/code/projects/jquery-resize/unit/
// 
// About: Release History
// 
// 1.0 - (2/10/2010) Initial release

(function($,window,undefined){
  '$:nomunge'; // Used by YUI compressor.
  
  // A jQuery object containing all non-window elements to which the resize
  // event is bound.
  var elems = $([]),
    
    // Extend $.resize if it already exists, otherwise create it.
    jq_resize = $.resize = $.extend( $.resize, {} ),
    
    timeout_id,
    
    // Reused strings.
    str_setTimeout = 'setTimeout',
    str_resize = 'resize',
    str_data = str_resize + '-special-event',
    str_delay = 'delay',
    str_throttle = 'throttleWindow';
  
  // Property: jQuery.resize.delay
  // 
  // The numeric interval (in milliseconds) at which the resize event polling
  // loop executes. Defaults to 250.
  
  jq_resize[ str_delay ] = 250;
  
  // Property: jQuery.resize.throttleWindow
  // 
  // Throttle the native window object resize event to fire no more than once
  // every <jQuery.resize.delay> milliseconds. Defaults to true.
  // 
  // Because the window object has its own resize event, it doesn't need to be
  // provided by this plugin, and its execution can be left entirely up to the
  // browser. However, since certain browsers fire the resize event continuously
  // while others do not, enabling this will throttle the window resize event,
  // making event behavior consistent across all elements in all browsers.
  // 
  // While setting this property to false will disable window object resize
  // event throttling, please note that this property must be changed before any
  // window object resize event callbacks are bound.
  
  jq_resize[ str_throttle ] = true;
  
  // Event: resize event
  // 
  // Fired when an element's width or height changes. Because browsers only
  // provide this event for the window element, for other elements a polling
  // loop is initialized, running every <jQuery.resize.delay> milliseconds
  // to see if elements' dimensions have changed. You may bind with either
  // .resize( fn ) or .bind( "resize", fn ), and unbind with .unbind( "resize" ).
  // 
  // Usage:
  // 
  // > jQuery('selector').bind( 'resize', function(e) {
  // >   // element's width or height has changed!
  // >   ...
  // > });
  // 
  // Additional Notes:
  // 
  // * The polling loop is not created until at least one callback is actually
  //   bound to the 'resize' event, and this single polling loop is shared
  //   across all elements.
  // 
  // Double firing issue in jQuery 1.3.2:
  // 
  // While this plugin works in jQuery 1.3.2, if an element's event callbacks
  // are manually triggered via .trigger( 'resize' ) or .resize() those
  // callbacks may double-fire, due to limitations in the jQuery 1.3.2 special
  // events system. This is not an issue when using jQuery 1.4+.
  // 
  // > // While this works in jQuery 1.4+
  // > $(elem).css({ width: new_w, height: new_h }).resize();
  // > 
  // > // In jQuery 1.3.2, you need to do this:
  // > var elem = $(elem);
  // > elem.css({ width: new_w, height: new_h });
  // > elem.data( 'resize-special-event', { width: elem.width(), height: elem.height() } );
  // > elem.resize();
      
  $.event.special[ str_resize ] = {
    
    // Called only when the first 'resize' event callback is bound per element.
    setup: function() {
      // Since window has its own native 'resize' event, return false so that
      // jQuery will bind the event using DOM methods. Since only 'window'
      // objects have a .setTimeout method, this should be a sufficient test.
      // Unless, of course, we're throttling the 'resize' event for window.
      if ( !jq_resize[ str_throttle ] && this[ str_setTimeout ] ) { return false; }
      
      var elem = $(this);
      
      // Add this element to the list of internal elements to monitor.
      elems = elems.add( elem );
      
      // Initialize data store on the element.
      elem.data( str_data, { width: elem.width(), height: elem.height() } );
      
      // If this is the first element added, start the polling loop.
      if ( elems.length === 1 ) {
        loopy();
      }
    },
    
    // Called only when the last 'resize' event callback is unbound per element.
    teardown: function() {
      // Since window has its own native 'resize' event, return false so that
      // jQuery will unbind the event using DOM methods. Since only 'window'
      // objects have a .setTimeout method, this should be a sufficient test.
      // Unless, of course, we're throttling the 'resize' event for window.
      if ( !jq_resize[ str_throttle ] && this[ str_setTimeout ] ) { return false; }
      
      var elem = $(this);
      
      // Remove this element from the list of internal elements to monitor.
      elems = elems.not( elem );
      
      // Remove any data stored on the element.
      elem.removeData( str_data );
      
      // If this is the last element removed, stop the polling loop.
      if ( !elems.length ) {
        clearTimeout( timeout_id );
      }
    },
    
    // Called every time a 'resize' event callback is bound per element (new in
    // jQuery 1.4).
    add: function( handleObj ) {
      // Since window has its own native 'resize' event, return false so that
      // jQuery doesn't modify the event object. Unless, of course, we're
      // throttling the 'resize' event for window.
      if ( !jq_resize[ str_throttle ] && this[ str_setTimeout ] ) { return false; }
      
      var old_handler;
      
      // The new_handler function is executed every time the event is triggered.
      // This is used to update the internal element data store with the width
      // and height when the event is triggered manually, to avoid double-firing
      // of the event callback. See the "Double firing issue in jQuery 1.3.2"
      // comments above for more information.
      
      function new_handler( e, w, h ) {
        var elem = $(this),
          data = elem.data( str_data );
        
        // If called from the polling loop, w and h will be passed in as
        // arguments. If called manually, via .trigger( 'resize' ) or .resize(),
        // those values will need to be computed.
        data.w = w !== undefined ? w : elem.width();
        data.h = h !== undefined ? h : elem.height();
        
        old_handler.apply( this, arguments );
      };
      
      // This may seem a little complicated, but it normalizes the special event
      // .add method between jQuery 1.4/1.4.1 and 1.4.2+
      if ( $.isFunction( handleObj ) ) {
        // 1.4, 1.4.1
        old_handler = handleObj;
        return new_handler;
      } else {
        // 1.4.2+
        old_handler = handleObj.handler;
        handleObj.handler = new_handler;
      }
    }
    
  };
  
  // Start the polling loop.
  function loopy() {
    
    // Iterate over all elements to which the 'resize' event is bound.
    elems.each(function(){
      var elem = $(this),
        width = elem.width(),
        height = elem.height(),
        data = elem.data( str_data );
      
      // If element size has changed since the last time, update the element
      // data store and trigger the 'resize' event.
      if ( width !== data.w || height !== data.h ) {
        elem.trigger( str_resize, [ data.w = width, data.h = height ] );
      }
      
    });
    
    // Loop.
    timeout_id = window[ str_setTimeout ]( loopy, jq_resize[ str_delay ] );
  };
  
})(jQuery,this);

// http://plugins.jquery.com/project/hasevent
(function(A){A.fn.hasEvent=function(C){var B=this.data("events");return(B&&B[C]);};})(jQuery);

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

MMMSearchObj.icons = {"mmmsearch_input_middle":{"w":320,"h":20,"x":0,"y":0},"mmmsearch_input_middle_active":{"w":320,"h":20,"x":0,"y":21},"globe":{"w":35,"h":35,"x":0,"y":42},"settings":{"w":33,"h":29,"x":35,"y":42},"mmmsearch_display_none_hover":{"w":18,"h":19,"x":68,"y":42},"mmmsearch_display_none":{"w":18,"h":19,"x":86,"y":42},"mmmsearch_display_block_hover":{"w":18,"h":19,"x":104,"y":42},"mmmsearch_home":{"w":19,"h":18,"x":122,"y":42},"mmmsearch_home_active":{"w":19,"h":18,"x":141,"y":42},"mmmsearch_mail_active":{"w":19,"h":18,"x":160,"y":42},"mmmsearch_display_block":{"w":18,"h":19,"x":179,"y":42},"mmmsearch_settings_active":{"w":19,"h":18,"x":197,"y":42},"mmmsearch_settings":{"w":19,"h":18,"x":216,"y":42},"mmmsearch_mail":{"w":19,"h":18,"x":235,"y":42},"_corners_left":{"w":15,"h":20,"x":254,"y":42},"_corners_right":{"w":15,"h":20,"x":269,"y":42},"_corners_left_active":{"w":15,"h":20,"x":284,"y":42},"_corners_right_active":{"w":15,"h":20,"x":299,"y":42},"youtube":{"w":17,"h":17,"x":0,"y":78},"msdn":{"w":17,"h":16,"x":17,"y":78},"otto":{"w":16,"h":16,"x":34,"y":78},"newsau":{"w":16,"h":16,"x":50,"y":78},"perldoc":{"w":16,"h":16,"x":66,"y":78},"onvista":{"w":16,"h":16,"x":82,"y":78},"onelook":{"w":16,"h":16,"x":98,"y":78},"ofdb":{"w":16,"h":16,"x":114,"y":78},"oertliche":{"w":16,"h":16,"x":130,"y":78},"perlmonks":{"w":16,"h":16,"x":146,"y":78},"newscientist":{"w":16,"h":16,"x":162,"y":78},"php":{"w":16,"h":16,"x":178,"y":78},"quelle":{"w":16,"h":16,"x":194,"y":78},"purevideo":{"w":16,"h":16,"x":210,"y":78},"qvc":{"w":16,"h":16,"x":226,"y":78},"rakuten":{"w":16,"h":16,"x":242,"y":78},"reddit":{"w":16,"h":16,"x":258,"y":78},"preistrend":{"w":16,"h":16,"x":274,"y":78},"portableapps":{"w":16,"h":16,"x":290,"y":78},"play":{"w":16,"h":16,"x":0,"y":96},"myvideo":{"w":16,"h":16,"x":16,"y":96},"pornative":{"w":16,"h":16,"x":32,"y":96},"pornhub":{"w":16,"h":16,"x":48,"y":96},"pornotube":{"w":16,"h":16,"x":64,"y":96},"photobucket":{"w":16,"h":16,"x":80,"y":96},"musicload":{"w":16,"h":16,"x":96,"y":96},"metacafe":{"w":16,"h":16,"x":112,"y":96},"meinvz":{"w":16,"h":16,"x":128,"y":96},"metacrawler":{"w":16,"h":16,"x":144,"y":96},"mininova":{"w":16,"h":16,"x":160,"y":96},"misterwong":{"w":16,"h":16,"x":176,"y":96},"megavideo":{"w":16,"h":16,"x":192,"y":96},"megarotic":{"w":16,"h":16,"x":208,"y":96},"livevideo":{"w":16,"h":16,"x":224,"y":96},"lycos":{"w":16,"h":16,"x":240,"y":96},"masterwanker":{"w":16,"h":16,"x":256,"y":96},"meganova":{"w":16,"h":16,"x":272,"y":96},"linkedin":{"w":16,"h":16,"x":288,"y":96},"leoit":{"w":16,"h":16,"x":304,"y":96},"mrsnake":{"w":16,"h":16,"x":0,"y":113},"langenscheidt":{"w":16,"h":16,"x":16,"y":113},"msn":{"w":16,"h":16,"x":32,"y":113},"live":{"w":16,"h":16,"x":48,"y":113},"myspace":{"w":16,"h":16,"x":64,"y":113},"redtube":{"w":16,"h":16,"x":80,"y":113},"lastfm":{"w":16,"h":16,"x":96,"y":113},"leofr":{"w":16,"h":16,"x":112,"y":113},"leoes":{"w":16,"h":16,"x":128,"y":113},"leoen":{"w":16,"h":16,"x":144,"y":113},"leocn":{"w":16,"h":16,"x":160,"y":113},"mytv":{"w":16,"h":16,"x":176,"y":113},"searchch":{"w":16,"h":16,"x":192,"y":113},"wetterde":{"w":16,"h":16,"x":208,"y":113},"wettercom":{"w":16,"h":16,"x":224,"y":113},"wikia":{"w":16,"h":16,"x":240,"y":113},"wikihow":{"w":16,"h":16,"x":256,"y":113},"wikiwix":{"w":16,"h":16,"x":272,"y":113},"wikipedia":{"w":16,"h":16,"x":288,"y":113},"werweisswas":{"w":16,"h":16,"x":304,"y":113},"web":{"w":16,"h":16,"x":0,"y":130},"vidz":{"w":16,"h":16,"x":16,"y":130},"videojug":{"w":16,"h":16,"x":32,"y":130},"vinden":{"w":16,"h":16,"x":48,"y":130},"warcry":{"w":16,"h":16,"x":64,"y":130},"wayn":{"w":16,"h":16,"x":80,"y":130},"waybackmachine":{"w":16,"h":16,"x":96,"y":130},"woerterbuch":{"w":16,"h":16,"x":112,"y":130},"wolframalpha":{"w":16,"h":16,"x":128,"y":130},"yatego":{"w":16,"h":16,"x":144,"y":130},"yahoo":{"w":16,"h":16,"x":160,"y":130},"yigg":{"w":16,"h":16,"x":176,"y":130},"youporn":{"w":16,"h":16,"x":192,"y":130},"yubnub":{"w":16,"h":16,"x":208,"y":130},"yourfilehost":{"w":16,"h":16,"x":224,"y":130},"yabse":{"w":16,"h":16,"x":240,"y":130},"xvideos":{"w":16,"h":16,"x":256,"y":130},"wowhead":{"w":16,"h":16,"x":272,"y":130},"wowguru":{"w":16,"h":16,"x":288,"y":130},"xing":{"w":16,"h":16,"x":304,"y":130},"xmissyporn":{"w":16,"h":16,"x":0,"y":147},"xtube":{"w":16,"h":16,"x":16,"y":147},"xnxx":{"w":16,"h":16,"x":32,"y":147},"urbandictionary":{"w":16,"h":16,"x":48,"y":147},"uitmuntend":{"w":16,"h":16,"x":64,"y":147},"spray":{"w":16,"h":16,"x":80,"y":147},"spiegel":{"w":16,"h":16,"x":96,"y":147},"stayfriends":{"w":16,"h":16,"x":112,"y":147},"studivz":{"w":16,"h":16,"x":128,"y":147},"telefonbuch":{"w":16,"h":16,"x":144,"y":147},"teachertube":{"w":16,"h":16,"x":160,"y":147},"sourceforge":{"w":16,"h":16,"x":176,"y":147},"snap":{"w":16,"h":16,"x":192,"y":147},"ruby":{"w":16,"h":16,"x":208,"y":147},"ricardo":{"w":16,"h":16,"x":224,"y":147},"1advd":{"w":16,"h":16,"x":240,"y":147},"searchmash":{"w":16,"h":16,"x":256,"y":147},"shufuni":{"w":16,"h":16,"x":272,"y":147},"selfhtml":{"w":16,"h":16,"x":288,"y":147},"testberichte":{"w":16,"h":16,"x":304,"y":147},"thefreedictionary":{"w":16,"h":16,"x":0,"y":164},"torrentscoop":{"w":16,"h":16,"x":16,"y":164},"torrentsbooth":{"w":16,"h":16,"x":32,"y":164},"torrentsearchbar":{"w":16,"h":16,"x":48,"y":164},"torrentspy":{"w":16,"h":16,"x":64,"y":164},"twitter":{"w":16,"h":16,"x":80,"y":164},"tube8":{"w":16,"h":16,"x":96,"y":164},"torrentportal":{"w":16,"h":16,"x":112,"y":164},"torrent-finder":{"w":16,"h":16,"x":128,"y":164},"thesaurus":{"w":16,"h":16,"x":144,"y":164},"thepiratebay":{"w":16,"h":16,"x":160,"y":164},"thesextubesite":{"w":16,"h":16,"x":176,"y":164},"thottbot":{"w":16,"h":16,"x":192,"y":164},"toppreise":{"w":16,"h":16,"x":208,"y":164},"reference":{"w":16,"h":16,"x":224,"y":164},"krugle":{"w":16,"h":16,"x":240,"y":164},"archive":{"w":16,"h":16,"x":256,"y":164},"finanznachrichten":{"w":16,"h":16,"x":272,"y":164},"apidoc":{"w":16,"h":16,"x":288,"y":164},"aolmusic":{"w":16,"h":16,"x":304,"y":164},"ansearch":{"w":16,"h":16,"x":0,"y":181},"answer":{"w":16,"h":16,"x":16,"y":181},"finanzen":{"w":16,"h":16,"x":32,"y":181},"fimatex":{"w":16,"h":16,"x":48,"y":181},"fanpop":{"w":16,"h":16,"x":64,"y":181},"facebook":{"w":16,"h":16,"x":80,"y":181},"ferret":{"w":16,"h":16,"x":96,"y":181},"filmspiegel":{"w":16,"h":16,"x":112,"y":181},"filmstarts":{"w":16,"h":16,"x":128,"y":181},"ancestry":{"w":16,"h":16,"x":144,"y":181},"amazon1":{"w":16,"h":16,"x":160,"y":181},"flickr":{"w":16,"h":16,"x":176,"y":181},"acronymfinder":{"w":16,"h":16,"x":192,"y":181},"flurl":{"w":16,"h":16,"x":208,"y":181},"freesextubes":{"w":16,"h":16,"x":224,"y":181},"ft":{"w":16,"h":16,"x":240,"y":181},"uk":{"w":20,"h":12,"x":256,"y":181},"ajaxrain":{"w":16,"h":16,"x":276,"y":181},"altavista":{"w":16,"h":16,"x":292,"y":181},"amazon":{"w":16,"h":16,"x":0,"y":198},"alluc":{"w":16,"h":16,"x":16,"y":198},"allakhazam":{"w":16,"h":16,"x":32,"y":198},"krak":{"w":16,"h":16,"x":48,"y":198},"evendi":{"w":16,"h":16,"x":64,"y":198},"eniro":{"w":16,"h":16,"x":80,"y":198},"brightcove":{"w":16,"h":16,"x":96,"y":198},"boysfood":{"w":16,"h":16,"x":112,"y":198},"btjunkie":{"w":16,"h":16,"x":128,"y":198},"canoo":{"w":16,"h":16,"x":144,"y":198},"classmates":{"w":16,"h":16,"x":160,"y":198},"chefkoch":{"w":16,"h":16,"x":176,"y":198},"billiger":{"w":16,"h":16,"x":192,"y":198},"beolingus":{"w":16,"h":16,"x":208,"y":198},"bahn":{"w":16,"h":16,"x":224,"y":198},"babla":{"w":16,"h":16,"x":240,"y":198},"baidu":{"w":16,"h":16,"x":256,"y":198},"bbc":{"w":16,"h":16,"x":272,"y":198},"beateuhse":{"w":16,"h":16,"x":288,"y":198},"creativecommons":{"w":16,"h":16,"x":304,"y":198},"cuil":{"w":16,"h":16,"x":0,"y":215},"dnb":{"w":16,"h":16,"x":16,"y":215},"dmoz":{"w":16,"h":16,"x":32,"y":215},"doorone":{"w":16,"h":16,"x":48,"y":215},"duden":{"w":16,"h":16,"x":64,"y":215},"ebay":{"w":16,"h":16,"x":80,"y":215},"dkb":{"w":16,"h":16,"x":96,"y":215},"digg":{"w":16,"h":16,"x":112,"y":215},"dejure":{"w":16,"h":16,"x":128,"y":215},"dailymotion":{"w":16,"h":16,"x":144,"y":215},"delicious":{"w":16,"h":16,"x":160,"y":215},"dict":{"w":16,"h":16,"x":176,"y":215},"dictionary":{"w":16,"h":16,"x":192,"y":215},"ftd":{"w":16,"h":16,"x":208,"y":215},"gamefaqs":{"w":16,"h":16,"x":224,"y":215},"greengoo":{"w":16,"h":16,"x":240,"y":215},"abc":{"w":16,"h":16,"x":256,"y":215},"guardian":{"w":16,"h":16,"x":272,"y":215},"guenstiger":{"w":16,"h":16,"x":288,"y":215},"a9":{"w":16,"h":16,"x":304,"y":215},"gwb":{"w":16,"h":16,"x":0,"y":232},"abkuerzungen":{"w":16,"h":16,"x":16,"y":232},"googlevideo":{"w":16,"h":16,"x":32,"y":232},"about":{"w":16,"h":16,"x":48,"y":232},"googleproducts":{"w":16,"h":16,"x":64,"y":232},"googlescholar":{"w":16,"h":16,"x":80,"y":232},"googlesites":{"w":16,"h":16,"x":96,"y":232},"googletranslate":{"w":16,"h":16,"x":112,"y":232},"hardwareschotte":{"w":16,"h":16,"x":128,"y":232},"heavy":{"w":16,"h":16,"x":144,"y":232},"kartoo":{"w":16,"h":16,"x":160,"y":232},"jubii":{"w":16,"h":16,"x":176,"y":232},"kindgirls":{"w":16,"h":16,"x":192,"y":232},"kino":{"w":16,"h":16,"x":208,"y":232},"koders":{"w":16,"h":16,"x":224,"y":232},"jamba":{"w":16,"h":16,"x":240,"y":232},"isohunt":{"w":16,"h":16,"x":256,"y":232},"hitta":{"w":16,"h":16,"x":272,"y":232},"hi5":{"w":16,"h":16,"x":288,"y":232},"hulu":{"w":16,"h":16,"x":304,"y":232},"ign":{"w":16,"h":16,"x":0,"y":249},"imdb":{"w":16,"h":16,"x":16,"y":249},"googlepicasa":{"w":16,"h":16,"x":32,"y":249},"googlepatents":{"w":16,"h":16,"x":48,"y":249},"googlebookmarks":{"w":16,"h":16,"x":64,"y":249},"googleblogsearch":{"w":16,"h":16,"x":80,"y":249},"googlebooks":{"w":16,"h":16,"x":96,"y":249},"googlecodesearch":{"w":16,"h":16,"x":112,"y":249},"googledocs":{"w":16,"h":16,"x":128,"y":249},"googledirectory":{"w":16,"h":16,"x":144,"y":249},"google":{"w":16,"h":16,"x":160,"y":249},"goblinworkshop":{"w":16,"h":16,"x":176,"y":249},"gamespot":{"w":16,"h":16,"x":192,"y":249},"gamerankings":{"w":16,"h":16,"x":208,"y":249},"geizhals":{"w":16,"h":16,"x":224,"y":249},"gelbeseiten":{"w":16,"h":16,"x":240,"y":249},"gnavi":{"w":16,"h":16,"x":256,"y":249},"googlefinance":{"w":16,"h":16,"x":272,"y":249},"googlegadget":{"w":16,"h":16,"x":288,"y":249},"googlemaps":{"w":16,"h":16,"x":304,"y":249},"googlelively":{"w":16,"h":16,"x":0,"y":266},"googlemodules":{"w":16,"h":16,"x":16,"y":266},"googlenews":{"w":16,"h":16,"x":32,"y":266},"googleorkut":{"w":16,"h":16,"x":48,"y":266},"googlelinux":{"w":16,"h":16,"x":64,"y":266},"googleknol":{"w":16,"h":16,"x":80,"y":266},"googlegroups":{"w":16,"h":16,"x":96,"y":266},"googlegadget_old":{"w":16,"h":16,"x":112,"y":266},"googlehistory":{"w":16,"h":16,"x":128,"y":266},"googleimages":{"w":16,"h":16,"x":144,"y":266},"googlejaiku":{"w":16,"h":16,"x":160,"y":266},"ask":{"w":16,"h":16,"x":176,"y":266},"nl":{"w":18,"h":12,"x":192,"y":266},"it":{"w":18,"h":12,"x":210,"y":266},"at":{"w":18,"h":12,"x":228,"y":266},"jp":{"w":18,"h":12,"x":246,"y":266},"se":{"w":18,"h":12,"x":264,"y":266},"hakia":{"w":15,"h":15,"x":282,"y":266},"us":{"w":18,"h":12,"x":297,"y":266},"es":{"w":18,"h":12,"x":0,"y":283},"fr":{"w":18,"h":12,"x":18,"y":283},"dk":{"w":18,"h":12,"x":36,"y":283},"au":{"w":18,"h":12,"x":54,"y":283},"ch":{"w":18,"h":12,"x":72,"y":283},"ca":{"w":18,"h":12,"x":90,"y":283},"cn":{"w":18,"h":12,"x":108,"y":283},"de":{"w":18,"h":12,"x":126,"y":283},"mmmsearch_close_gray":{"w":14,"h":14,"x":144,"y":283},"mmmsearch_close_red":{"w":14,"h":14,"x":158,"y":283},"mmmsearch_divider":{"w":9,"h":16,"x":172,"y":283},"lastupdated":1318801498};

MMMSearchObj.translations = {
	'en' : {
		'button_setup' : 'Open/close setup',
		'button_home' : 'Module Homepage',
		'new_window' : 'Open results in new window',
		'show_labels' : 'Show labels for searchgroups',
		'headline_bookmarking' : 'Bookmarking',
		'headline_community' : 'Social Communities',
		'headline_diverse' : 'Diverse',
		'headline_finance' : 'Finance',
		'headline_games' : 'Games',
		'headline_google' : 'Google',
		'headline_knowledge' : 'Knowledge',
		'headline_media' : 'Media',
		'headline_news' : 'News',
		'headline_portals' : 'Search',
		'headline_programming' : 'Programming',
		'headline_shopping' : 'Shopping',
		'headline_torrent' : 'P2P FileSharing',
		'headline_wow' : 'WOW',
		'headline_xxx' : 'XXX'
	},

	'de' : {
		'button_setup' : 'Setup öffnen/schliessen',
		'button_home' : 'Modul Homepage',
		'new_window' : 'Ergebnisse in neuem Fenster anzeigen',
		'show_labels' : 'Beschriftung für Suchgruppen zeigen',
		'headline_bookmarking' : 'Bookmarking',
		'headline_community' : '',
		'headline_diverse' : 'Sonstiges',
		'headline_finance' : 'Finanzen',
		'headline_games' : 'Spiele',
		'headline_google' : 'Google',
		'headline_knowledge' : 'Sprache und Wissen',
		'headline_media' : 'Medien',
		'headline_news' : 'Nachrichten',
		'headline_portals' : 'Suchportale',
		'headline_programming' : 'Programmierung',
		'headline_shopping' : 'Einkauf',
		'headline_torrent' : '',
		'headline_wow' : '',
		'headline_xxx' : ''
	},

	// Danemark - translated by Lars Holm Jensen - web@larsholm.net
	'dk' : 'da',
	'da' : {
		'button_setup' : 'Open/Luk indstillinger',
		'button_home' : 'Modul Homepage',
		'new_window' : 'Nyt vindue ved søgning',
		'show_labels' : 'Beschriftung für Suchgruppen zeigen',
		'headline_bookmarking' : 'Bookmarking',
		'headline_community' : '',
		'headline_diverse' : 'Diverse',
		'headline_finance' : 'Finans',
		'headline_games' : 'Games',
		'headline_google' : 'Google',
		'headline_knowledge' : 'Sprog og Viden',
		'headline_media' : 'Media',
		'headline_news' : 'Nyheder',
		'headline_portals' : 'Søgemaskiner',
		'headline_programming' : 'Programmering',
		'headline_shopping' : 'Shopping',
		'headline_torrent' : '',
		'headline_wow' : '',
		'headline_xxx' : ''
	},

	'es' : {
		'button_setup' : 'Abrir y cerrar las preferencias',
		'button_home' : 'Página del módulo',
		'new_window' : 'Abrir los resultado en una ventana nueva',
		'show_labels' : 'Separar los simbolos en groupos',
		'headline_bookmarking' : '',
		'headline_community' : '',
		'headline_diverse' : 'Otras cosas',
		'headline_finance' : 'Finanzas',
		'headline_games' : 'Juegos',
		'headline_google' : 'Google',
		'headline_knowledge' : 'Idiomas y conocimientos',
		'headline_media' : 'Video',
		'headline_news' : 'Noticiarios',
		'headline_portals' : 'Páginas de web de busco',
		'headline_programming' : 'Programación',
		'headline_shopping' : 'Compra',
		'headline_torrent' : '',
		'headline_wow' : '',
		'headline_xxx' : ''
	},
	
	// Netherlands - translated by Futureline - futureline@gmail.com
	'nl' : {
		'button_setup' : 'Open/Sluit setup',
		'button_home' : '',
		'new_window' : 'Nieuw venster voor zoeken',
		'show_labels' : '',
		'headline_bookmarking' : '',
		'headline_community' : 'Gemeenschap',
		'headline_diverse' : 'Diverse',
		'headline_finance' : 'Financieel',
		'headline_games' : 'Games',
		'headline_google' : 'Google',
		'headline_knowledge' : 'Taal en Kennis',
		'headline_media' : 'Media',
		'headline_news' : 'Nieuws',
		'headline_portals' : 'Zoek',
		'headline_programming' : 'Programmeren',
		'headline_shopping' : 'Shoppen',
		'headline_torrent' : '',
		'headline_wow' : '',
		'headline_xxx' : ''
	},
	
	// swedish - translated by Jonas Hangvar - hangvar@gmail.com
	'sv' : {
		'button_setup' : 'Open/Stäng inställningar',
		'button_home' : '',
		'new_window' : 'Nytt fönster vid sökning',
		'show_labels' : '',
		'headline_bookmarking' : '',
		'headline_community' : 'Nätförening',
		'headline_diverse' : 'Diverse',
		'headline_finance' : 'Finans',
		'headline_games' : '',
		'headline_google' : '',
		'headline_knowledge' : 'Kunskap och Språk',
		'headline_media' : 'Media',
		'headline_news' : 'Nyheter',
		'headline_portals' : 'Sökportaler',
		'headline_programming' : 'Programmering',
		'headline_shopping' : 'Shopping',
		'headline_torrent' : '',
		'headline_wow' : '',
		'headline_xxx' : ''
	}
};

MMMSearchObj.searches = [
{id:"au_yahoo",
type:"portals",
cc:"au",
name:"yahoo",
label:"yahoo.au",
url:"http://www.yahoo.au",
surl:"http://au.search.yahoo.com/search?p=",
desc:""},

{id:"au_ansearch",
type:"portals",
cc:"au",
name:"ansearch",
label:"ansearch.com.au",
url:"http://www.ansearch.com.au",
surl:"http://www.ansearch.com.au/search?s=all&a=all&cc=au&search=",
desc:""},

{id:"au_ebay",
type:"shopping",
cc:"au",
name:"ebay",
label:"ebay.au",
url:"http://www.ebay.com.au",
surl:"http://search.ebay.com.au/",
desc:""},

{id:"au_doorone",
type:"shopping",
cc:"au",
name:"doorone",
label:"doorone.au",
url:"http://doorone.com.au",
surl:"http://doorone.com.au/xFS?KW=",
desc:""},

{id:"au_ferret",
type:"shopping",
cc:"au",
name:"ferret",
label:"ferret.com.au",
url:"http://www.ferret.com.au",
surl:"http://www.ferret.com.au/search.asp?qu=",
desc:"Australian suppliers/products search"},

{id:"au_abc",
type:"news",
cc:"au",
name:"abc",
label:"abc.net.au",
url:"http://www.abc.net.au",
surl:"http://search.abc.net.au/search/search.cgi?sort=&collection=abcall&query=",
desc:"Main public broadcaster"},

{id:"au_newsau",
type:"news",
cc:"au",
name:"newsau",
label:"news.com.au",
url:"http://searchresults.news.com.au",
surl:"http://searchresults.news.com.au/servlet/Search?site=ninews&queryterm=",
desc:""},

{id:"at_yahoo",
type:"portals",
cc:"at",
name:"yahoo",
label:"yahoo.at",
url:"http://www.yahoo.at",
surl:"http://at.search.yahoo.com/search?p=",
desc:""},

{id:"at_amazon",
type:"shopping",
cc:"at",
name:"amazon",
label:"amazon.at",
url:"http://www.amazon.de/gp/redirect.html?ie=UTF8&location=http%3A%2F%2Famazon.at%2F&site-redirect=at&tag=wwwmadmaxmatd-21&linkCode=ur2&camp=1638&creative=6742",
surl:"http://www.amazon.de/gp/search?tag=wwwmadmaxmatd-21&index=blended&location=http%3A%2F%2Famazon.at%2F&site-redirect=at&linkCode=ur2&camp=1638&creative=6742&keywords=",
desc:""},

{id:"at_ebay",
type:"shopping",
cc:"at",
name:"ebay",
label:"ebay.at",
url:"http://ebay.at",
surl:"http://search.ebay.at/",
desc:""},

{id:"at_otto",
type:"shopping",
cc:"at",
name:"otto",
label:"ottoversand.at",
url:"http://partners.webmasterplan.com/click.asp?ref=436362&site=3433&type=b33&bnb=33",
surl:"http://partners.webmasterplan.com/click.asp?ref=436362&site=3433&type=b33&bnb=33&",
desc:""},

{id:"at_geizhals",
type:"shopping",
cc:"at",
name:"geizhals",
label:"geizhals.at",
url:"http://geizhals.at",
surl:"http://geizhals.at/?fs=",
desc:""},

{id:"ca_yahoo",
type:"portals",
cc:"ca",
name:"yahoo",
label:"yahoo.ca",
url:"http://www.yahoo.ca",
surl:"http://ca.search.yahoo.com/search?p=",
desc:""},

{id:"ca_ebay",
type:"shopping",
cc:"ca",
name:"ebay",
label:"ebay.ca",
url:"http://www.ebay.ca",
surl:"http://search.ebay.ca/",
desc:""},

{id:"ca_amazon",
type:"shopping",
cc:"ca",
name:"amazon",
label:"amazon.ca",
url:"http://www.amazon.ca/gp/redirect.html?ie=UTF8&location=http%3A%2F%2Fwww.amazon.ca%2F&tag=mysearches05-20&linkCode=ur2&camp=15121&creative=330641",
surl:"http://www.amazon.ca/gp/search?ie=UTF8&tag=mysearches05-20&index=blended&linkCode=ur2&camp=15121&creative=330641&keywords=",
desc:""},

{id:"ch_yahoo",
type:"portals",
cc:"ch",
name:"yahoo",
label:"yahoo.ch",
url:"http://www.yahoo.ch",
surl:"http://ch.search.yahoo.com/search?p=",
desc:""},

{id:"ch_searchch",
type:"portals",
cc:"ch",
name:"searchch",
label:"search.ch",
url:"http://www.search.ch",
surl:"http://www.search.ch/search.html?loc=ch&q=",
desc:"The Swiss Search Engine"},

{id:"ch_ebay",
type:"shopping",
cc:"ch",
name:"ebay",
label:"ebay.ch",
url:"http://ebay.ch",
surl:"http://search.ebay.ch/",
desc:""},

{id:"ch_toppreise",
type:"shopping",
cc:"ch",
name:"toppreise",
label:"toppreise.ch",
url:"http://www.toppreise.ch",
surl:"http://www.toppreise.ch/index.php?search=",
desc:"Preissuchmaschine Toppreise.ch"},

{id:"ch_ricardo",
type:"shopping",
cc:"ch",
name:"ricardo",
label:"ricardo.ch",
url:"http://www.ricardo.ch",
surl:"http://my.ricardo.ch/search/search.asp?txtSearch=",
desc:""},

{id:"ch_1advd",
type:"shopping",
cc:"ch",
name:"1advd",
label:"1a-dvdshop.ch",
url:"http://www.1a-dvdshop.ch",
surl:"http://www.1a-dvdshop.ch/DefaultTOP.asp?sb=",
desc:"1a-dvd Shop"},

{id:"cn_baidu",
type:"portals",
cc:"cn",
name:"baidu",
label:"baidu.com",
url:"http://www.baidu.com",
surl:"http://www.baidu.com/s?wd=",
desc:""},

{id:"de_yahoo",
type:"portals",
cc:"de",
name:"yahoo",
label:"yahoo.de",
url:"http://www.yahoo.de",
surl:"http://de.search.yahoo.com/search?p=",
desc:""},

{id:"de_lycos",
type:"portals",
cc:"de",
name:"lycos",
label:"lycos.de",
url:"http://www.lycos.de",
surl:"http://suche.lycos.de/cgi-bin/pursuit?query=",
desc:""},

{id:"de_web",
type:"portals",
cc:"de",
name:"web",
label:"web.de",
url:"http://www.web.de",
surl:"http://suche.web.de/search/web/?allparams=&smode=&webRb=int&su=",
desc:""},

{id:"de_dmoz",
type:"portals",
cc:"de",
name:"dmoz",
label:"dmoz.de",
url:"http://www.dmoz.de",
surl:"http://search.dmoz.org/cgi-bin/search?all=no&cat=World%2FDeutsch&search=",
desc:""},

{id:"de_ebay",
type:"shopping",
cc:"de",
name:"ebay",
label:"ebay.de",
url:"http://ebay.de",
surl:"http://search.ebay.de/",
desc:""},

{id:"de_amazon",
type:"shopping",
cc:"de",
name:"amazon",
label:"amazon.de",
url:"http://www.amazon.de/gp/redirect.html?ie=UTF8&location=http%3A%2F%2Fwww.amazon.de%2F&site-redirect=de&tag=wwwmadmaxmatd-21&linkCode=ur2&camp=1638&creative=6742",
surl:"http://www.amazon.de/gp/search?tag=wwwmadmaxmatd-21&index=blended&linkCode=ur2&camp=1638&creative=6742&keywords=",
desc:""},

{id:"de_otto",
type:"shopping",
cc:"de",
name:"otto",
label:"otto.de",
url:"http://partners.webmasterplan.com/click.asp?ref=436362&site=2950&type=b29&bnb=29",
surl:"http://partners.webmasterplan.com/click.asp?ref=436362&site=2950&type=text&tnb=17&prd=yes&affdeep=",
desc:""},

{id:"de_guenstiger",
type:"shopping",
cc:"de",
name:"guenstiger",
label:"guenstiger.de",
url:"http://www3.guenstiger.de/gt/main.asp",
surl:"http://www3.guenstiger.de/gt/main.asp?suche=",
desc:"Preis-Suchmaschine"},

{id:"de_billiger",
type:"shopping",
cc:"de",
name:"billiger",
label:"billiger.de",
url:"http://www.billiger.de",
surl:"http://www.billiger.de/suche.html?go=Suchen&userkatsuggest=&houston=1&searchstring=",
desc:""},

{id:"de_geizhals",
type:"shopping",
cc:"de",
name:"geizhals",
label:"geizhals.at",
url:"http://geizhals.at/deutschland",
surl:"http://geizhals.at/deutschland/?fs=",
desc:""},

{id:"de_preistrend",
type:"shopping",
cc:"de",
name:"preistrend",
label:"preistrend.de",
url:"http://www.preistrend.de",
surl:"http://preistrend.de/suchen.php?q=",
desc:""},

{id:"de_evendi",
type:"shopping",
cc:"de",
name:"evendi",
label:"evendi.de",
url:"http://www.evendi.de",
surl:"http://www.evendi.de/jsp/eVendi2004/search.jsp?name=",
desc:""},

{id:"de_doorone",
type:"shopping",
cc:"de",
name:"doorone",
label:"doorone.de",
url:"http://www.doorone.de",
surl:"http://www.doorone.de/xFS?KW=",
desc:""},

{id:"de_testberichte",
type:"shopping",
cc:"de",
name:"testberichte",
label:"testberichte.de",
url:"http://www.testberichte.de",
surl:"http://www.testberichte.de/d/search.php?searchstr=",
desc:""},

{id:"de_yatego",
type:"shopping",
cc:"de",
name:"yatego",
label:"yatego.com",
url:"http://www.yatego.com",
surl:"http://www.yatego.com/index.htm?cl=mallsearch&query=",
desc:""},

{id:"de_hardwareschotte",
type:"shopping",
cc:"de",
name:"hardwareschotte",
label:"hardwareschotte.de",
url:"http://www.hardwareschotte.de",
surl:"http://www.hardwareschotte.de/preise.php3?seachrange=all&searchstring=",
desc:""},

{id:"de_misterwong",
type:"bookmarking",
cc:"de",
name:"misterwong",
label:"mister-wong.de",
url:"http://www.mister-wong.de",
surl:"http://www.mister-wong.de/search/?search_type=w&btn=suchen&keywords=",
desc:""},

{id:"de_wikipedia",
type:"knowledge",
cc:"de",
name:"wikipedia",
label:"de.wikipedia",
url:"http://de.wikipedia.org",
surl:"http://de.wikipedia.org/wiki/Spezial:Search?go=Artikel&search=",
desc:""},

{id:"de_dejure",
type:"knowledge",
cc:"de",
name:"dejure",
label:"dejure.org",
url:"http://dejure.org",
surl:"http://dejure.org/cgi-bin/suche?Suchenach=",
desc:""},

{id:"de_leocn",
type:"knowledge",
cc:"de",
name:"leocn",
label:"leo.org CN",
url:"http://dict.leo.org/chde",
surl:"http://dict.leo.org/chde?search=",
desc:""},

{id:"de_leoen",
type:"knowledge",
cc:"de",
name:"leoen",
label:"leo.org EN",
url:"http://dict.leo.org/ende",
surl:"http://dict.leo.org/ende?search=",
desc:""},

{id:"de_leoes",
type:"knowledge",
cc:"de",
name:"leoes",
label:"leo.org ES",
url:"http://dict.leo.org/esde",
surl:"http://dict.leo.org/esde?search=",
desc:""},

{id:"de_leofr",
type:"knowledge",
cc:"de",
name:"leofr",
label:"leo.org FR",
url:"http://dict.leo.org/frde",
surl:"http://dict.leo.org/frde?search=",
desc:""},

{id:"de_leoit",
type:"knowledge",
cc:"de",
name:"leoit",
label:"leo.org IT",
url:"http://dict.leo.org/itde",
surl:"http://dict.leo.org/itde?search=",
desc:""},

{id:"de_beolingusen",
type:"knowledge",
cc:"de",
name:"beolingusen",
label:"dict.tu-chemnitz.de EN",
url:"http://dict.tu-chemnitz.de/dings.cgi?lang=de;service=deen",
surl:"http://dict.tu-chemnitz.de/dings.cgi?lang=de&service=deen&query=",
desc:"",
icon:"beolingus"},

{id:"de_beolinguses",
type:"knowledge",
cc:"de",
name:"beolinguses",
label:"dict.tu-chemnitz.de ES",
url:"http://dict.tu-chemnitz.de/dings.cgi?lang=de;service=dees",
surl:"http://dict.tu-chemnitz.de/dings.cgi?lang=de&service=dees&query=",
desc:"",
icon:"beolingus"},

{id:"de_beolinguspt",
type:"knowledge",
cc:"de",
name:"beolinguspt",
label:"dict.tu-chemnitz.de PT",
url:"http://dict.tu-chemnitz.de/dings.cgi?lang=de;service=dept",
surl:"http://dict.tu-chemnitz.de/dings.cgi?lang=de&service=dept&query=",
desc:"",
icon:"beolingus"},

{id:"de_babdecn",
type:"knowledge",
cc:"de",
name:"babdecn",
label:"bab.la DE-CN",
url:"http://bab.la/woerterbuch/deutsch-chinesisch",
surl:"http://bab.la/woerterbuch/deutsch-chinesisch/",
desc:"",
icon:"babla"},

{id:"de_babdeen",
type:"knowledge",
cc:"de",
name:"babdeen",
label:"bab.la DE-EN",
url:"http://bab.la/woerterbuch/deutsch-englisch",
surl:"http://bab.la/woerterbuch/deutsch-englisch/",
desc:"",
icon:"babla"},

{id:"de_babdees",
type:"knowledge",
cc:"de",
name:"babdees",
label:"bab.la DE-ES",
url:"http://bab.la/woerterbuch/deutsch-spanisch",
surl:"http://bab.la/woerterbuch/deutsch-spanisch/",
desc:"",
icon:"babla"},

{id:"de_babdefr",
type:"knowledge",
cc:"de",
name:"babdefr",
label:"bab.la DE-FR",
url:"http://bab.la/woerterbuch/deutsch-franzoesisch",
surl:"http://bab.la/woerterbuch/deutsch-franzoesisch/",
desc:"",
icon:"babla"},

{id:"de_babdepl",
type:"knowledge",
cc:"de",
name:"babdepl",
label:"bab.la DE-PL",
url:"http://bab.la/woerterbuch/deutsch-polnisch",
surl:"http://bab.la/woerterbuch/deutsch-polnisch/",
desc:"",
icon:"babla"},

{id:"de_babdept",
type:"knowledge",
cc:"de",
name:"babdept",
label:"bab.la DE-PT",
url:"http://bab.la/woerterbuch/deutsch-portugiesisch",
surl:"http://bab.la/woerterbuch/deutsch-portugiesisch/",
desc:"",
icon:"babla"},

{id:"de_babderu",
type:"knowledge",
cc:"de",
name:"babderu",
label:"bab.la DE-RU",
url:"http://bab.la/woerterbuch/deutsch-russisch",
surl:"http://bab.la/woerterbuch/deutsch-russisch/",
desc:"",
icon:"babla"},

{id:"de_babdetr",
type:"knowledge",
cc:"de",
name:"babdetr",
label:"bab.la DE-TR",
url:"http://bab.la/woerterbuch/deutsch-tuerkisch",
surl:"http://bab.la/woerterbuch/deutsch-tuerkisch/",
desc:"",
icon:"babla"},

{id:"de_uitmuntend",
type:"knowledge",
cc:"de",
name:"uitmuntend",
label:"uitmuntend.de DE-NL",
url:"http://www.uitmuntend.de",
surl:"http://www.uitmuntend.de/search.html?search=",
desc:""},

{id:"de_woerterbuch",
type:"knowledge",
cc:"de",
name:"woerterbuch",
label:"woerterbuch.info",
url:"http://www.woerterbuch.info",
surl:"http://www.woerterbuch.info/?s=thesaurus&query=",
desc:""},

{id:"de_duden",
type:"knowledge",
cc:"de",
name:"duden",
label:"duden.de",
url:"http://www.duden-suche.de/",
surl:"http://www.duden-suche.de/suche/trefferliste.php?suchbegriff[AND]=",
desc:""},

{id:"de_canoo",
type:"knowledge",
cc:"de",
name:"canoo",
label:"canoo.net",
url:"http://www.canoo.net",
surl:"http://www.canoo.net/services/Controller?MenuId=Search&service=canooNet<=de&input=",
desc:""},

{id:"de_dict",
type:"knowledge",
cc:"de",
name:"dict",
label:"dict.cc",
url:"http://www.dict.cc",
surl:"http://www.dict.cc/?s=",
desc:""},

{id:"de_abkuerzungen",
type:"knowledge",
cc:"de",
name:"abkuerzungen",
label:"abkuerzungen.de",
url:"http://www.abkuerzungen.de",
surl:"http://www.abkuerzungen.de/pc/html/result.php?language=DE&x=21&y=8&abbreviation=",
desc:""},

{id:"de_werweisswas",
type:"knowledge",
cc:"de",
name:"werweisswas",
label:"wer-weiss-was.de",
url:"http://www.wer-weiss-was.de",
surl:"http://www.wer-weiss-was.de/app/search/global?search_what=e&search_what=t&submit.search=1&bool=a&type=beginnings&searchtext=",
desc:""},

{id:"de_dnb",
type:"knowledge",
cc:"de",
name:"dnb",
label:"Dt. Nationalbibliothek",
url:"http://www.d-nb.de",
surl:"https://portal.d-nb.de/opac.htm?method=simpleSearch&query=",
desc:"Website der deutschen Nationalbibliothek"},

{id:"de_studivz",
type:"community",
cc:"de",
name:"studivz",
label:"studiVZ.net",
url:"http://www.studivz.net",
surl:"http://www.studivz.net/search.php?do_search=1&name=",
desc:""},

{id:"de_meinvz",
type:"community",
cc:"de",
name:"meinvz",
label:"meinVZ.net",
url:"http://www.meinvz.net",
surl:"http://www.meinvz.net/search.php?do_search=1&name=",
desc:""},

{id:"de_xing",
type:"community",
cc:"de",
name:"xing",
label:"xing.com",
url:"http://www.xing.com",
surl:"https://www.xing.com/app/search?op=universal&universal=",
desc:""},

{id:"de_lastfm",
type:"community",
cc:"de",
name:"lastfm",
label:"lastfm.de",
url:"http://www.lastfm.de",
surl:"http://www.lastfm.de/music/?q=",
desc:""},

{id:"de_stayfriends",
type:"community",
cc:"de",
name:"stayfriends",
label:"stayfriends.de",
url:"http://www.stayfriends.de",
surl:"http://www.stayfriends.de/j/ViewController?submitaction=suchen&action=personSearch&q=",
desc:"Schulfreunde wiederfinden"},

{id:"de_spiegel",
type:"news",
cc:"de",
name:"spiegel",
label:"spiegel.de",
url:"http://www.spiegel.de",
surl:"http://service.spiegel.de/digas/servlet/find?S=",
desc:""},

{id:"de_yigg",
type:"news",
cc:"de",
name:"yigg",
label:"yigg.de",
url:"http://www.yigg.de",
surl:"http://www.yigg.de/suche?domains=www.yigg.de&sa=Google-Suche&sitesearch=www.yigg.de&client=pub-1406192967534280&forid=1&channel=8430379320&ie=ISO-8859-1&oe=ISO-8859-1&cof=GALT%3A%23008000%3BGL%3A1%3BDIV%3A%23336699%3BVLC%3A663399%3BAH%3Acenter%3BBGC%3AFFFFFF%3BLBGC%3A336699%3BALC%3A0000FF%3BLC%3A0000FF%3BT%3A000000%3BGFNT%3A0000FF%3BGIMP%3A0000FF%3BFORID%3A11&hl=de&q=",
desc:""},

{id:"de_ftd",
type:"finance",
cc:"de",
name:"ftd",
label:"ftd.de",
url:"http://ftd.de",
surl:"http://ftd.de/recherche/suche.html?suchtyp=news&q=",
desc:""},

{id:"de_finanznachrichten",
type:"finance",
cc:"de",
name:"finanznachrichten",
label:"finanznachrichten.de",
url:"http://www.finanznachrichten.de",
surl:"http://www.finanznachrichten.de/suche/suchergebnis.asp?words=",
desc:""},

{id:"de_onvista",
type:"finance",
cc:"de",
name:"onvista",
label:"onvista.de",
url:"http://www.onvista.de",
surl:"http://www.onvista.de/suche.html?SEARCH_VALUE=",
desc:""},

{id:"de_finanzen",
type:"finance",
cc:"de",
name:"finanzen",
label:"finanzen.net",
url:"http://www.finanzen.net",
surl:"http://www.finanzen.net/suchergebnis.asp?frmAktiensucheTextfeld=",
desc:""},

{id:"de_fimatex",
type:"finance",
cc:"de",
name:"fimatex",
label:"fimatex.de",
url:"http://partners.webmasterplan.com/click.asp?ref=436362&site=4077&type=text&tnb=1",
surl:"http://www.fimatex.de/resultat_recherche_code.phtml?code=",
desc:""},

{id:"de_dkb",
type:"finance",
cc:"de",
name:"dkb",
label:"dkb.de",
url:"http://www.dkb.de",
surl:"http://www.dkb.de/cgi-bin/kurse.pl?search=",
desc:"Kursabfrage"},

{id:"de_wettercom",
type:"diverse",
cc:"de",
name:"wettercom",
label:"wetter.com",
url:"http://www.wetter.com",
surl:"http://www.wetter.com/v2/?SID=&LANG=DE&LOC=7004&LOCFULL=7000&button1=suchen+++&search=",
desc:""},

{id:"de_wetterde",
type:"diverse",
cc:"de",
name:"wetterde",
label:"wetter.de",
url:"http://www.wetter.de",
surl:"http://wetter.rtl.de/deutschland/uebersicht.php?ort=",
desc:""},

{id:"de_gelbeseiten",
type:"diverse",
cc:"de",
name:"gelbeseiten",
label:"gelbeseiten.de",
url:"http://www.gelbeseiten.de",
surl:"http://www.gelbeseiten.de/yp/search.yp?subject=",
desc:""},

{id:"de_telefonbuch",
type:"diverse",
cc:"de",
name:"telefonbuch",
label:"telefonbuch.de",
url:"http://www.telefonbuch.de",
surl:"http://www.telefonbuch.de/?kw=",
desc:""},

{id:"de_oertliche",
type:"diverse",
cc:"de",
name:"oertliche",
label:"oertliche.de",
url:"http://www.dasoertliche.de",
surl:"http://www.dasoertliche.de/?kw=",
desc:""},

{id:"de_bahn",
type:"diverse",
cc:"de",
name:"bahn",
label:"bahn.de",
url:"http://www.bahn.de",
surl:"http://www.bahn.de/bin/iquery?db=p&text=",
desc:""},

{id:"de_ancestry",
type:"diverse",
cc:"de",
name:"ancestry",
label:"ancestry.de",
url:"http://partners.webmasterplan.com/click.asp?ref=436362&site=4263&type=text&tnb=1",
surl:"http://www.ancestry.de/learn/learningcenters/namedist.aspx?name=",
desc:"the from where your family is coming"},

{id:"de_chefkoch",
type:"diverse",
cc:"de",
name:"chefkoch",
label:"chefkoch.de",
url:"http://www.chefkoch.de",
surl:"http://www.chefkoch.de/suche.php?from_form=1&suche=",
desc:""},

{id:"de_mytv",
type:"media",
cc:"de",
name:"mytv",
label:"mytv.de",
url:"http://www.mytv.de",
surl:"http://www.mytv.de/search.html?q=",
desc:""},

{id:"de_myvideo",
type:"media",
cc:"de",
name:"myvideo",
label:"myvideo.de",
url:"http://www.myvideo.de",
surl:"http://www.myvideo.de/online/page.php?P=117&volltext=",
desc:""},

{id:"de_ofdb",
type:"media",
cc:"de",
name:"ofdb",
label:"ofdb.de",
url:"http://www.ofdb.de",
surl:"http://www.ofdb.de/view.php?page=suchergebnis&SText=",
desc:""},

{id:"de_filmstarts",
type:"media",
cc:"de",
name:"filmstarts",
label:"filmstarts.de",
url:"http://www.filmstarts.de",
surl:"http://www.google.com/custom?hl=de&oe=ISO-8859-1&client=pub-7697668210662178&cof=FORID:1%3BL:http://bilder.filmstarts.de/design/filmstarts/topbanner_google.jpg%3BLH:50%3BLW:660%3BGL:1%3BBGC:FFFFFF%3BT:%23000066%3BLC:%230a2155%3BVLC:%23000033%3BALC:%230a2155%3BGALT:%230A2155%3BGFNT:%23194198%3BGIMP:%23194198%3BDIV:%230a2155%3BLBGC:194198%3BAH:left%3BS:http://www.filmstarts.de%3B&domains=www.filmstarts.de&sitesearch=www.filmstarts.de&sa=X&oi=spell&resnum=0&ct=result&cd=1&spell=1&q=",
desc:""},

{id:"de_filmspiegel",
type:"media",
cc:"de",
name:"filmspiegel",
label:"filmspiegel.de",
url:"http://www.filmspiegel.de",
surl:"http://www.filmspiegel.de/suche/index.php?begriff=",
desc:""},

{id:"de_kino",
type:"media",
cc:"de",
name:"kino",
label:"kino.de",
url:"http://www.kino.de",
surl:"http://www.kino.de/search.php?mode=megaSearch&searchCategory=all&inputSearch=",
desc:""},

{id:"de_selfhtml",
type:"programming",
cc:"de",
name:"selfhtml",
label:"selfhtml.org",
url:"http://de.selfhtml.org",
surl:"http://de.selfhtml.org/navigation/suche/index.htm?Suchanfrage=",
desc:""},

{id:"dk_yahoo",
type:"portals",
cc:"dk",
name:"yahoo",
label:"yahoo.dk",
url:"http://www.yahoo.dk",
surl:"http://dk.search.yahoo.com/search?p=",
desc:""},

{id:"dk_jubii",
type:"portals",
cc:"dk",
name:"jubii",
label:"jubii.dk",
url:"http://www.jubii.dk",
surl:"http://search.jubii.dk/cgi-bin/pursuit?cat=loc&query=",
desc:""},

{id:"dk_eniro",
type:"portals",
cc:"dk",
name:"eniro",
label:"eniro.dk",
url:"http://www.eniro.dk",
surl:"http://www.eniro.dk/query?what=web_local&search_word=",
desc:""},

{id:"dk_wikipedia",
type:"knowledge",
cc:"dk",
name:"wikipedia",
label:"da.wikipedia",
url:"http://da.wikipedia.org",
surl:"http://da.wikipedia.org/wiki/Speciel:Search?go=G%C3%A5+til&search=",
desc:""},

{id:"dk_krak",
type:"diverse",
cc:"dk",
name:"krak",
label:"krak.dk",
url:"http://www.krak.dk",
surl:"http://www.krak.dk/Firma/Resultat.aspx?Query=",
desc:""},

{id:"es_yahoo",
type:"portals",
cc:"es",
name:"yahoo",
label:"yahoo.es",
url:"http://www.yahoo.es",
surl:"http://es.search.yahoo.com/search?p=",
desc:""},

{id:"es_ebay",
type:"shopping",
cc:"es",
name:"ebay",
label:"ebay.es",
url:"http://www.ebay.es",
surl:"http://search.ebay.es/",
desc:""},

{id:"es_wikipedia",
type:"knowledge",
cc:"es",
name:"wikipedia",
label:"es.wikipedia",
url:"http://es.wikipedia.org",
surl:"http://es.wikipedia.org/wiki/Especial:Search?go=Ir&search=",
desc:""},

{id:"fr_yahoo",
type:"portals",
cc:"fr",
name:"yahoo",
label:"yahoo.fr",
url:"http://www.yahoo.fr",
surl:"http://fr.search.yahoo.com/search?p=",
desc:""},

{id:"fr_dmoz",
type:"portals",
cc:"fr",
name:"dmoz",
label:"dmoz.fr",
url:"http://www.dmoz.fr",
surl:"http://dmoz.fr/default.asp?search=",
desc:""},

{id:"fr_amazon",
type:"shopping",
cc:"fr",
name:"amazon",
label:"amazon.fr",
url:"http://www.amazon.fr/gp/redirect.html?ie=UTF8&location=http%3A%2F%2Fwww.amazon.fr%2F&tag=mysearches-21&linkCode=ur2&camp=1642&creative=6746",
surl:"http://www.amazon.fr/gp/search?ie=UTF8&tag=mysearches-21&index=blended&linkCode=ur2&camp=1642&creative=6746&keywords=",
desc:""},

{id:"fr_ebay",
type:"shopping",
cc:"fr",
name:"ebay",
label:"ebay.fr",
url:"http://www.ebay.fr",
surl:"http://search.ebay.fr/",
desc:""},

{id:"fr_doorone",
type:"shopping",
cc:"fr",
name:"doorone",
label:"doorone.fr",
url:"http://www.doorone.fr",
surl:"http://doorone.fr/xFS?KW=",
desc:""},

{id:"fr_wikipedia",
type:"knowledge",
cc:"fr",
name:"wikipedia",
label:"fr.wikipedia",
url:"http://fr.wikipedia.org",
surl:"http://fr.wikipedia.org/wiki/Especial:Search?go=Ir&search=",
desc:""},

{id:"it_yahoo",
type:"portals",
cc:"it",
name:"yahoo",
label:"yahoo.it",
url:"http://www.yahoo.it",
surl:"http://it.search.yahoo.com/search?p=",
desc:""},

{id:"it_ebay",
type:"shopping",
cc:"it",
name:"ebay",
label:"ebay.it",
url:"http://www.ebay.it",
surl:"http://search.ebay.it/",
desc:""},

{id:"it_wikipedia",
type:"knowledge",
cc:"it",
name:"wikipedia",
label:"it.wikipedia",
url:"http://it.wikipedia.org",
surl:"http://it.wikipedia.org/wiki/Speciale:Search?go=Vai&search=",
desc:""},

{id:"jp_yahoo",
type:"portals",
cc:"jp",
name:"yahoo",
label:"yahoo.co.jp",
url:"http://www.yahoo.co.jp",
surl:"http://search.yahoo.co.jp/search?p=",
desc:""},

{id:"jp_greengoo",
type:"portals",
cc:"jp",
name:"greengoo",
label:"green.goo.ne.jp",
url:"http://green.goo.ne.jp",
surl:"http://green.search.goo.ne.jp/search?OE=UTF-8&IE=UTF-8&from=eco_search&MT=",
desc:""},

{id:"jp_amazon",
type:"shopping",
cc:"jp",
name:"amazon",
label:"amazon.co.jp",
url:"http://www.amazon.co.jp",
surl:"http://www.amazon.co.jp/exec/obidos/redirect?link_code=ur2&tag=wwwmadmaxmatd-21&camp=1638&creative=6742&path=external-search%3Fsearch-type=ss%26index=blended%26keyword=",
desc:""},

{id:"jp_wikipedia",
type:"knowledge",
cc:"jp",
name:"wikipedia",
label:"ja.wikipedia",
url:"http://ja.wikipedia.org",
surl:"http://ja.wikipedia.org/wiki/%E7%89%B9%E5%88%A5:Search?search=",
desc:""},

{id:"jp_gnavi",
type:"diverse",
cc:"jp",
name:"gnavi",
label:"gnavi.co.jp",
url:"http://www.gnavi.co.jp",
surl:"http://gsearch.gnavi.co.jp/rest/search.php?key=",
desc:"restraunt search"},

{id:"jp_ruby",
type:"programming",
cc:"jp",
name:"ruby",
label:"ruby-lang.org/ja",
url:"http://www.ruby-lang.org/ja",
surl:"http://www.ruby-lang.org/ja/search/?q=",
desc:"ruby official in japanese"},

{id:"nl_yahoo",
type:"portals",
cc:"nl",
name:"yahoo",
label:"yahoo.nl",
url:"http://www.yahoo.nl",
surl:"http://nl.search.yahoo.com/search?p=",
desc:""},

{id:"nl_vinden",
type:"portals",
cc:"nl",
name:"vinden",
label:"vinden.nl",
url:"http://www.vinden.nl",
surl:"http://www.vinden.nl/?q=",
desc:""},

{id:"nl_dmoz",
type:"portals",
cc:"nl",
name:"dmoz",
label:"dmoz.nl",
url:"http://www.dmoz.nl",
surl:"http://search.dmoz.org/cgi-bin/search?cat=World%2FNederlands&all=no&search=",
desc:""},

{id:"nl_ebay",
type:"shopping",
cc:"nl",
name:"ebay",
label:"ebay.nl",
url:"http://www.ebay.nl",
surl:"http://search.ebay.nl/",
desc:""},

{id:"nl_wikipedia",
type:"knowledge",
cc:"nl",
name:"wikipedia",
label:"nl.wikipedia",
url:"http://nl.wikipedia.org",
surl:"http://nl.wikipedia.org/wiki/Speciaal:Search?go=Artikel&search=",
desc:""},

{id:"nl_uitmuntend",
type:"knowledge",
cc:"nl",
name:"uitmuntend",
label:"uitmuntend.de DE-NL",
url:"http://www.uitmuntend.de",
surl:"http://www.uitmuntend.de/search.html?search=",
desc:""},

{id:"se_yahoo",
type:"portals",
cc:"se",
name:"yahoo",
label:"yahoo.se",
url:"http://se.yahoo.com/",
surl:"http://se.search.yahoo.com/search?p=",
desc:""},

{id:"se_spray",
type:"portals",
cc:"se",
name:"spray",
label:"spray.se",
url:"http://www.spray.se",
surl:"http://lycossvar.spray.se/cgi-bin/pursuit?query=",
desc:""},

{id:"se_eniro",
type:"portals",
cc:"se",
name:"eniro",
label:"eniro.se",
url:"http://www.eniro.se",
surl:"http://www.eniro.se/query?what=se&q=",
desc:""},

{id:"se_ebay",
type:"shopping",
cc:"se",
name:"ebay",
label:"ebay.se",
url:"http://www.ebay.se",
surl:"http://www.ebay.se/listResults?browse=0&Query=",
desc:""},

{id:"se_wikipedia",
type:"knowledge",
cc:"se",
name:"wikipedia",
label:"sv.wikipedia",
url:"http://sv.wikipedia.org",
surl:"http://sv.wikipedia.org/wiki/Special:Search?go=G%C3%A5+till&search=",
desc:""},

{id:"se_hitta",
type:"diverse",
cc:"se",
name:"hitta",
label:"hitta.se",
url:"http://www.hitta.se",
surl:"http://www.hitta.se/SearchMixed.aspx?UCSB%3aTextBoxWho=",
desc:""},

{id:"uk_yahoo",
type:"portals",
cc:"uk",
name:"yahoo",
label:"yahoo.co.uk",
url:"http://www.yahoo.co.uk",
surl:"http://uk.search.yahoo.com/search?p=",
desc:""},

{id:"uk_bbc",
type:"news",
cc:"uk",
name:"bbc",
label:"bbc.co.uk",
url:"http://www.bbc.co.uk",
surl:"http://search.bbc.co.uk/cgi-bin/search/results.pl?q=",
desc:""},

{id:"uk_guardian",
type:"news",
cc:"uk",
name:"guardian",
label:"guardian.co.uk",
url:"http://www.guardian.co.uk",
surl:"http://browse.guardian.co.uk/search?search=",
desc:""},

{id:"uk_newscientist",
type:"news",
cc:"uk",
name:"newscientist",
label:"newscientist.com",
url:"http://www.newscientist.com",
surl:"http://www.newscientist.com/search.ns?query=",
desc:""},

{id:"uk_ebay",
type:"shopping",
cc:"uk",
name:"ebay",
label:"ebay.co.uk",
url:"http://www.ebay.co.uk",
surl:"http://search.ebay.co.uk/",
desc:""},

{id:"uk_amazon",
type:"shopping",
cc:"uk",
name:"amazon",
label:"amazon.co.uk",
url:"http://www.amazon.co.uk/gp/redirect.html?ie=UTF8&location=http%3A%2F%2Fwww.amazon.co.uk%2F&tag=mulseagad05-21&linkCode=ur2&camp=1634&creative=6738",
surl:"http://www.amazon.co.uk/gp/search?ie=UTF8&tag=mulseagad05-21&index=blended&linkCode=ur2&camp=1634&creative=6738&keywords=",
desc:""},

{id:"uk_doorone",
type:"shopping",
cc:"uk",
name:"doorone",
label:"doorone.uk",
url:"http://www.doorone.co.uk",
surl:"http://doorone.co.uk/xFS?KW=",
desc:""},

{id:"uk_play",
type:"shopping",
cc:"uk",
name:"play",
label:"play.com",
url:"http://www.play.com",
surl:"http://www.play.com/Search.aspx?searchtype=allproducts&searchstring=",
desc:""},

{id:"us_yahoo",
type:"portals",
cc:"us",
name:"yahoo",
label:"yahoo.com",
url:"http://www.yahoo.com",
surl:"http://search.yahoo.com/search?p=",
desc:""},

{id:"us_creativecommons",
type:"portals",
cc:"us",
name:"creativecommons",
label:"creativecommons.org",
url:"http://creativecommons.org",
surl:"http://search.creativecommons.org/?q=",
desc:""},

{id:"us_metacrawler",
type:"portals",
cc:"us",
name:"metacrawler",
label:"metacrawler.com",
url:"http://www.metacrawler.com",
surl:"http://www.metacrawler.com/info.metac/search/web/",
desc:""},

{id:"us_ebay",
type:"shopping",
cc:"us",
name:"ebay",
label:"ebay.com",
url:"http://www.ebay.com",
surl:"http://search.ebay.com/",
desc:""},

{id:"us_amazon",
type:"shopping",
cc:"us",
name:"amazon",
label:"amazon.com",
url:"http://www.amazon.com/gp/redirect.html?ie=UTF8&location=http%3A%2F%2Fwww.amazon.com%2F&tag=mysearches-20&linkCode=ur2&camp=1789&creative=9325",
surl:"http://www.amazon.com/gp/search?ie=UTF8&tag=mysearches-20&index=blended&linkCode=ur2&camp=1789&creative=9325&keywords=",
desc:""},

{id:"us_ft",
type:"finance",
cc:"us",
name:"ft",
label:"financialtimes.com",
url:"http://www.ft.com",
surl:"http://search.ft.com/searchResults?queryText=",
desc:""},

{id:"us_wikipedia",
type:"knowledge",
cc:"us",
name:"wikipedia",
label:"en.wikipedia",
url:"http://en.wikipedia.org",
surl:"http://en.wikipedia.org/wiki/Spezial:Search?go=Artikel&search=",
desc:""},

{id:"us_about",
type:"knowledge",
cc:"us",
name:"about",
label:"about.com",
url:"http://www.about.com",
surl:"http://search.about.com/fullsearch.htm?terms=",
desc:""},

{id:"us_hakia",
type:"knowledge",
cc:"us",
name:"hakia",
label:"hakia.com",
url:"http://www.hakia.com",
surl:"http://www.hakia.com/search.aspx?q=",
desc:""},

{id:"us_answer",
type:"knowledge",
cc:"us",
name:"answer",
label:"answer.com",
url:"http://www.answer.com",
surl:"http://www.answers.com/main/ntquery?s=",
desc:"The worlds greatest encyclodictionalmanacapedia"},

{id:"us_thefreedictionary",
type:"knowledge",
cc:"us",
name:"thefreedictionary",
label:"thefreedictionary.com",
url:"http://www.thefreedictionary.com",
surl:"http://www.thefreedictionary.com/",
desc:""},

{id:"us_wikihow",
type:"knowledge",
cc:"us",
name:"wikihow",
label:"wikihow.com",
url:"http://www.wikihow.com",
surl:"http://www.wikihow.com/Special:LSearch?fulltext=Search&search=",
desc:""},

{id:"us_acronymfinder",
type:"knowledge",
cc:"us",
name:"acronymfinder",
label:"acronymfinder.com",
url:"http://www.acronymfinder.com",
surl:"http://www.acronymfinder.com/af-query.asp?Acronym=",
desc:""},

{id:"us_urbandictionary",
type:"knowledge",
cc:"us",
name:"urbandictionary",
label:"urbandictionary.com",
url:"http://www.urbandictionary.com",
surl:"http://www.urbandictionary.com/define.php?term=",
desc:""},

{id:"aa_google",
type:"google",
cc:"",
name:"google",
label:"google.com (ENTER)",
url:"http://google.com",
surl:"http://www.google.com/search?q=",
desc:"Also search google with ENTER"},

{id:"aa_googleblogsearch",
type:"google",
cc:"",
name:"googleblogsearch",
label:"blogsearch.google.com",
url:"http://blogsearch.google.com",
surl:"http://blogsearch.google.com/blogsearch?&ui=blg&q=",
desc:"Search for blogs"},

{id:"aa_googlebookmarks",
type:"google",
cc:"",
name:"googlebookmarks",
label:"google.com/bookmarks",
url:"http://www.google.com/bookmarks",
surl:"http://www.google.com/bookmarks/find?q=",
desc:"Search for your private bookmarks"},

{id:"aa_googlebooks",
type:"google",
cc:"",
name:"googlebooks",
label:"books.google.com",
url:"http://books.google.com",
surl:"http://books.google.com/books?q=",
desc:""},

{id:"aa_googlecodesearch",
type:"google",
cc:"",
name:"googlecodesearch",
label:"google.com/codesearch",
url:"http://www.google.com/codesearch",
surl:"http://www.google.com/codesearch?q=",
desc:""},

{id:"aa_googledirectory",
type:"google",
cc:"",
name:"googledirectory",
label:"directory.google.com",
url:"http://directory.google.com/",
surl:"http://www.google.com/search?hl=en&cat=gwd%2FTop&q=",
desc:""},

{id:"aa_googledocs",
type:"google",
cc:"",
name:"googledocs",
label:"docs.google.com",
url:"http://docs.google.com",
surl:"http://docs.google.com/#search/",
desc:""},

{id:"aa_googlefinance",
type:"google",
cc:"",
name:"googlefinance",
label:"finance.google.com",
url:"http://finance.google.com",
surl:"http://finance.google.com/finance?q=",
desc:""},

{id:"aa_googlegroups",
type:"google",
cc:"",
name:"googlegroups",
label:"groups.google.com",
url:"http://groups.google.com",
surl:"http://groups.google.com/groups/search?q=",
desc:""},

{id:"aa_googlehistory",
type:"google",
cc:"",
name:"googlehistory",
label:"google.com/history",
url:"http://www.google.com/history",
surl:"http://www.google.com/history/find?q=",
desc:""},

{id:"aa_googleimages",
type:"google",
cc:"",
name:"googleimages",
label:"images.google.com",
url:"http://images.google.com",
surl:"http://images.google.com/images?q=",
desc:""},

{id:"aa_googlegadget",
type:"google",
cc:"",
name:"googlegadget",
label:"igoogle gadget directory",
url:"http://www.google.com/ig/directory",
surl:"http://www.google.com/ig/directory?q=",
desc:"Gadget search in iGoogle directory"},

{id:"aa_googlejaiku",
type:"google",
cc:"",
name:"googlejaiku",
label:"jaiku.com",
url:"http://jaiku.com",
surl:"http://jaiku.com/explore/find?query=",
desc:""},

{id:"aa_googleknol",
type:"google",
cc:"",
name:"googleknol",
label:"knol.google.com",
url:"http://knol.google.com",
surl:"http://knol.google.com/k/knol/system/knol/pages/Search?restrict=general&q=",
desc:"A unit of knowledge"},

{id:"aa_googlelinux",
type:"google",
cc:"",
name:"googlelinux",
label:"google.com/linux",
url:"http://www.google.com/linux",
surl:"http://www.google.com/linux?q=",
desc:""},

{id:"aa_googlelively",
type:"google",
cc:"",
name:"googlelively",
label:"lively.com",
url:"http://www.lively.com",
surl:"http://www.lively.com/search?query=",
desc:"Create an avatar and chat with your friends in rooms you design"},

{id:"aa_googlemaps",
type:"google",
cc:"",
name:"googlemaps",
label:"maps.google.com",
url:"http://maps.google.com",
surl:"http://maps.google.com/maps?q=",
desc:""},

{id:"aa_googlenews",
type:"google",
cc:"",
name:"googlenews",
label:"news.google.com",
url:"http://news.google.com",
surl:"http://news.google.com/news?q=",
desc:""},

{id:"aa_googleorkut",
type:"google",
cc:"",
name:"googleorkut",
label:"orkut.com",
url:"http://www.orkut.com",
surl:"http://www.orkut.com/UniversalSearch.aspx?origin=box&exp=1&q=",
desc:""},

{id:"aa_googlepicasa",
type:"google",
cc:"",
name:"googlepicasa",
label:"picasaweb.google.com",
url:"http://picasaweb.google.com",
surl:"http://picasaweb.google.com/lh/searchbrowse?q=",
desc:""},

{id:"aa_googlepatents",
type:"google",
cc:"",
name:"googlepatents",
label:"google.com/patents",
url:"http://www.google.com/patents",
surl:"http://www.google.com/patents?q=",
desc:""},

{id:"aa_googleproducts",
type:"google",
cc:"",
name:"googleproducts",
label:"google.com/products",
url:"http://www.google.com/products",
surl:"http://www.google.com/products?q=",
desc:""},

{id:"aa_googlescholar",
type:"google",
cc:"",
name:"googlescholar",
label:"scholar.google.com",
url:"http://scholar.google.com",
surl:"http://scholar.google.com/scholar?q=",
desc:""},

{id:"aa_googlesites",
type:"google",
cc:"",
name:"googlesites",
label:"sites.google.com",
url:"http://sites.google.com",
surl:"http://sites.google.com/site/sites/system/app/pages/meta/search?q=",
desc:""},

{id:"aa_googletranslate",
type:"google",
cc:"",
name:"googletranslate",
label:"translate.google.com",
url:"http://translate.google.com",
surl:"http://translate.google.com/translate_t#auto|en|",
desc:""},

{id:"aa_googlevideo",
type:"google",
cc:"",
name:"googlevideo",
label:"video.google.com",
url:"http://video.google.com",
surl:"http://video.google.com/videosearch?q=",
desc:""},

{id:"aa_youtube",
type:"google",
cc:"",
name:"youtube",
label:"youtube.com",
url:"http://www.youtube.com",
surl:"http://www.youtube.com/results?search_query=",
desc:""},

{id:"aa_searchmash",
type:"google",
cc:"",
name:"searchmash",
label:"searchmash.com",
url:"http://www.searchmash.com",
surl:"http://www.searchmash.com/search/",
desc:"Spezial Google search engine to test new features."},

{id:"aa_googlemodules",
type:"google",
cc:"",
name:"googlemodules",
label:"googlemodules.com",
url:"http://www.googlemodules.com",
surl:"http://www.googlemodules.com/?mode=showSearchResults&q=",
desc:""},

{id:"aa_gwb",
type:"google",
cc:"",
name:"gwb",
label:"googlewatchblog.de",
url:"http://www.googlewatchblog.de",
surl:"http://www.googlewatchblog.de/index.php?s=",
desc:""},

{id:"aa_live",
type:"portals",
cc:"",
name:"live",
label:"live.com",
url:"http://www.live.com",
surl:"http://search.live.com/results.aspx?q=",
desc:""},

{id:"aa_altavista",
type:"portals",
cc:"",
name:"altavista",
label:"altavista.com",
url:"http://www.altavista.com",
surl:"http://www.altavista.com/web/results?q=",
desc:""},

{id:"aa_ask",
type:"portals",
cc:"",
name:"ask",
label:"ask.com",
url:"http://www.ask.com",
surl:"http://www.ask.com/web?q=",
desc:""},

{id:"aa_yubnub",
type:"portals",
cc:"",
name:"yubnub",
label:"yubnub.org",
url:"http://www.yubnub.org",
surl:"http://yubnub.org/parser/parse?command=",
desc:""},

{id:"aa_a9",
type:"portals",
cc:"",
name:"a9",
label:"a9.com",
url:"http://opensearch.a9.com",
surl:"http://a9.com/?q=",
desc:"search for more at once"},

{id:"aa_wolframalpha",
type:"portals",
cc:"",
name:"wolframalpha",
label:"wolframalpha.com",
url:"http://wolframalpha.com",
surl:"http://wolframalpha.com/input/?",
desc:"computational knowledge engine"},

{id:"aa_snap",
type:"portals",
cc:"",
name:"snap",
label:"snap.com",
url:"http://www.snap.com",
surl:"http://www.snap.com/#",
desc:"The other way to search"},

{id:"aa_kartoo",
type:"portals",
cc:"",
name:"kartoo",
label:"kartoo.com",
url:"http://www.kartoo.com",
surl:"http://www.kartoo.com/flash04.php3?langue=en&q=",
desc:"The other way to search"},

{id:"aa_cuil",
type:"portals",
cc:"",
name:"cuil",
label:"cuil.com",
url:"http://www.cuil.com",
surl:"http://www.cuil.com/search?q=",
desc:"Cuil is an old Irish word for knowledge. For knowledge, ask Cuil."},

{id:"aa_boysfood",
type:"xxx",
cc:"",
name:"boysfood",
label:"boysfood.com",
url:"http://www.boysfood.com",
surl:"http://www.boysfood.com/cgi-bin/bfn.cgi?search=",
desc:""},

{id:"aa_flurl",
type:"xxx",
cc:"",
name:"flurl",
label:"flurl.com",
url:"http://www.flurl.com",
surl:"http://www.flurl.com/search?q=",
desc:""},

{id:"aa_freesextubes",
type:"xxx",
cc:"",
name:"freesextubes",
label:"freesextubes.com",
url:"http://www.freesextubes.com",
surl:"http://www.freesextubes.com/search/",
desc:""},

{id:"aa_kindgirls",
type:"xxx",
cc:"",
name:"kindgirls",
label:"kindgirls.com",
url:"http://kindgirls.com",
surl:"http://kindgirls.com/search.php?s=",
desc:""},

{id:"aa_mrsnake",
type:"xxx",
cc:"",
name:"mrsnake",
label:"mrsnake.com",
url:"http://www.mrsnake.com",
surl:"http://www.mrsnake.com/videos.php?q=",
desc:""},

{id:"aa_pornative",
type:"xxx",
cc:"",
name:"pornative",
label:"pornative.com",
url:"http://www.pornative.com",
surl:"http://www.pornative.com/search/rating/1.html?search=",
desc:""},

{id:"aa_pornhub",
type:"xxx",
cc:"",
name:"pornhub",
label:"pornhub.com",
url:"http://pornhub.com",
surl:"http://www.pornhub.com/video/search?search=",
desc:""},

{id:"aa_pornotube",
type:"xxx",
cc:"",
name:"pornotube",
label:"pornotube.com",
url:"http://pornotube.com",
surl:"http://pornotube.com/search.php?q=",
desc:""},

{id:"aa_redtube",
type:"xxx",
cc:"",
name:"redtube",
label:"redtube.com",
url:"http://www.redtube.com",
surl:"http://www.redtube.com/?search=",
desc:""},

{id:"aa_shufuni",
type:"xxx",
cc:"",
name:"shufuni",
label:"shufuni.com",
url:"http://www.shufuni.com",
surl:"http://www.shufuni.com/SearchResult.aspx?search=",
desc:""},

{id:"aa_thesextubesite",
type:"xxx",
cc:"",
name:"thesextubesite",
label:"thesextubesite.com",
url:"http://www.thesextubesite.com",
surl:"http://www.thesextubesite.com/search/",
desc:""},

{id:"aa_tube8",
type:"xxx",
cc:"",
name:"tube8",
label:"tube8.com",
url:"http://www.tube8.com",
surl:"http://www.tube8.com/search.html?q=",
desc:""},

{id:"aa_vidz",
type:"xxx",
cc:"",
name:"vidz",
label:"vidz.com",
url:"http://www.vidz.com",
surl:"http://www.vidz.com/search?q=",
desc:""},

{id:"aa_xmissyporn",
type:"xxx",
cc:"",
name:"xmissyporn",
label:"xmissyporn.com",
url:"http://www.xmissyporn.com",
surl:"http://www.xmissyporn.com/index.php?amount=0&blogid=9&query=",
desc:""},

{id:"aa_xnxx",
type:"xxx",
cc:"",
name:"xnxx",
label:"xnxx.com",
url:"http://www.xnxx.com",
surl:"http://video.xnxx.com/?k=",
desc:""},

{id:"aa_xtube",
type:"xxx",
cc:"",
name:"xtube",
label:"xtube.com",
url:"http://www.xtube.com",
surl:"http://www.xtube.com/results.php?type=video&search=",
desc:""},

{id:"aa_xvideos",
type:"xxx",
cc:"",
name:"xvideos",
label:"xvideos.com",
url:"http://www.xvideos.com",
surl:"http://www.xvideos.com/?k=",
desc:""},

{id:"aa_youporn",
type:"xxx",
cc:"",
name:"youporn",
label:"youporn.com",
url:"http://www.youporn.com",
surl:"http://youporn.com/search?query=",
desc:""},

{id:"aa_yourfilehost",
type:"xxx",
cc:"",
name:"yourfilehost",
label:"yourfilehost.com",
url:"http://www.yourfilehost.com",
surl:"http://www.flurl.com/search?sort_by=related&site_id=147&q=",
desc:""},

{id:"aa_wikiwix",
type:"knowledge",
cc:"",
name:"wikiwix",
label:"wikiwix.com",
url:"http://www.wikiwix.com",
surl:"http://www.wikiwix.com/index.php?art=true&action=",
desc:"The ultimate Wikipedia articles search engine"},

{id:"aa_wikia",
type:"knowledge",
cc:"",
name:"wikia",
label:"wikia.com",
url:"http://alpha.search.wikia.com",
surl:"http://re.search.wikia.com/search#",
desc:"Search is part of the fundamental infrastructure of the Internet. And we are making it open source"},

{id:"aa_onelook",
type:"knowledge",
cc:"",
name:"onelook",
label:"onelook.com",
url:"http://www.onelook.com",
surl:"http://www.onelook.com/?w=",
desc:"One Click - Multi Dictionary Search"},

{id:"aa_reference",
type:"knowledge",
cc:"",
name:"reference",
label:"reference.com",
url:"http://www.reference.com",
surl:"http://www.reference.com/browse/all/",
desc:""},

{id:"aa_thesaurus",
type:"knowledge",
cc:"",
name:"thesaurus",
label:"thesaurus.com",
url:"http://www.thesaurus.com",
surl:"http://thesaurus.reference.com/browse/",
desc:""},

{id:"aa_dictionary",
type:"knowledge",
cc:"",
name:"dictionary",
label:"dictionary.com",
url:"http://www.dictionary.com",
surl:"http://dictionary.reference.com/browse/",
desc:""},

{id:"aa_archive",
type:"knowledge",
cc:"",
name:"archive",
label:"archive.org",
url:"http://www.archive.org",
surl:"http://www.archive.org/search.php?query=",
desc:"Universal Access to human knowledge"},

{id:"aa_waybackmachine",
type:"knowledge",
cc:"",
name:"waybackmachine",
label:"WayBackMachine",
url:"http://web.archive.org/collections/web.html",
surl:"http://web.archive.org/archive_request_ng?url=",
desc:"Surf the web as it was"},

{id:"aa_myspace",
type:"community",
cc:"",
name:"myspace",
label:"myspace.com",
url:"http://www.myspace.com",
surl:"http://searchservice.myspace.com/index.cfm?fuseaction=search&searchType=network&searchBy=First&Submit=Suchen&SearchBoxID=FindAFriend&f_first_name=",
desc:""},

{id:"aa_facebook",
type:"community",
cc:"",
name:"facebook",
label:"facebook.com",
url:"http://www.facebook.com",
surl:"http://www.facebook.com/srch.php?nm=",
desc:"Facebook is a social utility that connects you with the people around you."},

{id:"aa_linkedin",
type:"community",
cc:"",
name:"linkedin",
label:"linkedin.com",
url:"http://www.linkedin.com",
surl:"http://www.linkedin.com/search?search=&sortCriteria=4&rd=out&keywords=",
desc:"Share knowledge and tap into relationships."},

{id:"aa_hi5",
type:"community",
cc:"",
name:"hi5",
label:"hi5.com",
url:"http://www.hi5.com",
surl:"http://hi5.com/friend/processBrowseSearch.do?searchText=",
desc:"Discover, Connect, Communicate"},

{id:"aa_wayn",
type:"community",
cc:"",
name:"wayn",
label:"wayn.com",
url:"http://www.wayn.com",
surl:"http://www.wayn.com/waynsearches.html?wci=namesearchresults&country=All%20Countries&forename=&surname=",
desc:"Where are you now?"},

{id:"aa_classmates",
type:"community",
cc:"",
name:"classmates",
label:"classmates.com",
url:"http://www.classmates.com",
surl:"http://www.classmates.com/search/mastheadSearch.do?queryString=",
desc:"Real people, real names."},

{id:"aa_twitter",
type:"community",
cc:"",
name:"twitter",
label:"twitter.com",
url:"http://twitter.com",
surl:"http://search.twitter.com/search?q=",
desc:"See what's happening â€” right now."},

{id:"aa_digg",
type:"bookmarking",
cc:"",
name:"digg",
label:"digg.com",
url:"http://digg.com",
surl:"http://digg.com/search?section=all&s=",
desc:""},

{id:"aa_delicious",
type:"bookmarking",
cc:"",
name:"delicious",
label:"del.icio.us",
url:"http://del.icio.us",
surl:"http://del.icio.us/search/?fr=del_icio_us&type=all&p=",
desc:""},

{id:"aa_reddit",
type:"bookmarking",
cc:"",
name:"reddit",
label:"reddit.com",
url:"http://reddit.com",
surl:"http://reddit.com/search?q=",
desc:""},

{id:"aa_flickr",
type:"media",
cc:"",
name:"flickr",
label:"flickr.com",
url:"http://flickr.com",
surl:"http://flickr.com/search/?q=",
desc:""},

{id:"aa_hulu",
type:"media",
cc:"",
name:"hulu",
label:"hulu.com",
url:"http://hulu.com",
surl:"http://www.hulu.com/videos/search?query=",
desc:""},

{id:"aa_brightcove",
type:"media",
cc:"",
name:"brightcove",
label:"brightcove.com",
url:"http://www.brightcove.com",
surl:"http://www.brightcove.com/search/search.cfm?cx=011043846403879487989%3Aoa7iaakkyzm&cof=FORID%3A11%3BNB%3A1&q=",
desc:""},

{id:"aa_livevideo",
type:"media",
cc:"",
name:"livevideo",
label:"livevideo.com",
url:"http://www.livevideo.com",
surl:"http://www.livevideo.com/media/search.aspx?d=1&tag=",
desc:""},

{id:"aa_purevideo",
type:"media",
cc:"",
name:"purevideo",
label:"purevideo.com",
url:"http://www.purevideo.com",
surl:"http://www.purevideo.com/video-",
desc:"First Internet Video Meta Search"},

{id:"aa_imdb",
type:"media",
cc:"",
name:"imdb",
label:"imdb.com",
url:"http://www.imdb.com",
surl:"http://www.imdb.com/find?q=",
desc:""},

{id:"aa_yahoovideo",
type:"media",
cc:"",
name:"yahoovideo",
label:"video.yahoo.com",
url:"http://video.yahoo.com",
surl:"http://video.yahoo.com/video/search?p=",
desc:"",
icon:"yahoo"},

{id:"aa_photobucket",
type:"media",
cc:"",
name:"photobucket",
label:"photobucket.com",
url:"http://photobucket.com",
surl:"http://photobucket.com/images/",
desc:""},

{id:"aa_dailymotion",
type:"media",
cc:"",
name:"dailymotion",
label:"dailymotion.com",
url:"http://www.dailymotion.com",
surl:"http://www.dailymotion.com/videos/relevance/search/",
desc:""},

{id:"aa_megavideo",
type:"media",
cc:"",
name:"megavideo",
label:"megavideo.com",
url:"http://www.megavideo.com",
surl:"http://www.megavideo.com/?c=search&s=",
desc:""},

{id:"aa_videojug",
type:"media",
cc:"",
name:"videojug",
label:"videojug.com",
url:"http://www.videojug.com",
surl:"http://www.videojug.com/search?keywords=",
desc:""},

{id:"aa_teachertube",
type:"media",
cc:"",
name:"teachertube",
label:"teachertube.com",
url:"http://www.teachertube.com",
surl:"http://www.teachertube.com/search_result.php?search_id=",
desc:"Teach the world"},

{id:"aa_metacafe",
type:"media",
cc:"",
name:"metacafe",
label:"metacafe.com",
url:"http://www.metacafe.com",
surl:"http://www.metacafe.com/tags/",
desc:""},

{id:"aa_heavy",
type:"media",
cc:"",
name:"heavy",
label:"heavy.com",
url:"http://www.heavy.com",
surl:"http://www.heavy.com/search?action=videos&tag=",
desc:""},

{id:"aa_alluc",
type:"media",
cc:"",
name:"alluc",
label:"alluc.org",
url:"http://www.alluc.org",
surl:"http://www12.alluc.org/alluc/no_cache/results.html?tx_ansearchit_resOverview%5Bsection%5D=3.&tx_ansearchit_resOverview%5BsWord%5D=",
desc:""},

{id:"aa_fanpop",
type:"media",
cc:"",
name:"fanpop",
label:"fanpop.com",
url:"http://www.fanpop.com",
surl:"http://www.fanpop.com/search/",
desc:""},

{id:"aa_php",
type:"programming",
cc:"",
name:"php",
label:"php.net",
url:"http://www.php.net",
surl:"http://de3.php.net/manual-lookup.php?lang=de&pattern=",
desc:""},

{id:"aa_msdn",
type:"programming",
cc:"",
name:"msdn",
label:"msdn.com",
url:"http://www.msdn.microsoft.com",
surl:"http://search.msdn.microsoft.com/search/default.aspx?query=",
desc:""},

{id:"aa_sourceforge",
type:"programming",
cc:"",
name:"sourceforge",
label:"sourceforge.net",
url:"http://www.sourceforge.net",
surl:"http://sourceforge.net/search/?type_of_search=soft&words=",
desc:""},

{id:"aa_apidoc",
type:"programming",
cc:"",
name:"apidoc",
label:"apidoc.org",
url:"http://apidoc.org",
surl:"http://apidoc.org/search?q=",
desc:""},

{id:"aa_ruby",
type:"programming",
cc:"",
name:"ruby",
label:"ruby-lang.org",
url:"http://www.ruby-lang.org/en/",
surl:"http://www.ruby-lang.org/en/search/?q=",
desc:"ruby official"},

{id:"aa_krugle",
type:"programming",
cc:"",
name:"krugle",
label:"krugle.com",
url:"http://krugle.com",
surl:"http://krugle.com/kse/files?query=",
desc:">>> find code"},

{id:"aa_koders",
type:"programming",
cc:"",
name:"koders",
label:"koders.com",
url:"http://www.koders.com",
surl:"http://www.koders.com/default.aspx?s=",
desc:""},

{id:"aa_perldoc",
type:"programming",
cc:"",
name:"perldoc",
label:"perldoc.perl.org",
url:"http://perldoc.perl.org",
surl:"http://perldoc.perl.org/search.html?q=",
desc:""},

{id:"aa_perlmonks",
type:"programming",
cc:"",
name:"perlmonks",
label:"perlmonks.org",
url:"http://www.perlmonks.org",
surl:"http://www.perlmonks.org/?node=",
desc:""},

{id:"aa_portableapps",
type:"programming",
cc:"",
name:"portableapps",
label:"portableapps.com",
url:"http://www.portableapps.com",
surl:"http://portableapps.com/search/node/",
desc:""},

{id:"aa_ajaxrain",
type:"programming",
cc:"",
name:"ajaxrain",
label:"ajaxrain.com",
url:"http://www.ajaxrain.com",
surl:"http://www.ajaxrain.com/search.php?seVal=",
desc:"JS libs"},

{id:"aa_torrentsearchbar",
type:"torrent",
cc:"",
name:"torrentsearchbar",
label:"torrent-search-bar.com",
url:"http://www.torrent-search-bar.com",
surl:"http://www.google.com/custom?cx=007543263361953292879%3Aip0b-z8nzwc&sa=Search&cof=GFNT%3A%23000000%3BGALT%3A%23008000%3BLH%3A51%3BCX%3ATorrent%2520Search%3BVLC%3A%23663399%3BDIV%3A%23FFFFFF%3BFORID%3A1%3BT%3A%23000000%3BALC%3A%230000CC%3BLC%3A%230000CC%3BS%3Ahttp%3A%2F%2Fwww%2Etorrent-search-bar%2Ecom%2F%3BL%3Ahttp%3A%2F%2Fwww%2Etorrent-search-bar%2Ecom%2Ftorrent_search_logo_s%2Egif%3BGIMP%3A%23000000%3BLP%3A1%3BBGC%3A%23FFFFFF%3BAH%3Aleft&client=pub-4359655221859943&q=",
desc:""},

{id:"aa_torrentsbooth",
type:"torrent",
cc:"",
name:"torrentsbooth",
label:"torrentsbooth.com",
url:"http://www.torrentsbooth.com",
surl:"http://www.torrentsbooth.com/torrentsearch.html?cx=003343599837851107519%3Ad8dqv2x7u-8&cof=FORID%3A10&q=",
desc:""},

{id:"aa_torrentportal",
type:"torrent",
cc:"",
name:"torrentportal",
label:"torrentportal.com",
url:"http://www.torrentportal.com",
surl:"http://www.torrentportal.com/torrents-search.php?search=",
desc:""},

{id:"aa_torrentscoop",
type:"torrent",
cc:"",
name:"torrentscoop",
label:"torrentscoop.com",
url:"http://torrentscoop.com",
surl:"http://torrentscoop.com/results.php?google_ad_client=&cx=004204163392280045974%3A6_k16oycl5e&cof=FORID%3A10&q=",
desc:""},

{id:"aa_torrent-finder",
type:"torrent",
cc:"",
name:"torrent-finder",
label:"torrent-finder.com",
url:"http://www.torrent-finder.com",
surl:"http://torrent-finder.com/show.php?Search=Search&PageLoad=oneattime&select=ALL&kywrd=",
desc:""},

{id:"aa_btjunkie",
type:"torrent",
cc:"",
name:"btjunkie",
label:"btjunkie.org",
url:"http://www.btjunkie.org",
surl:"http://btjunkie.org/search?q=",
desc:""},

{id:"aa_isohunt",
type:"torrent",
cc:"",
name:"isohunt",
label:"isohunt.com",
url:"http://www.isohunt.com",
surl:"http://www.isohunt.com/torrents/",
desc:""},

{id:"aa_mininova",
type:"torrent",
cc:"",
name:"mininova",
label:"mininova.org",
url:"http://www.mininova.org",
surl:"http://www.mininova.org/search/?search=",
desc:""},

{id:"aa_meganova",
type:"torrent",
cc:"",
name:"meganova",
label:"meganova.org",
url:"http://www.meganova.org",
surl:"http://www.meganova.org/search.php?order=5&search=",
desc:""},

{id:"aa_thepiratebay",
type:"torrent",
cc:"",
name:"thepiratebay",
label:"thepiratebay.org",
url:"http://www.thepiratebay.org",
surl:"http://thepiratebay.org/search.php?orderby=se&q=",
desc:""},

{id:"aa_torrentspy",
type:"torrent",
cc:"",
name:"torrentspy",
label:"torrentspy.com",
url:"http://www.torrentspy.com",
surl:"http://www.torrentspy.com/search?query=",
desc:""},

{id:"aa_yabse",
type:"torrent",
cc:"",
name:"yabse",
label:"yabse.com",
url:"http://yabse.com",
surl:"http://yabse.com/index.php?q=",
desc:""},

{id:"aa_ign",
type:"games",
cc:"",
name:"ign",
label:"ign.com",
url:"http://www.ign.com",
surl:"http://search.ign.com/products?query=",
desc:""},

{id:"aa_gamespot",
type:"games",
cc:"",
name:"gamespot",
label:"gamespot.com",
url:"http://www.gamespot.com",
surl:"http://www.gamespot.com/search.html?type=11&stype=all&tag=search%3Bbutton&qs=",
desc:""},

{id:"aa_gamefaqs",
type:"games",
cc:"",
name:"gamefaqs",
label:"gamefaqs.com",
url:"http://www.gamefaqs.com",
surl:"http://www.gamefaqs.com/search/index.html?game=",
desc:""},

{id:"aa_gamerankings",
type:"games",
cc:"",
name:"gamerankings",
label:"gamerankings.com",
url:"http://www.gamerankings.com",
surl:"http://www.gamerankings.com/itemrankings/simpleratings.asp?itemname=",
desc:""},

{id:"aa_thottbot",
type:"wow",
cc:"",
name:"thottbot",
label:"thottbot.com",
url:"http://www.thottbot.com",
surl:"http://www.thottbot.com/?s=",
desc:""},

{id:"aa_allakhazam",
type:"wow",
cc:"",
name:"allakhazam",
label:"allakhazam.com",
url:"http://www.allakhazam.com",
surl:"http://wow.allakhazam.com/search.html?q=",
desc:""},

{id:"aa_wowhead",
type:"wow",
cc:"",
name:"wowhead",
label:"wowhead.com",
url:"http://www.wowhead.com",
surl:"http://www.wowhead.com/?search=",
desc:""},

{id:"aa_goblinworkshop",
type:"wow",
cc:"",
name:"goblinworkshop",
label:"goblinworkshop.com",
url:"http://www.goblinworkshop.com",
surl:"http://www.goblinworkshop.com/search2.html?s=",
desc:""},

{id:"aa_wowguru",
type:"wow",
cc:"",
name:"wowguru",
label:"wowguru.com",
url:"http://www.wowguru.com",
surl:"http://www.wowguru.com/db/search.php?q=",
desc:""},

{id:"aa_warcry",
type:"wow",
cc:"",
name:"warcry",
label:"warcry.com",
url:"http://www.warcry.com",
surl:"http://wow.warcry.com/db/search.php?sh=",
desc:""}

];

MMMSearchObj.init();