/*!
* firefront
* https://github.com/attrs/firefront
*
* Copyright attrs and others
* Released under the MIT license
* https://github.com/attrs/firefront/blob/master/LICENSE
*/
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("FF", [], factory);
	else if(typeof exports === 'object')
		exports["FF"] = factory();
	else
		root["FF"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var Context = __webpack_require__(1);
	var Toolbar = __webpack_require__(13);
	
	__webpack_require__(19);
	
	var Part = __webpack_require__(21);
	var TextPart = __webpack_require__(22);
	var ArticlePart = __webpack_require__(41);
	var ParagraphPart = __webpack_require__(67);
	var SeparatorPart = __webpack_require__(70);
	var ImagePart = __webpack_require__(73);
	var VideoPart = __webpack_require__(76);
	var FloaterPart = __webpack_require__(79);
	
	Context.Toolbar = Toolbar;
	Context.Part = Part;
	Context.Text = TextPart;
	Context.Article = ArticlePart;
	Context.Paragraph = ParagraphPart;
	Context.Separator = SeparatorPart;
	Context.Image = ImagePart;
	Context.Video = VideoPart;
	Context.Floater = FloaterPart;
	
	Context.types().define('default', ImagePart);
	Context.types().define('text', TextPart);
	Context.types().define('article', ArticlePart);
	Context.types().define('paragraph', ParagraphPart);
	Context.types().define('separator', SeparatorPart);
	Context.types().define('image', ImagePart);
	Context.types().define('video', VideoPart);
	Context.types().define('floater', FloaterPart);
	
	(function() {
	  var readyfn;
	  
	  document.addEventListener('DOMContentLoaded', function() {
	    Context.scan();
	    readyfn && readyfn();
	  });
	
	  Context.ready = function(fn) {
	    if( document.body ) fn();
	    else readyfn = fn;
	  };
	})();
	
	module.exports = Context;


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var each = __webpack_require__(2);
	var Events = __webpack_require__(6);
	var $ = __webpack_require__(7);
	var types = __webpack_require__(11);
	var connector = __webpack_require__(12);
	
	var parts = [];
	var data = {};
	var editmode = false;
	var dispatcher = Events();
	
	var context = {
	  connector: function() {
	    return connector;
	  },
	  types: function() {
	    return types;
	  },
	  parts: function() {
	    return parts.slice();
	  },
	  part: function(id) {
	    return parts[id];
	  },
	  clear: function(id) {
	    parts.forEach(function(part) {
	      part.data(null);
	    });
	    return this;
	  },
	  scan: function() {
	    [].slice.call(document.querySelectorAll('[ff-id], [ff-type]')).reverse().forEach(function(el) {
	      var id = el.getAttribute('ff-id');
	      var type = el.getAttribute('ff-type') || 'default';
	      var part = el.__ff__;
	      
	      if( !part ) {
	        var Type = types.get(type);
	        if( !Type ) return console.warn('[firefront] not found type: ' + type);
	        part = el.__ff__ = new Type(el);
	        data[id] && part.data(data[id]);
	      }
	      
	      parts.push(part);
	      if( id ) parts[id] = part;
	    });
	  },
	  reset: function(d) {
	    if( !arguments.length ) d = data;
	    
	    data = d;
	    this.scan();
	    parts.forEach(function(part) {
	      data[part.id] && part.data(data[part.id]);
	    });
	    
	    dispatcher.fire('reset');
	    
	    return this;
	  },
	  editmode: function(b) {
	    if( !arguments.length ) return editmode;
	    
	    editmode = !!b;
	    parts.forEach(function(part) {
	      part.editmode(!!b);
	    });
	    
	    dispatcher.fire('editmode', {
	      editmode: editmode
	    });
	    
	    return this;
	  },
	  on: function(type, fn) {
	    dispatcher.on(type, fn);
	    return this;
	  },
	  once: function(type, fn) {
	    dispatcher.once(type, fn);
	    return this;
	  },
	  off: function(type, fn) {
	    dispatcher.off(type, fn);
	    return this;
	  }
	};
	
	context.isElement = function(node) {
	  return (
	    typeof HTMLElement === 'object' ? node instanceof HTMLElement : node && typeof node === 'object' && node !== null && node.nodeType === 1 && typeof node.nodeName === 'string'
	  );
	};
	
	context.upload = function(file, done) {
	  if( !window.FileReader ) return done(new Error('not found FileReader'));
	  var reader = new FileReader(); // NOTE: IE10+
	  reader.onload = function(e) {
	    done(null, e.target.result);
	  };
	  reader.onerror = function(err) {
	    done(err);
	  };
	  reader.readAsDataURL(file);
	  
	  return this;
	};
	
	context.selectFiles = function(done) {
	  var input = document.createElement('input');
	  input.type = 'file';
	  input.setAttribute('multiple', 'true');
	  input.click();
	  input.onchange = function() {
	    var srcs = [];
	    each([].slice.call(input.files), function(file, done) {
	      context.upload(file, function(err, src) {
	        if( err ) return done(err);
	        srcs.push(src);
	        done();
	      });
	    }, function(err) {
	      if( err ) return done(err);
	      done(null, srcs);
	    });
	  };
	  
	  return this;
	};
	
	context.selectFile = function(done) {
	  var input = document.createElement('input');
	  input.type = 'file';
	  input.click();
	  input.onchange = function() {
	    context.upload(file, done);
	  };
	  
	  return this;
	};
	
	context.getRange = function(index) {
	  if( !window.getSelection ) return null;
	  
	  var selection = window.getSelection();
	  if( selection.rangeCount && selection.rangeCount > (index || 0) ) return selection.getRangeAt(index || 0);
	  return null;
	};
	
	context.setRange = function(range) {
	  if( !range || !window.getSelection ) return;
	  
	  var selection = window.getSelection();
	  selection.removeAllRanges();
	  selection.addRange(range);
	}
	
	context.getCaretPosition = function(node) {
	  if( !window.getSelection ) return -1;
	  if( !node ) return -1;
	  
	  var position = -1;
	  var selection = window.getSelection();
	  
	  if( selection.rangeCount ) {
	    var range = selection.getRangeAt(0);
	    if( range.commonAncestorContainer.parentNode == node ) {
	      position = range.endOffset;
	    }
	  }
	  
	  return position;
	};
	
	context.getPart = function(node) {
	  var node = $(node).parent(function() {
	    return this.__ff__;
	  }, true)[0];
	  return node && node.__ff__;
	};
	
	dispatcher.scope(context);
	
	module.exports = context;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(setImmediate, process) {module.exports = function (arr, iterator, callback) {
	  callback = callback || function () {};
	  if (!Array.isArray(arr) || !arr.length) {
	      return callback();
	  }
	  var completed = 0;
	  var iterate = function () {
	    iterator(arr[completed], function (err) {
	      if (err) {
	        callback(err);
	        callback = function () {};
	      }
	      else {
	        ++completed;
	        if (completed >= arr.length) { callback(); }
	        else { nextTick(iterate); }
	      }
	    });
	  };
	  iterate();
	};
	
	function nextTick (cb) {
	  if (typeof setImmediate === 'function') {
	    setImmediate(cb);
	  } else {
	    process.nextTick(cb);
	  }
	}
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3).setImmediate, __webpack_require__(5)))

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var apply = Function.prototype.apply;
	
	// DOM APIs, for completeness
	
	exports.setTimeout = function() {
	  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
	};
	exports.setInterval = function() {
	  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
	};
	exports.clearTimeout =
	exports.clearInterval = function(timeout) {
	  if (timeout) {
	    timeout.close();
	  }
	};
	
	function Timeout(id, clearFn) {
	  this._id = id;
	  this._clearFn = clearFn;
	}
	Timeout.prototype.unref = Timeout.prototype.ref = function() {};
	Timeout.prototype.close = function() {
	  this._clearFn.call(window, this._id);
	};
	
	// Does not start the time, just sets up the members needed.
	exports.enroll = function(item, msecs) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = msecs;
	};
	
	exports.unenroll = function(item) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = -1;
	};
	
	exports._unrefActive = exports.active = function(item) {
	  clearTimeout(item._idleTimeoutId);
	
	  var msecs = item._idleTimeout;
	  if (msecs >= 0) {
	    item._idleTimeoutId = setTimeout(function onTimeout() {
	      if (item._onTimeout)
	        item._onTimeout();
	    }, msecs);
	  }
	};
	
	// setimmediate attaches itself to the global object
	__webpack_require__(4);
	exports.setImmediate = setImmediate;
	exports.clearImmediate = clearImmediate;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {(function (global, undefined) {
	    "use strict";
	
	    if (global.setImmediate) {
	        return;
	    }
	
	    var nextHandle = 1; // Spec says greater than zero
	    var tasksByHandle = {};
	    var currentlyRunningATask = false;
	    var doc = global.document;
	    var registerImmediate;
	
	    function setImmediate(callback) {
	      // Callback can either be a function or a string
	      if (typeof callback !== "function") {
	        callback = new Function("" + callback);
	      }
	      // Copy function arguments
	      var args = new Array(arguments.length - 1);
	      for (var i = 0; i < args.length; i++) {
	          args[i] = arguments[i + 1];
	      }
	      // Store and register the task
	      var task = { callback: callback, args: args };
	      tasksByHandle[nextHandle] = task;
	      registerImmediate(nextHandle);
	      return nextHandle++;
	    }
	
	    function clearImmediate(handle) {
	        delete tasksByHandle[handle];
	    }
	
	    function run(task) {
	        var callback = task.callback;
	        var args = task.args;
	        switch (args.length) {
	        case 0:
	            callback();
	            break;
	        case 1:
	            callback(args[0]);
	            break;
	        case 2:
	            callback(args[0], args[1]);
	            break;
	        case 3:
	            callback(args[0], args[1], args[2]);
	            break;
	        default:
	            callback.apply(undefined, args);
	            break;
	        }
	    }
	
	    function runIfPresent(handle) {
	        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
	        // So if we're currently running a task, we'll need to delay this invocation.
	        if (currentlyRunningATask) {
	            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
	            // "too much recursion" error.
	            setTimeout(runIfPresent, 0, handle);
	        } else {
	            var task = tasksByHandle[handle];
	            if (task) {
	                currentlyRunningATask = true;
	                try {
	                    run(task);
	                } finally {
	                    clearImmediate(handle);
	                    currentlyRunningATask = false;
	                }
	            }
	        }
	    }
	
	    function installNextTickImplementation() {
	        registerImmediate = function(handle) {
	            process.nextTick(function () { runIfPresent(handle); });
	        };
	    }
	
	    function canUsePostMessage() {
	        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
	        // where `global.postMessage` means something completely different and can't be used for this purpose.
	        if (global.postMessage && !global.importScripts) {
	            var postMessageIsAsynchronous = true;
	            var oldOnMessage = global.onmessage;
	            global.onmessage = function() {
	                postMessageIsAsynchronous = false;
	            };
	            global.postMessage("", "*");
	            global.onmessage = oldOnMessage;
	            return postMessageIsAsynchronous;
	        }
	    }
	
	    function installPostMessageImplementation() {
	        // Installs an event handler on `global` for the `message` event: see
	        // * https://developer.mozilla.org/en/DOM/window.postMessage
	        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages
	
	        var messagePrefix = "setImmediate$" + Math.random() + "$";
	        var onGlobalMessage = function(event) {
	            if (event.source === global &&
	                typeof event.data === "string" &&
	                event.data.indexOf(messagePrefix) === 0) {
	                runIfPresent(+event.data.slice(messagePrefix.length));
	            }
	        };
	
	        if (global.addEventListener) {
	            global.addEventListener("message", onGlobalMessage, false);
	        } else {
	            global.attachEvent("onmessage", onGlobalMessage);
	        }
	
	        registerImmediate = function(handle) {
	            global.postMessage(messagePrefix + handle, "*");
	        };
	    }
	
	    function installMessageChannelImplementation() {
	        var channel = new MessageChannel();
	        channel.port1.onmessage = function(event) {
	            var handle = event.data;
	            runIfPresent(handle);
	        };
	
	        registerImmediate = function(handle) {
	            channel.port2.postMessage(handle);
	        };
	    }
	
	    function installReadyStateChangeImplementation() {
	        var html = doc.documentElement;
	        registerImmediate = function(handle) {
	            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
	            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
	            var script = doc.createElement("script");
	            script.onreadystatechange = function () {
	                runIfPresent(handle);
	                script.onreadystatechange = null;
	                html.removeChild(script);
	                script = null;
	            };
	            html.appendChild(script);
	        };
	    }
	
	    function installSetTimeoutImplementation() {
	        registerImmediate = function(handle) {
	            setTimeout(runIfPresent, 0, handle);
	        };
	    }
	
	    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
	    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
	    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;
	
	    // Don't get fooled by e.g. browserify environments.
	    if ({}.toString.call(global.process) === "[object process]") {
	        // For Node.js before 0.9
	        installNextTickImplementation();
	
	    } else if (canUsePostMessage()) {
	        // For non-IE10 modern browsers
	        installPostMessageImplementation();
	
	    } else if (global.MessageChannel) {
	        // For web workers, where supported
	        installMessageChannelImplementation();
	
	    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
	        // For IE 6–8
	        installReadyStateChangeImplementation();
	
	    } else {
	        // For older browsers
	        installSetTimeoutImplementation();
	    }
	
	    attachTo.setImmediate = setImmediate;
	    attachTo.clearImmediate = clearImmediate;
	}(typeof self === "undefined" ? typeof global === "undefined" ? this : global : self));
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(5)))

