/*!
* ff-editor
* https://github.com/attrs/ff-editor
*
* Copyright attrs and others
* Released under the MIT license
* https://github.com/attrs/ff-editor/blob/master/LICENSE
*/
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("ff", [], factory);
	else if(typeof exports === 'object')
		exports["ff"] = factory();
	else
		root["ff"] = factory();
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
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
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
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 25);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

var Context = __webpack_require__(59);

__webpack_require__(60)(Context);

var def = Context(document);
var lib = module.exports = function(doc) {
  if( doc instanceof Document ) {
    if( doc === document ) return def(doc);
    return doc.__tinyselector__ = doc.__tinyselector__ || Context(doc);
  }
  
  return def.apply(def, arguments);
};

lib.fn = Context.fn;
lib.util = Context.util;

/***/ }),
/* 1 */
/***/ (function(module, exports) {

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


/***/ }),
/* 2 */
/***/ (function(module, exports) {

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
	if(typeof DEBUG !== "undefined" && DEBUG) {
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


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

var Events = __webpack_require__(14);
var $ = __webpack_require__(0);
var types = __webpack_require__(11);
var connector = __webpack_require__(24);

var parts = [];
var data = {};
var editmode = false;
var dispatcher = Events();
var uploader;

/*
function wrapnode(node, selector, start, end) {
  var asm = $.util.assemble(selector);
  var node = document.createElement(asm.tag);
  if( asm.id ) node.id = id;
  if( asm.classes ) node.className = asm.classes;
  
  $(node).find(selector).nodes().unwrap();
  node.normalize();
  
  if( node.nodeType === 3 ) {
    
    
    var origText = node.textContent, text, prevText, nextText;
    if (offsetType == 'START') {
      text = origText.substring(idx);
      prevText = origText.substring(0, idx);
    } else if (offsetType == 'END') {
      text = origText.substring(0, idx);
      nextText = origText.substring(idx);
    } else {
      text = origText;
    }
    span.textContent = text;
  
    var parent = node.parentElement;
    parent.replaceChild(span, node);
    if (prevText) { 
      var prevDOM = document.createTextNode(prevText);
      parent.insertBefore(prevDOM, span);
    }
    if (nextText) {
      var nextDOM = document.createTextNode(nextText);
      //parent.appendChild(nextDOM);
      parent.insertBefore(nextDOM, span.nextSibling);
      //parent.insertBefore(span, nextDOM);
    }
    return;
  }
  var childCount = node.childNodes.length;
  for (var i = 0; i < childCount; i++) {
    if (offsetType == 'START' && i == 0) 
      wrapnode(node.childNodes[i], 'START', idx);
    else if (offsetType == 'END' && i == childCount - 1)
      wrapnode(node.childNodes[i], 'END', idx);
    else
      wrapnode(node.childNodes[i]);
  }
}*/

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
    [].slice.call(document.querySelectorAll('[ff], [ff-type]')).reverse().forEach(function(el) {
      var id = el.getAttribute('ff-id') || el.id;
      var type = el.getAttribute('ff-type') || 'default';
      var part = el.__ff__;
      
      if( !part ) {
        var Type = types.get(type);
        if( !Type ) return console.warn('[ff] not found type: ' + type);
        part = el.__ff__ = new Type(el);
      }
      
      if( !~parts.indexOf(part) ) {
        parts.push(part);
        if( id ) part.id = id, parts[id] = part;
      }
    });
  },
  reset: function(d) {
    if( !arguments.length ) d = data;
    
    data = d;
    this.scan();
    
    parts.forEach(function(part) {
      part.data(data && data[part.id]);
    });
    
    dispatcher.fire('reset');
    
    return this;
  },
  data: function(data) {
    if( !arguments.length ) {
      data = {};
      parts.forEach(function(part) {
        if( part.id ) data[part.id] = part.data();
      });
      
      return data;
    }
    
    this.reset(data);
    return this;
  },
  editmode: function(b) {
    if( !arguments.length ) return editmode;
    
    editmode = !!b;
    parts.forEach(function(part) {
      part.editmode(!!b);
    });
    
    dispatcher.fire('modechange', {
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
  },
  fire: function() {
    return dispatcher.fire.apply(dispatcher, arguments);
  },
  isElement: function(node) {
    return (
      typeof HTMLElement === 'object' ? node instanceof HTMLElement : node && typeof node === 'object' && node !== null && node.nodeType === 1 && typeof node.nodeName === 'string'
    );
  },
  uploader: function(fn) {
    if( !fn || typeof fn !== 'function' ) throw new TypeError('uploader must be a function');
    uploader = fn;
    return this;
  },
  upload: function(file, done) {
    if( uploader ) {
      uploader.apply(this, arguments);
      return this;
    }
  
    if( !window.FileReader ) return done(new Error('not found FileReader'));
    var reader = new FileReader(); // NOTE: IE10+
    reader.onload = function(e) {
      done(null, {
        src: e.target.result,
        name: file.name
      });
    };
    reader.onerror = function(err) {
      done(err);
    };
    reader.readAsDataURL(file);
  
    return this;
  },
  selectFiles: function(done) {
    var input = document.createElement('input');
    input.type = 'file';
    input.setAttribute('multiple', 'true');
    input.click();
    input.onchange = function() {
      var srcs = [];
      $(input.files).async(function(file, done) {
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
  },
  selectFile: function(done) {
    var input = document.createElement('input');
    input.type = 'file';
    input.click();
    input.onchange = function() {
      context.upload(input.files[0], done);
    };
  
    return this;
  },
  get: function(node) {
    var node = $(node).parent(function() {
      return this.__ff__;
    }, true)[0];
    return node && node.__ff__;
  },
  type: function(name, cls) {
    if( arguments.length <= 1 ) return types.get(name);
    types.define(name, cls);
    return this;
  },
  
  // range
  ranges: function(node) {
    if( !arguments.length ) return ranges;
    
    return ranges.filter(function(range) {
      return range && node.contains(range.startContainer) && node.contains(range.endContainer);
    });
  },
  range: function(node) {
    return this.ranges(node)[0];
  },
  wrap: function(range, selector) {
    if( !range ) return null;
    if( typeof selector != 'string' || !selector ) selector = 'div';
    
    var node = range.cloneContents();
    var asm = $.util.assemble(selector);
    var wrapper = document.createElement(asm.tag);
    if( asm.id ) wrapper.id = id;
    if( asm.classes ) wrapper.className = asm.classes;
    
    wrapper.appendChild(node);
    wrapper.normalize();
    range.deleteContents();
    range.insertNode(wrapper);
    
    // select new node
    var range = document.createRange();
    range.selectNodeContents(wrapper);
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    
    return wrapper;
  },
  unwrap: function(range, selector) {
    if( !range || !selector ) return this;
    
    /*
    var node = range.cloneContents();
    var wrapper = $('<div/>').append(node).normalize();
    
    range.deleteContents();
    range.insertNode(wrapper[0]);
    
    wrapper.find(selector).nodes().unwrap();
    wrapper.parent(selector).nodes().unwrap();
    
    wrapper.nodes().each(function() {
      range.insertNode(this);
    });
    
    wrapper.remove();
    */
    
    var start = $(range.startContainer);
    var end = $(range.endContainer);
    
    start.find(selector).nodes().unwrap();
    start.parent(selector).nodes().unwrap();
    end.find(selector).nodes().unwrap();
    end.parent(selector).nodes().unwrap();
    
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    
    return this;
  },
  wrapped: function(range, selector) {
    var start = $(range.startContainer);
    var end = $(range.endContainer);
    
    return start.is(selector) || start.parent(selector).length || start.find(selector).length || end.is(selector) || end.parent(selector).length || end.find(selector).length;
  },
  toggleWrap: function(range, selector) {
    if( this.wrapped(range, selector) ) this.unwrap(range, selector);
    else this.wrap(range, selector);
    return this;
  },
  
  // alert
  prompt: function(message, callback, options) {
    if( dispatcher.fire('prompt', {
      message: message,
      callback: callback,
      options: options
    }, true) ) {
      callback && callback.call(this, prompt(message));
    }
    
    return this;
  },
  confirm: function(message, callback, options) {
    if( dispatcher.fire('prompt', {
      message: message,
      callback: callback,
      options: options
    }, true) ) {
      callback && callback.call(this, confirm(message));
    }
    
    return this;
  },
  alert: function(message, callback, options) {
    if( dispatcher.fire('alert', {
      message: message,
      callback: callback,
      options: options
    }, true) ) {
      callback && callback.call(this);
      alert(message);
    }
    
    return this;
  },
  error: function(error, callback, options) {
    if( typeof error == 'string' ) error = new Error(error);
    
    if( dispatcher.fire('error', {
      error: error,
      message: error.message,
      callback: callback,
      options: options
    }, true) ) {
      callback && callback.call(this);
      console.error(error);
      alert(error.message);
    }
    
    return this;
  }
};

dispatcher.scope(context);

var ranges = [];
$(document).on('mousedown', function(e) {
  var target = e.target || e.srcElement;
  var part = context.get(target);
  var focused = context.focused;
  
  var isToolbar = $(target).parent('.ff-toolbar')[0];
  if( isToolbar ) return;
  
  if( part ) part.focus();
  else if( focused && typeof focused.blur == 'function' ) focused.blur();
})
.on('mouseup mousedown', function(e) {
  var target = e.target || e.srcElement;
  var isToolbar = $(target).parent('.ff-toolbar')[0];
  if( isToolbar ) return;
  
  var selection = window.getSelection();
  ranges = [];
  if( selection.rangeCount ) {
    for(var i=0; i < selection.rangeCount; i++)
      ranges.push(selection.getRangeAt(i));
  }
});


module.exports = context;



/*
getRange: function(index) {
  if( !window.getSelection ) return null;
  
  var selection = window.getSelection();
  if( selection.rangeCount && selection.rangeCount > (index || 0) ) return selection.getRangeAt(index || 0);
  return null;
},
setRange: function(range) {
  if( !range || !window.getSelection ) return this;
  
  var selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  
  return this;
}
getCaretPosition: function(node) {
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
},*/

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

var Events = __webpack_require__(14);
var Types = __webpack_require__(11);
var Toolbar = __webpack_require__(5);
var $ = __webpack_require__(0);
var context = __webpack_require__(3);

function Part(arg) {
  var dom = arg;
  if( dom && dom.__ff__ ) return dom.__ff__;
  if( !(this instanceof Part) ) return null;
  
  if( !dom || !context.isElement(dom) ) dom = this.create.apply(this, arguments);
  if( !context.isElement(dom) ) throw new TypeError('illegal arguments: dom');
  
  var el = $(dom).ac('ff');
  var self = dom.__ff__ = this;
  
  var dispatcher = Events(this)
  .on('focus', function(e) {
    if( e.defaultPrevented || !this.editmode() ) return;
    
    if( this.editmode() ) el.attr('draggable', true);
    this.toolbar().show();
  })
  .on('blur', function(e) {
    if( e.defaultPrevented || !this.editmode() ) return;
    
    el.attr('draggable', null);
    this.toolbar().hide();
  })
  .on('data', function(e) {
    if( e.defaultPrevented ) return;
    
    dispatcher.fire('render', {
      type: 'data',
      originalEvent: e
    });
  })
  .on('modechange', function(e) {
    if( e.defaultPrevented ) return;
    
    var toolbar = this.toolbar();
    if( this.editmode() ) {
      if( toolbar.always() ) toolbar.show();
      el.ac('ff-edit-state');
      dispatcher.fire('editmode');
    } else {
      toolbar.hide(true);
      el.rc('ff-edit-state');
      dispatcher.fire('viewmode');
    }
    
    dispatcher.fire('render', {
      type: 'modechange',
      originalEvent: e
    });
  })
  .on('*', function(e) {
    if( e.defaultPrevented ) return;
    
    var type = e.type;
    var name = 'on' + type;
    
    if( typeof this.handleEvent == 'function' ) this.handleEvent(e);
    if( typeof this[name] == 'function' ) this[name](e);
  });
  
  el
  .on('mouseenter', function(e) {
    if( !self.editmode() ) return;
    
    self.toolbar().update();
    el.ac('ff-enter-state');
  })
  .on('mousedown mouseup', function(e) {
    if( !self.editmode() ) return;
    setTimeout(function() {
      self.toolbar().update();
    }, 0);
  })
  .on('mouseleave', function(e) {
    if( !self.editmode() ) return;
    
    el.removeClass('ff-enter-state');
  })
  .on('dragstart', function(e) {
    if( !self.editmode() ) return;
    
    var target = e.target || e.srcElement;
    if( target === dom ) {
      self.toolbar().hide();
      context.dragging = dom;
      e.dataTransfer.setData('text', target.outerHTML);
      el.ac('ff-dragging');
    }
  })
  .on('dragend', function(e) {
    var target = e.target || e.srcElement;
    if( target === dom ) {
      self.toolbar().show();
      context.dragging = null;
      el.rc('ff-dragging');
    }
  });
  
  this._d = null;
  this._n = dom;
  this._e = dispatcher;
  
  if( dom !== arg ) this.removable(true);
  if( el.attr('ff-toolbar') === 'false' ) this.toolbar().enable(false);
  
  dispatcher.fire('init');
  if( context.editmode() ) self.editmode(true);
}

Part.prototype = {
  context: function() {
    return context;
  },
  createToolbar: function() {
    return new Toolbar(this);
  },
  toolbar: function() {
    return this._t || (this._t = this.createToolbar());
  },
  removable: function(removable) {
    var toolbar = this.toolbar();
    var removebtn = toolbar.get('remove');
    if( !arguments.length ) return removebtn ? true : false;
    
    if( !removable ) toolbar.remove('remove');
    
    if( !removebtn ) toolbar.last({
      id: 'remove',
      text: '<i class="fa fa-remove"></i>',
      fn: function(e) {
        this.owner().remove();
      }
    });
    
    return this;
  },
  dom: function() {
    return this._n;
  },
  create: function(arg) {
    return $('<div/>').html(arg)[0];
  },
  remove: function() {
    this.blur();
    this.toolbar().hide();
    this.fire('remove');
    $(this.dom()).remove();
    return this;
  },
  editmode: function(b) {
    if( !arguments.length ) return !!this._md;
    var prev = this._md;
    var editmode = this._md = !!b;
  
    if( editmode !== prev ) this.fire('modechange', {editmode: editmode});
    return this;
  },
  data: function(data) {
    if( !arguments.length ) {
      if( this.getData ) return this.getData();
      return this._d;
    }
    
    if( this.setData ) this.setData(data);
    else this._d = data;
    
    this.fire('data', {old: this._d, data: data});
    return this;
  },
  fire: function() {
    this._e.fire.apply(this._e, arguments);
    return this;
  },
  on: function(type, fn) {
    this._e.on(type, fn);
    return this;
  },
  once: function(type, fn) {
    this._e.once(type, fn);
    return this;
  },
  off: function(type, fn) {
    this._e.off(type, fn);
    return this;
  },
  clear: function() {
    this.data(null);
    this.fire('clear');
    return this;
  },
  click: function() {
    this.dom().click();
    return this;
  },
  focus: function() {
    if( this.editmode() && this !== context.focused ) {
      if( context.focused && typeof context.focused.blur == 'function' ) context.focused.blur();
      $(this.dom()).ac('ff-focus-state');
      this.fire('focus');
      context.focused = this;
    }
    return this;
  },
  blur: function() {
    if( this.editmode() && this === context.focused ) {
      $(this.dom()).rc('ff-focus-state');
      this.fire('blur');
      context.focused = null;
    }
    return this;
  },
  ranges: function() {
    return context.ranges(this.dom());
  },
  range: function() {
    return context.range(this.dom());
  }
};

module.exports = Part;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

var Toolbar = __webpack_require__(28);

Toolbar.Button = __webpack_require__(7);
Toolbar.Separator = __webpack_require__(10);
Toolbar.ListButton = __webpack_require__(9);

module.exports = Toolbar;

/***/ }),
/* 6 */
/***/ (function(module, exports) {

function Items() {}

var proto = Items.prototype = [];

proto.add = function(item) {
  this.push(item);
  return this;
};

proto.remove = function(item) {
  for(var pos;~(pos = this.indexOf(item));) this.splice(pos, 1);
  return this;
};

module.exports = Items;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

var $ = __webpack_require__(0);

__webpack_require__(49);

function Button(options) {
  if( typeof options == 'string' ) options = {text:options};
  
  var self = this;
  self.options(options);
  self.owner(options.owner);
  
  self._el = $('<div class="ff-toolbar-btn"></div>')
  .ac(options.cls)
  .on('click', this);
  
  this.text(options.text);
}

Button.prototype = {
  handleEvent: function(e) {
    if( e.type == 'click' ) {
      e.stopPropagation();
      this.click(e);
      this.update(e);
    }
  },
  options: function(options) {
    if( !arguments.length ) return this._options = this._options || {};
    this._options = options || {};
    this.id = this._options.id;
    return this;
  },
  dom: function() {
    return this._el[0];
  },
  owner: function(owner) {
    if( !arguments.length ) return this._owner;
    this._owner = owner;
    return this;
  },
  cls: function(cls) {
    this._el.cc().ac('ff-toolbar-btn').ac(cls);
    return this;
  },
  active: function(b) {
    if( !arguments.length ) return this._el.hc('ff-toolbar-btn-active');
    this._el.tc('ff-toolbar-btn-active', b);
    return this;
  },
  hide: function() {
    this._el.hide();
    return this;
  },
  show: function() {
    this._el.show();
    return this;
  },
  enable: function(b) {
    if( !arguments.length ) return !this._el.hc('ff-toolbar-btn-disabled');
    this._el.tc('ff-toolbar-btn-disabled', !b);
    return this;
  },
  update: function(e) {
    var o = this.options();
    var fn = o.onupdate;
    fn && fn.call(this, e);
    return this;
  },
  click: function(e) {
    var o = this.options();
    var fn = o.onclick || o.fn;
    fn && fn.call(this, e);
    return this;
  },
  text: function(text) {
    if( !arguments.length ) return this._el.html();
    this._el.html(text);
    return this;
  },
  appendTo: function(parent, index) {
    $(parent).append(this._el[0], index);
    return this;
  },
  remove: function() {
    this._el.remove();
    return this;
  }
};

module.exports = Button;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

var $ = __webpack_require__(0);
var Part = __webpack_require__(4);
var buildtoolbar = __webpack_require__(33);

__webpack_require__(55);

function ParagraphPart() {
  Part.apply(this, arguments);
}

var proto = ParagraphPart.prototype = Object.create(Part.prototype);
ParagraphPart.matches = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'p', 'blockquote'];

proto.oninit = function(e) {
  var part = this;
  var dom = part.dom();
  var el = $(dom).ac('ff-paragraph')
  .on('dragstart', function(e) {
    if( !part.editmode() || el.ha('draggable') ) return;
    
    e.stopPropagation();
    e.preventDefault();
  })
  .on('paste', function(e) {
    e.preventDefault();
    
    var clipboard = e.clipboardData || window.clipboardData;
    var text = clipboard.getData('Text');
    this.innerText = text.split('\n').join(' ');
  })
  .on('keydown', function(e) {
    if( e.keyCode === 13 && !part.multiline() ) e.preventDefault();
  })
  .on('dragend', function(e) {
    part.dragmode(false);
    part.toolbar().update();
  });
  
  buildtoolbar(this);
  
  var placeholder = part._placeholder = (function() {
    var node = $('<div class="ff-placeholder ff-acc"/>'), text, minWidthWrited = false;
    
    return {
      text: function(o) {
        if( !arguments.length ) return text;
        text = o;
        node.html(text);
        return this;
      },
      show: function() {
        if( !part.editmode() ) {
          this.hide();
          return this;
        }
        
        el.attr('contenteditable', null);
        node.html(text).remove();
        var t = el.text().split('\n').join().trim();
        
        if( !t ) el.empty().append(node);
        
        var display = window.getComputedStyle(dom, null).display;
        if( ~['inline', 'inline-block'].indexOf(display) && node[0].clientWidth ) {
          dom.style.minWidth = node[0].clientWidth + 'px';
          minWidthWrited = true;
        }
        
        return this;
      },
      hide: function() {
        if( part.editmode() ) el.attr('contenteditable', true);
        else if( minWidthWrited ) dom.style.minWidth = '';
        
        node.remove();
        return this;
      }
    };
  })();
  
  placeholder.text(el.attr('placeholder') || ParagraphPart.placeholder || this.context().placeholder);
};

proto.multiline = function(b) {
  if( !('_multiline' in this) ) {
    this._multiline = $(this.dom()).attr('ff-multiline') == 'false' ? false : true;
  }
  
  if( !arguments.length ) return this._multiline;
  
  el.attr('ff-multiline', b === false ? false : null);
  this._multiline = !!b;
  return this;
};

proto.dragmode = function(b) {
  var el = $(this.dom());
  if( !arguments.length ) return el.ha('draggable');
  
  if( !this.editmode() ) return this;
  el.attr('draggable', b ? true : null).attr('contenteditable', b ? null : true);
  return this;
};

proto.onchildlist = function() {
  if( this.editmode() ) this.placeholder().show();
};

proto.text = function(text) {
  var el = $(this.dom());
  if( !arguments.length ) {
    var editmode = this.editmode();
    this.editmode(false);
    var text = el.text().split('\n').join().trim();
    this.editmode(editmode);
    return text;
  }
  
  el.text($('<div/>').html(text).text());
  return this;
};

proto.html = function(html) {
  var el = $(this.dom());
  if( !arguments.length ) {
    var editmode = this.editmode();
    this.editmode(false);
    var html = el.html();
    this.editmode(editmode);
    return html;
  }
  
  el.html(html);
  return this;
};

proto.onfocus = function(e) {
  if( !this.editmode() ) return;
  
  e.stopImmediatePropagation();
  
  this.toolbar().show();
  this.placeholder().hide();
  $(this.dom()).attr('draggable', null);
  
  var el = this.dom();
  var selection = window.getSelection();
  var range = selection.rangeCount && selection.getRangeAt(0);
  
  if( !range || !(el.contains(range.startContainer) && el.contains(range.endContainer))
   || el === range.startContainer
   || el === range.endContainer ) {
    selection.removeAllRanges();
    setTimeout(function() {
      el.focus();
      el.click();
    }, 10);
  }
};

proto.onblur = function() {
  if( this.editmode() )
    this.placeholder().show();
};

proto.oneditmode = function(e) {
  $(this.dom()).attr('contenteditable', true).attr('draggable', null);
  this.placeholder().show();
};

proto.onviewmode = function(e) {
  $(this.dom()).attr('contenteditable', null).attr('draggable', null);
  this.placeholder().hide();
};

proto.create = function(arg) {
  var html = typeof arg == 'string' ? arg : '';
  return $('<div/>').html(html)[0];
};

proto.placeholder = function(placeholder) {
  if( !arguments.length ) return this._placeholder;
  this._placeholder.text(placeholder);
  return this;
};

proto.getData = function() {
  this.placeholder().hide();
  var html = this.dom().innerHTML;
  if( this.editmode() ) this.placeholder().show();
  
  return {
    html: html
  };
};

proto.setData = function(data) {
  var html = (!data || typeof data == 'string') ? data : data.html;
  this.html(html);
  this.placeholder().show();
  return this;
};

module.exports = ParagraphPart;




/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

var $ = __webpack_require__(0);
var Button = __webpack_require__(7);

function ListButton() {
  Button.apply(this, arguments);
  
  this._el.ac('ff-toolbar-list-btn');
}

ListButton.prototype = Object.create(Button.prototype, {
  handleEvent: {
    value: function(e) {
      if( e.type == 'click' ) {
        e.stopPropagation();
        this.click(e);
        this.toggleList();
        this.update(e);
      }
    }
  },
  toggleList: {
    value: function() {
      console.log('toggle');
    }
  },
  text: {
    value: function(txt) {
      this._el.html(txt);
      return this;
    }
  }
});

module.exports = ListButton;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

var $ = __webpack_require__(0);

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

/***/ }),
/* 11 */
/***/ (function(module, exports) {

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

/***/ }),
/* 12 */
/***/ (function(module, exports) {

module.exports = function(el) {
  var top = 0;
  do {
    if( !isNaN( el.offsetTop ) ) top += el.offsetTop;
  } while( el = el.offsetParent );
  return top;
};

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

var $ = __webpack_require__(0);
var context = __webpack_require__(3);
var Items = __webpack_require__(6);

module.exports = new Items()
.add({
  text: '<i class="fa fa-font"></i>',
  tooltip: '문단',
  fn: function(e) {
    var placeholder = $(this.owner().dom()).attr('placeholder');
    this.owner().insert(new context.Paragraph().placeholder(placeholder));
  }
})
.add({
  text: '<i class="fa fa-picture-o"></i>',
  tooltip: '이미지 파일',
  fn: function(e) {
    var part = this.owner();
    part.context().selectFiles(function(err, files) {
      if( err ) return context.error(err);
      if( !files.length ) return;
      
      if( files.length === 1 ) {
        part.insert(new context.Image(files[0]));
      } else {
        var row = new context.Row();
        files.forEach(function(file) {
          row.add(new context.Image(file));
        });
        part.insert(row);
      }
    });
  }
})
.add({
  text: '<i class="fa fa-instagram"></i>',
  tooltip: '이미지',
  fn: function(e) {
    var part = this.owner();
    
    context.prompt('Please enter the image URL.', function(src) {
      src && part.insert(new context.Image(src));
    });
  }
})
.add({
  text: '<i class="fa fa-youtube-square"></i>',
  tooltip: '동영상',
  fn: function(e) {
    var part = this.owner();
    
    context.prompt('Please enter the video URL', function(src) {
      src && part.insert(new context.Video(src));
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
      if( err ) return context.error(err);
      
      part.insert(new context.File(file));
    });
  }
});


/***/ }),
/* 14 */
/***/ (function(module, exports) {

function EventObject(type, detail, target, cancelable) {
  this.type = type;
  this.detail = detail || {};
  this.target = this.currentTarget = target;
  this.cancelable = cancelable === true ? true : false;
  this.defaultPrevented = false;
  this.stopped = false;
  this.stoppedImmediate = false;
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
  
  var fire = function(type, detail, cancellable) {
    if( paused ) return false;
    
    var event;
    if( typeof type === 'string' ) {
      event = EventObject.createEvent(type, detail, scope, cancellable);
    } else if( type instanceof window.Event ) {
      event = type;
    } else if( type instanceof EventObject ) {
      event = type;
    } else {
      return console.error('type must be a string or Event but,', type);
    }
    event.currentTarget = scope;
    
    var stopped = false;
    var action = function(listener) {
      if( stopped || event.stoppedImmediate ) return stopped = true;
      if( listener.call(scope, event) === false ) event.preventDefault();
    };
    
    (listeners['*'] || []).slice().reverse().forEach(action);
    (listeners[event.type] || []).slice().reverse().forEach(action);
    
    return !event.defaultPrevented;
  };
  
  return {
    handleEvent: function(e) {
      return fire(e);
    },
    scope: function(o) {
      if( !arguments.length ) return scope;
      scope = o;
    },
    on: on,
    once: once,
    off: off,
    fire: fire,
    has: has,
    destroy: function() {
      listeners = null;
      return this;
    },
    pause: function() {
      paused = true;
      return this;
    },
    resume: function() {
      paused = false;
      return this;
    }
  };
};

/***/ }),
/* 15 */
/***/ (function(module, exports) {

var matches = Element.prototype.matches || 
  Element.prototype.matchesSelector || 
  Element.prototype.mozMatchesSelector ||
  Element.prototype.msMatchesSelector || 
  Element.prototype.oMatchesSelector || 
  Element.prototype.webkitMatchesSelector ||
  function(s) {
      var matches = (this.document || this.ownerDocument).querySelectorAll(s),
          i = matches.length;
      while (--i >= 0 && matches.item(i) !== this) {}
      return i > -1;
  };

module.exports = {
  isNull: function(value) {
    return value === null || value === undefined;
  },
  isArrayLike: function(o) {
    if( !o || typeof o != 'object' || o === window || typeof o.length != 'number' ) return false;
    if( o instanceof Array || (Array.isArray && Array.isArray(o)) ) return true;
    
    var type = Object.prototype.toString.call(o);
    return /^\[object (HTMLCollection|NodeList|Array|FileList|Arguments)\]$/.test(type);
  },
  create: function(html) {
    if( !html || typeof html != 'string' ) return null;
    var div = document.createElement('div');
    div.innerHTML = html.trim();
    
    var arr = [];
    [].forEach.call(div.childNodes, function(node) {
      var p = node.parentNode;
      p && p.removeChild(node);
      arr.push(node);
    });
    
    return arr;
  },
  accessor: function(el) {
    var tag = el.tagName.toLowerCase();
    var id = el.id;
    var cls = el.className.split(' ').join('.');
    id = id ? ('#' + id) : '';
    cls = cls ? ('.' + cls) : '';
    
    return tag + id + cls;
  },
  assemble: function(selector) {
    if( !selector || typeof(selector) !== 'string' ) return console.error('invalid selector', selector);
    
    var arr = selector.split(':');
    var accessor = arr[0];
    var pseudo = arr[1];
    
    arr = accessor.split('.');
    var tag = arr[0];
    var id;
    var classes = arr.splice(1).join(' ').trim();
    
    if( ~tag.indexOf('#') ) {
      var t = tag.split('#');
      tag = t[0];
      id = t[1];
    }
    
    return {
      selector: selector,
      accessor: accessor,
      tag: tag && tag.toLowerCase() || '',
      id: id || '',
      classes: classes || '',
      pseudo: pseudo || ''
    };
  },
  isHTML: function(html) {
    return (typeof html === 'string' && html.match(/(<([^>]+)>)/ig) ) ? true : false;
  },
  matches: function(el, selector) {
    try {
      if( typeof selector == 'function' )
        return !!selector.call(el);
      
      return !!(el && matches.call(el, selector));
    } catch(e) {
      return false;
    }
  },
  each: function(arr, fn) {
    var i = 0;
    [].every.call(arr, function(el) {
      i = i + 1;
      if( !el ) return true;
      return ( fn && fn.apply(el, [i, el]) === false ) ? false : true;
    });
    return arr;
  },
  offset: function(el, abs) {
    if( !el || typeof el.offsetTop != 'number' ) return {top:null,left:null};
    
    var top = el.offsetTop, left = el.offsetLeft;
    if( abs ) {
      while( el = el.offsetParent ) {
        top += el.offsetTop;
        left += el.offsetLeft;
      }
    }
    
    return {
      top: top,
      left: left
    };
  },
  isElement: function(o) {
    return (
      typeof HTMLElement === 'object' ? o instanceof HTMLElement : 
      o && typeof o === 'object' && o.nodeType === 1 && typeof o.nodeName === 'string'
    );
  },
  isNode: function(o) {
    return (
      typeof Node === "object" ? o instanceof Node : 
      o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string"
    );
  },
  computed: function(el, name) {
    return window.getComputedStyle(el, null);
  },
  number: function(o) {
    if( !o || typeof o == 'number' ) return o;
    
    o = o + '';
    (['px', 'em', 'pt', '%', 'in', 'deg'].every(function(c) {
      if( o.endsWith(c) ) {
        o = o.split(c).join('');
        return false;
      }
      return true;
    }));
    return +o;
  }
};

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

var $ = __webpack_require__(0);
var context = __webpack_require__(3);
var Part = context.Part;
var Toolbar = context.Toolbar;
var Marker = __webpack_require__(31);
var DnD = __webpack_require__(30);

__webpack_require__(50);

function ArticlePart() {
  Part.apply(this, arguments);
}

var items = ArticlePart.toolbar = __webpack_require__(13);
var proto = ArticlePart.prototype = Object.create(Part.prototype);

proto.createToolbar = function() {
  return new Toolbar(this).position(items.position || 'vertical top right outside')
  .add({
    text: '<i class="fa fa-eraser"></i>',
    tooltip: '내용 삭제',
    fn: function(e) {
      this.owner().clear();
    }
  }, 0)
  .add(items)
  .always(true);
};

proto.oninit = function(e) {
  $(this.dom()).ac('ff-article')
  .on('click', function(e) {
    var target = e.target || e.srcElement;
    if( this.editmode() && target === this.viewport() ) {
      this.validate();
      
      var children = this.children();
      if( children.length ) {
        var p = Part(children[children.length - 1]);
        p && p.focus();
      }
    }
  }.bind(this));
  
  this.scan();
};

proto.scan = function() {
  var viewport = $(this.viewport());
  var editmode = this.editmode();
  
  context.scan();
  
  viewport.find('img').each(function() {
    if( $(this).hc('ff-acc') ) return;
    if( !this.__ff__) new context.Image(this);
  });
  
  viewport.find('p h1 h2 h3 h4 h5 h6 blockquote').each(function() {
    if( $(this).hc('ff-acc') ) return;
    if( !this.__ff__) new context.Paragraph(this);
  });
  
  viewport.find('hr').each(function() {
    if( $(this).hc('ff-acc') ) return;
    if( !this.__ff__) new context.Separator(this);
  });
  
  viewport.children().each(function() {
    if( $(this).hc('ff-acc') ) return;
    if( !this.__ff__ ) new context.Paragraph(this);
  });
  
  var placeholder = $(this.dom()).attr('placeholder');
  viewport.find('.ff').each(function() {
    var part = Part(this);
    if( part ) {
      part.removable(true);
      if( part.editmode() !== editmode ) part.editmode(editmode);
      if( part instanceof context.Paragraph ) part.placeholder(placeholder);
    }
  });
};

proto.validate = function() {
  var dom = this.dom();
  var el = $(dom);
  var editmode = this.editmode();
  
  if( this.editmode() ) {
    var marker = this.marker();
    var viewport = el.children('.f_article_view');
    if( !viewport.length ) {
      viewport = $('<div class="f_article_view"/>');
      
      el.nodes().each(function() {
        viewport.append(this);
      });
    
      el.append(viewport);
      this._viewport = viewport[0];
      
      if( this._mk ) this._mk.destroy();
      if( this._dnd ) this._dnd.destroy();
      this._mk = Marker(this, viewport[0]);
      this._dnd = DnD(this, viewport[0]);
    }
    
    if( !this.children().length ) {
      this.insert(new context.Paragraph());
    }
  } else {
    var viewport = el.children('.f_article_view');
    if( viewport.length ) {
      el.empty();
      $(this._viewport).nodes().each(function() {
        el.append(this);
      });
    }
    
    this._mk && this._mk.destroy();
    this._dnd && this._dnd.destroy();
    delete this._mk;
    delete this._dnd;
    delete this._viewport;
  }
  
  this.scan();
  
  return this;
};

proto.onmodechange = function(e) {
  this.validate();
};

proto.marker = function() {
  return this._mk;
};

proto.oninsert = function() {
  this.validate();
};

proto.clear = function() {
  this.viewport().innerHTML = '';
  return this;
};

proto.get = function(index) {
  return this.children()[index];
};

proto.find = function(selector) {
  return $(this.dom()).find(selector);
};

proto.indexOf = function(node) {
  if( !node ) return -1;
  node = node.dom() || node;
  return $(this.viewport()).indexOf(node);
};

proto.children = function() {
  return $(this.viewport()).children().filter(function() {
    return !($(this).hc('ff-marker') || $(this).hc('ff-placeholder'));
  });
};

proto.viewport = function() {
  return this._viewport || this.dom();
};

proto.html = function(html) {
  if( !arguments.length ) {
    var editmode = this.editmode();
    this.editmode(false);
    var html = this.dom().innerHTML;
    this.editmode(editmode);
    return html;
  }
  
  this.viewport().innerHTML = html || '';
  this.validate();
  return this;
};

proto.insert = function(node, ref) {
  var context = this.context();
  var part = this;
  var target = $(this.viewport());
  var marker = this.marker();
  var children = this.children();
  
  if( arguments.length <= 1 && marker.isExpanded() ) {
    ref = marker.getRef();
    marker.collapse();
  } else if( typeof ref == 'number' ) {
    ref = children[ref];
  }
  
  var insert = function(node, ref) {
    if( ref ) ref.parentNode && ref.parentNode.insertBefore(node, ref);
    else target.append(node);
  }
  
  var images = [];
  $(node).reverse().async(function(item, done) {
    var el = (item.dom && item.dom()) || item;
      
    if( window.File && item instanceof File ) {
      var type = item.type;
      
      if( type ) {
        return context.upload(item, function(err, result) {
          if( err ) return done(err);
          
          if( type.indexOf('image/') === 0 )
            images.push(new context.Image(result));
          else
            insert(new context.File(result).dom(), ref);
          
          done();
        });
      }
    } else {
      insert(el, ref);
    }
    
    done();
  }, function(err) {
    if( err ) return context.error(err);
    
    if( images.length === 1 ) {
      insert(images[0].dom(), ref);
    } else if( images.length ) {
      var row = new context.Row();
      images.reverse().forEach(function(image) {
        row.add(image);
      });
      
      insert(row.dom(), ref);
    }
    
    part.fire('insert', {
      node: node,
      ref: ref,
      target: target
    });
  });
  
  return this;
};

proto.getData = function() {
  return {
    html: this.html()
  };
};

proto.setData = function(data) {
  this.html(data && data.html);
  return this;
};


ArticlePart.Marker = Marker;
ArticlePart.DnD = DnD;

module.exports = ArticlePart;

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

var $ = __webpack_require__(0);
var Part = __webpack_require__(4);

__webpack_require__(53);

function FilePart() {
  Part.apply(this, arguments);
  
  var el = $(this.dom()).ac('ff-file');
  
  this.toolbar()
  .add({
    text: '<i class="fa fa-align-justify"></i>',
    tooltip: '정렬',
    onupdate: function() {
      var btn = this;
      if( btn.align == 'center' ) btn.text('<i class="fa fa-align-center"></i>');
      else if( btn.align == 'right' ) btn.text('<i class="fa fa-align-right"></i>');
      else if( btn.align == 'left' ) btn.text('<i class="fa fa-align-left"></i>');
      else btn.text('<i class="fa fa-align-justify"></i>');
    },
    fn: function(e) {
      var btn = this;
      if( btn.align == 'center' ) {
        el.css('text-align', 'right');
        btn.align = 'right';
      } else if( btn.align == 'right' ) {
        el.css('text-align', 'left');
        btn.align = 'left';
      } else if( btn.align == 'left' ) {
        el.css('text-align', '');
        btn.align = '';
      } else {
        el.css('text-align', 'center');
        btn.align = 'center';
      }
    }
  });
}

var proto = FilePart.prototype = Object.create(Part.prototype);

proto.create = function(arg) {
  var def = FilePart.defaultLabel;
  var href = arg && (arg.src || arg.href);
  var label = arg && (arg.name || arg.title || arg.label) || def;
  
  if( typeof href !== 'string' ) href = null;
  if( typeof label !== 'string' ) label = def;
  if( !href.indexOf('data:') ) href = '';
  
  return $('<div ff-type="file"/>').append($('<a href="' + (href || 'javascript:;') + '" target="_blank"/>"').html(label))[0];
};

proto.target = function(target) {
  if( !arguments.length ) return $(this.dom()).find('a').attr('target');
  $(this.dom()).find('a').attr('target', target);
  return this;
};

proto.href = function(href) {
  if( !arguments.length ) return $(this.dom()).find('a').attr('href');
  $(this.dom()).find('a').attr('href', href);
  return this;
};

FilePart.defaultLabel = 'Download';

module.exports = FilePart;

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

var $ = __webpack_require__(0);
var context = __webpack_require__(3);
var Part = __webpack_require__(4);
var Toolbar = __webpack_require__(5);

__webpack_require__(54);

function translatesrc(src) {
  if( src && ~src.indexOf('instagram.com') ) {
    var vid = src.split('//')[1];
    vid = vid && vid.split('/p/')[1];
    vid = vid && vid.split('/')[0];
    
    if( vid ) src = 'https://www.instagram.com/p/' + vid + '/media';
  }
  
  return src;
}

function ImagePart(el) {
  Part.apply(this, arguments);
}

var items = ImagePart.toolbar = __webpack_require__(32);
var proto = ImagePart.prototype = Object.create(Part.prototype);
ImagePart.matches = ['img'];

proto.createToolbar = function() {
  return new Toolbar(this).position(items.position || 'inside top center').add(items);
};

proto.oninit = function() {
  var self = this;
  var dom = this.dom();
  var el = $(dom).ac('ff-image')
  .on('click', function(e) {
    if( !self.editmode() ) context.fire('imageshow', {
      originalEvent: e,
      image: dom,
      src: dom.src,
      part: self
    });
  })
  .on('dragend', function(e) {
    if( self.editmode() && !$(self.dom()).parent().hc('f_img_wrap') )
      self.floating(false);
  })
  .on('drop', function(e) {
    //console.log('drop', e);
  });
};

proto.create = function(arg) {
  var src;
  var title;
  
  if( typeof arg === 'object' ) {
    src = arg.src;
    title = arg.name || arg.title;
  } else {
    src = arg;
  }
  
  return $('<img/>')
  .ac('f_img_block')
  .attr('title', title)
  .src(translatesrc(src))[0];
};

proto.src = function(src) {
  if( !arguments.length ) return this.dom().src;
  
  src = translatesrc(src);
  if( src ) this.dom().src = src;
  
  return this;
};

proto.title = function(title) {
  var el = $(this.dom());
  if( !arguments.length ) return el.attr('title');
  el.attr('title', title);
  return this;
};

proto.floating = function(direction) {
  var el = $(this.dom());
  if( !arguments.length ) return el.hc('f_img_left') ? 'left' : el.hc('f_img_right') ? 'right' : false;
  
  var ctx = this.context();
  var paragraph = Part(el[0].nextSibling);
  var parent = el.parent();
  
  if( parent.hc('f_img_wrap') ) parent.nodes().unwrap();
  
  if( !(paragraph instanceof ctx.Paragraph) )
    paragraph = new ctx.Paragraph();
  
  if( direction === 'left' ) {
    el
    .rc('f_img_right')
    .ac('f_img_left')
    .wrap('<div class="f_img_wrap ff-acc" />')
    .parent()
    .on('click', function(e) {
      var target = e.target || e.srcElement;
      if( target !== el[0] ) paragraph.focus();
    })
    .append(paragraph.dom());
  } else if( direction === 'right' ) {
    el
    .rc('f_img_left')
    .ac('f_img_right')
    .wrap('<div class="f_img_wrap ff-acc" />')
    .parent()
    .on('click', function(e) {
      var target = e.target || e.srcElement;
      if( target !== el[0] ) paragraph.focus();
    })
    .append(paragraph.dom());
  } else {
    el
    .rc('f_img_right')
    .rc('f_img_left');
  }
};

proto.blockmode = function(mode) {
  var el = $(this.dom());
  if( !arguments.length ) return el.hc('f_img_block') ? 'natural' : 
    el.hc('f_img_full') ? 'full' : 
    el.hc('f_img_medium') ? 'medium' : false;
  
  el.rc('f_img_block f_img_medium f_img_full')
  if( mode == 'natural' ) el.ac('f_img_block');
  else if( mode == 'medium') el.ac('f_img_medium');
  else if( mode == 'full') el.ac('f_img_full');
  
  return this;
};

module.exports = ImagePart;



/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

var $ = __webpack_require__(0);
var context = __webpack_require__(3);
var Part = __webpack_require__(4);
var Toolbar = __webpack_require__(5);

__webpack_require__(56);

function RowPart(el) {
  Part.call(this, el);
}

var items = RowPart.toolbar = __webpack_require__(34);
var proto = RowPart.prototype = Object.create(Part.prototype);

proto.createToolbar = function() {
  return new Toolbar(this).position(items.position).add(items);
};

proto.create = function(arg) {
  var el = $('<div ff-type="row" />')[0];
  this.add(arg);
  return el;
};

proto.oninit = function() {
  var part = this;
  var dom = part.dom();
  $(dom)
  .ac('ff-row')
  .on('drop', function(e) {
    e.stopPropagation();
    e.preventDefault();
    
    var target = e.target || e.srcElement;
    var dragging = part.context().dragging;
    var ref; // TODO
    
    if( dragging ) {
      if( target === dragging || dragging.contains(target) ) return;
      part.add(dragging, ref);
    } else if( e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length ) {
      $(e.dataTransfer.files).each(function() {
        var type = this.type;
        if( type ) {
          context.upload(this, function(err, result) {
            if( type.indexOf('image/') === 0 )
              part.add(new context.Image(result), ref);
          });
        }
      });
    }
  });
};

proto.oneditmode = function() {
  if( window.MutationObserver ) {
    var part = this;
    var observer = this._observer = new MutationObserver(function(mutations){
      part.validate();
    });
    
    observer.observe(this.dom(), {
      childList: true,
      subtree: true
    });
  }
};

proto.onviewmode = function() {
  var observer = this._observer;
  if( observer ) {
    observer.disconnect();
    delete this._observer;
  }
};

proto.validate = function() {
  var el = $(this.dom())
  
  el.find('.f_row_cell').each(function() {
    if( !this.children.length ) this.parentNode.removeChild(this);
  });
  
  var cells = el.children('.f_row_cell');
  var cellwidth = 100 / cells.length;
  cells.each(function() {
    $(this).css('width', cellwidth + '%');
  });
  
  return this;
};

proto.add = function(arg, ref) {
  var dom = this.dom();
  
  $(arg).each(function(i, item) {
    var cell = $('<div class="f_row_cell" />')
    .append(function() {
      return (item && item.dom && item.dom()) || item;
    })
    
    if( ref ) cell.insertBefore(ref);
    else cell.appendTo(dom);
  });
  
  this.validate();
  
  return this;
};

proto.valign = function(align) {
  var el = $(this.dom());
  if( !arguments.length ) return el.hc('f_row_middle') ? 'middle' : 
    el.hc('f_row_bottom') ? 'bottom' : 'top';
  
  el.rc('f_row_middle f_row_bottom');
  
  if( align == 'middle') el.ac('f_row_middle');
  else if( align == 'bottom' ) el.ac('f_row_bottom');
  
  return this;
};

module.exports = RowPart;



/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

var $ = __webpack_require__(0);
var Part = __webpack_require__(4);

__webpack_require__(57);

function Separator() {
  Part.apply(this, arguments);
  
  var el = $(this.dom()).ac('ff-separator');
  
  this.toolbar().add({
    text: '<i class="fa fa-chevron-up"></i>',
    tooltip: '모양',
    onupdate: function() {
      var btn = this;
      if( el.hc('ff-separator-dotted') ) btn.text('<i class="fa fa-ellipsis-h"></i>');
      else if( el.hc('ff-separator-dashed') ) btn.text('<i class="fa fa-ellipsis-h"></i>');
      else if( el.hc('ff-separator-zigzag') ) btn.text('<i class="fa fa-chevron-up"></i>');
      else btn.text('<i class="fa fa-minus"></i>');
    },
    fn: function(e) {
      if( el.hc('ff-separator-dotted') ) {
        el.rc('ff-separator-dotted').ac('ff-separator-dashed');
      } else if( el.hc('ff-separator-dashed') ) {
        el.rc('ff-separator-dashed').ac('ff-separator-zigzag');
      } else if( el.hc('ff-separator-zigzag') ) {
        el.rc('ff-separator-zigzag');
      } else {
        el.ac('ff-separator-dotted');
      }
    }
  })
  .add({
    text: '<i class="fa fa-arrows-h"></i>',
    tooltip: '너비',
    onupdate: function() {
      var btn = this;
      if( el.hc('ff-separator-narrow') ) btn.text('<i class="fa fa-minus"></i>');
      else btn.text('<i class="fa fa-arrows-h"></i>');
    },
    fn: function(e) {
      el.tc('ff-separator-narrow');
    }
  });
}

Separator.prototype = Object.create(Part.prototype, {
  create: {
    value: function(arg) {
      return $('<hr/>')[0];
    }
  }
});

module.exports = Separator;

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

var $ = __webpack_require__(0);
var ParagraphPart = __webpack_require__(8);

function TextPart() {
  ParagraphPart.apply(this, arguments);
  this.toolbar().enable(false);
}

var proto = TextPart.prototype = Object.create(ParagraphPart.prototype);

proto.create = function(arg) {
  var html = typeof arg == 'string' ? arg : '';
  return $('<span/>').html(html)[0];
};

proto.html = ParagraphPart.prototype.text;

proto.multiline = function() {
  if( !arguments.length ) return false;
  return this;
};

module.exports = TextPart;

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

var $ = __webpack_require__(0);
var context = __webpack_require__(3);
var Part = __webpack_require__(4);
var Toolbar = __webpack_require__(5);

__webpack_require__(58);

function translatesrc(src) {
  if( ~src.indexOf('youtube.com') ) {
    var vid = src.split('v=')[1];
    vid = vid && vid.split('&')[0];
    vid = vid && vid.split('#')[0];
    
    if( vid ) src = 'https://www.youtube.com/embed/' + vid;
  } else if( ~src.indexOf('vimeo.com') ) {
    var vid = src.split('//')[1];
    vid = vid && vid.split('/')[1];
    vid = vid && vid.split('?')[0];
    vid = vid && vid.split('&')[0];
    vid = vid && vid.split('#')[0];
    
    if( vid ) src = 'https://player.vimeo.com/video/' + vid;
  }
  
  return src;
}

function VideoPart() {
  Part.apply(this, arguments);
}

var items = VideoPart.toolbar = __webpack_require__(35);
var proto = VideoPart.prototype = Object.create(Part.prototype);

proto.createToolbar = function() {
  return new Toolbar(this).position(items.position).add(items);
};

proto.create = function(arg) {
  var src = translatesrc((arg && arg.src) || arg) || 'about:blank';
  
  return $('<div ff-type="video" />').ac('f_video_16by9').html('<div class="f_video_container"><iframe src="' + src + '" frameborder="0" nwebkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div>')[0];
};

proto.src = function(src) {
  var el = $(this.dom());
  if( !arguments.length ) return el.find('iframe').src;
  
  src = translatesrc(src) || 'about:blank';
  if( src ) el.find('iframe').src = src;
  
  return this;
};

proto.oninit = function() {
  $(this.dom()).ac('ff-video');
};

proto.onmodechange = function() {
  var el = $(this.dom());
  if( this.editmode() ) {
    if( !el.find('.ff-mask').length ) $('<div class="ff-mask"></div>').appendTo(el[0]);
    el.find('.ff-mask').show();
  } else {
    el.find('.ff-mask').hide();
  }
};

module.exports = VideoPart;



/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(36);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(2)(content, {});
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

/***/ }),
/* 24 */
/***/ (function(module, exports) {

var endpoint;

module.exports = {
  endpoint: function(url) {
    endpoint = url;
  },
  load: function(url, done) {
    done();
  }
}

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

var ctx = __webpack_require__(3);
var Toolbar = __webpack_require__(5);
var Part = __webpack_require__(4);
var Items = __webpack_require__(6);

__webpack_require__(23);

ctx.Part = Part;
ctx.Toolbar = Toolbar;
ctx.Items = Items;

var ArticlePart = __webpack_require__(16);
var ParagraphPart = __webpack_require__(8);
var SeparatorPart = __webpack_require__(20);
var ImagePart = __webpack_require__(18);
var VideoPart = __webpack_require__(22);
var RowPart = __webpack_require__(19);
var FilePart = __webpack_require__(17);
var TextPart = __webpack_require__(21);

ctx.Article = ArticlePart;
ctx.Paragraph = ParagraphPart;
ctx.Separator = SeparatorPart;
ctx.Image = ImagePart;
ctx.Video = VideoPart;
ctx.Row = RowPart;
ctx.File = FilePart;
ctx.Text = TextPart;

ctx.type('default', ParagraphPart);
ctx.type('article', ArticlePart);
ctx.type('paragraph', ParagraphPart);
ctx.type('text', TextPart);
ctx.type('separator', SeparatorPart);
ctx.type('image', ImagePart);
ctx.type('video', VideoPart);
ctx.type('row', RowPart);
ctx.type('file', FilePart);

(function() {
  var readyfn;
  
  document.addEventListener('DOMContentLoaded', function() {
    ctx.scan();
    readyfn && readyfn();
  });

  ctx.ready = function(fn) {
    if( document.body ) fn();
    else readyfn = fn;
  };
})();

module.exports = ctx;


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

var $ = __webpack_require__(0);
var Button = __webpack_require__(29);

function Buttons(toolbar) {
  this._toolbar = toolbar;
  this._el = $(toolbar.dom());
  this._first = [];
  this._buttons = [];
  this._last = [];
}

Buttons.prototype = {
  toolbar: function() {
    return this._toolbar;
  },
  update: function() {
    var el = this._el[0];
    var list = this._list = [];
    var append = function(btns) {
      btns.forEach(function(btn) {
        btn.appendTo(el).update();
        list.push(btn);
        if( btn.id ) list[btn.id] = btn;
      });
    };
    
    append(this._first);
    append(this._buttons);
    append(this._last);
    return this;
  },
  get: function(id) {
    return this._list && this._list[id];
  },
  add: function(btn, index) {
    if( !btn ) return this;
    
    var owner = this._toolbar.owner();
    var btns = this._buttons;
    
    $(btn).each(function() {
      var btn = Button.eval(this).owner(owner);
      if( !btn ) return;
      
      if( index >= 0 ) btns.splice(index++, 0, btn);
      else btns.push(btn);
    });
    
    this.update();
    return this;
  },
  first: function(btn, index) {
    if( !btn ) return this;
    
    var owner = this._toolbar.owner();
    var btns = this._first;
    
    $(btn).each(function() {
      var btn = Button.eval(this).owner(owner);
      if( !btn ) return;
      
      if( index >= 0 ) btns.splice(index++, 0, btn);
      else btns.push(btn);
    });
    
    this.update();
    return this;
  },
  last: function(btn, index) {
    if( !btn ) return this;
    
    var owner = this._toolbar.owner();
    var btns = this._last;
    
    $(btn).each(function() {
      var btn = Button.eval(this).owner(owner);
      if( !btn ) return;
      
      if( index >= 0 ) btns.splice(index++, 0, btn);
      else btns.push(btn);
    });
    
    this.update();
    return this;
  },
  remove: function(target) {
    if( ~['string', 'number'].indexOf(typeof target) ) target = this.get(target);
    if( !target ) return this;
    
    var remove = function(btns) {
      btns.forEach(function(btn) {
        if( btn === target ) btns.splice(btns.indexOf(btn), 1);
      });
    };
    
    remove(this._last);
    remove(this._first);
    remove(this._buttons);
    
    this.update();
    return this;
  },
  clear: function() {
    this._el.html();
    return this;
  }
};

module.exports = Buttons;

/***/ }),
/* 27 */
/***/ (function(module, exports) {

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

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

var $ = __webpack_require__(0);
var getPosition = __webpack_require__(27);
var Buttons = __webpack_require__(26);
__webpack_require__(48);

function clone(o) {
  var result = {};
  for(var k in o) result[k] = o[k];
  return result; 
}

function Toolbar(owner, options) {
  if( !owner || typeof owner.dom !== 'function' ) throw new TypeError('illegal owner(owner.dom() requried)');
  
  this._owner = owner;
  this._el = $('<div/>').css('opacity', 0).ac('ff-toolbar').hide();
  this._buttons = new Buttons(this);
  this._enable = true;
  this.options(options);
  
  $(window).on('scroll resize', this);
}

Toolbar.prototype = {
  handleEvent: function(e) {
    this.update();
  },
  options: function(o) {
    if( !arguments.length ) return this._options;
    this._options = clone(o);
    return this;
  },
  position: function(position) {
    this.options().position = position;
    this.update();
    return this;
  },
  dom: function() {
    return this._el[0];
  },
  owner: function() {
    return this._owner;
  },
  buttons: function() {
    return this._buttons;
  },
  update: function() {
    var options = this.options();
    var dom = this.dom();
    var ownerElement = this.owner().dom();
    var position = options.position || 'top center outside';
    
    if( !document.body.contains(ownerElement) ) {
      $(window).off('scroll resize', this);
      var p = dom.parentNode;
      p && p.removeChild(dom);
      return;
    }
    
    $(window).on('scroll resize', this);
    
    var el = this._el
    .css(options.style || {})
    .ac(options.cls)
    .appendTo(document.body);
    
    if( ownerElement ) {
      var ownerposition = getPosition(ownerElement);
      var posarr = position.split(' ');
      var inside = ~posarr.indexOf('inside');
      var vertical = ~posarr.indexOf('vertical');
      var nomargin = ~posarr.indexOf('nomargin');
      if( vertical ) el.ac('ff-toolbar-vertical');
      
      var width = ownerElement.clientWidth;
      var height = ownerElement.clientHeight;
      var tbarwidth = dom.clientWidth;
      var tbarheight = dom.clientHeight;
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
    
      dom.style.top = top + 'px';
      dom.style.left = left + 'px';
    }
    
    this.buttons().update();
    
    return this;
  },
  show: function() {
    if( !this.enable() ) return this;
    this._el.css('opacity', 0).show();
    this.update();
    this._el.css('opacity', 1);
    return this;
  },
  hide: function(force) {
    if( !force && this.always() ) return this;
    $(window).off('scroll resize', this);
    this._el.css('opacity', 0).hide();
    return this;
  },
  refresh: function() {
    this.update();
    return this;
  },
  always: function(b) {
    if( !arguments.length ) return this._always;
    this._always = !!b;
    this.update();
    return this;
  },
  enable: function(b) {
    if( !arguments.length ) return this._enable;
    this._enable = !!b;
    this.update();
    return this;
  },
  add: function(btn, index) {
    this.buttons().add(btn, index);
    return this;
  },
  get: function(id) {
    return this.buttons().get(id);
  },
  first: function(btn) {
    this.buttons().first(btn);
    return this;
  },
  last: function(btn) {
    this.buttons().last(btn);
    return this;
  },
  clear: function(btn) {
    this.buttons().clear();
    return this;
  },
  remove: function(btn) {
    this.buttons().remove(btn);
    return this;
  }
};


module.exports = Toolbar;


/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

var Button = __webpack_require__(7);
var Separator = __webpack_require__(10);
var ListButton = __webpack_require__(9);

Button.eval = function(o) {
  if( !o ) return null;
  if( o instanceof Button ) return o;
  
  if( o == '-' || o.type == 'separator' ) return new Separator(o);
  else if( o.type == 'list' ) return new ListButton(o);
  
  return new Button(o);
};

Button.Separator = Separator;
Button.ListButton = ListButton;

module.exports = Button;

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

var $ = __webpack_require__(0);
var getOffsetTop = __webpack_require__(12);

__webpack_require__(51);

function DnD(part, dom) {
  var el = $(dom);
  var marker = $('<div class="ff-dnd-marker ff-acc"></div>');
  
  function move(target, y) {
    if( !target ) return;
    
    if( y < getOffsetTop(target) + (target.offsetHeight / 2) ) {
      marker.insertBefore(target);
    } else {
      marker.insertAfter(target);
    }
  }
  
  function hide() {
    marker.remove();
  }
  
  function current(target) {
    if( target === el || target === marker ) return;
    var children = el.children();
    var current;
    children.each(function() {
      if( this.contains(target) ) current = this;
    });
    
    return current;
  }
  
  function ondragover(e) {
    e.stopPropagation();
    e.preventDefault();
    
    var target = e.target || e.srcElement;
    var dragging = part.context().dragging;
    
    if( dragging && (target === dragging || dragging.contains(target)) ) return hide();
    
    if( !target.contains(dragging) ) {
      move(current(target), e.pageY);
    }
  }
  
  function ondragend(e) {
    hide();
  }
  
  function ondrop(e) {
    e.stopPropagation();
    e.preventDefault();
    
    var target = e.target || e.srcElement;
    var dragging = part.context().dragging;
    var ref = marker[0].nextSibling;
    
    //console.log(target, dragging, ref, target === dragging, dragging.contains(target), !dom.contains(marker[0]));
    
    if( dragging ) {
      if( target === dragging || dragging.contains(target) || !dom.contains(marker[0]) ) return;
      part.insert(dragging, ref);
    } else if( e.dataTransfer && e.dataTransfer.files ) {
      part.insert(e.dataTransfer.files, ref);
    }
    
    hide();
  }
  
  el.on('dragover', ondragover)
  .on('dragend', ondragend)
  .on('drop', ondrop);
  
  return {
    move: move,
    hide: hide,
    destroy: function() {
      el.off('dragover', ondragover)
      .off('dragend', ondragend)
      .off('drop', ondrop);
      
      marker.remove();
    }
  };
}

module.exports = DnD;

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

var $ = __webpack_require__(0);
var getOffsetTop = __webpack_require__(12);
var toolbar = __webpack_require__(13);
var Button = __webpack_require__(5).Button;

__webpack_require__(52);

function Marker(part, dom) {
  var el = $(dom);
  var marker = $('<div class="ff-marker ff-acc"><div class="ff-marker-head"></div><div class="ff-marker-tools"></div></div>');
  var lastref;
  
  function update() {
    var tools = marker.find('.ff-marker-tools').empty();
    toolbar.forEach(function(item) {
      if( !item || !item.text ) return;
      
      new Button(item).cls('ff-marker-tools-btn').owner(part).appendTo(tools);
    });
  }
  
  function show(ref) {
    if( marker.hc('ff-marker-open') ) return this;
    ref = (typeof ref == 'number' ? el.children()[ref] : ref);
    
    if( lastref === ref || ref === marker[0] ) return this;
    lastref = ref;
    
    collapse();
    if( ref ) marker.insertBefore(ref);
    else marker.appendTo(el);
    
    return this;
  }
  
  function hide() {
    collapse();
    marker.remove();
    return this;
  }
  
  function expand() {
    marker.ac('ff-marker-open');
    return this;
  }
  
  function collapse() {
    marker.rc('ff-marker-open');
    return this;
  }
  
  function onclick(e) {
    var target = e.target || e.srcElement;
    if( !marker[0].contains(target) ) marker.rc('ff-marker-open');
  }
  
  function onmousemove(e) {
    var target = e.target || e.srcElement;
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
  }
  
  marker.find('.ff-marker-head').on('click', function() {
    update();
    marker.tc('ff-marker-open');
  });
  
  el.on('click', onclick).on('mousemove', onmousemove);
  
  return {
    show: show,
    hide: hide,
    expand: expand,
    collapse: collapse,
    getIndex: function() {
      return el.children().indexOf(marker[0]);
    },
    getRef: function() {
      return marker[0].nextSibling;
    },
    isExpanded: function() {
      return marker.hc('ff-marker-open')
    },
    destroy: function() {
      el.off('click', onclick).off('mousemove', onmousemove);
      marker.remove();
    }
  };
}

module.exports = Marker;

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

var $ = __webpack_require__(0);
var context = __webpack_require__(3);
var Items = __webpack_require__(6);

module.exports = new Items()
.add({
  text: '<i class="fa fa-dedent"></i>',
  tooltip: '좌측플로팅',
  fn: function(e) {
    this.owner().floating('left');
  }
})
.add({
  text: '<i class="fa fa-dedent ff-flip"></i>',
  tooltip: '우측플로팅',
  fn: function(e) {
    this.owner().floating('right');
  }
})
.add({
  text: '<i class="fa fa-circle-o"></i>',
  tooltip: '크기변경',
  onupdate: function() {
    var part = this.owner();
    
    var blockmode = part.blockmode();
    if( blockmode == 'natural' ) this.text('<i class="fa fa-square-o"></i>');
    else if( blockmode == 'medium' ) this.text('<i class="fa fa-arrows-alt"></i>');
    else if( blockmode == 'full' ) this.text('<i class="fa fa-circle-o"></i>');
    else this.text('<i class="fa fa-align-center"></i>');
  },
  fn: function(e) {
    var part = this.owner();
    
    var blockmode = part.blockmode();
    if( blockmode == 'natural' ) part.blockmode('medium');
    else if( blockmode == 'medium' ) part.blockmode('full');
    else if( blockmode == 'full' ) part.blockmode(false);
    else part.blockmode('natural');
    
    this.owner().floating(false);
  }
})
.add({
  text: '<i class="fa fa-file-image-o"></i>',
  tooltip: '사진변경(업로드)',
  fn: function(e) {
    var part = this.owner();
    context.selectFile(function(err, file) {
      if( err ) return context.error(err);
      if( !file ) return;
      
      part.src(file.src).title(file.name);
    });
  }
})
.add({
  text: '<i class="fa fa-instagram"></i>',
  tooltip: '사진변경',
  fn: function(e) {
    var part = this.owner();
    
    context.prompt('Please enter the image URL.', function(src) {
      src && part.src(src).title(null);
    });
  }
});

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

var $ = __webpack_require__(0);
var context = __webpack_require__(3);
var Toolbar = context.Toolbar;

function rangeitem(text, tooltip, selector, fn) {
  return {
    text: text,
    tooltip: tooltip,
    onupdate: function() {
      var range = this.owner().range();
      if( !range ) return this.enable(false);
      
      this.enable(true);
      this.active(context.wrapped(range, selector));
    },
    fn: fn || function(e) {
      context.toggleWrap(this.owner().range(), selector);
    }
  };
}

module.exports = function(part) {
  var dom = part.dom()
  var el = $(dom);
  
  return part.toolbar()
  /*.add({
    type: 'list',
    text: '<i class="fa fa-font"></i>',
    onselect: function(selected) {
      
    },
    onupdate: function() {
      
    },
    fn: function(e) {
      
    },
    list: [
      '기본폰트',
      '나눔고딕',
      '나눔명조',
      'Helvetica',
      'Times New Roman'
    ]
  })*/
  .add(rangeitem('<i class="fa fa-bold"></i>', '굵게', 'b'))
  .add(rangeitem('<i class="fa fa-underline"></i>', '밑줄', 'u'))
  .add(rangeitem('<i class="fa fa-italic"></i>', '이탤릭', 'i'))
  .add(rangeitem('<i class="fa fa-strikethrough"></i>', '가로줄', 'strike'))
  .add(rangeitem('<i class="fa fa-link"></i>', '링크', 'a', function(e) {
    var range = this.owner().range();
    if( !range || context.wrapped(range, 'a') ) return context.unwrap(range, 'a');
    
    context.prompt('Please enter the anchor URL.', function(href) {
      if( !href ) return;
      var a = context.wrap(range, 'a');
      a.href = href;
      a.target = '_blank';
    });
  }))
  .add({
    text: '<i class="fa fa-align-justify"></i>',
    tooltip: '정렬',
    onupdate: function() {
      var btn = this;
      if( btn.align == 'center' ) btn.text('<i class="fa fa-align-center"></i>');
      else if( btn.align == 'right' ) btn.text('<i class="fa fa-align-right"></i>');
      else if( btn.align == 'left' ) btn.text('<i class="fa fa-align-left"></i>');
      else btn.text('<i class="fa fa-align-justify"></i>');
    },
    fn: function(e) {
      var btn = this;
      if( btn.align == 'center' ) {
        el.css('text-align', 'right');
        btn.align = 'right';
      } else if( btn.align == 'right' ) {
        el.css('text-align', 'left');
        btn.align = 'left';
      } else if( btn.align == 'left' ) {
        el.css('text-align', '');
        btn.align = '';
      } else {
        el.css('text-align', 'center');
        btn.align = 'center';
      }
    }
  })
  .add({
    text: '<i class="fa fa-hand-pointer-o"></i>',
    tooltip: '요소이동',
    onupdate: function() {
      var btn = this;
      if( el.ha('draggable') ) btn.active(true);
      else btn.active(false);
    },
    fn: function() {
      part.dragmode(!part.dragmode());
    }
  });
};

/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

var $ = __webpack_require__(0);
var context = __webpack_require__(3);
var Items = __webpack_require__(6);

module.exports = new Items()
.add({
  text: '<i class="fa fa-align-justify"></i>',
  tooltip: '정렬',
  onupdate: function() {
    var btn = this;
    var part = this.owner();
    var valign = part.valign();
    
    if( valign == 'middle' ) btn.text('<i class="fa fa-align-right ff-vert"></i>');
    else if( valign == 'bottom' ) btn.text('<i class="fa fa-align-left ff-vert"></i>');
    else btn.text('<i class="fa fa-align-center ff-vert"></i>');
  },
  fn: function(e) {
    var btn = this;
    var part = this.owner();
    var valign = part.valign();
    
    if( valign == 'middle' ) part.valign('bottom');
    else if( valign == 'bottom' ) part.valign(false);
    else part.valign('middle');
  }
});

/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

var $ = __webpack_require__(0);
var context = __webpack_require__(3);
var Items = __webpack_require__(6);

module.exports = new Items()
.add({
  text: '<i class="fa fa-circle-o"></i>',
  tooltip: '작은크기',
  fn: function(e) {
    $(this.owner().dom())
    .rc('f_video_fit')
    .ac('f_video_narrow');
  }
})
.add({
  text: '<i class="fa fa-arrows-alt"></i>',
  tooltip: '화면에 맞춤',
  fn: function(e) {
    $(this.owner().dom())
    .ac('f_video_fit')
    .rc('f_video_narrow');
  }
});

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)();
// imports


// module
exports.push([module.i, ".ff-focus-state {\n  background-color: #eee;\n}\n.ff[contenteditable] {\n  outline: none;\n}\n.ff[draggable] {\n  cursor: pointer;\n}\n.ff-placeholder {\n  color: #ccc;\n  font-weight: normal;\n  font-size: inherit;\n  user-select: none;\n}\n.ff-flip {\n  transform: scale(-1, 1);\n}\n.ff-vert {\n  transform: rotate(90deg);\n}\n", ""]);

// exports


/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)();
// imports


// module
exports.push([module.i, ".ff-toolbar {\n  position: absolute;\n  border: none;\n  border-radius: 4px;\n  background-color: rgba(0, 0, 0, 0.85);\n  z-index: 110;\n  transition: opacity 0.35s ease-in-out;\n  user-select: none;\n  box-sizing: border-box;\n}\n.ff-toolbar.ff-toolbar-vertical .ff-toolbar-btn {\n  display: block;\n}\n", ""]);

// exports


/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)();
// imports


// module
exports.push([module.i, ".ff-toolbar-btn {\n  display: inline-block;\n  cursor: pointer;\n  font-size: 14px;\n  line-height: 18px;\n  background-color: transparent;\n  color: white;\n  padding: 12px 12px;\n  text-decoration: none;\n  user-select: none;\n}\n.ff-toolbar-btn:hover,\n.ff-toolbar-btn.ff-toolbar-btn-active {\n  color: #2796DD;\n}\n.ff-toolbar-btn.ff-toolbar-btn-disabled {\n  color: #777;\n}\n.ff-toolbar-btn.ff-toolbar-btn-disabled:hover {\n  color: #777;\n}\n.ff-toolbar-btn i {\n  min-width: 14px;\n  text-align: center;\n}\n", ""]);

// exports


/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)();
// imports


// module
exports.push([module.i, ".ff-article {\n  position: relative;\n}\n.ff-article.ff-focus-state {\n  background-color: initial;\n}\n.ff-article.ff-edit-state {\n  border: 1px dotted #ccc;\n}\n", ""]);

// exports


/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)();
// imports


