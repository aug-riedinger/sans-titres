/*!
 * jQuery JavaScript Library v1.8.3
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: Tue Nov 13 2012 08:20:33 GMT-0500 (Eastern Standard Time)
 */
(function( window, undefined ) {
var
	// A central reference to the root jQuery(document)
	rootjQuery,

	// The deferred used on DOM ready
	readyList,

	// Use the correct document accordingly with window argument (sandbox)
	document = window.document,
	location = window.location,
	navigator = window.navigator,

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$,

	// Save a reference to some core methods
	core_push = Array.prototype.push,
	core_slice = Array.prototype.slice,
	core_indexOf = Array.prototype.indexOf,
	core_toString = Object.prototype.toString,
	core_hasOwn = Object.prototype.hasOwnProperty,
	core_trim = String.prototype.trim,

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {
		// The jQuery object is actually just the init constructor 'enhanced'
		return new jQuery.fn.init( selector, context, rootjQuery );
	},

	// Used for matching numbers
	core_pnum = /[\-+]?(?:\d*\.|)\d+(?:[eE][\-+]?\d+|)/.source,

	// Used for detecting and trimming whitespace
	core_rnotwhite = /\S/,
	core_rspace = /\s+/,

	// Make sure we trim BOM and NBSP (here's looking at you, Safari 5.0 and IE)
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	rquickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,

	// Match a standalone tag
	rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,

	// JSON RegExp
	rvalidchars = /^[\],:{}\s]*$/,
	rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,
	rvalidescape = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
	rvalidtokens = /"[^"\\\r\n]*"|true|false|null|-?(?:\d\d*\.|)\d+(?:[eE][\-+]?\d+|)/g,

	// Matches dashed string for camelizing
	rmsPrefix = /^-ms-/,
	rdashAlpha = /-([\da-z])/gi,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return ( letter + "" ).toUpperCase();
	},

	// The ready event handler and self cleanup method
	DOMContentLoaded = function() {
		if ( document.addEventListener ) {
			document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );
			jQuery.ready();
		} else if ( document.readyState === "complete" ) {
			// we're here because readyState === "complete" in oldIE
			// which is good enough for us to call the dom ready!
			document.detachEvent( "onreadystatechange", DOMContentLoaded );
			jQuery.ready();
		}
	},

	// [[Class]] -> type pairs
	class2type = {};

jQuery.fn = jQuery.prototype = {
	constructor: jQuery,
	init: function( selector, context, rootjQuery ) {
		var match, elem, ret, doc;

		// Handle $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// Handle $(DOMElement)
		if ( selector.nodeType ) {
			this.context = this[0] = selector;
			this.length = 1;
			return this;
		}

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && (match[1] || !context) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[1] ) {
					context = context instanceof jQuery ? context[0] : context;
					doc = ( context && context.nodeType ? context.ownerDocument || context : document );

					// scripts is true for back-compat
					selector = jQuery.parseHTML( match[1], doc, true );
					if ( rsingleTag.test( match[1] ) && jQuery.isPlainObject( context ) ) {
						this.attr.call( selector, context, true );
					}

					return jQuery.merge( this, selector );

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[2] );

					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Handle the case where IE and Opera return items
						// by name instead of ID
						if ( elem.id !== match[2] ) {
							return rootjQuery.find( selector );
						}

						// Otherwise, we inject the element directly into the jQuery object
						this.length = 1;
						this[0] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || rootjQuery ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return rootjQuery.ready( selector );
		}

		if ( selector.selector !== undefined ) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	},

	// Start with an empty selector
	selector: "",

	// The current version of jQuery being used
	jquery: "1.8.3",

	// The default length of a jQuery object is 0
	length: 0,

	// The number of elements contained in the matched element set
	size: function() {
		return this.length;
	},

	toArray: function() {
		return core_slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num == null ?

			// Return a 'clean' array
			this.toArray() :

			// Return just the object
			( num < 0 ? this[ this.length + num ] : this[ num ] );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems, name, selector ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;

		ret.context = this.context;

		if ( name === "find" ) {
			ret.selector = this.selector + ( this.selector ? " " : "" ) + selector;
		} else if ( name ) {
			ret.selector = this.selector + "." + name + "(" + selector + ")";
		}

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	// (You can seed the arguments with an array of args, but this is
	// only used internally.)
	each: function( callback, args ) {
		return jQuery.each( this, callback, args );
	},

	ready: function( fn ) {
		// Add the callback
		jQuery.ready.promise().done( fn );

		return this;
	},

	eq: function( i ) {
		i = +i;
		return i === -1 ?
			this.slice( i ) :
			this.slice( i, i + 1 );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	slice: function() {
		return this.pushStack( core_slice.apply( this, arguments ),
			"slice", core_slice.call(arguments).join(",") );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map(this, function( elem, i ) {
			return callback.call( elem, i, elem );
		}));
	},

	end: function() {
		return this.prevObject || this.constructor(null);
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: core_push,
	sort: [].sort,
	splice: [].splice
};

// Give the init function the jQuery prototype for later instantiation
jQuery.fn.init.prototype = jQuery.fn;

jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	if ( length === i ) {
		target = this;
		--i;
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray(src) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend({
	noConflict: function( deep ) {
		if ( window.$ === jQuery ) {
			window.$ = _$;
		}

		if ( deep && window.jQuery === jQuery ) {
			window.jQuery = _jQuery;
		}

		return jQuery;
	},

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
		if ( !document.body ) {
			return setTimeout( jQuery.ready, 1 );
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );

		// Trigger any bound ready events
		if ( jQuery.fn.trigger ) {
			jQuery( document ).trigger("ready").off("ready");
		}
	},

	// See test/unit/core.js for details concerning isFunction.
	// Since version 1.3, DOM methods and functions like alert
	// aren't supported. They return false on IE (#2968).
	isFunction: function( obj ) {
		return jQuery.type(obj) === "function";
	},

	isArray: Array.isArray || function( obj ) {
		return jQuery.type(obj) === "array";
	},

	isWindow: function( obj ) {
		return obj != null && obj == obj.window;
	},

	isNumeric: function( obj ) {
		return !isNaN( parseFloat(obj) ) && isFinite( obj );
	},

	type: function( obj ) {
		return obj == null ?
			String( obj ) :
			class2type[ core_toString.call(obj) ] || "object";
	},

	isPlainObject: function( obj ) {
		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well
		if ( !obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		try {
			// Not own constructor property must be Object
			if ( obj.constructor &&
				!core_hasOwn.call(obj, "constructor") &&
				!core_hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
				return false;
			}
		} catch ( e ) {
			// IE8,9 Will throw exceptions on certain host objects #9897
			return false;
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.

		var key;
		for ( key in obj ) {}

		return key === undefined || core_hasOwn.call( obj, key );
	},

	isEmptyObject: function( obj ) {
		var name;
		for ( name in obj ) {
			return false;
		}
		return true;
	},

	error: function( msg ) {
		throw new Error( msg );
	},

	// data: string of html
	// context (optional): If specified, the fragment will be created in this context, defaults to document
	// scripts (optional): If true, will include scripts passed in the html string
	parseHTML: function( data, context, scripts ) {
		var parsed;
		if ( !data || typeof data !== "string" ) {
			return null;
		}
		if ( typeof context === "boolean" ) {
			scripts = context;
			context = 0;
		}
		context = context || document;

		// Single tag
		if ( (parsed = rsingleTag.exec( data )) ) {
			return [ context.createElement( parsed[1] ) ];
		}

		parsed = jQuery.buildFragment( [ data ], context, scripts ? null : [] );
		return jQuery.merge( [],
			(parsed.cacheable ? jQuery.clone( parsed.fragment ) : parsed.fragment).childNodes );
	},

	parseJSON: function( data ) {
		if ( !data || typeof data !== "string") {
			return null;
		}

		// Make sure leading/trailing whitespace is removed (IE can't handle it)
		data = jQuery.trim( data );

		// Attempt to parse using the native JSON parser first
		if ( window.JSON && window.JSON.parse ) {
			return window.JSON.parse( data );
		}

		// Make sure the incoming data is actual JSON
		// Logic borrowed from http://json.org/json2.js
		if ( rvalidchars.test( data.replace( rvalidescape, "@" )
			.replace( rvalidtokens, "]" )
			.replace( rvalidbraces, "")) ) {

			return ( new Function( "return " + data ) )();

		}
		jQuery.error( "Invalid JSON: " + data );
	},

	// Cross-browser xml parsing
	parseXML: function( data ) {
		var xml, tmp;
		if ( !data || typeof data !== "string" ) {
			return null;
		}
		try {
			if ( window.DOMParser ) { // Standard
				tmp = new DOMParser();
				xml = tmp.parseFromString( data , "text/xml" );
			} else { // IE
				xml = new ActiveXObject( "Microsoft.XMLDOM" );
				xml.async = "false";
				xml.loadXML( data );
			}
		} catch( e ) {
			xml = undefined;
		}
		if ( !xml || !xml.documentElement || xml.getElementsByTagName( "parsererror" ).length ) {
			jQuery.error( "Invalid XML: " + data );
		}
		return xml;
	},

	noop: function() {},

	// Evaluates a script in a global context
	// Workarounds based on findings by Jim Driscoll
	// http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
	globalEval: function( data ) {
		if ( data && core_rnotwhite.test( data ) ) {
			// We use execScript on Internet Explorer
			// We use an anonymous function so that context is window
			// rather than jQuery in Firefox
			( window.execScript || function( data ) {
				window[ "eval" ].call( window, data );
			} )( data );
		}
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
	},

	// args is for internal usage only
	each: function( obj, callback, args ) {
		var name,
			i = 0,
			length = obj.length,
			isObj = length === undefined || jQuery.isFunction( obj );

		if ( args ) {
			if ( isObj ) {
				for ( name in obj ) {
					if ( callback.apply( obj[ name ], args ) === false ) {
						break;
					}
				}
			} else {
				for ( ; i < length; ) {
					if ( callback.apply( obj[ i++ ], args ) === false ) {
						break;
					}
				}
			}

		// A special, fast, case for the most common use of each
		} else {
			if ( isObj ) {
				for ( name in obj ) {
					if ( callback.call( obj[ name ], name, obj[ name ] ) === false ) {
						break;
					}
				}
			} else {
				for ( ; i < length; ) {
					if ( callback.call( obj[ i ], i, obj[ i++ ] ) === false ) {
						break;
					}
				}
			}
		}

		return obj;
	},

	// Use native String.trim function wherever possible
	trim: core_trim && !core_trim.call("\uFEFF\xA0") ?
		function( text ) {
			return text == null ?
				"" :
				core_trim.call( text );
		} :

		// Otherwise use our own trimming functionality
		function( text ) {
			return text == null ?
				"" :
				( text + "" ).replace( rtrim, "" );
		},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var type,
			ret = results || [];

		if ( arr != null ) {
			// The window, strings (and functions) also have 'length'
			// Tweaked logic slightly to handle Blackberry 4.7 RegExp issues #6930
			type = jQuery.type( arr );

			if ( arr.length == null || type === "string" || type === "function" || type === "regexp" || jQuery.isWindow( arr ) ) {
				core_push.call( ret, arr );
			} else {
				jQuery.merge( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		var len;

		if ( arr ) {
			if ( core_indexOf ) {
				return core_indexOf.call( arr, elem, i );
			}

			len = arr.length;
			i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

			for ( ; i < len; i++ ) {
				// Skip accessing in sparse arrays
				if ( i in arr && arr[ i ] === elem ) {
					return i;
				}
			}
		}

		return -1;
	},

	merge: function( first, second ) {
		var l = second.length,
			i = first.length,
			j = 0;

		if ( typeof l === "number" ) {
			for ( ; j < l; j++ ) {
				first[ i++ ] = second[ j ];
			}

		} else {
			while ( second[j] !== undefined ) {
				first[ i++ ] = second[ j++ ];
			}
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, inv ) {
		var retVal,
			ret = [],
			i = 0,
			length = elems.length;
		inv = !!inv;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			retVal = !!callback( elems[ i ], i );
			if ( inv !== retVal ) {
				ret.push( elems[ i ] );
			}
		}

		return ret;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var value, key,
			ret = [],
			i = 0,
			length = elems.length,
			// jquery objects are treated as arrays
			isArray = elems instanceof jQuery || length !== undefined && typeof length === "number" && ( ( length > 0 && elems[ 0 ] && elems[ length -1 ] ) || length === 0 || jQuery.isArray( elems ) ) ;

		// Go through the array, translating each of the items to their
		if ( isArray ) {
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}

		// Go through every key on the object,
		} else {
			for ( key in elems ) {
				value = callback( elems[ key ], key, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}
		}

		// Flatten any nested arrays
		return ret.concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	proxy: function( fn, context ) {
		var tmp, args, proxy;

		if ( typeof context === "string" ) {
			tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		args = core_slice.call( arguments, 2 );
		proxy = function() {
			return fn.apply( context, args.concat( core_slice.call( arguments ) ) );
		};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || jQuery.guid++;

		return proxy;
	},

	// Multifunctional method to get and set values of a collection
	// The value/s can optionally be executed if it's a function
	access: function( elems, fn, key, value, chainable, emptyGet, pass ) {
		var exec,
			bulk = key == null,
			i = 0,
			length = elems.length;

		// Sets many values
		if ( key && typeof key === "object" ) {
			for ( i in key ) {
				jQuery.access( elems, fn, i, key[i], 1, emptyGet, value );
			}
			chainable = 1;

		// Sets one value
		} else if ( value !== undefined ) {
			// Optionally, function values get executed if exec is true
			exec = pass === undefined && jQuery.isFunction( value );

			if ( bulk ) {
				// Bulk operations only iterate when executing function values
				if ( exec ) {
					exec = fn;
					fn = function( elem, key, value ) {
						return exec.call( jQuery( elem ), value );
					};

				// Otherwise they run against the entire set
				} else {
					fn.call( elems, value );
					fn = null;
				}
			}

			if ( fn ) {
				for (; i < length; i++ ) {
					fn( elems[i], key, exec ? value.call( elems[i], i, fn( elems[i], key ) ) : value, pass );
				}
			}

			chainable = 1;
		}

		return chainable ?
			elems :

			// Gets
			bulk ?
				fn.call( elems ) :
				length ? fn( elems[0], key ) : emptyGet;
	},

	now: function() {
		return ( new Date() ).getTime();
	}
});

jQuery.ready.promise = function( obj ) {
	if ( !readyList ) {

		readyList = jQuery.Deferred();

		// Catch cases where $(document).ready() is called after the browser event has already occurred.
		// we once tried to use readyState "interactive" here, but it caused issues like the one
		// discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
		if ( document.readyState === "complete" ) {
			// Handle it asynchronously to allow scripts the opportunity to delay ready
			setTimeout( jQuery.ready, 1 );

		// Standards-based browsers support DOMContentLoaded
		} else if ( document.addEventListener ) {
			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", jQuery.ready, false );

		// If IE event model is used
		} else {
			// Ensure firing before onload, maybe late but safe also for iframes
			document.attachEvent( "onreadystatechange", DOMContentLoaded );

			// A fallback to window.onload, that will always work
			window.attachEvent( "onload", jQuery.ready );

			// If IE and not a frame
			// continually check to see if the document is ready
			var top = false;

			try {
				top = window.frameElement == null && document.documentElement;
			} catch(e) {}

			if ( top && top.doScroll ) {
				(function doScrollCheck() {
					if ( !jQuery.isReady ) {

						try {
							// Use the trick by Diego Perini
							// http://javascript.nwbox.com/IEContentLoaded/
							top.doScroll("left");
						} catch(e) {
							return setTimeout( doScrollCheck, 50 );
						}

						// and execute any waiting functions
						jQuery.ready();
					}
				})();
			}
		}
	}
	return readyList.promise( obj );
};

// Populate the class2type map
jQuery.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(i, name) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

// All jQuery objects should point back to these
rootjQuery = jQuery(document);
// String to Object options format cache
var optionsCache = {};

// Convert String-formatted options into Object-formatted ones and store in cache
function createOptions( options ) {
	var object = optionsCache[ options ] = {};
	jQuery.each( options.split( core_rspace ), function( _, flag ) {
		object[ flag ] = true;
	});
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		( optionsCache[ options ] || createOptions( options ) ) :
		jQuery.extend( {}, options );

	var // Last fire value (for non-forgettable lists)
		memory,
		// Flag to know if list was already fired
		fired,
		// Flag to know if list is currently firing
		firing,
		// First callback to fire (used internally by add and fireWith)
		firingStart,
		// End of the loop when firing
		firingLength,
		// Index of currently firing callback (modified by remove if needed)
		firingIndex,
		// Actual callback list
		list = [],
		// Stack of fire calls for repeatable lists
		stack = !options.once && [],
		// Fire callbacks
		fire = function( data ) {
			memory = options.memory && data;
			fired = true;
			firingIndex = firingStart || 0;
			firingStart = 0;
			firingLength = list.length;
			firing = true;
			for ( ; list && firingIndex < firingLength; firingIndex++ ) {
				if ( list[ firingIndex ].apply( data[ 0 ], data[ 1 ] ) === false && options.stopOnFalse ) {
					memory = false; // To prevent further calls using add
					break;
				}
			}
			firing = false;
			if ( list ) {
				if ( stack ) {
					if ( stack.length ) {
						fire( stack.shift() );
					}
				} else if ( memory ) {
					list = [];
				} else {
					self.disable();
				}
			}
		},
		// Actual Callbacks object
		self = {
			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {
					// First, we save the current length
					var start = list.length;
					(function add( args ) {
						jQuery.each( args, function( _, arg ) {
							var type = jQuery.type( arg );
							if ( type === "function" ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && type !== "string" ) {
								// Inspect recursively
								add( arg );
							}
						});
					})( arguments );
					// Do we need to add the callbacks to the
					// current firing batch?
					if ( firing ) {
						firingLength = list.length;
					// With memory, if we're not firing then
					// we should call right away
					} else if ( memory ) {
						firingStart = start;
						fire( memory );
					}
				}
				return this;
			},
			// Remove a callback from the list
			remove: function() {
				if ( list ) {
					jQuery.each( arguments, function( _, arg ) {
						var index;
						while( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
							list.splice( index, 1 );
							// Handle firing indexes
							if ( firing ) {
								if ( index <= firingLength ) {
									firingLength--;
								}
								if ( index <= firingIndex ) {
									firingIndex--;
								}
							}
						}
					});
				}
				return this;
			},
			// Control if a given callback is in the list
			has: function( fn ) {
				return jQuery.inArray( fn, list ) > -1;
			},
			// Remove all callbacks from the list
			empty: function() {
				list = [];
				return this;
			},
			// Have the list do nothing anymore
			disable: function() {
				list = stack = memory = undefined;
				return this;
			},
			// Is it disabled?
			disabled: function() {
				return !list;
			},
			// Lock the list in its current state
			lock: function() {
				stack = undefined;
				if ( !memory ) {
					self.disable();
				}
				return this;
			},
			// Is it locked?
			locked: function() {
				return !stack;
			},
			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				args = args || [];
				args = [ context, args.slice ? args.slice() : args ];
				if ( list && ( !fired || stack ) ) {
					if ( firing ) {
						stack.push( args );
					} else {
						fire( args );
					}
				}
				return this;
			},
			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},
			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};
jQuery.extend({

	Deferred: function( func ) {
		var tuples = [
				// action, add listener, listener list, final state
				[ "resolve", "done", jQuery.Callbacks("once memory"), "resolved" ],
				[ "reject", "fail", jQuery.Callbacks("once memory"), "rejected" ],
				[ "notify", "progress", jQuery.Callbacks("memory") ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				then: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;
					return jQuery.Deferred(function( newDefer ) {
						jQuery.each( tuples, function( i, tuple ) {
							var action = tuple[ 0 ],
								fn = fns[ i ];
							// deferred[ done | fail | progress ] for forwarding actions to newDefer
							deferred[ tuple[1] ]( jQuery.isFunction( fn ) ?
								function() {
									var returned = fn.apply( this, arguments );
									if ( returned && jQuery.isFunction( returned.promise ) ) {
										returned.promise()
											.done( newDefer.resolve )
											.fail( newDefer.reject )
											.progress( newDefer.notify );
									} else {
										newDefer[ action + "With" ]( this === deferred ? newDefer : this, [ returned ] );
									}
								} :
								newDefer[ action ]
							);
						});
						fns = null;
					}).promise();
				},
				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Keep pipe for back-compat
		promise.pipe = promise.then;

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 3 ];

			// promise[ done | fail | progress ] = list.add
			promise[ tuple[1] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add(function() {
					// state = [ resolved | rejected ]
					state = stateString;

				// [ reject_list | resolve_list ].disable; progress_list.lock
				}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
			}

			// deferred[ resolve | reject | notify ] = list.fire
			deferred[ tuple[0] ] = list.fire;
			deferred[ tuple[0] + "With" ] = list.fireWith;
		});

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( subordinate /* , ..., subordinateN */ ) {
		var i = 0,
			resolveValues = core_slice.call( arguments ),
			length = resolveValues.length,

			// the count of uncompleted subordinates
			remaining = length !== 1 || ( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

			// the master Deferred. If resolveValues consist of only a single Deferred, just use that.
			deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

			// Update function for both resolve and progress values
			updateFunc = function( i, contexts, values ) {
				return function( value ) {
					contexts[ i ] = this;
					values[ i ] = arguments.length > 1 ? core_slice.call( arguments ) : value;
					if( values === progressValues ) {
						deferred.notifyWith( contexts, values );
					} else if ( !( --remaining ) ) {
						deferred.resolveWith( contexts, values );
					}
				};
			},

			progressValues, progressContexts, resolveContexts;

		// add listeners to Deferred subordinates; treat others as resolved
		if ( length > 1 ) {
			progressValues = new Array( length );
			progressContexts = new Array( length );
			resolveContexts = new Array( length );
			for ( ; i < length; i++ ) {
				if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
					resolveValues[ i ].promise()
						.done( updateFunc( i, resolveContexts, resolveValues ) )
						.fail( deferred.reject )
						.progress( updateFunc( i, progressContexts, progressValues ) );
				} else {
					--remaining;
				}
			}
		}

		// if we're not waiting on anything, resolve the master
		if ( !remaining ) {
			deferred.resolveWith( resolveContexts, resolveValues );
		}

		return deferred.promise();
	}
});
jQuery.support = (function() {

	var support,
		all,
		a,
		select,
		opt,
		input,
		fragment,
		eventName,
		i,
		isSupported,
		clickFn,
		div = document.createElement("div");

	// Setup
	div.setAttribute( "className", "t" );
	div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";

	// Support tests won't run in some limited or non-browser environments
	all = div.getElementsByTagName("*");
	a = div.getElementsByTagName("a")[ 0 ];
	if ( !all || !a || !all.length ) {
		return {};
	}

	// First batch of tests
	select = document.createElement("select");
	opt = select.appendChild( document.createElement("option") );
	input = div.getElementsByTagName("input")[ 0 ];

	a.style.cssText = "top:1px;float:left;opacity:.5";
	support = {
		// IE strips leading whitespace when .innerHTML is used
		leadingWhitespace: ( div.firstChild.nodeType === 3 ),

		// Make sure that tbody elements aren't automatically inserted
		// IE will insert them into empty tables
		tbody: !div.getElementsByTagName("tbody").length,

		// Make sure that link elements get serialized correctly by innerHTML
		// This requires a wrapper element in IE
		htmlSerialize: !!div.getElementsByTagName("link").length,

		// Get the style information from getAttribute
		// (IE uses .cssText instead)
		style: /top/.test( a.getAttribute("style") ),

		// Make sure that URLs aren't manipulated
		// (IE normalizes it by default)
		hrefNormalized: ( a.getAttribute("href") === "/a" ),

		// Make sure that element opacity exists
		// (IE uses filter instead)
		// Use a regex to work around a WebKit issue. See #5145
		opacity: /^0.5/.test( a.style.opacity ),

		// Verify style float existence
		// (IE uses styleFloat instead of cssFloat)
		cssFloat: !!a.style.cssFloat,

		// Make sure that if no value is specified for a checkbox
		// that it defaults to "on".
		// (WebKit defaults to "" instead)
		checkOn: ( input.value === "on" ),

		// Make sure that a selected-by-default option has a working selected property.
		// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
		optSelected: opt.selected,

		// Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)
		getSetAttribute: div.className !== "t",

		// Tests for enctype support on a form (#6743)
		enctype: !!document.createElement("form").enctype,

		// Makes sure cloning an html5 element does not cause problems
		// Where outerHTML is undefined, this still works
		html5Clone: document.createElement("nav").cloneNode( true ).outerHTML !== "<:nav></:nav>",

		// jQuery.support.boxModel DEPRECATED in 1.8 since we don't support Quirks Mode
		boxModel: ( document.compatMode === "CSS1Compat" ),

		// Will be defined later
		submitBubbles: true,
		changeBubbles: true,
		focusinBubbles: false,
		deleteExpando: true,
		noCloneEvent: true,
		inlineBlockNeedsLayout: false,
		shrinkWrapBlocks: false,
		reliableMarginRight: true,
		boxSizingReliable: true,
		pixelPosition: false
	};

	// Make sure checked status is properly cloned
	input.checked = true;
	support.noCloneChecked = input.cloneNode( true ).checked;

	// Make sure that the options inside disabled selects aren't marked as disabled
	// (WebKit marks them as disabled)
	select.disabled = true;
	support.optDisabled = !opt.disabled;

	// Test to see if it's possible to delete an expando from an element
	// Fails in Internet Explorer
	try {
		delete div.test;
	} catch( e ) {
		support.deleteExpando = false;
	}

	if ( !div.addEventListener && div.attachEvent && div.fireEvent ) {
		div.attachEvent( "onclick", clickFn = function() {
			// Cloning a node shouldn't copy over any
			// bound event handlers (IE does this)
			support.noCloneEvent = false;
		});
		div.cloneNode( true ).fireEvent("onclick");
		div.detachEvent( "onclick", clickFn );
	}

	// Check if a radio maintains its value
	// after being appended to the DOM
	input = document.createElement("input");
	input.value = "t";
	input.setAttribute( "type", "radio" );
	support.radioValue = input.value === "t";

	input.setAttribute( "checked", "checked" );

	// #11217 - WebKit loses check when the name is after the checked attribute
	input.setAttribute( "name", "t" );

	div.appendChild( input );
	fragment = document.createDocumentFragment();
	fragment.appendChild( div.lastChild );

	// WebKit doesn't clone checked state correctly in fragments
	support.checkClone = fragment.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Check if a disconnected checkbox will retain its checked
	// value of true after appended to the DOM (IE6/7)
	support.appendChecked = input.checked;

	fragment.removeChild( input );
	fragment.appendChild( div );

	// Technique from Juriy Zaytsev
	// http://perfectionkills.com/detecting-event-support-without-browser-sniffing/
	// We only care about the case where non-standard event systems
	// are used, namely in IE. Short-circuiting here helps us to
	// avoid an eval call (in setAttribute) which can cause CSP
	// to go haywire. See: https://developer.mozilla.org/en/Security/CSP
	if ( div.attachEvent ) {
		for ( i in {
			submit: true,
			change: true,
			focusin: true
		}) {
			eventName = "on" + i;
			isSupported = ( eventName in div );
			if ( !isSupported ) {
				div.setAttribute( eventName, "return;" );
				isSupported = ( typeof div[ eventName ] === "function" );
			}
			support[ i + "Bubbles" ] = isSupported;
		}
	}

	// Run tests that need a body at doc ready
	jQuery(function() {
		var container, div, tds, marginDiv,
			divReset = "padding:0;margin:0;border:0;display:block;overflow:hidden;",
			body = document.getElementsByTagName("body")[0];

		if ( !body ) {
			// Return for frameset docs that don't have a body
			return;
		}

		container = document.createElement("div");
		container.style.cssText = "visibility:hidden;border:0;width:0;height:0;position:static;top:0;margin-top:1px";
		body.insertBefore( container, body.firstChild );

		// Construct the test element
		div = document.createElement("div");
		container.appendChild( div );

		// Check if table cells still have offsetWidth/Height when they are set
		// to display:none and there are still other visible table cells in a
		// table row; if so, offsetWidth/Height are not reliable for use when
		// determining if an element has been hidden directly using
		// display:none (it is still safe to use offsets if a parent element is
		// hidden; don safety goggles and see bug #4512 for more information).
		// (only IE 8 fails this test)
		div.innerHTML = "<table><tr><td></td><td>t</td></tr></table>";
		tds = div.getElementsByTagName("td");
		tds[ 0 ].style.cssText = "padding:0;margin:0;border:0;display:none";
		isSupported = ( tds[ 0 ].offsetHeight === 0 );

		tds[ 0 ].style.display = "";
		tds[ 1 ].style.display = "none";

		// Check if empty table cells still have offsetWidth/Height
		// (IE <= 8 fail this test)
		support.reliableHiddenOffsets = isSupported && ( tds[ 0 ].offsetHeight === 0 );

		// Check box-sizing and margin behavior
		div.innerHTML = "";
		div.style.cssText = "box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;";
		support.boxSizing = ( div.offsetWidth === 4 );
		support.doesNotIncludeMarginInBodyOffset = ( body.offsetTop !== 1 );

		// NOTE: To any future maintainer, we've window.getComputedStyle
		// because jsdom on node.js will break without it.
		if ( window.getComputedStyle ) {
			support.pixelPosition = ( window.getComputedStyle( div, null ) || {} ).top !== "1%";
			support.boxSizingReliable = ( window.getComputedStyle( div, null ) || { width: "4px" } ).width === "4px";

			// Check if div with explicit width and no margin-right incorrectly
			// gets computed margin-right based on width of container. For more
			// info see bug #3333
			// Fails in WebKit before Feb 2011 nightlies
			// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
			marginDiv = document.createElement("div");
			marginDiv.style.cssText = div.style.cssText = divReset;
			marginDiv.style.marginRight = marginDiv.style.width = "0";
			div.style.width = "1px";
			div.appendChild( marginDiv );
			support.reliableMarginRight =
				!parseFloat( ( window.getComputedStyle( marginDiv, null ) || {} ).marginRight );
		}

		if ( typeof div.style.zoom !== "undefined" ) {
			// Check if natively block-level elements act like inline-block
			// elements when setting their display to 'inline' and giving
			// them layout
			// (IE < 8 does this)
			div.innerHTML = "";
			div.style.cssText = divReset + "width:1px;padding:1px;display:inline;zoom:1";
			support.inlineBlockNeedsLayout = ( div.offsetWidth === 3 );

			// Check if elements with layout shrink-wrap their children
			// (IE 6 does this)
			div.style.display = "block";
			div.style.overflow = "visible";
			div.innerHTML = "<div></div>";
			div.firstChild.style.width = "5px";
			support.shrinkWrapBlocks = ( div.offsetWidth !== 3 );

			container.style.zoom = 1;
		}

		// Null elements to avoid leaks in IE
		body.removeChild( container );
		container = div = tds = marginDiv = null;
	});

	// Null elements to avoid leaks in IE
	fragment.removeChild( div );
	all = a = select = opt = input = fragment = div = null;

	return support;
})();
var rbrace = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/,
	rmultiDash = /([A-Z])/g;

jQuery.extend({
	cache: {},

	deletedIds: [],

	// Remove at next major release (1.9/2.0)
	uuid: 0,

	// Unique for each copy of jQuery on the page
	// Non-digits removed to match rinlinejQuery
	expando: "jQuery" + ( jQuery.fn.jquery + Math.random() ).replace( /\D/g, "" ),

	// The following elements throw uncatchable exceptions if you
	// attempt to add expando properties to them.
	noData: {
		"embed": true,
		// Ban all objects except for Flash (which handle expandos)
		"object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
		"applet": true
	},

	hasData: function( elem ) {
		elem = elem.nodeType ? jQuery.cache[ elem[jQuery.expando] ] : elem[ jQuery.expando ];
		return !!elem && !isEmptyDataObject( elem );
	},

	data: function( elem, name, data, pvt /* Internal Use Only */ ) {
		if ( !jQuery.acceptData( elem ) ) {
			return;
		}

		var thisCache, ret,
			internalKey = jQuery.expando,
			getByName = typeof name === "string",

			// We have to handle DOM nodes and JS objects differently because IE6-7
			// can't GC object references properly across the DOM-JS boundary
			isNode = elem.nodeType,

			// Only DOM nodes need the global jQuery cache; JS object data is
			// attached directly to the object so GC can occur automatically
			cache = isNode ? jQuery.cache : elem,

			// Only defining an ID for JS objects if its cache already exists allows
			// the code to shortcut on the same path as a DOM node with no cache
			id = isNode ? elem[ internalKey ] : elem[ internalKey ] && internalKey;

		// Avoid doing any more work than we need to when trying to get data on an
		// object that has no data at all
		if ( (!id || !cache[id] || (!pvt && !cache[id].data)) && getByName && data === undefined ) {
			return;
		}

		if ( !id ) {
			// Only DOM nodes need a new unique ID for each element since their data
			// ends up in the global cache
			if ( isNode ) {
				elem[ internalKey ] = id = jQuery.deletedIds.pop() || jQuery.guid++;
			} else {
				id = internalKey;
			}
		}

		if ( !cache[ id ] ) {
			cache[ id ] = {};

			// Avoids exposing jQuery metadata on plain JS objects when the object
			// is serialized using JSON.stringify
			if ( !isNode ) {
				cache[ id ].toJSON = jQuery.noop;
			}
		}

		// An object can be passed to jQuery.data instead of a key/value pair; this gets
		// shallow copied over onto the existing cache
		if ( typeof name === "object" || typeof name === "function" ) {
			if ( pvt ) {
				cache[ id ] = jQuery.extend( cache[ id ], name );
			} else {
				cache[ id ].data = jQuery.extend( cache[ id ].data, name );
			}
		}

		thisCache = cache[ id ];

		// jQuery data() is stored in a separate object inside the object's internal data
		// cache in order to avoid key collisions between internal data and user-defined
		// data.
		if ( !pvt ) {
			if ( !thisCache.data ) {
				thisCache.data = {};
			}

			thisCache = thisCache.data;
		}

		if ( data !== undefined ) {
			thisCache[ jQuery.camelCase( name ) ] = data;
		}

		// Check for both converted-to-camel and non-converted data property names
		// If a data property was specified
		if ( getByName ) {

			// First Try to find as-is property data
			ret = thisCache[ name ];

			// Test for null|undefined property data
			if ( ret == null ) {

				// Try to find the camelCased property
				ret = thisCache[ jQuery.camelCase( name ) ];
			}
		} else {
			ret = thisCache;
		}

		return ret;
	},

	removeData: function( elem, name, pvt /* Internal Use Only */ ) {
		if ( !jQuery.acceptData( elem ) ) {
			return;
		}

		var thisCache, i, l,

			isNode = elem.nodeType,

			// See jQuery.data for more information
			cache = isNode ? jQuery.cache : elem,
			id = isNode ? elem[ jQuery.expando ] : jQuery.expando;

		// If there is already no cache entry for this object, there is no
		// purpose in continuing
		if ( !cache[ id ] ) {
			return;
		}

		if ( name ) {

			thisCache = pvt ? cache[ id ] : cache[ id ].data;

			if ( thisCache ) {

				// Support array or space separated string names for data keys
				if ( !jQuery.isArray( name ) ) {

					// try the string as a key before any manipulation
					if ( name in thisCache ) {
						name = [ name ];
					} else {

						// split the camel cased version by spaces unless a key with the spaces exists
						name = jQuery.camelCase( name );
						if ( name in thisCache ) {
							name = [ name ];
						} else {
							name = name.split(" ");
						}
					}
				}

				for ( i = 0, l = name.length; i < l; i++ ) {
					delete thisCache[ name[i] ];
				}

				// If there is no data left in the cache, we want to continue
				// and let the cache object itself get destroyed
				if ( !( pvt ? isEmptyDataObject : jQuery.isEmptyObject )( thisCache ) ) {
					return;
				}
			}
		}

		// See jQuery.data for more information
		if ( !pvt ) {
			delete cache[ id ].data;

			// Don't destroy the parent cache unless the internal data object
			// had been the only thing left in it
			if ( !isEmptyDataObject( cache[ id ] ) ) {
				return;
			}
		}

		// Destroy the cache
		if ( isNode ) {
			jQuery.cleanData( [ elem ], true );

		// Use delete when supported for expandos or `cache` is not a window per isWindow (#10080)
		} else if ( jQuery.support.deleteExpando || cache != cache.window ) {
			delete cache[ id ];

		// When all else fails, null
		} else {
			cache[ id ] = null;
		}
	},

	// For internal use only.
	_data: function( elem, name, data ) {
		return jQuery.data( elem, name, data, true );
	},

	// A method for determining if a DOM node can handle the data expando
	acceptData: function( elem ) {
		var noData = elem.nodeName && jQuery.noData[ elem.nodeName.toLowerCase() ];

		// nodes accept data unless otherwise specified; rejection can be conditional
		return !noData || noData !== true && elem.getAttribute("classid") === noData;
	}
});

jQuery.fn.extend({
	data: function( key, value ) {
		var parts, part, attr, name, l,
			elem = this[0],
			i = 0,
			data = null;

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = jQuery.data( elem );

				if ( elem.nodeType === 1 && !jQuery._data( elem, "parsedAttrs" ) ) {
					attr = elem.attributes;
					for ( l = attr.length; i < l; i++ ) {
						name = attr[i].name;

						if ( !name.indexOf( "data-" ) ) {
							name = jQuery.camelCase( name.substring(5) );

							dataAttr( elem, name, data[ name ] );
						}
					}
					jQuery._data( elem, "parsedAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each(function() {
				jQuery.data( this, key );
			});
		}

		parts = key.split( ".", 2 );
		parts[1] = parts[1] ? "." + parts[1] : "";
		part = parts[1] + "!";

		return jQuery.access( this, function( value ) {

			if ( value === undefined ) {
				data = this.triggerHandler( "getData" + part, [ parts[0] ] );

				// Try to fetch any internally stored data first
				if ( data === undefined && elem ) {
					data = jQuery.data( elem, key );
					data = dataAttr( elem, key, data );
				}

				return data === undefined && parts[1] ?
					this.data( parts[0] ) :
					data;
			}

			parts[1] = value;
			this.each(function() {
				var self = jQuery( this );

				self.triggerHandler( "setData" + part, parts );
				jQuery.data( this, key, value );
				self.triggerHandler( "changeData" + part, parts );
			});
		}, null, value, arguments.length > 1, null, false );
	},

	removeData: function( key ) {
		return this.each(function() {
			jQuery.removeData( this, key );
		});
	}
});

function dataAttr( elem, key, data ) {
	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {

		var name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();

		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = data === "true" ? true :
				data === "false" ? false :
				data === "null" ? null :
				// Only convert to a number if it doesn't change the string
				+data + "" === data ? +data :
				rbrace.test( data ) ? jQuery.parseJSON( data ) :
					data;
			} catch( e ) {}

			// Make sure we set the data so it isn't changed later
			jQuery.data( elem, key, data );

		} else {
			data = undefined;
		}
	}

	return data;
}

// checks a cache object for emptiness
function isEmptyDataObject( obj ) {
	var name;
	for ( name in obj ) {

		// if the public data object is empty, the private is still empty
		if ( name === "data" && jQuery.isEmptyObject( obj[name] ) ) {
			continue;
		}
		if ( name !== "toJSON" ) {
			return false;
		}
	}

	return true;
}
jQuery.extend({
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = jQuery._data( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || jQuery.isArray(data) ) {
					queue = jQuery._data( elem, type, jQuery.makeArray(data) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// not intended for public consumption - generates a queueHooks object, or returns the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return jQuery._data( elem, key ) || jQuery._data( elem, key, {
			empty: jQuery.Callbacks("once memory").add(function() {
				jQuery.removeData( elem, type + "queue", true );
				jQuery.removeData( elem, key, true );
			})
		});
	}
});

jQuery.fn.extend({
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[0], type );
		}

		return data === undefined ?
			this :
			this.each(function() {
				var queue = jQuery.queue( this, type, data );

				// ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[0] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			});
	},
	dequeue: function( type ) {
		return this.each(function() {
			jQuery.dequeue( this, type );
		});
	},
	// Based off of the plugin by Clint Helfers, with permission.
	// http://blindsignals.com/index.php/2009/07/jquery-delay/
	delay: function( time, type ) {
		time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
		type = type || "fx";

		return this.queue( type, function( next, hooks ) {
			var timeout = setTimeout( next, time );
			hooks.stop = function() {
				clearTimeout( timeout );
			};
		});
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},
	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while( i-- ) {
			tmp = jQuery._data( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
});
var nodeHook, boolHook, fixSpecified,
	rclass = /[\t\r\n]/g,
	rreturn = /\r/g,
	rtype = /^(?:button|input)$/i,
	rfocusable = /^(?:button|input|object|select|textarea)$/i,
	rclickable = /^a(?:rea|)$/i,
	rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,
	getSetAttribute = jQuery.support.getSetAttribute;

jQuery.fn.extend({
	attr: function( name, value ) {
		return jQuery.access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each(function() {
			jQuery.removeAttr( this, name );
		});
	},

	prop: function( name, value ) {
		return jQuery.access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		name = jQuery.propFix[ name ] || name;
		return this.each(function() {
			// try/catch handles cases where IE balks (such as removing a property on window)
			try {
				this[ name ] = undefined;
				delete this[ name ];
			} catch( e ) {}
		});
	},

	addClass: function( value ) {
		var classNames, i, l, elem,
			setClass, c, cl;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).addClass( value.call(this, j, this.className) );
			});
		}

		if ( value && typeof value === "string" ) {
			classNames = value.split( core_rspace );

			for ( i = 0, l = this.length; i < l; i++ ) {
				elem = this[ i ];

				if ( elem.nodeType === 1 ) {
					if ( !elem.className && classNames.length === 1 ) {
						elem.className = value;

					} else {
						setClass = " " + elem.className + " ";

						for ( c = 0, cl = classNames.length; c < cl; c++ ) {
							if ( setClass.indexOf( " " + classNames[ c ] + " " ) < 0 ) {
								setClass += classNames[ c ] + " ";
							}
						}
						elem.className = jQuery.trim( setClass );
					}
				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var removes, className, elem, c, cl, i, l;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).removeClass( value.call(this, j, this.className) );
			});
		}
		if ( (value && typeof value === "string") || value === undefined ) {
			removes = ( value || "" ).split( core_rspace );

			for ( i = 0, l = this.length; i < l; i++ ) {
				elem = this[ i ];
				if ( elem.nodeType === 1 && elem.className ) {

					className = (" " + elem.className + " ").replace( rclass, " " );

					// loop over each item in the removal list
					for ( c = 0, cl = removes.length; c < cl; c++ ) {
						// Remove until there is nothing to remove,
						while ( className.indexOf(" " + removes[ c ] + " ") >= 0 ) {
							className = className.replace( " " + removes[ c ] + " " , " " );
						}
					}
					elem.className = value ? jQuery.trim( className ) : "";
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value,
			isBool = typeof stateVal === "boolean";

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( i ) {
				jQuery( this ).toggleClass( value.call(this, i, this.className, stateVal), stateVal );
			});
		}

		return this.each(function() {
			if ( type === "string" ) {
				// toggle individual class names
				var className,
					i = 0,
					self = jQuery( this ),
					state = stateVal,
					classNames = value.split( core_rspace );

				while ( (className = classNames[ i++ ]) ) {
					// check each className given, space separated list
					state = isBool ? state : !self.hasClass( className );
					self[ state ? "addClass" : "removeClass" ]( className );
				}

			} else if ( type === "undefined" || type === "boolean" ) {
				if ( this.className ) {
					// store className if set
					jQuery._data( this, "__className__", this.className );
				}

				// toggle whole className
				this.className = this.className || value === false ? "" : jQuery._data( this, "__className__" ) || "";
			}
		});
	},

	hasClass: function( selector ) {
		var className = " " + selector + " ",
			i = 0,
			l = this.length;
		for ( ; i < l; i++ ) {
			if ( this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) >= 0 ) {
				return true;
			}
		}

		return false;
	},

	val: function( value ) {
		var hooks, ret, isFunction,
			elem = this[0];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] || jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
					return ret;
				}

				ret = elem.value;

				return typeof ret === "string" ?
					// handle most common string cases
					ret.replace(rreturn, "") :
					// handle cases where value is null/undef or number
					ret == null ? "" : ret;
			}

			return;
		}

		isFunction = jQuery.isFunction( value );

		return this.each(function( i ) {
			var val,
				self = jQuery(this);

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call( this, i, self.val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";
			} else if ( typeof val === "number" ) {
				val += "";
			} else if ( jQuery.isArray( val ) ) {
				val = jQuery.map(val, function ( value ) {
					return value == null ? "" : value + "";
				});
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !("set" in hooks) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		});
	}
});

jQuery.extend({
	valHooks: {
		option: {
			get: function( elem ) {
				// attributes.value is undefined in Blackberry 4.7 but
				// uses .value. See #6932
				var val = elem.attributes.value;
				return !val || val.specified ? elem.value : elem.text;
			}
		},
		select: {
			get: function( elem ) {
				var value, option,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === "select-one" || index < 0,
					values = one ? null : [],
					max = one ? index + 1 : options.length,
					i = index < 0 ?
						max :
						one ? index : 0;

				// Loop through all the selected options
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// oldIE doesn't update selected after form reset (#2551)
					if ( ( option.selected || i === index ) &&
							// Don't return options that are disabled or in a disabled optgroup
							( jQuery.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null ) &&
							( !option.parentNode.disabled || !jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				return values;
			},

			set: function( elem, value ) {
				var values = jQuery.makeArray( value );

				jQuery(elem).find("option").each(function() {
					this.selected = jQuery.inArray( jQuery(this).val(), values ) >= 0;
				});

				if ( !values.length ) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	},

	// Unused in 1.8, left in so attrFn-stabbers won't die; remove in 1.9
	attrFn: {},

	attr: function( elem, name, value, pass ) {
		var ret, hooks, notxml,
			nType = elem.nodeType;

		// don't get/set attributes on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		if ( pass && jQuery.isFunction( jQuery.fn[ name ] ) ) {
			return jQuery( elem )[ name ]( value );
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === "undefined" ) {
			return jQuery.prop( elem, name, value );
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		// All attributes are lowercase
		// Grab necessary hook if one is defined
		if ( notxml ) {
			name = name.toLowerCase();
			hooks = jQuery.attrHooks[ name ] || ( rboolean.test( name ) ? boolHook : nodeHook );
		}

		if ( value !== undefined ) {

			if ( value === null ) {
				jQuery.removeAttr( elem, name );
				return;

			} else if ( hooks && "set" in hooks && notxml && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				elem.setAttribute( name, value + "" );
				return value;
			}

		} else if ( hooks && "get" in hooks && notxml && (ret = hooks.get( elem, name )) !== null ) {
			return ret;

		} else {

			ret = elem.getAttribute( name );

			// Non-existent attributes return null, we normalize to undefined
			return ret === null ?
				undefined :
				ret;
		}
	},

	removeAttr: function( elem, value ) {
		var propName, attrNames, name, isBool,
			i = 0;

		if ( value && elem.nodeType === 1 ) {

			attrNames = value.split( core_rspace );

			for ( ; i < attrNames.length; i++ ) {
				name = attrNames[ i ];

				if ( name ) {
					propName = jQuery.propFix[ name ] || name;
					isBool = rboolean.test( name );

					// See #9699 for explanation of this approach (setting first, then removal)
					// Do not do this for boolean attributes (see #10870)
					if ( !isBool ) {
						jQuery.attr( elem, name, "" );
					}
					elem.removeAttribute( getSetAttribute ? name : propName );

					// Set corresponding property to false for boolean attributes
					if ( isBool && propName in elem ) {
						elem[ propName ] = false;
					}
				}
			}
		}
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				// We can't allow the type property to be changed (since it causes problems in IE)
				if ( rtype.test( elem.nodeName ) && elem.parentNode ) {
					jQuery.error( "type property can't be changed" );
				} else if ( !jQuery.support.radioValue && value === "radio" && jQuery.nodeName(elem, "input") ) {
					// Setting the type on a radio button after the value resets the value in IE6-9
					// Reset value to it's default in case type is set after value
					// This is for element creation
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		},
		// Use the value property for back compat
		// Use the nodeHook for button elements in IE6/7 (#1954)
		value: {
			get: function( elem, name ) {
				if ( nodeHook && jQuery.nodeName( elem, "button" ) ) {
					return nodeHook.get( elem, name );
				}
				return name in elem ?
					elem.value :
					null;
			},
			set: function( elem, value, name ) {
				if ( nodeHook && jQuery.nodeName( elem, "button" ) ) {
					return nodeHook.set( elem, value, name );
				}
				// Does not return so that setAttribute is also used
				elem.value = value;
			}
		}
	},

	propFix: {
		tabindex: "tabIndex",
		readonly: "readOnly",
		"for": "htmlFor",
		"class": "className",
		maxlength: "maxLength",
		cellspacing: "cellSpacing",
		cellpadding: "cellPadding",
		rowspan: "rowSpan",
		colspan: "colSpan",
		usemap: "useMap",
		frameborder: "frameBorder",
		contenteditable: "contentEditable"
	},

	prop: function( elem, name, value ) {
		var ret, hooks, notxml,
			nType = elem.nodeType;

		// don't get/set properties on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		if ( notxml ) {
			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			if ( hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				return ( elem[ name ] = value );
			}

		} else {
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
				return ret;

			} else {
				return elem[ name ];
			}
		}
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {
				// elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
				// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
				var attributeNode = elem.getAttributeNode("tabindex");

				return attributeNode && attributeNode.specified ?
					parseInt( attributeNode.value, 10 ) :
					rfocusable.test( elem.nodeName ) || rclickable.test( elem.nodeName ) && elem.href ?
						0 :
						undefined;
			}
		}
	}
});

// Hook for boolean attributes
boolHook = {
	get: function( elem, name ) {
		// Align boolean attributes with corresponding properties
		// Fall back to attribute presence where some booleans are not supported
		var attrNode,
			property = jQuery.prop( elem, name );
		return property === true || typeof property !== "boolean" && ( attrNode = elem.getAttributeNode(name) ) && attrNode.nodeValue !== false ?
			name.toLowerCase() :
			undefined;
	},
	set: function( elem, value, name ) {
		var propName;
		if ( value === false ) {
			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else {
			// value is true since we know at this point it's type boolean and not false
			// Set boolean attributes to the same name and set the DOM property
			propName = jQuery.propFix[ name ] || name;
			if ( propName in elem ) {
				// Only set the IDL specifically if it already exists on the element
				elem[ propName ] = true;
			}

			elem.setAttribute( name, name.toLowerCase() );
		}
		return name;
	}
};

// IE6/7 do not support getting/setting some attributes with get/setAttribute
if ( !getSetAttribute ) {

	fixSpecified = {
		name: true,
		id: true,
		coords: true
	};

	// Use this for any attribute in IE6/7
	// This fixes almost every IE6/7 issue
	nodeHook = jQuery.valHooks.button = {
		get: function( elem, name ) {
			var ret;
			ret = elem.getAttributeNode( name );
			return ret && ( fixSpecified[ name ] ? ret.value !== "" : ret.specified ) ?
				ret.value :
				undefined;
		},
		set: function( elem, value, name ) {
			// Set the existing or create a new attribute node
			var ret = elem.getAttributeNode( name );
			if ( !ret ) {
				ret = document.createAttribute( name );
				elem.setAttributeNode( ret );
			}
			return ( ret.value = value + "" );
		}
	};

	// Set width and height to auto instead of 0 on empty string( Bug #8150 )
	// This is for removals
	jQuery.each([ "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
			set: function( elem, value ) {
				if ( value === "" ) {
					elem.setAttribute( name, "auto" );
					return value;
				}
			}
		});
	});

	// Set contenteditable to false on removals(#10429)
	// Setting to empty string throws an error as an invalid value
	jQuery.attrHooks.contenteditable = {
		get: nodeHook.get,
		set: function( elem, value, name ) {
			if ( value === "" ) {
				value = "false";
			}
			nodeHook.set( elem, value, name );
		}
	};
}


// Some attributes require a special call on IE
if ( !jQuery.support.hrefNormalized ) {
	jQuery.each([ "href", "src", "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
			get: function( elem ) {
				var ret = elem.getAttribute( name, 2 );
				return ret === null ? undefined : ret;
			}
		});
	});
}

if ( !jQuery.support.style ) {
	jQuery.attrHooks.style = {
		get: function( elem ) {
			// Return undefined in the case of empty string
			// Normalize to lowercase since IE uppercases css property names
			return elem.style.cssText.toLowerCase() || undefined;
		},
		set: function( elem, value ) {
			return ( elem.style.cssText = value + "" );
		}
	};
}

// Safari mis-reports the default selected property of an option
// Accessing the parent's selectedIndex property fixes it
if ( !jQuery.support.optSelected ) {
	jQuery.propHooks.selected = jQuery.extend( jQuery.propHooks.selected, {
		get: function( elem ) {
			var parent = elem.parentNode;

			if ( parent ) {
				parent.selectedIndex;

				// Make sure that it also works with optgroups, see #5701
				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
			return null;
		}
	});
}

// IE6/7 call enctype encoding
if ( !jQuery.support.enctype ) {
	jQuery.propFix.enctype = "encoding";
}

// Radios and checkboxes getter/setter
if ( !jQuery.support.checkOn ) {
	jQuery.each([ "radio", "checkbox" ], function() {
		jQuery.valHooks[ this ] = {
			get: function( elem ) {
				// Handle the case where in Webkit "" is returned instead of "on" if a value isn't specified
				return elem.getAttribute("value") === null ? "on" : elem.value;
			}
		};
	});
}
jQuery.each([ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = jQuery.extend( jQuery.valHooks[ this ], {
		set: function( elem, value ) {
			if ( jQuery.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0 );
			}
		}
	});
});
var rformElems = /^(?:textarea|input|select)$/i,
	rtypenamespace = /^([^\.]*|)(?:\.(.+)|)$/,
	rhoverHack = /(?:^|\s)hover(\.\S+|)\b/,
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|contextmenu)|click/,
	rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	hoverHack = function( events ) {
		return jQuery.event.special.hover ? events : events.replace( rhoverHack, "mouseenter$1 mouseleave$1" );
	};

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	add: function( elem, types, handler, data, selector ) {

		var elemData, eventHandle, events,
			t, tns, type, namespaces, handleObj,
			handleObjIn, handlers, special;

		// Don't attach events to noData or text/comment nodes (allow plain objects tho)
		if ( elem.nodeType === 3 || elem.nodeType === 8 || !types || !handler || !(elemData = jQuery._data( elem )) ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		events = elemData.events;
		if ( !events ) {
			elemData.events = events = {};
		}
		eventHandle = elemData.handle;
		if ( !eventHandle ) {
			elemData.handle = eventHandle = function( e ) {
				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== "undefined" && (!e || jQuery.event.triggered !== e.type) ?
					jQuery.event.dispatch.apply( eventHandle.elem, arguments ) :
					undefined;
			};
			// Add elem as a property of the handle fn to prevent a memory leak with IE non-native events
			eventHandle.elem = elem;
		}

		// Handle multiple events separated by a space
		// jQuery(...).bind("mouseover mouseout", fn);
		types = jQuery.trim( hoverHack(types) ).split( " " );
		for ( t = 0; t < types.length; t++ ) {

			tns = rtypenamespace.exec( types[t] ) || [];
			type = tns[1];
			namespaces = ( tns[2] || "" ).split( "." ).sort();

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend({
				type: type,
				origType: tns[1],
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join(".")
			}, handleObjIn );

			// Init the event handler queue if we're the first
			handlers = events[ type ];
			if ( !handlers ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener/attachEvent if the special events handler returns false
				if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
					// Bind the global event handler to the element
					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle, false );

					} else if ( elem.attachEvent ) {
						elem.attachEvent( "on" + type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

		// Nullify elem to prevent memory leaks in IE
		elem = null;
	},

	global: {},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {

		var t, tns, type, origType, namespaces, origCount,
			j, events, special, eventType, handleObj,
			elemData = jQuery.hasData( elem ) && jQuery._data( elem );

		if ( !elemData || !(events = elemData.events) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = jQuery.trim( hoverHack( types || "" ) ).split(" ");
		for ( t = 0; t < types.length; t++ ) {
			tns = rtypenamespace.exec( types[t] ) || [];
			type = origType = tns[1];
			namespaces = tns[2];

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector? special.delegateType : special.bindType ) || type;
			eventType = events[ type ] || [];
			origCount = eventType.length;
			namespaces = namespaces ? new RegExp("(^|\\.)" + namespaces.split(".").sort().join("\\.(?:.*\\.|)") + "(\\.|$)") : null;

			// Remove matching events
			for ( j = 0; j < eventType.length; j++ ) {
				handleObj = eventType[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					 ( !handler || handler.guid === handleObj.guid ) &&
					 ( !namespaces || namespaces.test( handleObj.namespace ) ) &&
					 ( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector ) ) {
					eventType.splice( j--, 1 );

					if ( handleObj.selector ) {
						eventType.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( eventType.length === 0 && origCount !== eventType.length ) {
				if ( !special.teardown || special.teardown.call( elem, namespaces, elemData.handle ) === false ) {
					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			delete elemData.handle;

			// removeData also checks for emptiness and clears the expando if empty
			// so use it instead of delete
			jQuery.removeData( elem, "events", true );
		}
	},

	// Events that are safe to short-circuit if no handlers are attached.
	// Native DOM events should not be added, they may have inline handlers.
	customEvent: {
		"getData": true,
		"setData": true,
		"changeData": true
	},

	trigger: function( event, data, elem, onlyHandlers ) {
		// Don't do events on text and comment nodes
		if ( elem && (elem.nodeType === 3 || elem.nodeType === 8) ) {
			return;
		}

		// Event object or event type
		var cache, exclusive, i, cur, old, ontype, special, handle, eventPath, bubbleType,
			type = event.type || event,
			namespaces = [];

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf( "!" ) >= 0 ) {
			// Exclusive events trigger only for the exact event (no namespaces)
			type = type.slice(0, -1);
			exclusive = true;
		}

		if ( type.indexOf( "." ) >= 0 ) {
			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split(".");
			type = namespaces.shift();
			namespaces.sort();
		}

		if ( (!elem || jQuery.event.customEvent[ type ]) && !jQuery.event.global[ type ] ) {
			// No jQuery handlers for this event type, and it can't have inline handlers
			return;
		}

		// Caller can pass in an Event, Object, or just an event type string
		event = typeof event === "object" ?
			// jQuery.Event object
			event[ jQuery.expando ] ? event :
			// Object literal
			new jQuery.Event( type, event ) :
			// Just the event type (string)
			new jQuery.Event( type );

		event.type = type;
		event.isTrigger = true;
		event.exclusive = exclusive;
		event.namespace = namespaces.join( "." );
		event.namespace_re = event.namespace? new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)") : null;
		ontype = type.indexOf( ":" ) < 0 ? "on" + type : "";

		// Handle a global trigger
		if ( !elem ) {

			// TODO: Stop taunting the data cache; remove global events and always attach to document
			cache = jQuery.cache;
			for ( i in cache ) {
				if ( cache[ i ].events && cache[ i ].events[ type ] ) {
					jQuery.event.trigger( event, data, cache[ i ].handle.elem, true );
				}
			}
			return;
		}

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data != null ? jQuery.makeArray( data ) : [];
		data.unshift( event );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		eventPath = [[ elem, special.bindType || type ]];
		if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			cur = rfocusMorph.test( bubbleType + type ) ? elem : elem.parentNode;
			for ( old = elem; cur; cur = cur.parentNode ) {
				eventPath.push([ cur, bubbleType ]);
				old = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( old === (elem.ownerDocument || document) ) {
				eventPath.push([ old.defaultView || old.parentWindow || window, bubbleType ]);
			}
		}

		// Fire handlers on the event path
		for ( i = 0; i < eventPath.length && !event.isPropagationStopped(); i++ ) {

			cur = eventPath[i][0];
			event.type = eventPath[i][1];

			handle = ( jQuery._data( cur, "events" ) || {} )[ event.type ] && jQuery._data( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}
			// Note that this is a bare JS function and not a jQuery handler
			handle = ontype && cur[ ontype ];
			if ( handle && jQuery.acceptData( cur ) && handle.apply && handle.apply( cur, data ) === false ) {
				event.preventDefault();
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( (!special._default || special._default.apply( elem.ownerDocument, data ) === false) &&
				!(type === "click" && jQuery.nodeName( elem, "a" )) && jQuery.acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name name as the event.
				// Can't use an .isFunction() check here because IE6/7 fails that test.
				// Don't do default actions on window, that's where global variables be (#6170)
				// IE<9 dies on focus/blur to hidden element (#1486)
				if ( ontype && elem[ type ] && ((type !== "focus" && type !== "blur") || event.target.offsetWidth !== 0) && !jQuery.isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					old = elem[ ontype ];

					if ( old ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;
					elem[ type ]();
					jQuery.event.triggered = undefined;

					if ( old ) {
						elem[ ontype ] = old;
					}
				}
			}
		}

		return event.result;
	},

	dispatch: function( event ) {

		// Make a writable jQuery.Event from the native event object
		event = jQuery.event.fix( event || window.event );

		var i, j, cur, ret, selMatch, matched, matches, handleObj, sel, related,
			handlers = ( (jQuery._data( this, "events" ) || {} )[ event.type ] || []),
			delegateCount = handlers.delegateCount,
			args = core_slice.call( arguments ),
			run_all = !event.exclusive && !event.namespace,
			special = jQuery.event.special[ event.type ] || {},
			handlerQueue = [];

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[0] = event;
		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers that should run if there are delegated events
		// Avoid non-left-click bubbling in Firefox (#3861)
		if ( delegateCount && !(event.button && event.type === "click") ) {

			for ( cur = event.target; cur != this; cur = cur.parentNode || this ) {

				// Don't process clicks (ONLY) on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.disabled !== true || event.type !== "click" ) {
					selMatch = {};
					matches = [];
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];
						sel = handleObj.selector;

						if ( selMatch[ sel ] === undefined ) {
							selMatch[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) >= 0 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( selMatch[ sel ] ) {
							matches.push( handleObj );
						}
					}
					if ( matches.length ) {
						handlerQueue.push({ elem: cur, matches: matches });
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		if ( handlers.length > delegateCount ) {
			handlerQueue.push({ elem: this, matches: handlers.slice( delegateCount ) });
		}

		// Run delegates first; they may want to stop propagation beneath us
		for ( i = 0; i < handlerQueue.length && !event.isPropagationStopped(); i++ ) {
			matched = handlerQueue[ i ];
			event.currentTarget = matched.elem;

			for ( j = 0; j < matched.matches.length && !event.isImmediatePropagationStopped(); j++ ) {
				handleObj = matched.matches[ j ];

				// Triggered event must either 1) be non-exclusive and have no namespace, or
				// 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
				if ( run_all || (!event.namespace && !handleObj.namespace) || event.namespace_re && event.namespace_re.test( handleObj.namespace ) ) {

					event.data = handleObj.data;
					event.handleObj = handleObj;

					ret = ( (jQuery.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )
							.apply( matched.elem, args );

					if ( ret !== undefined ) {
						event.result = ret;
						if ( ret === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	// Includes some event props shared by KeyEvent and MouseEvent
	// *** attrChange attrName relatedNode srcElement  are not normalized, non-W3C, deprecated, will be removed in 1.8 ***
	props: "attrChange attrName relatedNode srcElement altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),

	fixHooks: {},

	keyHooks: {
		props: "char charCode key keyCode".split(" "),
		filter: function( event, original ) {

			// Add which for key events
			if ( event.which == null ) {
				event.which = original.charCode != null ? original.charCode : original.keyCode;
			}

			return event;
		}
	},

	mouseHooks: {
		props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
		filter: function( event, original ) {
			var eventDoc, doc, body,
				button = original.button,
				fromElement = original.fromElement;

			// Calculate pageX/Y if missing and clientX/Y available
			if ( event.pageX == null && original.clientX != null ) {
				eventDoc = event.target.ownerDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
				event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
			}

			// Add relatedTarget, if necessary
			if ( !event.relatedTarget && fromElement ) {
				event.relatedTarget = fromElement === event.target ? original.toElement : fromElement;
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			// Note: button is not normalized, so don't use it
			if ( !event.which && button !== undefined ) {
				event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
			}

			return event;
		}
	},

	fix: function( event ) {
		if ( event[ jQuery.expando ] ) {
			return event;
		}

		// Create a writable copy of the event object and normalize some properties
		var i, prop,
			originalEvent = event,
			fixHook = jQuery.event.fixHooks[ event.type ] || {},
			copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

		event = jQuery.Event( originalEvent );

		for ( i = copy.length; i; ) {
			prop = copy[ --i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Fix target property, if necessary (#1925, IE 6/7/8 & Safari2)
		if ( !event.target ) {
			event.target = originalEvent.srcElement || document;
		}

		// Target should not be a text node (#504, Safari)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		// For mouse/key events, metaKey==false if it's undefined (#3368, #11328; IE6/7/8)
		event.metaKey = !!event.metaKey;

		return fixHook.filter? fixHook.filter( event, originalEvent ) : event;
	},

	special: {
		load: {
			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},

		focus: {
			delegateType: "focusin"
		},
		blur: {
			delegateType: "focusout"
		},

		beforeunload: {
			setup: function( data, namespaces, eventHandle ) {
				// We only want to do this special case on windows
				if ( jQuery.isWindow( this ) ) {
					this.onbeforeunload = eventHandle;
				}
			},

			teardown: function( namespaces, eventHandle ) {
				if ( this.onbeforeunload === eventHandle ) {
					this.onbeforeunload = null;
				}
			}
		}
	},

	simulate: function( type, elem, event, bubble ) {
		// Piggyback on a donor event to simulate a different one.
		// Fake originalEvent to avoid donor's stopPropagation, but if the
		// simulated event prevents default then we do the same on the donor.
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{ type: type,
				isSimulated: true,
				originalEvent: {}
			}
		);
		if ( bubble ) {
			jQuery.event.trigger( e, null, elem );
		} else {
			jQuery.event.dispatch.call( elem, e );
		}
		if ( e.isDefaultPrevented() ) {
			event.preventDefault();
		}
	}
};

// Some plugins are using, but it's undocumented/deprecated and will be removed.
// The 1.7 special event interface should provide all the hooks needed now.
jQuery.event.handle = jQuery.event.dispatch;

jQuery.removeEvent = document.removeEventListener ?
	function( elem, type, handle ) {
		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, handle, false );
		}
	} :
	function( elem, type, handle ) {
		var name = "on" + type;

		if ( elem.detachEvent ) {

			// #8545, #7054, preventing memory leaks for custom events in IE6-8
			// detachEvent needed property on element, by name of that event, to properly expose it to GC
			if ( typeof elem[ name ] === "undefined" ) {
				elem[ name ] = null;
			}

			elem.detachEvent( name, handle );
		}
	};

jQuery.Event = function( src, props ) {
	// Allow instantiation without the 'new' keyword
	if ( !(this instanceof jQuery.Event) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = ( src.defaultPrevented || src.returnValue === false ||
			src.getPreventDefault && src.getPreventDefault() ) ? returnTrue : returnFalse;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || jQuery.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

function returnFalse() {
	return false;
}
function returnTrue() {
	return true;
}

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	preventDefault: function() {
		this.isDefaultPrevented = returnTrue;

		var e = this.originalEvent;
		if ( !e ) {
			return;
		}

		// if preventDefault exists run it on the original event
		if ( e.preventDefault ) {
			e.preventDefault();

		// otherwise set the returnValue property of the original event to false (IE)
		} else {
			e.returnValue = false;
		}
	},
	stopPropagation: function() {
		this.isPropagationStopped = returnTrue;

		var e = this.originalEvent;
		if ( !e ) {
			return;
		}
		// if stopPropagation exists run it on the original event
		if ( e.stopPropagation ) {
			e.stopPropagation();
		}
		// otherwise set the cancelBubble property of the original event to true (IE)
		e.cancelBubble = true;
	},
	stopImmediatePropagation: function() {
		this.isImmediatePropagationStopped = returnTrue;
		this.stopPropagation();
	},
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse
};

// Create mouseenter/leave events using mouseover/out and event-time checks
jQuery.each({
	mouseenter: "mouseover",
	mouseleave: "mouseout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj,
				selector = handleObj.selector;

			// For mousenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || (related !== target && !jQuery.contains( target, related )) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
});

// IE submit delegation
if ( !jQuery.support.submitBubbles ) {

	jQuery.event.special.submit = {
		setup: function() {
			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Lazy-add a submit handler when a descendant form may potentially be submitted
			jQuery.event.add( this, "click._submit keypress._submit", function( e ) {
				// Node name check avoids a VML-related crash in IE (#9807)
				var elem = e.target,
					form = jQuery.nodeName( elem, "input" ) || jQuery.nodeName( elem, "button" ) ? elem.form : undefined;
				if ( form && !jQuery._data( form, "_submit_attached" ) ) {
					jQuery.event.add( form, "submit._submit", function( event ) {
						event._submit_bubble = true;
					});
					jQuery._data( form, "_submit_attached", true );
				}
			});
			// return undefined since we don't need an event listener
		},

		postDispatch: function( event ) {
			// If form was submitted by the user, bubble the event up the tree
			if ( event._submit_bubble ) {
				delete event._submit_bubble;
				if ( this.parentNode && !event.isTrigger ) {
					jQuery.event.simulate( "submit", this.parentNode, event, true );
				}
			}
		},

		teardown: function() {
			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Remove delegated handlers; cleanData eventually reaps submit handlers attached above
			jQuery.event.remove( this, "._submit" );
		}
	};
}

// IE change delegation and checkbox/radio fix
if ( !jQuery.support.changeBubbles ) {

	jQuery.event.special.change = {

		setup: function() {

			if ( rformElems.test( this.nodeName ) ) {
				// IE doesn't fire change on a check/radio until blur; trigger it on click
				// after a propertychange. Eat the blur-change in special.change.handle.
				// This still fires onchange a second time for check/radio after blur.
				if ( this.type === "checkbox" || this.type === "radio" ) {
					jQuery.event.add( this, "propertychange._change", function( event ) {
						if ( event.originalEvent.propertyName === "checked" ) {
							this._just_changed = true;
						}
					});
					jQuery.event.add( this, "click._change", function( event ) {
						if ( this._just_changed && !event.isTrigger ) {
							this._just_changed = false;
						}
						// Allow triggered, simulated change events (#11500)
						jQuery.event.simulate( "change", this, event, true );
					});
				}
				return false;
			}
			// Delegated event; lazy-add a change handler on descendant inputs
			jQuery.event.add( this, "beforeactivate._change", function( e ) {
				var elem = e.target;

				if ( rformElems.test( elem.nodeName ) && !jQuery._data( elem, "_change_attached" ) ) {
					jQuery.event.add( elem, "change._change", function( event ) {
						if ( this.parentNode && !event.isSimulated && !event.isTrigger ) {
							jQuery.event.simulate( "change", this.parentNode, event, true );
						}
					});
					jQuery._data( elem, "_change_attached", true );
				}
			});
		},

		handle: function( event ) {
			var elem = event.target;

			// Swallow native change events from checkbox/radio, we already triggered them above
			if ( this !== elem || event.isSimulated || event.isTrigger || (elem.type !== "radio" && elem.type !== "checkbox") ) {
				return event.handleObj.handler.apply( this, arguments );
			}
		},

		teardown: function() {
			jQuery.event.remove( this, "._change" );

			return !rformElems.test( this.nodeName );
		}
	};
}

// Create "bubbling" focus and blur events
if ( !jQuery.support.focusinBubbles ) {
	jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler while someone wants focusin/focusout
		var attaches = 0,
			handler = function( event ) {
				jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ), true );
			};

		jQuery.event.special[ fix ] = {
			setup: function() {
				if ( attaches++ === 0 ) {
					document.addEventListener( orig, handler, true );
				}
			},
			teardown: function() {
				if ( --attaches === 0 ) {
					document.removeEventListener( orig, handler, true );
				}
			}
		};
	});
}

jQuery.fn.extend({

	on: function( types, selector, data, fn, /*INTERNAL*/ one ) {
		var origFn, type;

		// Types can be a map of types/handlers
		if ( typeof types === "object" ) {
			// ( types-Object, selector, data )
			if ( typeof selector !== "string" ) { // && selector != null
				// ( types-Object, data )
				data = data || selector;
				selector = undefined;
			}
			for ( type in types ) {
				this.on( type, selector, data, types[ type ], one );
			}
			return this;
		}

		if ( data == null && fn == null ) {
			// ( types, fn )
			fn = selector;
			data = selector = undefined;
		} else if ( fn == null ) {
			if ( typeof selector === "string" ) {
				// ( types, selector, fn )
				fn = data;
				data = undefined;
			} else {
				// ( types, data, fn )
				fn = data;
				data = selector;
				selector = undefined;
			}
		}
		if ( fn === false ) {
			fn = returnFalse;
		} else if ( !fn ) {
			return this;
		}

		if ( one === 1 ) {
			origFn = fn;
			fn = function( event ) {
				// Can use an empty set, since event contains the info
				jQuery().off( event );
				return origFn.apply( this, arguments );
			};
			// Use same guid so caller can remove using origFn
			fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
		}
		return this.each( function() {
			jQuery.event.add( this, types, fn, data, selector );
		});
	},
	one: function( types, selector, data, fn ) {
		return this.on( types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {
			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {
			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {
			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each(function() {
			jQuery.event.remove( this, types, fn, selector );
		});
	},

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	live: function( types, data, fn ) {
		jQuery( this.context ).on( types, this.selector, data, fn );
		return this;
	},
	die: function( types, fn ) {
		jQuery( this.context ).off( types, this.selector || "**", fn );
		return this;
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {
		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ? this.off( selector, "**" ) : this.off( types, selector || "**", fn );
	},

	trigger: function( type, data ) {
		return this.each(function() {
			jQuery.event.trigger( type, data, this );
		});
	},
	triggerHandler: function( type, data ) {
		if ( this[0] ) {
			return jQuery.event.trigger( type, data, this[0], true );
		}
	},

	toggle: function( fn ) {
		// Save reference to arguments for access in closure
		var args = arguments,
			guid = fn.guid || jQuery.guid++,
			i = 0,
			toggler = function( event ) {
				// Figure out which function to execute
				var lastToggle = ( jQuery._data( this, "lastToggle" + fn.guid ) || 0 ) % i;
				jQuery._data( this, "lastToggle" + fn.guid, lastToggle + 1 );

				// Make sure that clicks stop
				event.preventDefault();

				// and execute the function
				return args[ lastToggle ].apply( this, arguments ) || false;
			};

		// link all the functions, so any of them can unbind this click handler
		toggler.guid = guid;
		while ( i < args.length ) {
			args[ i++ ].guid = guid;
		}

		return this.click( toggler );
	},

	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	}
});

jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error contextmenu").split(" "), function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		if ( fn == null ) {
			fn = data;
			data = null;
		}

		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};

	if ( rkeyEvent.test( name ) ) {
		jQuery.event.fixHooks[ name ] = jQuery.event.keyHooks;
	}

	if ( rmouseEvent.test( name ) ) {
		jQuery.event.fixHooks[ name ] = jQuery.event.mouseHooks;
	}
});
/*!
 * Sizzle CSS Selector Engine
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license
 * http://sizzlejs.com/
 */
(function( window, undefined ) {

var cachedruns,
	assertGetIdNotName,
	Expr,
	getText,
	isXML,
	contains,
	compile,
	sortOrder,
	hasDuplicate,
	outermostContext,

	baseHasDuplicate = true,
	strundefined = "undefined",

	expando = ( "sizcache" + Math.random() ).replace( ".", "" ),

	Token = String,
	document = window.document,
	docElem = document.documentElement,
	dirruns = 0,
	done = 0,
	pop = [].pop,
	push = [].push,
	slice = [].slice,
	// Use a stripped-down indexOf if a native one is unavailable
	indexOf = [].indexOf || function( elem ) {
		var i = 0,
			len = this.length;
		for ( ; i < len; i++ ) {
			if ( this[i] === elem ) {
				return i;
			}
		}
		return -1;
	},

	// Augment a function for special use by Sizzle
	markFunction = function( fn, value ) {
		fn[ expando ] = value == null || value;
		return fn;
	},

	createCache = function() {
		var cache = {},
			keys = [];

		return markFunction(function( key, value ) {
			// Only keep the most recent entries
			if ( keys.push( key ) > Expr.cacheLength ) {
				delete cache[ keys.shift() ];
			}

			// Retrieve with (key + " ") to avoid collision with native Object.prototype properties (see Issue #157)
			return (cache[ key + " " ] = value);
		}, cache );
	},

	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),

	// Regex

	// Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",
	// http://www.w3.org/TR/css3-syntax/#characters
	characterEncoding = "(?:\\\\.|[-\\w]|[^\\x00-\\xa0])+",

	// Loosely modeled on CSS identifier characters
	// An unquoted value should be a CSS identifier (http://www.w3.org/TR/css3-selectors/#attribute-selectors)
	// Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier = characterEncoding.replace( "w", "w#" ),

	// Acceptable operators http://www.w3.org/TR/selectors/#attribute-selectors
	operators = "([*^$|!~]?=)",
	attributes = "\\[" + whitespace + "*(" + characterEncoding + ")" + whitespace +
		"*(?:" + operators + whitespace + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + identifier + ")|)|)" + whitespace + "*\\]",

	// Prefer arguments not in parens/brackets,
	//   then attribute selectors and non-pseudos (denoted by :),
	//   then anything else
	// These preferences are here to reduce the number of selectors
	//   needing tokenize in the PSEUDO preFilter
	pseudos = ":(" + characterEncoding + ")(?:\\((?:(['\"])((?:\\\\.|[^\\\\])*?)\\2|([^()[\\]]*|(?:(?:" + attributes + ")|[^:]|\\\\.)*|.*))\\)|)",

	// For matchExpr.POS and matchExpr.needsContext
	pos = ":(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + whitespace +
		"*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([\\x20\\t\\r\\n\\f>+~])" + whitespace + "*" ),
	rpseudo = new RegExp( pseudos ),

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w\-]+)|(\w+)|\.([\w\-]+))$/,

	rnot = /^:not/,
	rsibling = /[\x20\t\r\n\f]*[+~]/,
	rendsWithNot = /:not\($/,

	rheader = /h\d/i,
	rinputs = /input|select|textarea|button/i,

	rbackslash = /\\(?!\\)/g,

	matchExpr = {
		"ID": new RegExp( "^#(" + characterEncoding + ")" ),
		"CLASS": new RegExp( "^\\.(" + characterEncoding + ")" ),
		"NAME": new RegExp( "^\\[name=['\"]?(" + characterEncoding + ")['\"]?\\]" ),
		"TAG": new RegExp( "^(" + characterEncoding.replace( "w", "w*" ) + ")" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"POS": new RegExp( pos, "i" ),
		"CHILD": new RegExp( "^:(only|nth|first|last)-child(?:\\(" + whitespace +
			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		// For use in libraries implementing .is()
		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|" + pos, "i" )
	},

	// Support

	// Used for testing something on an element
	assert = function( fn ) {
		var div = document.createElement("div");

		try {
			return fn( div );
		} catch (e) {
			return false;
		} finally {
			// release memory in IE
			div = null;
		}
	},

	// Check if getElementsByTagName("*") returns only elements
	assertTagNameNoComments = assert(function( div ) {
		div.appendChild( document.createComment("") );
		return !div.getElementsByTagName("*").length;
	}),

	// Check if getAttribute returns normalized href attributes
	assertHrefNotNormalized = assert(function( div ) {
		div.innerHTML = "<a href='#'></a>";
		return div.firstChild && typeof div.firstChild.getAttribute !== strundefined &&
			div.firstChild.getAttribute("href") === "#";
	}),

	// Check if attributes should be retrieved by attribute nodes
	assertAttributes = assert(function( div ) {
		div.innerHTML = "<select></select>";
		var type = typeof div.lastChild.getAttribute("multiple");
		// IE8 returns a string for some attributes even when not present
		return type !== "boolean" && type !== "string";
	}),

	// Check if getElementsByClassName can be trusted
	assertUsableClassName = assert(function( div ) {
		// Opera can't find a second classname (in 9.6)
		div.innerHTML = "<div class='hidden e'></div><div class='hidden'></div>";
		if ( !div.getElementsByClassName || !div.getElementsByClassName("e").length ) {
			return false;
		}

		// Safari 3.2 caches class attributes and doesn't catch changes
		div.lastChild.className = "e";
		return div.getElementsByClassName("e").length === 2;
	}),

	// Check if getElementById returns elements by name
	// Check if getElementsByName privileges form controls or returns elements by ID
	assertUsableName = assert(function( div ) {
		// Inject content
		div.id = expando + 0;
		div.innerHTML = "<a name='" + expando + "'></a><div name='" + expando + "'></div>";
		docElem.insertBefore( div, docElem.firstChild );

		// Test
		var pass = document.getElementsByName &&
			// buggy browsers will return fewer than the correct 2
			document.getElementsByName( expando ).length === 2 +
			// buggy browsers will return more than the correct 0
			document.getElementsByName( expando + 0 ).length;
		assertGetIdNotName = !document.getElementById( expando );

		// Cleanup
		docElem.removeChild( div );

		return pass;
	});

// If slice is not available, provide a backup
try {
	slice.call( docElem.childNodes, 0 )[0].nodeType;
} catch ( e ) {
	slice = function( i ) {
		var elem,
			results = [];
		for ( ; (elem = this[i]); i++ ) {
			results.push( elem );
		}
		return results;
	};
}

function Sizzle( selector, context, results, seed ) {
	results = results || [];
	context = context || document;
	var match, elem, xml, m,
		nodeType = context.nodeType;

	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	if ( nodeType !== 1 && nodeType !== 9 ) {
		return [];
	}

	xml = isXML( context );

	if ( !xml && !seed ) {
		if ( (match = rquickExpr.exec( selector )) ) {
			// Speed-up: Sizzle("#ID")
			if ( (m = match[1]) ) {
				if ( nodeType === 9 ) {
					elem = context.getElementById( m );
					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Handle the case where IE, Opera, and Webkit return items
						// by name instead of ID
						if ( elem.id === m ) {
							results.push( elem );
							return results;
						}
					} else {
						return results;
					}
				} else {
					// Context is not a document
					if ( context.ownerDocument && (elem = context.ownerDocument.getElementById( m )) &&
						contains( context, elem ) && elem.id === m ) {
						results.push( elem );
						return results;
					}
				}

			// Speed-up: Sizzle("TAG")
			} else if ( match[2] ) {
				push.apply( results, slice.call(context.getElementsByTagName( selector ), 0) );
				return results;

			// Speed-up: Sizzle(".CLASS")
			} else if ( (m = match[3]) && assertUsableClassName && context.getElementsByClassName ) {
				push.apply( results, slice.call(context.getElementsByClassName( m ), 0) );
				return results;
			}
		}
	}

	// All others
	return select( selector.replace( rtrim, "$1" ), context, results, seed, xml );
}

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	return Sizzle( expr, null, null, [ elem ] ).length > 0;
};

// Returns a function to use in pseudos for input types
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

// Returns a function to use in pseudos for buttons
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return (name === "input" || name === "button") && elem.type === type;
	};
}

// Returns a function to use in pseudos for positionals
function createPositionalPseudo( fn ) {
	return markFunction(function( argument ) {
		argument = +argument;
		return markFunction(function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ (j = matchIndexes[i]) ] ) {
					seed[j] = !(matches[j] = seed[j]);
				}
			}
		});
	});
}

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( nodeType ) {
		if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
			// Use textContent for elements
			// innerText usage removed for consistency of new lines (see #11153)
			if ( typeof elem.textContent === "string" ) {
				return elem.textContent;
			} else {
				// Traverse its children
				for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
					ret += getText( elem );
				}
			}
		} else if ( nodeType === 3 || nodeType === 4 ) {
			return elem.nodeValue;
		}
		// Do not include comment or processing instruction nodes
	} else {

		// If no nodeType, this is expected to be an array
		for ( ; (node = elem[i]); i++ ) {
			// Do not traverse comment nodes
			ret += getText( node );
		}
	}
	return ret;
};

isXML = Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement = elem && (elem.ownerDocument || elem).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

// Element contains another
contains = Sizzle.contains = docElem.contains ?
	function( a, b ) {
		var adown = a.nodeType === 9 ? a.documentElement : a,
			bup = b && b.parentNode;
		return a === bup || !!( bup && bup.nodeType === 1 && adown.contains && adown.contains(bup) );
	} :
	docElem.compareDocumentPosition ?
	function( a, b ) {
		return b && !!( a.compareDocumentPosition( b ) & 16 );
	} :
	function( a, b ) {
		while ( (b = b.parentNode) ) {
			if ( b === a ) {
				return true;
			}
		}
		return false;
	};

Sizzle.attr = function( elem, name ) {
	var val,
		xml = isXML( elem );

	if ( !xml ) {
		name = name.toLowerCase();
	}
	if ( (val = Expr.attrHandle[ name ]) ) {
		return val( elem );
	}
	if ( xml || assertAttributes ) {
		return elem.getAttribute( name );
	}
	val = elem.getAttributeNode( name );
	return val ?
		typeof elem[ name ] === "boolean" ?
			elem[ name ] ? name : null :
			val.specified ? val.value : null :
		null;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	// IE6/7 return a modified href
	attrHandle: assertHrefNotNormalized ?
		{} :
		{
			"href": function( elem ) {
				return elem.getAttribute( "href", 2 );
			},
			"type": function( elem ) {
				return elem.getAttribute("type");
			}
		},

	find: {
		"ID": assertGetIdNotName ?
			function( id, context, xml ) {
				if ( typeof context.getElementById !== strundefined && !xml ) {
					var m = context.getElementById( id );
					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					return m && m.parentNode ? [m] : [];
				}
			} :
			function( id, context, xml ) {
				if ( typeof context.getElementById !== strundefined && !xml ) {
					var m = context.getElementById( id );

					return m ?
						m.id === id || typeof m.getAttributeNode !== strundefined && m.getAttributeNode("id").value === id ?
							[m] :
							undefined :
						[];
				}
			},

		"TAG": assertTagNameNoComments ?
			function( tag, context ) {
				if ( typeof context.getElementsByTagName !== strundefined ) {
					return context.getElementsByTagName( tag );
				}
			} :
			function( tag, context ) {
				var results = context.getElementsByTagName( tag );

				// Filter out possible comments
				if ( tag === "*" ) {
					var elem,
						tmp = [],
						i = 0;

					for ( ; (elem = results[i]); i++ ) {
						if ( elem.nodeType === 1 ) {
							tmp.push( elem );
						}
					}

					return tmp;
				}
				return results;
			},

		"NAME": assertUsableName && function( tag, context ) {
			if ( typeof context.getElementsByName !== strundefined ) {
				return context.getElementsByName( name );
			}
		},

		"CLASS": assertUsableClassName && function( className, context, xml ) {
			if ( typeof context.getElementsByClassName !== strundefined && !xml ) {
				return context.getElementsByClassName( className );
			}
		}
	},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[1] = match[1].replace( rbackslash, "" );

			// Move the given value to match[3] whether quoted or unquoted
			match[3] = ( match[4] || match[5] || "" ).replace( rbackslash, "" );

			if ( match[2] === "~=" ) {
				match[3] = " " + match[3] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {
			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				3 xn-component of xn+y argument ([+-]?\d*n|)
				4 sign of xn-component
				5 x of xn-component
				6 sign of y-component
				7 y of y-component
			*/
			match[1] = match[1].toLowerCase();

			if ( match[1] === "nth" ) {
				// nth-child requires argument
				if ( !match[2] ) {
					Sizzle.error( match[0] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[3] = +( match[3] ? match[4] + (match[5] || 1) : 2 * ( match[2] === "even" || match[2] === "odd" ) );
				match[4] = +( ( match[6] + match[7] ) || match[2] === "odd" );

			// other types prohibit arguments
			} else if ( match[2] ) {
				Sizzle.error( match[0] );
			}

			return match;
		},

		"PSEUDO": function( match ) {
			var unquoted, excess;
			if ( matchExpr["CHILD"].test( match[0] ) ) {
				return null;
			}

			if ( match[3] ) {
				match[2] = match[3];
			} else if ( (unquoted = match[4]) ) {
				// Only check arguments that contain a pseudo
				if ( rpseudo.test(unquoted) &&
					// Get excess from tokenize (recursively)
					(excess = tokenize( unquoted, true )) &&
					// advance to the next closing parenthesis
					(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

					// excess is a negative index
					unquoted = unquoted.slice( 0, excess );
					match[0] = match[0].slice( 0, excess );
				}
				match[2] = unquoted;
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {
		"ID": assertGetIdNotName ?
			function( id ) {
				id = id.replace( rbackslash, "" );
				return function( elem ) {
					return elem.getAttribute("id") === id;
				};
			} :
			function( id ) {
				id = id.replace( rbackslash, "" );
				return function( elem ) {
					var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
					return node && node.value === id;
				};
			},

		"TAG": function( nodeName ) {
			if ( nodeName === "*" ) {
				return function() { return true; };
			}
			nodeName = nodeName.replace( rbackslash, "" ).toLowerCase();

			return function( elem ) {
				return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
			};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ expando ][ className + " " ];

			return pattern ||
				(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
				classCache( className, function( elem ) {
					return pattern.test( elem.className || (typeof elem.getAttribute !== strundefined && elem.getAttribute("class")) || "" );
				});
		},

		"ATTR": function( name, operator, check ) {
			return function( elem, context ) {
				var result = Sizzle.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				return operator === "=" ? result === check :
					operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					operator === "$=" ? check && result.substr( result.length - check.length ) === check :
					operator === "~=" ? ( " " + result + " " ).indexOf( check ) > -1 :
					operator === "|=" ? result === check || result.substr( 0, check.length + 1 ) === check + "-" :
					false;
			};
		},

		"CHILD": function( type, argument, first, last ) {

			if ( type === "nth" ) {
				return function( elem ) {
					var node, diff,
						parent = elem.parentNode;

					if ( first === 1 && last === 0 ) {
						return true;
					}

					if ( parent ) {
						diff = 0;
						for ( node = parent.firstChild; node; node = node.nextSibling ) {
							if ( node.nodeType === 1 ) {
								diff++;
								if ( elem === node ) {
									break;
								}
							}
						}
					}

					// Incorporate the offset (or cast to NaN), then check against cycle size
					diff -= last;
					return diff === first || ( diff % first === 0 && diff / first >= 0 );
				};
			}

			return function( elem ) {
				var node = elem;

				switch ( type ) {
					case "only":
					case "first":
						while ( (node = node.previousSibling) ) {
							if ( node.nodeType === 1 ) {
								return false;
							}
						}

						if ( type === "first" ) {
							return true;
						}

						node = elem;

						/* falls through */
					case "last":
						while ( (node = node.nextSibling) ) {
							if ( node.nodeType === 1 ) {
								return false;
							}
						}

						return true;
				}
			};
		},

		"PSEUDO": function( pseudo, argument ) {
			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					Sizzle.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction(function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf.call( seed, matched[i] );
							seed[ idx ] = !( matches[ idx ] = matched[i] );
						}
					}) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {
		"not": markFunction(function( selector ) {
			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrim, "$1" ) );

			return matcher[ expando ] ?
				markFunction(function( seed, matches, context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( (elem = unmatched[i]) ) {
							seed[i] = !(matches[i] = elem);
						}
					}
				}) :
				function( elem, context, xml ) {
					input[0] = elem;
					matcher( input, null, xml, results );
					return !results.pop();
				};
		}),

		"has": markFunction(function( selector ) {
			return function( elem ) {
				return Sizzle( selector, elem ).length > 0;
			};
		}),

		"contains": markFunction(function( text ) {
			return function( elem ) {
				return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
			};
		}),

		"enabled": function( elem ) {
			return elem.disabled === false;
		},

		"disabled": function( elem ) {
			return elem.disabled === true;
		},

		"checked": function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		"selected": function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos["empty"]( elem );
		},

		"empty": function( elem ) {
			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is only affected by element nodes and content nodes(including text(3), cdata(4)),
			//   not comment, processing instructions, or others
			// Thanks to Diego Perini for the nodeName shortcut
			//   Greater than "@" means alpha characters (specifically not starting with "#" or "?")
			var nodeType;
			elem = elem.firstChild;
			while ( elem ) {
				if ( elem.nodeName > "@" || (nodeType = elem.nodeType) === 3 || nodeType === 4 ) {
					return false;
				}
				elem = elem.nextSibling;
			}
			return true;
		},

		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"text": function( elem ) {
			var type, attr;
			// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)
			// use getAttribute instead to test this case
			return elem.nodeName.toLowerCase() === "input" &&
				(type = elem.type) === "text" &&
				( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === type );
		},

		// Input types
		"radio": createInputPseudo("radio"),
		"checkbox": createInputPseudo("checkbox"),
		"file": createInputPseudo("file"),
		"password": createInputPseudo("password"),
		"image": createInputPseudo("image"),

		"submit": createButtonPseudo("submit"),
		"reset": createButtonPseudo("reset"),

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"focus": function( elem ) {
			var doc = elem.ownerDocument;
			return elem === doc.activeElement && (!doc.hasFocus || doc.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
		},

		"active": function( elem ) {
			return elem === elem.ownerDocument.activeElement;
		},

		// Positional types
		"first": createPositionalPseudo(function() {
			return [ 0 ];
		}),

		"last": createPositionalPseudo(function( matchIndexes, length ) {
			return [ length - 1 ];
		}),

		"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		}),

		"even": createPositionalPseudo(function( matchIndexes, length ) {
			for ( var i = 0; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"odd": createPositionalPseudo(function( matchIndexes, length ) {
			for ( var i = 1; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			for ( var i = argument < 0 ? argument + length : argument; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			for ( var i = argument < 0 ? argument + length : argument; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		})
	}
};

function siblingCheck( a, b, ret ) {
	if ( a === b ) {
		return ret;
	}

	var cur = a.nextSibling;

	while ( cur ) {
		if ( cur === b ) {
			return -1;
		}

		cur = cur.nextSibling;
	}

	return 1;
}

sortOrder = docElem.compareDocumentPosition ?
	function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		return ( !a.compareDocumentPosition || !b.compareDocumentPosition ?
			a.compareDocumentPosition :
			a.compareDocumentPosition(b) & 4
		) ? -1 : 1;
	} :
	function( a, b ) {
		// The nodes are identical, we can exit early
		if ( a === b ) {
			hasDuplicate = true;
			return 0;

		// Fallback to using sourceIndex (in IE) if it's available on both nodes
		} else if ( a.sourceIndex && b.sourceIndex ) {
			return a.sourceIndex - b.sourceIndex;
		}

		var al, bl,
			ap = [],
			bp = [],
			aup = a.parentNode,
			bup = b.parentNode,
			cur = aup;

		// If the nodes are siblings (or identical) we can do a quick check
		if ( aup === bup ) {
			return siblingCheck( a, b );

		// If no parents were found then the nodes are disconnected
		} else if ( !aup ) {
			return -1;

		} else if ( !bup ) {
			return 1;
		}

		// Otherwise they're somewhere else in the tree so we need
		// to build up a full list of the parentNodes for comparison
		while ( cur ) {
			ap.unshift( cur );
			cur = cur.parentNode;
		}

		cur = bup;

		while ( cur ) {
			bp.unshift( cur );
			cur = cur.parentNode;
		}

		al = ap.length;
		bl = bp.length;

		// Start walking down the tree looking for a discrepancy
		for ( var i = 0; i < al && i < bl; i++ ) {
			if ( ap[i] !== bp[i] ) {
				return siblingCheck( ap[i], bp[i] );
			}
		}

		// We ended someplace up the tree so do a sibling check
		return i === al ?
			siblingCheck( a, bp[i], -1 ) :
			siblingCheck( ap[i], b, 1 );
	};

// Always assume the presence of duplicates if sort doesn't
// pass them to our comparison function (as in Google Chrome).
[0, 0].sort( sortOrder );
baseHasDuplicate = !hasDuplicate;

// Document sorting and removing duplicates
Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		i = 1,
		j = 0;

	hasDuplicate = baseHasDuplicate;
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		for ( ; (elem = results[i]); i++ ) {
			if ( elem === results[ i - 1 ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	return results;
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

function tokenize( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ expando ][ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || (match = rcomma.exec( soFar )) ) {
			if ( match ) {
				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[0].length ) || soFar;
			}
			groups.push( tokens = [] );
		}

		matched = false;

		// Combinators
		if ( (match = rcombinators.exec( soFar )) ) {
			tokens.push( matched = new Token( match.shift() ) );
			soFar = soFar.slice( matched.length );

			// Cast descendant combinators to space
			matched.type = match[0].replace( rtrim, " " );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
				(match = preFilters[ type ]( match ))) ) {

				tokens.push( matched = new Token( match.shift() ) );
				soFar = soFar.slice( matched.length );
				matched.type = type;
				matched.matches = match;
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :
			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		checkNonElements = base && combinator.dir === "parentNode",
		doneName = done++;

	return combinator.first ?
		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( (elem = elem[ dir ]) ) {
				if ( checkNonElements || elem.nodeType === 1  ) {
					return matcher( elem, context, xml );
				}
			}
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			// We can't set arbitrary data on XML nodes, so they don't benefit from dir caching
			if ( !xml ) {
				var cache,
					dirkey = dirruns + " " + doneName + " ",
					cachedkey = dirkey + cachedruns;
				while ( (elem = elem[ dir ]) ) {
					if ( checkNonElements || elem.nodeType === 1 ) {
						if ( (cache = elem[ expando ]) === cachedkey ) {
							return elem.sizset;
						} else if ( typeof cache === "string" && cache.indexOf(dirkey) === 0 ) {
							if ( elem.sizset ) {
								return elem;
							}
						} else {
							elem[ expando ] = cachedkey;
							if ( matcher( elem, context, xml ) ) {
								elem.sizset = true;
								return elem;
							}
							elem.sizset = false;
						}
					}
				}
			} else {
				while ( (elem = elem[ dir ]) ) {
					if ( checkNonElements || elem.nodeType === 1 ) {
						if ( matcher( elem, context, xml ) ) {
							return elem;
						}
					}
				}
			}
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[i]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[0];
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( (elem = unmatched[i]) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction(function( seed, results, context, xml ) {
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?
				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		if ( matcher ) {
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( (elem = temp[i]) ) {
					matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {
					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) ) {
							// Restore matcherIn since elem is not yet a final match
							temp.push( (matcherIn[i] = elem) );
						}
					}
					postFinder( null, (matcherOut = []), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( (elem = matcherOut[i]) &&
						(temp = postFinder ? indexOf.call( seed, elem ) : preMap[i]) > -1 ) {

						seed[temp] = !(results[temp] = elem);
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	});
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[0].type ],
		implicitRelative = leadingRelative || Expr.relative[" "],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf.call( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {
			return ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				(checkContext = context).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );
		} ];

	for ( ; i < len; i++ ) {
		if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
			matchers = [ addCombinator( elementMatcher( matchers ), matcher ) ];
		} else {
			matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {
				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[j].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && tokens.slice( 0, i - 1 ).join("").replace( rtrim, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
					j < len && tokens.join("")
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	var bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, expandContext ) {
			var elem, j, matcher,
				setMatched = [],
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				outermost = expandContext != null,
				contextBackup = outermostContext,
				// We must always have either seed elements or context
				elems = seed || byElement && Expr.find["TAG"]( "*", expandContext && context.parentNode || context ),
				// Nested matchers should use non-integer dirruns
				dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.E);

			if ( outermost ) {
				outermostContext = context !== document && context;
				cachedruns = superMatcher.el;
			}

			// Add elements passing elementMatchers directly to results
			for ( ; (elem = elems[i]) != null; i++ ) {
				if ( byElement && elem ) {
					for ( j = 0; (matcher = elementMatchers[j]); j++ ) {
						if ( matcher( elem, context, xml ) ) {
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
						cachedruns = ++superMatcher.el;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {
					// They will have gone through all possible matchers
					if ( (elem = !matcher && elem) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// Apply set filters to unmatched elements
			matchedCount += i;
			if ( bySet && i !== matchedCount ) {
				for ( j = 0; (matcher = setMatchers[j]); j++ ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {
					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !(unmatched[i] || setMatched[i]) ) {
								setMatched[i] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	superMatcher.el = 0;
	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

compile = Sizzle.compile = function( selector, group /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ expando ][ selector + " " ];

	if ( !cached ) {
		// Generate a function of recursive functions that can be used to check each element
		if ( !group ) {
			group = tokenize( selector );
		}
		i = group.length;
		while ( i-- ) {
			cached = matcherFromTokens( group[i] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );
	}
	return cached;
};

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[i], results );
	}
	return results;
}

function select( selector, context, results, seed, xml ) {
	var i, tokens, token, type, find,
		match = tokenize( selector ),
		j = match.length;

	if ( !seed ) {
		// Try to minimize operations if there is only one group
		if ( match.length === 1 ) {

			// Take a shortcut and set the context if the root selector is an ID
			tokens = match[0] = match[0].slice( 0 );
			if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
					context.nodeType === 9 && !xml &&
					Expr.relative[ tokens[1].type ] ) {

				context = Expr.find["ID"]( token.matches[0].replace( rbackslash, "" ), context, xml )[0];
				if ( !context ) {
					return results;
				}

				selector = selector.slice( tokens.shift().length );
			}

			// Fetch a seed set for right-to-left matching
			for ( i = matchExpr["POS"].test( selector ) ? -1 : tokens.length - 1; i >= 0; i-- ) {
				token = tokens[i];

				// Abort if we hit a combinator
				if ( Expr.relative[ (type = token.type) ] ) {
					break;
				}
				if ( (find = Expr.find[ type ]) ) {
					// Search, expanding context for leading sibling combinators
					if ( (seed = find(
						token.matches[0].replace( rbackslash, "" ),
						rsibling.test( tokens[0].type ) && context.parentNode || context,
						xml
					)) ) {

						// If seed is empty or no tokens remain, we can return early
						tokens.splice( i, 1 );
						selector = seed.length && tokens.join("");
						if ( !selector ) {
							push.apply( results, slice.call( seed, 0 ) );
							return results;
						}

						break;
					}
				}
			}
		}
	}

	// Compile and execute a filtering function
	// Provide `match` to avoid retokenization if we modified the selector above
	compile( selector, match )(
		seed,
		context,
		xml,
		results,
		rsibling.test( selector )
	);
	return results;
}

if ( document.querySelectorAll ) {
	(function() {
		var disconnectedMatch,
			oldSelect = select,
			rescape = /'|\\/g,
			rattributeQuotes = /\=[\x20\t\r\n\f]*([^'"\]]*)[\x20\t\r\n\f]*\]/g,

			// qSa(:focus) reports false when true (Chrome 21), no need to also add to buggyMatches since matches checks buggyQSA
			// A support test would require too much code (would include document ready)
			rbuggyQSA = [ ":focus" ],

			// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
			// A support test would require too much code (would include document ready)
			// just skip matchesSelector for :active
			rbuggyMatches = [ ":active" ],
			matches = docElem.matchesSelector ||
				docElem.mozMatchesSelector ||
				docElem.webkitMatchesSelector ||
				docElem.oMatchesSelector ||
				docElem.msMatchesSelector;

		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( div ) {
			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explictly
			// setting a boolean content attribute,
			// since its presence should be enough
			// http://bugs.jquery.com/ticket/12359
			div.innerHTML = "<select><option selected=''></option></select>";

			// IE8 - Some boolean attributes are not treated correctly
			if ( !div.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:checked|disabled|ismap|multiple|readonly|selected|value)" );
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here (do not put tests after this one)
			if ( !div.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}
		});

		assert(function( div ) {

			// Opera 10-12/IE9 - ^= $= *= and empty values
			// Should not select anything
			div.innerHTML = "<p test=''></p>";
			if ( div.querySelectorAll("[test^='']").length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:\"\"|'')" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here (do not put tests after this one)
			div.innerHTML = "<input type='hidden'/>";
			if ( !div.querySelectorAll(":enabled").length ) {
				rbuggyQSA.push(":enabled", ":disabled");
			}
		});

		// rbuggyQSA always contains :focus, so no need for a length check
		rbuggyQSA = /* rbuggyQSA.length && */ new RegExp( rbuggyQSA.join("|") );

		select = function( selector, context, results, seed, xml ) {
			// Only use querySelectorAll when not filtering,
			// when this is not xml,
			// and when no QSA bugs apply
			if ( !seed && !xml && !rbuggyQSA.test( selector ) ) {
				var groups, i,
					old = true,
					nid = expando,
					newContext = context,
					newSelector = context.nodeType === 9 && selector;

				// qSA works strangely on Element-rooted queries
				// We can work around this by specifying an extra ID on the root
				// and working up from there (Thanks to Andrew Dupont for the technique)
				// IE 8 doesn't work on object elements
				if ( context.nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
					groups = tokenize( selector );

					if ( (old = context.getAttribute("id")) ) {
						nid = old.replace( rescape, "\\$&" );
					} else {
						context.setAttribute( "id", nid );
					}
					nid = "[id='" + nid + "'] ";

					i = groups.length;
					while ( i-- ) {
						groups[i] = nid + groups[i].join("");
					}
					newContext = rsibling.test( selector ) && context.parentNode || context;
					newSelector = groups.join(",");
				}

				if ( newSelector ) {
					try {
						push.apply( results, slice.call( newContext.querySelectorAll(
							newSelector
						), 0 ) );
						return results;
					} catch(qsaError) {
					} finally {
						if ( !old ) {
							context.removeAttribute("id");
						}
					}
				}
			}

			return oldSelect( selector, context, results, seed, xml );
		};

		if ( matches ) {
			assert(function( div ) {
				// Check to see if it's possible to do matchesSelector
				// on a disconnected node (IE 9)
				disconnectedMatch = matches.call( div, "div" );

				// This should fail with an exception
				// Gecko does not error, returns false instead
				// try {
				// 	matches.call( div, "[test!='']:sizzle" );
				// 	rbuggyMatches.push( "!=", pseudos );
				// } catch ( e ) {}

				 try {
				// This should fail with an exception
				// Gecko does not error, returns false instead
				// <orig. $jquery-1.5:>
				// matches.call( document.documentElement, "[test!='']:sizzle" );
				// <proposal to Ticket #7535, 2011-03-24:>
				  if( ! html.mozMatchesSelector || document.currentScript ){
				    matches.call( html, "[test!='']:sizzle" );
				  }
				//else{
				// /*FF lt 4*/
				//}


				} catch( pseudoError ) {
				    pseudoWorks = true;
				  }
				  // <testing only>
				  // alert('MalformedSelectorException thrown: ' + pseudoWorks );
			});

			// rbuggyMatches always contains :active and :focus, so no need for a length check
			rbuggyMatches = /* rbuggyMatches.length && */ new RegExp( rbuggyMatches.join("|") );

			Sizzle.matchesSelector = function( elem, expr ) {
				// Make sure that attribute selectors are quoted
				expr = expr.replace( rattributeQuotes, "='$1']" );

				// rbuggyMatches always contains :active, so no need for an existence check
				if ( !isXML( elem ) && !rbuggyMatches.test( expr ) && !rbuggyQSA.test( expr ) ) {
					try {
						var ret = matches.call( elem, expr );

						// IE 9's matchesSelector returns false on disconnected nodes
						if ( ret || disconnectedMatch ||
								// As well, disconnected nodes are said to be in a document
								// fragment in IE 9
								elem.document && elem.document.nodeType !== 11 ) {
							return ret;
						}
					} catch(e) {}
				}

				return Sizzle( expr, null, null, [ elem ] ).length > 0;
			};
		}
	})();
}

// Deprecated
Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Back-compat
function setFilters() {}
Expr.filters = setFilters.prototype = Expr.pseudos;
Expr.setFilters = new setFilters();

// Override sizzle attribute retrieval
Sizzle.attr = jQuery.attr;
jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[":"] = jQuery.expr.pseudos;
jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;


})( window );
var runtil = /Until$/,
	rparentsprev = /^(?:parents|prev(?:Until|All))/,
	isSimple = /^.[^:#\[\.,]*$/,
	rneedsContext = jQuery.expr.match.needsContext,
	// methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend({
	find: function( selector ) {
		var i, l, length, n, r, ret,
			self = this;

		if ( typeof selector !== "string" ) {
			return jQuery( selector ).filter(function() {
				for ( i = 0, l = self.length; i < l; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			});
		}

		ret = this.pushStack( "", "find", selector );

		for ( i = 0, l = this.length; i < l; i++ ) {
			length = ret.length;
			jQuery.find( selector, this[i], ret );

			if ( i > 0 ) {
				// Make sure that the results are unique
				for ( n = length; n < ret.length; n++ ) {
					for ( r = 0; r < length; r++ ) {
						if ( ret[r] === ret[n] ) {
							ret.splice(n--, 1);
							break;
						}
					}
				}
			}
		}

		return ret;
	},

	has: function( target ) {
		var i,
			targets = jQuery( target, this ),
			len = targets.length;

		return this.filter(function() {
			for ( i = 0; i < len; i++ ) {
				if ( jQuery.contains( this, targets[i] ) ) {
					return true;
				}
			}
		});
	},

	not: function( selector ) {
		return this.pushStack( winnow(this, selector, false), "not", selector);
	},

	filter: function( selector ) {
		return this.pushStack( winnow(this, selector, true), "filter", selector );
	},

	is: function( selector ) {
		return !!selector && (
			typeof selector === "string" ?
				// If this is a positional/relative selector, check membership in the returned set
				// so $("p:first").is("p:last") won't return true for a doc with two "p".
				rneedsContext.test( selector ) ?
					jQuery( selector, this.context ).index( this[0] ) >= 0 :
					jQuery.filter( selector, this ).length > 0 :
				this.filter( selector ).length > 0 );
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			ret = [],
			pos = rneedsContext.test( selectors ) || typeof selectors !== "string" ?
				jQuery( selectors, context || this.context ) :
				0;

		for ( ; i < l; i++ ) {
			cur = this[i];

			while ( cur && cur.ownerDocument && cur !== context && cur.nodeType !== 11 ) {
				if ( pos ? pos.index(cur) > -1 : jQuery.find.matchesSelector(cur, selectors) ) {
					ret.push( cur );
					break;
				}
				cur = cur.parentNode;
			}
		}

		ret = ret.length > 1 ? jQuery.unique( ret ) : ret;

		return this.pushStack( ret, "closest", selectors );
	},

	// Determine the position of an element within
	// the matched set of elements
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[0] && this[0].parentNode ) ? this.prevAll().length : -1;
		}

		// index in selector
		if ( typeof elem === "string" ) {
			return jQuery.inArray( this[0], jQuery( elem ) );
		}

		// Locate the position of the desired element
		return jQuery.inArray(
			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[0] : elem, this );
	},

	add: function( selector, context ) {
		var set = typeof selector === "string" ?
				jQuery( selector, context ) :
				jQuery.makeArray( selector && selector.nodeType ? [ selector ] : selector ),
			all = jQuery.merge( this.get(), set );

		return this.pushStack( isDisconnected( set[0] ) || isDisconnected( all[0] ) ?
			all :
			jQuery.unique( all ) );
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter(selector)
		);
	}
});

jQuery.fn.andSelf = jQuery.fn.addBack;

// A painfully simple check to see if an element is disconnected
// from a document (should be improved, where feasible).
function isDisconnected( node ) {
	return !node || !node.parentNode || node.parentNode.nodeType === 11;
}

function sibling( cur, dir ) {
	do {
		cur = cur[ dir ];
	} while ( cur && cur.nodeType !== 1 );

	return cur;
}

jQuery.each({
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return jQuery.dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return jQuery.dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return jQuery.dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return jQuery.sibling( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return jQuery.sibling( elem.firstChild );
	},
	contents: function( elem ) {
		return jQuery.nodeName( elem, "iframe" ) ?
			elem.contentDocument || elem.contentWindow.document :
			jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var ret = jQuery.map( this, fn, until );

		if ( !runtil.test( name ) ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			ret = jQuery.filter( selector, ret );
		}

		ret = this.length > 1 && !guaranteedUnique[ name ] ? jQuery.unique( ret ) : ret;

		if ( this.length > 1 && rparentsprev.test( name ) ) {
			ret = ret.reverse();
		}

		return this.pushStack( ret, name, core_slice.call( arguments ).join(",") );
	};
});

jQuery.extend({
	filter: function( expr, elems, not ) {
		if ( not ) {
			expr = ":not(" + expr + ")";
		}

		return elems.length === 1 ?
			jQuery.find.matchesSelector(elems[0], expr) ? [ elems[0] ] : [] :
			jQuery.find.matches(expr, elems);
	},

	dir: function( elem, dir, until ) {
		var matched = [],
			cur = elem[ dir ];

		while ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery( cur ).is( until )) ) {
			if ( cur.nodeType === 1 ) {
				matched.push( cur );
			}
			cur = cur[dir];
		}
		return matched;
	},

	sibling: function( n, elem ) {
		var r = [];

		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				r.push( n );
			}
		}

		return r;
	}
});

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, keep ) {

	// Can't pass null or undefined to indexOf in Firefox 4
	// Set to 0 to skip string check
	qualifier = qualifier || 0;

	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep(elements, function( elem, i ) {
			var retVal = !!qualifier.call( elem, i, elem );
			return retVal === keep;
		});

	} else if ( qualifier.nodeType ) {
		return jQuery.grep(elements, function( elem, i ) {
			return ( elem === qualifier ) === keep;
		});

	} else if ( typeof qualifier === "string" ) {
		var filtered = jQuery.grep(elements, function( elem ) {
			return elem.nodeType === 1;
		});

		if ( isSimple.test( qualifier ) ) {
			return jQuery.filter(qualifier, filtered, !keep);
		} else {
			qualifier = jQuery.filter( qualifier, filtered );
		}
	}

	return jQuery.grep(elements, function( elem, i ) {
		return ( jQuery.inArray( elem, qualifier ) >= 0 ) === keep;
	});
}
function createSafeFragment( document ) {
	var list = nodeNames.split( "|" ),
	safeFrag = document.createDocumentFragment();

	if ( safeFrag.createElement ) {
		while ( list.length ) {
			safeFrag.createElement(
				list.pop()
			);
		}
	}
	return safeFrag;
}

var nodeNames = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|" +
		"header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",
	rinlinejQuery = / jQuery\d+="(?:null|\d+)"/g,
	rleadingWhitespace = /^\s+/,
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
	rtagName = /<([\w:]+)/,
	rtbody = /<tbody/i,
	rhtml = /<|&#?\w+;/,
	rnoInnerhtml = /<(?:script|style|link)/i,
	rnocache = /<(?:script|object|embed|option|style)/i,
	rnoshimcache = new RegExp("<(?:" + nodeNames + ")[\\s/>]", "i"),
	rcheckableType = /^(?:checkbox|radio)$/,
	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rscriptType = /\/(java|ecma)script/i,
	rcleanScript = /^\s*<!(?:\[CDATA\[|\-\-)|[\]\-]{2}>\s*$/g,
	wrapMap = {
		option: [ 1, "<select multiple='multiple'>", "</select>" ],
		legend: [ 1, "<fieldset>", "</fieldset>" ],
		thead: [ 1, "<table>", "</table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
		col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
		area: [ 1, "<map>", "</map>" ],
		_default: [ 0, "", "" ]
	},
	safeFragment = createSafeFragment( document ),
	fragmentDiv = safeFragment.appendChild( document.createElement("div") );

wrapMap.optgroup = wrapMap.option;
wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

// IE6-8 can't serialize link, script, style, or any html5 (NoScope) tags,
// unless wrapped in a div with non-breaking characters in front of it.
if ( !jQuery.support.htmlSerialize ) {
	wrapMap._default = [ 1, "X<div>", "</div>" ];
}

jQuery.fn.extend({
	text: function( value ) {
		return jQuery.access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().append( ( this[0] && this[0].ownerDocument || document ).createTextNode( value ) );
		}, null, value, arguments.length );
	},

	wrapAll: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapAll( html.call(this, i) );
			});
		}

		if ( this[0] ) {
			// The elements to wrap the target around
			var wrap = jQuery( html, this[0].ownerDocument ).eq(0).clone(true);

			if ( this[0].parentNode ) {
				wrap.insertBefore( this[0] );
			}

			wrap.map(function() {
				var elem = this;

				while ( elem.firstChild && elem.firstChild.nodeType === 1 ) {
					elem = elem.firstChild;
				}

				return elem;
			}).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapInner( html.call(this, i) );
			});
		}

		return this.each(function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		});
	},

	wrap: function( html ) {
		var isFunction = jQuery.isFunction( html );

		return this.each(function(i) {
			jQuery( this ).wrapAll( isFunction ? html.call(this, i) : html );
		});
	},

	unwrap: function() {
		return this.parent().each(function() {
			if ( !jQuery.nodeName( this, "body" ) ) {
				jQuery( this ).replaceWith( this.childNodes );
			}
		}).end();
	},

	append: function() {
		return this.domManip(arguments, true, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 ) {
				this.appendChild( elem );
			}
		});
	},

	prepend: function() {
		return this.domManip(arguments, true, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 ) {
				this.insertBefore( elem, this.firstChild );
			}
		});
	},

	before: function() {
		if ( !isDisconnected( this[0] ) ) {
			return this.domManip(arguments, false, function( elem ) {
				this.parentNode.insertBefore( elem, this );
			});
		}

		if ( arguments.length ) {
			var set = jQuery.clean( arguments );
			return this.pushStack( jQuery.merge( set, this ), "before", this.selector );
		}
	},

	after: function() {
		if ( !isDisconnected( this[0] ) ) {
			return this.domManip(arguments, false, function( elem ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			});
		}

		if ( arguments.length ) {
			var set = jQuery.clean( arguments );
			return this.pushStack( jQuery.merge( this, set ), "after", this.selector );
		}
	},

	// keepData is for internal use only--do not document
	remove: function( selector, keepData ) {
		var elem,
			i = 0;

		for ( ; (elem = this[i]) != null; i++ ) {
			if ( !selector || jQuery.filter( selector, [ elem ] ).length ) {
				if ( !keepData && elem.nodeType === 1 ) {
					jQuery.cleanData( elem.getElementsByTagName("*") );
					jQuery.cleanData( [ elem ] );
				}

				if ( elem.parentNode ) {
					elem.parentNode.removeChild( elem );
				}
			}
		}

		return this;
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; (elem = this[i]) != null; i++ ) {
			// Remove element nodes and prevent memory leaks
			if ( elem.nodeType === 1 ) {
				jQuery.cleanData( elem.getElementsByTagName("*") );
			}

			// Remove any remaining nodes
			while ( elem.firstChild ) {
				elem.removeChild( elem.firstChild );
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function () {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		});
	},

	html: function( value ) {
		return jQuery.access( this, function( value ) {
			var elem = this[0] || {},
				i = 0,
				l = this.length;

			if ( value === undefined ) {
				return elem.nodeType === 1 ?
					elem.innerHTML.replace( rinlinejQuery, "" ) :
					undefined;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				( jQuery.support.htmlSerialize || !rnoshimcache.test( value )  ) &&
				( jQuery.support.leadingWhitespace || !rleadingWhitespace.test( value ) ) &&
				!wrapMap[ ( rtagName.exec( value ) || ["", ""] )[1].toLowerCase() ] ) {

				value = value.replace( rxhtmlTag, "<$1></$2>" );

				try {
					for (; i < l; i++ ) {
						// Remove element nodes and prevent memory leaks
						elem = this[i] || {};
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( elem.getElementsByTagName( "*" ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch(e) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function( value ) {
		if ( !isDisconnected( this[0] ) ) {
			// Make sure that the elements are removed from the DOM before they are inserted
			// this can help fix replacing a parent with child elements
			if ( jQuery.isFunction( value ) ) {
				return this.each(function(i) {
					var self = jQuery(this), old = self.html();
					self.replaceWith( value.call( this, i, old ) );
				});
			}

			if ( typeof value !== "string" ) {
				value = jQuery( value ).detach();
			}

			return this.each(function() {
				var next = this.nextSibling,
					parent = this.parentNode;

				jQuery( this ).remove();

				if ( next ) {
					jQuery(next).before( value );
				} else {
					jQuery(parent).append( value );
				}
			});
		}

		return this.length ?
			this.pushStack( jQuery(jQuery.isFunction(value) ? value() : value), "replaceWith", value ) :
			this;
	},

	detach: function( selector ) {
		return this.remove( selector, true );
	},

	domManip: function( args, table, callback ) {

		// Flatten any nested arrays
		args = [].concat.apply( [], args );

		var results, first, fragment, iNoClone,
			i = 0,
			value = args[0],
			scripts = [],
			l = this.length;

		// We can't cloneNode fragments that contain checked, in WebKit
		if ( !jQuery.support.checkClone && l > 1 && typeof value === "string" && rchecked.test( value ) ) {
			return this.each(function() {
				jQuery(this).domManip( args, table, callback );
			});
		}

		if ( jQuery.isFunction(value) ) {
			return this.each(function(i) {
				var self = jQuery(this);
				args[0] = value.call( this, i, table ? self.html() : undefined );
				self.domManip( args, table, callback );
			});
		}

		if ( this[0] ) {
			results = jQuery.buildFragment( args, this, scripts );
			fragment = results.fragment;
			first = fragment.firstChild;

			if ( fragment.childNodes.length === 1 ) {
				fragment = first;
			}

			if ( first ) {
				table = table && jQuery.nodeName( first, "tr" );

				// Use the original fragment for the last item instead of the first because it can end up
				// being emptied incorrectly in certain situations (#8070).
				// Fragments from the fragment cache must always be cloned and never used in place.
				for ( iNoClone = results.cacheable || l - 1; i < l; i++ ) {
					callback.call(
						table && jQuery.nodeName( this[i], "table" ) ?
							findOrAppend( this[i], "tbody" ) :
							this[i],
						i === iNoClone ?
							fragment :
							jQuery.clone( fragment, true, true )
					);
				}
			}

			// Fix #11809: Avoid leaking memory
			fragment = first = null;

			if ( scripts.length ) {
				jQuery.each( scripts, function( i, elem ) {
					if ( elem.src ) {
						if ( jQuery.ajax ) {
							jQuery.ajax({
								url: elem.src,
								type: "GET",
								dataType: "script",
								async: false,
								global: false,
								"throws": true
							});
						} else {
							jQuery.error("no ajax");
						}
					} else {
						jQuery.globalEval( ( elem.text || elem.textContent || elem.innerHTML || "" ).replace( rcleanScript, "" ) );
					}

					if ( elem.parentNode ) {
						elem.parentNode.removeChild( elem );
					}
				});
			}
		}

		return this;
	}
});

function findOrAppend( elem, tag ) {
	return elem.getElementsByTagName( tag )[0] || elem.appendChild( elem.ownerDocument.createElement( tag ) );
}

function cloneCopyEvent( src, dest ) {

	if ( dest.nodeType !== 1 || !jQuery.hasData( src ) ) {
		return;
	}

	var type, i, l,
		oldData = jQuery._data( src ),
		curData = jQuery._data( dest, oldData ),
		events = oldData.events;

	if ( events ) {
		delete curData.handle;
		curData.events = {};

		for ( type in events ) {
			for ( i = 0, l = events[ type ].length; i < l; i++ ) {
				jQuery.event.add( dest, type, events[ type ][ i ] );
			}
		}
	}

	// make the cloned public data object a copy from the original
	if ( curData.data ) {
		curData.data = jQuery.extend( {}, curData.data );
	}
}

function cloneFixAttributes( src, dest ) {
	var nodeName;

	// We do not need to do anything for non-Elements
	if ( dest.nodeType !== 1 ) {
		return;
	}

	// clearAttributes removes the attributes, which we don't want,
	// but also removes the attachEvent events, which we *do* want
	if ( dest.clearAttributes ) {
		dest.clearAttributes();
	}

	// mergeAttributes, in contrast, only merges back on the
	// original attributes, not the events
	if ( dest.mergeAttributes ) {
		dest.mergeAttributes( src );
	}

	nodeName = dest.nodeName.toLowerCase();

	if ( nodeName === "object" ) {
		// IE6-10 improperly clones children of object elements using classid.
		// IE10 throws NoModificationAllowedError if parent is null, #12132.
		if ( dest.parentNode ) {
			dest.outerHTML = src.outerHTML;
		}

		// This path appears unavoidable for IE9. When cloning an object
		// element in IE9, the outerHTML strategy above is not sufficient.
		// If the src has innerHTML and the destination does not,
		// copy the src.innerHTML into the dest.innerHTML. #10324
		if ( jQuery.support.html5Clone && (src.innerHTML && !jQuery.trim(dest.innerHTML)) ) {
			dest.innerHTML = src.innerHTML;
		}

	} else if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
		// IE6-8 fails to persist the checked state of a cloned checkbox
		// or radio button. Worse, IE6-7 fail to give the cloned element
		// a checked appearance if the defaultChecked value isn't also set

		dest.defaultChecked = dest.checked = src.checked;

		// IE6-7 get confused and end up setting the value of a cloned
		// checkbox/radio button to an empty string instead of "on"
		if ( dest.value !== src.value ) {
			dest.value = src.value;
		}

	// IE6-8 fails to return the selected option to the default selected
	// state when cloning options
	} else if ( nodeName === "option" ) {
		dest.selected = src.defaultSelected;

	// IE6-8 fails to set the defaultValue to the correct value when
	// cloning other types of input fields
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;

	// IE blanks contents when cloning scripts
	} else if ( nodeName === "script" && dest.text !== src.text ) {
		dest.text = src.text;
	}

	// Event data gets referenced instead of copied if the expando
	// gets copied too
	dest.removeAttribute( jQuery.expando );
}

jQuery.buildFragment = function( args, context, scripts ) {
	var fragment, cacheable, cachehit,
		first = args[ 0 ];

	// Set context from what may come in as undefined or a jQuery collection or a node
	// Updated to fix #12266 where accessing context[0] could throw an exception in IE9/10 &
	// also doubles as fix for #8950 where plain objects caused createDocumentFragment exception
	context = context || document;
	context = !context.nodeType && context[0] || context;
	context = context.ownerDocument || context;

	// Only cache "small" (1/2 KB) HTML strings that are associated with the main document
	// Cloning options loses the selected state, so don't cache them
	// IE 6 doesn't like it when you put <object> or <embed> elements in a fragment
	// Also, WebKit does not clone 'checked' attributes on cloneNode, so don't cache
	// Lastly, IE6,7,8 will not correctly reuse cached fragments that were created from unknown elems #10501
	if ( args.length === 1 && typeof first === "string" && first.length < 512 && context === document &&
		first.charAt(0) === "<" && !rnocache.test( first ) &&
		(jQuery.support.checkClone || !rchecked.test( first )) &&
		(jQuery.support.html5Clone || !rnoshimcache.test( first )) ) {

		// Mark cacheable and look for a hit
		cacheable = true;
		fragment = jQuery.fragments[ first ];
		cachehit = fragment !== undefined;
	}

	if ( !fragment ) {
		fragment = context.createDocumentFragment();
		jQuery.clean( args, context, fragment, scripts );

		// Update the cache, but only store false
		// unless this is a second parsing of the same content
		if ( cacheable ) {
			jQuery.fragments[ first ] = cachehit && fragment;
		}
	}

	return { fragment: fragment, cacheable: cacheable };
};

jQuery.fragments = {};

jQuery.each({
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			i = 0,
			ret = [],
			insert = jQuery( selector ),
			l = insert.length,
			parent = this.length === 1 && this[0].parentNode;

		if ( (parent == null || parent && parent.nodeType === 11 && parent.childNodes.length === 1) && l === 1 ) {
			insert[ original ]( this[0] );
			return this;
		} else {
			for ( ; i < l; i++ ) {
				elems = ( i > 0 ? this.clone(true) : this ).get();
				jQuery( insert[i] )[ original ]( elems );
				ret = ret.concat( elems );
			}

			return this.pushStack( ret, name, insert.selector );
		}
	};
});

function getAll( elem ) {
	if ( typeof elem.getElementsByTagName !== "undefined" ) {
		return elem.getElementsByTagName( "*" );

	} else if ( typeof elem.querySelectorAll !== "undefined" ) {
		return elem.querySelectorAll( "*" );

	} else {
		return [];
	}
}

// Used in clean, fixes the defaultChecked property
function fixDefaultChecked( elem ) {
	if ( rcheckableType.test( elem.type ) ) {
		elem.defaultChecked = elem.checked;
	}
}

jQuery.extend({
	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var srcElements,
			destElements,
			i,
			clone;

		if ( jQuery.support.html5Clone || jQuery.isXMLDoc(elem) || !rnoshimcache.test( "<" + elem.nodeName + ">" ) ) {
			clone = elem.cloneNode( true );

		// IE<=8 does not properly clone detached, unknown element nodes
		} else {
			fragmentDiv.innerHTML = elem.outerHTML;
			fragmentDiv.removeChild( clone = fragmentDiv.firstChild );
		}

		if ( (!jQuery.support.noCloneEvent || !jQuery.support.noCloneChecked) &&
				(elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem) ) {
			// IE copies events bound via attachEvent when using cloneNode.
			// Calling detachEvent on the clone will also remove the events
			// from the original. In order to get around this, we use some
			// proprietary methods to clear the events. Thanks to MooTools
			// guys for this hotness.

			cloneFixAttributes( elem, clone );

			// Using Sizzle here is crazy slow, so we use getElementsByTagName instead
			srcElements = getAll( elem );
			destElements = getAll( clone );

			// Weird iteration because IE will replace the length property
			// with an element if you are cloning the body and one of the
			// elements on the page has a name or id of "length"
			for ( i = 0; srcElements[i]; ++i ) {
				// Ensure that the destination node is not null; Fixes #9587
				if ( destElements[i] ) {
					cloneFixAttributes( srcElements[i], destElements[i] );
				}
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			cloneCopyEvent( elem, clone );

			if ( deepDataAndEvents ) {
				srcElements = getAll( elem );
				destElements = getAll( clone );

				for ( i = 0; srcElements[i]; ++i ) {
					cloneCopyEvent( srcElements[i], destElements[i] );
				}
			}
		}

		srcElements = destElements = null;

		// Return the cloned set
		return clone;
	},

	clean: function( elems, context, fragment, scripts ) {
		var i, j, elem, tag, wrap, depth, div, hasBody, tbody, len, handleScript, jsTags,
			safe = context === document && safeFragment,
			ret = [];

		// Ensure that context is a document
		if ( !context || typeof context.createDocumentFragment === "undefined" ) {
			context = document;
		}

		// Use the already-created safe fragment if context permits
		for ( i = 0; (elem = elems[i]) != null; i++ ) {
			if ( typeof elem === "number" ) {
				elem += "";
			}

			if ( !elem ) {
				continue;
			}

			// Convert html string into DOM nodes
			if ( typeof elem === "string" ) {
				if ( !rhtml.test( elem ) ) {
					elem = context.createTextNode( elem );
				} else {
					// Ensure a safe container in which to render the html
					safe = safe || createSafeFragment( context );
					div = context.createElement("div");
					safe.appendChild( div );

					// Fix "XHTML"-style tags in all browsers
					elem = elem.replace(rxhtmlTag, "<$1></$2>");

					// Go to html and back, then peel off extra wrappers
					tag = ( rtagName.exec( elem ) || ["", ""] )[1].toLowerCase();
					wrap = wrapMap[ tag ] || wrapMap._default;
					depth = wrap[0];
					div.innerHTML = wrap[1] + elem + wrap[2];

					// Move to the right depth
					while ( depth-- ) {
						div = div.lastChild;
					}

					// Remove IE's autoinserted <tbody> from table fragments
					if ( !jQuery.support.tbody ) {

						// String was a <table>, *may* have spurious <tbody>
						hasBody = rtbody.test(elem);
							tbody = tag === "table" && !hasBody ?
								div.firstChild && div.firstChild.childNodes :

								// String was a bare <thead> or <tfoot>
								wrap[1] === "<table>" && !hasBody ?
									div.childNodes :
									[];

						for ( j = tbody.length - 1; j >= 0 ; --j ) {
							if ( jQuery.nodeName( tbody[ j ], "tbody" ) && !tbody[ j ].childNodes.length ) {
								tbody[ j ].parentNode.removeChild( tbody[ j ] );
							}
						}
					}

					// IE completely kills leading whitespace when innerHTML is used
					if ( !jQuery.support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {
						div.insertBefore( context.createTextNode( rleadingWhitespace.exec(elem)[0] ), div.firstChild );
					}

					elem = div.childNodes;

					// Take out of fragment container (we need a fresh div each time)
					div.parentNode.removeChild( div );
				}
			}

			if ( elem.nodeType ) {
				ret.push( elem );
			} else {
				jQuery.merge( ret, elem );
			}
		}

		// Fix #11356: Clear elements from safeFragment
		if ( div ) {
			elem = div = safe = null;
		}

		// Reset defaultChecked for any radios and checkboxes
		// about to be appended to the DOM in IE 6/7 (#8060)
		if ( !jQuery.support.appendChecked ) {
			for ( i = 0; (elem = ret[i]) != null; i++ ) {
				if ( jQuery.nodeName( elem, "input" ) ) {
					fixDefaultChecked( elem );
				} else if ( typeof elem.getElementsByTagName !== "undefined" ) {
					jQuery.grep( elem.getElementsByTagName("input"), fixDefaultChecked );
				}
			}
		}

		// Append elements to a provided document fragment
		if ( fragment ) {
			// Special handling of each script element
			handleScript = function( elem ) {
				// Check if we consider it executable
				if ( !elem.type || rscriptType.test( elem.type ) ) {
					// Detach the script and store it in the scripts array (if provided) or the fragment
					// Return truthy to indicate that it has been handled
					return scripts ?
						scripts.push( elem.parentNode ? elem.parentNode.removeChild( elem ) : elem ) :
						fragment.appendChild( elem );
				}
			};

			for ( i = 0; (elem = ret[i]) != null; i++ ) {
				// Check if we're done after handling an executable script
				if ( !( jQuery.nodeName( elem, "script" ) && handleScript( elem ) ) ) {
					// Append to fragment and handle embedded scripts
					fragment.appendChild( elem );
					if ( typeof elem.getElementsByTagName !== "undefined" ) {
						// handleScript alters the DOM, so use jQuery.merge to ensure snapshot iteration
						jsTags = jQuery.grep( jQuery.merge( [], elem.getElementsByTagName("script") ), handleScript );

						// Splice the scripts into ret after their former ancestor and advance our index beyond them
						ret.splice.apply( ret, [i + 1, 0].concat( jsTags ) );
						i += jsTags.length;
					}
				}
			}
		}

		return ret;
	},

	cleanData: function( elems, /* internal */ acceptData ) {
		var data, id, elem, type,
			i = 0,
			internalKey = jQuery.expando,
			cache = jQuery.cache,
			deleteExpando = jQuery.support.deleteExpando,
			special = jQuery.event.special;

		for ( ; (elem = elems[i]) != null; i++ ) {

			if ( acceptData || jQuery.acceptData( elem ) ) {

				id = elem[ internalKey ];
				data = id && cache[ id ];

				if ( data ) {
					if ( data.events ) {
						for ( type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
					}

					// Remove cache only if it was not already removed by jQuery.event.remove
					if ( cache[ id ] ) {

						delete cache[ id ];

						// IE does not allow us to delete expando properties from nodes,
						// nor does it have a removeAttribute function on Document nodes;
						// we must handle all of these cases
						if ( deleteExpando ) {
							delete elem[ internalKey ];

						} else if ( elem.removeAttribute ) {
							elem.removeAttribute( internalKey );

						} else {
							elem[ internalKey ] = null;
						}

						jQuery.deletedIds.push( id );
					}
				}
			}
		}
	}
});
// Limit scope pollution from any deprecated API
(function() {

var matched, browser;

// Use of jQuery.browser is frowned upon.
// More details: http://api.jquery.com/jQuery.browser
// jQuery.uaMatch maintained for back-compat
jQuery.uaMatch = function( ua ) {
	ua = ua.toLowerCase();

	var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
		/(webkit)[ \/]([\w.]+)/.exec( ua ) ||
		/(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
		/(msie) ([\w.]+)/.exec( ua ) ||
		ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
		[];

	return {
		browser: match[ 1 ] || "",
		version: match[ 2 ] || "0"
	};
};

matched = jQuery.uaMatch( navigator.userAgent );
browser = {};

if ( matched.browser ) {
	browser[ matched.browser ] = true;
	browser.version = matched.version;
}

// Chrome is Webkit, but Webkit is also Safari.
if ( browser.chrome ) {
	browser.webkit = true;
} else if ( browser.webkit ) {
	browser.safari = true;
}

jQuery.browser = browser;

jQuery.sub = function() {
	function jQuerySub( selector, context ) {
		return new jQuerySub.fn.init( selector, context );
	}
	jQuery.extend( true, jQuerySub, this );
	jQuerySub.superclass = this;
	jQuerySub.fn = jQuerySub.prototype = this();
	jQuerySub.fn.constructor = jQuerySub;
	jQuerySub.sub = this.sub;
	jQuerySub.fn.init = function init( selector, context ) {
		if ( context && context instanceof jQuery && !(context instanceof jQuerySub) ) {
			context = jQuerySub( context );
		}

		return jQuery.fn.init.call( this, selector, context, rootjQuerySub );
	};
	jQuerySub.fn.init.prototype = jQuerySub.fn;
	var rootjQuerySub = jQuerySub(document);
	return jQuerySub;
};

})();
var curCSS, iframe, iframeDoc,
	ralpha = /alpha\([^)]*\)/i,
	ropacity = /opacity=([^)]*)/,
	rposition = /^(top|right|bottom|left)$/,
	// swappable if display is none or starts with table except "table", "table-cell", or "table-caption"
	// see here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	rmargin = /^margin/,
	rnumsplit = new RegExp( "^(" + core_pnum + ")(.*)$", "i" ),
	rnumnonpx = new RegExp( "^(" + core_pnum + ")(?!px)[a-z%]+$", "i" ),
	rrelNum = new RegExp( "^([-+])=(" + core_pnum + ")", "i" ),
	elemdisplay = { BODY: "block" },

	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: 0,
		fontWeight: 400
	},

	cssExpand = [ "Top", "Right", "Bottom", "Left" ],
	cssPrefixes = [ "Webkit", "O", "Moz", "ms" ],

	eventsToggle = jQuery.fn.toggle;

// return a css property mapped to a potentially vendor prefixed property
function vendorPropName( style, name ) {

	// shortcut for names that are not vendor prefixed
	if ( name in style ) {
		return name;
	}

	// check for vendor prefixed names
	var capName = name.charAt(0).toUpperCase() + name.slice(1),
		origName = name,
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in style ) {
			return name;
		}
	}

	return origName;
}

function isHidden( elem, el ) {
	elem = el || elem;
	return jQuery.css( elem, "display" ) === "none" || !jQuery.contains( elem.ownerDocument, elem );
}

function showHide( elements, show ) {
	var elem, display,
		values = [],
		index = 0,
		length = elements.length;

	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}
		values[ index ] = jQuery._data( elem, "olddisplay" );
		if ( show ) {
			// Reset the inline display of this element to learn if it is
			// being hidden by cascaded rules or not
			if ( !values[ index ] && elem.style.display === "none" ) {
				elem.style.display = "";
			}

			// Set elements which have been overridden with display: none
			// in a stylesheet to whatever the default browser style is
			// for such an element
			if ( elem.style.display === "" && isHidden( elem ) ) {
				values[ index ] = jQuery._data( elem, "olddisplay", css_defaultDisplay(elem.nodeName) );
			}
		} else {
			display = curCSS( elem, "display" );

			if ( !values[ index ] && display !== "none" ) {
				jQuery._data( elem, "olddisplay", display );
			}
		}
	}

	// Set the display of most of the elements in a second loop
	// to avoid the constant reflow
	for ( index = 0; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}
		if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
			elem.style.display = show ? values[ index ] || "" : "none";
		}
	}

	return elements;
}

jQuery.fn.extend({
	css: function( name, value ) {
		return jQuery.access( this, function( elem, name, value ) {
			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	},
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state, fn2 ) {
		var bool = typeof state === "boolean";

		if ( jQuery.isFunction( state ) && jQuery.isFunction( fn2 ) ) {
			return eventsToggle.apply( this, arguments );
		}

		return this.each(function() {
			if ( bool ? state : isHidden( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		});
	}
});

jQuery.extend({
	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {
					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;

				}
			}
		}
	},

	// Exclude the following css properties to add px
	cssNumber: {
		"fillOpacity": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {
		// normalize float css property
		"float": jQuery.support.cssFloat ? "cssFloat" : "styleFloat"
	},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {
		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = jQuery.camelCase( name ),
			style = elem.style;

		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( style, origName ) );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// convert relative number strings (+= or -=) to relative numbers. #7345
			if ( type === "string" && (ret = rrelNum.exec( value )) ) {
				value = ( ret[1] + 1 ) * ret[2] + parseFloat( jQuery.css( elem, name ) );
				// Fixes bug #9237
				type = "number";
			}

			// Make sure that NaN and null values aren't set. See: #7116
			if ( value == null || type === "number" && isNaN( value ) ) {
				return;
			}

			// If a number was passed in, add 'px' to the (except for certain CSS properties)
			if ( type === "number" && !jQuery.cssNumber[ origName ] ) {
				value += "px";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !("set" in hooks) || (value = hooks.set( elem, value, extra )) !== undefined ) {
				// Wrapped to prevent IE from throwing errors when 'invalid' values are provided
				// Fixes bug #5509
				try {
					style[ name ] = value;
				} catch(e) {}
			}

		} else {
			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {
				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, numeric, extra ) {
		var val, num, hooks,
			origName = jQuery.camelCase( name );

		// Make sure that we're working with the right name
		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( elem.style, origName ) );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name );
		}

		//convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Return, converting to number if forced or a qualifier was provided and val looks numeric
		if ( numeric || extra !== undefined ) {
			num = parseFloat( val );
			return numeric || jQuery.isNumeric( num ) ? num || 0 : val;
		}
		return val;
	},

	// A method for quickly swapping in/out CSS properties to get correct calculations
	swap: function( elem, options, callback ) {
		var ret, name,
			old = {};

		// Remember the old values, and insert the new ones
		for ( name in options ) {
			old[ name ] = elem.style[ name ];
			elem.style[ name ] = options[ name ];
		}

		ret = callback.call( elem );

		// Revert the old values
		for ( name in options ) {
			elem.style[ name ] = old[ name ];
		}

		return ret;
	}
});

// NOTE: To any future maintainer, we've window.getComputedStyle
// because jsdom on node.js will break without it.
if ( window.getComputedStyle ) {
	curCSS = function( elem, name ) {
		var ret, width, minWidth, maxWidth,
			computed = window.getComputedStyle( elem, null ),
			style = elem.style;

		if ( computed ) {

			// getPropertyValue is only needed for .css('filter') in IE9, see #12537
			ret = computed.getPropertyValue( name ) || computed[ name ];

			if ( ret === "" && !jQuery.contains( elem.ownerDocument, elem ) ) {
				ret = jQuery.style( elem, name );
			}

			// A tribute to the "awesome hack by Dean Edwards"
			// Chrome < 17 and Safari 5.0 uses "computed value" instead of "used value" for margin-right
			// Safari 5.1.7 (at least) returns percentage for a larger set of values, but width seems to be reliably pixels
			// this is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values
			if ( rnumnonpx.test( ret ) && rmargin.test( name ) ) {
				width = style.width;
				minWidth = style.minWidth;
				maxWidth = style.maxWidth;

				style.minWidth = style.maxWidth = style.width = ret;
				ret = computed.width;

				style.width = width;
				style.minWidth = minWidth;
				style.maxWidth = maxWidth;
			}
		}

		return ret;
	};
} else if ( document.documentElement.currentStyle ) {
	curCSS = function( elem, name ) {
		var left, rsLeft,
			ret = elem.currentStyle && elem.currentStyle[ name ],
			style = elem.style;

		// Avoid setting ret to empty string here
		// so we don't default to auto
		if ( ret == null && style && style[ name ] ) {
			ret = style[ name ];
		}

		// From the awesome hack by Dean Edwards
		// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

		// If we're not dealing with a regular pixel number
		// but a number that has a weird ending, we need to convert it to pixels
		// but not position css attributes, as those are proportional to the parent element instead
		// and we can't measure the parent instead because it might trigger a "stacking dolls" problem
		if ( rnumnonpx.test( ret ) && !rposition.test( name ) ) {

			// Remember the original values
			left = style.left;
			rsLeft = elem.runtimeStyle && elem.runtimeStyle.left;

			// Put in the new values to get a computed value out
			if ( rsLeft ) {
				elem.runtimeStyle.left = elem.currentStyle.left;
			}
			style.left = name === "fontSize" ? "1em" : ret;
			ret = style.pixelLeft + "px";

			// Revert the changed values
			style.left = left;
			if ( rsLeft ) {
				elem.runtimeStyle.left = rsLeft;
			}
		}

		return ret === "" ? "auto" : ret;
	};
}

function setPositiveNumber( elem, value, subtract ) {
	var matches = rnumsplit.exec( value );
	return matches ?
			Math.max( 0, matches[ 1 ] - ( subtract || 0 ) ) + ( matches[ 2 ] || "px" ) :
			value;
}

function augmentWidthOrHeight( elem, name, extra, isBorderBox ) {
	var i = extra === ( isBorderBox ? "border" : "content" ) ?
		// If we already have the right measurement, avoid augmentation
		4 :
		// Otherwise initialize for horizontal or vertical properties
		name === "width" ? 1 : 0,

		val = 0;

	for ( ; i < 4; i += 2 ) {
		// both box models exclude margin, so add it if we want it
		if ( extra === "margin" ) {
			// we use jQuery.css instead of curCSS here
			// because of the reliableMarginRight CSS hook!
			val += jQuery.css( elem, extra + cssExpand[ i ], true );
		}

		// From this point on we use curCSS for maximum performance (relevant in animations)
		if ( isBorderBox ) {
			// border-box includes padding, so remove it if we want content
			if ( extra === "content" ) {
				val -= parseFloat( curCSS( elem, "padding" + cssExpand[ i ] ) ) || 0;
			}

			// at this point, extra isn't border nor margin, so remove border
			if ( extra !== "margin" ) {
				val -= parseFloat( curCSS( elem, "border" + cssExpand[ i ] + "Width" ) ) || 0;
			}
		} else {
			// at this point, extra isn't content, so add padding
			val += parseFloat( curCSS( elem, "padding" + cssExpand[ i ] ) ) || 0;

			// at this point, extra isn't content nor padding, so add border
			if ( extra !== "padding" ) {
				val += parseFloat( curCSS( elem, "border" + cssExpand[ i ] + "Width" ) ) || 0;
			}
		}
	}

	return val;
}

function getWidthOrHeight( elem, name, extra ) {

	// Start with offset property, which is equivalent to the border-box value
	var val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
		valueIsBorderBox = true,
		isBorderBox = jQuery.support.boxSizing && jQuery.css( elem, "boxSizing" ) === "border-box";

	// some non-html elements return undefined for offsetWidth, so check for null/undefined
	// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
	// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
	if ( val <= 0 || val == null ) {
		// Fall back to computed then uncomputed css if necessary
		val = curCSS( elem, name );
		if ( val < 0 || val == null ) {
			val = elem.style[ name ];
		}

		// Computed unit is not pixels. Stop here and return.
		if ( rnumnonpx.test(val) ) {
			return val;
		}

		// we need the check for style in case a browser which returns unreliable values
		// for getComputedStyle silently falls back to the reliable elem.style
		valueIsBorderBox = isBorderBox && ( jQuery.support.boxSizingReliable || val === elem.style[ name ] );

		// Normalize "", auto, and prepare for extra
		val = parseFloat( val ) || 0;
	}

	// use the active box-sizing model to add/subtract irrelevant styles
	return ( val +
		augmentWidthOrHeight(
			elem,
			name,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox
		)
	) + "px";
}


// Try to determine the default display value of an element
function css_defaultDisplay( nodeName ) {
	if ( elemdisplay[ nodeName ] ) {
		return elemdisplay[ nodeName ];
	}

	var elem = jQuery( "<" + nodeName + ">" ).appendTo( document.body ),
		display = elem.css("display");
	elem.remove();

	// If the simple way fails,
	// get element's real default display by attaching it to a temp iframe
	if ( display === "none" || display === "" ) {
		// Use the already-created iframe if possible
		iframe = document.body.appendChild(
			iframe || jQuery.extend( document.createElement("iframe"), {
				frameBorder: 0,
				width: 0,
				height: 0
			})
		);

		// Create a cacheable copy of the iframe document on first call.
		// IE and Opera will allow us to reuse the iframeDoc without re-writing the fake HTML
		// document to it; WebKit & Firefox won't allow reusing the iframe document.
		if ( !iframeDoc || !iframe.createElement ) {
			iframeDoc = ( iframe.contentWindow || iframe.contentDocument ).document;
			iframeDoc.write("<!doctype html><html><body>");
			iframeDoc.close();
		}

		elem = iframeDoc.body.appendChild( iframeDoc.createElement(nodeName) );

		display = curCSS( elem, "display" );
		document.body.removeChild( iframe );
	}

	// Store the correct default display
	elemdisplay[ nodeName ] = display;

	return display;
}

jQuery.each([ "height", "width" ], function( i, name ) {
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {
				// certain elements can have dimension info if we invisibly show them
				// however, it must have a current display style that would benefit from this
				if ( elem.offsetWidth === 0 && rdisplayswap.test( curCSS( elem, "display" ) ) ) {
					return jQuery.swap( elem, cssShow, function() {
						return getWidthOrHeight( elem, name, extra );
					});
				} else {
					return getWidthOrHeight( elem, name, extra );
				}
			}
		},

		set: function( elem, value, extra ) {
			return setPositiveNumber( elem, value, extra ?
				augmentWidthOrHeight(
					elem,
					name,
					extra,
					jQuery.support.boxSizing && jQuery.css( elem, "boxSizing" ) === "border-box"
				) : 0
			);
		}
	};
});

if ( !jQuery.support.opacity ) {
	jQuery.cssHooks.opacity = {
		get: function( elem, computed ) {
			// IE uses filters for opacity
			return ropacity.test( (computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || "" ) ?
				( 0.01 * parseFloat( RegExp.$1 ) ) + "" :
				computed ? "1" : "";
		},

		set: function( elem, value ) {
			var style = elem.style,
				currentStyle = elem.currentStyle,
				opacity = jQuery.isNumeric( value ) ? "alpha(opacity=" + value * 100 + ")" : "",
				filter = currentStyle && currentStyle.filter || style.filter || "";

			// IE has trouble with opacity if it does not have layout
			// Force it by setting the zoom level
			style.zoom = 1;

			// if setting opacity to 1, and no other filters exist - attempt to remove filter attribute #6652
			if ( value >= 1 && jQuery.trim( filter.replace( ralpha, "" ) ) === "" &&
				style.removeAttribute ) {

				// Setting style.filter to null, "" & " " still leave "filter:" in the cssText
				// if "filter:" is present at all, clearType is disabled, we want to avoid this
				// style.removeAttribute is IE Only, but so apparently is this code path...
				style.removeAttribute( "filter" );

				// if there there is no filter style applied in a css rule, we are done
				if ( currentStyle && !currentStyle.filter ) {
					return;
				}
			}

			// otherwise, set new filter values
			style.filter = ralpha.test( filter ) ?
				filter.replace( ralpha, opacity ) :
				filter + " " + opacity;
		}
	};
}

// These hooks cannot be added until DOM ready because the support test
// for it is not run until after DOM ready
jQuery(function() {
	if ( !jQuery.support.reliableMarginRight ) {
		jQuery.cssHooks.marginRight = {
			get: function( elem, computed ) {
				// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
				// Work around by temporarily setting element display to inline-block
				return jQuery.swap( elem, { "display": "inline-block" }, function() {
					if ( computed ) {
						return curCSS( elem, "marginRight" );
					}
				});
			}
		};
	}

	// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
	// getComputedStyle returns percent when specified for top/left/bottom/right
	// rather than make the css module depend on the offset module, we just check for it here
	if ( !jQuery.support.pixelPosition && jQuery.fn.position ) {
		jQuery.each( [ "top", "left" ], function( i, prop ) {
			jQuery.cssHooks[ prop ] = {
				get: function( elem, computed ) {
					if ( computed ) {
						var ret = curCSS( elem, prop );
						// if curCSS returns percentage, fallback to offset
						return rnumnonpx.test( ret ) ? jQuery( elem ).position()[ prop ] + "px" : ret;
					}
				}
			};
		});
	}

});

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.hidden = function( elem ) {
		return ( elem.offsetWidth === 0 && elem.offsetHeight === 0 ) || (!jQuery.support.reliableHiddenOffsets && ((elem.style && elem.style.display) || curCSS( elem, "display" )) === "none");
	};

	jQuery.expr.filters.visible = function( elem ) {
		return !jQuery.expr.filters.hidden( elem );
	};
}

// These hooks are used by animate to expand properties
jQuery.each({
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i,

				// assumes a single number if not a string
				parts = typeof value === "string" ? value.split(" ") : [ value ],
				expanded = {};

			for ( i = 0; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( !rmargin.test( prefix ) ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
});
var r20 = /%20/g,
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rinput = /^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,
	rselectTextarea = /^(?:select|textarea)/i;

jQuery.fn.extend({
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map(function(){
			return this.elements ? jQuery.makeArray( this.elements ) : this;
		})
		.filter(function(){
			return this.name && !this.disabled &&
				( this.checked || rselectTextarea.test( this.nodeName ) ||
					rinput.test( this.type ) );
		})
		.map(function( i, elem ){
			var val = jQuery( this ).val();

			return val == null ?
				null :
				jQuery.isArray( val ) ?
					jQuery.map( val, function( val, i ){
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					}) :
					{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		}).get();
	}
});

//Serialize an array of form elements or a set of
//key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, value ) {
			// If value is a function, invoke it and return its value
			value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
			s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
		};

	// Set traditional to true for jQuery <= 1.3.2 behavior.
	if ( traditional === undefined ) {
		traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
	}

	// If an array was passed in, assume that it is an array of form elements.
	if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		});

	} else {
		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" ).replace( r20, "+" );
};

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( jQuery.isArray( obj ) ) {
		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {
				// Treat each array item as a scalar.
				add( prefix, v );

			} else {
				// If array item is non-scalar (array or object), encode its
				// numeric index to resolve deserialization ambiguity issues.
				// Note that rack (as of 1.0.0) can't currently deserialize
				// nested arrays properly, and attempting to do so may cause
				// a server error. Possible fixes are to modify rack's
				// deserialization algorithm or to provide an option or flag
				// to force array serialization to be shallow.
				buildParams( prefix + "[" + ( typeof v === "object" ? i : "" ) + "]", v, traditional, add );
			}
		});

	} else if ( !traditional && jQuery.type( obj ) === "object" ) {
		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {
		// Serialize scalar item.
		add( prefix, obj );
	}
}
var
	// Document location
	ajaxLocParts,
	ajaxLocation,

	rhash = /#.*$/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg, // IE leaves an \r character at EOL
	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,
	rquery = /\?/,
	rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
	rts = /([?&])_=[^&]*/,
	rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,

	// Keep a copy of the old load method
	_load = jQuery.fn.load,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = ["*/"] + ["*"];

// #8138, IE may throw an exception when accessing
// a field from window.location if document.domain has been set
try {
	ajaxLocation = location.href;
} catch( e ) {
	// Use the href attribute of an A element
	// since IE will modify it given document.location
	ajaxLocation = document.createElement( "a" );
	ajaxLocation.href = "";
	ajaxLocation = ajaxLocation.href;
}

// Segment location into parts
ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType, list, placeBefore,
			dataTypes = dataTypeExpression.toLowerCase().split( core_rspace ),
			i = 0,
			length = dataTypes.length;

		if ( jQuery.isFunction( func ) ) {
			// For each dataType in the dataTypeExpression
			for ( ; i < length; i++ ) {
				dataType = dataTypes[ i ];
				// We control if we're asked to add before
				// any existing element
				placeBefore = /^\+/.test( dataType );
				if ( placeBefore ) {
					dataType = dataType.substr( 1 ) || "*";
				}
				list = structure[ dataType ] = structure[ dataType ] || [];
				// then we add to the structure accordingly
				list[ placeBefore ? "unshift" : "push" ]( func );
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR,
		dataType /* internal */, inspected /* internal */ ) {

	dataType = dataType || options.dataTypes[ 0 ];
	inspected = inspected || {};

	inspected[ dataType ] = true;

	var selection,
		list = structure[ dataType ],
		i = 0,
		length = list ? list.length : 0,
		executeOnly = ( structure === prefilters );

	for ( ; i < length && ( executeOnly || !selection ); i++ ) {
		selection = list[ i ]( options, originalOptions, jqXHR );
		// If we got redirected to another dataType
		// we try there if executing only and not done already
		if ( typeof selection === "string" ) {
			if ( !executeOnly || inspected[ selection ] ) {
				selection = undefined;
			} else {
				options.dataTypes.unshift( selection );
				selection = inspectPrefiltersOrTransports(
						structure, options, originalOptions, jqXHR, selection, inspected );
			}
		}
	}
	// If we're only executing or nothing was selected
	// we try the catchall dataType if not done already
	if ( ( executeOnly || !selection ) && !inspected[ "*" ] ) {
		selection = inspectPrefiltersOrTransports(
				structure, options, originalOptions, jqXHR, "*", inspected );
	}
	// unnecessary when only executing (prefilters)
	// but it'll be ignored by the caller in that case
	return selection;
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var key, deep,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};
	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}
}

jQuery.fn.load = function( url, params, callback ) {
	if ( typeof url !== "string" && _load ) {
		return _load.apply( this, arguments );
	}

	// Don't do a request if no elements are being requested
	if ( !this.length ) {
		return this;
	}

	var selector, type, response,
		self = this,
		off = url.indexOf(" ");

	if ( off >= 0 ) {
		selector = url.slice( off, url.length );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( jQuery.isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// Request the remote document
	jQuery.ajax({
		url: url,

		// if "type" variable is undefined, then "GET" method will be used
		type: type,
		dataType: "html",
		data: params,
		complete: function( jqXHR, status ) {
			if ( callback ) {
				self.each( callback, response || [ jqXHR.responseText, status, jqXHR ] );
			}
		}
	}).done(function( responseText ) {

		// Save response for use in complete callback
		response = arguments;

		// See if a selector was specified
		self.html( selector ?

			// Create a dummy div to hold the results
			jQuery("<div>")

				// inject the contents of the document in, removing the scripts
				// to avoid any 'Permission Denied' errors in IE
				.append( responseText.replace( rscript, "" ) )

				// Locate the specified elements
				.find( selector ) :

			// If not, just inject the full result
			responseText );

	});

	return this;
};

// Attach a bunch of functions for handling common AJAX events
jQuery.each( "ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split( " " ), function( i, o ){
	jQuery.fn[ o ] = function( f ){
		return this.on( o, f );
	};
});

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {
		// shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		return jQuery.ajax({
			type: method,
			url: url,
			data: data,
			success: callback,
			dataType: type
		});
	};
});

jQuery.extend({

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		if ( settings ) {
			// Building a settings object
			ajaxExtend( target, jQuery.ajaxSettings );
		} else {
			// Extending ajaxSettings
			settings = target;
			target = jQuery.ajaxSettings;
		}
		ajaxExtend( target, settings );
		return target;
	},

	ajaxSettings: {
		url: ajaxLocation,
		isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
		global: true,
		type: "GET",
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		processData: true,
		async: true,
		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			xml: "application/xml, text/xml",
			html: "text/html",
			text: "text/plain",
			json: "application/json, text/javascript",
			"*": allTypes
		},

		contents: {
			xml: /xml/,
			html: /html/,
			json: /json/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText"
		},

		// List of data converters
		// 1) key format is "source_type destination_type" (a single space in-between)
		// 2) the catchall symbol "*" can be used for source_type
		converters: {

			// Convert anything to text
			"* text": window.String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": jQuery.parseJSON,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			context: true,
			url: true
		}
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var // ifModified key
			ifModifiedKey,
			// Response headers
			responseHeadersString,
			responseHeaders,
			// transport
			transport,
			// timeout handle
			timeoutTimer,
			// Cross-domain detection vars
			parts,
			// To know if global events are to be dispatched
			fireGlobals,
			// Loop variable
			i,
			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),
			// Callbacks context
			callbackContext = s.context || s,
			// Context for global events
			// It's the callbackContext if one was provided in the options
			// and if it's a DOM node or a jQuery collection
			globalEventContext = callbackContext !== s &&
				( callbackContext.nodeType || callbackContext instanceof jQuery ) ?
						jQuery( callbackContext ) : jQuery.event,
			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks( "once memory" ),
			// Status-dependent callbacks
			statusCode = s.statusCode || {},
			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},
			// The jqXHR state
			state = 0,
			// Default abort message
			strAbort = "canceled",
			// Fake xhr
			jqXHR = {

				readyState: 0,

				// Caches the header
				setRequestHeader: function( name, value ) {
					if ( !state ) {
						var lname = name.toLowerCase();
						name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return state === 2 ? responseHeadersString : null;
				},

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( state === 2 ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while( ( match = rheaders.exec( responseHeadersString ) ) ) {
								responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match === undefined ? null : match;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( !state ) {
						s.mimeType = type;
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					statusText = statusText || strAbort;
					if ( transport ) {
						transport.abort( statusText );
					}
					done( 0, statusText );
					return this;
				}
			};

		// Callback for when everything is done
		// It is defined here because jslint complains if it is declared
		// at the end of the function (which would be more logical and readable)
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Called once
			if ( state === 2 ) {
				return;
			}

			// State is "done" now
			state = 2;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// If successful, handle type chaining
			if ( status >= 200 && status < 300 || status === 304 ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {

					modified = jqXHR.getResponseHeader("Last-Modified");
					if ( modified ) {
						jQuery.lastModified[ ifModifiedKey ] = modified;
					}
					modified = jqXHR.getResponseHeader("Etag");
					if ( modified ) {
						jQuery.etag[ ifModifiedKey ] = modified;
					}
				}

				// If not modified
				if ( status === 304 ) {

					statusText = "notmodified";
					isSuccess = true;

				// If we have data
				} else {

					isSuccess = ajaxConvert( s, response );
					statusText = isSuccess.state;
					success = isSuccess.data;
					error = isSuccess.error;
					isSuccess = !error;
				}
			} else {
				// We extract error from statusText
				// then normalize statusText and status for non-aborts
				error = statusText;
				if ( !statusText || status ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajax" + ( isSuccess ? "Success" : "Error" ),
						[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );
				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger( "ajaxStop" );
				}
			}
		}

		// Attach deferreds
		deferred.promise( jqXHR );
		jqXHR.success = jqXHR.done;
		jqXHR.error = jqXHR.fail;
		jqXHR.complete = completeDeferred.add;

		// Status-dependent callbacks
		jqXHR.statusCode = function( map ) {
			if ( map ) {
				var tmp;
				if ( state < 2 ) {
					for ( tmp in map ) {
						statusCode[ tmp ] = [ statusCode[tmp], map[tmp] ];
					}
				} else {
					tmp = map[ jqXHR.status ];
					jqXHR.always( tmp );
				}
			}
			return this;
		};

		// Remove hash character (#7531: and string promotion)
		// Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
		// We also use the url parameter if available
		s.url = ( ( url || s.url ) + "" ).replace( rhash, "" ).replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

		// Extract dataTypes list
		s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().split( core_rspace );

		// A cross-domain request is in order when we have a protocol:host:port mismatch
		if ( s.crossDomain == null ) {
			parts = rurl.exec( s.url.toLowerCase() );
			s.crossDomain = !!( parts &&
				( parts[ 1 ] !== ajaxLocParts[ 1 ] || parts[ 2 ] !== ajaxLocParts[ 2 ] ||
					( parts[ 3 ] || ( parts[ 1 ] === "http:" ? 80 : 443 ) ) !=
						( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? 80 : 443 ) ) )
			);
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( state === 2 ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		fireGlobals = s.global;

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger( "ajaxStart" );
		}

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// If data is available, append data to url
			if ( s.data ) {
				s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.data;
				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Get ifModifiedKey before adding the anti-cache parameter
			ifModifiedKey = s.url;

			// Add anti-cache in url if needed
			if ( s.cache === false ) {

				var ts = jQuery.now(),
					// try replacing _= if it is there
					ret = s.url.replace( rts, "$1_=" + ts );

				// if nothing was replaced, add timestamp to the end
				s.url = ret + ( ( ret === s.url ) ? ( rquery.test( s.url ) ? "&" : "?" ) + "_=" + ts : "" );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			ifModifiedKey = ifModifiedKey || s.url;
			if ( jQuery.lastModified[ ifModifiedKey ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ ifModifiedKey ] );
			}
			if ( jQuery.etag[ ifModifiedKey ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ ifModifiedKey ] );
			}
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
				s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
				// Abort if not done already and return
				return jqXHR.abort();

		}

		// aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		for ( i in { success: 1, error: 1, complete: 1 } ) {
			jqXHR[ i ]( s[ i ] );
		}

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;
			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}
			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = setTimeout( function(){
					jqXHR.abort( "timeout" );
				}, s.timeout );
			}

			try {
				state = 1;
				transport.send( requestHeaders, done );
			} catch (e) {
				// Propagate exception as error if not done
				if ( state < 2 ) {
					done( -1, e );
				// Simply rethrow otherwise
				} else {
					throw e;
				}
			}
		}

		return jqXHR;
	},

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {}

});

/* Handles responses to an ajax request:
 * - sets all responseXXX fields accordingly
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {

	var ct, type, finalDataType, firstDataType,
		contents = s.contents,
		dataTypes = s.dataTypes,
		responseFields = s.responseFields;

	// Fill responseXXX fields
	for ( type in responseFields ) {
		if ( type in responses ) {
			jqXHR[ responseFields[type] ] = responses[ type ];
		}
	}

	// Remove auto dataType and get content-type in the process
	while( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader( "content-type" );
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {
		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[0] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}
		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

// Chain conversions given the request and the original response
function ajaxConvert( s, response ) {

	var conv, conv2, current, tmp,
		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice(),
		prev = dataTypes[ 0 ],
		converters = {},
		i = 0;

	// Apply the dataFilter if provided
	if ( s.dataFilter ) {
		response = s.dataFilter( response, s.dataType );
	}

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	// Convert to each sequential dataType, tolerating list modification
	for ( ; (current = dataTypes[++i]); ) {

		// There's only work to do if current dataType is non-auto
		if ( current !== "*" ) {

			// Convert response if prev dataType is non-auto and differs from current
			if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split(" ");
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {
								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.splice( i--, 0, current );
								}

								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s["throws"] ) {
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return { state: "parsererror", error: conv ? e : "No conversion from " + prev + " to " + current };
						}
					}
				}
			}

			// Update prev for next iteration
			prev = current;
		}
	}

	return { state: "success", data: response };
}
var oldCallbacks = [],
	rquestion = /\?/,
	rjsonp = /(=)\?(?=&|$)|\?\?/,
	nonce = jQuery.now();

// Default jsonp settings
jQuery.ajaxSetup({
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce++ ) );
		this[ callback ] = true;
		return callback;
	}
});

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		data = s.data,
		url = s.url,
		hasCallback = s.jsonp !== false,
		replaceInUrl = hasCallback && rjsonp.test( url ),
		replaceInData = hasCallback && !replaceInUrl && typeof data === "string" &&
			!( s.contentType || "" ).indexOf("application/x-www-form-urlencoded") &&
			rjsonp.test( data );

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( s.dataTypes[ 0 ] === "jsonp" || replaceInUrl || replaceInData ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;
		overwritten = window[ callbackName ];

		// Insert callback into url or form data
		if ( replaceInUrl ) {
			s.url = url.replace( rjsonp, "$1" + callbackName );
		} else if ( replaceInData ) {
			s.data = data.replace( rjsonp, "$1" + callbackName );
		} else if ( hasCallback ) {
			s.url += ( rquestion.test( url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters["script json"] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always(function() {
			// Restore preexisting value
			window[ callbackName ] = overwritten;

			// Save back as free
			if ( s[ callbackName ] ) {
				// make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && jQuery.isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		});

		// Delegate to script
		return "script";
	}
});
// Install script dataType
jQuery.ajaxSetup({
	accepts: {
		script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /javascript|ecmascript/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
});

// Handle cache's special case and global
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
		s.global = false;
	}
});

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function(s) {

	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {

		var script,
			head = document.head || document.getElementsByTagName( "head" )[0] || document.documentElement;

		return {

			send: function( _, callback ) {

				script = document.createElement( "script" );

				script.async = "async";

				if ( s.scriptCharset ) {
					script.charset = s.scriptCharset;
				}

				script.src = s.url;

				// Attach handlers for all browsers
				script.onload = script.onreadystatechange = function( _, isAbort ) {

					if ( isAbort || !script.readyState || /loaded|complete/.test( script.readyState ) ) {

						// Handle memory leak in IE
						script.onload = script.onreadystatechange = null;

						// Remove the script
						if ( head && script.parentNode ) {
							head.removeChild( script );
						}

						// Dereference the script
						script = undefined;

						// Callback if not abort
						if ( !isAbort ) {
							callback( 200, "success" );
						}
					}
				};
				// Use insertBefore instead of appendChild  to circumvent an IE6 bug.
				// This arises when a base node is used (#2709 and #4378).
				head.insertBefore( script, head.firstChild );
			},

			abort: function() {
				if ( script ) {
					script.onload( 0, 1 );
				}
			}
		};
	}
});
var xhrCallbacks,
	// #5280: Internet Explorer will keep connections alive if we don't abort on unload
	xhrOnUnloadAbort = window.ActiveXObject ? function() {
		// Abort all pending requests
		for ( var key in xhrCallbacks ) {
			xhrCallbacks[ key ]( 0, 1 );
		}
	} : false,
	xhrId = 0;

// Functions to create xhrs
function createStandardXHR() {
	try {
		return new window.XMLHttpRequest();
	} catch( e ) {}
}

function createActiveXHR() {
	try {
		return new window.ActiveXObject( "Microsoft.XMLHTTP" );
	} catch( e ) {}
}

// Create the request object
// (This is still attached to ajaxSettings for backward compatibility)
jQuery.ajaxSettings.xhr = window.ActiveXObject ?
	/* Microsoft failed to properly
	 * implement the XMLHttpRequest in IE7 (can't request local files),
	 * so we use the ActiveXObject when it is available
	 * Additionally XMLHttpRequest can be disabled in IE7/IE8 so
	 * we need a fallback.
	 */
	function() {
		return !this.isLocal && createStandardXHR() || createActiveXHR();
	} :
	// For all other browsers, use the standard XMLHttpRequest object
	createStandardXHR;

// Determine support properties
(function( xhr ) {
	jQuery.extend( jQuery.support, {
		ajax: !!xhr,
		cors: !!xhr && ( "withCredentials" in xhr )
	});
})( jQuery.ajaxSettings.xhr() );

// Create transport if the browser can provide an xhr
if ( jQuery.support.ajax ) {

	jQuery.ajaxTransport(function( s ) {
		// Cross domain only allowed if supported through XMLHttpRequest
		if ( !s.crossDomain || jQuery.support.cors ) {

			var callback;

			return {
				send: function( headers, complete ) {

					// Get a new xhr
					var handle, i,
						xhr = s.xhr();

					// Open the socket
					// Passing null username, generates a login popup on Opera (#2865)
					if ( s.username ) {
						xhr.open( s.type, s.url, s.async, s.username, s.password );
					} else {
						xhr.open( s.type, s.url, s.async );
					}

					// Apply custom fields if provided
					if ( s.xhrFields ) {
						for ( i in s.xhrFields ) {
							xhr[ i ] = s.xhrFields[ i ];
						}
					}

					// Override mime type if needed
					if ( s.mimeType && xhr.overrideMimeType ) {
						xhr.overrideMimeType( s.mimeType );
					}

					// X-Requested-With header
					// For cross-domain requests, seeing as conditions for a preflight are
					// akin to a jigsaw puzzle, we simply never set it to be sure.
					// (it can always be set on a per-request basis or even using ajaxSetup)
					// For same-domain requests, won't change header if already provided.
					if ( !s.crossDomain && !headers["X-Requested-With"] ) {
						headers[ "X-Requested-With" ] = "XMLHttpRequest";
					}

					// Need an extra try/catch for cross domain requests in Firefox 3
					try {
						for ( i in headers ) {
							xhr.setRequestHeader( i, headers[ i ] );
						}
					} catch( _ ) {}

					// Do send the request
					// This may raise an exception which is actually
					// handled in jQuery.ajax (so no try/catch here)
					xhr.send( ( s.hasContent && s.data ) || null );

					// Listener
					callback = function( _, isAbort ) {

						var status,
							statusText,
							responseHeaders,
							responses,
							xml;

						// Firefox throws exceptions when accessing properties
						// of an xhr when a network error occurred
						// http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)
						try {

							// Was never called and is aborted or complete
							if ( callback && ( isAbort || xhr.readyState === 4 ) ) {

								// Only called once
								callback = undefined;

								// Do not keep as active anymore
								if ( handle ) {
									xhr.onreadystatechange = jQuery.noop;
									if ( xhrOnUnloadAbort ) {
										delete xhrCallbacks[ handle ];
									}
								}

								// If it's an abort
								if ( isAbort ) {
									// Abort it manually if needed
									if ( xhr.readyState !== 4 ) {
										xhr.abort();
									}
								} else {
									status = xhr.status;
									responseHeaders = xhr.getAllResponseHeaders();
									responses = {};
									xml = xhr.responseXML;

									// Construct response list
									if ( xml && xml.documentElement /* #4958 */ ) {
										responses.xml = xml;
									}

									// When requesting binary data, IE6-9 will throw an exception
									// on any attempt to access responseText (#11426)
									try {
										responses.text = xhr.responseText;
									} catch( e ) {
									}

									// Firefox throws an exception when accessing
									// statusText for faulty cross-domain requests
									try {
										statusText = xhr.statusText;
									} catch( e ) {
										// We normalize with Webkit giving an empty statusText
										statusText = "";
									}

									// Filter status for non standard behaviors

									// If the request is local and we have data: assume a success
									// (success with no data won't get notified, that's the best we
									// can do given current implementations)
									if ( !status && s.isLocal && !s.crossDomain ) {
										status = responses.text ? 200 : 404;
									// IE - #1450: sometimes returns 1223 when it should be 204
									} else if ( status === 1223 ) {
										status = 204;
									}
								}
							}
						} catch( firefoxAccessException ) {
							if ( !isAbort ) {
								complete( -1, firefoxAccessException );
							}
						}

						// Call complete if needed
						if ( responses ) {
							complete( status, statusText, responses, responseHeaders );
						}
					};

					if ( !s.async ) {
						// if we're in sync mode we fire the callback
						callback();
					} else if ( xhr.readyState === 4 ) {
						// (IE6 & IE7) if it's in cache and has been
						// retrieved directly we need to fire the callback
						setTimeout( callback, 0 );
					} else {
						handle = ++xhrId;
						if ( xhrOnUnloadAbort ) {
							// Create the active xhrs callbacks list if needed
							// and attach the unload handler
							if ( !xhrCallbacks ) {
								xhrCallbacks = {};
								jQuery( window ).unload( xhrOnUnloadAbort );
							}
							// Add to list of active xhrs callbacks
							xhrCallbacks[ handle ] = callback;
						}
						xhr.onreadystatechange = callback;
					}
				},

				abort: function() {
					if ( callback ) {
						callback(0,1);
					}
				}
			};
		}
	});
}
var fxNow, timerId,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rfxnum = new RegExp( "^(?:([-+])=|)(" + core_pnum + ")([a-z%]*)$", "i" ),
	rrun = /queueHooks$/,
	animationPrefilters = [ defaultPrefilter ],
	tweeners = {
		"*": [function( prop, value ) {
			var end, unit,
				tween = this.createTween( prop, value ),
				parts = rfxnum.exec( value ),
				target = tween.cur(),
				start = +target || 0,
				scale = 1,
				maxIterations = 20;

			if ( parts ) {
				end = +parts[2];
				unit = parts[3] || ( jQuery.cssNumber[ prop ] ? "" : "px" );

				// We need to compute starting value
				if ( unit !== "px" && start ) {
					// Iteratively approximate from a nonzero starting point
					// Prefer the current property, because this process will be trivial if it uses the same units
					// Fallback to end or a simple constant
					start = jQuery.css( tween.elem, prop, true ) || end || 1;

					do {
						// If previous iteration zeroed out, double until we get *something*
						// Use a string for doubling factor so we don't accidentally see scale as unchanged below
						scale = scale || ".5";

						// Adjust and apply
						start = start / scale;
						jQuery.style( tween.elem, prop, start + unit );

					// Update scale, tolerating zero or NaN from tween.cur()
					// And breaking the loop if scale is unchanged or perfect, or if we've just had enough
					} while ( scale !== (scale = tween.cur() / target) && scale !== 1 && --maxIterations );
				}

				tween.unit = unit;
				tween.start = start;
				// If a +=/-= token was provided, we're doing a relative animation
				tween.end = parts[1] ? start + ( parts[1] + 1 ) * end : end;
			}
			return tween;
		}]
	};

// Animations created synchronously will run synchronously
function createFxNow() {
	setTimeout(function() {
		fxNow = undefined;
	}, 0 );
	return ( fxNow = jQuery.now() );
}

function createTweens( animation, props ) {
	jQuery.each( props, function( prop, value ) {
		var collection = ( tweeners[ prop ] || [] ).concat( tweeners[ "*" ] ),
			index = 0,
			length = collection.length;
		for ( ; index < length; index++ ) {
			if ( collection[ index ].call( animation, prop, value ) ) {

				// we're done with this property
				return;
			}
		}
	});
}

function Animation( elem, properties, options ) {
	var result,
		index = 0,
		tweenerIndex = 0,
		length = animationPrefilters.length,
		deferred = jQuery.Deferred().always( function() {
			// don't match elem in the :animated selector
			delete tick.elem;
		}),
		tick = function() {
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),
				// archaic crash bug won't allow us to use 1 - ( 0.5 || 0 ) (#12497)
				temp = remaining / animation.duration || 0,
				percent = 1 - temp,
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length ; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ]);

			if ( percent < 1 && length ) {
				return remaining;
			} else {
				deferred.resolveWith( elem, [ animation ] );
				return false;
			}
		},
		animation = deferred.promise({
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, { specialEasing: {} }, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end, easing ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
						animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,
					// if we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;

				for ( ; index < length ; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// resolve when we played the last frame
				// otherwise, reject
				if ( gotoEnd ) {
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		}),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length ; index++ ) {
		result = animationPrefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			return result;
		}
	}

	createTweens( animation, props );

	if ( jQuery.isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	jQuery.fx.timer(
		jQuery.extend( tick, {
			anim: animation,
			queue: animation.opts.queue,
			elem: elem
		})
	);

	// attach callbacks from options
	return animation.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );
}

function propFilter( props, specialEasing ) {
	var index, name, easing, value, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = jQuery.camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( jQuery.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// not quite $.extend, this wont overwrite keys already present.
			// also - reusing 'index' from above because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

jQuery.Animation = jQuery.extend( Animation, {

	tweener: function( props, callback ) {
		if ( jQuery.isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.split(" ");
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length ; index++ ) {
			prop = props[ index ];
			tweeners[ prop ] = tweeners[ prop ] || [];
			tweeners[ prop ].unshift( callback );
		}
	},

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			animationPrefilters.unshift( callback );
		} else {
			animationPrefilters.push( callback );
		}
	}
});

function defaultPrefilter( elem, props, opts ) {
	var index, prop, value, length, dataShow, toggle, tween, hooks, oldfire,
		anim = this,
		style = elem.style,
		orig = {},
		handled = [],
		hidden = elem.nodeType && isHidden( elem );

	// handle queue: false promises
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always(function() {
			// doing this makes sure that the complete handler will be called
			// before this completes
			anim.always(function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			});
		});
	}

	// height/width overflow pass
	if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {
		// Make sure that nothing sneaks out
		// Record all 3 overflow attributes because IE does not
		// change the overflow attribute when overflowX and
		// overflowY are set to the same value
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Set display property to inline-block for height/width
		// animations on inline elements that are having width/height animated
		if ( jQuery.css( elem, "display" ) === "inline" &&
				jQuery.css( elem, "float" ) === "none" ) {

			// inline-level elements accept inline-block;
			// block-level elements need to be inline with layout
			if ( !jQuery.support.inlineBlockNeedsLayout || css_defaultDisplay( elem.nodeName ) === "inline" ) {
				style.display = "inline-block";

			} else {
				style.zoom = 1;
			}
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		if ( !jQuery.support.shrinkWrapBlocks ) {
			anim.done(function() {
				style.overflow = opts.overflow[ 0 ];
				style.overflowX = opts.overflow[ 1 ];
				style.overflowY = opts.overflow[ 2 ];
			});
		}
	}


	// show/hide pass
	for ( index in props ) {
		value = props[ index ];
		if ( rfxtypes.exec( value ) ) {
			delete props[ index ];
			toggle = toggle || value === "toggle";
			if ( value === ( hidden ? "hide" : "show" ) ) {
				continue;
			}
			handled.push( index );
		}
	}

	length = handled.length;
	if ( length ) {
		dataShow = jQuery._data( elem, "fxshow" ) || jQuery._data( elem, "fxshow", {} );
		if ( "hidden" in dataShow ) {
			hidden = dataShow.hidden;
		}

		// store state if its toggle - enables .stop().toggle() to "reverse"
		if ( toggle ) {
			dataShow.hidden = !hidden;
		}
		if ( hidden ) {
			jQuery( elem ).show();
		} else {
			anim.done(function() {
				jQuery( elem ).hide();
			});
		}
		anim.done(function() {
			var prop;
			jQuery.removeData( elem, "fxshow", true );
			for ( prop in orig ) {
				jQuery.style( elem, prop, orig[ prop ] );
			}
		});
		for ( index = 0 ; index < length ; index++ ) {
			prop = handled[ index ];
			tween = anim.createTween( prop, hidden ? dataShow[ prop ] : 0 );
			orig[ prop ] = dataShow[ prop ] || jQuery.style( elem, prop );

			if ( !( prop in dataShow ) ) {
				dataShow[ prop ] = tween.start;
				if ( hidden ) {
					tween.end = tween.start;
					tween.start = prop === "width" || prop === "height" ? 1 : 0;
				}
			}
		}
	}
}

function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || "swing";
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			if ( tween.elem[ tween.prop ] != null &&
				(!tween.elem.style || tween.elem.style[ tween.prop ] == null) ) {
				return tween.elem[ tween.prop ];
			}

			// passing any value as a 4th parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails
			// so, simple values such as "10px" are parsed to Float.
			// complex values such as "rotate(1rad)" are returned as is.
			result = jQuery.css( tween.elem, tween.prop, false, "" );
			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {
			// use step hook for back compat - use cssHook if its there - use .style if its
			// available and use plain properties where available
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.style && ( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null || jQuery.cssHooks[ tween.prop ] ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Remove in 2.0 - this supports IE8's panic based approach
// to setting things on disconnected nodes

Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.each([ "toggle", "show", "hide" ], function( i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ||
			// special check for .toggle( handler, handler, ... )
			( !i && jQuery.isFunction( speed ) && jQuery.isFunction( easing ) ) ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
});

jQuery.fn.extend({
	fadeTo: function( speed, to, easing, callback ) {

		// show any hidden elements after setting opacity to 0
		return this.filter( isHidden ).css( "opacity", 0 ).show()

			// animate to the value specified
			.end().animate({ opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {
				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );

				// Empty animations resolve immediately
				if ( empty ) {
					anim.stop( true );
				}
			};

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each(function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = jQuery._data( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && (type == null || timers[ index ].queue === type) ) {
					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// start the next in the queue if the last step wasn't forced
			// timers currently will call their complete callbacks, which will dequeue
			// but only if they were gotoEnd
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		});
	}
});

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		attrs = { height: type },
		i = 0;

	// if we include width, step value is 1 to do all cssExpand values,
	// if we don't include width, step value is 2 to skip over Left and Right
	includeWidth = includeWidth? 1 : 0;
	for( ; i < 4 ; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

// Generate shortcuts for custom animations
jQuery.each({
	slideDown: genFx("show"),
	slideUp: genFx("hide"),
	slideToggle: genFx("toggle"),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
});

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			jQuery.isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
	};

	opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
		opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

	// normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( jQuery.isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p*Math.PI ) / 2;
	}
};

jQuery.timers = [];
jQuery.fx = Tween.prototype.init;
jQuery.fx.tick = function() {
	var timer,
		timers = jQuery.timers,
		i = 0;

	fxNow = jQuery.now();

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];
		// Checks the timer has not already been removed
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
	fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
	if ( timer() && jQuery.timers.push( timer ) && !timerId ) {
		timerId = setInterval( jQuery.fx.tick, jQuery.fx.interval );
	}
};

jQuery.fx.interval = 13;

jQuery.fx.stop = function() {
	clearInterval( timerId );
	timerId = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,
	// Default speed
	_default: 400
};

// Back Compat <1.8 extension point
jQuery.fx.step = {};

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.animated = function( elem ) {
		return jQuery.grep(jQuery.timers, function( fn ) {
			return elem === fn.elem;
		}).length;
	};
}
var rroot = /^(?:body|html)$/i;

jQuery.fn.offset = function( options ) {
	if ( arguments.length ) {
		return options === undefined ?
			this :
			this.each(function( i ) {
				jQuery.offset.setOffset( this, options, i );
			});
	}

	var docElem, body, win, clientTop, clientLeft, scrollTop, scrollLeft,
		box = { top: 0, left: 0 },
		elem = this[ 0 ],
		doc = elem && elem.ownerDocument;

	if ( !doc ) {
		return;
	}

	if ( (body = doc.body) === elem ) {
		return jQuery.offset.bodyOffset( elem );
	}

	docElem = doc.documentElement;

	// Make sure it's not a disconnected DOM node
	if ( !jQuery.contains( docElem, elem ) ) {
		return box;
	}

	// If we don't have gBCR, just use 0,0 rather than error
	// BlackBerry 5, iOS 3 (original iPhone)
	if ( typeof elem.getBoundingClientRect !== "undefined" ) {
		box = elem.getBoundingClientRect();
	}
	win = getWindow( doc );
	clientTop  = docElem.clientTop  || body.clientTop  || 0;
	clientLeft = docElem.clientLeft || body.clientLeft || 0;
	scrollTop  = win.pageYOffset || docElem.scrollTop;
	scrollLeft = win.pageXOffset || docElem.scrollLeft;
	return {
		top: box.top  + scrollTop  - clientTop,
		left: box.left + scrollLeft - clientLeft
	};
};

jQuery.offset = {

	bodyOffset: function( body ) {
		var top = body.offsetTop,
			left = body.offsetLeft;

		if ( jQuery.support.doesNotIncludeMarginInBodyOffset ) {
			top  += parseFloat( jQuery.css(body, "marginTop") ) || 0;
			left += parseFloat( jQuery.css(body, "marginLeft") ) || 0;
		}

		return { top: top, left: left };
	},

	setOffset: function( elem, options, i ) {
		var position = jQuery.css( elem, "position" );

		// set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		var curElem = jQuery( elem ),
			curOffset = curElem.offset(),
			curCSSTop = jQuery.css( elem, "top" ),
			curCSSLeft = jQuery.css( elem, "left" ),
			calculatePosition = ( position === "absolute" || position === "fixed" ) && jQuery.inArray("auto", [curCSSTop, curCSSLeft]) > -1,
			props = {}, curPosition = {}, curTop, curLeft;

		// need to be able to calculate position if either top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;
		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( jQuery.isFunction( options ) ) {
			options = options.call( elem, i, curOffset );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );
		} else {
			curElem.css( props );
		}
	}
};


jQuery.fn.extend({

	position: function() {
		if ( !this[0] ) {
			return;
		}

		var elem = this[0],

		// Get *real* offsetParent
		offsetParent = this.offsetParent(),

		// Get correct offsets
		offset       = this.offset(),
		parentOffset = rroot.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset();

		// Subtract element margins
		// note: when an element has margin: auto the offsetLeft and marginLeft
		// are the same in Safari causing offset.left to incorrectly be 0
		offset.top  -= parseFloat( jQuery.css(elem, "marginTop") ) || 0;
		offset.left -= parseFloat( jQuery.css(elem, "marginLeft") ) || 0;

		// Add offsetParent borders
		parentOffset.top  += parseFloat( jQuery.css(offsetParent[0], "borderTopWidth") ) || 0;
		parentOffset.left += parseFloat( jQuery.css(offsetParent[0], "borderLeftWidth") ) || 0;

		// Subtract the two offsets
		return {
			top:  offset.top  - parentOffset.top,
			left: offset.left - parentOffset.left
		};
	},

	offsetParent: function() {
		return this.map(function() {
			var offsetParent = this.offsetParent || document.body;
			while ( offsetParent && (!rroot.test(offsetParent.nodeName) && jQuery.css(offsetParent, "position") === "static") ) {
				offsetParent = offsetParent.offsetParent;
			}
			return offsetParent || document.body;
		});
	}
});


// Create scrollLeft and scrollTop methods
jQuery.each( {scrollLeft: "pageXOffset", scrollTop: "pageYOffset"}, function( method, prop ) {
	var top = /Y/.test( prop );

	jQuery.fn[ method ] = function( val ) {
		return jQuery.access( this, function( elem, method, val ) {
			var win = getWindow( elem );

			if ( val === undefined ) {
				return win ? (prop in win) ? win[ prop ] :
					win.document.documentElement[ method ] :
					elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : jQuery( win ).scrollLeft(),
					 top ? val : jQuery( win ).scrollTop()
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length, null );
	};
});

function getWindow( elem ) {
	return jQuery.isWindow( elem ) ?
		elem :
		elem.nodeType === 9 ?
			elem.defaultView || elem.parentWindow :
			false;
}
// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name }, function( defaultExtra, funcName ) {
		// margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return jQuery.access( this, function( elem, type, value ) {
				var doc;

				if ( jQuery.isWindow( elem ) ) {
					// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
					// isn't a whole lot we can do. See pull request at this URL for discussion:
					// https://github.com/jquery/jquery/pull/764
					return elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height], whichever is greatest
					// unfortunately, this causes bug #3838 in IE6/8 only, but there is currently no good, small way to fix it.
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?
					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, value, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable, null );
		};
	});
});
// Expose jQuery to the global object
window.jQuery = window.$ = jQuery;

// Expose jQuery as an AMD module, but only for AMD loaders that
// understand the issues with loading multiple versions of jQuery
// in a page that all might call define(). The loader will indicate
// they have special allowances for multiple jQuery versions by
// specifying define.amd.jQuery = true. Register as a named module,
// since jQuery can be concatenated with other files that may use define,
// but not use a proper concatenation script that understands anonymous
// AMD modules. A named AMD is safest and most robust way to register.
// Lowercase jquery is used because AMD module names are derived from
// file names, and jQuery is normally delivered in a lowercase file name.
// Do this after creating the global so that if an AMD module wants to call
// noConflict to hide this version of jQuery, it will work.
if ( typeof define === "function" && define.amd && define.amd.jQuery ) {
	define( "jquery", [], function () { return jQuery; } );
}

})( window );

(function(){function a(){if(a.is(arguments[0],G)){var b=arguments[0],d=bV[m](a,b.splice(0,3+a.is(b[0],E))),e=d.set();for(var g=0,h=b[w];g<h;g++){var i=b[g]||{};c[f](i.type)&&e[L](d[i.type]().attr(i))}return e}return bV[m](a,arguments)}a.version="1.5.2";var b=/[, ]+/,c={circle:1,rect:1,path:1,ellipse:1,text:1,image:1},d=/\{(\d+)\}/g,e="prototype",f="hasOwnProperty",g=document,h=window,i={was:Object[e][f].call(h,"Raphael"),is:h.Raphael},j=function(){this.customAttributes={}},k,l="appendChild",m="apply",n="concat",o="createTouch"in g,p="",q=" ",r=String,s="split",t="click dblclick mousedown mousemove mouseout mouseover mouseup touchstart touchmove touchend orientationchange touchcancel gesturestart gesturechange gestureend"[s](q),u={mousedown:"touchstart",mousemove:"touchmove",mouseup:"touchend"},v="join",w="length",x=r[e].toLowerCase,y=Math,z=y.max,A=y.min,B=y.abs,C=y.pow,D=y.PI,E="number",F="string",G="array",H="toString",I="fill",J=Object[e][H],K={},L="push",M=/^url\(['"]?([^\)]+?)['"]?\)$/i,N=/^\s*((#[a-f\d]{6})|(#[a-f\d]{3})|rgba?\(\s*([\d\.]+%?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\)|hsba?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\)|hsla?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\))\s*$/i,O={"NaN":1,Infinity:1,"-Infinity":1},P=/^(?:cubic-)?bezier\(([^,]+),([^,]+),([^,]+),([^\)]+)\)/,Q=y.round,R="setAttribute",S=parseFloat,T=parseInt,U=" progid:DXImageTransform.Microsoft",V=r[e].toUpperCase,W={blur:0,"clip-rect":"0 0 1e9 1e9",cursor:"default",cx:0,cy:0,fill:"#fff","fill-opacity":1,font:"10px \"Arial\"","font-family":"\"Arial\"","font-size":"10","font-style":"normal","font-weight":400,gradient:0,height:0,href:"http://raphaeljs.com/",opacity:1,path:"M0,0",r:0,rotation:0,rx:0,ry:0,scale:"1 1",src:"",stroke:"#000","stroke-dasharray":"","stroke-linecap":"butt","stroke-linejoin":"butt","stroke-miterlimit":0,"stroke-opacity":1,"stroke-width":1,target:"_blank","text-anchor":"middle",title:"Raphael",translation:"0 0",width:0,x:0,y:0},X={along:"along",blur:E,"clip-rect":"csv",cx:E,cy:E,fill:"colour","fill-opacity":E,"font-size":E,height:E,opacity:E,path:"path",r:E,rotation:"csv",rx:E,ry:E,scale:"csv",stroke:"colour","stroke-opacity":E,"stroke-width":E,translation:"csv",width:E,x:E,y:E},Y="replace",Z=/^(from|to|\d+%?)$/,$=/\s*,\s*/,_={hs:1,rg:1},ba=/,?([achlmqrstvxz]),?/gi,bb=/([achlmqstvz])[\s,]*((-?\d*\.?\d*(?:e[-+]?\d+)?\s*,?\s*)+)/ig,bc=/(-?\d*\.?\d*(?:e[-+]?\d+)?)\s*,?\s*/ig,bd=/^r(?:\(([^,]+?)\s*,\s*([^\)]+?)\))?/,be=function(a,b){return a.key-b.key};a.type=h.SVGAngle||g.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure","1.1")?"SVG":"VML";if(a.type=="VML"){var bf=g.createElement("div"),bg;bf.innerHTML="<v:shape adj=\"1\"/>";bg=bf.firstChild;bg.style.behavior="url(#default#VML)";if(!(bg&&typeof bg.adj=="object"))return a.type=null;bf=null}a.svg=!(a.vml=a.type=="VML");j[e]=a[e];k=j[e];a._id=0;a._oid=0;a.fn={};a.is=function(a,b){b=x.call(b);if(b=="finite")return!O[f](+a);return b=="null"&&a===null||b==typeof a||b=="object"&&a===Object(a)||b=="array"&&Array.isArray&&Array.isArray(a)||J.call(a).slice(8,-1).toLowerCase()==b};a.angle=function(b,c,d,e,f,g){{if(f==null){var h=b-d,i=c-e;if(!h&&!i)return 0;return((h<0)*180+y.atan(-i/-h)*180/D+360)%360}return a.angle(b,c,f,g)-a.angle(d,e,f,g)}};a.rad=function(a){return a%360*D/180};a.deg=function(a){return a*180/D%360};a.snapTo=function(b,c,d){d=a.is(d,"finite")?d:10;if(a.is(b,G)){var e=b.length;while(e--)if(B(b[e]-c)<=d)return b[e]}else{b=+b;var f=c%b;if(f<d)return c-f;if(f>b-d)return c-f+b}return c};function bh(){var a=[],b=0;for(;b<32;b++)a[b]=(~(~(y.random()*16)))[H](16);a[12]=4;a[16]=(a[16]&3|8)[H](16);return"r-"+a[v]("")}a.setWindow=function(a){h=a;g=h.document};var bi=function(b){if(a.vml){var c=/^\s+|\s+$/g,d;try{var e=new ActiveXObject("htmlfile");e.write("<body>");e.close();d=e.body}catch(a){d=createPopup().document.body}var f=d.createTextRange();bi=bm(function(a){try{d.style.color=r(a)[Y](c,p);var b=f.queryCommandValue("ForeColor");b=(b&255)<<16|b&65280|(b&16711680)>>>16;return"#"+("000000"+b[H](16)).slice(-6)}catch(a){return"none"}})}else{var h=g.createElement("i");h.title="RaphaÃ«l Colour Picker";h.style.display="none";g.body[l](h);bi=bm(function(a){h.style.color=a;return g.defaultView.getComputedStyle(h,p).getPropertyValue("color")})}return bi(b)},bj=function(){return"hsb("+[this.h,this.s,this.b]+")"},bk=function(){return"hsl("+[this.h,this.s,this.l]+")"},bl=function(){return this.hex};a.hsb2rgb=function(b,c,d,e){if(a.is(b,"object")&&"h"in b&&"s"in b&&"b"in b){d=b.b;c=b.s;b=b.h;e=b.o}return a.hsl2rgb(b,c,d/2,e)};a.hsl2rgb=function(b,c,d,e){if(a.is(b,"object")&&"h"in b&&"s"in b&&"l"in b){d=b.l;c=b.s;b=b.h}if(b>1||c>1||d>1){b/=360;c/=100;d/=100}var f={},g=["r","g","b"],h,i,j,k,l,m;if(c){d<0.5?h=d*(1+c):h=d+c-d*c;i=2*d-h;for(var n=0;n<3;n++){j=b+1/3*-(n-1);j<0&&j++;j>1&&j--;j*6<1?f[g[n]]=i+(h-i)*6*j:j*2<1?f[g[n]]=h:j*3<2?f[g[n]]=i+(h-i)*(2/3-j)*6:f[g[n]]=i}}else f={r:d,g:d,b:d};f.r*=255;f.g*=255;f.b*=255;f.hex="#"+(16777216|f.b|f.g<<8|f.r<<16).toString(16).slice(1);a.is(e,"finite")&&(f.opacity=e);f.toString=bl;return f};a.rgb2hsb=function(b,c,d){if(c==null&&a.is(b,"object")&&"r"in b&&"g"in b&&"b"in b){d=b.b;c=b.g;b=b.r}if(c==null&&a.is(b,F)){var e=a.getRGB(b);b=e.r;c=e.g;d=e.b}if(b>1||c>1||d>1){b/=255;c/=255;d/=255}var f=z(b,c,d),g=A(b,c,d),h,i,j=f;{if(g==f)return{h:0,s:0,b:f,toString:bj};var k=f-g;i=k/f;b==f?h=(c-d)/k:c==f?h=2+(d-b)/k:h=4+(b-c)/k;h/=6;h<0&&h++;h>1&&h--}return{h:h,s:i,b:j,toString:bj}};a.rgb2hsl=function(b,c,d){if(c==null&&a.is(b,"object")&&"r"in b&&"g"in b&&"b"in b){d=b.b;c=b.g;b=b.r}if(c==null&&a.is(b,F)){var e=a.getRGB(b);b=e.r;c=e.g;d=e.b}if(b>1||c>1||d>1){b/=255;c/=255;d/=255}var f=z(b,c,d),g=A(b,c,d),h,i,j=(f+g)/2,k;if(g==f)k={h:0,s:0,l:j};else{var l=f-g;i=j<0.5?l/(f+g):l/(2-f-g);b==f?h=(c-d)/l:c==f?h=2+(d-b)/l:h=4+(b-c)/l;h/=6;h<0&&h++;h>1&&h--;k={h:h,s:i,l:j}}k.toString=bk;return k};a._path2string=function(){return this.join(",")[Y](ba,"$1")};function bm(a,b,c){function d(){var g=Array[e].slice.call(arguments,0),h=g[v]("â–º"),i=d.cache=d.cache||{},j=d.count=d.count||[];if(i[f](h))return c?c(i[h]):i[h];j[w]>=1000&&delete i[j.shift()];j[L](h);i[h]=a[m](b,g);return c?c(i[h]):i[h]}return d}a.getRGB=bm(function(b){if(!b||!(!((b=r(b)).indexOf("-")+1)))return{r:-1,g:-1,b:-1,hex:"none",error:1};if(b=="none")return{r:-1,g:-1,b:-1,hex:"none"};!(_[f](b.toLowerCase().substring(0,2))||b.charAt()=="#")&&(b=bi(b));var c,d,e,g,h,i,j,k=b.match(N);if(k){if(k[2]){g=T(k[2].substring(5),16);e=T(k[2].substring(3,5),16);d=T(k[2].substring(1,3),16)}if(k[3]){g=T((i=k[3].charAt(3))+i,16);e=T((i=k[3].charAt(2))+i,16);d=T((i=k[3].charAt(1))+i,16)}if(k[4]){j=k[4][s]($);d=S(j[0]);j[0].slice(-1)=="%"&&(d*=2.55);e=S(j[1]);j[1].slice(-1)=="%"&&(e*=2.55);g=S(j[2]);j[2].slice(-1)=="%"&&(g*=2.55);k[1].toLowerCase().slice(0,4)=="rgba"&&(h=S(j[3]));j[3]&&j[3].slice(-1)=="%"&&(h/=100)}if(k[5]){j=k[5][s]($);d=S(j[0]);j[0].slice(-1)=="%"&&(d*=2.55);e=S(j[1]);j[1].slice(-1)=="%"&&(e*=2.55);g=S(j[2]);j[2].slice(-1)=="%"&&(g*=2.55);(j[0].slice(-3)=="deg"||j[0].slice(-1)=="Â°")&&(d/=360);k[1].toLowerCase().slice(0,4)=="hsba"&&(h=S(j[3]));j[3]&&j[3].slice(-1)=="%"&&(h/=100);return a.hsb2rgb(d,e,g,h)}if(k[6]){j=k[6][s]($);d=S(j[0]);j[0].slice(-1)=="%"&&(d*=2.55);e=S(j[1]);j[1].slice(-1)=="%"&&(e*=2.55);g=S(j[2]);j[2].slice(-1)=="%"&&(g*=2.55);(j[0].slice(-3)=="deg"||j[0].slice(-1)=="Â°")&&(d/=360);k[1].toLowerCase().slice(0,4)=="hsla"&&(h=S(j[3]));j[3]&&j[3].slice(-1)=="%"&&(h/=100);return a.hsl2rgb(d,e,g,h)}k={r:d,g:e,b:g};k.hex="#"+(16777216|g|e<<8|d<<16).toString(16).slice(1);a.is(h,"finite")&&(k.opacity=h);return k}return{r:-1,g:-1,b:-1,hex:"none",error:1}},a);a.getColor=function(a){var b=this.getColor.start=this.getColor.start||{h:0,s:1,b:a||0.75},c=this.hsb2rgb(b.h,b.s,b.b);b.h+=0.075;if(b.h>1){b.h=0;b.s-=0.2;b.s<=0&&(this.getColor.start={h:0,s:1,b:b.b})}return c.hex};a.getColor.reset=function(){delete this.start};a.parsePathString=bm(function(b){if(!b)return null;var c={a:7,c:6,h:1,l:2,m:2,q:4,s:4,t:2,v:1,z:0},d=[];a.is(b,G)&&a.is(b[0],G)&&(d=bo(b));d[w]||r(b)[Y](bb,function(a,b,e){var f=[],g=x.call(b);e[Y](bc,function(a,b){b&&f[L](+b)});if(g=="m"&&f[w]>2){d[L]([b][n](f.splice(0,2)));g="l";b=b=="m"?"l":"L"}while(f[w]>=c[g]){d[L]([b][n](f.splice(0,c[g])));if(!c[g])break}});d[H]=a._path2string;return d});a.findDotsAtSegment=function(a,b,c,d,e,f,g,h,i){var j=1-i,k=C(j,3)*a+C(j,2)*3*i*c+j*3*i*i*e+C(i,3)*g,l=C(j,3)*b+C(j,2)*3*i*d+j*3*i*i*f+C(i,3)*h,m=a+2*i*(c-a)+i*i*(e-2*c+a),n=b+2*i*(d-b)+i*i*(f-2*d+b),o=c+2*i*(e-c)+i*i*(g-2*e+c),p=d+2*i*(f-d)+i*i*(h-2*f+d),q=(1-i)*a+i*c,r=(1-i)*b+i*d,s=(1-i)*e+i*g,t=(1-i)*f+i*h,u=90-y.atan((m-o)/(n-p))*180/D;(m>o||n<p)&&(u+=180);return{x:k,y:l,m:{x:m,y:n},n:{x:o,y:p},start:{x:q,y:r},end:{x:s,y:t},alpha:u}};var bn=bm(function(a){if(!a)return{x:0,y:0,width:0,height:0};a=bw(a);var b=0,c=0,d=[],e=[],f;for(var g=0,h=a[w];g<h;g++){f=a[g];if(f[0]=="M"){b=f[1];c=f[2];d[L](b);e[L](c)}else{var i=bv(b,c,f[1],f[2],f[3],f[4],f[5],f[6]);d=d[n](i.min.x,i.max.x);e=e[n](i.min.y,i.max.y);b=f[5];c=f[6]}}var j=A[m](0,d),k=A[m](0,e);return{x:j,y:k,width:z[m](0,d)-j,height:z[m](0,e)-k}}),bo=function(b){var c=[];if(!a.is(b,G)||!a.is(b&&b[0],G))b=a.parsePathString(b);for(var d=0,e=b[w];d<e;d++){c[d]=[];for(var f=0,g=b[d][w];f<g;f++)c[d][f]=b[d][f]}c[H]=a._path2string;return c},bp=bm(function(b){if(!a.is(b,G)||!a.is(b&&b[0],G))b=a.parsePathString(b);var c=[],d=0,e=0,f=0,g=0,h=0;if(b[0][0]=="M"){d=b[0][1];e=b[0][2];f=d;g=e;h++;c[L](["M",d,e])}for(var i=h,j=b[w];i<j;i++){var k=c[i]=[],l=b[i];if(l[0]!=x.call(l[0])){k[0]=x.call(l[0]);switch(k[0]){case"a":k[1]=l[1];k[2]=l[2];k[3]=l[3];k[4]=l[4];k[5]=l[5];k[6]=+(l[6]-d).toFixed(3);k[7]=+(l[7]-e).toFixed(3);break;case"v":k[1]=+(l[1]-e).toFixed(3);break;case"m":f=l[1];g=l[2];default:for(var m=1,n=l[w];m<n;m++)k[m]=+(l[m]-(m%2?d:e)).toFixed(3)}}else{k=c[i]=[];if(l[0]=="m"){f=l[1]+d;g=l[2]+e}for(var o=0,p=l[w];o<p;o++)c[i][o]=l[o]}var q=c[i][w];switch(c[i][0]){case"z":d=f;e=g;break;case"h":d+=+c[i][q-1];break;case"v":e+=+c[i][q-1];break;default:d+=+c[i][q-2];e+=+c[i][q-1]}}c[H]=a._path2string;return c},0,bo),bq=bm(function(b){if(!a.is(b,G)||!a.is(b&&b[0],G))b=a.parsePathString(b);var c=[],d=0,e=0,f=0,g=0,h=0;if(b[0][0]=="M"){d=+b[0][1];e=+b[0][2];f=d;g=e;h++;c[0]=["M",d,e]}for(var i=h,j=b[w];i<j;i++){var k=c[i]=[],l=b[i];if(l[0]!=V.call(l[0])){k[0]=V.call(l[0]);switch(k[0]){case"A":k[1]=l[1];k[2]=l[2];k[3]=l[3];k[4]=l[4];k[5]=l[5];k[6]=+(l[6]+d);k[7]=+(l[7]+e);break;case"V":k[1]=+l[1]+e;break;case"H":k[1]=+l[1]+d;break;case"M":f=+l[1]+d;g=+l[2]+e;default:for(var m=1,n=l[w];m<n;m++)k[m]=+l[m]+(m%2?d:e)}}else for(var o=0,p=l[w];o<p;o++)c[i][o]=l[o];switch(k[0]){case"Z":d=f;e=g;break;case"H":d=k[1];break;case"V":e=k[1];break;case"M":f=c[i][c[i][w]-2];g=c[i][c[i][w]-1];default:d=c[i][c[i][w]-2];e=c[i][c[i][w]-1]}}c[H]=a._path2string;return c},null,bo),br=function(a,b,c,d){return[a,b,c,d,c,d]},bs=function(a,b,c,d,e,f){var g=1/3,h=2/3;return[g*a+h*c,g*b+h*d,g*e+h*c,g*f+h*d,e,f]},bt=function(a,b,c,d,e,f,g,h,i,j){var k=D*120/180,l=D/180*(+e||0),m=[],o,p=bm(function(a,b,c){var d=a*y.cos(c)-b*y.sin(c),e=a*y.sin(c)+b*y.cos(c);return{x:d,y:e}});if(j){G=j[0];H=j[1];E=j[2];F=j[3]}else{o=p(a,b,-l);a=o.x;b=o.y;o=p(h,i,-l);h=o.x;i=o.y;var q=y.cos(D/180*e),r=y.sin(D/180*e),t=(a-h)/2,u=(b-i)/2,x=t*t/(c*c)+u*u/(d*d);if(x>1){x=y.sqrt(x);c=x*c;d=x*d}var z=c*c,A=d*d,C=(f==g?-1:1)*y.sqrt(B((z*A-z*u*u-A*t*t)/(z*u*u+A*t*t))),E=C*c*u/d+(a+h)/2,F=C*-d*t/c+(b+i)/2,G=y.asin(((b-F)/d).toFixed(9)),H=y.asin(((i-F)/d).toFixed(9));G=a<E?D-G:G;H=h<E?D-H:H;G<0&&(G=D*2+G);H<0&&(H=D*2+H);g&&G>H&&(G=G-D*2);!g&&H>G&&(H=H-D*2)}var I=H-G;if(B(I)>k){var J=H,K=h,L=i;H=G+k*(g&&H>G?1:-1);h=E+c*y.cos(H);i=F+d*y.sin(H);m=bt(h,i,c,d,e,0,g,K,L,[H,J,E,F])}I=H-G;var M=y.cos(G),N=y.sin(G),O=y.cos(H),P=y.sin(H),Q=y.tan(I/4),R=4/3*c*Q,S=4/3*d*Q,T=[a,b],U=[a+R*N,b-S*M],V=[h+R*P,i-S*O],W=[h,i];U[0]=2*T[0]-U[0];U[1]=2*T[1]-U[1];{if(j)return[U,V,W][n](m);m=[U,V,W][n](m)[v]()[s](",");var X=[];for(var Y=0,Z=m[w];Y<Z;Y++)X[Y]=Y%2?p(m[Y-1],m[Y],l).y:p(m[Y],m[Y+1],l).x;return X}},bu=function(a,b,c,d,e,f,g,h,i){var j=1-i;return{x:C(j,3)*a+C(j,2)*3*i*c+j*3*i*i*e+C(i,3)*g,y:C(j,3)*b+C(j,2)*3*i*d+j*3*i*i*f+C(i,3)*h}},bv=bm(function(a,b,c,d,e,f,g,h){var i=e-2*c+a-(g-2*e+c),j=2*(c-a)-2*(e-c),k=a-c,l=(-j+y.sqrt(j*j-4*i*k))/2/i,n=(-j-y.sqrt(j*j-4*i*k))/2/i,o=[b,h],p=[a,g],q;B(l)>"1e12"&&(l=0.5);B(n)>"1e12"&&(n=0.5);if(l>0&&l<1){q=bu(a,b,c,d,e,f,g,h,l);p[L](q.x);o[L](q.y)}if(n>0&&n<1){q=bu(a,b,c,d,e,f,g,h,n);p[L](q.x);o[L](q.y)}i=f-2*d+b-(h-2*f+d);j=2*(d-b)-2*(f-d);k=b-d;l=(-j+y.sqrt(j*j-4*i*k))/2/i;n=(-j-y.sqrt(j*j-4*i*k))/2/i;B(l)>"1e12"&&(l=0.5);B(n)>"1e12"&&(n=0.5);if(l>0&&l<1){q=bu(a,b,c,d,e,f,g,h,l);p[L](q.x);o[L](q.y)}if(n>0&&n<1){q=bu(a,b,c,d,e,f,g,h,n);p[L](q.x);o[L](q.y)}return{min:{x:A[m](0,p),y:A[m](0,o)},max:{x:z[m](0,p),y:z[m](0,o)}}}),bw=bm(function(a,b){var c=bq(a),d=b&&bq(b),e={x:0,y:0,bx:0,by:0,X:0,Y:0,qx:null,qy:null},f={x:0,y:0,bx:0,by:0,X:0,Y:0,qx:null,qy:null},g=function(a,b){var c,d;if(!a)return["C",b.x,b.y,b.x,b.y,b.x,b.y];!(a[0]in{T:1,Q:1})&&(b.qx=b.qy=null);switch(a[0]){case"M":b.X=a[1];b.Y=a[2];break;case"A":a=["C"][n](bt[m](0,[b.x,b.y][n](a.slice(1))));break;case"S":c=b.x+(b.x-(b.bx||b.x));d=b.y+(b.y-(b.by||b.y));a=["C",c,d][n](a.slice(1));break;case"T":b.qx=b.x+(b.x-(b.qx||b.x));b.qy=b.y+(b.y-(b.qy||b.y));a=["C"][n](bs(b.x,b.y,b.qx,b.qy,a[1],a[2]));break;case"Q":b.qx=a[1];b.qy=a[2];a=["C"][n](bs(b.x,b.y,a[1],a[2],a[3],a[4]));break;case"L":a=["C"][n](br(b.x,b.y,a[1],a[2]));break;case"H":a=["C"][n](br(b.x,b.y,a[1],b.y));break;case"V":a=["C"][n](br(b.x,b.y,b.x,a[1]));break;case"Z":a=["C"][n](br(b.x,b.y,b.X,b.Y));break}return a},h=function(a,b){if(a[b][w]>7){a[b].shift();var e=a[b];while(e[w])a.splice(b++,0,["C"][n](e.splice(0,6)));a.splice(b,1);k=z(c[w],d&&d[w]||0)}},i=function(a,b,e,f,g){if(a&&b&&a[g][0]=="M"&&b[g][0]!="M"){b.splice(g,0,["M",f.x,f.y]);e.bx=0;e.by=0;e.x=a[g][1];e.y=a[g][2];k=z(c[w],d&&d[w]||0)}};for(var j=0,k=z(c[w],d&&d[w]||0);j<k;j++){c[j]=g(c[j],e);h(c,j);d&&(d[j]=g(d[j],f));d&&h(d,j);i(c,d,e,f,j);i(d,c,f,e,j);var l=c[j],o=d&&d[j],p=l[w],q=d&&o[w];e.x=l[p-2];e.y=l[p-1];e.bx=S(l[p-4])||e.x;e.by=S(l[p-3])||e.y;f.bx=d&&(S(o[q-4])||f.x);f.by=d&&(S(o[q-3])||f.y);f.x=d&&o[q-2];f.y=d&&o[q-1]}return d?[c,d]:c},null,bo),bx=bm(function(b){var c=[];for(var d=0,e=b[w];d<e;d++){var f={},g=b[d].match(/^([^:]*):?([\d\.]*)/);f.color=a.getRGB(g[1]);if(f.color.error)return null;f.color=f.color.hex;g[2]&&(f.offset=g[2]+"%");c[L](f)}for(d=1,e=c[w]-1;d<e;d++){if(!c[d].offset){var h=S(c[d-1].offset||0),i=0;for(var j=d+1;j<e;j++){if(c[j].offset){i=c[j].offset;break}}if(!i){i=100;j=e}i=S(i);var k=(i-h)/(j-d+1);for(;d<j;d++){h+=k;c[d].offset=h+"%"}}}return c}),by=function(b,c,d,e){var f;if(a.is(b,F)||a.is(b,"object")){f=a.is(b,F)?g.getElementById(b):b;if(f.tagName)return c==null?{container:f,width:f.style.pixelWidth||f.offsetWidth,height:f.style.pixelHeight||f.offsetHeight}:{container:f,width:c,height:d}}else return{container:1,x:b,y:c,width:d,height:e}},bz=function(a,b){var c=this;for(var d in b){if(b[f](d)&&!(d in a))switch(typeof b[d]){case"function":(function(b){a[d]=a===c?b:function(){return b[m](c,arguments)}})(b[d]);break;case"object":a[d]=a[d]||{};bz.call(this,a[d],b[d]);break;default:a[d]=b[d];break}}},bA=function(a,b){a==b.top&&(b.top=a.prev);a==b.bottom&&(b.bottom=a.next);a.next&&(a.next.prev=a.prev);a.prev&&(a.prev.next=a.next)},bB=function(a,b){if(b.top===a)return;bA(a,b);a.next=null;a.prev=b.top;b.top.next=a;b.top=a},bC=function(a,b){if(b.bottom===a)return;bA(a,b);a.next=b.bottom;a.prev=null;b.bottom.prev=a;b.bottom=a},bD=function(a,b,c){bA(a,c);b==c.top&&(c.top=a);b.next&&(b.next.prev=a);a.next=b.next;a.prev=b;b.next=a},bE=function(a,b,c){bA(a,c);b==c.bottom&&(c.bottom=a);b.prev&&(b.prev.next=a);a.prev=b.prev;b.prev=a;a.next=b},bF=function(a){return function(){throw new Error("RaphaÃ«l: you are calling to method â€œ"+a+"â€ of removed object")}};a.pathToRelative=bp;if(a.svg){k.svgns="http://www.w3.org/2000/svg";k.xlink="http://www.w3.org/1999/xlink";Q=function(a){return+a+(~(~a)===a)*0.5};var bG=function(a,b){if(b)for(var c in b)b[f](c)&&a[R](c,r(b[c]));else{a=g.createElementNS(k.svgns,a);a.style.webkitTapHighlightColor="rgba(0,0,0,0)";return a}};a[H]=function(){return"Your browser supports SVG.\nYou are running RaphaÃ«l "+this.version};var bH=function(a,b){var c=bG("path");b.canvas&&b.canvas[l](c);var d=new bN(c,b);d.type="path";bK(d,{fill:"none",stroke:"#000",path:a});return d},bI=function(a,b,c){var d="linear",e=0.5,f=0.5,h=a.style;b=r(b)[Y](bd,function(a,b,c){d="radial";if(b&&c){e=S(b);f=S(c);var g=(f>0.5)*2-1;C(e-0.5,2)+C(f-0.5,2)>0.25&&(f=y.sqrt(0.25-C(e-0.5,2))*g+0.5)&&f!=0.5&&(f=f.toFixed(5)-0.00001*g)}return p});b=b[s](/\s*\-\s*/);if(d=="linear"){var i=b.shift();i=-S(i);if(isNaN(i))return null;var j=[0,0,y.cos(i*D/180),y.sin(i*D/180)],k=1/(z(B(j[2]),B(j[3]))||1);j[2]*=k;j[3]*=k;if(j[2]<0){j[0]=-j[2];j[2]=0}if(j[3]<0){j[1]=-j[3];j[3]=0}}var m=bx(b);if(!m)return null;var n=a.getAttribute(I);n=n.match(/^url\(#(.*)\)$/);n&&c.defs.removeChild(g.getElementById(n[1]));var o=bG(d+"Gradient");o.id=bh();bG(o,d=="radial"?{fx:e,fy:f}:{x1:j[0],y1:j[1],x2:j[2],y2:j[3]});c.defs[l](o);for(var q=0,t=m[w];q<t;q++){var u=bG("stop");bG(u,{offset:m[q].offset?m[q].offset:q?"100%":"0%","stop-color":m[q].color||"#fff"});o[l](u)}bG(a,{fill:"url(#"+o.id+")",opacity:1,"fill-opacity":1});h.fill=p;h.opacity=1;h.fillOpacity=1;return 1},bJ=function(b){var c=b.getBBox();bG(b.pattern,{patternTransform:a.format("translate({0},{1})",c.x,c.y)})},bK=function(c,d){var e={"":[0],none:[0],"-":[3,1],".":[1,1],"-.":[3,1,1,1],"-..":[3,1,1,1,1,1],". ":[1,3],"- ":[4,3],"--":[8,3],"- .":[4,3,1,3],"--.":[8,3,1,3],"--..":[8,3,1,3,1,3]},h=c.node,i=c.attrs,j=c.rotate(),k=function(a,b){b=e[x.call(b)];if(b){var c=a.attrs["stroke-width"]||"1",f=({round:c,square:c,butt:0})[a.attrs["stroke-linecap"]||d["stroke-linecap"]]||0,g=[],i=b[w];while(i--)g[i]=b[i]*c+(i%2?1:-1)*f;bG(h,{"stroke-dasharray":g[v](",")})}};d[f]("rotation")&&(j=d.rotation);var m=r(j)[s](b);if(m.length-1){m[1]=+m[1];m[2]=+m[2]}else m=null;S(j)&&c.rotate(0,true);for(var n in d){if(d[f](n)){if(!W[f](n))continue;var o=d[n];i[n]=o;switch(n){case"blur":c.blur(o);break;case"rotation":c.rotate(o,true);break;case"href":case"title":case"target":var t=h.parentNode;if(x.call(t.tagName)!="a"){var u=bG("a");t.insertBefore(u,h);u[l](h);t=u}n=="target"&&o=="blank"?t.setAttributeNS(c.paper.xlink,"show","new"):t.setAttributeNS(c.paper.xlink,n,o);break;case"cursor":h.style.cursor=o;break;case"clip-rect":var y=r(o)[s](b);if(y[w]==4){c.clip&&c.clip.parentNode.parentNode.removeChild(c.clip.parentNode);var z=bG("clipPath"),A=bG("rect");z.id=bh();bG(A,{x:y[0],y:y[1],width:y[2],height:y[3]});z[l](A);c.paper.defs[l](z);bG(h,{"clip-path":"url(#"+z.id+")"});c.clip=A}if(!o){var B=g.getElementById(h.getAttribute("clip-path")[Y](/(^url\(#|\)$)/g,p));B&&B.parentNode.removeChild(B);bG(h,{"clip-path":p});delete c.clip}break;case"path":c.type=="path"&&bG(h,{d:o?i.path=bq(o):"M0,0"});break;case"width":h[R](n,o);if(i.fx){n="x";o=i.x}else break;case"x":i.fx&&(o=-i.x-(i.width||0));case"rx":if(n=="rx"&&c.type=="rect")break;case"cx":m&&(n=="x"||n=="cx")&&(m[1]+=o-i[n]);h[R](n,o);c.pattern&&bJ(c);break;case"height":h[R](n,o);if(i.fy){n="y";o=i.y}else break;case"y":i.fy&&(o=-i.y-(i.height||0));case"ry":if(n=="ry"&&c.type=="rect")break;case"cy":m&&(n=="y"||n=="cy")&&(m[2]+=o-i[n]);h[R](n,o);c.pattern&&bJ(c);break;case"r":c.type=="rect"?bG(h,{rx:o,ry:o}):h[R](n,o);break;case"src":c.type=="image"&&h.setAttributeNS(c.paper.xlink,"href",o);break;case"stroke-width":h.style.strokeWidth=o;h[R](n,o);i["stroke-dasharray"]&&k(c,i["stroke-dasharray"]);break;case"stroke-dasharray":k(c,o);break;case"translation":var C=r(o)[s](b);C[0]=+C[0]||0;C[1]=+C[1]||0;if(m){m[1]+=C[0];m[2]+=C[1]}cz.call(c,C[0],C[1]);break;case"scale":C=r(o)[s](b);c.scale(+C[0]||1,+C[1]||+C[0]||1,isNaN(S(C[2]))?null:+C[2],isNaN(S(C[3]))?null:+C[3]);break;case I:var D=r(o).match(M);if(D){z=bG("pattern");var E=bG("image");z.id=bh();bG(z,{x:0,y:0,patternUnits:"userSpaceOnUse",height:1,width:1});bG(E,{x:0,y:0});E.setAttributeNS(c.paper.xlink,"href",D[1]);z[l](E);var F=g.createElement("img");F.style.cssText="position:absolute;left:-9999em;top-9999em";F.onload=function(){bG(z,{width:this.offsetWidth,height:this.offsetHeight});bG(E,{width:this.offsetWidth,height:this.offsetHeight});g.body.removeChild(this);c.paper.safari()};g.body[l](F);F.src=D[1];c.paper.defs[l](z);h.style.fill="url(#"+z.id+")";bG(h,{fill:"url(#"+z.id+")"});c.pattern=z;c.pattern&&bJ(c);break}var G=a.getRGB(o);if(G.error)if((({circle:1,ellipse:1})[f](c.type)||r(o).charAt()!="r")&&bI(h,o,c.paper)){i.gradient=o;i.fill="none";break}else{delete d.gradient;delete i.gradient;!a.is(i.opacity,"undefined")&&a.is(d.opacity,"undefined")&&bG(h,{opacity:i.opacity});!a.is(i["fill-opacity"],"undefined")&&a.is(d["fill-opacity"],"undefined")&&bG(h,{"fill-opacity":i["fill-opacity"]})}G[f]("opacity")&&bG(h,{"fill-opacity":G.opacity>1?G.opacity/100:G.opacity});case"stroke":G=a.getRGB(o);h[R](n,G.hex);n=="stroke"&&G[f]("opacity")&&bG(h,{"stroke-opacity":G.opacity>1?G.opacity/100:G.opacity});break;case"gradient":(({circle:1,ellipse:1})[f](c.type)||r(o).charAt()!="r")&&bI(h,o,c.paper);break;case"opacity":i.gradient&&!i[f]("stroke-opacity")&&bG(h,{"stroke-opacity":o>1?o/100:o});case"fill-opacity":if(i.gradient){var H=g.getElementById(h.getAttribute(I)[Y](/^url\(#|\)$/g,p));if(H){var J=H.getElementsByTagName("stop");J[J[w]-1][R]("stop-opacity",o)}break}default:n=="font-size"&&(o=T(o,10)+"px");var K=n[Y](/(\-.)/g,function(a){return V.call(a.substring(1))});h.style[K]=o;h[R](n,o);break}}}bM(c,d);m?c.rotate(m.join(q)):S(j)&&c.rotate(j,true)},bL=1.2,bM=function(b,c){if(b.type!="text"||!(c[f]("text")||c[f]("font")||c[f]("font-size")||c[f]("x")||c[f]("y")))return;var d=b.attrs,e=b.node,h=e.firstChild?T(g.defaultView.getComputedStyle(e.firstChild,p).getPropertyValue("font-size"),10):10;if(c[f]("text")){d.text=c.text;while(e.firstChild)e.removeChild(e.firstChild);var i=r(c.text)[s]("\n");for(var j=0,k=i[w];j<k;j++)if(i[j]){var m=bG("tspan");j&&bG(m,{dy:h*bL,x:d.x});m[l](g.createTextNode(i[j]));e[l](m)}}else{i=e.getElementsByTagName("tspan");for(j=0,k=i[w];j<k;j++)j&&bG(i[j],{dy:h*bL,x:d.x})}bG(e,{y:d.y});var n=b.getBBox(),o=d.y-(n.y+n.height/2);o&&a.is(o,"finite")&&bG(e,{y:d.y+o})},bN=function(b,c){var d=0,e=0;this[0]=b;this.id=a._oid++;this.node=b;b.raphael=this;this.paper=c;this.attrs=this.attrs||{};this.transformations=[];this._={tx:0,ty:0,rt:{deg:0,cx:0,cy:0},sx:1,sy:1};!c.bottom&&(c.bottom=this);this.prev=c.top;c.top&&(c.top.next=this);c.top=this;this.next=null},bO=bN[e];bN[e].rotate=function(c,d,e){if(this.removed)return this;if(c==null){if(this._.rt.cx)return[this._.rt.deg,this._.rt.cx,this._.rt.cy][v](q);return this._.rt.deg}var f=this.getBBox();c=r(c)[s](b);if(c[w]-1){d=S(c[1]);e=S(c[2])}c=S(c[0]);d!=null&&d!==false?this._.rt.deg=c:this._.rt.deg+=c;e==null&&(d=null);this._.rt.cx=d;this._.rt.cy=e;d=d==null?f.x+f.width/2:d;e=e==null?f.y+f.height/2:e;if(this._.rt.deg){this.transformations[0]=a.format("rotate({0} {1} {2})",this._.rt.deg,d,e);this.clip&&bG(this.clip,{transform:a.format("rotate({0} {1} {2})",-this._.rt.deg,d,e)})}else{this.transformations[0]=p;this.clip&&bG(this.clip,{transform:p})}bG(this.node,{transform:this.transformations[v](q)});return this};bN[e].hide=function(){!this.removed&&(this.node.style.display="none");return this};bN[e].show=function(){!this.removed&&(this.node.style.display="");return this};bN[e].remove=function(){if(this.removed)return;bA(this,this.paper);this.node.parentNode.removeChild(this.node);for(var a in this)delete this[a];this.removed=true};bN[e].getBBox=function(){if(this.removed)return this;if(this.type=="path")return bn(this.attrs.path);if(this.node.style.display=="none"){this.show();var a=true}var b={};try{b=this.node.getBBox()}catch(a){}finally{b=b||{}}if(this.type=="text"){b={x:b.x,y:Infinity,width:0,height:0};for(var c=0,d=this.node.getNumberOfChars();c<d;c++){var e=this.node.getExtentOfChar(c);e.y<b.y&&(b.y=e.y);e.y+e.height-b.y>b.height&&(b.height=e.y+e.height-b.y);e.x+e.width-b.x>b.width&&(b.width=e.x+e.width-b.x)}}a&&this.hide();return b};bN[e].attr=function(b,c){if(this.removed)return this;if(b==null){var d={};for(var e in this.attrs)this.attrs[f](e)&&(d[e]=this.attrs[e]);this._.rt.deg&&(d.rotation=this.rotate());(this._.sx!=1||this._.sy!=1)&&(d.scale=this.scale());d.gradient&&d.fill=="none"&&(d.fill=d.gradient)&&delete d.gradient;return d}if(c==null&&a.is(b,F)){if(b=="translation")return cz.call(this);if(b=="rotation")return this.rotate();if(b=="scale")return this.scale();if(b==I&&this.attrs.fill=="none"&&this.attrs.gradient)return this.attrs.gradient;return this.attrs[b]}if(c==null&&a.is(b,G)){var g={};for(var h=0,i=b.length;h<i;h++)g[b[h]]=this.attr(b[h]);return g}if(c!=null){var j={};j[b]=c}else b!=null&&a.is(b,"object")&&(j=b);for(var k in this.paper.customAttributes)if(this.paper.customAttributes[f](k)&&j[f](k)&&a.is(this.paper.customAttributes[k],"function")){var l=this.paper.customAttributes[k].apply(this,[][n](j[k]));this.attrs[k]=j[k];for(var m in l)l[f](m)&&(j[m]=l[m])}bK(this,j);return this};bN[e].toFront=function(){if(this.removed)return this;this.node.parentNode[l](this.node);var a=this.paper;a.top!=this&&bB(this,a);return this};bN[e].toBack=function(){if(this.removed)return this;if(this.node.parentNode.firstChild!=this.node){this.node.parentNode.insertBefore(this.node,this.node.parentNode.firstChild);bC(this,this.paper);var a=this.paper}return this};bN[e].insertAfter=function(a){if(this.removed)return this;var b=a.node||a[a.length-1].node;b.nextSibling?b.parentNode.insertBefore(this.node,b.nextSibling):b.parentNode[l](this.node);bD(this,a,this.paper);return this};bN[e].insertBefore=function(a){if(this.removed)return this;var b=a.node||a[0].node;b.parentNode.insertBefore(this.node,b);bE(this,a,this.paper);return this};bN[e].blur=function(a){var b=this;if(+a!==0){var c=bG("filter"),d=bG("feGaussianBlur");b.attrs.blur=a;c.id=bh();bG(d,{stdDeviation:+a||1.5});c.appendChild(d);b.paper.defs.appendChild(c);b._blur=c;bG(b.node,{filter:"url(#"+c.id+")"})}else{if(b._blur){b._blur.parentNode.removeChild(b._blur);delete b._blur;delete b.attrs.blur}b.node.removeAttribute("filter")}};var bP=function(a,b,c,d){var e=bG("circle");a.canvas&&a.canvas[l](e);var f=new bN(e,a);f.attrs={cx:b,cy:c,r:d,fill:"none",stroke:"#000"};f.type="circle";bG(e,f.attrs);return f},bQ=function(a,b,c,d,e,f){var g=bG("rect");a.canvas&&a.canvas[l](g);var h=new bN(g,a);h.attrs={x:b,y:c,width:d,height:e,r:f||0,rx:f||0,ry:f||0,fill:"none",stroke:"#000"};h.type="rect";bG(g,h.attrs);return h},bR=function(a,b,c,d,e){var f=bG("ellipse");a.canvas&&a.canvas[l](f);var g=new bN(f,a);g.attrs={cx:b,cy:c,rx:d,ry:e,fill:"none",stroke:"#000"};g.type="ellipse";bG(f,g.attrs);return g},bS=function(a,b,c,d,e,f){var g=bG("image");bG(g,{x:c,y:d,width:e,height:f,preserveAspectRatio:"none"});g.setAttributeNS(a.xlink,"href",b);a.canvas&&a.canvas[l](g);var h=new bN(g,a);h.attrs={x:c,y:d,width:e,height:f,src:b};h.type="image";return h},bT=function(a,b,c,d){var e=bG("text");bG(e,{x:b,y:c,"text-anchor":"middle"});a.canvas&&a.canvas[l](e);var f=new bN(e,a);f.attrs={x:b,y:c,"text-anchor":"middle",text:d,font:W.font,stroke:"none",fill:"#000"};f.type="text";bK(f,f.attrs);return f},bU=function(a,b){this.width=a||this.width;this.height=b||this.height;this.canvas[R]("width",this.width);this.canvas[R]("height",this.height);return this},bV=function(){var b=by[m](0,arguments),c=b&&b.container,d=b.x,e=b.y,f=b.width,h=b.height;if(!c)throw new Error("SVG container not found.");var i=bG("svg");d=d||0;e=e||0;f=f||512;h=h||342;bG(i,{xmlns:"http://www.w3.org/2000/svg",version:1.1,width:f,height:h});if(c==1){i.style.cssText="position:absolute;left:"+d+"px;top:"+e+"px";g.body[l](i)}else c.firstChild?c.insertBefore(i,c.firstChild):c[l](i);c=new j;c.width=f;c.height=h;c.canvas=i;bz.call(c,c,a.fn);c.clear();return c};k.clear=function(){var a=this.canvas;while(a.firstChild)a.removeChild(a.firstChild);this.bottom=this.top=null;(this.desc=bG("desc"))[l](g.createTextNode("Created with RaphaÃ«l"));a[l](this.desc);a[l](this.defs=bG("defs"))};k.remove=function(){this.canvas.parentNode&&this.canvas.parentNode.removeChild(this.canvas);for(var a in this)this[a]=bF(a)}}if(a.vml){var bW={M:"m",L:"l",C:"c",Z:"x",m:"t",l:"r",c:"v",z:"x"},bX=/([clmz]),?([^clmz]*)/gi,bY=/ progid:\S+Blur\([^\)]+\)/g,bZ=/-?[^,\s-]+/g,b$=1000+q+1000,b_=10,ca={path:1,rect:1},cb=function(a){var b=/[ahqstv]/ig,c=bq;r(a).match(b)&&(c=bw);b=/[clmz]/g;if(c==bq&&!r(a).match(b)){var d=r(a)[Y](bX,function(a,b,c){var d=[],e=x.call(b)=="m",f=bW[b];c[Y](bZ,function(a){if(e&&d[w]==2){f+=d+bW[b=="m"?"l":"L"];d=[]}d[L](Q(a*b_))});return f+d});return d}var e=c(a),f,g;d=[];for(var h=0,i=e[w];h<i;h++){f=e[h];g=x.call(e[h][0]);g=="z"&&(g="x");for(var j=1,k=f[w];j<k;j++)g+=Q(f[j]*b_)+(j!=k-1?",":p);d[L](g)}return d[v](q)};a[H]=function(){return"Your browser doesnâ€™t support SVG. Falling down to VML.\nYou are running RaphaÃ«l "+this.version};bH=function(a,b){var c=cd("group");c.style.cssText="position:absolute;left:0;top:0;width:"+b.width+"px;height:"+b.height+"px";c.coordsize=b.coordsize;c.coordorigin=b.coordorigin;var d=cd("shape"),e=d.style;e.width=b.width+"px";e.height=b.height+"px";d.coordsize=b$;d.coordorigin=b.coordorigin;c[l](d);var f=new bN(d,c,b),g={fill:"none",stroke:"#000"};a&&(g.path=a);f.type="path";f.path=[];f.Path=p;bK(f,g);b.canvas[l](c);return f};bK=function(c,d){c.attrs=c.attrs||{};var e=c.node,h=c.attrs,i=e.style,j,k=(d.x!=h.x||d.y!=h.y||d.width!=h.width||d.height!=h.height||d.r!=h.r)&&c.type=="rect",m=c;for(var n in d)d[f](n)&&(h[n]=d[n]);if(k){h.path=cc(h.x,h.y,h.width,h.height,h.r);c.X=h.x;c.Y=h.y;c.W=h.width;c.H=h.height}d.href&&(e.href=d.href);d.title&&(e.title=d.title);d.target&&(e.target=d.target);d.cursor&&(i.cursor=d.cursor);"blur"in d&&c.blur(d.blur);if(d.path&&c.type=="path"||k)e.path=cb(h.path);d.rotation!=null&&c.rotate(d.rotation,true);if(d.translation){j=r(d.translation)[s](b);cz.call(c,j[0],j[1]);if(c._.rt.cx!=null){c._.rt.cx+=+j[0];c._.rt.cy+=+j[1];c.setBox(c.attrs,j[0],j[1])}}if(d.scale){j=r(d.scale)[s](b);c.scale(+j[0]||1,+j[1]||+j[0]||1,+j[2]||null,+j[3]||null)}if("clip-rect"in d){var o=r(d["clip-rect"])[s](b);if(o[w]==4){o[2]=+o[2]+ +o[0];o[3]=+o[3]+ +o[1];var q=e.clipRect||g.createElement("div"),t=q.style,u=e.parentNode;t.clip=a.format("rect({1}px {2}px {3}px {0}px)",o);if(!e.clipRect){t.position="absolute";t.top=0;t.left=0;t.width=c.paper.width+"px";t.height=c.paper.height+"px";u.parentNode.insertBefore(q,u);q[l](u);e.clipRect=q}}d["clip-rect"]||e.clipRect&&(e.clipRect.style.clip=p)}c.type=="image"&&d.src&&(e.src=d.src);if(c.type=="image"&&d.opacity){e.filterOpacity=U+".Alpha(opacity="+d.opacity*100+")";i.filter=(e.filterMatrix||p)+(e.filterOpacity||p)}d.font&&(i.font=d.font);d["font-family"]&&(i.fontFamily="\""+d["font-family"][s](",")[0][Y](/^['"]+|['"]+$/g,p)+"\"");d["font-size"]&&(i.fontSize=d["font-size"]);d["font-weight"]&&(i.fontWeight=d["font-weight"]);d["font-style"]&&(i.fontStyle=d["font-style"]);if(d.opacity!=null||d["stroke-width"]!=null||d.fill!=null||d.stroke!=null||d["stroke-width"]!=null||d["stroke-opacity"]!=null||d["fill-opacity"]!=null||d["stroke-dasharray"]!=null||d["stroke-miterlimit"]!=null||d["stroke-linejoin"]!=null||d["stroke-linecap"]!=null){e=c.shape||e;var v=e.getElementsByTagName(I)&&e.getElementsByTagName(I)[0],x=false;!v&&(x=v=cd(I));if("fill-opacity"in d||"opacity"in d){var y=((+h["fill-opacity"]+1||2)-1)*((+h.opacity+1||2)-1)*((+a.getRGB(d.fill).o+1||2)-1);y=A(z(y,0),1);v.opacity=y}d.fill&&(v.on=true);if(v.on==null||d.fill=="none")v.on=false;if(v.on&&d.fill){var B=d.fill.match(M);if(B){v.src=B[1];v.type="tile"}else{v.color=a.getRGB(d.fill).hex;v.src=p;v.type="solid";if(a.getRGB(d.fill).error&&(m.type in{circle:1,ellipse:1}||r(d.fill).charAt()!="r")&&bI(m,d.fill)){h.fill="none";h.gradient=d.fill}}}x&&e[l](v);var C=e.getElementsByTagName("stroke")&&e.getElementsByTagName("stroke")[0],D=false;!C&&(D=C=cd("stroke"));if(d.stroke&&d.stroke!="none"||d["stroke-width"]||d["stroke-opacity"]!=null||d["stroke-dasharray"]||d["stroke-miterlimit"]||d["stroke-linejoin"]||d["stroke-linecap"])C.on=true;(d.stroke=="none"||C.on==null||d.stroke==0||d["stroke-width"]==0)&&(C.on=false);var E=a.getRGB(d.stroke);C.on&&d.stroke&&(C.color=E.hex);y=((+h["stroke-opacity"]+1||2)-1)*((+h.opacity+1||2)-1)*((+E.o+1||2)-1);var F=(S(d["stroke-width"])||1)*0.75;y=A(z(y,0),1);d["stroke-width"]==null&&(F=h["stroke-width"]);d["stroke-width"]&&(C.weight=F);F&&F<1&&(y*=F)&&(C.weight=1);C.opacity=y;d["stroke-linejoin"]&&(C.joinstyle=d["stroke-linejoin"]||"miter");C.miterlimit=d["stroke-miterlimit"]||8;d["stroke-linecap"]&&(C.endcap=d["stroke-linecap"]=="butt"?"flat":d["stroke-linecap"]=="square"?"square":"round");if(d["stroke-dasharray"]){var G={"-":"shortdash",".":"shortdot","-.":"shortdashdot","-..":"shortdashdotdot",". ":"dot","- ":"dash","--":"longdash","- .":"dashdot","--.":"longdashdot","--..":"longdashdotdot"};C.dashstyle=G[f](d["stroke-dasharray"])?G[d["stroke-dasharray"]]:p}D&&e[l](C)}if(m.type=="text"){i=m.paper.span.style;h.font&&(i.font=h.font);h["font-family"]&&(i.fontFamily=h["font-family"]);h["font-size"]&&(i.fontSize=h["font-size"]);h["font-weight"]&&(i.fontWeight=h["font-weight"]);h["font-style"]&&(i.fontStyle=h["font-style"]);m.node.string&&(m.paper.span.innerHTML=r(m.node.string)[Y](/</g,"&#60;")[Y](/&/g,"&#38;")[Y](/\n/g,"<br>"));m.W=h.w=m.paper.span.offsetWidth;m.H=h.h=m.paper.span.offsetHeight;m.X=h.x;m.Y=h.y+Q(m.H/2);switch(h["text-anchor"]){case"start":m.node.style["v-text-align"]="left";m.bbx=Q(m.W/2);break;case"end":m.node.style["v-text-align"]="right";m.bbx=-Q(m.W/2);break;default:m.node.style["v-text-align"]="center";break}}};bI=function(a,b){a.attrs=a.attrs||{};var c=a.attrs,d,e="linear",f=".5 .5";a.attrs.gradient=b;b=r(b)[Y](bd,function(a,b,c){e="radial";if(b&&c){b=S(b);c=S(c);C(b-0.5,2)+C(c-0.5,2)>0.25&&(c=y.sqrt(0.25-C(b-0.5,2))*((c>0.5)*2-1)+0.5);f=b+q+c}return p});b=b[s](/\s*\-\s*/);if(e=="linear"){var g=b.shift();g=-S(g);if(isNaN(g))return null}var h=bx(b);if(!h)return null;a=a.shape||a.node;d=a.getElementsByTagName(I)[0]||cd(I);!d.parentNode&&a.appendChild(d);if(h[w]){d.on=true;d.method="none";d.color=h[0].color;d.color2=h[h[w]-1].color;var i=[];for(var j=0,k=h[w];j<k;j++)h[j].offset&&i[L](h[j].offset+q+h[j].color);d.colors&&(d.colors.value=i[w]?i[v]():"0% "+d.color);if(e=="radial"){d.type="gradientradial";d.focus="100%";d.focussize=f;d.focusposition=f}else{d.type="gradient";d.angle=(270-g)%360}}return 1};bN=function(b,c,d){var e=0,f=0,g=0,h=1;this[0]=b;this.id=a._oid++;this.node=b;b.raphael=this;this.X=0;this.Y=0;this.attrs={};this.Group=c;this.paper=d;this._={tx:0,ty:0,rt:{deg:0},sx:1,sy:1};!d.bottom&&(d.bottom=this);this.prev=d.top;d.top&&(d.top.next=this);d.top=this;this.next=null};bO=bN[e];bO.rotate=function(a,c,d){if(this.removed)return this;if(a==null){if(this._.rt.cx)return[this._.rt.deg,this._.rt.cx,this._.rt.cy][v](q);return this._.rt.deg}a=r(a)[s](b);if(a[w]-1){c=S(a[1]);d=S(a[2])}a=S(a[0]);c!=null?this._.rt.deg=a:this._.rt.deg+=a;d==null&&(c=null);this._.rt.cx=c;this._.rt.cy=d;this.setBox(this.attrs,c,d);this.Group.style.rotation=this._.rt.deg;return this};bO.setBox=function(a,b,c){if(this.removed)return this;var d=this.Group.style,e=this.shape&&this.shape.style||this.node.style;a=a||{};for(var g in a)a[f](g)&&(this.attrs[g]=a[g]);b=b||this._.rt.cx;c=c||this._.rt.cy;var h=this.attrs,i,j,k,l;switch(this.type){case"circle":i=h.cx-h.r;j=h.cy-h.r;k=l=h.r*2;break;case"ellipse":i=h.cx-h.rx;j=h.cy-h.ry;k=h.rx*2;l=h.ry*2;break;case"image":i=+h.x;j=+h.y;k=h.width||0;l=h.height||0;break;case"text":this.textpath.v=["m",Q(h.x),", ",Q(h.y-2),"l",Q(h.x)+1,", ",Q(h.y-2)][v](p);i=h.x-Q(this.W/2);j=h.y-this.H/2;k=this.W;l=this.H;break;case"rect":case"path":if(this.attrs.path){var m=bn(this.attrs.path);i=m.x;j=m.y;k=m.width;l=m.height}else{i=0;j=0;k=this.paper.width;l=this.paper.height}break;default:i=0;j=0;k=this.paper.width;l=this.paper.height;break}b=b==null?i+k/2:b;c=c==null?j+l/2:c;var n=b-this.paper.width/2,o=c-this.paper.height/2,q;d.left!=(q=n+"px")&&(d.left=q);d.top!=(q=o+"px")&&(d.top=q);this.X=ca[f](this.type)?-n:i;this.Y=ca[f](this.type)?-o:j;this.W=k;this.H=l;if(ca[f](this.type)){e.left!=(q=-n*b_+"px")&&(e.left=q);e.top!=(q=-o*b_+"px")&&(e.top=q)}else if(this.type=="text"){e.left!=(q=-n+"px")&&(e.left=q);e.top!=(q=-o+"px")&&(e.top=q)}else{d.width!=(q=this.paper.width+"px")&&(d.width=q);d.height!=(q=this.paper.height+"px")&&(d.height=q);e.left!=(q=i-n+"px")&&(e.left=q);e.top!=(q=j-o+"px")&&(e.top=q);e.width!=(q=k+"px")&&(e.width=q);e.height!=(q=l+"px")&&(e.height=q)}};bO.hide=function(){!this.removed&&(this.Group.style.display="none");return this};bO.show=function(){!this.removed&&(this.Group.style.display="block");return this};bO.getBBox=function(){if(this.removed)return this;if(ca[f](this.type))return bn(this.attrs.path);return{x:this.X+(this.bbx||0),y:this.Y,width:this.W,height:this.H}};bO.remove=function(){if(this.removed)return;bA(this,this.paper);this.node.parentNode.removeChild(this.node);this.Group.parentNode.removeChild(this.Group);this.shape&&this.shape.parentNode.removeChild(this.shape);for(var a in this)delete this[a];this.removed=true};bO.attr=function(b,c){if(this.removed)return this;if(b==null){var d={};for(var e in this.attrs)this.attrs[f](e)&&(d[e]=this.attrs[e]);this._.rt.deg&&(d.rotation=this.rotate());(this._.sx!=1||this._.sy!=1)&&(d.scale=this.scale());d.gradient&&d.fill=="none"&&(d.fill=d.gradient)&&delete d.gradient;return d}if(c==null&&a.is(b,"string")){if(b=="translation")return cz.call(this);if(b=="rotation")return this.rotate();if(b=="scale")return this.scale();if(b==I&&this.attrs.fill=="none"&&this.attrs.gradient)return this.attrs.gradient;return this.attrs[b]}if(this.attrs&&c==null&&a.is(b,G)){var g,h={};for(e=0,g=b[w];e<g;e++)h[b[e]]=this.attr(b[e]);return h}var i;if(c!=null){i={};i[b]=c}c==null&&a.is(b,"object")&&(i=b);if(i){for(var j in this.paper.customAttributes)if(this.paper.customAttributes[f](j)&&i[f](j)&&a.is(this.paper.customAttributes[j],"function")){var k=this.paper.customAttributes[j].apply(this,[][n](i[j]));this.attrs[j]=i[j];for(var l in k)k[f](l)&&(i[l]=k[l])}i.text&&this.type=="text"&&(this.node.string=i.text);bK(this,i);i.gradient&&(({circle:1,ellipse:1})[f](this.type)||r(i.gradient).charAt()!="r")&&bI(this,i.gradient);(!ca[f](this.type)||this._.rt.deg)&&this.setBox(this.attrs)}return this};bO.toFront=function(){!this.removed&&this.Group.parentNode[l](this.Group);this.paper.top!=this&&bB(this,this.paper);return this};bO.toBack=function(){if(this.removed)return this;if(this.Group.parentNode.firstChild!=this.Group){this.Group.parentNode.insertBefore(this.Group,this.Group.parentNode.firstChild);bC(this,this.paper)}return this};bO.insertAfter=function(a){if(this.removed)return this;a.constructor==cC&&(a=a[a.length-1]);a.Group.nextSibling?a.Group.parentNode.insertBefore(this.Group,a.Group.nextSibling):a.Group.parentNode[l](this.Group);bD(this,a,this.paper);return this};bO.insertBefore=function(a){if(this.removed)return this;a.constructor==cC&&(a=a[0]);a.Group.parentNode.insertBefore(this.Group,a.Group);bE(this,a,this.paper);return this};bO.blur=function(b){var c=this.node.runtimeStyle,d=c.filter;d=d.replace(bY,p);if(+b!==0){this.attrs.blur=b;c.filter=d+q+U+".Blur(pixelradius="+(+b||1.5)+")";c.margin=a.format("-{0}px 0 0 -{0}px",Q(+b||1.5))}else{c.filter=d;c.margin=0;delete this.attrs.blur}};bP=function(a,b,c,d){var e=cd("group"),f=cd("oval"),g=f.style;e.style.cssText="position:absolute;left:0;top:0;width:"+a.width+"px;height:"+a.height+"px";e.coordsize=b$;e.coordorigin=a.coordorigin;e[l](f);var h=new bN(f,e,a);h.type="circle";bK(h,{stroke:"#000",fill:"none"});h.attrs.cx=b;h.attrs.cy=c;h.attrs.r=d;h.setBox({x:b-d,y:c-d,width:d*2,height:d*2});a.canvas[l](e);return h};function cc(b,c,d,e,f){return f?a.format("M{0},{1}l{2},0a{3},{3},0,0,1,{3},{3}l0,{5}a{3},{3},0,0,1,{4},{3}l{6},0a{3},{3},0,0,1,{4},{4}l0,{7}a{3},{3},0,0,1,{3},{4}z",b+f,c,d-f*2,f,-f,e-f*2,f*2-d,f*2-e):a.format("M{0},{1}l{2},0,0,{3},{4},0z",b,c,d,e,-d)}bQ=function(a,b,c,d,e,f){var g=cc(b,c,d,e,f),h=a.path(g),i=h.attrs;h.X=i.x=b;h.Y=i.y=c;h.W=i.width=d;h.H=i.height=e;i.r=f;i.path=g;h.type="rect";return h};bR=function(a,b,c,d,e){var f=cd("group"),g=cd("oval"),h=g.style;f.style.cssText="position:absolute;left:0;top:0;width:"+a.width+"px;height:"+a.height+"px";f.coordsize=b$;f.coordorigin=a.coordorigin;f[l](g);var i=new bN(g,f,a);i.type="ellipse";bK(i,{stroke:"#000"});i.attrs.cx=b;i.attrs.cy=c;i.attrs.rx=d;i.attrs.ry=e;i.setBox({x:b-d,y:c-e,width:d*2,height:e*2});a.canvas[l](f);return i};bS=function(a,b,c,d,e,f){var g=cd("group"),h=cd("image");g.style.cssText="position:absolute;left:0;top:0;width:"+a.width+"px;height:"+a.height+"px";g.coordsize=b$;g.coordorigin=a.coordorigin;h.src=b;g[l](h);var i=new bN(h,g,a);i.type="image";i.attrs.src=b;i.attrs.x=c;i.attrs.y=d;i.attrs.w=e;i.attrs.h=f;i.setBox({x:c,y:d,width:e,height:f});a.canvas[l](g);return i};bT=function(b,c,d,e){var f=cd("group"),g=cd("shape"),h=g.style,i=cd("path"),j=i.style,k=cd("textpath");f.style.cssText="position:absolute;left:0;top:0;width:"+b.width+"px;height:"+b.height+"px";f.coordsize=b$;f.coordorigin=b.coordorigin;i.v=a.format("m{0},{1}l{2},{1}",Q(c*10),Q(d*10),Q(c*10)+1);i.textpathok=true;h.width=b.width;h.height=b.height;k.string=r(e);k.on=true;g[l](k);g[l](i);f[l](g);var m=new bN(k,f,b);m.shape=g;m.textpath=i;m.type="text";m.attrs.text=e;m.attrs.x=c;m.attrs.y=d;m.attrs.w=1;m.attrs.h=1;bK(m,{font:W.font,stroke:"none",fill:"#000"});m.setBox();b.canvas[l](f);return m};bU=function(a,b){var c=this.canvas.style;a==+a&&(a+="px");b==+b&&(b+="px");c.width=a;c.height=b;c.clip="rect(0 "+a+" "+b+" 0)";return this};var cd;g.createStyleSheet().addRule(".rvml","behavior:url(#default#VML)");try{!g.namespaces.rvml&&g.namespaces.add("rvml","urn:schemas-microsoft-com:vml");cd=function(a){return g.createElement("<rvml:"+a+" class=\"rvml\">")}}catch(a){cd=function(a){return g.createElement("<"+a+" xmlns=\"urn:schemas-microsoft.com:vml\" class=\"rvml\">")}}bV=function(){var b=by[m](0,arguments),c=b.container,d=b.height,e,f=b.width,h=b.x,i=b.y;if(!c)throw new Error("VML container not found.");var k=new j,n=k.canvas=g.createElement("div"),o=n.style;h=h||0;i=i||0;f=f||512;d=d||342;f==+f&&(f+="px");d==+d&&(d+="px");k.width=1000;k.height=1000;k.coordsize=b_*1000+q+b_*1000;k.coordorigin="0 0";k.span=g.createElement("span");k.span.style.cssText="position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;display:inline;";n[l](k.span);o.cssText=a.format("top:0;left:0;width:{0};height:{1};display:inline-block;position:relative;clip:rect(0 {0} {1} 0);overflow:hidden",f,d);if(c==1){g.body[l](n);o.left=h+"px";o.top=i+"px";o.position="absolute"}else c.firstChild?c.insertBefore(n,c.firstChild):c[l](n);bz.call(k,k,a.fn);return k};k.clear=function(){this.canvas.innerHTML=p;this.span=g.createElement("span");this.span.style.cssText="position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;display:inline;";this.canvas[l](this.span);this.bottom=this.top=null};k.remove=function(){this.canvas.parentNode.removeChild(this.canvas);for(var a in this)this[a]=bF(a);return true}}var ce=navigator.userAgent.match(/Version\\x2f(.*?)\s/);navigator.vendor=="Apple Computer, Inc."&&(ce&&ce[1]<4||navigator.platform.slice(0,2)=="iP")?k.safari=function(){var a=this.rect(-99,-99,this.width+99,this.height+99).attr({stroke:"none"});h.setTimeout(function(){a.remove()})}:k.safari=function(){};var cf=function(){this.returnValue=false},cg=function(){return this.originalEvent.preventDefault()},ch=function(){this.cancelBubble=true},ci=function(){return this.originalEvent.stopPropagation()},cj=(function(){{if(g.addEventListener)return function(a,b,c,d){var e=o&&u[b]?u[b]:b,g=function(e){if(o&&u[f](b))for(var g=0,h=e.targetTouches&&e.targetTouches.length;g<h;g++){if(e.targetTouches[g].target==a){var i=e;e=e.targetTouches[g];e.originalEvent=i;e.preventDefault=cg;e.stopPropagation=ci;break}}return c.call(d,e)};a.addEventListener(e,g,false);return function(){a.removeEventListener(e,g,false);return true}};if(g.attachEvent)return function(a,b,c,d){var e=function(a){a=a||h.event;a.preventDefault=a.preventDefault||cf;a.stopPropagation=a.stopPropagation||ch;return c.call(d,a)};a.attachEvent("on"+b,e);var f=function(){a.detachEvent("on"+b,e);return true};return f}}})(),ck=[],cl=function(a){var b=a.clientX,c=a.clientY,d=g.documentElement.scrollTop||g.body.scrollTop,e=g.documentElement.scrollLeft||g.body.scrollLeft,f,h=ck.length;while(h--){f=ck[h];if(o){var i=a.touches.length,j;while(i--){j=a.touches[i];if(j.identifier==f.el._drag.id){b=j.clientX;c=j.clientY;(a.originalEvent?a.originalEvent:a).preventDefault();break}}}else a.preventDefault();b+=e;c+=d;f.move&&f.move.call(f.move_scope||f.el,b-f.el._drag.x,c-f.el._drag.y,b,c,a)}},cm=function(b){a.unmousemove(cl).unmouseup(cm);var c=ck.length,d;while(c--){d=ck[c];d.el._drag={};d.end&&d.end.call(d.end_scope||d.start_scope||d.move_scope||d.el,b)}ck=[]};for(var cn=t[w];cn--;)(function(b){a[b]=bN[e][b]=function(c,d){if(a.is(c,"function")){this.events=this.events||[];this.events.push({name:b,f:c,unbind:cj(this.shape||this.node||g,b,c,d||this)})}return this};a["un"+b]=bN[e]["un"+b]=function(a){var c=this.events,d=c[w];while(d--)if(c[d].name==b&&c[d].f==a){c[d].unbind();c.splice(d,1);!c.length&&delete this.events;return this}return this}})(t[cn]);bO.hover=function(a,b,c,d){return this.mouseover(a,c).mouseout(b,d||c)};bO.unhover=function(a,b){return this.unmouseover(a).unmouseout(b)};bO.drag=function(b,c,d,e,f,h){this._drag={};this.mousedown(function(i){(i.originalEvent||i).preventDefault();var j=g.documentElement.scrollTop||g.body.scrollTop,k=g.documentElement.scrollLeft||g.body.scrollLeft;this._drag.x=i.clientX+k;this._drag.y=i.clientY+j;this._drag.id=i.identifier;c&&c.call(f||e||this,i.clientX+k,i.clientY+j,i);!ck.length&&a.mousemove(cl).mouseup(cm);ck.push({el:this,move:b,end:d,move_scope:e,start_scope:f,end_scope:h})});return this};bO.undrag=function(b,c,d){var e=ck.length;while(e--)ck[e].el==this&&(ck[e].move==b&&ck[e].end==d)&&ck.splice(e++,1);!ck.length&&a.unmousemove(cl).unmouseup(cm)};k.circle=function(a,b,c){return bP(this,a||0,b||0,c||0)};k.rect=function(a,b,c,d,e){return bQ(this,a||0,b||0,c||0,d||0,e||0)};k.ellipse=function(a,b,c,d){return bR(this,a||0,b||0,c||0,d||0)};k.path=function(b){b&&!a.is(b,F)&&!a.is(b[0],G)&&(b+=p);return bH(a.format[m](a,arguments),this)};k.image=function(a,b,c,d,e){return bS(this,a||"about:blank",b||0,c||0,d||0,e||0)};k.text=function(a,b,c){return bT(this,a||0,b||0,r(c))};k.set=function(a){arguments[w]>1&&(a=Array[e].splice.call(arguments,0,arguments[w]));return new cC(a)};k.setSize=bU;k.top=k.bottom=null;k.raphael=a;function co(){return this.x+q+this.y}bO.resetScale=function(){if(this.removed)return this;this._.sx=1;this._.sy=1;this.attrs.scale="1 1"};bO.scale=function(a,b,c,d){if(this.removed)return this;if(a==null&&b==null)return{x:this._.sx,y:this._.sy,toString:co};b=b||a;!(+b)&&(b=a);var e,f,g,h,i=this.attrs;if(a!=0){var j=this.getBBox(),k=j.x+j.width/2,l=j.y+j.height/2,m=B(a/this._.sx),o=B(b/this._.sy);c=+c||c==0?c:k;d=+d||d==0?d:l;var r=this._.sx>0,s=this._.sy>0,t=~(~(a/B(a))),u=~(~(b/B(b))),x=m*t,y=o*u,z=this.node.style,A=c+B(k-c)*x*(k>c==r?1:-1),C=d+B(l-d)*y*(l>d==s?1:-1),D=a*t>b*u?o:m;switch(this.type){case"rect":case"image":var E=i.width*m,F=i.height*o;this.attr({height:F,r:i.r*D,width:E,x:A-E/2,y:C-F/2});break;case"circle":case"ellipse":this.attr({rx:i.rx*m,ry:i.ry*o,r:i.r*D,cx:A,cy:C});break;case"text":this.attr({x:A,y:C});break;case"path":var G=bp(i.path),H=true,I=r?x:m,J=s?y:o;for(var K=0,L=G[w];K<L;K++){var M=G[K],N=V.call(M[0]);{if(N=="M"&&H)continue;H=false}if(N=="A"){M[G[K][w]-2]*=I;M[G[K][w]-1]*=J;M[1]*=m;M[2]*=o;M[5]=+(t+u?!(!(+M[5])):!(+M[5]))}else if(N=="H")for(var O=1,P=M[w];O<P;O++)M[O]*=I;else if(N=="V")for(O=1,P=M[w];O<P;O++)M[O]*=J;else for(O=1,P=M[w];O<P;O++)M[O]*=O%2?I:J}var Q=bn(G);e=A-Q.x-Q.width/2;f=C-Q.y-Q.height/2;G[0][1]+=e;G[0][2]+=f;this.attr({path:G});break}if(this.type in{text:1,image:1}&&(t!=1||u!=1))if(this.transformations){this.transformations[2]="scale("[n](t,",",u,")");this.node[R]("transform",this.transformations[v](q));e=t==-1?-i.x-(E||0):i.x;f=u==-1?-i.y-(F||0):i.y;this.attr({x:e,y:f});i.fx=t-1;i.fy=u-1}else{this.node.filterMatrix=U+".Matrix(M11="[n](t,", M12=0, M21=0, M22=",u,", Dx=0, Dy=0, sizingmethod='auto expand', filtertype='bilinear')");z.filter=(this.node.filterMatrix||p)+(this.node.filterOpacity||p)}else if(this.transformations){this.transformations[2]=p;this.node[R]("transform",this.transformations[v](q));i.fx=0;i.fy=0}else{this.node.filterMatrix=p;z.filter=(this.node.filterMatrix||p)+(this.node.filterOpacity||p)}i.scale=[a,b,c,d][v](q);this._.sx=a;this._.sy=b}return this};bO.clone=function(){if(this.removed)return null;var a=this.attr();delete a.scale;delete a.translation;return this.paper[this.type]().attr(a)};var cp={},cq=function(b,c,d,e,f,g,h,i,j){var k=0,l=100,m=[b,c,d,e,f,g,h,i].join(),n=cp[m],o,p;!n&&(cp[m]=n={data:[]});n.timer&&clearTimeout(n.timer);n.timer=setTimeout(function(){delete cp[m]},2000);if(j!=null){var q=cq(b,c,d,e,f,g,h,i);l=~(~q)*10}for(var r=0;r<l+1;r++){if(n.data[j]>r)p=n.data[r*l];else{p=a.findDotsAtSegment(b,c,d,e,f,g,h,i,r/l);n.data[r]=p}r&&(k+=C(C(o.x-p.x,2)+C(o.y-p.y,2),0.5));if(j!=null&&k>=j)return p;o=p}if(j==null)return k},cr=function(b,c){return function(d,e,f){d=bw(d);var g,h,i,j,k="",l={},m,n=0;for(var o=0,p=d.length;o<p;o++){i=d[o];if(i[0]=="M"){g=+i[1];h=+i[2]}else{j=cq(g,h,i[1],i[2],i[3],i[4],i[5],i[6]);if(n+j>e){if(c&&!l.start){m=cq(g,h,i[1],i[2],i[3],i[4],i[5],i[6],e-n);k+=["C",m.start.x,m.start.y,m.m.x,m.m.y,m.x,m.y];if(f)return k;l.start=k;k=["M",m.x,m.y+"C",m.n.x,m.n.y,m.end.x,m.end.y,i[5],i[6]][v]();n+=j;g=+i[5];h=+i[6];continue}if(!b&&!c){m=cq(g,h,i[1],i[2],i[3],i[4],i[5],i[6],e-n);return{x:m.x,y:m.y,alpha:m.alpha}}}n+=j;g=+i[5];h=+i[6]}k+=i}l.end=k;m=b?n:c?l:a.findDotsAtSegment(g,h,i[1],i[2],i[3],i[4],i[5],i[6],1);m.alpha&&(m={x:m.x,y:m.y,alpha:m.alpha});return m}},cs=cr(1),ct=cr(),cu=cr(0,1);bO.getTotalLength=function(){if(this.type!="path")return;if(this.node.getTotalLength)return this.node.getTotalLength();return cs(this.attrs.path)};bO.getPointAtLength=function(a){if(this.type!="path")return;return ct(this.attrs.path,a)};bO.getSubpath=function(a,b){if(this.type!="path")return;if(B(this.getTotalLength()-b)<"1e-6")return cu(this.attrs.path,a).end;var c=cu(this.attrs.path,b,1);return a?cu(c,a).end:c};a.easing_formulas={linear:function(a){return a},"<":function(a){return C(a,3)},">":function(a){return C(a-1,3)+1},"<>":function(a){a=a*2;if(a<1)return C(a,3)/2;a-=2;return(C(a,3)+2)/2},backIn:function(a){var b=1.70158;return a*a*((b+1)*a-b)},backOut:function(a){a=a-1;var b=1.70158;return a*a*((b+1)*a+b)+1},elastic:function(a){if(a==0||a==1)return a;var b=0.3,c=b/4;return C(2,-10*a)*y.sin((a-c)*(2*D)/b)+1},bounce:function(a){var b=7.5625,c=2.75,d;if(a<1/c)d=b*a*a;else if(a<2/c){a-=1.5/c;d=b*a*a+0.75}else if(a<2.5/c){a-=2.25/c;d=b*a*a+0.9375}else{a-=2.625/c;d=b*a*a+0.984375}return d}};var cv=[],cw=function(){var b=+(new Date);for(var c=0;c<cv[w];c++){var d=cv[c];if(d.stop||d.el.removed)continue;var e=b-d.start,g=d.ms,h=d.easing,i=d.from,j=d.diff,k=d.to,l=d.t,m=d.el,n={},o;if(e<g){var r=h(e/g);for(var s in i)if(i[f](s)){switch(X[s]){case"along":o=r*g*j[s];k.back&&(o=k.len-o);var t=ct(k[s],o);m.translate(j.sx-j.x||0,j.sy-j.y||0);j.x=t.x;j.y=t.y;m.translate(t.x-j.sx,t.y-j.sy);k.rot&&m.rotate(j.r+t.alpha,t.x,t.y);break;case E:o=+i[s]+r*g*j[s];break;case"colour":o="rgb("+[cy(Q(i[s].r+r*g*j[s].r)),cy(Q(i[s].g+r*g*j[s].g)),cy(Q(i[s].b+r*g*j[s].b))][v](",")+")";break;case"path":o=[];for(var u=0,x=i[s][w];u<x;u++){o[u]=[i[s][u][0]];for(var y=1,z=i[s][u][w];y<z;y++)o[u][y]=+i[s][u][y]+r*g*j[s][u][y];o[u]=o[u][v](q)}o=o[v](q);break;case"csv":switch(s){case"translation":var A=r*g*j[s][0]-l.x,B=r*g*j[s][1]-l.y;l.x+=A;l.y+=B;o=A+q+B;break;case"rotation":o=+i[s][0]+r*g*j[s][0];i[s][1]&&(o+=","+i[s][1]+","+i[s][2]);break;case"scale":o=[+i[s][0]+r*g*j[s][0],+i[s][1]+r*g*j[s][1],2 in k[s]?k[s][2]:p,3 in k[s]?k[s][3]:p][v](q);break;case"clip-rect":o=[];u=4;while(u--)o[u]=+i[s][u]+r*g*j[s][u];break}break;default:var C=[].concat(i[s]);o=[];u=m.paper.customAttributes[s].length;while(u--)o[u]=+C[u]+r*g*j[s][u];break}n[s]=o}m.attr(n);m._run&&m._run.call(m)}else{if(k.along){t=ct(k.along,k.len*!k.back);m.translate(j.sx-(j.x||0)+t.x-j.sx,j.sy-(j.y||0)+t.y-j.sy);k.rot&&m.rotate(j.r+t.alpha,t.x,t.y)}(l.x||l.y)&&m.translate(-l.x,-l.y);k.scale&&(k.scale+=p);m.attr(k);cv.splice(c--,1)}}a.svg&&m&&m.paper&&m.paper.safari();cv[w]&&setTimeout(cw)},cx=function(b,c,d,e,f){var g=d-e;c.timeouts.push(setTimeout(function(){a.is(f,"function")&&f.call(c);c.animate(b,g,b.easing)},e))},cy=function(a){return z(A(a,255),0)},cz=function(a,b){if(a==null)return{x:this._.tx,y:this._.ty,toString:co};this._.tx+=+a;this._.ty+=+b;switch(this.type){case"circle":case"ellipse":this.attr({cx:+a+this.attrs.cx,cy:+b+this.attrs.cy});break;case"rect":case"image":case"text":this.attr({x:+a+this.attrs.x,y:+b+this.attrs.y});break;case"path":var c=bp(this.attrs.path);c[0][1]+=+a;c[0][2]+=+b;this.attr({path:c});break}return this};bO.animateWith=function(a,b,c,d,e){for(var f=0,g=cv.length;f<g;f++)cv[f].el.id==a.id&&(b.start=cv[f].start);return this.animate(b,c,d,e)};bO.animateAlong=cA();bO.animateAlongBack=cA(1);function cA(b){return function(c,d,e,f){var g={back:b};a.is(e,"function")?f=e:g.rot=e;c&&c.constructor==bN&&(c=c.attrs.path);c&&(g.along=c);return this.animate(g,d,f)}}function cB(a,b,c,d,e,f){var g=3*b,h=3*(d-b)-g,i=1-g-h,j=3*c,k=3*(e-c)-j,l=1-j-k;function m(a){return((i*a+h)*a+g)*a}function n(a,b){var c=o(a,b);return((l*c+k)*c+j)*c}function o(a,b){var c,d,e,f,j,k;for(e=a,k=0;k<8;k++){f=m(e)-a;if(B(f)<b)return e;j=(3*i*e+2*h)*e+g;if(B(j)<0.000001)break;e=e-f/j}c=0;d=1;e=a;if(e<c)return c;if(e>d)return d;while(c<d){f=m(e);if(B(f-a)<b)return e;a>f?c=e:d=e;e=(d-c)/2+c}return e}return n(a,1/(200*f))}bO.onAnimation=function(a){this._run=a||0;return this};bO.animate=function(c,d,e,g){var h=this;h.timeouts=h.timeouts||[];if(a.is(e,"function")||!e)g=e||null;if(h.removed){g&&g.call(h);return h}var i={},j={},k=false,l={};for(var m in c)if(c[f](m)){if(X[f](m)||h.paper.customAttributes[f](m)){k=true;i[m]=h.attr(m);i[m]==null&&(i[m]=W[m]);j[m]=c[m];switch(X[m]){case"along":var n=cs(c[m]),o=ct(c[m],n*!(!c.back)),p=h.getBBox();l[m]=n/d;l.tx=p.x;l.ty=p.y;l.sx=o.x;l.sy=o.y;j.rot=c.rot;j.back=c.back;j.len=n;c.rot&&(l.r=S(h.rotate())||0);break;case E:l[m]=(j[m]-i[m])/d;break;case"colour":i[m]=a.getRGB(i[m]);var q=a.getRGB(j[m]);l[m]={r:(q.r-i[m].r)/d,g:(q.g-i[m].g)/d,b:(q.b-i[m].b)/d};break;case"path":var t=bw(i[m],j[m]);i[m]=t[0];var u=t[1];l[m]=[];for(var v=0,x=i[m][w];v<x;v++){l[m][v]=[0];for(var y=1,z=i[m][v][w];y<z;y++)l[m][v][y]=(u[v][y]-i[m][v][y])/d}break;case"csv":var A=r(c[m])[s](b),B=r(i[m])[s](b);switch(m){case"translation":i[m]=[0,0];l[m]=[A[0]/d,A[1]/d];break;case"rotation":i[m]=B[1]==A[1]&&B[2]==A[2]?B:[0,A[1],A[2]];l[m]=[(A[0]-i[m][0])/d,0,0];break;case"scale":c[m]=A;i[m]=r(i[m])[s](b);l[m]=[(A[0]-i[m][0])/d,(A[1]-i[m][1])/d,0,0];break;case"clip-rect":i[m]=r(i[m])[s](b);l[m]=[];v=4;while(v--)l[m][v]=(A[v]-i[m][v])/d;break}j[m]=A;break;default:A=[].concat(c[m]);B=[].concat(i[m]);l[m]=[];v=h.paper.customAttributes[m][w];while(v--)l[m][v]=((A[v]||0)-(B[v]||0))/d;break}}}if(k){var G=a.easing_formulas[e];if(!G){G=r(e).match(P);if(G&&G[w]==5){var H=G;G=function(a){return cB(a,+H[1],+H[2],+H[3],+H[4],d)}}else G=function(a){return a}}cv.push({start:c.start||+(new Date),ms:d,easing:G,from:i,diff:l,to:j,el:h,t:{x:0,y:0}});a.is(g,"function")&&(h._ac=setTimeout(function(){g.call(h)},d));cv[w]==1&&setTimeout(cw)}else{var C=[],D;for(var F in c)if(c[f](F)&&Z.test(F)){m={value:c[F]};F=="from"&&(F=0);F=="to"&&(F=100);m.key=T(F,10);C.push(m)}C.sort(be);C[0].key&&C.unshift({key:0,value:h.attrs});for(v=0,x=C[w];v<x;v++)cx(C[v].value,h,d/100*C[v].key,d/100*(C[v-1]&&C[v-1].key||0),C[v-1]&&C[v-1].value.callback);D=C[C[w]-1].value.callback;D&&h.timeouts.push(setTimeout(function(){D.call(h)},d))}return this};bO.stop=function(){for(var a=0;a<cv.length;a++)cv[a].el.id==this.id&&cv.splice(a--,1);for(a=0,ii=this.timeouts&&this.timeouts.length;a<ii;a++)clearTimeout(this.timeouts[a]);this.timeouts=[];clearTimeout(this._ac);delete this._ac;return this};bO.translate=function(a,b){return this.attr({translation:a+" "+b})};bO[H]=function(){return"RaphaÃ«lâ€™s object"};a.ae=cv;var cC=function(a){this.items=[];this[w]=0;this.type="set";if(a)for(var b=0,c=a[w];b<c;b++){if(a[b]&&(a[b].constructor==bN||a[b].constructor==cC)){this[this.items[w]]=this.items[this.items[w]]=a[b];this[w]++}}};cC[e][L]=function(){var a,b;for(var c=0,d=arguments[w];c<d;c++){a=arguments[c];if(a&&(a.constructor==bN||a.constructor==cC)){b=this.items[w];this[b]=this.items[b]=a;this[w]++}}return this};cC[e].pop=function(){delete this[this[w]--];return this.items.pop()};for(var cD in bO)bO[f](cD)&&(cC[e][cD]=(function(a){return function(){for(var b=0,c=this.items[w];b<c;b++)this.items[b][a][m](this.items[b],arguments);return this}})(cD));cC[e].attr=function(b,c){if(b&&a.is(b,G)&&a.is(b[0],"object"))for(var d=0,e=b[w];d<e;d++)this.items[d].attr(b[d]);else for(var f=0,g=this.items[w];f<g;f++)this.items[f].attr(b,c);return this};cC[e].animate=function(b,c,d,e){(a.is(d,"function")||!d)&&(e=d||null);var f=this.items[w],g=f,h,i=this,j;e&&(j=function(){!(--f)&&e.call(i)});d=a.is(d,F)?d:j;h=this.items[--g].animate(b,c,d,j);while(g--)this.items[g]&&!this.items[g].removed&&this.items[g].animateWith(h,b,c,d,j);return this};cC[e].insertAfter=function(a){var b=this.items[w];while(b--)this.items[b].insertAfter(a);return this};cC[e].getBBox=function(){var a=[],b=[],c=[],d=[];for(var e=this.items[w];e--;){var f=this.items[e].getBBox();a[L](f.x);b[L](f.y);c[L](f.x+f.width);d[L](f.y+f.height)}a=A[m](0,a);b=A[m](0,b);return{x:a,y:b,width:z[m](0,c)-a,height:z[m](0,d)-b}};cC[e].clone=function(a){a=new cC;for(var b=0,c=this.items[w];b<c;b++)a[L](this.items[b].clone());return a};a.registerFont=function(a){if(!a.face)return a;this.fonts=this.fonts||{};var b={w:a.w,face:{},glyphs:{}},c=a.face["font-family"];for(var d in a.face)a.face[f](d)&&(b.face[d]=a.face[d]);this.fonts[c]?this.fonts[c][L](b):this.fonts[c]=[b];if(!a.svg){b.face["units-per-em"]=T(a.face["units-per-em"],10);for(var e in a.glyphs)if(a.glyphs[f](e)){var g=a.glyphs[e];b.glyphs[e]={w:g.w,k:{},d:g.d&&"M"+g.d[Y](/[mlcxtrv]/g,function(a){return({l:"L",c:"C",x:"z",t:"m",r:"l",v:"c"})[a]||"M"})+"z"};if(g.k)for(var h in g.k)g[f](h)&&(b.glyphs[e].k[h]=g.k[h])}}return a};k.getFont=function(b,c,d,e){e=e||"normal";d=d||"normal";c=+c||({normal:400,bold:700,lighter:300,bolder:800})[c]||400;if(!a.fonts)return;var g=a.fonts[b];if(!g){var h=new RegExp("(^|\\s)"+b[Y](/[^\w\d\s+!~.:_-]/g,p)+"(\\s|$)","i");for(var i in a.fonts)if(a.fonts[f](i)){if(h.test(i)){g=a.fonts[i];break}}}var j;if(g)for(var k=0,l=g[w];k<l;k++){j=g[k];if(j.face["font-weight"]==c&&(j.face["font-style"]==d||!j.face["font-style"])&&j.face["font-stretch"]==e)break}return j};k.print=function(c,d,e,f,g,h,i){h=h||"middle";i=z(A(i||0,1),-1);var j=this.set(),k=r(e)[s](p),l=0,m=p,n;a.is(f,e)&&(f=this.getFont(f));if(f){n=(g||16)/f.face["units-per-em"];var o=f.face.bbox.split(b),q=+o[0],t=+o[1]+(h=="baseline"?o[3]-o[1]+ +f.face.descent:(o[3]-o[1])/2);for(var u=0,v=k[w];u<v;u++){var x=u&&f.glyphs[k[u-1]]||{},y=f.glyphs[k[u]];l+=u?(x.w||f.w)+(x.k&&x.k[k[u]]||0)+f.w*i:0;y&&y.d&&j[L](this.path(y.d).attr({fill:"#000",stroke:"none",translation:[l,0]}))}j.scale(n,n,q,t).translate(c-q,d-t)}return j};a.format=function(b,c){var e=a.is(c,G)?[0][n](c):arguments;b&&a.is(b,F)&&e[w]-1&&(b=b[Y](d,function(a,b){return e[++b]==null?p:e[b]}));return b||p};a.ninja=function(){i.was?h.Raphael=i.is:delete Raphael;return a};a.el=bO;a.st=cC[e];i.was?h.Raphael=a:Raphael=a})();
(function() {
	var 
		fullScreenApi = { 
			supportsFullScreen: false,
			isFullScreen: function() { return false; }, 
			requestFullScreen: function() {}, 
			cancelFullScreen: function() {},
			fullScreenEventName: '',
			prefix: ''
		},
		browserPrefixes = 'webkit moz o ms khtml'.split(' ');
	
	// check for native support
	if (typeof document.cancelFullScreen != 'undefined') {
		fullScreenApi.supportsFullScreen = true;
	} else {	 
		// check for fullscreen support by vendor prefix
		for (var i = 0, il = browserPrefixes.length; i < il; i++ ) {
			fullScreenApi.prefix = browserPrefixes[i];
			
			if (typeof document[fullScreenApi.prefix + 'CancelFullScreen' ] != 'undefined' ) {
				fullScreenApi.supportsFullScreen = true;
				
				break;
			}
		}
	}
	
	// update methods to do something useful
	if (fullScreenApi.supportsFullScreen) {
		fullScreenApi.fullScreenEventName = fullScreenApi.prefix + 'fullscreenchange';
		
		fullScreenApi.isFullScreen = function() {
			switch (this.prefix) {	
				case '':
					return document.fullScreen;
				case 'webkit':
					return document.webkitIsFullScreen;
				default:
					return document[this.prefix + 'FullScreen'];
			}
		}
		fullScreenApi.requestFullScreen = function(el) {
			return (this.prefix === '') ? el.requestFullScreen() : el[this.prefix + 'RequestFullScreen']();
		}
		fullScreenApi.cancelFullScreen = function(el) {
			return (this.prefix === '') ? document.cancelFullScreen() : document[this.prefix + 'CancelFullScreen']();
		}		
	}

	// jQuery plugin
	if (typeof jQuery != 'undefined') {
		jQuery.fn.requestFullScreen = function() {
	
			return this.each(function() {
				var el = jQuery(this);
				if (fullScreenApi.supportsFullScreen) {
					fullScreenApi.requestFullScreen(el);
				}
			});
		};
	}

	// export api
	window.fullScreenApi = fullScreenApi;	
})();
////////////////////////////////////////////////////////////
// ==== In Out Easing - notime version ====
// @author Gerard Ferrandez / http://www.dhteumeuleu.com/
// last update: Jan 12, 2012
// Licensed under CC-BY - do not remove this notice
////////////////////////////////////////////////////////////
var ge1doot = ge1doot || {};

ge1doot.tweens = {
	first: false,
	prev: false,
	iterate: function() {
		var obj = this.first;
		do {
			obj.ease();
			obj = obj.next;
		} while (obj);
	}
};

ge1doot.tweens.Add = function(steps, initValue, initValueTarget, isAngle, minValue, maxValue) {
	this.target = initValueTarget || 0;
	this.value = initValue || 0;
	this.steps = steps;
	this.isAngle = isAngle || false;
	this.speedMod = 1;
	this.minValue = minValue;
	this.maxValue = maxValue;
	// ---- used for normalizing angles ----
	if(isAngle) {
		this.normalizePI = function() {
			if(Math.abs(this.target - this.value) > Math.PI) {
				if(this.target < this.value) this.value -= 2 * Math.PI;
				else this.value += 2 * Math.PI;
			}
		};
	}
	// ---- init target ----
	this.setTarget(this.target, 1, false);
	// ---- add tween in queue ----
	if(!ge1doot.tweens.first) {
		ge1doot.tweens.first = this;
	} else {
		ge1doot.tweens.prev.next = this;
	}
	ge1doot.tweens.prev = this;
};

// ---- set target ----
ge1doot.tweens.Add.prototype.setTarget = function(target, strict) {
	this.speedMod = 1;
	strict = (strict !== undefined ? strict : true);
	this.target = target;
	// ---- normalize PI ----
	if(this.isAngle) {
		this.target = this.target % (2 * Math.PI);
		this.normalizePI();
	}
	this.locked = false;
	if(strict) {
		if(this.minValue && target < this.minValue) {
			this.target = this.minValue;
		}
		if(this.maxValue && target > this.maxValue) {
			this.target = this.maxValue;
		}
	} else {
		if((this.minValue && target < this.minValue) || (this.maxValue && target > this.maxValue)) {
			this.locked = true;
		}
	}
	// ---- set target ----
	if(this.running && this.oldTarget === target) {
		return;
	}
	this.oldTarget = target;
	this.running = true;
	this.prog = 0;
	this.from = this.value;
	this.dist = -(this.target - this.from) * 0.5;
};
// ---- easing ----
ge1doot.tweens.Add.prototype.ease = function() {
	if(!this.running) {
		return;
	}
	var s = this.speedMod * this.steps;
	if(this.prog++ < s) {
		// ---- inOut easing ----
		this.value = this.dist * (Math.cos(Math.PI * (this.prog / s)) - 1) + this.from;
		// ---- normalize PI ----
		if(this.isAngle) this.normalizePI();
	} else {
		// ---- stop ----
		this.running = false;
		this.value = this.target;
	}
};

ge1doot.tweens.Add.prototype.setValue = function(value) {

	if(this.isAngle) {
		this.normalizePI();
	}
	this.running = false;
	if(!this.locked) {
		if(this.minValue && value < this.minValue) {
			return this.target = this.value = this.minValue;
		}
		if(this.maxValue && value > this.maxValue) {
			return this.target = this.value = this.maxValue;
		}
		return this.target = this.value = value;
	}
};
var scr;
var rooms = [];
var cursor;
var keyboard;
var camera;
var sounds = [];
var MENU;
var map;

var SLOW = false;
var cpt = 100;

var showing;

var params = {
	unit: 1000,
	height: 4000,
	focalLength: 1000,
	humanHeight: 300,
	wallDist: 0,
	artDist: 500,
	cursorX: 4,
	cursorY: 6
};

var OeuvresURL = 'https://numero0.s3-external-3.amazonaws.com/';

var colors = {
	'floor': '#80827d',
	'aimedFloor': '#70726D',
	// 'gradient': '#F9F9F9',
	'top': '#E9E9E9',
	'bottom': '#E9E9E9',
	'left': '#D9D9D9',
	'right': '#D9D9D9'
};
var Screen = function (ids) {
	this.container = document.getElementById(ids.container);
	this.canvas = document.getElementById(ids.canvas);
	this.ctx = this.canvas.getContext("2d");
	this.setSize();
	this.initEvents();

	return this;
};

Screen.prototype.setSize = function() {
	// ---- size ----
	this.width  = this.container.offsetWidth;
	this.height = this.container.offsetHeight;
	// ---- offset ----
	var o = this.container;
	for (this.left = 0, this.top = 0; o !== null; o = o.offsetParent) {
		this.left += o.offsetLeft;
		this.top  += o.offsetTop;
	}
	// ---- canvas resize ----
	if (this.canvas) {
		this.canvas.width  = this.width;
		this.canvas.height = this.height;
	}
};

Screen.prototype.initEvents = function() {
	var that = this;
	window.addEventListener('resize', function () {
		that.setSize();
	}, false);

	window.addEventListener('keydown', function(event) {
	// $(document).keypress(function(e) {
		if(event.keyCode == 13) { // enter
			window.fullScreenApi.requestFullScreen(document.getElementsByTagName('body')[0]);
		}
	});
};
var Camera = function(_x, _z) {
	this.focalLength = params.focalLength;
	this.x = new ge1doot.tweens.Add(100, _x, _x);
	this.y = new ge1doot.tweens.Add(100, -8 * params.unit, params.height / 2 - params.humanHeight);
	this.z = new ge1doot.tweens.Add(100, _z + this.focalLength, _z + this.focalLength);
	this.rx = new ge1doot.tweens.Add(100, -Math.PI / 2, 0, true, -Math.PI / 36, Math.PI / 8);
	this.ry = new ge1doot.tweens.Add(100, 0, 0, true);
	this.zoom = new ge1doot.tweens.Add(100, 1, 1);
	this.trig = {
		cosX: 1,
		cosY: 1,
		sinX: 0,
		sinY: 0
	};

	return this;
};

Camera.prototype.isInPosition = function() {
	var i;
	var dx, dy, dz;
	var inPosition, inMidPosition;

	dx = this.x.target - this.x.value;
	dy = this.y.target - this.y.value;
	dz = this.z.target - this.z.value;

	inPosition = (dx * dx + dy * dy + dz * dz < 10);

	if(inPosition) {
		$(scr.canvas).trigger('inPosition');

		for(i=0; i<sounds.length;i++) {
			if(!sounds[i].audio.paused) {
				sounds[i].adjustVolume();
			}
		}

	}

	if(this.midTarget) {
		dx = this.midTarget.x - this.x.value;
		dy = this.midTarget.y - this.y.value;
		dz = this.midTarget.z - this.z.value;

		inMidPosition = (dx * dx + dy * dy + dz * dz < 10);
		if(inMidPosition) {
			$(scr.canvas).trigger('inMidPosition');
		}
	}

};

Camera.prototype.targetToPosition = function(obj, strict) {
	strict = (strict !== undefined ? strict : true);
	var x = (obj.x !== undefined ? obj.x : this.x.target);
	var y = (obj.y !== undefined ? obj.y : params.height / 2 - params.humanHeight);
	var z = (obj.z !== undefined ? obj.z : this.z.target);

	this.midTarget = {
		x: this.x.value + (x - this.x.value)/2,
		y: this.y.value + (y - this.y.value)/2,
		z: this.z.value + (z - this.z.value)/2
	};

	this.x.setTarget(x, strict);
	this.z.setTarget(z, strict);
	this.y.setTarget(y, strict);
	this.rx.setTarget((obj.rx !== undefined ? obj.rx : this.rx.target), strict);
	this.ry.setTarget((obj.ry !== undefined ? obj.ry : this.ry.target), strict);

	this.zoom.setTarget((obj.zoom !== undefined ? obj.zoom : this.zoom.target));
};


Camera.prototype.targetToFace = function(face) {

	if(face.f.type === 'floor') {
		if(face.f.art) {
			return this.targetToPosition({
				x: face.pv.x,
				z: face.pv.z + this.focalLength,
				rx: Math.PI / 16,
				ry: face.f.art.f.ry * Math.PI / 2,
				zoom: 1
			}, true);
		} else {
			return this.targetToPosition({
				x: face.pv.x,
				z: face.pv.z + this.focalLength,
				rx: 0,
				zoom: 1
			}, true);
		}

	}

};

Camera.prototype.godView = function() {
	this.targetToPosition({
		y: -8 * params.unit,
		rx: -Math.PI / 2 + 0.001
	}, false);
};

Camera.prototype.move = function() {
	// ---- easing camera position and view angle ----
	ge1doot.tweens.iterate();

	if(cursor.strengthY !== 0 && this.rx.target === this.rx.value) {
		this.rx.setValue(this.rx.value - 0.02 * cursor.strengthY);
	}
	if(cursor.strengthX !== 0 && this.ry.target === this.ry.value) {
		this.ry.setValue(this.ry.value - 0.02 * cursor.strengthX);
	}

	// ---- pre calculate trigo ----
	this.trig.cosX = Math.cos(this.rx.value);
	this.trig.sinX = Math.sin(this.rx.value);
	this.trig.cosY = Math.cos(this.ry.value);
	this.trig.sinY = -Math.sin(this.ry.value);

	this.isInPosition();

};

Camera.prototype.rotate = function(x, y, z) {
	return {
		x: this.trig.cosY * x - this.trig.sinY * (z + this.focalLength),
		y: this.trig.sinX * (this.trig.cosY * (z + this.focalLength) + this.trig.sinY * x) + this.trig.cosX * y,
		z: this.trig.cosX * (this.trig.cosY * (z + this.focalLength) + this.trig.sinY * x) - this.trig.sinX * y - this.focalLength
	};
};

Camera.prototype.coordinates = function() {
	console.log('c: (' + Math.round(this.x.value / params.unit) + ',' + Math.round((this.z.value - this.focalLength) / params.unit) + ')');
};

var Cursor = function(canvas_ID, segmentX, segmentY) {
	this.segmentX = segmentX;
	this.segmentY = segmentY;
	this.container = document.getElementById(canvas_ID);

	this.X = 0;
	this.Y = 0;
	this.strengthX = 0;
	this.strengthY = 0;
	this.aimedFace = null;
	this.going = null;
	// this.moving = false;
	this.initEvents();

	return this;
};

Cursor.prototype.initEvents = function() {
	var that = this;

	this.container.onmspointermove = this.container.ontouchmove = this.container.onmousemove = function(e) {

		that.X = (e.clientX !== undefined ? e.clientX : e.touches[0].clientX);
		that.Y = (e.clientY !== undefined ? e.clientY : e.touches[0].clientY);

		// if(that.muted && (Math.abs(that.muted.X - that.X) > 20 || Math.abs(that.muted.Y - that.Y) > 20)) {
		// 	that.muted = null;
		// }

		that.calcStrength();

		that.aimedFace = that.inFace();
		that.setCursor();
	};

	this.container.onclick = function(e) {
		var roomId, artId, title;

		if(that.aimedFace) {
			roomId = that.aimedFace.f.roomId;
			
			if(that.aimedFace.f.type === 'art') {
				artId = that.aimedFace.f.artId || null;
				showHtml(that.aimedFace.html);
				showArtInfo(that.aimedFace);

				if(that.aimedFace.f.subtype === 'text' || that.aimedFace.f.subtype === 'video') {
					for(i=0; i<sounds.length; i++) {
						sounds[i].audio.pause();
					}
				}

			}

			if(that.aimedFace.f.type === 'floor') {
				// if(that.aimedFace.f.art) {
				// 	artId = that.aimedFace.f.art.f.artId || null;
				// 	$(scr.canvas).one('inPosition', $.proxy(function() {
				// 		cursor.mute();
				// 		$('#artTitle').html(this.f.art.f.info.title || 'Inconnu');
				// 		$('#artAuthor').html(this.f.art.f.info.author || 'Inconnu');
				// 		$('#artDescription').html(this.f.art.f.info.description || 'Inconnu');
				// 		$('#artInfo').fadeIn(1000, function() {
				// 			setTimeout(function() {
				// 				$('#artInfo').fadeOut(1000);
				// 			}, 3000);
				// 		});
				// 	},that.aimedFace));
				// }
				camera.targetToFace(that.aimedFace);

				if(roomId !== rooms[0].id) {
					$(scr.canvas).one('inMidPosition', $.proxy(function() {
						enteredRoom(this.roomId);
					}, {
						roomId: roomId
					}));
				}
			}

			if (!history.state || history.state.roomId !== roomId || history.state.artId !== artId) {
				title = 'Sans-titres, Salle ' + roomId + (artId?' Oeuvre ' + artId:'');
				history.pushState({
					roomId: roomId,
					artId: artId
				}, title, '#!room=' + roomId + (artId?'&art=' + artId:''));
				document.title = title;
			}
		}

		// e.preventDefault();
		// return false;
	};

	this.container.ondblclick = function(e) {
		camera.godView();
		e.preventDefault();
		return false;
	};

	this.container.onmspointerdown = this.container.ontouchstart = this.container.onmousedown = function(e) {};

	this.container.onmspointerup = this.container.ontouchend = this.container.onmouseup = function(e) {};

	this.container.onmspointercancel = this.container.ontouchcancel = function(e) {};

};

// Cursor.prototype.mute = function() {
// 	this.muted = {
// 		X: this.X,
// 		Y: this.Y
// 	};
// 	this.calcStrength();
// 	// this.aimedFace = this.inFace();
// 	this.setCursor();
// };

Cursor.prototype.calcStrength = function() {

	// if(this.muted) {
	// 	return this.strengthX = this.strengthY = 0;
	// }

	if(this.X > scr.width / this.segmentX && this.X < scr.width - scr.width / this.segmentX) {
		this.strengthX = 0;
		// this.moving = false;
	}

	if(this.X < scr.width / this.segmentX) {
		this.strengthX = (this.X - scr.width / this.segmentX) / (scr.width / this.segmentX);
		// this.moving = true;
	}
	if(this.X > scr.width - scr.width / this.segmentX) {
		this.strengthX = 1 - (scr.width - this.X) / (scr.width / this.segmentX);
		// this.moving = true;
	}

	if(this.Y > scr.height / this.segmentY && this.Y < scr.height - scr.height / this.segmentY) {
		this.strengthY = 0;
		// this.moving = false;
	}

	if(this.Y < scr.height / this.segmentY) {
		this.strengthY = (this.Y - scr.height / this.segmentY) / (scr.height / this.segmentY);
		// this.moving = true;
	}
	if(this.Y > scr.height - scr.height / this.segmentY) {
		this.strengthY = 1 - (scr.height - this.Y) / (scr.height / this.segmentY);
		// this.moving = true;
	}

	this.strengthX = this.strengthX*0.5;
	this.strengthY = this.strengthY*0.5;

	if(this.strengthX > 0 && this.strengthY !== 0) {
		this.strengthX = 0;
		this.strengthY = 0;
	}

};

Cursor.prototype.inTriangle = function(p1, p2, p3) {
	// ---- Compute vectors ----
	var v0x = p3.X - p1.X;
	var v0y = p3.Y - p1.Y;
	var v1x = p2.X - p1.X;
	var v1y = p2.Y - p1.Y;
	var v2x = this.X - p1.X;
	var v2y = this.Y - p1.Y;
	// ---- Compute dot products ----
	var dot00 = v0x * v0x + v0y * v0y;
	var dot01 = v0x * v1x + v0y * v1y;
	var dot02 = v0x * v2x + v0y * v2y;
	var dot11 = v1x * v1x + v1y * v1y;
	var dot12 = v1x * v2x + v1y * v2y;
	// ---- Compute barycentric coordinates ----
	var invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
	var u = (dot11 * dot02 - dot01 * dot12) * invDenom;
	var v = (dot00 * dot12 - dot01 * dot02) * invDenom;
	// ---- Check if point is in triangle ----
	return(u >= 0) && (v >= 0) && (u + v < 1);
};

Cursor.prototype.inFace = function() {
	var i, j, k;
	var face;
	var room;

	for(k=0; k<rooms.length; k++) {
		room = rooms[k];

		for(i = 0; i < room.arts.length; i++) {
			face = room.arts[i];
			if(this.faceSelected(face)) {
				return face;
			}
		}

		for(i = 0; i < room.floors.length; i++) {
			face = room.floors[i];
			face.projection();
			if(this.faceSelected(face)) {
				return face;
			}
		}
	}

	return null;
};

Cursor.prototype.faceSelected = function(face) {
	return(face.f.select && face.visible && (this.inTriangle(face.p0, face.p1, face.p2) || this.inTriangle(face.p0, face.p2, face.p3)));
};

Cursor.prototype.setCursor = function() {
	if(this.strengthY < 0 && this.strengthX < 0) {
		return this.changeClass('top-left');
	}
	if(this.strengthY < 0 && this.strengthX > 0) {
		return this.changeClass('top-right');
	}
	if(this.strengthY > 0 && this.strengthX < 0) {
		return this.changeClass('bottom-left');
	}
	if(this.strengthY > 0 && this.strengthX > 0) {
		return this.changeClass('bottom-right');
	}

	if(this.strengthY < 0) {
		return this.changeClass('top');
	}
	if(this.strengthY > 0) {
		return this.changeClass('bottom');
	}

	if(this.strengthX > 0) {
		return this.changeClass('right');
	}
	if(this.strengthX < 0) {
		return this.changeClass('left');
	}

	if(this.aimedFace) {
		if(this.aimedFace.f.type === 'art') {
			return this.changeClass('see');
		}
		if(this.aimedFace.f.type === 'floor') {
			return this.changeClass('go');
		}
	}
	return this.changeClass('');
};

Cursor.prototype.changeClass = function(class_name) {
	if(this.container.className !== class_name) {
		return this.container.className = class_name;
	}
};
Camera.prototype.up = function(strength) {
	this.targetToPosition({
		x: this.x.target + params.unit * this.trig.sinY * (strength || 1),
		z: this.z.target + params.unit * this.trig.cosY * (strength || 1)
	});
};

Camera.prototype.down = function(strength) {
	this.targetToPosition({
		x: this.x.target - params.unit * this.trig.sinY * (strength || 1),
		z: this.z.target - params.unit * this.trig.cosY * (strength || 1)
	});
};

Camera.prototype.lft = function(strength) {
	this.targetToPosition({
		x: this.x.target - params.unit * this.trig.cosY * (strength || 1),
		z: this.z.target + params.unit * this.trig.sinY * (strength || 1)
	});
};

Camera.prototype.rght = function(strength) {
	this.targetToPosition({
		x: this.x.target + params.unit * this.trig.cosY * (strength || 1),
		z: this.z.target - params.unit * this.trig.sinY * (strength || 1)
	});
};

Camera.prototype.left = function(strength) {
	this.targetToPosition({
		ry: this.ry.target + Math.PI / 4 * (strength || 1) + 2 * Math.PI
	});
};

Camera.prototype.right = function(strength) {
	this.targetToPosition({
		ry: this.ry.target - Math.PI / 4 * (strength || 1) + 2 * Math.PI
	});
};


Camera.prototype.zoomIn = function() {
	this.zoom.setTarget(this.zoom.target * 1.25);
};

Camera.prototype.zoomOut = function() {
	this.zoom.setTarget(this.zoom.target * 0.8);
};

Camera.prototype.stop = function() {
	this.x.setTarget(this.x.value);
	this.y.setTarget(this.y.value);
	this.z.setTarget(this.z.value);
	this.rx.setTarget(this.rx.value);
	this.ry.setTarget(this.ry.value);
	this.zoom.setTarget(this.zoom.value);
};

var Keyboard = function(canvas_ID) {
	this.initEvents();

	return this;
};

Keyboard.prototype.initEvents = function() {
	window.addEventListener('keydown', function(event) {
		// console.log(event.keyCode);
		if(event.keyCode == 38 || event.keyCode == 90) { // Top || Z
			camera.up();
		}
		if(event.keyCode == 40 || event.keyCode == 83) { // Bottom || s
			camera.down();

		}
		if(event.keyCode == 39 || event.keyCode == 69) { // Right || e
			camera.right();
		}
		if(event.keyCode == 37 || event.keyCode == 65) { // Left || a
			camera.left();
		}
		if(event.keyCode == 68) { // d
			camera.rght();
		}
		if(event.keyCode == 81) { // q
			camera.lft();
		}
		if(event.keyCode == 32) { // space
			camera.stop();
		}
		if(event.keyCode == 82) { // r
			camera.zoomIn();
		}
		if(event.keyCode == 70) { // f
			camera.zoomOut();
		}
		if(event.keyCode == 27) { // f
			camera.godView();
		}
	}, false);

	window.addEventListener('keyup', function(event) {}, false);
};
// ======== points constructor ========
var Point = function(parentFace, point, rotate) {
	this.face = parentFace;
	this.x = point[0];
	this.y = point[1];
	this.z = point[2];
	this.scale = 0;
	this.distance = 0;
	this.X = 0;
	this.Y = 0;
	this.inScreen = false;
	if(rotate) {
		this.x += rotate.x;
		this.y += rotate.y;
		this.z += rotate.z;
	}
	this.x = Math.round(this.x);
	this.y = Math.round(this.y);
	this.z = Math.round(this.z);

	return this;
};

// ======== points projection ========
Point.prototype.projection = function() {
	// ---- 3D rotation ----
	var p = camera.rotate(
		this.x - camera.x.value, this.y - camera.y.value, this.z - camera.z.value);

	// this.p = p;

	this.behind = p.z <= -1 * params.focalLength;

	// ---- distance to the camera ----
	var z = p.z + camera.focalLength;
	this.distance = Math.sqrt(p.x * p.x + z * z);
	// this.distance = Math.sqrt(p.x * p.x + p.y * p.y + z * z);
	if(this.face) {
		if(this.behind) {
			this.face.nbBehind+=1;
		}
		if(this.distance > this.face.distance) {
			this.face.distance = this.distance;
		}
	}

	// --- 2D projection ----
	this.scale = Math.abs((camera.focalLength / (p.z + camera.focalLength)) * camera.zoom.value) || 10000; // Me !!!
	// this.X = parseInt(((scr.width * 0.5) + (p.x * this.scale)), 10);
	// this.Y = parseInt(((scr.height * 0.5) + (p.y * this.scale)), 10);
	// Hack to math.round;
	this.X = ((scr.width  * 0.5) + (p.x * this.scale) + 0.5) | 0;
	this.Y = ((scr.height * 0.5) + (p.y * this.scale) + 0.5) | 0;
	// this.X = ((scr.width  * 0.5) + (p.x * this.scale) + 0.5) << 0;
	// this.Y = ((scr.height * 0.5) + (p.y * this.scale) + 0.5) << 0;
	return true;

};
	// ======= faces constructor ========
	var Face = function(f) {
		this.f = f;
		var w = f.w * 0.5;
		var h = f.h * 0.5;
		var ax = f.rx * Math.PI * 0.5;
		var ay = f.ry * Math.PI * 0.5;
		this.visible = true;
		// ---- 3D transform ----
		var transform = function(x, y, z, ax, ay) {
			var tz = z * Math.cos(ay) + x * Math.sin(ay);
			var ty = y * Math.cos(ax) + tz * Math.sin(ax);
			return {
				x: x * Math.cos(ay) - z * Math.sin(ay),
				y: ty,
				z: tz * Math.cos(ax) - y * Math.sin(ax)
			};
		};
		// ---- center point ----
		this.pc = new Point(this, [f.x, f.y, f.z]);
		// ---- quad points ----
		this.p0 = new Point(this, [f.x, f.y, f.z], transform(-w, -h, 0, ax, ay));
		this.p1 = new Point(this, [f.x, f.y, f.z], transform(w, -h, 0, ax, ay));
		this.p2 = new Point(this, [f.x, f.y, f.z], transform(w, h, 0, ax, ay));
		this.p3 = new Point(this, [f.x, f.y, f.z], transform(-w, h, 0, ax, ay));

		this.points = [this.p0, this.p1, this.p2, this.p3];

		this.pv = this.makePv();

		// ---- target angle ----
		var r = transform(ax, ay, 0, ax, ay, 0);
		this.ax = r.x + Math.PI / 2;
		this.ay = r.y + Math.PI / 2;

		// ---- create 3D image ----
		if(this.f.type === 'art') {
			this.img = new CanvasEl.Image(scr.canvas, this.f.thumb, this.f.level || 2);
		}

		this.buffer();
		return this;
	};

	Face.prototype.makePv = function() {
		if(this.f.adj) {

			var res = [];
			var found;
			for (i=0; i<this.points.length; i++) {
				found = false;
				for (j=0; j<this.f.adj.length; j++){
					if (this.f.adj[j]) {
						for (k=0; k<this.f.adj[j].points.length; k++) {
							if(equalsCoord(this.points[i], this.f.adj[j].points[k])) {
								found = true;
							}
						}
					}
				}
				if(!found) {
					res.push(this.points[i]);
				}
			}

			var pvx, pvy, pvz;
			pvx=0;
			pvy=0;
			pvz=0;
			for (i=0; i<res.length; i++) {
				pvx+=res[i].x;
				pvy+=res[i].y;
				pvz+=res[i].z;
			}
			pvx = pvx/res.length;
			pvy = pvy/res.length;
			pvz = pvz/res.length;

			this.res = res;
			return new Point(null, [pvx, pvy, pvz]);
		} else {
			return this.pc;
		}
	};

	// ======== face projection ========
	Face.prototype.projection = function() {
		this.nbBehind = 0;
		this.distance = 0;
		this.conditions = 0;
		this.visible = true;
		this.distance = -99999;
		// ---- points projection ----
		// this.pc.projection(); // optional
		this.p0.projection();
		this.p1.projection();
		this.p2.projection();
		this.p3.projection();

		if (this.forceVisible) {
			return this.visible = true;
		}

		// Remove invisible faces;

		if(this.nbBehind > 1) {
			this.visible = false;
			this.distance = -99999;
			this.conditions += 40;
			return;
		}

		// if(this.p0.behind || this.p1.behind || this.p2.behind || this.p3.behind) {
		// 	this.visible = false;
		// 	this.distance = -99999;
		// 	this.conditions += 20;
		// 	return;
		// }

		// if(this.p0.behind && this.p1.behind && this.p2.behind && this.p3.behind) {
		// 	this.visible = false;
		// 	this.distance = -99999;
		// 	this.conditions += 10;
		// 	return;
		// }

		// if((this.p1.Y - this.p0.Y) * (this.p3.X - this.p0.X) - (this.p1.X - this.p0.X) * (this.p3.Y - this.p0.Y) > 0) {
			// this.visible = false;
			// this.distance = -99999;
			// this.conditions += 1;
			if((this.p3.Y - this.p2.Y) * (this.p1.X - this.p2.X) - (this.p3.X - this.p2.X) * (this.p1.Y - this.p2.Y) > 0){
				this.visible = false;
				this.distance = -99999;
				this.conditions += 2;
				return;
			}
		// }


		// if(this.p0.behind || this.p1.behind || this.p2.behind || this.p3.behind) {
		// 	this.visible = false;
		// 	this.distance = -99999;
		// 	this.conditions += 20;
		// }

		// if(!(
		// 	((this.p1.Y - this.p0.Y) / (this.p1.X - this.p0.X) -
		// 		(this.p2.Y - this.p0.Y) / (this.p2.X - this.p0.X) < 0) ^
		// 	(this.p0.X <= this.p1.X == this.p0.X > this.p2.X)
		// 	)) {
		// 	this.visible = false;
		// 	this.distance = -99999;
		// 	this.conditions += 40;
		// }


	};

	Face.prototype.buffer = function() {
		if(this.f.src) {
			var splited = this.f.src.split('.');
			var ext = splited[splited.length-1];
			if(ext === 'html' || ext === 'htm') {
				this.html = document.createElement('iframe');
				this.html.setAttribute('src', this.f.src);
				this.html.className = 'html';
				this.html.id = this.f.id;
				this.html.height = this.f.iFrameHeight || 600;
				this.html.width = this.f.iFrameWidth || 800;

				return;
			}

			if(ext === 'jpg' || ext === 'png' || ext === 'jpeg') {
				this.html = new Image();
				this.html.src = this.f.src;
				this.html.id = this.f.id;
				this.html.className = 'art';

				return;
			}

			console.log('Warning ! Extension not buffered : '+ext);
			
		}

	};

	Face.prototype.render = function() {
		if(this.f.type === 'art') {
			if(cursor.aimedFace && this.f.id === cursor.aimedFace.f.id) {
				this.img.render(this.p0, this.p1, this.p2, this.p3, this.f.borderColor||'black', this.f.border);
			} else {
				if(this.f.subtype === 'text' || this.f.subtype === 'video') {
					this.img.render(this.p0, this.p1, this.p2, this.p3, '', false);
				} else {
					this.img.render(this.p0, this.p1, this.p2, this.p3, this.f.borderHoverColor||'white', this.f.border);

				}
			}
		}
	};

	var faceMaker = {
		'top': function(_room, _x, _z) {
			var f = {
				id: _room.id + ':' + _x + ':' + _z + ':top',
				roomId: _room.id,
				type: 'top',
				x: params.unit * (_x + _room.position.x),
				y: 0,
				z: params.unit * (_z + 1 / 2 + _room.position.z),
				rx: 0,
				ry: 0,
				w: params.unit,
				h: params.height,
				select: false
			};
			return new Face(f);
		},
		'bottom': function(_room, _x, _z) {
			var f = {
				id: _room.id + ':' + _x + ':' + _z + ':bottom',
				roomId: _room.id,
				type: 'bottom',
				x: params.unit * (_x + _room.position.x),
				y: 0,
				z: params.unit * (_z - 1 / 2 + _room.position.z),
				rx: 0,
				ry: -2,
				w: params.unit,
				h: params.height,
				select: false
			};
			return new Face(f);
		},
		'left': function(_room, _x, _z) {
			var f = {
				id: _room.id + ':' + _x + ':' + _z + ':left',
				roomId: _room.id,
				type: 'left',
				x: params.unit * (_x - 1 / 2 + _room.position.x),
				y: 0,
				z: params.unit * (_z + _room.position.z),
				rx: 0,
				ry: 1,
				w: params.unit,
				h: params.height,
				select: false
			};
			return new Face(f);
		},
		'right': function(_room, _x, _z) {
			var f = {
				id: _room.id + ':' + _x + ':' + _z + ':right',
				roomId: _room.id,
				type: 'right',
				x: params.unit * (_x + 1 / 2 + _room.position.x),
				y: 0,
				z: params.unit * (_z + _room.position.z),
				rx: 0,
				ry: -1,
				w: params.unit,
				h: params.height,
				select: false
			};
			return new Face(f);
		},
		'floor': function(_room, _x, _z, adj, art) {
			var f = {
				id: _room.id + ':' + _x + ':' + _z + ':floor',
				roomId: _room.id,
				type: 'floor',
				x: params.unit * (_x + _room.position.x),
				y: params.height / 2,
				z: params.unit * (_z + _room.position.z),
				rx: 1,
				ry: 0,
				w: params.unit,
				h: params.unit,
				adj: adj,
				select: true
			};
			if(art !== undefined) {
				f.art = art;
			}
			return new Face(f);
		},
		'art': function(_room, face, artConstr) {
			var f = {
				id: _room.id + ':' + Math.floor(face.f.x / params.unit) + ':' + Math.floor(face.f.z / params.unit) + ':art',
				roomId: _room.id,
				type: 'art',
				subtype: artConstr.type,
				x: face.f.x + (artConstr.x||0),
				y: params.height / 2 - params.humanHeight * 1.8 + (artConstr.y||0),
				z: face.f.z + (artConstr.z||0),
				rx: face.f.rx,
				ry: face.f.ry,
				w: artConstr.width,
				h: artConstr.height,
				thumb: OeuvresURL + artConstr.thumb,
				src: OeuvresURL + (artConstr.src||artConstr.thumb),
				border: artConstr.border,
				info: artConstr.info || {},
				iFrameHeight: artConstr.iFrameHeight,
				iFrameWidth: artConstr.iFrameWidth,
				level: artConstr.level,
				artId: artConstr.id,
				select: true
			};
			return new Face(f);
		},
		'position': function(_room, art) {
			var f = {
				id: _room.id + ':' + Math.floor(art.f.x / params.unit) + ':' + Math.floor(art.f.z / params.unit) + ':position',
				roomId: _room.id,
				type: 'position',
				x: parseInt(art.f.x + params.unit * Math.sin(art.f.ry * Math.PI / 2), 10),
				y: params.height / 2,
				z: parseInt(art.f.z - params.unit * Math.cos(art.f.ry * Math.PI / 2), 10),
				rx: 1,
				ry: 0,
				w: 500,
				h: 500,
				ryf: art.f.ry,
				info: art.f.info || {},
				art: art,
				select: true
			};
			return new Face(f);
		}
	};
var Monolythe = function(face, artConstr) {

	this.dim = artConstr.dim;

	var f0 = {
		id: face.f.id.split(':')[0] + ':' + Math.floor(face.f.x / params.unit) + ':' + Math.floor(face.f.z / params.unit) + ':art',
		type: 'art',
		subtype: 'monolythe',
		x: face.f.x + this.dim.depth/2,
		y: face.f.y - this.dim.height/2,
		z: face.f.z,
		rx: 0,
		ry: 1,
		w: this.dim.width,
		h: this.dim.height,
		thumb: OeuvresURL + artConstr.thumb.top,
		src: OeuvresURL + (artConstr.src.top || artConstr.thumb.top),
		info: artConstr.info || {},
		artId: artConstr.id,
		border: false,
		select: true
	};
	var f1 = {
		id: face.f.id.split(':')[0] + ':' + Math.floor(face.f.x / params.unit) + ':' + Math.floor(face.f.z / params.unit) + ':art',
		type: 'art',
		subtype: 'monolythe',
		x: face.f.x - this.dim.depth/2,
		y: face.f.y - this.dim.height/2,
		z: face.f.z,
		rx: 0,
		ry: -1,
		w: this.dim.width,
		h: this.dim.height,
		thumb: OeuvresURL + artConstr.thumb.bottom,
		src: OeuvresURL + (artConstr.src.bottom || artConstr.thumb.bottom),
		info: artConstr.info || {},
		artId: artConstr.id,
		border: false,
		select: true
	};
	var f2 = {
		id: face.f.id.split(':')[0] + ':' + Math.floor(face.f.x / params.unit) + ':' + Math.floor(face.f.z / params.unit) + ':art',
		type: 'art',
		subtype: 'monolythe',
		x: face.f.x,
		y: face.f.y - this.dim.height/2 + 12,
		z: face.f.z - this.dim.width/2 + 15,
		rx: -0.03,
		ry: 0,
		w: this.dim.depth,
		h: this.dim.height - 24,
		thumb: OeuvresURL + artConstr.thumb.left,
		src: OeuvresURL + (artConstr.src.left || artConstr.thumb.left),
		info: artConstr.info || {},
		artId: artConstr.id,
		border: false,
		select: true
	};
	var f3 = {
		id: face.f.id.split(':')[0] + ':' + Math.floor(face.f.x / params.unit) + ':' + Math.floor(face.f.z / params.unit) + ':art',
		type: 'art',
		subtype: 'monolythe',
		x: face.f.x,
		y: face.f.y - this.dim.height/2,
		z: face.f.z + this.dim.width/2 - 18,
		rx: -0.03,
		ry: 2,
		w: this.dim.depth,
		h: this.dim.height,
		thumb: OeuvresURL + artConstr.thumb.right,
		src: OeuvresURL + (artConstr.src.right || artConstr.thumb.right),
		info: artConstr.info || {},
		artId: artConstr.id,
		border: false,
		select: true
	};

	this.face0 = new Face(f0);
	this.face1 = new Face(f1);
	this.face2 = new Face(f2);
	this.face3 = new Face(f3);

	this.faces = [this.face0, this.face1, this.face2, this.face3];

	return this;
};
// ======= Room constructor ========
var Room = function(id, mainRoom) {
	this.id = id;
	this.mainRoom = mainRoom;
	this.arts = [];
	// this.sounds = [];
	this.adj = [];
	this.positions = [];
	this.tops = [];
	this.bottoms = [];
	this.lefts = [];
	this.rights = [];
	this.floors = [];
	this.images = [];
	this.texts = [];
	return this.load();
};

Room.prototype.load = function() {
	$.getJSON('numero0/salle' + this.id + '.json', $.proxy(function(data) {
		this.init(data);
		$(scr.container).trigger('loaded');
	}, this));
	return this;
};

Room.prototype.init = function(constr) {
	var i;
	var alreadyFound = false;
	this.name = constr.name || 'Room ' + this.id;
	this.position = constr.position;
	this.color = constr.color;
	this.map = constr.map;
	this.adj = constr.adj || [];
	this.colors = constr.colors || {};
	this.artsConstr = constr.arts || [];
	this.soundsConstr = constr.sounds || [];

	this.readMap();

	if(!this.startFloor) {
		this.startFloor = this.floors[parseInt(this.floors.length / 2, 10)];
	}

	this.makeSounds();

	for(i=0; i<rooms.length; i++){
		if(rooms[i].id === this.id) {
			alreadyFound = true;
			break;
		}
	}
	if(!alreadyFound) {
		rooms[rooms.length] = this;
	}

	return this;
};

Room.prototype.getElementsToRender = function() {
	var i, j, depth, depth2;
	var face;
	var toRender = [];
	var cptToRender = 0;

	for(depth in this.tops) {
		if(this.tops.hasOwnProperty(depth)) {
			for(depth2 in this.tops[depth]) {
				if(this.tops[depth].hasOwnProperty(depth2)) {
					toRender[cptToRender] = getEdges(this.tops[depth][depth2], 'top', this.colors);
					cptToRender += 1;
				}
			}
		}
	}
	for(depth in this.bottoms) {
		if(this.bottoms.hasOwnProperty(depth)) {
			for(depth2 in this.bottoms[depth]) {
				if(this.bottoms[depth].hasOwnProperty(depth2)) {
					toRender[cptToRender] = getEdges(this.bottoms[depth][depth2], 'bottom', this.colors);
					cptToRender += 1;
				}
			}
		}
	}
	for(depth in this.lefts) {
		if(this.lefts.hasOwnProperty(depth)) {
			for(depth2 in this.lefts[depth]) {
				if(this.lefts[depth].hasOwnProperty(depth2)) {
					toRender[cptToRender] = getEdges(this.lefts[depth][depth2], 'left', this.colors);
					cptToRender += 1;
				}
			}
		}
	}
	for(depth in this.rights) {
		if(this.rights.hasOwnProperty(depth)) {
			for(depth2 in this.rights[depth]) {
				if(this.rights[depth].hasOwnProperty(depth2)) {
					toRender[cptToRender] = getEdges(this.rights[depth][depth2], 'right', this.colors);
					cptToRender += 1;
				}
			}
		}
	}

	for(i = 0; i < this.arts.length; i++) {
		face = this.arts[i];
		face.projection();
		if(face.visible) {
			toRender[cptToRender] = {
				type: 'art',
				distance: this.arts[i].distance * 0.6,
				// A corriger
				art: this.arts[i]
			};
			cptToRender += 1;
		}
	}

	return toRender;
};


Room.prototype.isTop = function(charType) {
	return(charType === '#' || charType === '-' || charType === '+') || false;
};
Room.prototype.isBottom = function(charType) {
	return(charType === '%' || charType === '_' || charType === '¤') || false;
};
Room.prototype.isLeft = function(charType) {
	return(charType === '#' || charType === '|' || charType === '%') || false;
};
Room.prototype.isRight = function(charType) {
	return(charType === '+' || charType === '!' || charType === '¤') || false;
};
Room.prototype.isInside = function(charType) {
	return(charType !== '.') || false;
};
Room.prototype.isNoWall = function(charType) {
	return(charType === ',') || false;
};

Room.prototype.getArtConstr = function(artId) {
	var artConstr;
	var artConstrs = [];
	for(var i = 0; i < this.artsConstr.length; i++) {
		artConstr = this.artsConstr[i];
		if(artConstr.id[0] === artId) {
			artConstrs.push(artConstr);
		}
	}
	return artConstrs;
};

Room.prototype.readMap = function() {
	var h, w, x, z;
	var charType, artId, next;
	var artConstr, artConstrs;
	var top, bottom, left, right, floor, art;

	for(h = 0; h < this.map.length; h++) {
		z = this.map.length - (h + 1);
		for(w = 0; w < this.map[h].length; w += 2) {
			// Get Vars
			x = w / 2;
			charType = this.map[h][w];
			next = this.map[h][w + 1];
			artId = next.replace(/^[^a-zA-Z0-9]$/, '');


			if(this.isInside(charType)) {

				top = this.putFaceToWall(this.tops, this.isTop(charType), z, faceMaker.top(this, x, z));
				bottom = this.putFaceToWall(this.bottoms, this.isBottom(charType), z, faceMaker.bottom(this, x, z));
				left = this.putFaceToWall(this.lefts, this.isLeft(charType), x, faceMaker.left(this, x, z));
				right = this.putFaceToWall(this.rights, this.isRight(charType), x, faceMaker.right(this, x, z));

				floor = faceMaker.floor(this, x, z, [top, bottom, left, right], undefined);
				this.floors.push(floor);

				if(next === '@') {
					this.startFloor = floor;
				}
				art = undefined;
				artConstr = undefined;
				if(artId !== '') {
					artConstrs = this.getArtConstr(artId, charType);

					for(i=0; i<artConstrs.length; i++) {
						artConstr = artConstrs[i];

						if(this.isTop(artConstr.side || charType)) {
							art = faceMaker.art(this, top || faceMaker.top(this, x, z), artConstr);
							this.arts.push(art);
						}
						if(this.isBottom(artConstr.side || charType)) {
							art = faceMaker.art(this, bottom || faceMaker.bottom(this, x, z), artConstr);
							this.arts.push(art);
						}
						if(this.isLeft(artConstr.side || charType)) {
							art = faceMaker.art(this, left || faceMaker.left(this, x, z), artConstr);
							this.arts.push(art);
						}
						if(this.isRight(artConstr.side || charType)) {
							art = faceMaker.art(this, right || faceMaker.right(this, x, z), artConstr);
							this.arts.push(art);
						}
						if(this.isNoWall(artConstr.side || charType)) {
							if(artConstr.type === 'monolythe') {
								art = new Monolythe(floor, artConstr);
								floor.f.select = false;
								this.arts = this.arts.concat(art.faces);
							}
							
						}

					}

				}
				// floor = faceMaker.floor(this, x, z, [top, bottom, left, right], art);

			}

		}
	}
};


Room.prototype.putFaceToWall = function(wall, test, dim, face) {
	if(test) {
		if(!wall[dim]) {
			wall[dim] = [];
		}
		if(wall[dim].length === 0) {
			wall[dim].push([]);
		}
		wall[dim][wall[dim].length - 1].push(face);
		return face;
	} else {
		if(wall[dim] && (wall[dim].length === 0 || wall[dim][wall[dim].length - 1].length !== 0)) {
			wall[dim].push([]);
		}
		return null;
	}
};

Room.prototype.makeSounds = function() {
	var i, j;
	var sound;
	for(i = 0; i < this.soundsConstr.length; i++) {
		for (j=0; j<sounds.length; j++) {
			if(this.soundsConstr[i].id === sounds[j].id) {
				sounds[j].startRoom.push(this.id);
				sound = sounds[j];
			}
		}
		if(!sound) {
			sounds.push(new Sound(this, this.soundsConstr[i]));
		}
	}
};

Room.prototype.enter = function() {
	var sound;
	var i, j;
	var toPlay;
	var showMuter = false;
	var inStartRoom = false;

	// The sound comes from this room ==> play it
	for(j=0; j<sounds.length; j++) {
		for(i=0; i<sounds[j].startRoom.length; i++) {
			if(sounds[j].startRoom[i] === this.id) {
				sounds[j].playNow = true;
				showMuter = true;
				inStartRoom = true;
			}
		}
		if(!inStartRoom) {
			// The sound is already playing
			if(sounds[j].playNow) {
				sounds[j].playNow = false;
				for(i=0; i<sounds[j].rooms.length; i++) {
					// And we enter in a continuing room ...
					if(sounds[j].rooms[i] === this.id) {
						sounds[j].playNow = true;
						showMuter = true;
					}
				}
			}

		}

		if(!sounds[j].playNow && !sounds[j].audio.paused) {
			sounds[j].audio.pause();
		}

		if(sounds[j].playNow && sounds[j].audio.paused && !$('#volume').hasClass('muted')) {
			sounds[j].adjustVolume();
			sounds[j].audio.play();
		}
	}


	if(showMuter && $('#volume').css('display') === 'none') {
		$('#volume').fadeIn(1000);
	}

	if(!showMuter && $('#volume').css('display') !== 'none') {
		$('#volume').fadeOut(1000);
	}


};

Room.prototype.exit = function(newRoomId) {
};
var renderer = {
	renderAll: function() {
		this.renderFloor();
		this.renderAiming();
		this.renderRooms();
	},
	renderFloor: function() {
		var y = camera.trig.sinX * (100 * params.unit + camera.focalLength);
		var z = camera.trig.cosX * (100 * params.unit + camera.focalLength) - camera.focalLength;

		var scale = Math.abs((camera.focalLength / (z + camera.focalLength)) * camera.zoom.value) || 10000; // Me !!!
		var horizonLine = parseInt(((scr.height * 0.5) + (y * scale)), 10);

		if(horizonLine < scr.height) {
			scr.ctx.beginPath();
			scr.ctx.rect(0, horizonLine, scr.width, scr.height - horizonLine);
			scr.ctx.fillStyle = colors['floor'];
			scr.ctx.fill();
		}
	},
	renderAiming: function() {
		if(cursor.aimedFace && cursor.aimedFace.f.type === 'floor') {
			face = cursor.aimedFace;
			face.projection();
			scr.ctx.beginPath();
			scr.ctx.lineTo(face.p0.X, face.p0.Y);
			scr.ctx.lineTo(face.p1.X, face.p1.Y);
			scr.ctx.lineTo(face.p2.X, face.p2.Y);
			scr.ctx.lineTo(face.p3.X, face.p3.Y);
			scr.ctx.lineTo(face.p0.X, face.p0.Y);
			scr.ctx.closePath();
			scr.ctx.fillStyle = colors['aimedFloor'];
			scr.ctx.fill();
		}
	},
	renderAiming2: function() {
		if(cursor.aimedFace && cursor.aimedFace.f.type === 'floor') {
			face = cursor.aimedFace;
			face.projection();
			scr.ctx.beginPath();
			scr.ctx.lineTo(face.p0.X, face.p0.Y);
			if(!cursor.aimedFace.f.art) {
				scr.ctx.lineTo((face.p0.X * 5 + face.p1.X) / 6, (face.p0.Y * 5 + face.p1.Y) / 6);
				scr.ctx.moveTo((face.p0.X + face.p1.X * 5) / 6, (face.p0.Y + face.p1.Y * 5) / 6);
			}
			scr.ctx.lineTo(face.p1.X, face.p1.Y);
			if(!cursor.aimedFace.f.art) {
				scr.ctx.lineTo((face.p1.X * 5 + face.p2.X) / 6, (face.p1.Y * 5 + face.p2.Y) / 6);
				scr.ctx.moveTo((face.p1.X + face.p2.X * 5) / 6, (face.p1.Y + face.p2.Y * 5) / 6);
			}
			scr.ctx.lineTo(face.p2.X, face.p2.Y);
			if(!cursor.aimedFace.f.art) {
				scr.ctx.lineTo((face.p2.X * 5 + face.p3.X) / 6, (face.p2.Y * 5 + face.p3.Y) / 6);
				scr.ctx.moveTo((face.p2.X + face.p3.X * 5) / 6, (face.p2.Y + face.p3.Y * 5) / 6);
			}
			scr.ctx.lineTo(face.p3.X, face.p3.Y);
			if(!cursor.aimedFace.f.art) {
				scr.ctx.lineTo((face.p3.X * 5 + face.p0.X) / 6, (face.p3.Y * 5 + face.p0.Y) / 6);
				scr.ctx.moveTo((face.p3.X + face.p0.X * 5) / 6, (face.p3.Y + face.p0.Y * 5) / 6);
			}
			scr.ctx.lineTo(face.p0.X, face.p0.Y);
			scr.ctx.closePath();
			if(!cursor.aimedFace.f.art) {
				scr.ctx.strokeStyle = colors['aimedFloor'];
				scr.ctx.stroke();
			} else {
				scr.ctx.fillStyle = colors['aimedFloor'];
				scr.ctx.fill();
			}
		}
	},
	renderRooms: function() {
		var i;
		var toRender = [];
		var toRenderCurrentRoom = [];
		var toRenderElements;
		var cpt = 0;
		for(i = 1; i < rooms.length; i++) {
			toRenderElements = rooms[i].getElementsToRender();
			for (j=0; j < toRenderElements.length; j++) {
				toRender[cpt] = toRenderElements[j];
				cpt+=1;
			}
		}
		toRender = insertSortDistance(toRender);

		toRenderCurrentRoom = rooms[0].getElementsToRender();

		toRenderCurrentRoom = insertSortDistance(toRenderCurrentRoom);

		toRender = toRender.concat(toRenderCurrentRoom);

		renderer.renderElementsToRender(toRender);
	},
	renderElementsToRender: function(toRender) {

		for(i = 0; i < toRender.length; i++) {
			// if(toRender[i].type === 'top' || toRender[i].type === 'bottom' || toRender[i].type === 'left' || toRender[i].type === 'right') {
				if(toRender[i].type !== 'art') {
					renderer.facesMerged(toRender[i]);
				}
				if(toRender[i].type === 'art') {
					face = toRender[i].art;
					face.render();
				}
			}
		},
		facesMerged: function(pointList) {
			var grd;
			var point;
			var points = pointList.points;
			var color = pointList.color || colors[pointList.type];

			if(points.length > 2) {
				scr.ctx.beginPath();
				for(var k = 0; k < points.length; k++) {
					point = points[k];
					scr.ctx.lineTo(point.X, point.Y);
				}
				scr.ctx.closePath();
				if(colors['gradient'] === undefined || SLOW) {
					scr.ctx.fillStyle = color || '#F9F9F9';
				} else {
					grd = scr.ctx.createLinearGradient(points[points.length - 1].X, points[points.length - 1].Y, points[parseInt((points.length - 1) / 2, 10)].X, points[parseInt((points.length - 1) / 2, 10)].Y);
					grd.addColorStop(0, color);
					grd.addColorStop(1, colors['gradient']);
					scr.ctx.fillStyle = grd;
				}
				scr.ctx.lineWidth = 1;
				scr.ctx.strokeStyle = '#E4E4E4';
				scr.ctx.fill();
				scr.ctx.stroke();
			}
		}
	};

	var CanvasEl = {
		Triangle: function(parent, p0, p1, p2) {
		// this.randColor = 'rgb('+parseInt(Math.random()*256)+','+parseInt(Math.random()*256)+','+parseInt(Math.random()*256)+')';
		this.p0 = p0;
		this.p1 = p1;
		this.p2 = p2;
		this.next = false;
		// ---- pre calculation for transform----
		this.d = p0.tx * (p2.ty - p1.ty) - p1.tx * p2.ty + p2.tx * p1.ty + (p1.tx - p2.tx) * p0.ty;
		this.pmy = p1.ty - p2.ty;
		this.pmx = p1.tx - p2.tx;
		this.pxy = p2.tx * p1.ty - p1.tx * p2.ty;
		// ---- link for iteration ----
		if(!parent.firstTriangle) parent.firstTriangle = this;
		else parent.prev.next = this;
		parent.prev = this;
	},
	Image: function(canvas, imgSrc, lev) {
		this.canvas = canvas;
		this.ctx = canvas.getContext("2d");
		if(typeof(imgSrc) == 'string') {
			this.texture = new Image();
			this.texture.src = imgSrc;
		}
		if(typeof(imgSrc) == 'object') {
			this.texture = imgSrc;
		}
		this.lev = lev;
		this.isLoading = true;
		this.firstPoint = false;
		this.firstTriangle = false;
		this.prev = false;
	}
};

CanvasEl.Image.prototype.loading = function() {
	var i, j;
	var tx, ty;
	var p;
	var t;
	var lev;
	var points;
	var cptPoints = 0;
	if(this.texture.complete && this.texture.width) {
		this.isLoading = false;
		points = [];
		// ---- create points ----
		for(i = 0; i <= this.lev; i++) {
			for(j = 0; j <= this.lev; j++) {
				tx = (i * (this.texture.width / this.lev));
				ty = (j * (this.texture.height / this.lev));
				p = {
					tx: tx,
					ty: ty,
					nx: tx / this.texture.width,
					ny: ty / this.texture.height,
					next: false
				};
				points[cptPoints] = p;
				cptPoints +=1;
				if(!this.firstPoint) this.firstPoint = p;
				else this.prev.next = p;
				this.prev = p;
			}
		}
		lev = this.lev + 1;
		for(i = 0; i < this.lev; i++) {
			for(j = 0; j < this.lev; j++) {
				// ---- up ----
				t = new CanvasEl.Triangle(this, points[j + i * lev], points[j + i * lev + 1], points[j + (i + 1) * lev]);
				// ---- down ----
				t = new CanvasEl.Triangle(this, points[j + (i + 1) * lev + 1], points[j + (i + 1) * lev], points[j + i * lev + 1]);
			}
		}
	}
};



CanvasEl.Image.prototype.render = function(p0, p1, p2, p3, color, border) {
	if(border === undefined) {
		border = true;
	}
	var array = [p0, p1, p2, p3];
	// ---- loading ----
	if(this.isLoading) {
		this.loading();
	} else {
		// ---- project points ----
		var p = this.firstPoint;
		do {
			var mx = p0.X + p.ny * (p3.X - p0.X);
			var my = p0.Y + p.ny * (p3.Y - p0.Y);
			p.px = (mx + p.nx * (p1.X + p.ny * (p2.X - p1.X) - mx));
			p.py = (my + p.nx * (p1.Y + p.ny * (p2.Y - p1.Y) - my));
			p = p.next;
		} while (p);
		// ---- draw triangles ----
		var w = this.canvas.width;
		var h = this.canvas.height;
		var t = this.firstTriangle;
		do {
			p0 = t.p0;
			p1 = t.p1;
			p2 = t.p2;
			// ---- centroid ----
			var xc = (p0.px + p1.px + p2.px) / 3;
			var yc = (p0.py + p1.py + p2.py) / 3;
			// ---- clipping ----
			var isTriangleVisible = true;
			if(xc < 0 || xc > w || yc < 0 || yc > h) {
				if(Math.max(p0.px, p1.px, p2.px) < 0 || Math.min(p0.px, p1.px, p2.px) > w || Math.max(p0.py, p1.py, p2.py) < 0 || Math.min(p0.py, p1.py, p2.py) > h) {
					isTriangleVisible = false;
				}
			}
			if(isTriangleVisible) {
				this.ctx.save();
				this.ctx.beginPath();
				var dx, dy, d;
				// ---- draw non anti-aliased triangle ----
				dx = xc - p0.px;
				dy = yc - p0.py;
				d = Math.max(Math.abs(dx), Math.abs(dy));
				this.ctx.moveTo(p0.px - 2 * (dx / d), p0.py - 2 * (dy / d));
				dx = xc - p1.px;
				dy = yc - p1.py;
				d = Math.max(Math.abs(dx), Math.abs(dy));
				this.ctx.lineTo(p1.px - 2 * (dx / d), p1.py - 2 * (dy / d));
				dx = xc - p2.px;
				dy = yc - p2.py;
				d = Math.max(Math.abs(dx), Math.abs(dy));
				this.ctx.lineTo(p2.px - 2 * (dx / d), p2.py - 2 * (dy / d));
				this.ctx.closePath();

				// ---- clip ----
				this.ctx.clip();
				// ---- texture mapping ----
				this.ctx.transform(-(p0.ty * (p2.px - p1.px) - p1.ty * p2.px + p2.ty * p1.px + t.pmy * p0.px) / t.d, // m11
				(p1.ty * p2.py + p0.ty * (p1.py - p2.py) - p2.ty * p1.py - t.pmy * p0.py) / t.d, // m12
				(p0.tx * (p2.px - p1.px) - p1.tx * p2.px + p2.tx * p1.px + t.pmx * p0.px) / t.d, // m21
				-
				(p1.tx * p2.py + p0.tx * (p1.py - p2.py) - p2.tx * p1.py - t.pmx * p0.py) / t.d, // m22
				(p0.tx * (p2.ty * p1.px - p1.ty * p2.px) + p0.ty * (p1.tx * p2.px - p2.tx * p1.px) + t.pxy * p0.px) / t.d, // dx
				(p0.tx * (p2.ty * p1.py - p1.ty * p2.py) + p0.ty * (p1.tx * p2.py - p2.tx * p1.py) + t.pxy * p0.py) / t.d // dy
				);
				this.ctx.drawImage(this.texture, 0, 0);
				this.ctx.restore();
			}
			t = t.next;
		} while (t);

		if(border) {
			this.ctx.beginPath();
			for(var i = 0; i < array.length; i++) {
				this.ctx.lineTo(array[i].X, array[i].Y);

			}
			this.ctx.closePath();
			this.ctx.lineWidth = 1;
			this.ctx.strokeStyle = color || 'white';
			this.ctx.stroke();
		}

	}
};
// shim layer with setTimeout fallback
window.requestAnimFrame = (function() {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
	function(callback) {
		window.setTimeout(callback, 1000 / 60);
	};
})();

var insertSortTheta = function (arr) {
	for (var i = 1; i < arr.length; i++) {
		var tmp = arr[i],
		j = i;
		while (arr[j - 1] && arr[j - 1].theta > tmp.theta) {
			arr[j] = arr[j - 1];
			--j;
		}
		arr[j] = tmp;
	}

	return arr;
};

var insertSortDistance = function (arr) {
	for (var i = 1; i < arr.length; i++) {
		var tmp = arr[i],
		j = i;
		while (arr[j - 1] && arr[j - 1].distance < tmp.distance) {
			arr[j] = arr[j - 1];
			--j;
		}
		arr[j] = tmp;
	}

	return arr;
};


var getParameters = function(href) {
	var tab = href.replace(/.*#!/, '').split('&');
	var obj = {};
	for(var i = 0; i < tab.length; i++) {
		var subtab = tab[i].split('=');
		obj[subtab[0]] = subtab[1];
	}
	return obj;
};

var showArtInfo = function(artFace) {
	$('#artTitle').html('« '+artFace.f.info.titre+' »'  || '');
	$('#artSerie').html(artFace.f.info.ensemble||'');
	$('#artAuthor').html(artFace.f.info.artiste || '');
	$('#artDescription').html(artFace.f.info.description  || '');
	$('#artInfo').fadeIn(1000, function() {
	});
	$('#artInfoClose').one('click',function() {
		$('#artInfo').fadeOut(1000);
	});
};

var showHtml = function(html) {
	$('#artClearView').append(html);
	$('#artClearView').append('<div id="back">RETOUR</div>');
	$('#artClearView').fadeIn(1000);
	$('#artClearView').one('click', function(eventName) {
		remHtml();
	});

};

var remHtml = function() {
	$('#back').fadeOut(1000);
	$('#artClearView').fadeOut(1000, function() {
		$('#artClearView').empty();
	});
	$('#artInfo').fadeOut(1000);

	for(i=0; i<sounds.length; i++) {
		if(sounds[i].playNow && sounds[i].paused) {
			sounds[i].audio.play();
		}
	}

};


var getEdges = function(faces, dim, colors) {

	if(faces.length === 0) {
		return {
			distance: -99999,
			points: []
		};
	}

	var i, j;
	var face;
	var point;
	var points;
	var minDim, maxDim;
	var maxDist;
	var moyDist = 0;
	var nbVisible = 0;
	for(i=0; i<faces.length; i++) {
		face = faces[i];
		face.projection();
		if(face.visible) {

			if(!minDim && !maxDim && !maxDist) {
				minDim = maxDim = faces[i];
				maxDist = faces[i].distance;
			}

			nbVisible +=1;
			moyDist +=face.distance;

			if (dim === 'left' || dim === 'right') {
				if(face.f.z < minDim.f.z) {
					minDim = face;
				}
				if(face.f.z > maxDim.f.z) {
					maxDim = face;
				}
				
			}
			if (dim === 'top' || dim === 'bottom') {
				if(face.f.x < minDim.f.x) {
					minDim = face;
				}
				if(face.f.x > maxDim.f.x) {
					maxDim = face;
				}
				
			}
		}
	}

	if(!minDim && !maxDim && !maxDist) {
		return {
			distance: -99999,
			points: []
		};
	}

	if(dim === 'top' || dim === 'left') {
		return {
			type: dim,
			color: colors[dim],
			distance: moyDist/nbVisible,
			points: [minDim.p3, minDim.p0, maxDim.p1, maxDim.p2]
		};
	}
	if(dim === 'bottom' || dim === 'right') {
		return {
			type: dim,
			color: colors[dim],
			distance: moyDist/nbVisible,
			points: [minDim.p1, minDim.p2, maxDim.p3, maxDim.p0]
		};
	}

};


var getEdges2 = function(faces, dim) {
	var i, j, k;
	var points = [];
	var cptPoints = 0;
	var face, point;
	var cx, cy, cz, cpt;
	var ux, uy, uz, vx, vy, vz, cosTheta, sinTheta, theta;
	var maxDist = 0;

	cx = cy = cz = 0;
	cpt = 0;

	for(i = 0; i < faces.length; i++) {
		face = faces[i];
		face.projection();
		if(face.visible) {

			cx += face.f.x;
			cy += face.f.y;
			cz += face.f.z;
			cpt++;

			if(!face.p0.behind) {
				points[cptPoints] = face.p0;
				cptPoints +=1;
			}
			if(!face.p1.behind) {
				points[cptPoints] = face.p1;
				cptPoints +=1;
			}
			if(!face.p2.behind) {
				points[cptPoints] = face.p2;
				cptPoints +=1;
			}
			if(!face.p3.behind) {
				points[cptPoints] = face.p3;
				cptPoints +=1;
			}
		}
	}

	cx = cx / cpt || 0;
	cy = cy / cpt || 0;
	cz = cz / cpt || 0;

	points = remMany(points, equalsCoord, 4);

	if(points.length > 0) {
		point = points[0];
		for(k = 0; k < points.length; k++) {

			if(maxDist < points[k].distance) {
				maxDist = points[k].distance;
			}

			ux = point.x - cx;
			uy = point.y - cy;
			uz = point.z - cz;
			vx = points[k].x - cx;
			vy = points[k].y - cy;
			vz = points[k].z - cz;
			if(dim === 'x') {
				// var norm = Math.sqrt((uy*uy + uz*uz)*(vy*vy + vz*vz));
				cosTheta = (uy * vy + uz * vz);
				sinTheta = (uy * vz - uz * vy);
			}
			if(dim === 'y') {
				// var norm = Math.sqrt((ux*ux + uz*uz)*(vx*vx + vz*vz));
				cosTheta = (ux * vx + uz * vz);
				sinTheta = (uz * vx - ux * vz);
			}
			if(dim === 'z') {
				// var norm = Math.sqrt((ux*ux + uy*uy)*(vx*vx + vy*vy));
				cosTheta = (ux * vx + uy * vy);
				sinTheta = (ux * vy - uy * vx);
			}

			theta = Math.atan(sinTheta / cosTheta) || 0;
			if(cosTheta >= 0) {
				points[k].theta = theta;
			} else {
				points[k].theta = theta + Math.PI;
			}

			points[k].cosTheta = cosTheta;
			points[k].sinTheta = sinTheta;
		}

		points = insertSortTheta(points);
		// points.sort(function(p0, p1) {
		// 	return p0.theta - p1.theta;
		// });

}
return {
	distance: maxDist,
	points: points
};
};

var remMany = function(array, eqFn, many) {
	var i, j;
	var cpt = [];
	var res = [];
	var present;

	for(i = 0; i < array.length; i++) {
		present = false;
		for(j = 0; j < res.length; j++) {
			if(eqFn(array[i], res[j])) {
				cpt[j] = cpt[j] + 1;
				present = true;
			}
		}
		if(!present) {
			res.push(array[i]);
			cpt.push(1);
		}
	}

	for(i = 0; i < res.length; i++) {
		if(cpt[i] >= many) {
			res.splice(i, 1);
			cpt.splice(i, 1);
			i--;
		}
	}

	return res;
};

var equalsCoord = function(point1, point2) {
	return point1.x === point2.x && point1.y === point2.y && point1.z === point2.z;
};
var enteredRoom = function(roomId) {
	var i, j;
	var room;
	var newRoom, oldRoom, switchRoom;

	oldRoom = rooms[0];
	oldRoom.exit();
	for(k = 0; k < rooms.length; k++) {
		if(rooms[k].id === roomId) {
			switchRoom = rooms[k];
			rooms[k] = rooms[0];
			rooms[0] = switchRoom;
			newRoom = rooms[0];
			for(i = 0; i < newRoom.adj.length; i++) {
				room = null;
				for(j = 1; j < rooms.length; j++) {
					if(rooms[j].id === newRoom.adj[i]) {
						// Found in rooms
						room = rooms[j];
						break;
					}
				}
				if(!room) {
					new Room(newRoom.adj[i]);
				}

			}
			for(j = 1; j < rooms.length; j++) {
				room = null;
				for(i = 0; i < newRoom.adj.length; i++) {
					if(rooms[j].id === newRoom.adj[i]) {
						// Found in adj
						room = rooms[j];
						break;
					}
				}
				if(!room) {
					// Not adjacent Anymore, removal !
					rooms.splice(j, 1);
				}
			}
			newRoom.enter();
			return rooms;
		}
	}
	return rooms;
};

var init = function(roomId) {
	// ---- init script ----
	scr = new Screen({
		container: "screen",
		canvas: "canvas"
	});

	new Room(roomId);
	$(scr.container).one('loaded', onRoomLoaded);

};


var run = function() {
	// ---- loop ----
	if(!MENU) {
		requestAnimFrame(run);
	}

	// ---- clear screen ----
	scr.ctx.clearRect(0, 0, scr.width, scr.height);
	
	// ---- camera ----
	camera.move();

	// ---- 3D projection ----
	renderer.renderAll();

};



var onRoomLoaded = function() {
	var parameters = getParameters(window.location.href);

	enteredRoom(rooms[0].id);
	if(typeof(Keyboard) === 'function') {
		keyboard = new Keyboard();
	}
	cursor = new Cursor('screen', params.cursorX, params.cursorY);

	camera = new Camera(rooms[0].startFloor.pv.x, rooms[0].startFloor.pv.z);
	if(parameters.art !== undefined) {
		var i;
		for(i = 0; i < rooms[0].floors.length; i++) {
			if(rooms[0].floors[i].f.art && rooms[0].floors[i].f.art.f.artId === parameters.art) {
				camera.targetToFace(rooms[0].floors[i]);
			}
		}
	}

	requestAnimFrame(run);
};
var Sound = function(room, constr) {
	this.audio = new Audio();
	this.id = constr.id;

	if (this.audio.canPlayType('audio/mpeg;')) {
		this.audio.type= 'audio/mpeg';
		this.audio.src= OeuvresURL + constr.mp3;
	} else {
		this.audio.type= 'audio/ogg';
		this.audio.src= OeuvresURL + constr.ogg;
	}
	this.autoPlay = (constr.play === 'true');
	this.startRoom = [room.id];
	this.rooms = [room.id];
	if(constr.rooms) {
		this.rooms = this.rooms.concat(constr.rooms);
	}
	this.muted = false;
	if(constr.position) {
		this.position = {
			x: (room.position.x + constr.position.x)*params.unit,
			z: (room.position.z + constr.position.z)*params.unit
		};
	}

};


Sound.prototype.adjustVolume = function() {
	var volume;
	var distance;
	if(this.position && camera) {
		distance = Math.sqrt((camera.x.value - this.position.x)*(camera.x.value - this.position.x) + (camera.z.value - params.focalLength - this.position.z)*(camera.z.value - params.focalLength - this.position.z));
		volume = params.unit / distance;

		if(volume>1) {
			volume = 1;
		}

		if(volume<0) {
			volume = 0;
		}

	} else {
		volume = 0.8;
	}
	this.audio.volume = volume;
};
map = new Raphael(document.getElementById('map'), 479, 479);

var circleHover = function() {
	this.animate({
		r: 10
	}, 1000, 'elastic');
};

var circleOutHover = function() {
	this.animate({
		r: 5
	}, 1000, 'elastic');
};

var filterType = function(artsMenu, criteria) {
	var res = [];

	for(var i=0; i<artsMenu.length; i++) {
		if(criteria.type === 'all' || criteria.type === artsMenu[i].type) {
			res.push(artsMenu[i]);
		}
	}
	return res;
};

var makeGroups = function(artsMenu, criteria) {
	var i, j;
	var formerCriteria;
	var artGroup = [];
	var artGroups = [];
	var art;

	arts = filterType(artsMenu, criteria).sort(function(el1, el2) {
		if(el1[criteria.sort] < el2[criteria.sort]) return -1;
		if(el1[criteria.sort] > el2[criteria.sort]) return 1;

		return 0;
	});

	formerCriteria = arts[0][criteria.sort];
	artGroup.push(arts[0]);

	for(i = 1; i < arts.length; i++) {
		art = arts[i];
		if(formerCriteria !== art[criteria.sort]) {
			el = $('<li class="left">'+criteria.label(arts[i-1])+'</li>');
			ul = $('<ul class="full_info" id="'+criteria.sort+'-'+arts[i-1][criteria.sort]+'"></ul>');

			for(j=0; j<artGroup.length; j++) {
				ul.append('<li id="' + artGroup[j].room + '-' + artGroup[j].artId + '"><a class="enter" href="/#!room=' + artGroup[j].room + '&art=' + artGroup[j].artId + '">' + (artGroup[j].info.titre || 'sans titre') + '</a> <span class="small">' + (artGroup[j].info.ensemble||'') + ' ' + (artGroup[j].info.description||'') + '</span></li');
			}

			$(el).append(ul);

			artGroups.push({
				criteria: formerCriteria,
				el: el,
				arts: artGroup
			});
			artGroup = [];
		}
		
		formerCriteria = art[criteria.sort];
		artGroup.push(art);

	}

	el = $('<li class="left">'+criteria.label(arts[i-1])+'</li>');
	ul = $('<ul class="full_info" id="'+criteria.sort+'-'+arts[i-1][criteria.sort]+'"></ul>');

	for(j=0; j<artGroup.length; j++) {
		ul.append('<li id="' + artGroup[j].room + '-' + artGroup[j].artId + '"><a class="enter" href="/#!room=' + artGroup[j].room + '&art=' + artGroup[j].artId + '">' + (artGroup[j].info.titre || 'sans titre') + '</a> <span class="small">' + (artGroup[j].info.ensemble||'') + ' ' + (artGroup[j].info.description||'') + '</span></li');
	}

	$(el).append(ul);

	artGroups.push({
		criteria: formerCriteria,
		el: el,
		arts: artGroup
	});

	return artGroups;

};

var showList = function(artsMenu, criteria) {
	var i;
	var artGroups = makeGroups(artsMenu, criteria);

	$('#content_list').empty();

	$.each(artGroups, function(index, artGroup) {

		$(artGroup.el).hover($.proxy(function() {
			$('ul.full_info').stop().fadeOut(500);
			$(this.el).find('ul.full_info').stop().fadeIn(500);

			showCircles(this.arts);

		}, artGroup));

		$('#content_list').append(artGroup.el);

	});

	// $('#content_list').tinyscrollbar();

};


$.getJSON('numero0/artList.json', function(data) {
	var i;
	this.artsMenu = data;

	this.criteria = {
		type: 'all',
		sort: 'artistId',
		label: function(art) {
			if(this.sort === 'artistId') {
				return art.info.artiste;
			}
			if(this.sort === 'room') {
				return '<a href="#!room='+art.room+'" class="enter">Salle '+art.room+'</a>';
			}
		}
	};

	showList(this.artsMenu, this.criteria);

	// $('#menu_tous').addClass('active');
	$('#menu_participants').addClass('active');

	$('#menu_images').click($.proxy(function(e) {
		this.criteria.type = 'image';
		showList(this.artsMenu, this.criteria);
		$('.menu_type').removeClass('active');
		$('#menu_images').addClass('active');
		map.clear();
	}, this));
	$('#menu_sounds').click($.proxy(function(e) {
		this.criteria.type = 'sound';
		showList(this.artsMenu, this.criteria);
		$('.menu_type').removeClass('active');
		$('#menu_sounds').addClass('active');
		map.clear();
	}, this));
	$('#menu_texts').click($.proxy(function(e) {
		this.criteria.type = 'text';
		showList(this.artsMenu, this.criteria);
		$('.menu_type').removeClass('active');
		$('#menu_texts').addClass('active');
		map.clear();
	}, this));
	$('#menu_videos').click($.proxy(function(e) {
		this.criteria.type = 'video';
		showList(this.artsMenu, this.criteria);
		$('.menu_type').removeClass('active');
		$('#menu_videos').addClass('active');
		map.clear();
	}, this));

	$('#menu_participants').click($.proxy(function(e) {
		this.criteria.sort = 'artistId';
		this.criteria.type = 'all';
		showList(this.artsMenu, this.criteria);
		$('.menu_sort').removeClass('active');
		$('.menu_type').removeClass('active');
		$('#menu_participants').addClass('active');
		map.clear();
	}, this));

	$('#menu_salles').click($.proxy(function(e) {
		this.criteria.sort = 'room';
		this.criteria.type = 'all';
		showList(this.artsMenu, this.criteria);
		$('.menu_sort').removeClass('active');
		$('.menu_type').removeClass('active');
		$('#menu_salles').addClass('active');
		map.clear();
	}, this));

});

var showCircles = function(arts) {
	var ratio = 479 / 54;
	map.clear();
	if(camera) {
		setPosition(camera.x.value/params.unit * ratio, 479 - camera.z.value/params.unit * ratio);
	}

	$.each(arts, function(index, art) {
		art.circle = map.circle(art.x * ratio, 479 - art.z * ratio, 5);

		if(art.type === 'text') {
			art.circle.attr("fill", "purple");
		}
		if(art.type === 'image') {
			art.circle.attr("fill", "green");
		}
		if(art.type === 'video') {
			art.circle.attr("fill", "blue");
		}
		if(art.type === 'sound') {
			art.circle.attr("fill", "yellow");
		}

		art.circle.attr("stroke", "#fff");

		art.circle.attr('href', '/#!room=' + art.room + '&art=' + art.artId);

		art.circle.hover(circleHover, circleOutHover);

		$('#' + art.room + '-' + art.artId).hover($.proxy(circleHover, art.circle), $.proxy(circleOutHover, art.circle));

	});

};

var setPosition = function(x, z) {
	if(x && z) {
		var cross_size = 5;
		var path = 'M'+(x-cross_size)+','+(z-cross_size)+'L'+(x+cross_size)+','+(z+cross_size)+'M'+(x+cross_size)+','+(z-cross_size)+'L'+(x-cross_size)+','+(z+cross_size);
		var cross = map.path(path);
		cross.attr('stroke', 'red');
		cross.attr('stroke-width', 3);
	}
};

var enterMuseum = function(roomId) {
	$('#menu').fadeOut(1000);
	$('#screen').fadeIn(1000);
	MENU = false;

	if(rooms.length && rooms[0].id === roomId) {
		rooms[0].enter();
		run();
	} else {
		rooms= [];
		init(roomId);
	}

};


var enterMenu = function() {
	var ratio = 479 / 54;
	var i;
	// $('#visite').html('Retourner directement à la visite');
	$('#menu').fadeIn(1000);
	$('#screen').fadeOut(1000);
	MENU = true;

	map.clear();
	if(camera) {
		setPosition(camera.x.value/params.unit * ratio, 479 - camera.z.value/params.unit * ratio);
	}

	if(sounds.length) {
		for(i=0; i<sounds.length; i++) {
			sounds[i].audio.pause();
		}
	}

};

$('#minimap').click(function(e) {
	enterMenu();
	e.preventDefault();
	return false;
});

$('#start').click(function() {
	$('#intro').fadeOut(1000, function(){
		$(this).remove();
	});
	enterMenu();
	$.proxy(show_Page, $('.iframeLink[data-link="manifeste-editorial.html"]'))();
});



var show_Page = function() {
	$('#menuIframeView').attr('height',($(this).attr('data-height')||'100%'));
	$('#menuIframeView').html('<iframe src="menu_pages/'+$(this).attr('data-link')+'" class="menu_page" height="'+($(this).attr('data-height')||'100%')+'"></iframe>');
	$('#menuIframeView').append('<a class="rotate_3PM"><span>Sommaire<span></a>');
	$('#menuIframeView').fadeIn(1000);
	$('#menuIframeView a').one('click',function(){
		$('#menuIframeView').fadeOut(1000, function(){
			$('#menuIframeView').empty();
		});
	});
};

$('.iframeLink').click(function() {
	$.proxy(show_Page, $(this))();
});


$('.enter').live('click',function(e){
	var room;

	room = parseInt(getParameters($(this).attr('href')||window.location.href).room, 10);
	if(room) {
		return enterMuseum(room);
	}

	if(rooms[0]) {
		return enterMuseum(rooms[0].id);
	}
	return enterMuseum(1);
});


$('.close').one('click', function(e) {

	$('#full-screen').fadeOut(1000, function() {
		$(this).remove();
	});
	$('#screen').focus();

	e.preventDefault();
	return false;
});

// $('#volume').live('click',function(e) {
$('#volume').click(function(e) {
	var i;
	if(!$('#volume').hasClass('muted')) {
		$('#volume').addClass('muted');
		for(i = 0; i < sounds.length; i++) {
			sounds[i].audio.pause();
		}
	} else {
		$('#volume').removeClass('muted');
		for(i = 0; i < sounds.length; i++) {
			if(sounds[i].playNow) {
				sounds[i].adjustVolume();
				sounds[i].audio.play();
			}
		}
	}
	e.preventDefault();
	return false;
});
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-38271419-1']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();