/***/ },
/* 5 */
/***/ function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};
	
	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.
	
	var cachedSetTimeout;
	var cachedClearTimeout;
	
	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }
	
	
	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }
	
	
	
	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;
	
	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}
	
	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;
	
	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}
	
	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};
	
	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};
	
	function noop() {}
	
	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	
	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};
	
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 6 */
/***/ function(module, exports) {

	if( !Array.prototype.every ) {
	  Array.prototype.every = function(callbackfn, thisArg) {
	    var T, k;
	    
	    if (this == null) {
	      throw new TypeError('this is null or not defined');
	    }
	    
	    var O = Object(this);
	    var len = O.length >>> 0;
	    if (typeof callbackfn !== 'function') {
	      throw new TypeError();
	    }
	    if (arguments.length > 1) {
	      T = thisArg;
	    }
	    k = 0;
	    while (k < len) {
	      var kValue;
	      if (k in O) {
	        kValue = O[k];
	        var testResult = callbackfn.call(T, kValue, k, O);
	        if (!testResult) {
	          return false;
	        }
	      }
	      k++;
	    }
	    return true;
	  };
	}
	
	if( !Array.isArray ) {
	  Array.isArray = function(arg) {
	    return Object.prototype.toString.call(arg) === '[object Array]';
	  };
	}
	
	function EventObject(type, detail, target, cancelable) {
	  this.type = type;
	  this.detail = detail || {};
	  this.target = this.currentTarget = target;
	  this.cancelable = cancelable === true ? true : false;
	  this.defaultPrevented = false;
	  this.stopped = false;
	  this.timeStamp = new Date().getTime();
	}
	
	EventObject.prototype = {
	  preventDefault: function() {
	    if( this.cancelable ) this.defaultPrevented = true;
	  },
	  stopPropagation: function() {
	    this.stopped = true;
	  },
	  stopImmediatePropagation: function() {
	    this.stoppedImmediate = true;
	    this.stopped = true;
	  }
	};
	
	EventObject.createEvent = function(type, detail, target, cancelable) {
	  return new EventObject(type, detail, target, cancelable);
	};
	
	
	module.exports = function(scope) {
	  var listeners = {}, paused = false;
	  
	  var on = function(type, fn) {
	    if( !type || typeof type !== 'string' ) return console.error('type must be a string');
	    if( typeof fn !== 'function' ) return console.error('listener must be a function');
	    
	    var types = type.split(' ');
	    types.forEach(function(type) {
	      listeners[type] = listeners[type] || [];
	      listeners[type].push(fn);
	    });
	    
	    return this;
	  };
	  
	  var once = function(type, fn) {
	    if( !type || typeof type !== 'string' ) return console.error('type must be a string');
	    if( typeof fn !== 'function' ) return console.error('listener must be a function');
	    
	    var types = type.split(' ');
	    types.forEach(function(type) {
	      if( !type ) return;
	      
	      var wrap = function(e) {
	        off(type, wrap);
	        return fn.call(this, e);
	      };
	      on(type, wrap);
	    });
	    
	    return this;
	  };
	  
	  var off = function(type, fn) {
	    if( !type || typeof type !== 'string' ) return console.error('type must be a string');
	    if( typeof fn !== 'function' ) return console.error('listener must be a function');
	    
	    var types = type.split(' ');
	    types.forEach(function(type) {
	      var fns = listeners[type];
	      if( fns ) for(var i;~(i = fns.indexOf(fn));) fns.splice(i, 1);
	    });
	    
	    return this;
	  };
	  
	  var has = function(type) {
	    if( typeof type === 'function' ) {
	      var found = false;
	      listeners.forEach(function(fn) {
	        if( found ) return;
	        if( fn === type ) found = true;
	      });
	      return found;
	    }
	    return listeners[type] && listeners[type].length ? true : false;
	  };
	  
	  var fire = function(type, detail, direction, includeself) {
	    if( paused ) return;
	    
	    var typename = (type && type.type) || type;
	    
	    var event;
	    if( typeof type === 'string' ) {
	      event = EventObject.createEvent(type, detail, scope);
	    } else if( type instanceof window.Event ) {
	      event = type;
	    } else if( type instanceof EventObject ) {
	      event = type;
	    } else {
	      return console.error('illegal arguments, type is must be a string or event', type);
	    }
	    event.currentTarget = scope;
	    
	    var action = function(listener) {
	      if( event.stoppedImmediate ) return;
	      listener.call(scope, event);
	    };
	    
	    if( !direction || includeself !== false ) {
	      (listeners['*'] || []).slice().reverse().forEach(action);
	      (listeners[event.type] || []).slice().reverse().forEach(action);
	    }
	    
	    if( direction && !event.stopped ) {
	      if( direction === 'up' ) {
	        upstream.every(function(target) {
	          target.fire && target.fire(event, null, direction);
	          return !event.stopped;
	        });
	      } else if( direction === 'down' ) {
	        downstream.every(function(target) {
	          target.fire && target.fire(event, null, direction);
	          return !event.stopped;
	        });
	      } else if(Array.isArray(direction)) {
	        direction.every(function(target) {
	          //console.log('fire', event.type, target.id);
	          target.fire && target.fire(event);
	          return !event.stopped;
	        });
	      } else {
	        console.warn('invalid type of direction', direction);
	      }
	    }
	    
	    return !event.defaultPrevented;
	  };
	  
	  var destroy = function() {
	    listeners = null;
	    return this;
	  };
	  
	  var pause = function() {
	    paused = true;
	    return this;
	  };
	  
	  var resume = function() {
	    paused = false;
	    return this;
	  };
	  
	  var upstream = [];
	  var downstream = [];
	  
	  var connect = function(target, direction) {
	    if( !target ) return console.warn('illegal argument: target cannot be null', target);
	    if( typeof target.fire !== 'function' ) return console.warn('illegal argument: target must have fire method', target);
	    
	    if( direction === 'up' && ~upstream.indexOf(target) ) return;
	    else if( direction === 'down' && ~downstream.indexOf(target) ) return;
	    else if( direction === 'up' ) upstream.push(target);
	    else if( direction === 'down' ) downstream.push(target);
	    else return console.warn('illegal argument: direction must be "up" or "down" but ', direction);
	    
	    return this;
	  };
	  
	  var disconnect = function(target, direction) {
	    if( !target ) return this;
	    
	    if( (!direction || direction === 'up') && ~upstream.indexOf(target) ) upstream.splice(upstream.indexOf(fn), 1);
	    if( (!direction || direction === 'down') && ~downstream.indexOf(target) ) downstream.splice(downstream.indexOf(fn), 1);
	    
	    return this;
	  };
	  
	  // make dom event adaptable
	  var handleEvent = function(e) {
	    return fire(e);
	  };
	  
	  return {
	    handleEvent: handleEvent,
	    scope: function(o) {
	      if( !arguments.length ) return scope;
	      scope = o;
	    },
	    on: on,
	    once: once,
	    off: off,
	    fire: fire,
	    has: has,
	    destroy: destroy,
	    pause: pause,
	    resume: resume,
	    connect: connect,
	    disconnect: disconnect
	  };
	};

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var Context = __webpack_require__(8);
	
	__webpack_require__(10)(Context);
	
	var def = Context(document);
	module.exports = function(doc) {
	  if( doc instanceof Document ) {
	    if( doc === document ) return def(doc);
	    return doc.__tinyselector__ = doc.__tinyselector__ || Context(doc);
	  }
	  
	  return def.apply(def, arguments);
	};

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var win = window;
	var Extensions = function() {}
	Extensions.prototype = new Array();
	var extensions = new Extensions();
	
	var util = __webpack_require__(9);
	var isArrayLike = util.isArrayLike;
	var create = util.create;
	var isHTML = util.isHTML;
	
	var Context = function(document) {
	  if( !document ) {
	    var cs = (win.currentScript || win._currentScript);
	    document = (cs && cs.ownerDocument) || win.document;
	  }
	  
	  var Selection = function(selector) {
	    if( typeof selector == 'string' ) {
	      if( isHTML(selector) ) {
	        selector = create(selector);
	      } else {
	        selector = document.querySelectorAll(selector);
	      }
	    }
	    
	    if( selector ) {
	      if( selector instanceof Extensions ) {
	        return selector;
	      } else if( isArrayLike(selector) ) {
	        var self = this;
	        [].forEach.call(selector, function(el) {
	          self.push(el);
	        });
	      } else {
	        this.push(selector);
	      }
	    }
	  };
	  
	  var Selector = function(selector) {
	    return new Selection(selector);
	  };
	  
	  Selector.ready = function(fn) {
	    if( document.body ) return fn.call(this, $);
	    
	    document.addEventListener('DOMContentLoaded', function() {
	      fn(Selector);
	    });
	  };
	  
	  Selector.fn = extensions;
	  Selector.isArrayLike = isArrayLike;
	  Selector.create = create;
	  Selector.isHTML = isHTML;
	  Selection.prototype = extensions;
	  Selection.prototype.document = document;
	  Selection.prototype.Selection = Selection;
	  Selection.prototype.$ = Selector;
	  
	  return Selector;
	}
	
	Context.fn = extensions;
	
	module.exports = Context;

/***/ },
/* 9 */
/***/ function(module, exports) {

	function isNull(value) {
	  return value === null || value === undefined;
	}
	
	function isArrayLike(o) {
	  if( !o || typeof o != 'object' || o === window || typeof o.length != 'number' ) return false;
	  if( o instanceof Array || (Array.isArray && Array.isArray(o)) ) return true;
	  
	  var type = Object.prototype.toString.call(o);
	  return /^\[object (HTMLCollection|NodeList|Array|Arguments)\]$/.test(type);
	}
	
	function create(html) {
	  if( !html || typeof html != 'string' ) return null;
	  var div = document.createElement('div');
	  div.innerHTML = html.trim();
	  return div.childNodes;
	}
	
	function isHTML(html) {
	  return (typeof html === 'string' && html.match(/(<([^>]+)>)/ig) ) ? true : false;
	}
	
	function matches(el, selector) {
	  try {
	    if( typeof selector == 'function' )
	      return !!selector.call(el);
	    
	    return !!(el && el.matches && el.matches(selector));
	  } catch(e) {
	    return false;
	  }
	}
	
	module.exports = {
	  isNull: isNull,
	  isArrayLike: isArrayLike,
	  create: create,
	  isHTML: isHTML,
	  matches: matches
	};

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(9);
	
	module.exports = function($) {
	  var fn = $.fn;
	  var isArrayLike = util.isArrayLike;
	  var isNull = util.isNull;
	  var matches = util.matches;
	  
	  fn.each = function(fn) {
	    var i = 0;
	    this.every(function(el) {
	      i = i + 1;
	      if( !el ) return true;
	      return ( fn.apply(el, [i, el]) === false ) ? false : true;
	    });
	    return this;
	  };
	  
	  fn.add = function(arr) {
	    if( !arr ) return;
	    if( !isArrayLike(arr) ) arr = [arr];
	    
	    var self = this;
	    [].forEach.call(arr, function(item) {
	      if( item ) self.push(item);
	    });
	    return this;
	  };
	  
	  fn.remove = function(item, once) {
	    if( typeof item === 'number' ) item = this[item];
	    for(var index;(index = this.indexOf(item)) >= 0;) {
	      this.splice(index, 1);
	      if( once ) break;
	    }
	    return this;
	  };
	  
	  fn.reverse = function() {
	    [].reverse.call(this);
	    return this;
	  };
	  
	  fn.clear = function() {
	    var len = this.length;
	    if( len > 0 ) {
	      for(var i=0; i < len; i++) delete this[i];
	      this.length = 0;
	    }
	    
	    return this;
	  };
	  
	  fn.get = function(index) {
	    return this[index];
	  };
	  
	  fn.find = function(selector) {
	    var nodes = this.$();
	    this.each(function() {
	      if( !this.querySelectorAll ) return;
	      [].forEach.call(this.querySelectorAll(selector), function(node) {
	        if( !~nodes.indexOf(node) ) nodes.push(node);
	      });
	    });
	    return nodes;
	  };
	  
	  fn.empty = function() {
	    return this.each(function() {
	      this.innerHTML = null;
	    });
	  };
	  
	  fn.html = function(html) {
	    return this.each(function() {
	      this.innerHTML = html;
	    });
	  };
	  
	  fn.attr = function(key, value) {
	    if( !arguments.length ) return null;
	    if( typeof key == 'object' ) {
	      for(var k in key) this.attr(k, key[k]);
	      return this;
	    }
	    if( arguments.length === 1 ) return this[0] && this[0].getAttribute && this[0].getAttribute(key);
	    
	    return this.each(function() {
	      if( isNaN(value) || value === null || value === undefined ) this.removeAttribute(key);
	      else this.setAttribute(key, value + '');
	    });
	  };
	  
	  fn.css = function(key, value) {
	    if( !artuments.length ) return null;
	    if( arguments.length === 1 ) return this[0] && this[0].style && this[0].style[key];
	    
	    return this.each(function() {
	      if( isNull(value) ) this.style[key] = null;
	      else this.style[key] = value;
	    });
	  };
	  
	  fn.addClass = fn.ac = function(cls) {
	    if( typeof cls == 'string' ) cls = cls.split(' ');
	    if( !isArrayLike(cls) || !cls.length ) return this;
	    
	    return this.each(function() {
	      if( 'className' in this ) {
	        var ocls = this.className.trim().split(' ');
	        [].forEach.call(cls, function(cls) {
	          if( isNull(cls) ) return;
	          if( !~ocls.indexOf(cls) ) ocls.push(cls);
	        });
	        this.className = ocls.join(' ').trim();
	      }
	    });
	  };
	  
	  fn.removeClass = fn.rc = function(cls) {
	    if( typeof cls == 'string' ) cls = cls.split(' ');
	    if( !isArrayLike(cls) || !cls.length ) return this;
	    
	    return this.each(function() {
	      if( 'className' in this ) {
	        var ocls = this.className.trim().split(' ');
	        [].forEach.call(cls, function(cls) {
	          if( isNull(cls) ) return;
	          var pos = ocls.indexOf(cls);
	          if( ~pos ) ocls.splice(pos, 1);
	        });
	        this.className = ocls.join(' ').trim();
	      }
	    });
	  };
	  
	  fn.clearClass = fn.cc = function() {
	    return this.each(function() {
	      if( 'className' in this ) {
	        this.className = '';
	        this.removeAttribute('class');
	      }
	    });
	  };
	  
	  fn.classes = fn.cls = function(cls) {
	    if( !arguments.length ) return this[0] && this[0].className;
	    if( !cls ) return this.cc();
	    
	    return this.each(function() {
	      if( 'className' in this ) {
	        this.className = cls;
	      }
	    });
	  };
	  
	  fn.hasClass = fn.hc = function(cls) {
	    if( typeof cls == 'string' ) cls = cls.split(' ');
	    if( !isArrayLike(cls) || !cls.length ) return false;
	    if( !this[0] || !this[0].className ) return false;
	    
	    var ocls = this[0].className.trim().split(' ');
	    var exists = true;
	    [].forEach.call(cls, function(cls) {
	      if( isNull(cls) ) return;
	      if( !~ocls.indexOf(cls) ) exists = false;
	    });
	    return exists;
	  };
	  
	  fn.toggleClass = fn.tc = function(cls) {
	    if( typeof cls == 'string' ) cls = cls.split(' ');
	    if( !isArrayLike(cls) || !cls.length ) return this;
	    
	    return this.each(function() {
	      if( 'className' in this ) {
	        var ocls = this.className.trim().split(' ');
	        [].forEach.call(cls, function(cls) {
	          if( isNull(cls) ) return;
	          var pos = ocls.indexOf(cls);
	          if( !~pos ) ocls.push(cls);
	          else ocls.splice(pos, 1);
	        });
	        this.className = ocls.join(' ').trim();
	      }
	    });
	  };
	  
	  fn.append = function(node) {
	    if( !node ) return this;
	    if( !isArrayLike(node) ) node = [node];
	    
	    return this.each(function() {
	      var el = this;
	      if( el.appendChild ) {
	        [].forEach.call(node, function(node) {
	          el.appendChild(node);
	        });
	      }
	    });
	  };
	  
	  fn.appendTo = function(target) {
	    if( !target ) return this;
	    
	    return this.each(function() {
	      if( target.append ) {
	        target.append(this);
	      } else if( target.appendChild ) {
	        target.appendChild(this);
	      } 
	    });
	  };
	  
	  fn.insertBefore = function(ref) {
	    if( typeof ref == 'string' ) ref = this.document.querySelector(ref);
	    if( isArrayLike(ref) ) ref = ref[0];
	    if( !ref ) return this;
	    
	    var parent = ref.parentNode;
	    if( !parent ) return this;
	    
	    return this.each(function() {
	      if( parent.insertBefore ) {
	        parent.insertBefore(this, ref);
	      }
	    });
	  };
	  
	  fn.insertAfter = function(ref) {
	    if( typeof ref == 'string' ) ref = this.document.querySelector(ref);
	    if( isArrayLike(ref) ) ref = ref[0];
	    if( !ref ) return this;
	    
	    var parent = ref.parentNode;
	    var sib = ref.nextSibling;
	    if( !parent ) return this;
	    
	    return this.each(function() {
	      if( !sib ) {
	        parent.appendChild(this);
	      } else if( parent.insertBefore ) {
	        parent.insertBefore(this, sib);
	      }
	    });
	  };
	  
	  fn.remove = function(node) {
	    if( !arguments.length ) return this.each(function() {
	      var p = this.parentNode;
	      p && p.removeChild(this);
	    });
	    
	    if( !node ) return;
	    if( !isArrayLike(node) ) node = [node];
	    
	    return this.each(function() {
	      if( this.removeChild ) {
	        [].forEach.call(node, function(node) {
	          this.removeChild(node);
	        });
	      }
	    });
	  };
	  
	  fn.on = function(type, fn, bubble) {
	    if( typeof type !== 'string' ) return this;
	    type = type.split(' ');
	    
	    var self = this;
	    type.forEach(function(type) {
	      self.each(function() {
	        this.addEventListener(type, fn, bubble || false);
	      });
	    });
	    
	    return this;
	  };
	  
	  fn.once = function(type, fn, bubble) {
	    if( typeof type !== 'string' ) return this;
	    type = type.split(' ');
	    
	    var self = this;
	    type.forEach(function(type) {
	      self.each(function() {
	        var el = this;
	        var listener = function() {
	          el.removeEventListener(type, listener, bubble || false);
	          fn.apply(this, arguments);
	        };
	        el.addEventListener(type, listener, bubble || false);
	      });
	    });
	    
	    return this;
	  };
	  
	  fn.off = function(type, fn, bubble) {
	    if( typeof type !== 'string' ) return this;
	    type = type.split(' ');
	    
	    var self = this;
	    type.forEach(function(type) {
	      self.each(function() {
	       this.removeEventListener(type, fn, bubble || false);
	     });
	    });
	    
	    return this;
	  };
	  
	  fn.data = function(data) {
	    if( !arguments.length ) return this[0]._data;
	    
	    return this.each(function() {
	      this._data = data;
	    });
	  };
	  
	  fn.invoke = function(fn) {
	    if( typeof fn !== 'function' ) return this;
	    return this.each(function(i) {
	      fn(this._data, i);
	    });
	  };
	  
	  fn.is = function(selector) {
	    return matches(this[0], selector);
	  };
	  
	  fn.parent = function(selector) {
	    var arr = this.$();
	    this.each(function() {
	      if( !selector ) return arr.push(this.parentNode);
	      
	      var p = this;
	      do {
	        if( matches(p, selector) ) {
	          arr.push(p);
	          break;
	        }
	      } while(p = p.parentNode)
	    });
	    return arr;
	  };
	  
	  fn.children = function(selector) {
	    var arr = this.$();
	    this.each(function() {
	      var children = this.children;
	      if( selector ) {
	        [].forEach.call(children, function(el) {
	          matches(el, selector) && arr.push(el);
	        });
	      }
	      arr.add(children);
	    });
	    return arr;
	  };
	  
	  fn.filter = function(fn) {
	    if( typeof fn == 'string' ) {
	      var selector = fn;
	      fn = function() {
	        return matches(this, selector);
	      };
	    }
	    
	    if( isArrayLike(fn) ) {
	      var arr = [].slice.call(fn);
	      fn = function() {
	        return ~arr.indexOf(this);
	      };
	    }
	    
	    if( typeof fn != 'function' ) return this;
	    
	    var arr = this.$();
	    this.each(function() {
	      fn.apply(this, arguments) && arr.push(this);
	    });
	    return arr;
	  };
	  
	  fn.contains = function(selector) {
	    if( !selector ) return false;
	    
	    var contains = false;
	    this.each(function() {
	      if( typeof selector == 'string' && this.querySelector && this.querySelector(selector) ) {
	        contains = true;
	      } else if( this.contains(selector) ) {
	        selector = true;
	      }
	      
	      if( contains ) return true;
	    });
	    return !!contains;
	  };
	  
	  fn.nodes = function() {
	    var arr = this.$();
	    this.each(function() {
	      arr.add(this.childNodes);
	    });
	    return arr;
	  };
	};

/***/ },
/* 11 */
/***/ function(module, exports) {

	var types = {};
	
	module.exports = {
	  get: function(id) {
	    return types[id];
	  },
	  define: function(id, handler) {
	    if( !id ) throw new TypeError('missing id');
	    if( typeof id !== 'string' ) throw new TypeError('id must be a string');
	    if( typeof handler !== 'function' ) throw new TypeError('type plugin must be a function');
	    
	    types[id] = handler;
	    return this;
	  },
	  exists: function(id) {
	    return !!types[id];
	  }
	};

/***/ },
/* 12 */
/***/ function(module, exports) {

	var endpoint;
	
	module.exports = {
	  endpoint: function(url) {
	    endpoint = url;
	  },
	  load: function(url, done) {
	    done();
	  }
	}

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var getPosition = __webpack_require__(14);
	
	__webpack_require__(15);
	
	function clone(o) {
	  var result = {};
	  for(var k in o) result[k] = o[k];
	  return result; 
	}
	
	function Toolbar(owner, options) {
	  if( !owner || typeof owner.dom !== 'function' ) throw new TypeError('illegal owner(owner.dom() requried)');
	  options = clone(options);
	  
	  var toolbar = document.createElement('div');
	  var buttonul = document.createElement('ul');
	  buttonul.className = 'ff-toolbar-actions';
	  toolbar.appendChild(buttonul);
	  
	  var btns = [], visible = false, always = false;
	  
	  var instance = {
	    options: function(o) {
	      if( !arguments.length ) return options;
	      options = clone(options || o);
	      return this;
	    },
	    position: function(position) {
	      options.position = position;
	      instance.update();
	      return this;
	    },
	    element: function() {
	      return toolbar;
	    },
	    owner: function() {
	      return owner;
	    },
	    update: function() {
	      if( !btns.length ) return;
	      if( !visible ) {
	        if( !always ) toolbar.style.display = 'none';
	        return;
	      }
	      
	      buttonul.innerHTML = '';
	      btns.forEach(function(btn) {
	        if( !btn ) return;
	        
	        var li = btn.el = btn.el || document.createElement('li');
	        var scope = {
	          toolbar: function() {
	            return instance;
	          },
	          owner: function() {
	            return owner;
	          },
	          text: function(text) {
	            if( !arguments.length ) return btn.text;
	            btn.text = text || '';
	            btn.el.innerHTML = '<a>' + btn.text + '</a>';
	            return this;
	          }
	        };
	        
	        if( btn.separator ) {
	          li.className = (btn.cls || '') + ' ff-separator';
	        } else {
	          li.className = (btn.cls || '') + ' ff-toolbar-btn';
	          li.innerHTML = '<a>' + (btn.text || '') + '</a>';
	          li.onclick = function(e) {
	            e.stopImmediatePropagation();
	            if( typeof btn.fn === 'function' ) btn.fn.call(scope, e);
	            instance.update();
	          };
	        }
	        
	        if( typeof btn.show === 'function' ) {
	          if( btn.show.call(scope) ) buttonul.appendChild(li);
	        } else {
	          buttonul.appendChild(li);
	        }
	      });
	      
	      toolbar.className = 'ff-toolbar';
	      toolbar.style.position = options.fixed ? 'fixed' : 'absolute';
	      toolbar.style.display = '';
	      toolbar.style.zIndex = options.zIndex || 110;
	      toolbar.style.transition = 'all .25s';
	      if( options.cls ) toolbar.className += ' ' + options.cls;
	      if( options.style ) toolbar.setAttribute('style', options.style);
	      
	      document.body && document.body.appendChild(toolbar);
	      
	      instance.updatePosition();
	      
	      return this;
	    },
	    updatePosition: function() {
	      var ownerElement = owner.dom();
	      if( options.position && ownerElement ) {
	        var ownerposition = getPosition(ownerElement);
	        var position = options.position || 'top center outside';
	        var posarr = position.split(' ');
	        var inside = ~posarr.indexOf('inside');
	        var vertical = ~posarr.indexOf('vertical');
	        var nomargin = ~posarr.indexOf('nomargin');
	        if( vertical ) toolbar.className += ' ff-toolbar-vertical';
	        
	        var width = ownerElement.clientWidth;
	        var height = ownerElement.clientHeight;
	        var tbarwidth = toolbar.clientWidth;
	        var tbarheight = toolbar.clientHeight;
	        var top = 0, left = 0, margin = nomargin ? 0 : (+options.margin || 10);
	        
	        posarr.forEach(function(pos) {
	          if( !vertical ) {
	            if( pos === 'top' ) {
	              if( inside ) top = ownerposition.top + margin;
	              else top = ownerposition.top - tbarheight - margin;
	            } else if( pos == 'bottom' ) {
	              if( inside ) top = ownerposition.top + height - tbarheight - margin;
	              else top = ownerposition.top + height + margin;
	            } else if( pos == 'left' ) {
	              left = ownerposition.left;
	              if( inside ) left += margin;
	            } else if( pos == 'center' ) {
	              left = ownerposition.left + (width - tbarwidth) / 2;
	            } else if( pos == 'right' ) {
	              left = ownerposition.left + width - tbarwidth;
	              if( inside ) left -= margin;
	            }
	          } else {
	            if( pos === 'top' ) {
	              top = ownerposition.top;
	              if( inside ) top += margin;
	            } else if( pos == 'middle' ) {
	              top = ownerposition.top + (height - tbarheight) / 2;
	            } else if( pos == 'bottom' ) {
	              top = ownerposition.top + height - tbarheight;
	              if( inside ) top -= margin;
	            } else if( pos == 'left' ) {
	              if( inside ) left = ownerposition.left + margin;
	              else left = ownerposition.left - tbarwidth - margin;
	            } else if( pos == 'right' ) {
	              if( inside ) left = ownerposition.left + width - tbarwidth - margin;
	              else left = ownerposition.left + width + margin;
	            }
	          }
	        });
	        
	        if( top <= 5 ) top = 5;
	        if( left <= 5 ) left = 5;
	        
	        if( vertical ) {
	          //if( window.scrollY + 100 > ownerElement.offsetTop ) top = window.scrollY + 100;
	          if( top > ownerElement.offsetTop + height - tbarheight ) top = ownerElement.offsetTop + height - tbarheight;
	        }
	        
	        toolbar.style.top = top + 'px';
	        toolbar.style.left = left + 'px';
	      }
	      
	      if( +options.top >= 0 ) toolbar.style.top = options.top + 'px';
	      if( +options.bottom >= 0 ) toolbar.style.bottom = options.bottom + 'px';
	      if( +options.left >= 0 ) toolbar.style.left = options.left + 'px';
	      if( +options.right >= 0 ) toolbar.style.right = options.right + 'px';
	    },
	    show: function() {
	      if( !btns.length ) return this;
	      visible = true;
	      instance.update();
	      return this;
	    },
	    hide: function() {
	      if( !btns.length ) return this;
	      visible = false;
	      instance.update();
	      return this;
	    },
	    refresh: function() {
	      instance.update();
	      return this;
	    },
	    always: function(b) {
	      if( b === false ) {
	        always = false;
	        instance.update();
	        return this;
	      }
	      always = true;
	      this.show();
	      return this;
	    },
	    clear: function() {
	      btns = [];
	      instance.update();
	      return this;
	    },
	    buttons: function(arr) {
	      if( !Array.isArray(arr) ) throw new TypeError('Argument buttons must be an array');
	      btns = arr.slice();
	      instance.update();
	      return this;
	    },
	    first: function(btn) {
	      return instance.add(btn, 0);
	    },
	    add: function(btn, index) {
	      if( !btn ) return this;
	      if( !Array.isArray(btn) ) btn = [btn];
	      
	      btn.forEach(function(btn) {
	        if( ~btns.indexOf(btn) ) btns.splice(btns.indexOf(btn), 1);
	        
	        if( index >= 0 ) {
	          btns.splice(index++, 0, btn);
	        } else btns.push(btn);
	      });
	      
	      instance.update();
	      return this;
	    },
	    remove: function(btn) {
	      if( !btn ) return this;
	      if( !Array.isArray(btn) ) btn = [btn];
	      
	      btn.forEach(function(btn) {
	        if( ~btns.indexOf(btn) ) btns.splice(btns.indexOf(btn), 1);
	      });
	      
	      instance.update();
	      return this;
	    },
	    destroy: function() {
	      if( buttonul && buttonul.parentNode ) buttonul.parentNode.removeChild(buttonul);
	      if( toolbar && toolbar.parentNode ) toolbar.parentNode.removeChild(toolbar);
	      window.removeEventListener('scroll', instance.updatePosition);
	      window.removeEventListener('resize', instance.updatePosition);
	      btns = null, visible = null, toolbar = null, buttonul = null;
	      options = null, owner = null;
	      return this;
	    }
	  };
	  
	  window.addEventListener('scroll', instance.updatePosition);
	  window.addEventListener('resize', instance.updatePosition);
	  
	  return instance;
	}
	
	
	module.exports = Toolbar;


/***/ },
/* 14 */
/***/ function(module, exports) {

	module.exports = function(el) {
	  var top = 0;
	  var left = 0;
	  
	  var c = el;
	  do {
	    if ( +c.offsetTop ) top += c.offsetTop;
	    if ( +c.offsetLeft ) left += c.offsetLeft;
	  } while( c = c.offsetParent );
	  
	  return {
	    top: top,
	    left: left,
	    width: el.offsetWidth,
	    height: el.offsetHeight
	  };
	};

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(16);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(18)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/less-loader/index.js!./toolbar.less", function() {
				var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/less-loader/index.js!./toolbar.less");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(17)();
	// imports
	
	
	// module
	exports.push([module.id, ".ff-toolbar {\n  border: none;\n  border-radius: 4px;\n  background-color: rgba(0, 0, 0, 0.85);\n  box-sizing: border-box;\n  user-select: none;\n}\n.ff-toolbar ul {\n  display: block;\n  margin: 0;\n  padding: 0;\n}\n.ff-toolbar ul:after {\n  clear: both;\n  content: \"\";\n  display: table;\n}\n.ff-toolbar ul li {\n  float: left;\n  list-style: none;\n  margin: 0;\n  padding: 0;\n  -moz-user-select: none;\n  -khtml-user-select: none;\n  -webkit-user-select: none;\n  user-select: none;\n}\n.ff-toolbar ul li a:hover,\n.ff-toolbar ul li a:active,\n.ff-toolbar ul li a:focus {\n  text-decoration: none;\n}\n.ff-toolbar ul li a {\n  display: block;\n  cursor: pointer;\n  font-size: 1em;\n  line-height: 1em;\n  background-color: transparent;\n  color: #fff;\n  padding: 12px 12px;\n  text-decoration: none;\n}\n.ff-toolbar ul li a:hover {\n  color: #2796DD;\n}\n.ff-toolbar ul li.active a {\n  color: #2796DD;\n}\n.ff-toolbar ul li:first-child {\n  padding-left: 0;\n}\n.ff-toolbar ul li:last-child {\n  padding-right: 0;\n}\n.ff-toolbar.ff-toolbar-vertical ul li {\n  float: initial;\n}\n.ff-toolbar.ff-toolbar-vertical ul li:first-child {\n  padding-top: 0;\n  padding-left: 0;\n}\n.ff-toolbar.ff-toolbar-vertical ul li:last-child {\n  padding-bottom: 0;\n  padding-right: 0;\n}\n", ""]);
	
	// exports


/***/ },
/* 17 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];
	
		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};
	
		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(self.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];
	
	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}
	
		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();
	
		// By default, add <style> tags to the bottom of <head>.
		if (typeof options.insertAt === "undefined") options.insertAt = "bottom";
	
		var styles = listToStyles(list);
		addStylesToDom(styles, options);
	
		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}
	
	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}
	
	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}
	
	function insertStyleElement(options, styleElement) {
		var head = getHeadElement();
		var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
		if (options.insertAt === "top") {
			if(!lastStyleElementInsertedAtTop) {
				head.insertBefore(styleElement, head.firstChild);
			} else if(lastStyleElementInsertedAtTop.nextSibling) {
				head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				head.appendChild(styleElement);
			}
			styleElementsInsertedAtTop.push(styleElement);
		} else if (options.insertAt === "bottom") {
			head.appendChild(styleElement);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}
	
	function removeStyleElement(styleElement) {
		styleElement.parentNode.removeChild(styleElement);
		var idx = styleElementsInsertedAtTop.indexOf(styleElement);
		if(idx >= 0) {
			styleElementsInsertedAtTop.splice(idx, 1);
		}
	}
	
	function createStyleElement(options) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		insertStyleElement(options, styleElement);
		return styleElement;
	}
	
	function createLinkElement(options) {
		var linkElement = document.createElement("link");
		linkElement.rel = "stylesheet";
		insertStyleElement(options, linkElement);
		return linkElement;
	}
	
	function addStyle(obj, options) {
		var styleElement, update, remove;
	
		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement(options));
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement(options);
			update = updateLink.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement(options);
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
			};
		}
	
		update(obj);
	
		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}
	
	var replaceText = (function () {
		var textStore = [];
	
		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();
	
	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;
	
		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}
	
	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;
	
		if(media) {
			styleElement.setAttribute("media", media)
		}
	
		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}
	
	function updateLink(linkElement, obj) {
		var css = obj.css;
		var sourceMap = obj.sourceMap;
	
		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}
	
		var blob = new Blob([css], { type: "text/css" });
	
		var oldSrc = linkElement.href;
	
		linkElement.href = URL.createObjectURL(blob);
	
		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(20);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(18)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/less-loader/index.js!./index.less", function() {
				var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/less-loader/index.js!./index.less");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(17)();
	// imports
	
	
	// module
	exports.push([module.id, ".ff {\n  box-sizing: border-box;\n}\n.ff-part[draggable] {\n  -moz-user-select: none;\n  -khtml-user-select: none;\n  -webkit-user-select: none;\n  user-select: none;\n  -khtml-user-drag: element;\n  -webkit-user-drag: element;\n}\n.ff-part.ff-focus-state {\n  background-color: #eee;\n}\n", ""]);
	
	// exports


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	var context = __webpack_require__(1);
	var Events = __webpack_require__(6);
	var Types = __webpack_require__(11);
	var Toolbar = __webpack_require__(13);
	var $ = __webpack_require__(7);
	
	//var Highlighter = require('./highlighter.js');
	//var MouseObserver = require('./mouseobserver.js');
	
	var focused, currentRange;
	$(document).on('mouseup', function(e) {
	  currentRange = context.getRange();
	  
	  var part = context.getPart(e.target);
	  var isToolbar = $(e.target).parent('.ff-toolbar')[0];
	  if( isToolbar ) {
	    e.preventDefault();
	    e.stopPropagation();
	    
	    setTimeout(function() {
	      context.setRange(currentRange);
	    }, 0);
	    return;
	  }
	  
	  if( part ) part.focus();
	  else if( focused && typeof focused.blur == 'function' ) {
	    focused.blur();
	  }
	});
	
	function Part(el) {
	  if( !el ) el = this.create();
	  if( !context.isElement(el) ) el = this.create(el);
	  if( !context.isElement(el) ) throw new TypeError('illegal argument: el');
	  if( el.__ff__ ) return el.__ff__;
	  el.__ff__ = this;
	  
	  $(el).addClass('ff ff-part');
	  
	  var dispatcher = Events(this);
	  //var highlighter = Highlighter(el);
	  var self = this;
	  
	  var toolbar = new Toolbar(this, {
	    position: 'top center',
	    group: 'part',
	    cls: 'ff-part-toolbar'
	  }).add({
	    text: '<i class="fa fa-undo"></i>',
	    fn: function(e) {
	      self.clear();
	    }
	  }).add({
	    text: '<i class="fa fa-remove"></i>',
	    fn: function(e) {
	      self.remove();
	    }
	  });
	  
	  dispatcher.on('mouseenter', function(e) {
	    if( !this.editmode() ) return;
	    
	    $(el).ac('ff-enter-state');
	  })
	  .on('mousedown', function(e) {
	    if( !this.editmode() ) return;
	    
	    this.toolbar().update();
	  })
	  .on('mousemove', function(e) {
	    if( !this.editmode() ) return;
	    
	    this.toolbar().update();
	  })
	  .on('mouseleave', function(e) {
	    if( !this.editmode() ) return;
	    
	    $(el).removeClass('ff-enter-state');
	  })
	  .on('focus', function(e) {
	    if( !this.editmode() ) return;
	    
	    $(el).ac('ff-focus-state');
	    this.toolbar().show();
	  })
	  .on('blur', function(e) {
	    if( !this.editmode() ) return;
	    
	    $(el).rc('ff-focus-state');
	    this.toolbar().hide();
	  })
	  .on('update', function(e) {
	    dispatcher.fire('render', {
	      type: 'update',
	      originalEvent: e
	    });
	  })
	  .on('modechange', function(e) {
	    dispatcher.fire('render', {
	      type: 'modechange',
	      originalEvent: e
	    });
	  })
	  .on('dragstart', function(e) {
	    if( !this.editmode() ) return;
	    
	    if( e.target === el ) {
	      this.blur();
	      context.dragging = this;
	      $(el).ac('ff-dragging');
	    }
	  })
	  .on('dragend', function(e) {
	    if( e.target === el ) {
	      context.dragging = null;
	      $(el).rc('ff-dragging');
	    }
	  })
	  .on('*', function(e) {
	    var type = e.type;
	    var name = 'on' + type;
	    
	    if( typeof this.handleEvent == 'function' ) this.handleEvent(e);
	    if( typeof this[name] == 'function' ) this[name](e);
	  });
	  
	  $(el)
	  .on('click mouseup mousedown mouseenter mouseleave mousemove dragstart dragend', dispatcher);
	  
	  this._data = null;
	  this._dom = el;
	  this._dispatcher = dispatcher;
	  this._toolbar = toolbar;
	  //this._highlighter = highlighter;
	  
	  dispatcher.fire('init');
	  
	  var observer;
	  setTimeout(function() {
	    observer = new MutationObserver(function(mutations) {
	      mutations.forEach(function(mutation) {
	        if( mutation.type == 'attributes' && self.attributeChangedCallback ) {
	          self.attributeChangedCallback(mutation.attributeName, mutation.oldValue, el.getAttribute(mutation.attributeName));
	        }
	      });
	    });
	    
	    observer.observe(el, {
	      attributes: true,
	      attributeOldValue: true
	    });
	  }, 1);
	  
	  setTimeout(function() {
	    if( context.editmode() ) self.editmode(true);
	  }, 0);
	}
	
	var proto = Part.prototype = {}; //Object.create(HTMLDivElement.prototype);
	
	proto.attributeChangedCallback = function(name, old, value) {};
	proto.connectedCallback = function() {};
	proto.disconnectedCallback = function() {};
	proto.adoptedCallback = function(olddoc, newdoc) {};
	
	proto.context = function() {
	  return context;
	};
	
	proto.toolbar = function() {
	  return this._toolbar;
	};
	
	/*proto.highlighter = function() {
	  return this._highlighter;
	};*/
	
	proto.dom = function() {
	  return this._dom;
	};
	
	proto.create = function(arg) {
	  var el = document.createElement('div');
	  
	  if( typeof arg === 'string' ) {
	    el.innerHTML = arg;
	  }
	  
	  return el;
	};
	
	proto.remove = function() {
	  this.blur();
	  this.toolbar().hide();
	  this.fire('remove');
	  $(this.dom()).remove();
	  return this;
	};
	
	proto.editmode = function(b) {
	  if( !arguments.length ) return !!this._editmode;
	  var prev = this._editmode;
	  var editmode = this._editmode = !!b;
	  
	  if( editmode !== prev ) this.fire('modechange', {editmode: editmode});
	  return this;
	};
	
	proto.getData = function() {
	  return this._data;
	};
	
	proto.setData = function(data) {
	  return this;
	};
	
	proto.data = function(data) {
	  if( !arguments.length ) return this.getData();
	  if( this._data !== data ) this.fire('update', {prev: this._data, data: data});
	  this._data = data;
	  this.setData(data);
	  return this;
	};
	
	proto.fire = function() {
	  this._dispatcher.fire.apply(this._dispatcher, arguments);
	  return this;
	};
	
	proto.on = function(type, fn) {
	  this._dispatcher.on(type, fn);
	  return this;
	};
	
	proto.once = function(type, fn) {
	  this._dispatcher.once(type, fn);
	  return this;
	};
	
	proto.off = function(type, fn) {
	  this._dispatcher.off(type, fn);
	  return this;
	};
	
	proto.clear = function() {
	  this.setData(null);
	  this.fire('clear');
	  return this;
	};
	
	proto.focus = function() {
	  if( this !== focused ) {
	    if( focused && typeof focused.blur == 'function' ) focused.blur();
	    this.fire('focus');
	    focused = this;
	  }
	  return this;
	};
	
	proto.blur = function() {
	  if( this === focused ) {
	    this.fire('blur');
	    focused = null;
	  }
	  return this;
	};
	
	proto.range = function() {
	  var el = this.dom();
	  var range = currentRange;
	  if( range && el.contains(range.startContainer) && el.contains(range.endContainer) ) return range;
	  
	  return null;
	};
	
	Part.getFocused = function() {
	  return focused;
	};
	
	Part.getCurrentRange = function() {
	  return currentRange;
	};
	
	  
	/*
	destroy: function() {
	  this.clear();
	  this.fire('destroy');
	  this.mouseobserver().disconnect();
	  this.toolbar().destroy();
	  this.highlighter().destroy();
	  this._dispatcher.destroy();
	  return this;
	},
	markRange: function() {
	  var el = this.dom();
	  var range = Part.getRange();
	  if( range && el.contains(range.startContainer) && el.contains(range.endContainer) ) {
	    this._range = range;
	  } else {
	    this._range = null;
	  }
	  return this;
	},
	editor: function(editor) {
	  if( !arguments.length ) return this._editor;
	  if( !editor ) {
	    this._editor = null;
	    return this;
	  }
	  
	  this._editor = editor;
	  this.editmode(editor.editmode());
	  
	  return this;
	},
	*/
	
	module.exports = Part;

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var modal = __webpack_require__(23);
	var $ = __webpack_require__(7);
	var Part = __webpack_require__(21);
	
	function anchorPrevent(e) {
	  e.preventDefault();
	  e.stopPropagation();
	}
	
	function TextPart(el) {
	  Part.call(this, el);
	  
	  var prevented = [];
	  
	  this.highlighter().enable(false);
	  
	  this.toolbar().first({
	    text: '<i class="fa fa-gear"></i>',
	    fn: function(e) {
	      this.owner().config();
	    }
	  });
	};
	
	
	TextPart.prototype = Object.create(Part.prototype, {
	  oninit: {
	    value: function(e) {
	      var el = this.dom();
	      this._defaults = {
	        style: el.getAttribute('style'),
	        cls: el.className,
	        html: el.innerHTML
	      };
	    }
	  },
	  onmodechange: {
	    value: function(e) {
	      var el = this.dom();
	      
	      if( this.editmode() ) {
	        el.setAttribute('contenteditable', 'true');
	        $(el).find('[href]').on('click', anchorPrevent);
	      } else {
	        el.removeAttribute('contenteditable');
	        $(el).find('[href]').off('click', anchorPrevent);
	      }
	    }
	  },
	  setData: {
	    value: function(data) {
	      if( data && data.html ) this.dom().innerHTML = data.html;
	      return this;
	    }
	  },
	  getData: {
	    value: function() {
	      return {
	        html:this.dom().innerHTML
	      };
	    }
	  },
	  defaults: {
	    value: function() {
	      if( !arguments.length ) return this._defaults;
	    }
	  },
	  restoreDefaults: {
	    value: function() {
	      var defaults = this._defaults;
	      var el = this.dom();
	      if( defaults ) {
	        if( defaults.style ) el.setAttribute('style', defaults.style);
	        else el.removeAttribute('style');
	        
	        if( defaults.cls ) el.setAttribute('class', defaults.cls);
	        else el.removeAttribute('class');
	        
	        el.innerHTML = defaults.html || '';
	      }
	      return this;
	    }
	  },
	  config: {
	    value: function() {
	      var part = this;
	      var el = this.dom();
	      
	      modal.open(__webpack_require__(40), function(err, modal) {
	        if( err ) return console.error(err);
	        
	        var data = part.data();
	        var form = modal.body.querySelector('form');
	        if( data && data.style ) form.style.value = data && data.style;
	        if( data && data.cls ) form.cls.value = data && data.cls;
	        form.html.value = el.innerHTML || '';
	        
	        form.onsubmit = function(e) {
	          e.preventDefault();
	          
	          data = data || {};
	          if( form.style.value ) data.style = form.style.value;
	          else delete data.style;
	          
	          if( form.cls.value ) data.cls = form.cls.value;
	          else delete data.cls;
	          
	          if( form.html.value ) data.html = form.html.value;
	          else delete data.html;
	          
	          part.data(data);
	          modal.close();
	        };
	      });
	      
	      return this;
	    }
	  }
	});
	
	
	module.exports = TextPart;

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var swal = __webpack_require__(24);
	var modal = __webpack_require__(33);
	
	__webpack_require__(38);
	
	module.exports = {
	  popup: function(options) {
	    if( !options ) return console.error('missing options');
	    if( !options.url ) return console.error('missing url');
	    
	    var width = options.width;
	    var height = options.height;
	    if( width > window.screen.width ) width = window.screen.width;
	    if( height > window.screen.height ) height = window.screen.height;
	    
	    var top = options.top || height ? (window.screen.height / 2) - (height / 2) : 0;
	    var left = options.left || width ? (window.screen.width / 2) - (width / 2) : 0;
	    if( !top || top < 0 ) top = 0;
	    if( !left || left < 0 ) left = 0;
	    
	    var url = options.url;
	    var scrollbar = options.scrollbar === false ? 'no' : 'yes';
	    var resizable = options.resizable === false ? 'no' : 'yes';
	    var channelmode = options.channelmode === false ? 'no' : 'yes';
	    var name = options.name || Math.random() + '';
	    
	    window.open(url, name, 'channelmode=' + channelmode + ',resizable=' + resizable + ',scrollbars=' + scrollbar + ',width=' + width + ',height=' + height + ',left=' + left + ',top=' + top);
	    
	    return this;
	  },
	  required: function(msg, el) {
	    alert(msg);
	    if( typeof el === 'string' ) el = $(el);
	    if( el && el.focus ) el.focus();
	    
	    return this;
	  },
	  alert: function(options, done) {
	    if( typeof options === 'string' ) options = {message:options};
	    if( typeof done === 'string' ) options.title = done, done = arguments[2];
	    
	    swal({
	      title: options.title || '알림',
	      text: options.message || options.text,
	      type: options.type,
	      animation: options.animation,
	      timer: options.timer,
	      showConfirmButton: options.showConfirmButton || options.timer ? false : true,
	      imageUrl: options.imageUrl,
	      html: true
	    }, function() {
	      if( typeof done === 'function' ) done.apply(this, arguments);
	    });
	    
	    return this;
	  },
	  prompt: function(options, done) {
	    if( typeof options === 'string' ) options = {title:options};
	    if( typeof done === 'string' ) options.message = done, done = arguments[2];
	    
	    swal({
	      title: options.title,
	      text: options.message || options.text,
	      inputPlaceholder: options.inputPlaceholder || options.placeholder,
	      type: 'input',
	      confirmButtonColor: options.yescolor || "#DD6B55",
	      confirmButtonText: options.yes || "네",
	      cancelButtonText: options.no || "아니요",
	      showCancelButton: true,
	      closeOnConfirm: options.closeOnConfirm || false
	    }, function() {
	      if( typeof done === 'function' ) done.apply(this, arguments);
	    });
	    
	    return this;
	  },
	  confirm: function(options, done) {
	    if( typeof options === 'string' ) options = {title:options};
	    if( typeof done === 'string' ) options.message = done, done = arguments[2];
	    
	    swal({
	      title: options.title,
	      text: options.message || options.text,
	      type: options.type,
	      confirmButtonColor: options.yescolor || "#DD6B55",
	      confirmButtonText: options.yes || "네",
	      cancelButtonText: options.no || "아니요",
	      showCancelButton: true,
	      closeOnConfirm: options.closeOnConfirm || false
	    }, function() {
	      if( typeof done === 'function' ) done.apply(this, arguments);
	    });
	    
	    return this;
	  },
	  error: function(title, err, done) {
	    if( arguments.length <= 2 ) done = err;
	    if( title instanceof Error ) err = title, title = null;
	    
	    var html;
	    if( err ) {
	      var text = (err.message || err || '').split('\n').join('<br>');
	      html = '<div style="color: #474747;line-height: 25px;min-height: 80px;overflow: auto;font-size: 18px;padding: 20px;text-align: center;border: 1px solid #ccc;background: #eee;">' + text + '</div>';
	    }
	    
	    swal({
	      title: title || '오류',
	      text: html,
	      html: true,
	      type: 'error'
	    }, function() {
	      if( typeof done === 'function' ) done.apply(this, arguments);
	    });
	    
	    return this;
	  },
	  warning: function(title, err, done) {
	    if( arguments.length <= 2 ) done = err;
	    if( title instanceof Error ) err = title, title = null;
	    
	    var html;
	    if( err ) {
	      var text = (err.stack || err.serverStack || err.message || err || '').split('\n').join('<br>');
	      html = '<div style="color: #474747;line-height: 25px;min-height: 80px;overflow: auto;font-size: 18px;padding: 20px;text-align: center;border: 1px solid #ccc;background: #eee;">' + text + '</div>';
	    }
	    
	    swal({
	      title: title || '경고',
	      text: html,
	      html: true,
	      type: 'warning'
	    }, function() {
	      if( typeof done === 'function' ) done.apply(this, arguments);
	    });
	    
	    return this;
	  },
	  success: function(msg, done) {
	    swal({
	      title: '성공',
	      text: msg,
	      type: 'success'
	    }, function() {
	      if( typeof done === 'function' ) done.apply(this, arguments);
	    });
	    
	    return this;
	  },
	  open: function(options, done) {
	    modal.open.apply(modal, arguments);
	    return this;
	  },
	  current: function() {
	    return modal.current.apply(modal, arguments);
	  },
	  ids: function() {
	    return modal.ids.apply(modal, arguments);
	  },
	  get: function(id) {
	    return modal.get.apply(modal, arguments);
	  },
	  close: function(id) {
	    modal.close.apply(modal, arguments);
	    return this;
	  },
	  closeAll: function() {
	    modal.closeAll.apply(modal, arguments);
	    return this;
	  }
	};

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	// SweetAlert
	// 2014-2015 (c) - Tristan Edwards
	// github.com/t4t5/sweetalert
	
	/*
	 * jQuery-like functions for manipulating the DOM
	 */
	
	var _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation = __webpack_require__(25);
	
	/*
	 * Handy utilities
	 */
	
	var _extend$hexToRgb$isIE8$logStr$colorLuminance = __webpack_require__(26);
	
	/*
	 *  Handle sweetAlert's DOM elements
	 */
	
	var _sweetAlertInitialize$getModal$getOverlay$getInput$setFocusStyle$openModal$resetInput$fixVerticalPosition = __webpack_require__(27);
	
	// Handle button events and keyboard events
	
	var _handleButton$handleConfirm$handleCancel = __webpack_require__(30);
	
	var _handleKeyDown = __webpack_require__(31);
	
	var _handleKeyDown2 = _interopRequireWildcard(_handleKeyDown);
	
	// Default values
	
	var _defaultParams = __webpack_require__(28);
	
	var _defaultParams2 = _interopRequireWildcard(_defaultParams);
	
	var _setParameters = __webpack_require__(32);
	
	var _setParameters2 = _interopRequireWildcard(_setParameters);
	
	/*
	 * Remember state in cases where opening and handling a modal will fiddle with it.
	 * (We also use window.previousActiveElement as a global variable)
	 */
	var previousWindowKeyDown;
	var lastFocusedButton;
	
	/*
	 * Global sweetAlert function
	 * (this is what the user calls)
	 */
	var sweetAlert, swal;
	
	exports['default'] = sweetAlert = swal = function () {
	  var customizations = arguments[0];
	
	  _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.addClass(document.body, 'stop-scrolling');
	  _sweetAlertInitialize$getModal$getOverlay$getInput$setFocusStyle$openModal$resetInput$fixVerticalPosition.resetInput();
	
	  /*
	   * Use argument if defined or default value from params object otherwise.
	   * Supports the case where a default value is boolean true and should be
	   * overridden by a corresponding explicit argument which is boolean false.
	   */
	  function argumentOrDefault(key) {
	    var args = customizations;
	    return args[key] === undefined ? _defaultParams2['default'][key] : args[key];
	  }
	
	  if (customizations === undefined) {
	    _extend$hexToRgb$isIE8$logStr$colorLuminance.logStr('SweetAlert expects at least 1 attribute!');
	    return false;
	  }
	
	  var params = _extend$hexToRgb$isIE8$logStr$colorLuminance.extend({}, _defaultParams2['default']);
	
	  switch (typeof customizations) {
	
	    // Ex: swal("Hello", "Just testing", "info");
	    case 'string':
	      params.title = customizations;
	      params.text = arguments[1] || '';
	      params.type = arguments[2] || '';
	      break;
	
	    // Ex: swal({ title:"Hello", text: "Just testing", type: "info" });
	    case 'object':
	      if (customizations.title === undefined) {
	        _extend$hexToRgb$isIE8$logStr$colorLuminance.logStr('Missing "title" argument!');
	        return false;
	      }
	
	      params.title = customizations.title;
	
	      for (var customName in _defaultParams2['default']) {
	        params[customName] = argumentOrDefault(customName);
	      }
	
	      // Show "Confirm" instead of "OK" if cancel button is visible
	      params.confirmButtonText = params.showCancelButton ? 'Confirm' : _defaultParams2['default'].confirmButtonText;
	      params.confirmButtonText = argumentOrDefault('confirmButtonText');
	
	      // Callback function when clicking on "OK"/"Cancel"
	      params.doneFunction = arguments[1] || null;
	
	      break;
	
	    default:
	      _extend$hexToRgb$isIE8$logStr$colorLuminance.logStr('Unexpected type of argument! Expected "string" or "object", got ' + typeof customizations);
	      return false;
	
	  }
	
	  _setParameters2['default'](params);
	  _sweetAlertInitialize$getModal$getOverlay$getInput$setFocusStyle$openModal$resetInput$fixVerticalPosition.fixVerticalPosition();
	  _sweetAlertInitialize$getModal$getOverlay$getInput$setFocusStyle$openModal$resetInput$fixVerticalPosition.openModal(arguments[1]);
	
	  // Modal interactions
	  var modal = _sweetAlertInitialize$getModal$getOverlay$getInput$setFocusStyle$openModal$resetInput$fixVerticalPosition.getModal();
	
	  /*
	   * Make sure all modal buttons respond to all events
	   */
	  var $buttons = modal.querySelectorAll('button');
	  var buttonEvents = ['onclick', 'onmouseover', 'onmouseout', 'onmousedown', 'onmouseup', 'onfocus'];
	  var onButtonEvent = function onButtonEvent(e) {
	    return _handleButton$handleConfirm$handleCancel.handleButton(e, params, modal);
	  };
	
	  for (var btnIndex = 0; btnIndex < $buttons.length; btnIndex++) {
	    for (var evtIndex = 0; evtIndex < buttonEvents.length; evtIndex++) {
	      var btnEvt = buttonEvents[evtIndex];
	      $buttons[btnIndex][btnEvt] = onButtonEvent;
	    }
	  }
	
	  // Clicking outside the modal dismisses it (if allowed by user)
	  _sweetAlertInitialize$getModal$getOverlay$getInput$setFocusStyle$openModal$resetInput$fixVerticalPosition.getOverlay().onclick = onButtonEvent;
	
	  previousWindowKeyDown = window.onkeydown;
	
	  var onKeyEvent = function onKeyEvent(e) {
	    return _handleKeyDown2['default'](e, params, modal);
	  };
	  window.onkeydown = onKeyEvent;
	
	  window.onfocus = function () {
	    // When the user has focused away and focused back from the whole window.
	    setTimeout(function () {
	      // Put in a timeout to jump out of the event sequence.
	      // Calling focus() in the event sequence confuses things.
	      if (lastFocusedButton !== undefined) {
	        lastFocusedButton.focus();
	        lastFocusedButton = undefined;
	      }
	    }, 0);
	  };
	
	  // Show alert with enabled buttons always
	  swal.enableButtons();
	};
	
	/*
	 * Set default params for each popup
	 * @param {Object} userParams
	 */
	sweetAlert.setDefaults = swal.setDefaults = function (userParams) {
	  if (!userParams) {
	    throw new Error('userParams is required');
	  }
	  if (typeof userParams !== 'object') {
	    throw new Error('userParams has to be a object');
	  }
	
	  _extend$hexToRgb$isIE8$logStr$colorLuminance.extend(_defaultParams2['default'], userParams);
	};
	
	/*
	 * Animation when closing modal
	 */
	sweetAlert.close = swal.close = function () {
	  var modal = _sweetAlertInitialize$getModal$getOverlay$getInput$setFocusStyle$openModal$resetInput$fixVerticalPosition.getModal();
	
	  _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.fadeOut(_sweetAlertInitialize$getModal$getOverlay$getInput$setFocusStyle$openModal$resetInput$fixVerticalPosition.getOverlay(), 5);
	  _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.fadeOut(modal, 5);
	  _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.removeClass(modal, 'showSweetAlert');
	  _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.addClass(modal, 'hideSweetAlert');
	  _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.removeClass(modal, 'visible');
	
	  /*
	   * Reset icon animations
	   */
	  var $successIcon = modal.querySelector('.sa-icon.sa-success');
	  _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.removeClass($successIcon, 'animate');
	  _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.removeClass($successIcon.querySelector('.sa-tip'), 'animateSuccessTip');
	  _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.removeClass($successIcon.querySelector('.sa-long'), 'animateSuccessLong');
	
	  var $errorIcon = modal.querySelector('.sa-icon.sa-error');
	  _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.removeClass($errorIcon, 'animateErrorIcon');
	  _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.removeClass($errorIcon.querySelector('.sa-x-mark'), 'animateXMark');
	
	  var $warningIcon = modal.querySelector('.sa-icon.sa-warning');
	  _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.removeClass($warningIcon, 'pulseWarning');
	  _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.removeClass($warningIcon.querySelector('.sa-body'), 'pulseWarningIns');
	  _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.removeClass($warningIcon.querySelector('.sa-dot'), 'pulseWarningIns');
	
	  // Reset custom class (delay so that UI changes aren't visible)
	  setTimeout(function () {
	    var customClass = modal.getAttribute('data-custom-class');
	    _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.removeClass(modal, customClass);
	  }, 300);
	
	  // Make page scrollable again
	  _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.removeClass(document.body, 'stop-scrolling');
	
	  // Reset the page to its previous state
	  window.onkeydown = previousWindowKeyDown;
	  if (window.previousActiveElement) {
	    window.previousActiveElement.focus();
	  }
	  lastFocusedButton = undefined;
	  clearTimeout(modal.timeout);
	
	  return true;
	};
	
	/*
	 * Validation of the input field is done by user
	 * If something is wrong => call showInputError with errorMessage
	 */
	sweetAlert.showInputError = swal.showInputError = function (errorMessage) {
	  var modal = _sweetAlertInitialize$getModal$getOverlay$getInput$setFocusStyle$openModal$resetInput$fixVerticalPosition.getModal();
	
	  var $errorIcon = modal.querySelector('.sa-input-error');
	  _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.addClass($errorIcon, 'show');
	
	  var $errorContainer = modal.querySelector('.sa-error-container');
	  _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.addClass($errorContainer, 'show');
	
	  $errorContainer.querySelector('p').innerHTML = errorMessage;
	
	  setTimeout(function () {
	    sweetAlert.enableButtons();
	  }, 1);
	
	  modal.querySelector('input').focus();
	};
	
	/*
	 * Reset input error DOM elements
	 */
	sweetAlert.resetInputError = swal.resetInputError = function (event) {
	  // If press enter => ignore
	  if (event && event.keyCode === 13) {
	    return false;
	  }
	
	  var $modal = _sweetAlertInitialize$getModal$getOverlay$getInput$setFocusStyle$openModal$resetInput$fixVerticalPosition.getModal();
	
	  var $errorIcon = $modal.querySelector('.sa-input-error');
	  _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.removeClass($errorIcon, 'show');
	
	  var $errorContainer = $modal.querySelector('.sa-error-container');
	  _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.removeClass($errorContainer, 'show');
	};
	
	/*
	 * Disable confirm and cancel buttons
	 */
	sweetAlert.disableButtons = swal.disableButtons = function (event) {
	  var modal = _sweetAlertInitialize$getModal$getOverlay$getInput$setFocusStyle$openModal$resetInput$fixVerticalPosition.getModal();
	  var $confirmButton = modal.querySelector('button.confirm');
	  var $cancelButton = modal.querySelector('button.cancel');
	  $confirmButton.disabled = true;
	  $cancelButton.disabled = true;
	};
	
	/*
	 * Enable confirm and cancel buttons
	 */
	sweetAlert.enableButtons = swal.enableButtons = function (event) {
	  var modal = _sweetAlertInitialize$getModal$getOverlay$getInput$setFocusStyle$openModal$resetInput$fixVerticalPosition.getModal();
	  var $confirmButton = modal.querySelector('button.confirm');
	  var $cancelButton = modal.querySelector('button.cancel');
	  $confirmButton.disabled = false;
	  $cancelButton.disabled = false;
	};
	
	if (typeof window !== 'undefined') {
	  // The 'handle-click' module requires
	  // that 'sweetAlert' was set as global.
	  window.sweetAlert = window.swal = sweetAlert;
	} else {
	  _extend$hexToRgb$isIE8$logStr$colorLuminance.logStr('SweetAlert is a frontend module!');
	}
	module.exports = exports['default'];