// module
exports.push([module.i, ".ff-dnd-marker {\n  height: 1px;\n  background-color: #2796DD;\n}\n", ""]);

// exports


/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)();
// imports


// module
exports.push([module.i, ".ff-marker {\n  display: block;\n  position: relative;\n  margin: 0;\n  user-select: none;\n}\n.ff-marker * {\n  box-sizing: border-box;\n}\n.ff-marker .ff-marker-head {\n  position: absolute;\n  left: -30px;\n  top: -13px;\n  background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAAXNSR0IArs4c6QAAAAlwSFlzAAALEwAACxMBAJqcGAAAActpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDUuNC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI+CiAgICAgICAgIDx4bXA6Q3JlYXRvclRvb2w+QWRvYmUgSW1hZ2VSZWFkeTwveG1wOkNyZWF0b3JUb29sPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KKS7NPQAAA6ZJREFUSA2l1s9uVkUYBnDaKqCJbgkS6ILehm1smrBwpbfQEmEBt+AlmLhx0/YSNC5MXJgmpd6CrOiimEq6I7hQlLY8v3POS4f2fP0aeJLnzLx/5nln5syZ75u5dHHMJHUu1B6FxyGwZ0P24dCmeX8Q/jDUTsOFc6eJWaGVWCFY2Xx4I/wkhL/D/XAvbPNo24FRnFfYKv8fRl1L+3W4FF4PTaBi8hR8Fm6HP4YHIbQavWd4TircDlhL7mr4X7gVPgp3wxchfBreDhfD5fByuBGuh9Bq9Z4JT4nwcbgZ/hF+E34QToOce+Hj0FgaUJq9NfKsBAN+Dq3uZpMnju0k9MtfqbfS2QlpTC3eipmtgVdC0M51vZPHnXRXTsyuJ6cdQ4NW4bTGm29Rwlpoe2ulH3EOcKgKP6TzXRlp21iNsXLbThPkdOeqkq32KHR6V8Pvwz9Ds/8nHMO/cb4cC8RnjLFPQ1o0aauh1psZvGIEPhmnt05k+cXAN92itdu+nBpLiyZt4J+xYvtukP5SuBUehg6Mlh9tkbbQ2tWvVl5pKESTNr9acyWYfncjuRweMRrYHjRAW2AjVKzaNk98J6Q9zwi6FVeSa9BEdkWCEu2t/tn6bF/7jttYjSnfkzhofzYEjrzoCrp7ib0YgrZoJfwyVECewSbqulwO5YCDZJvFtOxfwt9CoEnbLQfH3Qnr+6NP8atNhGhNwNkAcddkxcpXcfYZEDYA/MoQMKvnodivA9OMwif17Wikd9KwKzRp125279j2wX5oq24zgppQb519EsLzUBoLSaL915A8q2i9470hsDgEq5GDRNrtY9ekK1a+8ielw+d5KrrXm5eOJfjeDDCj7XA5tEUOkEL8aILaQmtXv1p5xtKgRZM2v1qHCksWhJ9CF8caIyh/b53dfiKFts9XY++m75XQBv5uxQwHwCT8c9gIH4a3Qp9RXfjpvgWn2WczBmOMnQ8fhOshbTXUegvt+1N8J6xPSYE2buCdcEWngZyajLG/h5un4o150rXNYMZ+xBW38oI41jby65efDcYoSqN2rLTjGkclGGC2fk/vhW2xmKOQcz+svz4Ti54+EKWmuBMJqwPZW6FdeBLWZeByWAgXwy9CY70qhFar9+Q5qfDpAX7EvwqXQhe9Q+LuBSf2KPSdbodO70EIo0UFziss7rDUt8mW76TeCK0UrHw/3AvlgonJPWS8KwiYuXYaLpx7EbEqJtcOaG1trY5thWwrLH+6k/EazMPI1WuoPt4AAAAASUVORK5CYII=');\n  background-size: 26px auto;\n  width: 26px;\n  height: 26px;\n  cursor: pointer;\n  opacity: 0.5;\n  transition: all .35s;\n}\n.ff-marker .ff-marker-head:hover {\n  opacity: 1;\n  transform: rotate(-180deg);\n}\n.ff-marker .ff-marker-tools {\n  height: 0;\n  overflow: hidden;\n  margin: 0;\n  padding: 0;\n  padding-left: 15px;\n  transition: all 0.25s;\n}\n.ff-marker .ff-marker-tools .ff-marker-tools-btn {\n  display: inline-block;\n  cursor: pointer;\n  height: 36px;\n  line-height: 34px;\n  padding: 0 12px;\n  margin: 10px 0;\n  margin-right: 8px;\n  border: 1px solid #ccc;\n}\n.ff-marker.ff-marker-open .ff-marker-head {\n  top: 15px;\n}\n.ff-marker.ff-marker-open .ff-marker-tools {\n  height: 56px;\n}\n.ff-marker-tools-btn {\n  color: #232323;\n}\n", ""]);