/***/ },
/* 25 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	var hasClass = function hasClass(elem, className) {
	  return new RegExp(' ' + className + ' ').test(' ' + elem.className + ' ');
	};
	
	var addClass = function addClass(elem, className) {
	  if (!hasClass(elem, className)) {
	    elem.className += ' ' + className;
	  }
	};
	
	var removeClass = function removeClass(elem, className) {
	  var newClass = ' ' + elem.className.replace(/[\t\r\n]/g, ' ') + ' ';
	  if (hasClass(elem, className)) {
	    while (newClass.indexOf(' ' + className + ' ') >= 0) {
	      newClass = newClass.replace(' ' + className + ' ', ' ');
	    }
	    elem.className = newClass.replace(/^\s+|\s+$/g, '');
	  }
	};
	
	var escapeHtml = function escapeHtml(str) {
	  var div = document.createElement('div');
	  div.appendChild(document.createTextNode(str));
	  return div.innerHTML;
	};
	
	var _show = function _show(elem) {
	  elem.style.opacity = '';
	  elem.style.display = 'block';
	};
	
	var show = function show(elems) {
	  if (elems && !elems.length) {
	    return _show(elems);
	  }
	  for (var i = 0; i < elems.length; ++i) {
	    _show(elems[i]);
	  }
	};
	
	var _hide = function _hide(elem) {
	  elem.style.opacity = '';
	  elem.style.display = 'none';
	};
	
	var hide = function hide(elems) {
	  if (elems && !elems.length) {
	    return _hide(elems);
	  }
	  for (var i = 0; i < elems.length; ++i) {
	    _hide(elems[i]);
	  }
	};
	
	var isDescendant = function isDescendant(parent, child) {
	  var node = child.parentNode;
	  while (node !== null) {
	    if (node === parent) {
	      return true;
	    }
	    node = node.parentNode;
	  }
	  return false;
	};
	
	var getTopMargin = function getTopMargin(elem) {
	  elem.style.left = '-9999px';
	  elem.style.display = 'block';
	
	  var height = elem.clientHeight,
	      padding;
	  if (typeof getComputedStyle !== 'undefined') {
	    // IE 8
	    padding = parseInt(getComputedStyle(elem).getPropertyValue('padding-top'), 10);
	  } else {
	    padding = parseInt(elem.currentStyle.padding);
	  }
	
	  elem.style.left = '';
	  elem.style.display = 'none';
	  return '-' + parseInt((height + padding) / 2) + 'px';
	};
	
	var fadeIn = function fadeIn(elem, interval) {
	  if (+elem.style.opacity < 1) {
	    interval = interval || 16;
	    elem.style.opacity = 0;
	    elem.style.display = 'block';
	    var last = +new Date();
	    var tick = (function (_tick) {
	      function tick() {
	        return _tick.apply(this, arguments);
	      }
	
	      tick.toString = function () {
	        return _tick.toString();
	      };
	
	      return tick;
	    })(function () {
	      elem.style.opacity = +elem.style.opacity + (new Date() - last) / 100;
	      last = +new Date();
	
	      if (+elem.style.opacity < 1) {
	        setTimeout(tick, interval);
	      }
	    });
	    tick();
	  }
	  elem.style.display = 'block'; //fallback IE8
	};
	
	var fadeOut = function fadeOut(elem, interval) {
	  interval = interval || 16;
	  elem.style.opacity = 1;
	  var last = +new Date();
	  var tick = (function (_tick2) {
	    function tick() {
	      return _tick2.apply(this, arguments);
	    }
	
	    tick.toString = function () {
	      return _tick2.toString();
	    };
	
	    return tick;
	  })(function () {
	    elem.style.opacity = +elem.style.opacity - (new Date() - last) / 100;
	    last = +new Date();
	
	    if (+elem.style.opacity > 0) {
	      setTimeout(tick, interval);
	    } else {
	      elem.style.display = 'none';
	    }
	  });
	  tick();
	};
	
	var fireClick = function fireClick(node) {
	  // Taken from http://www.nonobtrusive.com/2011/11/29/programatically-fire-crossbrowser-click-event-with-javascript/
	  // Then fixed for today's Chrome browser.
	  if (typeof MouseEvent === 'function') {
	    // Up-to-date approach
	    var mevt = new MouseEvent('click', {
	      view: window,
	      bubbles: false,
	      cancelable: true
	    });
	    node.dispatchEvent(mevt);
	  } else if (document.createEvent) {
	    // Fallback
	    var evt = document.createEvent('MouseEvents');
	    evt.initEvent('click', false, false);
	    node.dispatchEvent(evt);
	  } else if (document.createEventObject) {
	    node.fireEvent('onclick');
	  } else if (typeof node.onclick === 'function') {
	    node.onclick();
	  }
	};
	
	var stopEventPropagation = function stopEventPropagation(e) {
	  // In particular, make sure the space bar doesn't scroll the main window.
	  if (typeof e.stopPropagation === 'function') {
	    e.stopPropagation();
	    e.preventDefault();
	  } else if (window.event && window.event.hasOwnProperty('cancelBubble')) {
	    window.event.cancelBubble = true;
	  }
	};
	
	exports.hasClass = hasClass;
	exports.addClass = addClass;
	exports.removeClass = removeClass;
	exports.escapeHtml = escapeHtml;
	exports._show = _show;
	exports.show = show;
	exports._hide = _hide;
	exports.hide = hide;
	exports.isDescendant = isDescendant;
	exports.getTopMargin = getTopMargin;
	exports.fadeIn = fadeIn;
	exports.fadeOut = fadeOut;
	exports.fireClick = fireClick;
	exports.stopEventPropagation = stopEventPropagation;

/***/ },
/* 26 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	/*
	 * Allow user to pass their own params
	 */
	var extend = function extend(a, b) {
	  for (var key in b) {
	    if (b.hasOwnProperty(key)) {
	      a[key] = b[key];
	    }
	  }
	  return a;
	};
	
	/*
	 * Convert HEX codes to RGB values (#000000 -> rgb(0,0,0))
	 */
	var hexToRgb = function hexToRgb(hex) {
	  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	  return result ? parseInt(result[1], 16) + ', ' + parseInt(result[2], 16) + ', ' + parseInt(result[3], 16) : null;
	};
	
	/*
	 * Check if the user is using Internet Explorer 8 (for fallbacks)
	 */
	var isIE8 = function isIE8() {
	  return window.attachEvent && !window.addEventListener;
	};
	
	/*
	 * IE compatible logging for developers
	 */
	var logStr = function logStr(string) {
	  if (window.console) {
	    // IE...
	    window.console.log('SweetAlert: ' + string);
	  }
	};
	
	/*
	 * Set hover, active and focus-states for buttons 
	 * (source: http://www.sitepoint.com/javascript-generate-lighter-darker-color)
	 */
	var colorLuminance = function colorLuminance(hex, lum) {
	  // Validate hex string
	  hex = String(hex).replace(/[^0-9a-f]/gi, '');
	  if (hex.length < 6) {
	    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
	  }
	  lum = lum || 0;
	
	  // Convert to decimal and change luminosity
	  var rgb = '#';
	  var c;
	  var i;
	
	  for (i = 0; i < 3; i++) {
	    c = parseInt(hex.substr(i * 2, 2), 16);
	    c = Math.round(Math.min(Math.max(0, c + c * lum), 255)).toString(16);
	    rgb += ('00' + c).substr(c.length);
	  }
	
	  return rgb;
	};
	
	exports.extend = extend;
	exports.hexToRgb = hexToRgb;
	exports.isIE8 = isIE8;
	exports.logStr = logStr;
	exports.colorLuminance = colorLuminance;

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	var _hexToRgb = __webpack_require__(26);
	
	var _removeClass$getTopMargin$fadeIn$show$addClass = __webpack_require__(25);
	
	var _defaultParams = __webpack_require__(28);
	
	var _defaultParams2 = _interopRequireWildcard(_defaultParams);
	
	/*
	 * Add modal + overlay to DOM
	 */
	
	var _injectedHTML = __webpack_require__(29);
	
	var _injectedHTML2 = _interopRequireWildcard(_injectedHTML);
	
	var modalClass = '.sweet-alert';
	var overlayClass = '.sweet-overlay';
	
	var sweetAlertInitialize = function sweetAlertInitialize() {
	  var sweetWrap = document.createElement('div');
	  sweetWrap.innerHTML = _injectedHTML2['default'];
	
	  // Append elements to body
	  while (sweetWrap.firstChild) {
	    document.body.appendChild(sweetWrap.firstChild);
	  }
	};
	
	/*
	 * Get DOM element of modal
	 */
	var getModal = (function (_getModal) {
	  function getModal() {
	    return _getModal.apply(this, arguments);
	  }
	
	  getModal.toString = function () {
	    return _getModal.toString();
	  };
	
	  return getModal;
	})(function () {
	  var $modal = document.querySelector(modalClass);
	
	  if (!$modal) {
	    sweetAlertInitialize();
	    $modal = getModal();
	  }
	
	  return $modal;
	});
	
	/*
	 * Get DOM element of input (in modal)
	 */
	var getInput = function getInput() {
	  var $modal = getModal();
	  if ($modal) {
	    return $modal.querySelector('input');
	  }
	};
	
	/*
	 * Get DOM element of overlay
	 */
	var getOverlay = function getOverlay() {
	  return document.querySelector(overlayClass);
	};
	
	/*
	 * Add box-shadow style to button (depending on its chosen bg-color)
	 */
	var setFocusStyle = function setFocusStyle($button, bgColor) {
	  var rgbColor = _hexToRgb.hexToRgb(bgColor);
	  $button.style.boxShadow = '0 0 2px rgba(' + rgbColor + ', 0.8), inset 0 0 0 1px rgba(0, 0, 0, 0.05)';
	};
	
	/*
	 * Animation when opening modal
	 */
	var openModal = function openModal(callback) {
	  var $modal = getModal();
	  _removeClass$getTopMargin$fadeIn$show$addClass.fadeIn(getOverlay(), 10);
	  _removeClass$getTopMargin$fadeIn$show$addClass.show($modal);
	  _removeClass$getTopMargin$fadeIn$show$addClass.addClass($modal, 'showSweetAlert');
	  _removeClass$getTopMargin$fadeIn$show$addClass.removeClass($modal, 'hideSweetAlert');
	
	  window.previousActiveElement = document.activeElement;
	  var $okButton = $modal.querySelector('button.confirm');
	  $okButton.focus();
	
	  setTimeout(function () {
	    _removeClass$getTopMargin$fadeIn$show$addClass.addClass($modal, 'visible');
	  }, 500);
	
	  var timer = $modal.getAttribute('data-timer');
	
	  if (timer !== 'null' && timer !== '') {
	    var timerCallback = callback;
	    $modal.timeout = setTimeout(function () {
	      var doneFunctionExists = (timerCallback || null) && $modal.getAttribute('data-has-done-function') === 'true';
	      if (doneFunctionExists) {
	        timerCallback(null);
	      } else {
	        sweetAlert.close();
	      }
	    }, timer);
	  }
	};
	
	/*
	 * Reset the styling of the input
	 * (for example if errors have been shown)
	 */
	var resetInput = function resetInput() {
	  var $modal = getModal();
	  var $input = getInput();
	
	  _removeClass$getTopMargin$fadeIn$show$addClass.removeClass($modal, 'show-input');
	  $input.value = _defaultParams2['default'].inputValue;
	  $input.setAttribute('type', _defaultParams2['default'].inputType);
	  $input.setAttribute('placeholder', _defaultParams2['default'].inputPlaceholder);
	
	  resetInputError();
	};
	
	var resetInputError = function resetInputError(event) {
	  // If press enter => ignore
	  if (event && event.keyCode === 13) {
	    return false;
	  }
	
	  var $modal = getModal();
	
	  var $errorIcon = $modal.querySelector('.sa-input-error');
	  _removeClass$getTopMargin$fadeIn$show$addClass.removeClass($errorIcon, 'show');
	
	  var $errorContainer = $modal.querySelector('.sa-error-container');
	  _removeClass$getTopMargin$fadeIn$show$addClass.removeClass($errorContainer, 'show');
	};
	
	/*
	 * Set "margin-top"-property on modal based on its computed height
	 */
	var fixVerticalPosition = function fixVerticalPosition() {
	  var $modal = getModal();
	  $modal.style.marginTop = _removeClass$getTopMargin$fadeIn$show$addClass.getTopMargin(getModal());
	};
	
	exports.sweetAlertInitialize = sweetAlertInitialize;
	exports.getModal = getModal;
	exports.getOverlay = getOverlay;
	exports.getInput = getInput;
	exports.setFocusStyle = setFocusStyle;
	exports.openModal = openModal;
	exports.resetInput = resetInput;
	exports.resetInputError = resetInputError;
	exports.fixVerticalPosition = fixVerticalPosition;

/***/ },
/* 28 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	var defaultParams = {
	  title: '',
	  text: '',
	  type: null,
	  allowOutsideClick: false,
	  showConfirmButton: true,
	  showCancelButton: false,
	  closeOnConfirm: true,
	  closeOnCancel: true,
	  confirmButtonText: 'OK',
	  confirmButtonColor: '#8CD4F5',
	  cancelButtonText: 'Cancel',
	  imageUrl: null,
	  imageSize: null,
	  timer: null,
	  customClass: '',
	  html: false,
	  animation: true,
	  allowEscapeKey: true,
	  inputType: 'text',
	  inputPlaceholder: '',
	  inputValue: '',
	  showLoaderOnConfirm: false
	};
	
	exports['default'] = defaultParams;
	module.exports = exports['default'];

/***/ },
/* 29 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var injectedHTML =
	
	// Dark overlay
	"<div class=\"sweet-overlay\" tabIndex=\"-1\"></div>" +
	
	// Modal
	"<div class=\"sweet-alert\">" +
	
	// Error icon
	"<div class=\"sa-icon sa-error\">\n      <span class=\"sa-x-mark\">\n        <span class=\"sa-line sa-left\"></span>\n        <span class=\"sa-line sa-right\"></span>\n      </span>\n    </div>" +
	
	// Warning icon
	"<div class=\"sa-icon sa-warning\">\n      <span class=\"sa-body\"></span>\n      <span class=\"sa-dot\"></span>\n    </div>" +
	
	// Info icon
	"<div class=\"sa-icon sa-info\"></div>" +
	
	// Success icon
	"<div class=\"sa-icon sa-success\">\n      <span class=\"sa-line sa-tip\"></span>\n      <span class=\"sa-line sa-long\"></span>\n\n      <div class=\"sa-placeholder\"></div>\n      <div class=\"sa-fix\"></div>\n    </div>" + "<div class=\"sa-icon sa-custom\"></div>" +
	
	// Title, text and input
	"<h2>Title</h2>\n    <p>Text</p>\n    <fieldset>\n      <input type=\"text\" tabIndex=\"3\" />\n      <div class=\"sa-input-error\"></div>\n    </fieldset>" +
	
	// Input errors
	"<div class=\"sa-error-container\">\n      <div class=\"icon\">!</div>\n      <p>Not valid!</p>\n    </div>" +
	
	// Cancel and confirm buttons
	"<div class=\"sa-button-container\">\n      <button class=\"cancel\" tabIndex=\"2\">Cancel</button>\n      <div class=\"sa-confirm-button-container\">\n        <button class=\"confirm\" tabIndex=\"1\">OK</button>" +
	
	// Loading animation
	"<div class=\"la-ball-fall\">\n          <div></div>\n          <div></div>\n          <div></div>\n        </div>\n      </div>\n    </div>" +
	
	// End of modal
	"</div>";
	
	exports["default"] = injectedHTML;
	module.exports = exports["default"];

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	var _colorLuminance = __webpack_require__(26);
	
	var _getModal = __webpack_require__(27);
	
	var _hasClass$isDescendant = __webpack_require__(25);
	
	/*
	 * User clicked on "Confirm"/"OK" or "Cancel"
	 */
	var handleButton = function handleButton(event, params, modal) {
	  var e = event || window.event;
	  var target = e.target || e.srcElement;
	
	  var targetedConfirm = target.className.indexOf('confirm') !== -1;
	  var targetedOverlay = target.className.indexOf('sweet-overlay') !== -1;
	  var modalIsVisible = _hasClass$isDescendant.hasClass(modal, 'visible');
	  var doneFunctionExists = params.doneFunction && modal.getAttribute('data-has-done-function') === 'true';
	
	  // Since the user can change the background-color of the confirm button programmatically,
	  // we must calculate what the color should be on hover/active
	  var normalColor, hoverColor, activeColor;
	  if (targetedConfirm && params.confirmButtonColor) {
	    normalColor = params.confirmButtonColor;
	    hoverColor = _colorLuminance.colorLuminance(normalColor, -0.04);
	    activeColor = _colorLuminance.colorLuminance(normalColor, -0.14);
	  }
	
	  function shouldSetConfirmButtonColor(color) {
	    if (targetedConfirm && params.confirmButtonColor) {
	      target.style.backgroundColor = color;
	    }
	  }
	
	  switch (e.type) {
	    case 'mouseover':
	      shouldSetConfirmButtonColor(hoverColor);
	      break;
	
	    case 'mouseout':
	      shouldSetConfirmButtonColor(normalColor);
	      break;
	
	    case 'mousedown':
	      shouldSetConfirmButtonColor(activeColor);
	      break;
	
	    case 'mouseup':
	      shouldSetConfirmButtonColor(hoverColor);
	      break;
	
	    case 'focus':
	      var $confirmButton = modal.querySelector('button.confirm');
	      var $cancelButton = modal.querySelector('button.cancel');
	
	      if (targetedConfirm) {
	        $cancelButton.style.boxShadow = 'none';
	      } else {
	        $confirmButton.style.boxShadow = 'none';
	      }
	      break;
	
	    case 'click':
	      var clickedOnModal = modal === target;
	      var clickedOnModalChild = _hasClass$isDescendant.isDescendant(modal, target);
	
	      // Ignore click outside if allowOutsideClick is false
	      if (!clickedOnModal && !clickedOnModalChild && modalIsVisible && !params.allowOutsideClick) {
	        break;
	      }
	
	      if (targetedConfirm && doneFunctionExists && modalIsVisible) {
	        handleConfirm(modal, params);
	      } else if (doneFunctionExists && modalIsVisible || targetedOverlay) {
	        handleCancel(modal, params);
	      } else if (_hasClass$isDescendant.isDescendant(modal, target) && target.tagName === 'BUTTON') {
	        sweetAlert.close();
	      }
	      break;
	  }
	};
	
	/*
	 *  User clicked on "Confirm"/"OK"
	 */
	var handleConfirm = function handleConfirm(modal, params) {
	  var callbackValue = true;
	
	  if (_hasClass$isDescendant.hasClass(modal, 'show-input')) {
	    callbackValue = modal.querySelector('input').value;
	
	    if (!callbackValue) {
	      callbackValue = '';
	    }
	  }
	
	  params.doneFunction(callbackValue);
	
	  if (params.closeOnConfirm) {
	    sweetAlert.close();
	  }
	  // Disable cancel and confirm button if the parameter is true
	  if (params.showLoaderOnConfirm) {
	    sweetAlert.disableButtons();
	  }
	};
	
	/*
	 *  User clicked on "Cancel"
	 */
	var handleCancel = function handleCancel(modal, params) {
	  // Check if callback function expects a parameter (to track cancel actions)
	  var functionAsStr = String(params.doneFunction).replace(/\s/g, '');
	  var functionHandlesCancel = functionAsStr.substring(0, 9) === 'function(' && functionAsStr.substring(9, 10) !== ')';
	
	  if (functionHandlesCancel) {
	    params.doneFunction(false);
	  }
	
	  if (params.closeOnCancel) {
	    sweetAlert.close();
	  }
	};
	
	exports['default'] = {
	  handleButton: handleButton,
	  handleConfirm: handleConfirm,
	  handleCancel: handleCancel
	};
	module.exports = exports['default'];

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	var _stopEventPropagation$fireClick = __webpack_require__(25);
	
	var _setFocusStyle = __webpack_require__(27);
	
	var handleKeyDown = function handleKeyDown(event, params, modal) {
	  var e = event || window.event;
	  var keyCode = e.keyCode || e.which;
	
	  var $okButton = modal.querySelector('button.confirm');
	  var $cancelButton = modal.querySelector('button.cancel');
	  var $modalButtons = modal.querySelectorAll('button[tabindex]');
	
	  if ([9, 13, 32, 27].indexOf(keyCode) === -1) {
	    // Don't do work on keys we don't care about.
	    return;
	  }
	
	  var $targetElement = e.target || e.srcElement;
	
	  var btnIndex = -1; // Find the button - note, this is a nodelist, not an array.
	  for (var i = 0; i < $modalButtons.length; i++) {
	    if ($targetElement === $modalButtons[i]) {
	      btnIndex = i;
	      break;
	    }
	  }
	
	  if (keyCode === 9) {
	    // TAB
	    if (btnIndex === -1) {
	      // No button focused. Jump to the confirm button.
	      $targetElement = $okButton;
	    } else {
	      // Cycle to the next button
	      if (btnIndex === $modalButtons.length - 1) {
	        $targetElement = $modalButtons[0];
	      } else {
	        $targetElement = $modalButtons[btnIndex + 1];
	      }
	    }
	
	    _stopEventPropagation$fireClick.stopEventPropagation(e);
	    $targetElement.focus();
	
	    if (params.confirmButtonColor) {
	      _setFocusStyle.setFocusStyle($targetElement, params.confirmButtonColor);
	    }
	  } else {
	    if (keyCode === 13) {
	      if ($targetElement.tagName === 'INPUT') {
	        $targetElement = $okButton;
	        $okButton.focus();
	      }
	
	      if (btnIndex === -1) {
	        // ENTER/SPACE clicked outside of a button.
	        $targetElement = $okButton;
	      } else {
	        // Do nothing - let the browser handle it.
	        $targetElement = undefined;
	      }
	    } else if (keyCode === 27 && params.allowEscapeKey === true) {
	      $targetElement = $cancelButton;
	      _stopEventPropagation$fireClick.fireClick($targetElement, e);
	    } else {
	      // Fallback - let the browser handle it.
	      $targetElement = undefined;
	    }
	  }
	};
	
	exports['default'] = handleKeyDown;
	module.exports = exports['default'];

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	var _isIE8 = __webpack_require__(26);
	
	var _getModal$getInput$setFocusStyle = __webpack_require__(27);
	
	var _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide = __webpack_require__(25);
	
	var alertTypes = ['error', 'warning', 'info', 'success', 'input', 'prompt'];
	
	/*
	 * Set type, text and actions on modal
	 */
	var setParameters = function setParameters(params) {
	  var modal = _getModal$getInput$setFocusStyle.getModal();
	
	  var $title = modal.querySelector('h2');
	  var $text = modal.querySelector('p');
	  var $cancelBtn = modal.querySelector('button.cancel');
	  var $confirmBtn = modal.querySelector('button.confirm');
	
	  /*
	   * Title
	   */
	  $title.innerHTML = params.html ? params.title : _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.escapeHtml(params.title).split('\n').join('<br>');
	
	  /*
	   * Text
	   */
	  $text.innerHTML = params.html ? params.text : _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.escapeHtml(params.text || '').split('\n').join('<br>');
	  if (params.text) _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.show($text);
	
	  /*
	   * Custom class
	   */
	  if (params.customClass) {
	    _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.addClass(modal, params.customClass);
	    modal.setAttribute('data-custom-class', params.customClass);
	  } else {
	    // Find previously set classes and remove them
	    var customClass = modal.getAttribute('data-custom-class');
	    _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.removeClass(modal, customClass);
	    modal.setAttribute('data-custom-class', '');
	  }
	
	  /*
	   * Icon
	   */
	  _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.hide(modal.querySelectorAll('.sa-icon'));
	
	  if (params.type && !_isIE8.isIE8()) {
	    var _ret = (function () {
	
	      var validType = false;
	
	      for (var i = 0; i < alertTypes.length; i++) {
	        if (params.type === alertTypes[i]) {
	          validType = true;
	          break;
	        }
	      }
	
	      if (!validType) {
	        logStr('Unknown alert type: ' + params.type);
	        return {
	          v: false
	        };
	      }
	
	      var typesWithIcons = ['success', 'error', 'warning', 'info'];
	      var $icon = undefined;
	
	      if (typesWithIcons.indexOf(params.type) !== -1) {
	        $icon = modal.querySelector('.sa-icon.' + 'sa-' + params.type);
	        _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.show($icon);
	      }
	
	      var $input = _getModal$getInput$setFocusStyle.getInput();
	
	      // Animate icon
	      switch (params.type) {
	
	        case 'success':
	          _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.addClass($icon, 'animate');
	          _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.addClass($icon.querySelector('.sa-tip'), 'animateSuccessTip');
	          _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.addClass($icon.querySelector('.sa-long'), 'animateSuccessLong');
	          break;
	
	        case 'error':
	          _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.addClass($icon, 'animateErrorIcon');
	          _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.addClass($icon.querySelector('.sa-x-mark'), 'animateXMark');
	          break;
	
	        case 'warning':
	          _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.addClass($icon, 'pulseWarning');
	          _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.addClass($icon.querySelector('.sa-body'), 'pulseWarningIns');
	          _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.addClass($icon.querySelector('.sa-dot'), 'pulseWarningIns');
	          break;
	
	        case 'input':
	        case 'prompt':
	          $input.setAttribute('type', params.inputType);
	          $input.value = params.inputValue;
	          $input.setAttribute('placeholder', params.inputPlaceholder);
	          _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.addClass(modal, 'show-input');
	          setTimeout(function () {
	            $input.focus();
	            $input.addEventListener('keyup', swal.resetInputError);
	          }, 400);
	          break;
	      }
	    })();
	
	    if (typeof _ret === 'object') {
	      return _ret.v;
	    }
	  }
	
	  /*
	   * Custom image
	   */
	  if (params.imageUrl) {
	    var $customIcon = modal.querySelector('.sa-icon.sa-custom');
	
	    $customIcon.style.backgroundImage = 'url(' + params.imageUrl + ')';
	    _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.show($customIcon);
	
	    var _imgWidth = 80;
	    var _imgHeight = 80;
	
	    if (params.imageSize) {
	      var dimensions = params.imageSize.toString().split('x');
	      var imgWidth = dimensions[0];
	      var imgHeight = dimensions[1];
	
	      if (!imgWidth || !imgHeight) {
	        logStr('Parameter imageSize expects value with format WIDTHxHEIGHT, got ' + params.imageSize);
	      } else {
	        _imgWidth = imgWidth;
	        _imgHeight = imgHeight;
	      }
	    }
	
	    $customIcon.setAttribute('style', $customIcon.getAttribute('style') + 'width:' + _imgWidth + 'px; height:' + _imgHeight + 'px');
	  }
	
	  /*
	   * Show cancel button?
	   */
	  modal.setAttribute('data-has-cancel-button', params.showCancelButton);
	  if (params.showCancelButton) {
	    $cancelBtn.style.display = 'inline-block';
	  } else {
	    _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.hide($cancelBtn);
	  }
	
	  /*
	   * Show confirm button?
	   */
	  modal.setAttribute('data-has-confirm-button', params.showConfirmButton);
	  if (params.showConfirmButton) {
	    $confirmBtn.style.display = 'inline-block';
	  } else {
	    _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.hide($confirmBtn);
	  }
	
	  /*
	   * Custom text on cancel/confirm buttons
	   */
	  if (params.cancelButtonText) {
	    $cancelBtn.innerHTML = _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.escapeHtml(params.cancelButtonText);
	  }
	  if (params.confirmButtonText) {
	    $confirmBtn.innerHTML = _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.escapeHtml(params.confirmButtonText);
	  }
	
	  /*
	   * Custom color on confirm button
	   */
	  if (params.confirmButtonColor) {
	    // Set confirm button to selected background color
	    $confirmBtn.style.backgroundColor = params.confirmButtonColor;
	
	    // Set the confirm button color to the loading ring
	    $confirmBtn.style.borderLeftColor = params.confirmLoadingButtonColor;
	    $confirmBtn.style.borderRightColor = params.confirmLoadingButtonColor;
	
	    // Set box-shadow to default focused button
	    _getModal$getInput$setFocusStyle.setFocusStyle($confirmBtn, params.confirmButtonColor);
	  }
	
	  /*
	   * Allow outside click
	   */
	  modal.setAttribute('data-allow-outside-click', params.allowOutsideClick);
	
	  /*
	   * Callback function
	   */
	  var hasDoneFunction = params.doneFunction ? true : false;
	  modal.setAttribute('data-has-done-function', hasDoneFunction);
	
	  /*
	   * Animation
	   */
	  if (!params.animation) {
	    modal.setAttribute('data-animation', 'none');
	  } else if (typeof params.animation === 'string') {
	    modal.setAttribute('data-animation', params.animation); // Custom animation
	  } else {
	    modal.setAttribute('data-animation', 'pop');
	  }
	
	  /*
	   * Timer
	   */
	  modal.setAttribute('data-timer', params.timer);
	};
	
	exports['default'] = setParameters;
	module.exports = exports['default'];

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	var ajax = __webpack_require__(34);
	__webpack_require__(35);
	
	var z = 200;
	var mask = (function() {
	  var mask = document.createElement('div');
	  mask.setAttribute('class', 'x-modal-mask');
	  mask.style.position = 'fixed';
	  mask.style.top = mask.style.bottom = mask.style.left = mask.style.right = 0;
	  mask.style.opacity = 0;
	  mask.style.zIndex = z++;
	  mask.style.overflow = 'hidden';
	  
	  return {
	    show: function() {
	      if( mask.parentNode !== document.body ) document.body.appendChild(mask);
	      mask.style.display = 'block';
	      mask.style.opacity = 1;
	      document.body.style.overflowY = 'hidden';
	      
	      return this;
	    },
	    hide: function() {
	      mask.style.opacity = 0;
	      setTimeout(function() {
	        if( mask.parentNode ) mask.parentNode.removeChild(mask);
	        document.body.style.overflowY = '';
	      }, 200);
	      return this;
	    }
	  }
	})();
	
	function object2css(o) {
	  if( !o || typeof o !== 'object' ) return '';
	  var text = '';
	  for(var k in o) {
	    if( !k || !o[k] ) return;
	    text += k + ': ' + o[k] + ';';
	  }
	  return text;
	}
	
	
	function create(options, done) {
	  options = options || {};
	  
	  var id = options.id || ('' + seq++);
	  var cls = Array.isArray(options.cls) ? options.cls.join(' ') : options.cls;
	  var css = object2css(options.style);
	  
	  // container
	  var container = document.createElement('div');
	  container.setAttribute('id', 'modal-' + id);
	  container.className = 'x-modal-container';
	  container.style.position = 'fixed';
	  container.style.top = container.style.left = container.style.right = container.style.bottom = 0;
	  container.style.zIndex = z++;
	  container.style.overflowY = 'auto';
	  container.style.transition = 'all .25s ease-in-out';
	  if( options.maskbg !== false ) container.style.background = (typeof options.maskbg == 'string') ? options.maskbg : 'rgba(0,0,0,.5)';
	  
	  if( options.closable !== false ) {
	    container.onmousedown = function(e) {
	      if( (e.target || e.srcElement) !== container ) return;
	      handle.close();
	    };
	  }
	  
	  var div = document.createElement('div');
	  if( css ) div.setAttribute('style', css);
	  if( cls ) div.className = 'x-modal ' + cls;
	  else div.setAttribute('class', 'x-modal');
	  
	  div.style.position = 'relative';
	  div.style.boxSizing = 'border-box';
	  div.style.transition = 'all .15s ease-in-out';
	  div.style.transform = 'scale(.6,.6)';
	  div.style.opacity = 0;
	  div.style.width = typeof options.width === 'number' ? (options.width + 'px') : options.width;
	  div.style.height = typeof options.height === 'number' ? (options.height + 'px') : options.height;
	  div.style.margin = (+options.margin || 0) + 'px auto';
	  if( options.background ) div.style.background = options.background;
	  if( options.shadow !== false ) div.style.boxShadow = (typeof options.shadow == 'string') ? options.shadow : '0 5px 15px rgba(0,0,0,.5)';
	  
	  //console.log('height', window.innerHeight || document.documentElement.clientHeight);
	  
	  var resizelistener;
	  if( options.fullsize ) {
	    div.style.margin = 0;
	    div.style.width = '100%';
	    div.style.height = (window.innerHeight || document.documentElement.clientHeight) + 'px';
	    
	    resizelistener = function() {
	      div.style.height = (window.innerHeight || document.documentElement.clientHeight) + 'px';
	    };
	    
	    window.addEventListener('resize', resizelistener);
	  }
	  
	  
	  container.appendChild(div);
	  
	  
	  var interval;
	  
	  var handle = {
	    id: id,
	    target: div,
	    body: div,
	    container: container,
	    open: function() {
	      handle.onOpen && handle.onOpen(handle);
	      
	      document.body.appendChild(container);
	      
	      setTimeout(function() {
	        div.style.opacity = 1;
	        div.style.transform = 'scale(1,1)';
	        
	        var showclosebtn = div.querySelectorAll('*[modal-close], .modal-close').length ? false : true;
	        if( 'closebtn' in options ) showclosebtn = options.closebtn;
	        
	        if( showclosebtn ) {
	          var closebtn = document.createElement('div');
	          closebtn.style.position = 'absolute';
	          closebtn.style.right = '20px';
	          closebtn.style.top = '20px';
	          closebtn.style.cursor = 'pointer';
	          closebtn.style.opacity = '0.5';
	          closebtn.style.zIndex = 10001;
	          closebtn.innerHTML = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAB1WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI+CiAgICAgICAgIDx0aWZmOkNvbXByZXNzaW9uPjE8L3RpZmY6Q29tcHJlc3Npb24+CiAgICAgICAgIDx0aWZmOk9yaWVudGF0aW9uPjE8L3RpZmY6T3JpZW50YXRpb24+CiAgICAgICAgIDx0aWZmOlBob3RvbWV0cmljSW50ZXJwcmV0YXRpb24+MjwvdGlmZjpQaG90b21ldHJpY0ludGVycHJldGF0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KAtiABQAAAaRJREFUSA3tlltSwzAMRcsbVgBsC9gqfPBqYGNwzySn48kkrfP4a++MYsuSriJbcbvZnHDsO3CZDTifsQnEELsYFxMYpviO0r7E8tBZayrQhxhiJ8Hg50T9RX4irjkOEWpjJIZYOIC2Vht5eqb3sW8jEHxGbiJgiMS129jxJYZYOICcrbbn6Tkxvkcgooqh5GXS386XmJIjaj0kJFkTIflHxHWIJb/KvKx06AXjUg+TQERSt/CuoGDOtmKj0usIMLbVZjwlYPyOkIBtP+vERsJW+kZdDglpniZC8rdOmDcRbEDfVlvh6XlS6WuEhAhzoY/66Fjd5j0Gkgu3XH3V0e2jkTxTKrXyJnMbTt8sLYNEjNsI28sIqLaJuFb6Znk+JCpvpK/Q2UgwM7fb+eRW+4YhLm8kX6a8QFjzO+cofDF9s1QHu5PAQzeS5OUNR4zrch3MbKc/xrOsdN+NZJLyhqNyOICcrTbylMSfRRrJt9Y2FKqNsYnQcJN+FuO/w1Nm/rRJvDMOTPThjwCxi2HFNURTfEf5qKDqfHoMxFh9z3RSj2UH/gFDp0r+/I0dzwAAAABJRU5ErkJggg==" title="close">';
	          div.appendChild(closebtn);
	          
	          closebtn.onclick = function() {
	            handle.close();
	          };
	        }
	        
	        if( interval ) clearInterval(interval);
	        interval = setInterval(function() {
	          [].forEach.call(container.querySelectorAll('*[modal-close], .modal-close'), function(el) {
	            el.onclick = function() {
	              handle.close();
	            };
	          });
	        }, 250);
	      }, 10);
	    },
	    close: function() {
	      if( interval ) clearInterval(interval);
	      handle.onClose && handle.onClose(handle);
	      
	      div.style.opacity = 0;
	      div.style.transform = 'scale(.6,.6)';
	      
	      if( resizelistener ) window.removeEventListener('resize', resizelistener);
	      
	      setTimeout(function() {
	        try { document.body.removeChild(container); } catch(e) {}
	      }, 200);
	    }
	  };
	    
	  done(null, handle);
	}
	
	
	function load(options, done) {
	  var src = options.src;
	  var html = options.html;
	  var el = options.el;
	  
	  if( typeof el == 'string' ) {
	    el = document.querySelector(el);
	    if( !el ) return done(new Error('not found element: ' + options.el));
	  }
	  
	  if( html ) return done(null, html);
	  if( el ) return done(null, el);
	  if( src ) return ajax(src, done);
	  done();
	};
	
	function build(handle, options, html) {
	  var shell = options.shell, title = options.title, icon = options.icon, btns = options.btns;
	  if( shell !== false && (title || icon || btns) ) shell = true;
	  if( shell ) {
	    var cls = shell.cls, style = shell.style;
	    var shellhtml = __webpack_require__(37);
	    handle.target.innerHTML = shellhtml;
	    handle.target = handle.body.querySelector('.x-modal-shell-body');
	    handle.shell = {
	      shell: handle.body.querySelector('.x-modal-shell'),
	      header: handle.body.querySelector('.x-modal-shell-header'),
	      body: handle.body.querySelector('.x-modal-shell-body'),
	      footer: handle.body.querySelector('.x-modal-shell-footer')
	    };
	    
	    if( !title && !icon ) handle.shell.header.display = 'none';
	    if( !btns || !btns.length ) handle.shell.footer.display = 'none';
	    
	    if( icon ) {
	      handle.shell.header.appendChild(function() {
	        var el = document.createElement('span');
	        el.className = 'x-modal-shell-icon';
	        el.innerHTML = icon;
	        return el;
	      }());
	    }
	    
	    if( title ) {
	      handle.shell.header.appendChild(function() {
	        var el = document.createElement('h3');
	        el.className = 'x-modal-shell-title';
	        el.innerHTML = title;
	        return el;
	      }());
	    }
	    
	    (btns || []).forEach(function(btn) {
	      handle.shell.footer.appendChild(function() {
	        var el = document.createElement('a');
	        el.className = 'x-modal-shell-btn';
	        el.innerHTML = btn.icon + ' ' + btn.text;
	        return el;
	      }());
	    });
	  }
	  
	  if( html ) {
	    handle.target.innerHTML = '';
	    if( html.nodeType ) handle.target.appendChild(html);
	    if( typeof html === 'string' ) handle.target.innerHTML = html;
	    else if( typeof html.length == 'number' ) {
	      [].forEach.call(html, function(node) {
	        handle.target.appendChild(node);
	      });
	    }
	  }
	}
	
	
	var seq = 100;
	var modals = [];
	var ctx = module.exports = {
	  open: function(options, done) {
	    if( typeof options == 'string' ) options = {html:options};
	    options = options || {};
	    
	    var prev = options.id ? ctx.get(options.id) : null;
	    
	    if( prev ) {
	      return load({
	        src: options.src,
	        html: options.html,
	        el: options.el
	      }, function(err, html) {
	        if( err ) return done(err);
	        
	        build(prev, options, html);
	        prev.open();
	        done(null, prev);
	      });
	    }
	    
	    load({
	      src: options.src,
	      html: options.html,
	      el: options.el
	    }, function(err, html) {
	      if( err ) return done(err);
	      
	      create({
	        id: options.id,
	        cls: options.cls,
	        style: options.style,
	        background: options.background,
	        fullsize: options.fullsize,
	        closebtn: options.closebtn,
	        closable: options.closable,
	        shadow: options.shadow,
	        maskbg: options.maskbg,
	        width: options.width || 700,
	        height: options.height,
	        margin: options.margin || 50
	      }, function(err, handle) {
	        if( err ) return done(err);
	        
	        handle.onOpen = function(handle) {
	          if( ~modals.indexOf(handle) ) modals.splice(modals.indexOf(handle), 1);
	          var current = modals[modals.length - 1];
	          modals.push(handle);
	          
	          if( current ) {
	            current.body.style.transform = 'scale(.85, .85)';
	            current.body.style.opacity = '.9';
	          }
	          
	          mask.show();
	        };
	        
	        handle.onClose = function(handle) {
	          if( ~modals.indexOf(handle) ) modals.splice(modals.indexOf(handle), 1);
	          if( !modals.length ) mask.hide();
	          else {
	            var current = modals[modals.length - 1];
	            current.body.style.transform = 'scale(1, 1)';
	            current.body.style.opacity = '1';
	          }
	        };
	        
	        build(handle, options, html);
	        handle.open();
	        done(null, handle);
	      });
	    });
	    return this;
	  },
	  current: function() {
	    return modals[modals.length - 1];
	  },
	  ids: function() {
	    var ids = [];
	    modals.forEach(function(modal) {
	      ids.push(modal.id);
	    });
	    return ids;
	  },
	  get: function(id) {
	    if( !arguments.length ) return ctx.current();
	    
	    var result;
	    modals.forEach(function(modal) {
	      if( modal.id === id ) result = modal;
	    });
	    return result;
	  },
	  close: function(id) {
	    if( !arguments.length ) ctx.closeAll();
	    
	    modals.forEach(function(modal) {
	      if( modal.id === id ) modal.close();
	    });
	    
	    return this;
	  },
	  closeAll: function() {
	    modals.forEach(function(modal) {
	      modal.close();
	    });
	    return this;
	  }
	};