// exports


/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)();
// imports


// module
exports.push([module.i, ".ff-file {\n  margin: 15px 0;\n}\n.ff-file a {\n  display: inline-block;\n  cursor: pointer;\n  color: #53abe4;\n  border: 1px solid #53abe4;\n  text-decoration: none;\n  padding: 6px 20px;\n  border-radius: 34px;\n  font-size: 14px;\n  line-height: 1.42857143;\n  text-align: center;\n  vertical-align: middle;\n}\n.ff-file a:hover,\n.ff-file a:active {\n  color: #2796DD;\n  border-color: #2796DD;\n  outline: 0;\n  text-decoration: none;\n}\n", ""]);

// exports


/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)();
// imports


// module
exports.push([module.i, ".f_img_block {\n  display: block;\n  max-width: 100%;\n  margin: 0 auto;\n}\n.f_img_medium {\n  display: block;\n  width: 50%;\n  margin: 0 auto;\n}\n.f_img_left {\n  float: left;\n  margin-right: 25px;\n  max-width: 40%;\n}\n.f_img_right {\n  float: right;\n  margin-left: 25px;\n  max-width: 40%;\n}\n.f_img_wrap {\n  display: block;\n  overflow: auto;\n  clear: both;\n}\n.f_img_full {\n  display: block;\n  max-width: 100%;\n  width: 100%;\n}\n", ""]);