/***/ },
/* 34 */
/***/ function(module, exports) {

	module.exports = function(src, done) {
	  var xhr = win.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
	  xhr.open('GET', src);
	  xhr.onreadystatechange = function(e) {
	    if( this.readyState == 4 ) {
	      var status = this.status, restext = this.responseText;
	      if( status === 0 || (status >= 200 && status < 300) ) done(null, restext);
	      else done(new Error('[' + status + '] ' + restext));
	    }
	  };
	  xhr.send();
	};

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(36);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(18)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!../../../css-loader/index.js!../../../less-loader/index.js!./modal.less", function() {
				var newContent = require("!!../../../css-loader/index.js!../../../less-loader/index.js!./modal.less");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(17)();
	// imports
	
	
	// module
	exports.push([module.id, ".x-modal-shell {\n  background: #fff;\n}\n", ""]);
	
	// exports


/***/ },
/* 37 */
/***/ function(module, exports) {

	module.exports = "<div class=\"x-modal-shell\">\n  <div class=\"x-modal-shell-header\"></div>\n  <div class=\"x-modal-shell-body\"></div>\n  <div class=\"x-modal-shell-footer\"></div>\n</div>";

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(39);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(18)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!../../css-loader/index.js!./sweetalert.css", function() {
				var newContent = require("!!../../css-loader/index.js!./sweetalert.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(17)();
	// imports
	
	
	// module
	exports.push([module.id, "body.stop-scrolling {\n  height: 100%;\n  overflow: hidden; }\n\n.sweet-overlay {\n  background-color: black;\n  /* IE8 */\n  -ms-filter: \"progid:DXImageTransform.Microsoft.Alpha(Opacity=40)\";\n  /* IE8 */\n  background-color: rgba(0, 0, 0, 0.4);\n  position: fixed;\n  left: 0;\n  right: 0;\n  top: 0;\n  bottom: 0;\n  display: none;\n  z-index: 10000; }\n\n.sweet-alert {\n  background-color: white;\n  font-family: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;\n  width: 478px;\n  padding: 17px;\n  border-radius: 5px;\n  text-align: center;\n  position: fixed;\n  left: 50%;\n  top: 50%;\n  margin-left: -256px;\n  margin-top: -200px;\n  overflow: hidden;\n  display: none;\n  z-index: 99999; }\n  @media all and (max-width: 540px) {\n    .sweet-alert {\n      width: auto;\n      margin-left: 0;\n      margin-right: 0;\n      left: 15px;\n      right: 15px; } }\n  .sweet-alert h2 {\n    color: #575757;\n    font-size: 30px;\n    text-align: center;\n    font-weight: 600;\n    text-transform: none;\n    position: relative;\n    margin: 25px 0;\n    padding: 0;\n    line-height: 40px;\n    display: block; }\n  .sweet-alert p {\n    color: #797979;\n    font-size: 16px;\n    text-align: center;\n    font-weight: 300;\n    position: relative;\n    text-align: inherit;\n    float: none;\n    margin: 0;\n    padding: 0;\n    line-height: normal; }\n  .sweet-alert fieldset {\n    border: none;\n    position: relative; }\n  .sweet-alert .sa-error-container {\n    background-color: #f1f1f1;\n    margin-left: -17px;\n    margin-right: -17px;\n    overflow: hidden;\n    padding: 0 10px;\n    max-height: 0;\n    webkit-transition: padding 0.15s, max-height 0.15s;\n    transition: padding 0.15s, max-height 0.15s; }\n    .sweet-alert .sa-error-container.show {\n      padding: 10px 0;\n      max-height: 100px;\n      webkit-transition: padding 0.2s, max-height 0.2s;\n      transition: padding 0.25s, max-height 0.25s; }\n    .sweet-alert .sa-error-container .icon {\n      display: inline-block;\n      width: 24px;\n      height: 24px;\n      border-radius: 50%;\n      background-color: #ea7d7d;\n      color: white;\n      line-height: 24px;\n      text-align: center;\n      margin-right: 3px; }\n    .sweet-alert .sa-error-container p {\n      display: inline-block; }\n  .sweet-alert .sa-input-error {\n    position: absolute;\n    top: 29px;\n    right: 26px;\n    width: 20px;\n    height: 20px;\n    opacity: 0;\n    -webkit-transform: scale(0.5);\n    transform: scale(0.5);\n    -webkit-transform-origin: 50% 50%;\n    transform-origin: 50% 50%;\n    -webkit-transition: all 0.1s;\n    transition: all 0.1s; }\n    .sweet-alert .sa-input-error::before, .sweet-alert .sa-input-error::after {\n      content: \"\";\n      width: 20px;\n      height: 6px;\n      background-color: #f06e57;\n      border-radius: 3px;\n      position: absolute;\n      top: 50%;\n      margin-top: -4px;\n      left: 50%;\n      margin-left: -9px; }\n    .sweet-alert .sa-input-error::before {\n      -webkit-transform: rotate(-45deg);\n      transform: rotate(-45deg); }\n    .sweet-alert .sa-input-error::after {\n      -webkit-transform: rotate(45deg);\n      transform: rotate(45deg); }\n    .sweet-alert .sa-input-error.show {\n      opacity: 1;\n      -webkit-transform: scale(1);\n      transform: scale(1); }\n  .sweet-alert input {\n    width: 100%;\n    box-sizing: border-box;\n    border-radius: 3px;\n    border: 1px solid #d7d7d7;\n    height: 43px;\n    margin-top: 10px;\n    margin-bottom: 17px;\n    font-size: 18px;\n    box-shadow: inset 0px 1px 1px rgba(0, 0, 0, 0.06);\n    padding: 0 12px;\n    display: none;\n    -webkit-transition: all 0.3s;\n    transition: all 0.3s; }\n    .sweet-alert input:focus {\n      outline: none;\n      box-shadow: 0px 0px 3px #c4e6f5;\n      border: 1px solid #b4dbed; }\n      .sweet-alert input:focus::-moz-placeholder {\n        transition: opacity 0.3s 0.03s ease;\n        opacity: 0.5; }\n      .sweet-alert input:focus:-ms-input-placeholder {\n        transition: opacity 0.3s 0.03s ease;\n        opacity: 0.5; }\n      .sweet-alert input:focus::-webkit-input-placeholder {\n        transition: opacity 0.3s 0.03s ease;\n        opacity: 0.5; }\n    .sweet-alert input::-moz-placeholder {\n      color: #bdbdbd; }\n    .sweet-alert input:-ms-input-placeholder {\n      color: #bdbdbd; }\n    .sweet-alert input::-webkit-input-placeholder {\n      color: #bdbdbd; }\n  .sweet-alert.show-input input {\n    display: block; }\n  .sweet-alert .sa-confirm-button-container {\n    display: inline-block;\n    position: relative; }\n  .sweet-alert .la-ball-fall {\n    position: absolute;\n    left: 50%;\n    top: 50%;\n    margin-left: -27px;\n    margin-top: 4px;\n    opacity: 0;\n    visibility: hidden; }\n  .sweet-alert button {\n    background-color: #8CD4F5;\n    color: white;\n    border: none;\n    box-shadow: none;\n    font-size: 17px;\n    font-weight: 500;\n    -webkit-border-radius: 4px;\n    border-radius: 5px;\n    padding: 10px 32px;\n    margin: 26px 5px 0 5px;\n    cursor: pointer; }\n    .sweet-alert button:focus {\n      outline: none;\n      box-shadow: 0 0 2px rgba(128, 179, 235, 0.5), inset 0 0 0 1px rgba(0, 0, 0, 0.05); }\n    .sweet-alert button:hover {\n      background-color: #7ecff4; }\n    .sweet-alert button:active {\n      background-color: #5dc2f1; }\n    .sweet-alert button.cancel {\n      background-color: #C1C1C1; }\n      .sweet-alert button.cancel:hover {\n        background-color: #b9b9b9; }\n      .sweet-alert button.cancel:active {\n        background-color: #a8a8a8; }\n      .sweet-alert button.cancel:focus {\n        box-shadow: rgba(197, 205, 211, 0.8) 0px 0px 2px, rgba(0, 0, 0, 0.0470588) 0px 0px 0px 1px inset !important; }\n    .sweet-alert button[disabled] {\n      opacity: .6;\n      cursor: default; }\n    .sweet-alert button.confirm[disabled] {\n      color: transparent; }\n      .sweet-alert button.confirm[disabled] ~ .la-ball-fall {\n        opacity: 1;\n        visibility: visible;\n        transition-delay: 0s; }\n    .sweet-alert button::-moz-focus-inner {\n      border: 0; }\n  .sweet-alert[data-has-cancel-button=false] button {\n    box-shadow: none !important; }\n  .sweet-alert[data-has-confirm-button=false][data-has-cancel-button=false] {\n    padding-bottom: 40px; }\n  .sweet-alert .sa-icon {\n    width: 80px;\n    height: 80px;\n    border: 4px solid gray;\n    -webkit-border-radius: 40px;\n    border-radius: 40px;\n    border-radius: 50%;\n    margin: 20px auto;\n    padding: 0;\n    position: relative;\n    box-sizing: content-box; }\n    .sweet-alert .sa-icon.sa-error {\n      border-color: #F27474; }\n      .sweet-alert .sa-icon.sa-error .sa-x-mark {\n        position: relative;\n        display: block; }\n      .sweet-alert .sa-icon.sa-error .sa-line {\n        position: absolute;\n        height: 5px;\n        width: 47px;\n        background-color: #F27474;\n        display: block;\n        top: 37px;\n        border-radius: 2px; }\n        .sweet-alert .sa-icon.sa-error .sa-line.sa-left {\n          -webkit-transform: rotate(45deg);\n          transform: rotate(45deg);\n          left: 17px; }\n        .sweet-alert .sa-icon.sa-error .sa-line.sa-right {\n          -webkit-transform: rotate(-45deg);\n          transform: rotate(-45deg);\n          right: 16px; }\n    .sweet-alert .sa-icon.sa-warning {\n      border-color: #F8BB86; }\n      .sweet-alert .sa-icon.sa-warning .sa-body {\n        position: absolute;\n        width: 5px;\n        height: 47px;\n        left: 50%;\n        top: 10px;\n        -webkit-border-radius: 2px;\n        border-radius: 2px;\n        margin-left: -2px;\n        background-color: #F8BB86; }\n      .sweet-alert .sa-icon.sa-warning .sa-dot {\n        position: absolute;\n        width: 7px;\n        height: 7px;\n        -webkit-border-radius: 50%;\n        border-radius: 50%;\n        margin-left: -3px;\n        left: 50%;\n        bottom: 10px;\n        background-color: #F8BB86; }\n    .sweet-alert .sa-icon.sa-info {\n      border-color: #C9DAE1; }\n      .sweet-alert .sa-icon.sa-info::before {\n        content: \"\";\n        position: absolute;\n        width: 5px;\n        height: 29px;\n        left: 50%;\n        bottom: 17px;\n        border-radius: 2px;\n        margin-left: -2px;\n        background-color: #C9DAE1; }\n      .sweet-alert .sa-icon.sa-info::after {\n        content: \"\";\n        position: absolute;\n        width: 7px;\n        height: 7px;\n        border-radius: 50%;\n        margin-left: -3px;\n        top: 19px;\n        background-color: #C9DAE1; }\n    .sweet-alert .sa-icon.sa-success {\n      border-color: #A5DC86; }\n      .sweet-alert .sa-icon.sa-success::before, .sweet-alert .sa-icon.sa-success::after {\n        content: '';\n        -webkit-border-radius: 40px;\n        border-radius: 40px;\n        border-radius: 50%;\n        position: absolute;\n        width: 60px;\n        height: 120px;\n        background: white;\n        -webkit-transform: rotate(45deg);\n        transform: rotate(45deg); }\n      .sweet-alert .sa-icon.sa-success::before {\n        -webkit-border-radius: 120px 0 0 120px;\n        border-radius: 120px 0 0 120px;\n        top: -7px;\n        left: -33px;\n        -webkit-transform: rotate(-45deg);\n        transform: rotate(-45deg);\n        -webkit-transform-origin: 60px 60px;\n        transform-origin: 60px 60px; }\n      .sweet-alert .sa-icon.sa-success::after {\n        -webkit-border-radius: 0 120px 120px 0;\n        border-radius: 0 120px 120px 0;\n        top: -11px;\n        left: 30px;\n        -webkit-transform: rotate(-45deg);\n        transform: rotate(-45deg);\n        -webkit-transform-origin: 0px 60px;\n        transform-origin: 0px 60px; }\n      .sweet-alert .sa-icon.sa-success .sa-placeholder {\n        width: 80px;\n        height: 80px;\n        border: 4px solid rgba(165, 220, 134, 0.2);\n        -webkit-border-radius: 40px;\n        border-radius: 40px;\n        border-radius: 50%;\n        box-sizing: content-box;\n        position: absolute;\n        left: -4px;\n        top: -4px;\n        z-index: 2; }\n      .sweet-alert .sa-icon.sa-success .sa-fix {\n        width: 5px;\n        height: 90px;\n        background-color: white;\n        position: absolute;\n        left: 28px;\n        top: 8px;\n        z-index: 1;\n        -webkit-transform: rotate(-45deg);\n        transform: rotate(-45deg); }\n      .sweet-alert .sa-icon.sa-success .sa-line {\n        height: 5px;\n        background-color: #A5DC86;\n        display: block;\n        border-radius: 2px;\n        position: absolute;\n        z-index: 2; }\n        .sweet-alert .sa-icon.sa-success .sa-line.sa-tip {\n          width: 25px;\n          left: 14px;\n          top: 46px;\n          -webkit-transform: rotate(45deg);\n          transform: rotate(45deg); }\n        .sweet-alert .sa-icon.sa-success .sa-line.sa-long {\n          width: 47px;\n          right: 8px;\n          top: 38px;\n          -webkit-transform: rotate(-45deg);\n          transform: rotate(-45deg); }\n    .sweet-alert .sa-icon.sa-custom {\n      background-size: contain;\n      border-radius: 0;\n      border: none;\n      background-position: center center;\n      background-repeat: no-repeat; }\n\n/*\n * Animations\n */\n@-webkit-keyframes showSweetAlert {\n  0% {\n    transform: scale(0.7);\n    -webkit-transform: scale(0.7); }\n  45% {\n    transform: scale(1.05);\n    -webkit-transform: scale(1.05); }\n  80% {\n    transform: scale(0.95);\n    -webkit-transform: scale(0.95); }\n  100% {\n    transform: scale(1);\n    -webkit-transform: scale(1); } }\n\n@keyframes showSweetAlert {\n  0% {\n    transform: scale(0.7);\n    -webkit-transform: scale(0.7); }\n  45% {\n    transform: scale(1.05);\n    -webkit-transform: scale(1.05); }\n  80% {\n    transform: scale(0.95);\n    -webkit-transform: scale(0.95); }\n  100% {\n    transform: scale(1);\n    -webkit-transform: scale(1); } }\n\n@-webkit-keyframes hideSweetAlert {\n  0% {\n    transform: scale(1);\n    -webkit-transform: scale(1); }\n  100% {\n    transform: scale(0.5);\n    -webkit-transform: scale(0.5); } }\n\n@keyframes hideSweetAlert {\n  0% {\n    transform: scale(1);\n    -webkit-transform: scale(1); }\n  100% {\n    transform: scale(0.5);\n    -webkit-transform: scale(0.5); } }\n\n@-webkit-keyframes slideFromTop {\n  0% {\n    top: 0%; }\n  100% {\n    top: 50%; } }\n\n@keyframes slideFromTop {\n  0% {\n    top: 0%; }\n  100% {\n    top: 50%; } }\n\n@-webkit-keyframes slideToTop {\n  0% {\n    top: 50%; }\n  100% {\n    top: 0%; } }\n\n@keyframes slideToTop {\n  0% {\n    top: 50%; }\n  100% {\n    top: 0%; } }\n\n@-webkit-keyframes slideFromBottom {\n  0% {\n    top: 70%; }\n  100% {\n    top: 50%; } }\n\n@keyframes slideFromBottom {\n  0% {\n    top: 70%; }\n  100% {\n    top: 50%; } }\n\n@-webkit-keyframes slideToBottom {\n  0% {\n    top: 50%; }\n  100% {\n    top: 70%; } }\n\n@keyframes slideToBottom {\n  0% {\n    top: 50%; }\n  100% {\n    top: 70%; } }\n\n.showSweetAlert[data-animation=pop] {\n  -webkit-animation: showSweetAlert 0.3s;\n  animation: showSweetAlert 0.3s; }\n\n.showSweetAlert[data-animation=none] {\n  -webkit-animation: none;\n  animation: none; }\n\n.showSweetAlert[data-animation=slide-from-top] {\n  -webkit-animation: slideFromTop 0.3s;\n  animation: slideFromTop 0.3s; }\n\n.showSweetAlert[data-animation=slide-from-bottom] {\n  -webkit-animation: slideFromBottom 0.3s;\n  animation: slideFromBottom 0.3s; }\n\n.hideSweetAlert[data-animation=pop] {\n  -webkit-animation: hideSweetAlert 0.2s;\n  animation: hideSweetAlert 0.2s; }\n\n.hideSweetAlert[data-animation=none] {\n  -webkit-animation: none;\n  animation: none; }\n\n.hideSweetAlert[data-animation=slide-from-top] {\n  -webkit-animation: slideToTop 0.4s;\n  animation: slideToTop 0.4s; }\n\n.hideSweetAlert[data-animation=slide-from-bottom] {\n  -webkit-animation: slideToBottom 0.3s;\n  animation: slideToBottom 0.3s; }\n\n@-webkit-keyframes animateSuccessTip {\n  0% {\n    width: 0;\n    left: 1px;\n    top: 19px; }\n  54% {\n    width: 0;\n    left: 1px;\n    top: 19px; }\n  70% {\n    width: 50px;\n    left: -8px;\n    top: 37px; }\n  84% {\n    width: 17px;\n    left: 21px;\n    top: 48px; }\n  100% {\n    width: 25px;\n    left: 14px;\n    top: 45px; } }\n\n@keyframes animateSuccessTip {\n  0% {\n    width: 0;\n    left: 1px;\n    top: 19px; }\n  54% {\n    width: 0;\n    left: 1px;\n    top: 19px; }\n  70% {\n    width: 50px;\n    left: -8px;\n    top: 37px; }\n  84% {\n    width: 17px;\n    left: 21px;\n    top: 48px; }\n  100% {\n    width: 25px;\n    left: 14px;\n    top: 45px; } }\n\n@-webkit-keyframes animateSuccessLong {\n  0% {\n    width: 0;\n    right: 46px;\n    top: 54px; }\n  65% {\n    width: 0;\n    right: 46px;\n    top: 54px; }\n  84% {\n    width: 55px;\n    right: 0px;\n    top: 35px; }\n  100% {\n    width: 47px;\n    right: 8px;\n    top: 38px; } }\n\n@keyframes animateSuccessLong {\n  0% {\n    width: 0;\n    right: 46px;\n    top: 54px; }\n  65% {\n    width: 0;\n    right: 46px;\n    top: 54px; }\n  84% {\n    width: 55px;\n    right: 0px;\n    top: 35px; }\n  100% {\n    width: 47px;\n    right: 8px;\n    top: 38px; } }\n\n@-webkit-keyframes rotatePlaceholder {\n  0% {\n    transform: rotate(-45deg);\n    -webkit-transform: rotate(-45deg); }\n  5% {\n    transform: rotate(-45deg);\n    -webkit-transform: rotate(-45deg); }\n  12% {\n    transform: rotate(-405deg);\n    -webkit-transform: rotate(-405deg); }\n  100% {\n    transform: rotate(-405deg);\n    -webkit-transform: rotate(-405deg); } }\n\n@keyframes rotatePlaceholder {\n  0% {\n    transform: rotate(-45deg);\n    -webkit-transform: rotate(-45deg); }\n  5% {\n    transform: rotate(-45deg);\n    -webkit-transform: rotate(-45deg); }\n  12% {\n    transform: rotate(-405deg);\n    -webkit-transform: rotate(-405deg); }\n  100% {\n    transform: rotate(-405deg);\n    -webkit-transform: rotate(-405deg); } }\n\n.animateSuccessTip {\n  -webkit-animation: animateSuccessTip 0.75s;\n  animation: animateSuccessTip 0.75s; }\n\n.animateSuccessLong {\n  -webkit-animation: animateSuccessLong 0.75s;\n  animation: animateSuccessLong 0.75s; }\n\n.sa-icon.sa-success.animate::after {\n  -webkit-animation: rotatePlaceholder 4.25s ease-in;\n  animation: rotatePlaceholder 4.25s ease-in; }\n\n@-webkit-keyframes animateErrorIcon {\n  0% {\n    transform: rotateX(100deg);\n    -webkit-transform: rotateX(100deg);\n    opacity: 0; }\n  100% {\n    transform: rotateX(0deg);\n    -webkit-transform: rotateX(0deg);\n    opacity: 1; } }\n\n@keyframes animateErrorIcon {\n  0% {\n    transform: rotateX(100deg);\n    -webkit-transform: rotateX(100deg);\n    opacity: 0; }\n  100% {\n    transform: rotateX(0deg);\n    -webkit-transform: rotateX(0deg);\n    opacity: 1; } }\n\n.animateErrorIcon {\n  -webkit-animation: animateErrorIcon 0.5s;\n  animation: animateErrorIcon 0.5s; }\n\n@-webkit-keyframes animateXMark {\n  0% {\n    transform: scale(0.4);\n    -webkit-transform: scale(0.4);\n    margin-top: 26px;\n    opacity: 0; }\n  50% {\n    transform: scale(0.4);\n    -webkit-transform: scale(0.4);\n    margin-top: 26px;\n    opacity: 0; }\n  80% {\n    transform: scale(1.15);\n    -webkit-transform: scale(1.15);\n    margin-top: -6px; }\n  100% {\n    transform: scale(1);\n    -webkit-transform: scale(1);\n    margin-top: 0;\n    opacity: 1; } }\n\n@keyframes animateXMark {\n  0% {\n    transform: scale(0.4);\n    -webkit-transform: scale(0.4);\n    margin-top: 26px;\n    opacity: 0; }\n  50% {\n    transform: scale(0.4);\n    -webkit-transform: scale(0.4);\n    margin-top: 26px;\n    opacity: 0; }\n  80% {\n    transform: scale(1.15);\n    -webkit-transform: scale(1.15);\n    margin-top: -6px; }\n  100% {\n    transform: scale(1);\n    -webkit-transform: scale(1);\n    margin-top: 0;\n    opacity: 1; } }\n\n.animateXMark {\n  -webkit-animation: animateXMark 0.5s;\n  animation: animateXMark 0.5s; }\n\n@-webkit-keyframes pulseWarning {\n  0% {\n    border-color: #F8D486; }\n  100% {\n    border-color: #F8BB86; } }\n\n@keyframes pulseWarning {\n  0% {\n    border-color: #F8D486; }\n  100% {\n    border-color: #F8BB86; } }\n\n.pulseWarning {\n  -webkit-animation: pulseWarning 0.75s infinite alternate;\n  animation: pulseWarning 0.75s infinite alternate; }\n\n@-webkit-keyframes pulseWarningIns {\n  0% {\n    background-color: #F8D486; }\n  100% {\n    background-color: #F8BB86; } }\n\n@keyframes pulseWarningIns {\n  0% {\n    background-color: #F8D486; }\n  100% {\n    background-color: #F8BB86; } }\n\n.pulseWarningIns {\n  -webkit-animation: pulseWarningIns 0.75s infinite alternate;\n  animation: pulseWarningIns 0.75s infinite alternate; }\n\n@-webkit-keyframes rotate-loading {\n  0% {\n    transform: rotate(0deg); }\n  100% {\n    transform: rotate(360deg); } }\n\n@keyframes rotate-loading {\n  0% {\n    transform: rotate(0deg); }\n  100% {\n    transform: rotate(360deg); } }\n\n/* Internet Explorer 9 has some special quirks that are fixed here */\n/* The icons are not animated. */\n/* This file is automatically merged into sweet-alert.min.js through Gulp */\n/* Error icon */\n.sweet-alert .sa-icon.sa-error .sa-line.sa-left {\n  -ms-transform: rotate(45deg) \\9; }\n\n.sweet-alert .sa-icon.sa-error .sa-line.sa-right {\n  -ms-transform: rotate(-45deg) \\9; }\n\n/* Success icon */\n.sweet-alert .sa-icon.sa-success {\n  border-color: transparent\\9; }\n\n.sweet-alert .sa-icon.sa-success .sa-line.sa-tip {\n  -ms-transform: rotate(45deg) \\9; }\n\n.sweet-alert .sa-icon.sa-success .sa-line.sa-long {\n  -ms-transform: rotate(-45deg) \\9; }\n\n/*!\n * Load Awesome v1.1.0 (http://github.danielcardoso.net/load-awesome/)\n * Copyright 2015 Daniel Cardoso <@DanielCardoso>\n * Licensed under MIT\n */\n.la-ball-fall,\n.la-ball-fall > div {\n  position: relative;\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box; }\n\n.la-ball-fall {\n  display: block;\n  font-size: 0;\n  color: #fff; }\n\n.la-ball-fall.la-dark {\n  color: #333; }\n\n.la-ball-fall > div {\n  display: inline-block;\n  float: none;\n  background-color: currentColor;\n  border: 0 solid currentColor; }\n\n.la-ball-fall {\n  width: 54px;\n  height: 18px; }\n\n.la-ball-fall > div {\n  width: 10px;\n  height: 10px;\n  margin: 4px;\n  border-radius: 100%;\n  opacity: 0;\n  -webkit-animation: ball-fall 1s ease-in-out infinite;\n  -moz-animation: ball-fall 1s ease-in-out infinite;\n  -o-animation: ball-fall 1s ease-in-out infinite;\n  animation: ball-fall 1s ease-in-out infinite; }\n\n.la-ball-fall > div:nth-child(1) {\n  -webkit-animation-delay: -200ms;\n  -moz-animation-delay: -200ms;\n  -o-animation-delay: -200ms;\n  animation-delay: -200ms; }\n\n.la-ball-fall > div:nth-child(2) {\n  -webkit-animation-delay: -100ms;\n  -moz-animation-delay: -100ms;\n  -o-animation-delay: -100ms;\n  animation-delay: -100ms; }\n\n.la-ball-fall > div:nth-child(3) {\n  -webkit-animation-delay: 0ms;\n  -moz-animation-delay: 0ms;\n  -o-animation-delay: 0ms;\n  animation-delay: 0ms; }\n\n.la-ball-fall.la-sm {\n  width: 26px;\n  height: 8px; }\n\n.la-ball-fall.la-sm > div {\n  width: 4px;\n  height: 4px;\n  margin: 2px; }\n\n.la-ball-fall.la-2x {\n  width: 108px;\n  height: 36px; }\n\n.la-ball-fall.la-2x > div {\n  width: 20px;\n  height: 20px;\n  margin: 8px; }\n\n.la-ball-fall.la-3x {\n  width: 162px;\n  height: 54px; }\n\n.la-ball-fall.la-3x > div {\n  width: 30px;\n  height: 30px;\n  margin: 12px; }\n\n/*\n * Animation\n */\n@-webkit-keyframes ball-fall {\n  0% {\n    opacity: 0;\n    -webkit-transform: translateY(-145%);\n    transform: translateY(-145%); }\n  10% {\n    opacity: .5; }\n  20% {\n    opacity: 1;\n    -webkit-transform: translateY(0);\n    transform: translateY(0); }\n  80% {\n    opacity: 1;\n    -webkit-transform: translateY(0);\n    transform: translateY(0); }\n  90% {\n    opacity: .5; }\n  100% {\n    opacity: 0;\n    -webkit-transform: translateY(145%);\n    transform: translateY(145%); } }\n\n@-moz-keyframes ball-fall {\n  0% {\n    opacity: 0;\n    -moz-transform: translateY(-145%);\n    transform: translateY(-145%); }\n  10% {\n    opacity: .5; }\n  20% {\n    opacity: 1;\n    -moz-transform: translateY(0);\n    transform: translateY(0); }\n  80% {\n    opacity: 1;\n    -moz-transform: translateY(0);\n    transform: translateY(0); }\n  90% {\n    opacity: .5; }\n  100% {\n    opacity: 0;\n    -moz-transform: translateY(145%);\n    transform: translateY(145%); } }\n\n@-o-keyframes ball-fall {\n  0% {\n    opacity: 0;\n    -o-transform: translateY(-145%);\n    transform: translateY(-145%); }\n  10% {\n    opacity: .5; }\n  20% {\n    opacity: 1;\n    -o-transform: translateY(0);\n    transform: translateY(0); }\n  80% {\n    opacity: 1;\n    -o-transform: translateY(0);\n    transform: translateY(0); }\n  90% {\n    opacity: .5; }\n  100% {\n    opacity: 0;\n    -o-transform: translateY(145%);\n    transform: translateY(145%); } }\n\n@keyframes ball-fall {\n  0% {\n    opacity: 0;\n    -webkit-transform: translateY(-145%);\n    -moz-transform: translateY(-145%);\n    -o-transform: translateY(-145%);\n    transform: translateY(-145%); }\n  10% {\n    opacity: .5; }\n  20% {\n    opacity: 1;\n    -webkit-transform: translateY(0);\n    -moz-transform: translateY(0);\n    -o-transform: translateY(0);\n    transform: translateY(0); }\n  80% {\n    opacity: 1;\n    -webkit-transform: translateY(0);\n    -moz-transform: translateY(0);\n    -o-transform: translateY(0);\n    transform: translateY(0); }\n  90% {\n    opacity: .5; }\n  100% {\n    opacity: 0;\n    -webkit-transform: translateY(145%);\n    -moz-transform: translateY(145%);\n    -o-transform: translateY(145%);\n    transform: translateY(145%); } }\n", ""]);
	
	// exports


/***/ },
/* 40 */
/***/ function(module, exports) {

	module.exports = "<div class=\"ff-dialog bs\">\n  <div class=\"p0\">\n    <form class=\"form-horizontal\">\n      <div class=\"panel m0\">\n        <div class=\"panel-heading\">\n          <ul class=\"nav panel-tabs panel-tabs-left\">\n            <li class=\"active\">\n              <a href=\"#style\" data-toggle=\"tab\"><i class=\"fa fa-info-circle\"></i> 스타일/클래스</a>\n            </li>\n            <li>\n              <a href=\"#source\" data-toggle=\"tab\"><i class=\"fa fa-check-circle-o\"></i> HTML 소스</a>\n            </li>\n          </ul>\n        </div>\n        \n        <div class=\"panel-body p15\">\n          <!-- panel body -->\n          <div class=\"tab-content\">\n            <!-- 스타일/클래스 -->\n            <div class=\"tab-pane active p15\" id=\"style\" role=\"tabpanel\">\n              <div class=\"form-group\">\n                <label>스타일</label>\n                <input type=\"text\" name=\"style\" class=\"form-control\" placeholder=\"스타일\">\n              </div>\n              <div class=\"form-group\">\n                <label>클래스</label>\n                <input type=\"text\" name=\"cls\" class=\"form-control\" placeholder=\"클래스\">\n              </div>\n            </div>\n            \n            <!-- HTML -->\n            <div class=\"tab-pane\" id=\"source\" role=\"tabpanel\">\n              <textarea name=\"html\" class=\"form-control\" style=\"height: 400px;\"></textarea>\n            </div>\n          </div>\n        </div>\n        \n        <div class=\"panel-footer\">\n          <div class=\"row\">\n            <div class=\"col-md-6\"></div>\n            <div class=\"col-md-6 text-right\">\n              <button type=\"button\" class=\"btn btn-default\" modal-close>취소</button>\n              <button type=\"submit\" class=\"btn btn-primary\">적용</button>\n            </div>\n          </div>\n        </div>\n      </div>\n    </form>\n  </div>\n</div>";

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(7);
	var Part = __webpack_require__(21);
	var Toolbar = __webpack_require__(13);
	var components = __webpack_require__(42);
	var Marker = __webpack_require__(51);
	var DnD = __webpack_require__(59);
	
	__webpack_require__(65);
	
	function ArticlePart(el) {
	  Part.call(this, el);
	  
	  var el = this.dom();
	  
	  $(el).addClass('ff-article');
	  
	  var toolbar = this.toolbar()
	  .add({
	    text: '<i class="fa fa-eraser"></i>',
	    tooltip: '내용 삭제',
	    fn: function(e) {
	      this.owner().clear();
	    }
	  }, 0)
	  .always();
	  
	  var sidebar = new Toolbar(this)
	  .position('vertical top right outside');
	  
	  components.forEach(function(item) {
	    sidebar.add(item);
	  });
	  
	  this._marker = new Marker(this);
	  this._dnd = new DnD(this);
	  this._sidebar = sidebar;
	  this.update();
	}
	
	ArticlePart.prototype = Object.create(Part.prototype, {
	  onmodechange: {
	    value: function(e) {
	      var sidebar = this.sidebar();
	      if( this.editmode() ) sidebar.show();
	      else sidebar.hide();
	    }
	  },
	  onmousemove: {
	    value: function(e) {
	      this.sidebar().update();
	    }
	  },
	  sidebar: {
	    value: function() {
	      return this._sidebar;
	    }
	  },
	  update: {
	    value: function() {
	      this._dnd.update();
	    }
	  },
	  marker: {
	    value: function() {
	      return this._marker;
	    }
	  },
	  oninsert: {
	    value: function() {
	      this.update();
	    }
	  },
	  oneditmode: {
	    value: function() {
	      this.update();
	    }
	  },
	  onnormalmode: {
	    value: function() {
	      this.update();
	    }
	  },
	  clear: {
	    value: function() {
	      this.dom().innerHTML = '';
	      return this;
	    }
	  },
	  get: {
	    value: function(index) {
	      return $(this.dom()).children()[index];
	    }
	  },
	  find: {
	    value: function(selector) {
	      return $(this.dom()).find(selector);
	    }
	  },
	  indexOf: {
	    value: function(node) {
	      if( !node ) return -1;
	      node = node.dom() || node;
	      return $(this.dom()).indexOf(node);
	    }
	  },
	  children: {
	    value: function() {
	      return $(this.dom()).children().filter(function() {
	        return !$(this).hc('ff-marker');
	      });
	    }
	  },
	  insert: {
	    value: function(node, ref) {
	      var partel = this.dom();
	      var marker = this.marker();
	      //var range = this.range();
	      var children = this.children();
	      var markerIndex = -1;
	      
	      if( marker.isExpanded() ) {
	        markerIndex = marker.getIndex();
	        marker.collapse();
	      }
	      
	      node = $(node);
	      ref = typeof ref == 'number' ? children[ref] : (ref || children[markerIndex]);
	      
	      node.reverse().each(function() {
	        var el = this.dom() || this;
	        if( ref ) ref.parentNode.insertBefore(el, ref);
	        //else if( range ) range.insertNode(el);
	        else partel.appendChild(el);
	      });
	      
	      this.fire('insert', {
	        nodes: node,
	        ref: ref
	      });
	      
	      return this;
	    }
	  }
	});
	
	ArticlePart.components = components;
	ArticlePart.Marker = Marker;
	
	module.exports = ArticlePart;

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(7);
	var modal = __webpack_require__(23);
	var URL = __webpack_require__(43);
	var querystring = __webpack_require__(47);
	var Items = __webpack_require__(50);
	var context = __webpack_require__(1);
	
	var items = Items();
	
	items
	.add({
	  text: '<i class="fa fa-font"></i>',
	  tooltip: '문단',
	  fn: function(e) {
	    this.owner().insert(new context.Paragraph());
	  }
	})
	.add({
	  text: '<i class="fa fa-picture-o"></i>',
	  tooltip: '이미지 파일',
	  fn: function(e) {
	    var part = this.owner();
	    part.context().selectFiles(function(err, files) {
	      if( err ) return modal.error(err);
	      if( !files.length ) return;
	      
	      if( files.length === 1 ) {
	        part.insert(new context.Image(files[0]));
	      } else {
	        part.insert(new context.ImageGroup(files));
	      }
	    });
	  }
	})
	.add({
	  text: '<i class="fa fa-instagram"></i>',
	  tooltip: '이미지',
	  fn: function(e) {
	    var part = this.owner();
	    modal.prompt('이미지 URL을 입력해주세요', function(src) {
	      if( !src ) return;
	      
	      var url = URL.parse(src);
	      if( !url || !url.hostname ) return modal.error('URL을 정확히 입력해주세요');
	      
	      if( ~url.hostname.indexOf('instagram.com') ) {
	        if( url.pathname.indexOf('/p/') !== 0 ) return modal.error('URL을 정확히 입력해주세요');
	        var shortid = url.pathname.substring(3).split('/')[0];
	        src = 'https://www.instagram.com/p/' + shortid + '/media';
	      }
	      
	      part.insert(new context.Image(src));
	    });
	  }
	})
	.add({
	  text: '<i class="fa fa-youtube-square"></i>',
	  tooltip: '동영상',
	  fn: function(e) {
	    var part = this.owner();
	    modal.prompt('동영상 URL을 입력해주세요', function(src) {
	      if( !src ) return;
	      
	      var url = URL.parse(src);
	      if( !url || !url.hostname ) return modal.error('URL을 정확히 입력해주세요');
	      
	      if( ~url.hostname.indexOf('youtube.com') ) {
	        var qry = url && url.query && querystring.parse(url.query);
	        if( !qry || !qry.v ) return modal.error('URL을 정확히 입력해주세요');
	        
	        src = 'https://www.youtube.com/embed/' + qry.v;
	      } else if( ~url.hostname.indexOf('vimeo.com') ) {
	        var videoid = url.pathname.substring(1);
	        if( !videoid ) return modal.error('URL을 정확히 입력해주세요');
	        
	        src = 'https://player.vimeo.com/video/' + videoid;
	      }
	      
	      part.insert(new context.Video(src));
	    });
	  }
	})
	.add({
	  text: '<i class="fa fa-arrows-h"></i>',
	  tooltip: '구분선',
	  fn: function(e) {
	    this.owner().insert(new context.Separator());
	  }
	})
	.add({
	  text: '<i class="fa fa-paperclip"></i>',
	  tooltip: '첨부파일',
	  fn: function(e) {
	    var part = this.owner();
	    part.context().selectFile(function(err, file) {
	      if( err ) return modal.error(err);
	      
	      part.insert(new context.Attachment(file));
	    });
	  }
	});
	
	module.exports = items;

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
	'use strict';
	
	var punycode = __webpack_require__(44);
	var util = __webpack_require__(46);
	
	exports.parse = urlParse;
	exports.resolve = urlResolve;
	exports.resolveObject = urlResolveObject;
	exports.format = urlFormat;
	
	exports.Url = Url;
	
	function Url() {
	  this.protocol = null;
	  this.slashes = null;
	  this.auth = null;
	  this.host = null;
	  this.port = null;
	  this.hostname = null;
	  this.hash = null;
	  this.search = null;
	  this.query = null;
	  this.pathname = null;
	  this.path = null;
	  this.href = null;
	}
	
	// Reference: RFC 3986, RFC 1808, RFC 2396
	
	// define these here so at least they only have to be
	// compiled once on the first module load.
	var protocolPattern = /^([a-z0-9.+-]+:)/i,
	    portPattern = /:[0-9]*$/,
	
	    // Special case for a simple path URL
	    simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,
	
	    // RFC 2396: characters reserved for delimiting URLs.
	    // We actually just auto-escape these.
	    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],
	
	    // RFC 2396: characters not allowed for various reasons.
	    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),
	
	    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
	    autoEscape = ['\''].concat(unwise),
	    // Characters that are never ever allowed in a hostname.
	    // Note that any invalid chars are also handled, but these
	    // are the ones that are *expected* to be seen, so we fast-path
	    // them.
	    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
	    hostEndingChars = ['/', '?', '#'],
	    hostnameMaxLen = 255,
	    hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
	    hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
	    // protocols that can allow "unsafe" and "unwise" chars.
	    unsafeProtocol = {
	      'javascript': true,
	      'javascript:': true
	    },
	    // protocols that never have a hostname.
	    hostlessProtocol = {
	      'javascript': true,
	      'javascript:': true
	    },
	    // protocols that always contain a // bit.
	    slashedProtocol = {
	      'http': true,
	      'https': true,
	      'ftp': true,
	      'gopher': true,
	      'file': true,
	      'http:': true,
	      'https:': true,
	      'ftp:': true,
	      'gopher:': true,
	      'file:': true
	    },
	    querystring = __webpack_require__(47);
	
	function urlParse(url, parseQueryString, slashesDenoteHost) {
	  if (url && util.isObject(url) && url instanceof Url) return url;
	
	  var u = new Url;
	  u.parse(url, parseQueryString, slashesDenoteHost);
	  return u;
	}
	
	Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
	  if (!util.isString(url)) {
	    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
	  }
	
	  // Copy chrome, IE, opera backslash-handling behavior.
	  // Back slashes before the query string get converted to forward slashes
	  // See: https://code.google.com/p/chromium/issues/detail?id=25916
	  var queryIndex = url.indexOf('?'),
	      splitter =
	          (queryIndex !== -1 && queryIndex < url.indexOf('#')) ? '?' : '#',
	      uSplit = url.split(splitter),
	      slashRegex = /\\/g;
	  uSplit[0] = uSplit[0].replace(slashRegex, '/');
	  url = uSplit.join(splitter);
	
	  var rest = url;
	
	  // trim before proceeding.
	  // This is to support parse stuff like "  http://foo.com  \n"
	  rest = rest.trim();
	
	  if (!slashesDenoteHost && url.split('#').length === 1) {
	    // Try fast path regexp
	    var simplePath = simplePathPattern.exec(rest);
	    if (simplePath) {
	      this.path = rest;
	      this.href = rest;
	      this.pathname = simplePath[1];
	      if (simplePath[2]) {
	        this.search = simplePath[2];
	        if (parseQueryString) {
	          this.query = querystring.parse(this.search.substr(1));
	        } else {
	          this.query = this.search.substr(1);
	        }
	      } else if (parseQueryString) {
	        this.search = '';
	        this.query = {};
	      }
	      return this;
	    }
	  }
	
	  var proto = protocolPattern.exec(rest);
	  if (proto) {
	    proto = proto[0];
	    var lowerProto = proto.toLowerCase();
	    this.protocol = lowerProto;
	    rest = rest.substr(proto.length);
	  }
	
	  // figure out if it's got a host
	  // user@server is *always* interpreted as a hostname, and url
	  // resolution will treat //foo/bar as host=foo,path=bar because that's
	  // how the browser resolves relative URLs.
	  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
	    var slashes = rest.substr(0, 2) === '//';
	    if (slashes && !(proto && hostlessProtocol[proto])) {
	      rest = rest.substr(2);
	      this.slashes = true;
	    }
	  }
	
	  if (!hostlessProtocol[proto] &&
	      (slashes || (proto && !slashedProtocol[proto]))) {
	
	    // there's a hostname.
	    // the first instance of /, ?, ;, or # ends the host.
	    //
	    // If there is an @ in the hostname, then non-host chars *are* allowed
	    // to the left of the last @ sign, unless some host-ending character
	    // comes *before* the @-sign.
	    // URLs are obnoxious.
	    //
	    // ex:
	    // http://a@b@c/ => user:a@b host:c
	    // http://a@b?@c => user:a host:c path:/?@c
	
	    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
	    // Review our test case against browsers more comprehensively.
	
	    // find the first instance of any hostEndingChars
	    var hostEnd = -1;
	    for (var i = 0; i < hostEndingChars.length; i++) {
	      var hec = rest.indexOf(hostEndingChars[i]);
	      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
	        hostEnd = hec;
	    }
	
	    // at this point, either we have an explicit point where the
	    // auth portion cannot go past, or the last @ char is the decider.
	    var auth, atSign;
	    if (hostEnd === -1) {
	      // atSign can be anywhere.
	      atSign = rest.lastIndexOf('@');
	    } else {
	      // atSign must be in auth portion.
	      // http://a@b/c@d => host:b auth:a path:/c@d
	      atSign = rest.lastIndexOf('@', hostEnd);
	    }
	
	    // Now we have a portion which is definitely the auth.
	    // Pull that off.
	    if (atSign !== -1) {
	      auth = rest.slice(0, atSign);
	      rest = rest.slice(atSign + 1);
	      this.auth = decodeURIComponent(auth);
	    }
	
	    // the host is the remaining to the left of the first non-host char
	    hostEnd = -1;
	    for (var i = 0; i < nonHostChars.length; i++) {
	      var hec = rest.indexOf(nonHostChars[i]);
	      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
	        hostEnd = hec;
	    }
	    // if we still have not hit it, then the entire thing is a host.
	    if (hostEnd === -1)
	      hostEnd = rest.length;
	
	    this.host = rest.slice(0, hostEnd);
	    rest = rest.slice(hostEnd);
	
	    // pull out port.
	    this.parseHost();
	
	    // we've indicated that there is a hostname,
	    // so even if it's empty, it has to be present.
	    this.hostname = this.hostname || '';
	
	    // if hostname begins with [ and ends with ]
	    // assume that it's an IPv6 address.
	    var ipv6Hostname = this.hostname[0] === '[' &&
	        this.hostname[this.hostname.length - 1] === ']';
	
	    // validate a little.
	    if (!ipv6Hostname) {
	      var hostparts = this.hostname.split(/\./);
	      for (var i = 0, l = hostparts.length; i < l; i++) {
	        var part = hostparts[i];
	        if (!part) continue;
	        if (!part.match(hostnamePartPattern)) {
	          var newpart = '';
	          for (var j = 0, k = part.length; j < k; j++) {
	            if (part.charCodeAt(j) > 127) {
	              // we replace non-ASCII char with a temporary placeholder
	              // we need this to make sure size of hostname is not
	              // broken by replacing non-ASCII by nothing
	              newpart += 'x';
	            } else {
	              newpart += part[j];
	            }
	          }
	          // we test again with ASCII char only
	          if (!newpart.match(hostnamePartPattern)) {
	            var validParts = hostparts.slice(0, i);
	            var notHost = hostparts.slice(i + 1);
	            var bit = part.match(hostnamePartStart);
	            if (bit) {
	              validParts.push(bit[1]);
	              notHost.unshift(bit[2]);
	            }
	            if (notHost.length) {
	              rest = '/' + notHost.join('.') + rest;
	            }
	            this.hostname = validParts.join('.');
	            break;
	          }
	        }
	      }
	    }
	
	    if (this.hostname.length > hostnameMaxLen) {
	      this.hostname = '';
	    } else {
	      // hostnames are always lower case.
	      this.hostname = this.hostname.toLowerCase();
	    }
	
	    if (!ipv6Hostname) {
	      // IDNA Support: Returns a punycoded representation of "domain".
	      // It only converts parts of the domain name that
	      // have non-ASCII characters, i.e. it doesn't matter if
	      // you call it with a domain that already is ASCII-only.
	      this.hostname = punycode.toASCII(this.hostname);
	    }
	
	    var p = this.port ? ':' + this.port : '';
	    var h = this.hostname || '';
	    this.host = h + p;
	    this.href += this.host;
	
	    // strip [ and ] from the hostname
	    // the host field still retains them, though
	    if (ipv6Hostname) {
	      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
	      if (rest[0] !== '/') {
	        rest = '/' + rest;
	      }
	    }
	  }
	
	  // now rest is set to the post-host stuff.
	  // chop off any delim chars.
	  if (!unsafeProtocol[lowerProto]) {
	
	    // First, make 100% sure that any "autoEscape" chars get
	    // escaped, even if encodeURIComponent doesn't think they
	    // need to be.
	    for (var i = 0, l = autoEscape.length; i < l; i++) {
	      var ae = autoEscape[i];
	      if (rest.indexOf(ae) === -1)
	        continue;
	      var esc = encodeURIComponent(ae);
	      if (esc === ae) {
	        esc = escape(ae);
	      }
	      rest = rest.split(ae).join(esc);
	    }
	  }
	
	
	  // chop off from the tail first.
	  var hash = rest.indexOf('#');
	  if (hash !== -1) {
	    // got a fragment string.
	    this.hash = rest.substr(hash);
	    rest = rest.slice(0, hash);
	  }
	  var qm = rest.indexOf('?');
	  if (qm !== -1) {
	    this.search = rest.substr(qm);
	    this.query = rest.substr(qm + 1);
	    if (parseQueryString) {
	      this.query = querystring.parse(this.query);
	    }
	    rest = rest.slice(0, qm);
	  } else if (parseQueryString) {
	    // no query string, but parseQueryString still requested
	    this.search = '';
	    this.query = {};
	  }
	  if (rest) this.pathname = rest;
	  if (slashedProtocol[lowerProto] &&
	      this.hostname && !this.pathname) {
	    this.pathname = '/';
	  }
	
	  //to support http.request
	  if (this.pathname || this.search) {
	    var p = this.pathname || '';
	    var s = this.search || '';
	    this.path = p + s;
	  }
	
	  // finally, reconstruct the href based on what has been validated.
	  this.href = this.format();
	  return this;
	};
	
	// format a parsed object into a url string
	function urlFormat(obj) {
	  // ensure it's an object, and not a string url.
	  // If it's an obj, this is a no-op.
	  // this way, you can call url_format() on strings
	  // to clean up potentially wonky urls.
	  if (util.isString(obj)) obj = urlParse(obj);
	  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
	  return obj.format();
	}
	
	Url.prototype.format = function() {
	  var auth = this.auth || '';
	  if (auth) {
	    auth = encodeURIComponent(auth);
	    auth = auth.replace(/%3A/i, ':');
	    auth += '@';
	  }
	
	  var protocol = this.protocol || '',
	      pathname = this.pathname || '',
	      hash = this.hash || '',
	      host = false,
	      query = '';
	
	  if (this.host) {
	    host = auth + this.host;
	  } else if (this.hostname) {
	    host = auth + (this.hostname.indexOf(':') === -1 ?
	        this.hostname :
	        '[' + this.hostname + ']');
	    if (this.port) {
	      host += ':' + this.port;
	    }
	  }
	
	  if (this.query &&
	      util.isObject(this.query) &&
	      Object.keys(this.query).length) {
	    query = querystring.stringify(this.query);
	  }
	
	  var search = this.search || (query && ('?' + query)) || '';
	
	  if (protocol && protocol.substr(-1) !== ':') protocol += ':';
	
	  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
	  // unless they had them to begin with.
	  if (this.slashes ||
	      (!protocol || slashedProtocol[protocol]) && host !== false) {
	    host = '//' + (host || '');
	    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
	  } else if (!host) {
	    host = '';
	  }
	
	  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
	  if (search && search.charAt(0) !== '?') search = '?' + search;
	
	  pathname = pathname.replace(/[?#]/g, function(match) {
	    return encodeURIComponent(match);
	  });
	  search = search.replace('#', '%23');
	
	  return protocol + host + pathname + search + hash;
	};
	
	function urlResolve(source, relative) {
	  return urlParse(source, false, true).resolve(relative);
	}
	
	Url.prototype.resolve = function(relative) {
	  return this.resolveObject(urlParse(relative, false, true)).format();
	};
	
	function urlResolveObject(source, relative) {
	  if (!source) return relative;
	  return urlParse(source, false, true).resolveObject(relative);
	}
	
	Url.prototype.resolveObject = function(relative) {
	  if (util.isString(relative)) {
	    var rel = new Url();
	    rel.parse(relative, false, true);
	    relative = rel;
	  }
	
	  var result = new Url();
	  var tkeys = Object.keys(this);
	  for (var tk = 0; tk < tkeys.length; tk++) {
	    var tkey = tkeys[tk];
	    result[tkey] = this[tkey];
	  }
	
	  // hash is always overridden, no matter what.
	  // even href="" will remove it.
	  result.hash = relative.hash;
	
	  // if the relative url is empty, then there's nothing left to do here.
	  if (relative.href === '') {
	    result.href = result.format();
	    return result;
	  }
	
	  // hrefs like //foo/bar always cut to the protocol.
	  if (relative.slashes && !relative.protocol) {
	    // take everything except the protocol from relative
	    var rkeys = Object.keys(relative);
	    for (var rk = 0; rk < rkeys.length; rk++) {
	      var rkey = rkeys[rk];
	      if (rkey !== 'protocol')
	        result[rkey] = relative[rkey];
	    }
	
	    //urlParse appends trailing / to urls like http://www.example.com
	    if (slashedProtocol[result.protocol] &&
	        result.hostname && !result.pathname) {
	      result.path = result.pathname = '/';
	    }
	
	    result.href = result.format();
	    return result;
	  }
	
	  if (relative.protocol && relative.protocol !== result.protocol) {
	    // if it's a known url protocol, then changing
	    // the protocol does weird things
	    // first, if it's not file:, then we MUST have a host,
	    // and if there was a path
	    // to begin with, then we MUST have a path.
	    // if it is file:, then the host is dropped,
	    // because that's known to be hostless.
	    // anything else is assumed to be absolute.
	    if (!slashedProtocol[relative.protocol]) {
	      var keys = Object.keys(relative);
	      for (var v = 0; v < keys.length; v++) {
	        var k = keys[v];
	        result[k] = relative[k];
	      }
	      result.href = result.format();
	      return result;
	    }
	
	    result.protocol = relative.protocol;
	    if (!relative.host && !hostlessProtocol[relative.protocol]) {
	      var relPath = (relative.pathname || '').split('/');
	      while (relPath.length && !(relative.host = relPath.shift()));
	      if (!relative.host) relative.host = '';
	      if (!relative.hostname) relative.hostname = '';
	      if (relPath[0] !== '') relPath.unshift('');
	      if (relPath.length < 2) relPath.unshift('');
	      result.pathname = relPath.join('/');
	    } else {
	      result.pathname = relative.pathname;
	    }
	    result.search = relative.search;
	    result.query = relative.query;
	    result.host = relative.host || '';
	    result.auth = relative.auth;
	    result.hostname = relative.hostname || relative.host;
	    result.port = relative.port;
	    // to support http.request
	    if (result.pathname || result.search) {
	      var p = result.pathname || '';
	      var s = result.search || '';
	      result.path = p + s;
	    }
	    result.slashes = result.slashes || relative.slashes;
	    result.href = result.format();
	    return result;
	  }
	
	  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
	      isRelAbs = (
	          relative.host ||
	          relative.pathname && relative.pathname.charAt(0) === '/'
	      ),
	      mustEndAbs = (isRelAbs || isSourceAbs ||
	                    (result.host && relative.pathname)),
	      removeAllDots = mustEndAbs,
	      srcPath = result.pathname && result.pathname.split('/') || [],
	      relPath = relative.pathname && relative.pathname.split('/') || [],
	      psychotic = result.protocol && !slashedProtocol[result.protocol];
	
	  // if the url is a non-slashed url, then relative
	  // links like ../.. should be able
	  // to crawl up to the hostname, as well.  This is strange.
	  // result.protocol has already been set by now.
	  // Later on, put the first path part into the host field.
	  if (psychotic) {
	    result.hostname = '';
	    result.port = null;
	    if (result.host) {
	      if (srcPath[0] === '') srcPath[0] = result.host;
	      else srcPath.unshift(result.host);
	    }
	    result.host = '';
	    if (relative.protocol) {
	      relative.hostname = null;
	      relative.port = null;
	      if (relative.host) {
	        if (relPath[0] === '') relPath[0] = relative.host;
	        else relPath.unshift(relative.host);
	      }
	      relative.host = null;
	    }
	    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
	  }
	
	  if (isRelAbs) {
	    // it's absolute.
	    result.host = (relative.host || relative.host === '') ?
	                  relative.host : result.host;
	    result.hostname = (relative.hostname || relative.hostname === '') ?
	                      relative.hostname : result.hostname;
	    result.search = relative.search;
	    result.query = relative.query;
	    srcPath = relPath;
	    // fall through to the dot-handling below.
	  } else if (relPath.length) {
	    // it's relative
	    // throw away the existing file, and take the new path instead.
	    if (!srcPath) srcPath = [];
	    srcPath.pop();
	    srcPath = srcPath.concat(relPath);
	    result.search = relative.search;
	    result.query = relative.query;
	  } else if (!util.isNullOrUndefined(relative.search)) {
	    // just pull out the search.
	    // like href='?foo'.
	    // Put this after the other two cases because it simplifies the booleans
	    if (psychotic) {
	      result.hostname = result.host = srcPath.shift();
	      //occationaly the auth can get stuck only in host
	      //this especially happens in cases like
	      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
	      var authInHost = result.host && result.host.indexOf('@') > 0 ?
	                       result.host.split('@') : false;
	      if (authInHost) {
	        result.auth = authInHost.shift();
	        result.host = result.hostname = authInHost.shift();
	      }
	    }
	    result.search = relative.search;
	    result.query = relative.query;
	    //to support http.request
	    if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
	      result.path = (result.pathname ? result.pathname : '') +
	                    (result.search ? result.search : '');
	    }
	    result.href = result.format();
	    return result;
	  }
	
	  if (!srcPath.length) {
	    // no path at all.  easy.
	    // we've already handled the other stuff above.
	    result.pathname = null;
	    //to support http.request
	    if (result.search) {
	      result.path = '/' + result.search;
	    } else {
	      result.path = null;
	    }
	    result.href = result.format();
	    return result;
	  }
	
	  // if a url ENDs in . or .., then it must get a trailing slash.
	  // however, if it ends in anything else non-slashy,
	  // then it must NOT get a trailing slash.
	  var last = srcPath.slice(-1)[0];
	  var hasTrailingSlash = (
	      (result.host || relative.host || srcPath.length > 1) &&
	      (last === '.' || last === '..') || last === '');
	
	  // strip single dots, resolve double dots to parent dir
	  // if the path tries to go above the root, `up` ends up > 0
	  var up = 0;
	  for (var i = srcPath.length; i >= 0; i--) {
	    last = srcPath[i];
	    if (last === '.') {
	      srcPath.splice(i, 1);
	    } else if (last === '..') {
	      srcPath.splice(i, 1);
	      up++;
	    } else if (up) {
	      srcPath.splice(i, 1);
	      up--;
	    }
	  }
	
	  // if the path is allowed to go above the root, restore leading ..s
	  if (!mustEndAbs && !removeAllDots) {
	    for (; up--; up) {
	      srcPath.unshift('..');
	    }
	  }
	
	  if (mustEndAbs && srcPath[0] !== '' &&
	      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
	    srcPath.unshift('');
	  }
	
	  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
	    srcPath.push('');
	  }
	
	  var isAbsolute = srcPath[0] === '' ||
	      (srcPath[0] && srcPath[0].charAt(0) === '/');
	
	  // put the host back
	  if (psychotic) {
	    result.hostname = result.host = isAbsolute ? '' :
	                                    srcPath.length ? srcPath.shift() : '';
	    //occationaly the auth can get stuck only in host
	    //this especially happens in cases like
	    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
	    var authInHost = result.host && result.host.indexOf('@') > 0 ?
	                     result.host.split('@') : false;
	    if (authInHost) {
	      result.auth = authInHost.shift();
	      result.host = result.hostname = authInHost.shift();
	    }
	  }
	
	  mustEndAbs = mustEndAbs || (result.host && srcPath.length);
	
	  if (mustEndAbs && !isAbsolute) {
	    srcPath.unshift('');
	  }
	
	  if (!srcPath.length) {
	    result.pathname = null;
	    result.path = null;
	  } else {
	    result.pathname = srcPath.join('/');
	  }
	
	  //to support request.http
	  if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
	    result.path = (result.pathname ? result.pathname : '') +
	                  (result.search ? result.search : '');
	  }
	  result.auth = relative.auth || result.auth;
	  result.slashes = result.slashes || relative.slashes;
	  result.href = result.format();
	  return result;
	};
	
	Url.prototype.parseHost = function() {
	  var host = this.host;
	  var port = portPattern.exec(host);
	  if (port) {
	    port = port[0];
	    if (port !== ':') {
	      this.port = port.substr(1);
	    }
	    host = host.substr(0, host.length - port.length);
	  }
	  if (host) this.hostname = host;
	};