// exports


/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)();
// imports


// module
exports.push([module.i, ".ff-paragraph.ff-edit-state {\n  min-height: 1em;\n}\n.ff-paragraph.ff-focus-state {\n  background-color: initial;\n  outline: #ccc dotted 1px;\n}\n.ff-paragraph[draggable] {\n  background-color: #eee;\n}\n", ""]);

// exports


/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)();
// imports


// module
exports.push([module.i, ".ff-row {\n  display: table;\n  width: 100%;\n  table-layout: fixed;\n  border-collapse: separate;\n  border-spacing: 5px;\n}\n.ff-row .f_row_cell {\n  display: table-cell;\n  vertical-align: top;\n}\n.ff-row.f_row_top .f_row_cell {\n  vertical-align: top;\n}\n.ff-row.f_row_middle .f_row_cell {\n  vertical-align: middle;\n}\n.ff-row.f_row_bottom .f_row_cell {\n  vertical-align: bottom;\n}\n.ff-row img {\n  display: block;\n  width: 100%;\n}\n", ""]);

// exports


/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)();
// imports


// module
exports.push([module.i, ".ff-separator {\n  display: block;\n  margin: 0 !important;\n  padding: 0 !important;\n  height: auto !important;\n  border-top: 0 !important;\n}\n.ff-separator:before {\n  content: \"\";\n  display: block;\n  border-bottom: 1px solid #ccc;\n  padding-top: 20px;\n  margin: 0 auto;\n  max-width: 100%;\n}\n.ff-separator:after {\n  content: \"\";\n  display: block;\n  padding-bottom: 20px;\n}\n.ff-separator.ff-separator-narrow:before {\n  max-width: 180px;\n}\n.ff-separator.ff-separator-dashed:before {\n  border-bottom: 1px dashed #ccc;\n}\n.ff-separator.ff-separator-dotted:before {\n  border-bottom: 1px dotted #ccc;\n}\n.ff-separator.ff-separator-zigzag:before {\n  position: relative;\n  top: 5px;\n  border: 0;\n  background-image: url('data:image/false;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAKCAYAAAC5Sw6hAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAB1WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI+CiAgICAgICAgIDx0aWZmOkNvbXByZXNzaW9uPjE8L3RpZmY6Q29tcHJlc3Npb24+CiAgICAgICAgIDx0aWZmOk9yaWVudGF0aW9uPjE8L3RpZmY6T3JpZW50YXRpb24+CiAgICAgICAgIDx0aWZmOlBob3RvbWV0cmljSW50ZXJwcmV0YXRpb24+MjwvdGlmZjpQaG90b21ldHJpY0ludGVycHJldGF0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KAtiABQAAAUNJREFUKBWNUj1LxEAQnegpYmWR43KTnc3Gys4i2AjCFlfbCbbaibU/wMbO3lZbWytBEMFKReEQxMrqfoLVceebvWy0iTqQzMeb93YyG6IWq6pqQSHJZMOJ3Nleb1XzWNf4T4vN0pctZ+xzKXJain1I07SvZE/U+beIZR6A/F4wbyqpENlHPlyB1SLtYs0kLNulsW95nq8ryTm3FHwuB07sEzMt12Lztf923vtwgmPZRfMrM68pGsU9zfDCmCN87j2gsEP4RixpRET2sI+hyzKHhkZEY1iyU5MgdIznRmsB0XpzksghRF663W6mYJykboxOiWGCcAHGXkUgeB0Xi3yMi2wRiRwVm9MEKzjDLi81TvCPnNA08R+T8YBGo0+Pq70lGgP7zVRoog0QOyeadhDINfJFLcLar3SG/3yHqbRQGHvxBU0KOHx07LVhAAAAAElFTkSuQmCC');\n  background-repeat: repeat no-repeat;\n  background-position: center 9px;\n}\n", ""]);