/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module, global) {/*! https://mths.be/punycode v1.3.2 by @mathias */
	;(function(root) {
	
		/** Detect free variables */
		var freeExports = typeof exports == 'object' && exports &&
			!exports.nodeType && exports;
		var freeModule = typeof module == 'object' && module &&
			!module.nodeType && module;
		var freeGlobal = typeof global == 'object' && global;
		if (
			freeGlobal.global === freeGlobal ||
			freeGlobal.window === freeGlobal ||
			freeGlobal.self === freeGlobal
		) {
			root = freeGlobal;
		}
	
		/**
		 * The `punycode` object.
		 * @name punycode
		 * @type Object
		 */
		var punycode,
	
		/** Highest positive signed 32-bit float value */
		maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1
	
		/** Bootstring parameters */
		base = 36,
		tMin = 1,
		tMax = 26,
		skew = 38,
		damp = 700,
		initialBias = 72,
		initialN = 128, // 0x80
		delimiter = '-', // '\x2D'
	
		/** Regular expressions */
		regexPunycode = /^xn--/,
		regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
		regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators
	
		/** Error messages */
		errors = {
			'overflow': 'Overflow: input needs wider integers to process',
			'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
			'invalid-input': 'Invalid input'
		},
	
		/** Convenience shortcuts */
		baseMinusTMin = base - tMin,
		floor = Math.floor,
		stringFromCharCode = String.fromCharCode,
	
		/** Temporary variable */
		key;
	
		/*--------------------------------------------------------------------------*/
	
		/**
		 * A generic error utility function.
		 * @private
		 * @param {String} type The error type.
		 * @returns {Error} Throws a `RangeError` with the applicable error message.
		 */
		function error(type) {
			throw RangeError(errors[type]);
		}
	
		/**
		 * A generic `Array#map` utility function.
		 * @private
		 * @param {Array} array The array to iterate over.
		 * @param {Function} callback The function that gets called for every array
		 * item.
		 * @returns {Array} A new array of values returned by the callback function.
		 */
		function map(array, fn) {
			var length = array.length;
			var result = [];
			while (length--) {
				result[length] = fn(array[length]);
			}
			return result;
		}
	
		/**
		 * A simple `Array#map`-like wrapper to work with domain name strings or email
		 * addresses.
		 * @private
		 * @param {String} domain The domain name or email address.
		 * @param {Function} callback The function that gets called for every
		 * character.
		 * @returns {Array} A new string of characters returned by the callback
		 * function.
		 */
		function mapDomain(string, fn) {
			var parts = string.split('@');
			var result = '';
			if (parts.length > 1) {
				// In email addresses, only the domain name should be punycoded. Leave
				// the local part (i.e. everything up to `@`) intact.
				result = parts[0] + '@';
				string = parts[1];
			}
			// Avoid `split(regex)` for IE8 compatibility. See #17.
			string = string.replace(regexSeparators, '\x2E');
			var labels = string.split('.');
			var encoded = map(labels, fn).join('.');
			return result + encoded;
		}
	
		/**
		 * Creates an array containing the numeric code points of each Unicode
		 * character in the string. While JavaScript uses UCS-2 internally,
		 * this function will convert a pair of surrogate halves (each of which
		 * UCS-2 exposes as separate characters) into a single code point,
		 * matching UTF-16.
		 * @see `punycode.ucs2.encode`
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode.ucs2
		 * @name decode
		 * @param {String} string The Unicode input string (UCS-2).
		 * @returns {Array} The new array of code points.
		 */
		function ucs2decode(string) {
			var output = [],
			    counter = 0,
			    length = string.length,
			    value,
			    extra;
			while (counter < length) {
				value = string.charCodeAt(counter++);
				if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
					// high surrogate, and there is a next character
					extra = string.charCodeAt(counter++);
					if ((extra & 0xFC00) == 0xDC00) { // low surrogate
						output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
					} else {
						// unmatched surrogate; only append this code unit, in case the next
						// code unit is the high surrogate of a surrogate pair
						output.push(value);
						counter--;
					}
				} else {
					output.push(value);
				}
			}
			return output;
		}
	
		/**
		 * Creates a string based on an array of numeric code points.
		 * @see `punycode.ucs2.decode`
		 * @memberOf punycode.ucs2
		 * @name encode
		 * @param {Array} codePoints The array of numeric code points.
		 * @returns {String} The new Unicode string (UCS-2).
		 */
		function ucs2encode(array) {
			return map(array, function(value) {
				var output = '';
				if (value > 0xFFFF) {
					value -= 0x10000;
					output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
					value = 0xDC00 | value & 0x3FF;
				}
				output += stringFromCharCode(value);
				return output;
			}).join('');
		}
	
		/**
		 * Converts a basic code point into a digit/integer.
		 * @see `digitToBasic()`
		 * @private
		 * @param {Number} codePoint The basic numeric code point value.
		 * @returns {Number} The numeric value of a basic code point (for use in
		 * representing integers) in the range `0` to `base - 1`, or `base` if
		 * the code point does not represent a value.
		 */
		function basicToDigit(codePoint) {
			if (codePoint - 48 < 10) {
				return codePoint - 22;
			}
			if (codePoint - 65 < 26) {
				return codePoint - 65;
			}
			if (codePoint - 97 < 26) {
				return codePoint - 97;
			}
			return base;
		}
	
		/**
		 * Converts a digit/integer into a basic code point.
		 * @see `basicToDigit()`
		 * @private
		 * @param {Number} digit The numeric value of a basic code point.
		 * @returns {Number} The basic code point whose value (when used for
		 * representing integers) is `digit`, which needs to be in the range
		 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
		 * used; else, the lowercase form is used. The behavior is undefined
		 * if `flag` is non-zero and `digit` has no uppercase form.
		 */
		function digitToBasic(digit, flag) {
			//  0..25 map to ASCII a..z or A..Z
			// 26..35 map to ASCII 0..9
			return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
		}
	
		/**
		 * Bias adaptation function as per section 3.4 of RFC 3492.
		 * http://tools.ietf.org/html/rfc3492#section-3.4
		 * @private
		 */
		function adapt(delta, numPoints, firstTime) {
			var k = 0;
			delta = firstTime ? floor(delta / damp) : delta >> 1;
			delta += floor(delta / numPoints);
			for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
				delta = floor(delta / baseMinusTMin);
			}
			return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
		}
	
		/**
		 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
		 * symbols.
		 * @memberOf punycode
		 * @param {String} input The Punycode string of ASCII-only symbols.
		 * @returns {String} The resulting string of Unicode symbols.
		 */
		function decode(input) {
			// Don't use UCS-2
			var output = [],
			    inputLength = input.length,
			    out,
			    i = 0,
			    n = initialN,
			    bias = initialBias,
			    basic,
			    j,
			    index,
			    oldi,
			    w,
			    k,
			    digit,
			    t,
			    /** Cached calculation results */
			    baseMinusT;
	
			// Handle the basic code points: let `basic` be the number of input code
			// points before the last delimiter, or `0` if there is none, then copy
			// the first basic code points to the output.
	
			basic = input.lastIndexOf(delimiter);
			if (basic < 0) {
				basic = 0;
			}
	
			for (j = 0; j < basic; ++j) {
				// if it's not a basic code point
				if (input.charCodeAt(j) >= 0x80) {
					error('not-basic');
				}
				output.push(input.charCodeAt(j));
			}
	
			// Main decoding loop: start just after the last delimiter if any basic code
			// points were copied; start at the beginning otherwise.
	
			for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {
	
				// `index` is the index of the next character to be consumed.
				// Decode a generalized variable-length integer into `delta`,
				// which gets added to `i`. The overflow checking is easier
				// if we increase `i` as we go, then subtract off its starting
				// value at the end to obtain `delta`.
				for (oldi = i, w = 1, k = base; /* no condition */; k += base) {
	
					if (index >= inputLength) {
						error('invalid-input');
					}
	
					digit = basicToDigit(input.charCodeAt(index++));
	
					if (digit >= base || digit > floor((maxInt - i) / w)) {
						error('overflow');
					}
	
					i += digit * w;
					t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
	
					if (digit < t) {
						break;
					}
	
					baseMinusT = base - t;
					if (w > floor(maxInt / baseMinusT)) {
						error('overflow');
					}
	
					w *= baseMinusT;
	
				}
	
				out = output.length + 1;
				bias = adapt(i - oldi, out, oldi == 0);
	
				// `i` was supposed to wrap around from `out` to `0`,
				// incrementing `n` each time, so we'll fix that now:
				if (floor(i / out) > maxInt - n) {
					error('overflow');
				}
	
				n += floor(i / out);
				i %= out;
	
				// Insert `n` at position `i` of the output
				output.splice(i++, 0, n);
	
			}
	
			return ucs2encode(output);
		}
	
		/**
		 * Converts a string of Unicode symbols (e.g. a domain name label) to a
		 * Punycode string of ASCII-only symbols.
		 * @memberOf punycode
		 * @param {String} input The string of Unicode symbols.
		 * @returns {String} The resulting Punycode string of ASCII-only symbols.
		 */
		function encode(input) {
			var n,
			    delta,
			    handledCPCount,
			    basicLength,
			    bias,
			    j,
			    m,
			    q,
			    k,
			    t,
			    currentValue,
			    output = [],
			    /** `inputLength` will hold the number of code points in `input`. */
			    inputLength,
			    /** Cached calculation results */
			    handledCPCountPlusOne,
			    baseMinusT,
			    qMinusT;
	
			// Convert the input in UCS-2 to Unicode
			input = ucs2decode(input);
	
			// Cache the length
			inputLength = input.length;
	
			// Initialize the state
			n = initialN;
			delta = 0;
			bias = initialBias;
	
			// Handle the basic code points
			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue < 0x80) {
					output.push(stringFromCharCode(currentValue));
				}
			}
	
			handledCPCount = basicLength = output.length;
	
			// `handledCPCount` is the number of code points that have been handled;
			// `basicLength` is the number of basic code points.
	
			// Finish the basic string - if it is not empty - with a delimiter
			if (basicLength) {
				output.push(delimiter);
			}
	
			// Main encoding loop:
			while (handledCPCount < inputLength) {
	
				// All non-basic code points < n have been handled already. Find the next
				// larger one:
				for (m = maxInt, j = 0; j < inputLength; ++j) {
					currentValue = input[j];
					if (currentValue >= n && currentValue < m) {
						m = currentValue;
					}
				}
	
				// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
				// but guard against overflow
				handledCPCountPlusOne = handledCPCount + 1;
				if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
					error('overflow');
				}
	
				delta += (m - n) * handledCPCountPlusOne;
				n = m;
	
				for (j = 0; j < inputLength; ++j) {
					currentValue = input[j];
	
					if (currentValue < n && ++delta > maxInt) {
						error('overflow');
					}
	
					if (currentValue == n) {
						// Represent delta as a generalized variable-length integer
						for (q = delta, k = base; /* no condition */; k += base) {
							t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
							if (q < t) {
								break;
							}
							qMinusT = q - t;
							baseMinusT = base - t;
							output.push(
								stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
							);
							q = floor(qMinusT / baseMinusT);
						}
	
						output.push(stringFromCharCode(digitToBasic(q, 0)));
						bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
						delta = 0;
						++handledCPCount;
					}
				}
	
				++delta;
				++n;
	
			}
			return output.join('');
		}
	
		/**
		 * Converts a Punycode string representing a domain name or an email address
		 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
		 * it doesn't matter if you call it on a string that has already been
		 * converted to Unicode.
		 * @memberOf punycode
		 * @param {String} input The Punycoded domain name or email address to
		 * convert to Unicode.
		 * @returns {String} The Unicode representation of the given Punycode
		 * string.
		 */
		function toUnicode(input) {
			return mapDomain(input, function(string) {
				return regexPunycode.test(string)
					? decode(string.slice(4).toLowerCase())
					: string;
			});
		}
	
		/**
		 * Converts a Unicode string representing a domain name or an email address to
		 * Punycode. Only the non-ASCII parts of the domain name will be converted,
		 * i.e. it doesn't matter if you call it with a domain that's already in
		 * ASCII.
		 * @memberOf punycode
		 * @param {String} input The domain name or email address to convert, as a
		 * Unicode string.
		 * @returns {String} The Punycode representation of the given domain name or
		 * email address.
		 */
		function toASCII(input) {
			return mapDomain(input, function(string) {
				return regexNonASCII.test(string)
					? 'xn--' + encode(string)
					: string;
			});
		}
	
		/*--------------------------------------------------------------------------*/
	
		/** Define the public API */
		punycode = {
			/**
			 * A string representing the current Punycode.js version number.
			 * @memberOf punycode
			 * @type String
			 */
			'version': '1.3.2',
			/**
			 * An object of methods to convert from JavaScript's internal character
			 * representation (UCS-2) to Unicode code points, and back.
			 * @see <https://mathiasbynens.be/notes/javascript-encoding>
			 * @memberOf punycode
			 * @type Object
			 */
			'ucs2': {
				'decode': ucs2decode,
				'encode': ucs2encode
			},
			'decode': decode,
			'encode': encode,
			'toASCII': toASCII,
			'toUnicode': toUnicode
		};
	
		/** Expose `punycode` */
		// Some AMD build optimizers, like r.js, check for specific condition patterns
		// like the following:
		if (
			true
		) {
			!(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
				return punycode;
			}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		} else if (freeExports && freeModule) {
			if (module.exports == freeExports) { // in Node.js or RingoJS v0.8.0+
				freeModule.exports = punycode;
			} else { // in Narwhal or RingoJS v0.7.0-
				for (key in punycode) {
					punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
				}
			}
		} else { // in Rhino or a web browser
			root.punycode = punycode;
		}
	
	}(this));
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(45)(module), (function() { return this; }())))

/***/ },
/* 45 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 46 */
/***/ function(module, exports) {

	'use strict';
	
	module.exports = {
	  isString: function(arg) {
	    return typeof(arg) === 'string';
	  },
	  isObject: function(arg) {
	    return typeof(arg) === 'object' && arg !== null;
	  },
	  isNull: function(arg) {
	    return arg === null;
	  },
	  isNullOrUndefined: function(arg) {
	    return arg == null;
	  }
	};


/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.decode = exports.parse = __webpack_require__(48);
	exports.encode = exports.stringify = __webpack_require__(49);


/***/ },
/* 48 */
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
	'use strict';
	
	// If obj.hasOwnProperty has been overridden, then calling
	// obj.hasOwnProperty(prop) will break.
	// See: https://github.com/joyent/node/issues/1707
	function hasOwnProperty(obj, prop) {
	  return Object.prototype.hasOwnProperty.call(obj, prop);
	}
	
	module.exports = function(qs, sep, eq, options) {
	  sep = sep || '&';
	  eq = eq || '=';
	  var obj = {};
	
	  if (typeof qs !== 'string' || qs.length === 0) {
	    return obj;
	  }
	
	  var regexp = /\+/g;
	  qs = qs.split(sep);
	
	  var maxKeys = 1000;
	  if (options && typeof options.maxKeys === 'number') {
	    maxKeys = options.maxKeys;
	  }
	
	  var len = qs.length;
	  // maxKeys <= 0 means that we should not limit keys count
	  if (maxKeys > 0 && len > maxKeys) {
	    len = maxKeys;
	  }
	
	  for (var i = 0; i < len; ++i) {
	    var x = qs[i].replace(regexp, '%20'),
	        idx = x.indexOf(eq),
	        kstr, vstr, k, v;
	
	    if (idx >= 0) {
	      kstr = x.substr(0, idx);
	      vstr = x.substr(idx + 1);
	    } else {
	      kstr = x;
	      vstr = '';
	    }
	
	    k = decodeURIComponent(kstr);
	    v = decodeURIComponent(vstr);
	
	    if (!hasOwnProperty(obj, k)) {
	      obj[k] = v;
	    } else if (Array.isArray(obj[k])) {
	      obj[k].push(v);
	    } else {
	      obj[k] = [obj[k], v];
	    }
	  }
	
	  return obj;
	};


/***/ },
/* 49 */
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
	'use strict';
	
	var stringifyPrimitive = function(v) {
	  switch (typeof v) {
	    case 'string':
	      return v;
	
	    case 'boolean':
	      return v ? 'true' : 'false';
	
	    case 'number':
	      return isFinite(v) ? v : '';
	
	    default:
	      return '';
	  }
	};
	
	module.exports = function(obj, sep, eq, name) {
	  sep = sep || '&';
	  eq = eq || '=';
	  if (obj === null) {
	    obj = undefined;
	  }
	
	  if (typeof obj === 'object') {
	    return Object.keys(obj).map(function(k) {
	      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
	      if (Array.isArray(obj[k])) {
	        return obj[k].map(function(v) {
	          return ks + encodeURIComponent(stringifyPrimitive(v));
	        }).join(sep);
	      } else {
	        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
	      }
	    }).join(sep);
	
	  }
	
	  if (!name) return '';
	  return encodeURIComponent(stringifyPrimitive(name)) + eq +
	         encodeURIComponent(stringifyPrimitive(obj));
	};