// exports


/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)();
// imports


// module
exports.push([module.i, ".ff-video {\n  position: relative;\n  margin: 0 auto;\n  max-width: 100%;\n}\n.ff-video .ff-mask {\n  display: none;\n  position: absolute;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  right: 0;\n}\n.ff-video.f_video_16by9 .f_video_container {\n  display: block;\n  height: 0;\n  padding: 0;\n  overflow: hidden;\n  padding-bottom: 56.25%;\n}\n.ff-video.f_video_16by9 .f_video_container iframe {\n  position: absolute;\n  top: 0;\n  left: 0;\n  bottom: 0;\n  height: 100%;\n  width: 100%;\n  border: 0;\n}\n.ff-video.f_video_narrow {\n  width: 50%;\n}\n.ff-video.f_video_fit {\n  width: 100%;\n}\n", ""]);

// exports


/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(37);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(2)(content, {});
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

/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(38);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(2)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../node_modules/css-loader/index.js!../../../node_modules/less-loader/index.js!./button.less", function() {
			var newContent = require("!!../../../node_modules/css-loader/index.js!../../../node_modules/less-loader/index.js!./button.less");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(39);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(2)(content, {});
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

/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(40);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(2)(content, {});
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

/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(41);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(2)(content, {});
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

/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(42);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(2)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../node_modules/css-loader/index.js!../../../node_modules/less-loader/index.js!./file.less", function() {
			var newContent = require("!!../../../node_modules/css-loader/index.js!../../../node_modules/less-loader/index.js!./file.less");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(43);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(2)(content, {});
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