/***/ },
/* 50 */
/***/ function(module, exports) {

	module.exports = function() {
	  return (function() {
	    var items = [];
	  
	    items.add = function(item) {
	      items.push(item);
	      return this;
	    };
	  
	    items.remove = function(item) {
	      for(var pos;~(pos = items.indexOf(item));) items.splice(pos, 1);
	      return this;
	    };
	  
	    return items;
	  })();
	};

/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(7);
	var getOffsetTop = __webpack_require__(52);
	var components = __webpack_require__(42);
	var Button = __webpack_require__(53);
	
	__webpack_require__(57);
	
	function Marker(part) {
	  var el = $(part.dom());
	  var marker = $('<div class="ff-marker"><div class="ff-marker-head"></div><div class="ff-marker-tools"></div></div>');
	  var lastref;
	  
	  var update = function() {
	    var tools = marker.find('.ff-marker-tools').empty();
	    components.forEach(function(item) {
	      if( !item || !item.text ) return;
	      
	      new Button(item).cls('ff-marker-tools-btn').owner(part).appendTo(tools);
	    });
	  };
	  
	  var show = function(ref) {
	    ref = (typeof ref == 'number' ? el.children()[ref] : ref);
	    
	    if( lastref === ref ) return this;
	    lastref = ref;
	    
	    //marker.remove();
	    if( ref ) marker.insertBefore(ref);
	    else marker.appendTo(el);
	    
	    return this;
	  };
	  
	  var hide = function() {
	    collapse();
	    marker.remove();
	    return this;
	  };
	  
	  var expand = function() {
	    marker.ac('ff-marker-open');
	    return this;
	  };
	  
	  var collapse = function() {
	    marker.rc('ff-marker-open');
	    return this;
	  };
	  
	  marker.find('.ff-marker-head').on('click', function() {
	    update();
	    marker.tc('ff-marker-open');
	  });
	  
	  el.on('click', function(e) {
	    if( !marker[0].contains(e.target) ) marker.rc('ff-marker-open');
	  });
	  
	  el.on('mousemove', function(e) {
	    if( part.editmode() ) {
	      var target = e.target;
	      var y = e.pageY;
	      
	      if( target === el || target === marker ) return;
	      var children = el.children();
	      var current;
	      children.each(function() {
	        if( this.contains(target) ) current = this;
	      });
	      
	      if( !current ) return;
	      
	      var index = children.indexOf(current);
	      if( y > getOffsetTop(current) + (current.offsetHeight / 2) ) index = index + 1;
	      show(index);
	    } else {
	      hide();
	    }
	  });
	  
	  this.show = show;
	  this.hide = hide;
	  this.expand = expand;
	  this.collapse = collapse;
	  this.getIndex = function() {
	    return el.children().indexOf(marker[0]);
	  };
	  this.isExpanded = function() {
	    return marker.hc('ff-marker-open')
	  };
	}
	
	module.exports = Marker;

/***/ },
/* 52 */
/***/ function(module, exports) {

	module.exports = function(el) {
	  var top = 0;
	  do {
	    if( !isNaN( el.offsetLeft ) ) top += el.offsetTop;
	  } while( el = el.offsetParent );
	  return top;
	};

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(7);
	var Separator = __webpack_require__(54);
	
	__webpack_require__(55);
	
	function Button(options) {
	  if( options === '-' ) return new Separator();
	  if( typeof options == 'string' ) options = {text:options};
	  
	  var self = this;
	  self.options(options);
	  self.owner(options.owner);
	  
	  self.el = $('<div class="ff-toolbar-btn"></div>')
	  .html(options.text)
	  .ac(options.cls)
	  .on('click', function(e) {
	    e.stopPropagation();
	    self.click(e);
	    self.update(e);
	  })[0];
	}
	
	Button.prototype = {
	  options: function(options) {
	    if( !arguments.length ) return this._options = this._options || {};
	    this._options = options || {};
	    return this;
	  },
	  cls: function(cls) {
	    $(this.el).cc().ac('ff-toolbar-btn').ac(cls);
	    return this;
	  },
	  active: function(b) {
	    if( !arguments.length ) return $(this.el).hc('ff-toolbar-btn-active');
	    $(this.el).tc('ff-toolbar-btn-active', !b);
	    return this;
	  },
	  enable: function(b) {
	    if( !arguments.length ) return !$(this.el).hc('ff-toolbar-btn-disabled');
	    $(this.el).tc('ff-toolbar-btn-disabled', !b);
	    return this;
	  },
	  owner: function(owner) {
	    if( !arguments.length ) return this._owner;
	    this._owner = owner;
	    return this;
	  },
	  update: function(e) {
	    var o = this.options();
	    var fn = o.update;
	    fn && fn.call(this, e);
	    return this;
	  },
	  click: function(e) {
	    var o = this.options();
	    var fn = o.click || o.fn;
	    fn && fn.call(this, e);
	    return this;
	  },
	  text: function(text) {
	    if( !arguments.length ) return this.el.innerHTML;
	    this.el.innerHTML = text;
	    return this;
	  },
	  appendTo: function(parent) {
	    $(parent).append(this.el);
	    return this;
	  },
	  remove: function() {
	    $(this.el).remove();
	    return this;
	  }
	};
	
	module.exports = Button;

/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(7);
	
	function Separator(options) {
	  self.el = $('<div class="ff-toolbar-separator"></div>')[0];
	}
	
	Separator.prototype = {
	  owner: function(owner) {
	    if( !arguments.length ) return this._owner;
	    this._owner = owner;
	    return this;
	  },
	  appendTo: function(parent) {
	    $(parent).append(this.el);
	    return this;
	  },
	  remove: function() {
	    $(this.el).remove();
	    return this;
	  }
	};
	
	module.exports = Separator;

/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(56);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(18)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/less-loader/index.js!./button.less", function() {
				var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/less-loader/index.js!./button.less");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(17)();
	// imports
	
	
	// module
	exports.push([module.id, ".ff-toolbar-btn {\n  display: block;\n  cursor: pointer;\n  font-size: 1em;\n  line-height: 1em;\n  background-color: transparent;\n  color: #232323;\n  padding: 12px 12px;\n  text-decoration: none;\n  user-select: none;\n}\n.ff-toolbar-btn:hover {\n  color: #2796DD;\n}\n.ff-toolbar-btn.ff-toolbar-btn-active {\n  color: #2796DD;\n}\n.ff-toolbar-btn.ff-toolbar-btn-disabled {\n  color: #ccc;\n}\n", ""]);
	
	// exports


/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(58);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(18)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!../../../node_modules/css-loader/index.js!../../../node_modules/less-loader/index.js!./marker.less", function() {
				var newContent = require("!!../../../node_modules/css-loader/index.js!../../../node_modules/less-loader/index.js!./marker.less");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(17)();
	// imports
	
	
	// module
	exports.push([module.id, ".ff-marker {\n  display: block;\n  position: relative;\n  margin: 0;\n  user-select: none;\n}\n.ff-marker * {\n  box-sizing: border-box;\n}\n.ff-marker .ff-marker-head {\n  position: absolute;\n  left: -50px;\n  top: -13px;\n  background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAAXNSR0IArs4c6QAAAAlwSFlzAAALEwAACxMBAJqcGAAAActpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDUuNC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI+CiAgICAgICAgIDx4bXA6Q3JlYXRvclRvb2w+QWRvYmUgSW1hZ2VSZWFkeTwveG1wOkNyZWF0b3JUb29sPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KKS7NPQAAA6ZJREFUSA2l1s9uVkUYBnDaKqCJbgkS6ILehm1smrBwpbfQEmEBt+AlmLhx0/YSNC5MXJgmpd6CrOiimEq6I7hQlLY8v3POS4f2fP0aeJLnzLx/5nln5syZ75u5dHHMJHUu1B6FxyGwZ0P24dCmeX8Q/jDUTsOFc6eJWaGVWCFY2Xx4I/wkhL/D/XAvbPNo24FRnFfYKv8fRl1L+3W4FF4PTaBi8hR8Fm6HP4YHIbQavWd4TircDlhL7mr4X7gVPgp3wxchfBreDhfD5fByuBGuh9Bq9Z4JT4nwcbgZ/hF+E34QToOce+Hj0FgaUJq9NfKsBAN+Dq3uZpMnju0k9MtfqbfS2QlpTC3eipmtgVdC0M51vZPHnXRXTsyuJ6cdQ4NW4bTGm29Rwlpoe2ulH3EOcKgKP6TzXRlp21iNsXLbThPkdOeqkq32KHR6V8Pvwz9Ds/8nHMO/cb4cC8RnjLFPQ1o0aauh1psZvGIEPhmnt05k+cXAN92itdu+nBpLiyZt4J+xYvtukP5SuBUehg6Mlh9tkbbQ2tWvVl5pKESTNr9acyWYfncjuRweMRrYHjRAW2AjVKzaNk98J6Q9zwi6FVeSa9BEdkWCEu2t/tn6bF/7jttYjSnfkzhofzYEjrzoCrp7ib0YgrZoJfwyVECewSbqulwO5YCDZJvFtOxfwt9CoEnbLQfH3Qnr+6NP8atNhGhNwNkAcddkxcpXcfYZEDYA/MoQMKvnodivA9OMwif17Wikd9KwKzRp125279j2wX5oq24zgppQb519EsLzUBoLSaL915A8q2i9470hsDgEq5GDRNrtY9ekK1a+8ielw+d5KrrXm5eOJfjeDDCj7XA5tEUOkEL8aILaQmtXv1p5xtKgRZM2v1qHCksWhJ9CF8caIyh/b53dfiKFts9XY++m75XQBv5uxQwHwCT8c9gIH4a3Qp9RXfjpvgWn2WczBmOMnQ8fhOshbTXUegvt+1N8J6xPSYE2buCdcEWngZyajLG/h5un4o150rXNYMZ+xBW38oI41jby65efDcYoSqN2rLTjGkclGGC2fk/vhW2xmKOQcz+svz4Ti54+EKWmuBMJqwPZW6FdeBLWZeByWAgXwy9CY70qhFar9+Q5qfDpAX7EvwqXQhe9Q+LuBSf2KPSdbodO70EIo0UFziss7rDUt8mW76TeCK0UrHw/3AvlgonJPWS8KwiYuXYaLpx7EbEqJtcOaG1trY5thWwrLH+6k/EazMPI1WuoPt4AAAAASUVORK5CYII=');\n  background-size: 26px auto;\n  width: 26px;\n  height: 26px;\n  cursor: pointer;\n  opacity: 0.5;\n  transition: all .35s;\n}\n.ff-marker .ff-marker-head:hover {\n  opacity: 1;\n  transform: rotate(-180deg);\n}\n.ff-marker .ff-marker-tools {\n  height: 0;\n  overflow: hidden;\n  margin: 0;\n  padding: 0;\n  transition: all 0.25s;\n}\n.ff-marker .ff-marker-tools .ff-marker-tools-btn {\n  display: inline-block;\n  cursor: pointer;\n  height: 36px;\n  line-height: 34px;\n  padding: 0 12px;\n  margin: 10px 0;\n  margin-right: 8px;\n  border: 1px solid #ccc;\n}\n.ff-marker.ff-marker-open .ff-marker-head {\n  top: 15px;\n}\n.ff-marker.ff-marker-open .ff-marker-tools {\n  height: 56px;\n}\n", ""]);
	
	// exports


/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	var each = __webpack_require__(2);
	var $ = __webpack_require__(7);
	var getOffsetTop = __webpack_require__(52);
	var ImageGroup = __webpack_require__(60);
	
	__webpack_require__(63);
	
	function DnD(part) {
	  var el = $(part.dom());
	  var marker = $('<div class="ff-dnd-marker"></div>');
	  
	  var move = function(target, y) {
	    if( !target ) return;
	    
	    if( y < getOffsetTop(target) + (target.offsetHeight / 2) ) {
	      marker.insertBefore(target);
	    } else {
	      marker.insertAfter(target);
	    }
	  };
	  
	  var hide = function() {
	    marker.remove();
	  };
	  
	  var current = function(target) {
	    if( target === el || target === marker ) return;
	    var children = el.children();
	    var current;
	    children.each(function() {
	      if( this.contains(target) ) current = this;
	    });
	    
	    return current;
	  };
	  
	  var update = function() {
	    if( part.editmode() ) {
	      el.find('.ff-part').attr('draggable', true);
	    } else {
	      el.find('.ff-part').attr('draggable', false);
	    }
	  };
	  
	  el.on('dragover', function(e) {
	    if( !part.editmode() ) return;
	    e.stopPropagation();
	    e.preventDefault();
	    
	    // show marker
	    move(current(e.target), e.pageY);
	  })
	  .on('dragend', function(e) {
	    // hide marker
	    hide();
	  })
	  .on('drop', function(e) {
	    if( !part.editmode() ) return;
	    e.stopPropagation();
	    e.preventDefault();
	    
	    var dragging = part.context().dragging;
	    if( dragging ) {
	      $(dragging.dom()).insertBefore(marker[0]);
	      update();
	    } else if( e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length ) {
	      var srcs = [];
	      each(e.dataTransfer.files, function(file, done) {
	        part.context().upload(file, function(err, src) {
	          if( err ) return done(err);
	          srcs.push(src);
	          done();
	        });
	      }, function(err) {
	        if( err ) return console.error(err);
	        
	        var part = new ImageGroup(srcs);
	        $(part.dom()).insertBefore(marker[0]);
	        update();
	      });
	    }
	  });
	  
	  this.update = update;
	}
	
	module.exports = DnD;

/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(7);
	var Part = __webpack_require__(21);
	
	__webpack_require__(61);
	
	function ImageGroup(el) {
	  Part.call(this, el);
	  
	  var el = this.dom();
	  
	  this.toolbar()
	  .add({
	    text: '<i class="fa fa-angle-double-up"></i>',
	    tooltip: '상단정렬',
	    fn: function(e) {
	      $(el)
	      .removeClass('ff-imagegroup-valign-bottom')
	      .removeClass('ff-imagegroup-valign-middle')
	      .addClass('ff-imagegroup-valign-top');
	    }
	  }, 0)
	  .add({
	    text: '<i class="fa fa-dot-circle-o"></i>',
	    tooltip: '중앙정렬',
	    fn: function(e) {
	      $(el)
	      .removeClass('ff-imagegroup-valign-bottom')
	      .removeClass('ff-imagegroup-valign-top')
	      .addClass('ff-imagegroup-valign-middle');
	    }
	  }, 0)
	  .add({
	    text: '<i class="fa fa-angle-double-down"></i>',
	    tooltip: '하단정렬',
	    fn: function(e) {
	      $(el)
	      .removeClass('ff-imagegroup-valign-top')
	      .removeClass('ff-imagegroup-valign-middle')
	      .addClass('ff-imagegroup-valign-bottom');
	    }
	  }, 0);
	}
	
	ImageGroup.prototype = Object.create(Part.prototype, {
	  create: {
	    value: function(srcs) {
	      if( !srcs ) srcs = [];
	      if( !Array.isArray(srcs) ) srcs = [srcs];
	      
	      var wp = 100 / srcs.length;
	      
	      var el = document.createElement('div');
	      el.setAttribute('ff-type', 'imagegroup');
	      el.setAttribute('class', 'ff-imagegroup');
	      
	      var row = document.createElement('div');
	      row.setAttribute('class', 'ff-imagegroup-row');
	      
	      srcs.forEach(function(src) {
	        var title = src;
	        if( typeof src === 'object' ) {
	          title = src.title || src.src;
	          src = src.src;
	        }
	        
	        row.innerHTML += '<div class="ff-imagegroup-cell" style="width: ' + wp + '%">\
	          <img src="' + src + '" title="' + title + '">\
	        </div>';
	      });
	      
	      el.appendChild(row);
	      console.log('el', el);
	      return el;
	    }
	  }
	});
	
	module.exports = ImageGroup;
	


/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(62);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(18)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!../../../node_modules/css-loader/index.js!../../../node_modules/less-loader/index.js!./imagegroup.less", function() {
				var newContent = require("!!../../../node_modules/css-loader/index.js!../../../node_modules/less-loader/index.js!./imagegroup.less");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(17)();
	// imports
	
	
	// module
	exports.push([module.id, ".ff-imagegroup {\n  display: block;\n  margin-bottom: 10px;\n}\n.ff-imagegroup .ff-imagegroup-row {\n  display: table;\n  width: 100%;\n  table-layout: fixed;\n  border-collapse: separate;\n  border-spacing: 5px;\n}\n.ff-imagegroup .ff-imagegroup-row .ff-imagegroup-cell {\n  display: table-cell;\n  vertical-align: top;\n}\n.ff-imagegroup.ff-imagegroup-valign-top .ff-imagegroup-cell {\n  vertical-align: top;\n}\n.ff-imagegroup.ff-imagegroup-valign-middle .ff-imagegroup-cell {\n  vertical-align: middle;\n}\n.ff-imagegroup.ff-imagegroup-valign-bottom .ff-imagegroup-cell {\n  vertical-align: bottom;\n}\n.ff-imagegroup img {\n  display: block;\n  max-width: 100%;\n  margin: 0 auto;\n}\n", ""]);
	
	// exports


/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(64);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(18)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!../../../node_modules/css-loader/index.js!../../../node_modules/less-loader/index.js!./dnd.less", function() {
				var newContent = require("!!../../../node_modules/css-loader/index.js!../../../node_modules/less-loader/index.js!./dnd.less");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(17)();
	// imports
	
	
	// module
	exports.push([module.id, ".ff-dnd-marker {\n  height: 1px;\n  background-color: #2796DD;\n}\n", ""]);
	
	// exports


/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(66);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(18)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!../../../node_modules/css-loader/index.js!../../../node_modules/less-loader/index.js!./article.less", function() {
				var newContent = require("!!../../../node_modules/css-loader/index.js!../../../node_modules/less-loader/index.js!./article.less");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(17)();
	// imports
	
	
	// module
	exports.push([module.id, ".ff-article {\n  position: relative;\n  padding: 15px;\n}\n.ff-article.ff-focus-state {\n  background-color: initial;\n}\n", ""]);
	
	// exports


/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(7);
	var Part = __webpack_require__(21);
	
	__webpack_require__(68);
	
	function wrap(range, node) {
	  
	}
	
	function unwrap(range, selector) {
	  
	}
	
	
	function ParagraphPart(el) {
	  Part.call(this, el);
	  
	  var el = this.dom();
	  var context = this.context();
	  
	  var part = this.on('modechange', function(e) {
	    if( e.detail.editmode ) {
	      el.setAttribute('contenteditable', 'true');
	    } else if( el.hasAttribute('contenteditable') ) {
	      el.removeAttribute('contenteditable');
	    }
	  });
	  
	  this.toolbar()
	  .add({
	    text: '<i class="fa fa-align-right"></i>',
	    tooltip: '좌측정렬',
	    fn: function(e) {
	      $(el)
	      .removeClass('ff-paragraph-align-left')
	      .removeClass('ff-paragraph-align-center')
	      .addClass('ff-paragraph-align-right');
	    }
	  }, 0)
	  .add({
	    text: '<i class="fa fa-align-center"></i>',
	    tooltip: '중앙정렬',
	    fn: function(e) {
	      $(el)
	      .removeClass('ff-paragraph-align-right')
	      .removeClass('ff-paragraph-align-left')
	      .addClass('ff-paragraph-align-center');
	    }
	  }, 0)
	  .add({
	    text: '<i class="fa fa-align-left"></i>',
	    tooltip: '우축정렬',
	    fn: function(e) {
	      $(el)
	      .removeClass('ff-paragraph-align-right')
	      .removeClass('ff-paragraph-align-center')
	      .addClass('ff-paragraph-align-left');
	    }
	  }, 0)
	  .add({
	    text: '<i class="fa fa-strikethrough"></i>',
	    tooltip: '가로줄',
	    fn: function(e) {
	    }
	  }, 0)
	  .add({
	    text: '<i class="fa fa-underline"></i>',
	    tooltip: '밑줄',
	    fn: function(e) {
	    }
	  }, 0)
	  .add({
	    text: '<i class="fa fa-bold"></i>',
	    tooltip: '굵게',
	    fn: function(e) {
	      var range = this.owner().range();
	      if( !range ) return;
	      
	      var bold = document.createElement('b');
	      range.surroundContents(bold);
	      console.log(range, range.toString());
	    }
	  }, 0);
	}
	
	ParagraphPart.prototype = Object.create(Part.prototype, {
	  onmodechange: {
	    value: function(e) {
	      var el = this.dom();
	      if( e.detail.editmode ) {
	        el.setAttribute('contenteditable', 'true');
	      } else if( el.hasAttribute('contenteditable') ) {
	        el.removeAttribute('contenteditable');
	      }
	    }
	  },
	  create: {
	    value: function(arg) {
	      var el = document.createElement('div');
	      el.innerHTML = typeof arg === 'string' ? arg : '<p>내용을 입력해주세요</p>';
	      el.setAttribute('ff-type', 'paragraph');
	      el.setAttribute('class', 'ff-paragraph ff-paragraph-align-left ff-paragraph-align-left');
	      return el;
	    }
	  }
	});
	
	module.exports = ParagraphPart;
	
	


/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(69);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(18)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!../../../node_modules/css-loader/index.js!../../../node_modules/less-loader/index.js!./paragraph.less", function() {
				var newContent = require("!!../../../node_modules/css-loader/index.js!../../../node_modules/less-loader/index.js!./paragraph.less");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(17)();
	// imports
	
	
	// module
	exports.push([module.id, ".ff-paragraph {\n  font-size: 14px;\n  line-height: 1.5;\n  padding: 8px 0;\n}\n.ff-paragraph.ff-paragraph-align-left {\n  text-align: left;\n}\n.ff-paragraph.ff-paragraph-align-right {\n  text-align: right;\n}\n.ff-paragraph.ff-paragraph-align-center {\n  text-align: center;\n}\n.ff-paragraph h1,\n.ff-paragraph h2,\n.ff-paragraph h3,\n.ff-paragraph h4,\n.ff-paragraph h5,\n.ff-paragraph h6 {\n  font-weight: normal;\n  padding: 0;\n  margin: 0;\n  margin-bottom: 20px;\n}\n.ff-paragraph p {\n  margin: 0;\n  padding: 0;\n}\n", ""]);
	
	// exports


/***/ },
/* 70 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(7);
	var Part = __webpack_require__(21);
	
	__webpack_require__(71);
	
	function Separator(el) {
	  Part.call(this, el);
	  
	  var el = $(this.dom()).ac('ff-separator');
	  
	  this.toolbar()
	  .add({
	    text: '<i class="fa fa-ellipsis-h"></i>',
	    tooltip: '점선',
	    fn: function(e) {
	      el.tc('ff-separator-dashed');
	    }
	  }, 0)
	  .add({
	    text: '<i class="fa fa-arrows-h"></i>',
	    tooltip: '넓게',
	    fn: function(e) {
	      el.tc('ff-separator-wide');
	    }
	  }, 0);
	}
	
	Separator.prototype = Object.create(Part.prototype, {
	  create: {
	    value: function(arg) {
	      return $('<div ff-type="separator" />')[0];
	    }
	  }
	});
	
	module.exports = Separator;

/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(72);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(18)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!../../../node_modules/css-loader/index.js!../../../node_modules/less-loader/index.js!./separator.less", function() {
				var newContent = require("!!../../../node_modules/css-loader/index.js!../../../node_modules/less-loader/index.js!./separator.less");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(17)();
	// imports
	
	
	// module
	exports.push([module.id, ".ff-separator:before {\n  content: \"\";\n  display: block;\n  border-bottom: 1px solid #ccc;\n  padding-top: 15px;\n  max-width: 150px;\n  margin: 0 auto;\n}\n.ff-separator:after {\n  content: \"\";\n  display: block;\n  padding-bottom: 15px;\n}\n.ff-separator.ff-separator-wide:before {\n  max-width: 100%;\n}\n.ff-separator.ff-separator-dashed:before {\n  border-bottom: 1px dashed #ccc;\n}\n", ""]);
	
	// exports


/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(7);
	var Part = __webpack_require__(21);
	
	__webpack_require__(74);
	
	function ImagePart(el) {
	  Part.call(this, el);
	  
	  var el = this.dom();
	  
	  $(el).ac('ff-image');
	  
	  this.toolbar()
	  .position('inside top center')
	  .add({
	    text: '<i class="fa fa-circle-o"></i>',
	    tooltip: '원본크기',
	    fn: function(e) {
	      $(el)
	      .removeClass('ff-image-size-full')
	      .removeClass('ff-image-size-medium');
	    }
	  }, 0)
	  .add({
	    text: '<i class="fa fa-square-o"></i>',
	    tooltip: '기본크기',
	    fn: function(e) {
	      $(el)
	      .removeClass('ff-image-size-full')
	      .addClass('ff-image-size-medium');
	    }
	  }, 0)
	  .add({
	    text: '<i class="fa fa-arrows-alt"></i>',
	    tooltip: '풀사이즈',
	    fn: function(e) {
	      $(el)
	      .removeClass('ff-image-size-medium')
	      .addClass('ff-image-size-full');
	    }
	  }, 0)
	  .add({
	    text: '<i class="fa fa-angle-right"></i>',
	    tooltip: '우측플로팅',
	    fn: function(e) {
	      $(el)
	      .removeClass('ff-image-float-left')
	      .addClass('ff-image-float-right');
	    }
	  }, 0)
	  .add({
	    text: '<i class="fa fa-angle-up"></i>',
	    tooltip: '플로팅제거',
	    fn: function(e) {
	      $(el)
	      .removeClass('ff-image-float-right')
	      .removeClass('ff-image-float-left');
	    }
	  }, 0)
	  .add({
	    text: '<i class="fa fa-angle-left"></i>',
	    tooltip: '좌측플로팅',
	    fn: function(e) {
	      $(el)
	      .removeClass('ff-image-float-right')
	      .addClass('ff-image-float-left');
	    }
	  }, 0);
	}
	
	ImagePart.prototype = Object.create(Part.prototype, {
	  create: {
	    value: function(arg) {
	      var src;
	      var title;
	      
	      if( typeof arg === 'object' ) {
	        src = arg.src;
	        title = arg.title;
	      } else {
	        src = arg;
	      }
	      
	      var el = document.createElement('img');
	      el.src = src || 'https://goo.gl/KRjd3U';
	      el.setAttribute('ff-type', 'image');
	      if( title ) el.setAttribute('title', title);
	      
	      return el;
	    }
	  }
	});
	
	module.exports = ImagePart;
	


/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(75);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(18)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!../../../node_modules/css-loader/index.js!../../../node_modules/less-loader/index.js!./image.less", function() {
				var newContent = require("!!../../../node_modules/css-loader/index.js!../../../node_modules/less-loader/index.js!./image.less");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(17)();
	// imports
	
	
	// module
	exports.push([module.id, ".ff-image {\n  display: block;\n  max-width: 100%;\n  margin: 0 auto;\n  margin-bottom: 10px;\n}\n.ff-image.ff-image-size-medium {\n  width: 80%;\n}\n.ff-image.ff-image-size-full {\n  width: 100%;\n}\n", ""]);
	
	// exports


/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(7);
	var Part = __webpack_require__(21);
	
	__webpack_require__(77);
	
	function VideoPart(el) {
	  el = Part.call(this, el);
	  
	  this.on('modechange', function(e) {
	    if( e.detail.editmode ) {
	      el.querySelector('.mask').style.display = 'block';
	    } else {
	      el.querySelector('.mask').style.display = '';
	    }
	  });
	  
	  this.toolbar()
	  .add({
	    text: '<i class="fa fa-circle-o"></i>',
	    tooltip: '작은크기',
	    fn: function(e) {
	      $(el)
	      .removeClass('ff-video-size-fit')
	      .addClass('ff-video-size-narrow');
	    }
	  }, 0)
	  .add({
	    text: '<i class="fa fa-arrows-alt"></i>',
	    tooltip: '화면에 맞춤',
	    fn: function(e) {
	      $(el)
	      .removeClass('ff-video-size-narrow')
	      .addClass('ff-video-size-fit');
	    }
	  }, 0);
	}
	
	VideoPart.prototype = Object.create(Part.prototype, {
	  create: {
	    value: function(arg) {
	      var el = document.createElement('div');
	      
	      el.innerHTML = '<div class="ff-video-embed-responsive ff-video-embed-responsive-16by9"><iframe class="ff-video-embed-responsive-item" src="' + (arg || 'https://www.youtube.com/embed/aoKNQF2a4xY') + '" frameborder="0" nwebkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div><div class="mask"></div>';
	      el.setAttribute('ff-type', 'video');
	      el.setAttribute('class', 'ff-video');
	      
	      return el;
	    }
	  }
	});
	
	module.exports = VideoPart;
	


/***/ },
/* 77 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(78);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(18)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!../../../node_modules/css-loader/index.js!../../../node_modules/less-loader/index.js!./video.less", function() {
				var newContent = require("!!../../../node_modules/css-loader/index.js!../../../node_modules/less-loader/index.js!./video.less");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 78 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(17)();
	// imports
	
	
	// module
	exports.push([module.id, ".ff-video {\n  position: relative;\n  margin: 0 auto;\n  max-width: 100%;\n}\n.ff-video .ff-video-embed-responsive {\n  position: relative;\n  display: block;\n  height: 0;\n  padding: 0;\n  overflow: hidden;\n}\n.ff-video .ff-video-embed-responsive-16by9 {\n  padding-bottom: 56.25%;\n}\n.ff-video .ff-video-embed-responsive .ff-video-embed-responsive-item {\n  position: absolute;\n  top: 0;\n  left: 0;\n  bottom: 0;\n  height: 100%;\n  width: 100%;\n  border: 0;\n}\n.ff-video .mask {\n  display: none;\n  position: absolute;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  right: 0;\n}\n.ff-video.ff-video-size-narrow {\n  width: 50%;\n}\n.ff-video.ff-video-size-fit {\n  width: 100%;\n}\n", ""]);
	
	// exports


/***/ },
/* 79 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(7);
	var Part = __webpack_require__(21);
	
	__webpack_require__(80);
	
	function FloaterPart(el) {
	  Part.call(this, el);
	  
	  var el = this.dom();
	  $(el).attr('class', 'ff-floater');
	  
	  this.toolbar()
	  .add({
	    text: '<i class="fa fa-circle-o"></i>',
	    fn: function(e) {
	    }
	  }, 0);
	}
	
	FloaterPart.prototype = Object.create(Part.prototype, {
	  create: {
	    value: function(arg) {
	      return document.createElement('div');
	    }
	  }
	});
	
	module.exports = FloaterPart;
	


/***/ },
/* 80 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(81);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(18)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!../../../node_modules/css-loader/index.js!../../../node_modules/less-loader/index.js!./floater.less", function() {
				var newContent = require("!!../../../node_modules/css-loader/index.js!../../../node_modules/less-loader/index.js!./floater.less");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 81 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(17)();
	// imports
	
	
	// module
	exports.push([module.id, ".ff-floater {\n  overflow: auto;\n  clear: both;\n}\n.ff-floater .ff-floater-float {\n  display: block;\n  max-width: 100%;\n  margin: 0 auto;\n  margin-bottom: 10px;\n  float: left;\n  margin-right: 25px;\n  max-width: 40%;\n  text-align: center;\n}\n.ff-floater .ff-floater-float.ff-floater-float-right {\n  float: left;\n  margin-right: 25px;\n  max-width: 40%;\n}\n", ""]);
	
	// exports


/***/ }
/******/ ])
});
;
//# sourceMappingURL=firefront.js.map