/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(44);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(2)(content, {});
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

/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(45);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(2)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../node_modules/css-loader/index.js!../../../node_modules/less-loader/index.js!./row.less", function() {
			var newContent = require("!!../../../node_modules/css-loader/index.js!../../../node_modules/less-loader/index.js!./row.less");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(46);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(2)(content, {});
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

/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(47);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(2)(content, {});
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

/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

var win = window;
var Extensions = function() {}
Extensions.prototype = new Array();
var extensions = new Extensions();

var util = __webpack_require__(15);
var isArrayLike = util.isArrayLike;
var create = util.create;
var isHTML = util.isHTML;
var each = util.each;

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
      var self = this;
      if( selector instanceof Extensions ) {
        return selector;
      //} else if( isNode(selector) && selector.nodeType == 11 ) {
      } else if( isArrayLike(selector) ) {
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
  Selector.util = util;
  Selector.create = create;
  Selector.each = each;
  Selection.prototype = extensions;
  Selection.prototype.document = document;
  Selection.prototype.Selection = Selection;
  Selection.prototype.$ = Selector;
  
  return Selector;
}

Context.fn = extensions;
Context.util = util;

module.exports = Context;

/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

var util = __webpack_require__(15);

module.exports = function(ctx) {
  var fn = ctx.fn;
  var create = util.create;
  var isHTML = util.isHTML;
  var isNode = util.isNode;
  var isElement = util.isElement;
  var isArrayLike = util.isArrayLike;
  var isNull = util.isNull;
  var matches = util.matches;
  var each = util.each;
  var offset = util.offset;
  var computed = util.computed;
  var number = util.number;
  
  fn.ready = function(fn) {
    this.each(function() {
      if( this instanceof Document ) {
        if( this.body ) return fn.call(this, ctx(this));
        
        this.addEventListener('DOMContentLoaded', function() {
          fn.call(this, ctx(this));
        });
      }
    });
    return this;
  };
  
  fn.each = function(fn) {
    return each(this, fn);
  };
  
  fn.index = function(item) {
    return this.indexOf(item);
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
      this.innerHTML = '';
    });
  };
  
  fn.html = function(html) {
    if( !arguments.length ) return this[0] && this[0].innerHTML;
    
    return this.each(function() {
      this.innerHTML = html || '';
    });
  };
  
  fn.text = function(text) {
    if( !arguments.length ) return (this[0] && (this[0].textContent || this[0].innerText)) || '';
    
    return this.each(function() {
      this.innerText = text || '';
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
      if( value === null || value === undefined ) this.removeAttribute(key);
      else this.setAttribute(key, value + '');
    });
  };
  
  fn.hasAttr = fn.ha = function(name) {
    return this[0] && this[0].hasAttribute(name);
  };
  
  fn.css = function(key, value) {
    if( !arguments.length ) return this;
    if( arguments.length === 1 ) {
      if( typeof key == 'string' ) return this[0] && this[0].style && this[0].style[key];
      for(var k in key) this.css(k, key[k]);
      return this;
    }
    
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
  
  fn.toggleClass = fn.tc = function(cls, bool) {
    if( typeof cls == 'string' ) cls = cls.split(' ');
    if( !isArrayLike(cls) || !cls.length ) return this;
    if( arguments.length >= 2 ) {
      if( bool ) this.ac(cls);
      else this.rc(cls);
      return this;
    }
    
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
  
  fn.append = function(node, index) {
    if( !node && typeof node != 'string' ) return this;
    
    return this.each(function(i) {
      if( !isElement(this) ) return;
      
      var el = this;
      var ref = this.children[index];
      
      if( typeof node == 'function' ) node = node.call(this, i);
      if( isHTML(node) ) node = create(node);
      if( !isArrayLike(node) ) node = [node];
      
      if( ref && ref.nextSibling && el.insertBefore ) {
        [].forEach.call(node, function(node) {
          if( typeof node == 'string' ) node = document.createTextNode(node);
          if( !isNode(node) ) return;
          el.insertBefore(node, ref.nextSibling);
          ref = node;
        });
      } else if( el.appendChild ) {
        [].forEach.call(node, function(node) {
          if( typeof node == 'string' ) node = document.createTextNode(node);
          if( !isNode(node) ) return;
          el.appendChild(node);
        });
      }
    });
  };
  
  fn.appendTo = function(target, index) {
    if( target && typeof target === 'string' ) target = this.$(target);
    if( !isElement(target) ) return this;
    
    var $ = this.$;
    return this.each(function() {
      $(target).append(this, index);
    });
  };
  
  fn.insertBefore = function(ref) {
    if( typeof ref == 'string' ) ref = this.$(ref);
    if( !isNode(ref) ) return this;
    
    var parent = ref.parentNode;
    if( !parent ) return this;
    
    return this.each(function() {
      if( parent.insertBefore ) {
        parent.insertBefore(this, ref);
      }
    });
  };
  
  fn.insertAfter = function(ref) {
    if( typeof ref == 'string' ) ref = this.$(ref);
    if( !isNode(ref) ) return this;
    
    var parent = ref.parentNode;
    var sib = ref.nextSibling;
    if( !parent ) return this;
    
    return this.each(function() {
      if( !isNode(this) ) return;
      
      if( !sib ) {
        parent.appendChild(this);
      } else if( parent.insertBefore ) {
        parent.insertBefore(this, sib);
      }
    });
  };
  
  fn.before = function(node) {
    var $ = this.$;
    return this.each(function() {
      $(this).insertBefore(node);
    });
  };
  
  fn.after = function(node) {
    var $ = this.$;
    return this.each(function() {
      $(node).insertAfter(this);
    });
  };
  
  fn.remove = function(node) {
    if( !arguments.length ) return this.each(function() {
      var p = this.parentNode;
      p && p.removeChild(this);
    });
    
    if( !node ) return;
    if( !isArrayLike(node) ) node = [node];
    
    var $ = this.$;
    return this.each(function() {
      if( this.removeChild ) {
        var el = this;
        [].forEach.call(node, function(node) {
          if( typeof node == 'string' ) return $(el).find(node).remove();
          el.removeChild(node);
        });
      }
    });
  };
  
  fn.clone = function(deep) {
    deep = deep === false ? false : true;
    var arr = this.$();
    this.each(function() {
      if( !isNode(this) ) return;
      arr.push(this.cloneNode(deep));
    });
    return arr;
  };
  
  fn.on = function(type, fn, bubble) {
    if( typeof type !== 'string' ) return this;
    type = type.split(' ');
    
    return this.each(function() {
      var el = this;
      el.addEventListener && type.forEach(function(type) {
        el.addEventListener(type, fn, bubble || false);
      });
    });
  };
  
  fn.once = function(type, fn, bubble) {
    return this.on(type, function(e) {
      this.removeEventListener(e.type, fn, bubble || false);
      fn.call(this, e);
    }, bubble);
  };
  
  fn.off = function(type, fn, bubble) {
    if( typeof type !== 'string' ) return this;
    type = type.split(' ');
    
    return this.each(function() {
      var el = this;
      el.removeEventListener && type.forEach(function(type) {
        el.removeEventListener(type, fn, bubble || false);
      });
    });
  };
  
  fn.click = function(fn) {
    return this.each(function() {
      if( isNode(this) ) this.onclick = fn;
    });
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
      } else {
        arr.add(children);
      }
    });
    return arr;
  };
  
  fn.wrap = function(html) {
    var $ = this.$;
    return this.each(function(i) {
      if( !isNode(this) ) return;
      
      var wrapper = html;
      if( typeof wrapper == 'function' )
        wrapper = wrapper.call(this, i);
      
      if( isHTML(wrapper) )
        wrapper = create(wrapper)[0];
      
      if( !isElement(wrapper) ) return;
      
      var parent = this.parentNode;
      var ref = this.nextSibling;
      wrapper = $(wrapper).append(this);
      
      if( ref ) wrapper.insertBefore(ref);
      else wrapper.appendTo(parent);
    });
  };
  
  fn.unwrap = function(selector) {
    var $ = this.$;
    return this.reverse().each(function() {
      if( !isNode(this) ) return;
      
      var p = selector ? $(this).parent(selector)[0] : this.parentNode;
      if( !p ) return;
      if( !p.parentNode ) return p.removeChild(this);
      
      var ref = p.nextSibling;
      if( ref ) p.parentNode.insertBefore(this, ref);
      else p.parentNode.appendChild(this);
      
      if( !p.children.length ) p.parentNode.removeChild(p);
    });
  };
  
  fn.normalize = function() {
    return this.each(function() {
      if( isElement(this) ) this.normalize();
    })
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
  
  fn.has = function(selector) {
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
  
  fn.src = function(src) {
    return this.each(function() {
      if( 'src' in this ) this.src = src;
    });
  };
  
  fn.position = function(fn) {
    return offset(this[0]);
  };
  
  fn.offset = function(fn) {
    if( !arguments.length ) return offset(this[0], true);
    
    if( typeof fn == 'function' ) return this.each(function(i) {
      fn.call(this, i, offset(this, true));
    });
    
    var top = number(fn.top);
    var left = number(fn.left);
    if( !top && !left ) return this;
    
    return this.each(function() {
      var el = this;
      if( el.style ) {
        var position = computed(el).position;
        if( !position || position == 'static' ) el.style.position = 'relative';
        if( top ) el.style.top = top + 'px';
        if( left ) el.style.left = left + 'px';
      }
    });
  };
  
  fn.show = function() {
    return this.each(function() {
      var el = this;
      if( el.style ) {
        el.style.display = '';
        var display = computed(el).display;
        if( !display || display == 'none' ) el.style.display = 'block';
      }
    });
  };
  
  fn.hide = function() {
    return this.each(function() {
      if( this.style ) {
        this.style.display = 'none';
      }
    });
  };
  
  fn.async = function(iterator, done) {
    var arr = this;
    if( !arr.length || typeof iterator != 'function' ) {
      done && done.call(arr);
      return arr;
    }
    
    var index = 0;
    var next = function() {
      iterator.call(arr, arr[index], function(err) {
        if( err ) return done && done.call(arr, err);
        
        ++index;
        if( index >= arr.length ) done && done.call(arr);
        else setImmediate(next);
      });
    };
    next();
    
    return arr;
  };
};

/***/ })
/******/ ]);
});
//# sourceMappingURL=ff.js.map