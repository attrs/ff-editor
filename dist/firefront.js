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

	var Editor = __webpack_require__(2);
	var Part = __webpack_require__(3);
	var HTMLPart = __webpack_require__(33);
	var ImagePart = __webpack_require__(35);
	var Toolbar = __webpack_require__(7);
	var Types = __webpack_require__(4);
	var connect = __webpack_require__(36);
	
	var editor;
	var emptykey = {};
	var ctx = module.exports = {
	  Part: Part,
	  HTMLPart: HTMLPart,
	  ImagePart: ImagePart,
	  Toolbar: Toolbar,
	  connect: connect,
	  editor: function(el) {
	    if( !arguments.length ) {
	      return editor = editor || new Editor();
	    }
	    
	    return el.__ffeditor__ = el.__ffeditor__ || new Editor(el);
	  },
	  endpoint: function(url) {
	    connect.endpoint(url);
	    return this;
	  },
	  type: function(type, fn) {
	    if( !arguments.length ) return console.error('missing type name');
	    if( arguments.length === 1 ) return Part.types.get(type);
	    Part.types.define(type, fn);
	    return this;
	  }
	};
	
	ctx.type('html', ctx.HTMLPart);
	//ctx.type('image', ctx.ImagePart);


/***/ },
/* 1 */,
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var Part = __webpack_require__(3);
	var Toolbar = __webpack_require__(7);
	var Events = __webpack_require__(8);
	
	__webpack_require__(31);
	
	function ensure(fn) {
	  if( document.body ) fn();
	  else window.addEventListener('DOMContentLoaded', fn);
	}
	
	var Editor = function(root) {
	  if( root && !Part.isElement(root) ) throw new TypeError('invalid element');
	  
	  var parts = [];
	  var data = {};
	  var types = {};
	  var observer;
	  var editmode = false;
	  var dispatcher = Events(Editor);
	  
	  var editor = {
	    element: function() {
	      return root || document.body;
	    },
	    editmode: function(b) {
	      if( !arguments.length ) return editmode;
	      
	      editmode = !!b;
	      
	      parts.forEach(function(part) {
	        part.editmode(!!b);
	      });
	      
	      dispatcher.dispatch('editmode', {
	        editmode: editmode
	      });
	      
	      toolbar.update();
	      return this;
	    },
	    data: function(d) {
	      if( !arguments.length ) {
	        var data = {};
	        Object.keys(parts).forEach(function(k) {
	          var part = parts[k] && parts[k];
	          if( part.id() ) {
	            data[part.id()] = part.data();
	          }
	        });
	        return data;
	      }
	      
	      dispatcher.dispatch('data', {
	        data: data
	      });
	      
	      editor.reset(d || {});
	      return this;
	    },
	    reset: function(d) {
	      if( !document.body ) return console.error('dom is not ready');
	      if( !arguments.length ) d = data;
	      
	      var oeditmode = editmode;
	      editmode = false;
	      
	      data = d || {};
	      toolbar.update();
	      
	      var root = this.element();
	      
	      parts.forEach(function(part) {
	        part.destroy();
	        delete part.element().__ff__;
	      });
	      
	      parts = [];
	      this.scan();
	      
	      dispatcher.dispatch('reset', {
	        parts: parts
	      });
	      
	      editmode = oeditmode;
	      
	      parts.forEach(function(part) {
	        part.editmode(editmode);
	      });
	      
	      return this;
	    },
	    scan: function() {
	      var root = this.element();
	      [].forEach.call(root.querySelectorAll('[ff-id], [ff-type]') , function(el) {
	        var id = el.getAttribute('ff-id');
	        var type = el.getAttribute('ff-type') || 'html';
	        var part = el.__ff__;
	        
	        if( !part ) {
	          var Type = editor.type(type);
	          if( !Type ) return console.warn('[firefront] not exists part type: ' + type);
	          part = el.__ff__ = new Type(el);
	          data[id] && part.data(data[id]);
	        }
	        
	        part.editor(editor);
	        parts.push(part);
	        if( id ) parts[id] = part;
	      });
	    },
	    toolbar: function() {
	      return toolbar;
	    },
	    parts: function() {
	      return parts.slice();
	    },
	    part: function(id) {
	      if( typeof id === 'string' || typeof id === 'number' ) return parts[id];
	      if( id && id instanceof Part ) return id;
	      if( id && typeof id === 'object' ) {
	        id = id[0] || id;
	        return id && id.__ff__;
	      }
	      
	      return null;
	    },
	    clear: function(id) {
	      parts.forEach(function(part) {
	        part.data(null);
	      });
	      return this;
	    },
	    destroy: function() {
	      this.editmode(false);
	      parts.forEach(function(part) {
	        part.destroy();
	      });
	      return this;
	    },
	    type: function(type, fn) {
	      if( !arguments.length ) return console.error('missing type name');
	      if( arguments.length === 1 ) return types[type] || Part.types.get(type);
	      types[type] = fn;
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
	    dispatch: function() {
	      return dispatcher.dispatch.apply(dispatcher, arguments);
	    }
	  };
	  
	  var toolbar = new Toolbar(editor, {
	    fixed: true,
	    top: 20,
	    right: 20,
	    cls: 'ff-editor-toolbar'
	  });
	  
	  ensure(function() {
	    editor.reset();
	  });
	  
	  return editor;
	};
	
	module.exports = Editor;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var Types = __webpack_require__(4);
	var Highlighter = __webpack_require__(5);
	var Toolbar = __webpack_require__(7);
	var Events = __webpack_require__(8);
	var MouseObserver = __webpack_require__(9);
	var xmodal = __webpack_require__(10);
	__webpack_require__(30);
	
	function observable(part) {
	  if( part._dataobserve ) {
	    Object.unobserve(part._dataobserve.obj, part._dataobserve);
	    delete part._dataobserve;
	  }
	  
	  var data = part.data();
	  if( data ) {
	    part._dataobserve = function(changes) {
	      part.dispatch('update', {
	        data: data,
	        changes: changes
	      });
	    };
	    part._dataobserve.obj = data;
	    
	    Object.observe(part._dataobserve.obj, part._dataobserve);
	  }
	}
	
	
	function Part(el) {
	  if( el && el.__ff__ ) return el.__ff__;
	  if( !el || !Part.isElement(el) ) el = this.create(el);
	  
	  el.__ff__ = this;
	  
	  var id = el.getAttribute('ff-id');
	  var dispatcher = Events(this);
	  var highlighter = Highlighter(el);
	  var self = this;
	  
	  //console.log('part init', el);
	  
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
	  
	  dispatcher.on('update', function(e) {
	    dispatcher.dispatch('render', {
	      type: 'update',
	      originalEvent: e
	    });
	  })
	  .on('modechange', function(e) {
	    dispatcher.dispatch('render', {
	      type: 'modechange',
	      originalEvent: e
	    });
	  })
	  .on('click', function(e) {
	    this.markRange();
	  })
	  .on('keyup', function(e) {
	    this.markRange();
	  })
	  .on('destroy', function(e) {
	    el.removeEventListener('keyup', keyup);
	    el.removeEventListener('keydown', keydown);
	  });
	  
	  var keyup = function(e) {
	    dispatcher.dispatch('keyup', e);
	  };
	  
	  var keydown = function(e) {
	    dispatcher.dispatch('keydown', e);
	  };
	  
	  el.addEventListener('keyup', keyup);
	  el.addEventListener('keydown', keydown);
	  
	  var isenter = function(target) {
	    var hel = highlighter.element();
	    if( target === el || el.contains(target) || hel === target || (hel && hel.contains(target)) ) return true;
	    return false;
	  };
	  
	  var mouseobserver = MouseObserver(el)
	  .enter(function(e) {
	    if( !self.editmode() ) return;
	    if( !isenter(e.target) ) return;
	    self.highlighter().show();
	    dispatcher.dispatch('enter', e);
	  })
	  .leave(function(e) {
	    if( !self.editmode() ) return;
	    self.highlighter().hide();
	    dispatcher.dispatch('leave', e);
	  })
	  .click(function(e) {
	    if( !self.editmode() ) return;
	    if( !isenter(e.target) ) return;
	    self.toolbar().show();
	    dispatcher.dispatch('click', e);
	  })
	  .focus(function(e) {
	    if( !self.editmode() ) return;
	    if( !isenter(e.target) ) return;
	    self.toolbar().show();
	    dispatcher.dispatch('focus', e);
	  })
	  .blur(function(e) {
	    if( !self.editmode() ) return;
	    self.toolbar().hide();
	    highlighter.hide();
	    dispatcher.dispatch('blur', e);
	  });
	  
	  this._id = id;
	  this._data = {};
	  this._dispatcher = dispatcher;
	  this._mouseobserver = mouseobserver;
	  this._element = el;
	  this._toolbar = toolbar;
	  this._highlighter = highlighter;
	  
	  observable(this);
	  
	  this.scan();
	  
	  var mo;
	  if( window.MutationObserver ) {
	    if( mo ) mo.disconnect();
	    mo = new MutationObserver(function(mutations) {
	      self.scan();
	    });
	    
	    mo.observe(el, {
	      childList: true,
	      subtree: true
	    });
	  }
	  
	  return el;
	}
	
	Part.prototype = {
	  id: function() {
	    return this._id;
	  },
	  element: function() {
	    return this._element;
	  },
	  toolbar: function() {
	    return this._toolbar;
	  },
	  highlighter: function() {
	    return this._highlighter;
	  },
	  create: function(arg) {
	    var el = document.createElement('div');
	    
	    if( typeof arg === 'string' ) {
	      el.innerHTML = arg;
	    }
	    
	    return el;
	  },
	  remove: function() {
	    var el = this.element();
	    if( el.parentNode ) el.parentNode.removeChild(el);
	    return this;
	  },
	  scan: function() {
	    var self = this;
	    var el = this.element();
	    [].slice.call(el.querySelectorAll('[ff-type]')).reverse().forEach(function(node) {
	      if( node.__ff__ ) return;
	      var type = node.getAttribute('ff-type');
	      var Type = Types.get(type);
	      if( !Type ) return console.warn('[firefront] not exists part type: ' + type);
	      
	      new Type(node).editor(self.editor());
	    });
	    return this;
	  },
	  mouseobserver: function() {
	    return this._mouseobserver;
	  },
	  editmode: function(b) {
	    if( !arguments.length ) return !!this._editmode;
	    var prev = this._editmode;
	    var editmode = this._editmode = !!b;
	    
	    if( editmode !== prev ) this.dispatch('modechange', {editmode: editmode});
	    if( !editmode ) {
	      this.toolbar().hide();
	      this.highlighter().hide();
	    }
	    return this;
	  },
	  data: function(value, update) {
	    if( !arguments.length ) return this._data;
	    
	    if( !value ||  typeof value !== 'object' ) throw new TypeError('data must be an object');
	    var prev = this._data || null;
	    var data = this._data = value || null;
	    
	    if( prev !== data ) {
	      if( update !== false ) this.dispatch('update', {
	        prev: prev,
	        data: data
	      });
	      
	      observable(this);
	    }
	    
	    return this;
	  },
	  on: function(type, fn) {
	    this._dispatcher.on(type, fn);
	    return this;
	  },
	  once: function(type, fn) {
	    this._dispatcher.once(type, fn);
	    return this;
	  },
	  off: function(type, fn) {
	    this._dispatcher.off(type, fn);
	    return this;
	  },
	  dispatch: function() {
	    return this._dispatcher.dispatch.apply(this._dispatcher, arguments);
	  },
	  silent: function(fn) {
	    if( typeof fn !== 'function' ) return console.error('fn must be a function');
	    
	    this._dispatcher.pause();
	    fn.call(this, function() {
	      this._dispatcher.resume();
	    });
	    return this;
	  },
	  clear: function() {
	    this.data({});
	    this.dispatch('clear');
	    this.dispatch('render', {
	      type: 'clear'
	    });
	    return this;
	  },
	  focus: function() {
	    return this;
	  },
	  destroy: function() {
	    this.clear();
	    this.dispatch('destroy');
	    this.mouseobserver().disconnect();
	    this.toolbar().destroy();
	    this.highlighter().destroy();
	    this._dispatcher.destroy();
	    return this;
	  },
	  markRange: function() {
	    var el = this.element();
	    var range = Part.getRange();
	    if( range && el.contains(range.startContainer) && el.contains(range.endContainer) ) {
	      this._range = range;
	    } else {
	      this._range = null;
	    }
	    return this;
	  },
	  range: function() {
	    return this._range;
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
	  insert: function(nodes, ranged) {
	    if( !nodes ) return this;
	    var el = this.element();
	    var range = ranged ? this.range() : null;
	    
	    if( typeof nodes === 'object' && typeof nodes.length !== 'number' ) {
	      nodes = [nodes];
	    } else if( typeof nodes === 'string' ) {
	      var tmp = document.createElement('div');
	      tmp.innerHTML = nodes;
	      nodes = tmp.childNodes;
	    } else {
	      return console.error('[firefront] Part.insert: illegal arguments', nodes);
	    }
	    
	    var self = this;
	    if( range ) range.deleteContents();
	    [].forEach.call(nodes, function(node) {
	      if( !node ) return;
	      if( node instanceof Part ) {
	        node.editor(self.editor());
	        node = node.element();
	      }
	      
	      if( range ) range.insertNode(node);
	      else el.appendChild(node);
	    });
	    
	    this.dispatch('insert', {
	      range: range,
	      nodes: nodes
	    });
	    
	    return this;
	  }
	}
	
	Part.types = Types;
	
	Part.isElement = function(node){
	  return (
	    typeof HTMLElement === 'object' ? node instanceof HTMLElement : node && typeof node === 'object' && node !== null && node.nodeType === 1 && typeof node.nodeName === 'string'
	  );
	};
	
	Part.evalElement = function(html) {
	  var tmp = document.createElement('div');
	  tmp.innerHTML = html;
	  return tmp.children[0];
	};
	
	Part.fragment = function(html) {
	  var fragment = document.createDocumentFragment();
	  var tmp = document.createElement('div');
	  tmp.innerHTML = nodes;
	  
	  [].forEach.call(tmp.childNodes, function(node) {
	    fragment.appendChild(node);
	  });
	  
	  return fragment;
	};
	
	Part.getRange = function(index) {
	  if( !window.getSelection ) return null;
	  
	  var selection = window.getSelection();
	  
	  if( selection.rangeCount && selection.rangeCount > (index || 0) ) return selection.getRangeAt(index || 0);
	  return null;
	};
	
	Part.getCaretPosition = function(node) {
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
	  
	  return caretPos;
	}
	
	module.exports = Part;

/***/ },
/* 4 */
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
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var getPosition = __webpack_require__(6);
	
	module.exports = function(el) {
	  var highlighter, enabled = true, show = false;
	  
	  var instance = {
	    element: function() {
	      return highlighter;
	    },
	    update: function() {
	      if( highlighter ) {
	        var position = getPosition(el);
	        highlighter.style.top = (position.top + 1) + 'px';
	        highlighter.style.left = (position.left + 1) + 'px';
	        highlighter.style.width = (el.offsetWidth - 2) + 'px';
	        highlighter.style.height = (el.offsetHeight - 2) + 'px';
	      }
	      return this;
	    },
	    show: function() {
	      show = true;
	      if( !enabled ) return this;
	      
	      if( !highlighter ) {
	        highlighter = document.createElement('div');
	        highlighter.setAttribute('class', 'ff-highlighter');
	        highlighter.style.position = 'absolute';
	        highlighter.style.display = 'none';
	        highlighter.style.cursor = 'pointer';
	        highlighter.style.backgroundColor = 'rgba(0,0,0,0)';
	        highlighter.style.border = '1px dotted rgba(128, 128, 128, 0.7)'
	        highlighter.style.zIndex = 100;
	        highlighter.style.opacity = 0;
	        highlighter.style.top = highlighter.style.left = highlighter.style.width = highlighter.style.height = 0;
	        highlighter.style.transition = 'opacity .25s';
	        
	        document.body.appendChild(highlighter);
	      }
	      
	      highlighter.style.display = 'block';
	      highlighter.style.opacity = 1;
	      instance.update();
	      return this;
	    },
	    hide: function() {
	      show = false;
	      if( highlighter ) {
	        highlighter.style.opacity = 0;
	        highlighter.style.display = 'none';
	      }
	      return this;
	    },
	    enable: function(b) {
	      if( b === false ) {
	        enabled = false;
	        instance.hide();
	      } else {
	        enabled = true;
	        if( show ) instance.show();
	      }
	      
	      return this;
	    },
	    destroy: function() {
	      if( highlighter && highlighter.parentNode ) highlighter.parentNode.removeChild(highlighter);
	      el = null;
	      return this;
	    }
	  };
	  
	  return instance;
	};

/***/ },
/* 6 */
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
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var getPosition = __webpack_require__(6);
	
	function clone(o) {
	  var result = {};
	  for(var k in o) result[k] = o[k];
	  return result; 
	}
	
	function Toolbar(owner, options) {
	  if( !owner || typeof owner.element !== 'function' ) throw new TypeError('illegal owner(owner.element() requried)');
	  options = clone(options);
	  
	  var toolbar = document.createElement('div');
	  var buttonul = document.createElement('ul');
	  buttonul.className = 'ff-toolbar-actions';
	  toolbar.appendChild(buttonul);
	  
	  var btns = [], visible = false;
	  
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
	        toolbar.style.display = 'none';
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
	      var ownerElement = owner.element();
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
	          if( window.scrollY + 100 > ownerElement.offsetTop ) top = window.scrollY + 100;
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
	      if( !btns.length ) return;
	      visible = true;
	      instance.update();
	      return this;
	    },
	    hide: function() {
	      if( !btns.length ) return;
	      visible = false;
	      instance.update();
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
/* 8 */
/***/ function(module, exports) {

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
	  }
	};
	
	EventObject.createEvent = function(type, detail, target, cancelable) {
	  return new EventObject(type, detail, target, cancelable);
	};
	
	
	module.exports = function(scope) {
	  var listeners = {}, paused = false;
	  
	  var on = function(type, fn) {
	    if( !type || typeof type !== 'string' ) return console.error('[firefront] type must be a string');
	    if( typeof fn !== 'function' ) return console.error('[firefront] listener must be a function');
	    
	    var types = type.split(' ');
	    types.forEach(function(type) {
	      listeners[type] = listeners[type] || [];
	      listeners[type].push(fn);
	    });
	    
	    return this;
	  };
	  
	  var once = function(type, fn) {
	    if( !type || typeof type !== 'string' ) return console.error('[firefront] type must be a string');
	    if( typeof fn !== 'function' ) return console.error('[firefront] listener must be a function');
	    
	    var types = type.split(' ');
	    types.forEach(function(type) {
	      var wrap = function(e) {
	        body.off(type, wrap);
	        return fn.call(this, e);
	      };
	      body.on(type, wrap);
	    });
	    
	    return this;
	  };
	  
	  var off = function(type, fn) {
	    if( !type || typeof type !== 'string' ) return console.error('[firefront] type must be a string');
	    if( typeof fn !== 'function' ) return console.error('[firefront] listener must be a function');
	    
	    var types = type.split(' ');
	    types.forEach(function(type) {
	      var fns = listeners[type];
	      if( fns ) for(var i;~(i = fns.indexOf(fn));) fns.splice(i, 1);
	    });
	    
	    return this;
	  };
	  
	  var dispatch = function(type, detail) {
	    if( paused ) return;
	    var typename = (type && type.type) || type;
	    if( !listeners[typename] && !listeners['*'] ) return;
	    
	    var event;
	    if( typeof type === 'string' ) {
	      event = EventObject.createEvent(type, detail, scope);
	    } else if( type instanceof EventObject ) {
	      event = type;
	    } else {
	      return console.error('illegal arguments, type is must be a string or event', type);
	    }
	    event.currentTarget = scope;
	    
	    var stopped = false, prevented = false;
	    var action = function(listener) {
	      if( stopped ) return;
	      listener.call(scope, event);
	      if( event.defaultPrevented === true ) prevented = true;
	      if( event.stopped === true ) stopped = true;
	      if( event.stoppedImmediate === true ) stopped = true;
	    };
	    
	    (listeners['*'] || []).slice().reverse().forEach(action);
	    (listeners[event.type] || []).slice().reverse().forEach(action);
	    
	    return !prevented;
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
	  
	  return {
	    on: on,
	    once: once,
	    off: off,
	    dispatch: dispatch,
	    has: has,
	    destroy: destroy,
	    pause: pause,
	    resume: resume
	  };
	};

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var getPosition = __webpack_require__(6);
	
	function isin(el, x, y) {
	  var p = getPosition(el);
	  if( x >= p.left && x <= (p.left + p.width) && y >= p.top && y <= (p.top + p.height) ) return true;
	  return false;
	}
	
	function remove(arr, item) {
	  if( ~arr.indexOf(item) ) arr.splice(arr.indexOf(item), 1);
	}
	
	var targets = [], entered = [], focused;
	function update(e) {
	  var x = e.pageX, y = e.pageY;
	  
	  if( !x && !y ) return;
	  
	  MouseObserver.x = x;
	  MouseObserver.y = y;
	  
	  var enter = false;
	  targets.forEach(function(target) {
	    if( isin(target.el, x, y) ) {
	      enter = true;
	      if( target.listeners.move ) {
	        target.listeners.move.forEach(function(fn) {
	          fn.call(target.el, e);
	        });
	      }
	      
	      if( !~entered.indexOf(target) && target.listeners.enter ) {
	        entered.push(target);
	        target.listeners.enter.forEach(function(fn) {
	          fn.call(target.el, e);
	        });
	      }
	      
	      if( e.type === 'click' ) {
	        if( target.listeners.click ) {
	          target.listeners.click.forEach(function(fn) {
	            fn.call(target.el, e);
	          });
	        }
	        
	        if( focused !== target ) {
	          if( focused && focused.listeners.blur ) {
	            focused.listeners.blur.forEach(function(fn) {
	              fn.call(focused.el, e);
	            });
	          }
	          
	          focused = target;
	          
	          if( target.listeners.focus ) {
	            target.listeners.focus.forEach(function(fn) {
	              fn.call(target.el, e);
	            });
	          }
	        }
	      }
	    } else {
	      if( ~entered.indexOf(target) && target.listeners.leave ) {
	        remove(entered, target);
	        target.listeners.leave.forEach(function(fn) {
	          fn.call(target.el, e);
	        });
	      }
	    }
	  });
	  
	  if( !enter && e.type == 'click' ) {
	    if( focused && focused.listeners.blur ) {
	      focused.listeners.blur.forEach(function(fn) {
	        fn.call(focused.el, e);
	      });
	    }
	    focused = null;
	  }
	};
	
	document.addEventListener('mousemove', update, false);
	document.addEventListener('mouseenter', update, false);
	document.addEventListener('click', update, false);
	
	var MouseObserver = function(el) {
	  var listeners = {};
	  var target = {
	    el: el,
	    listeners: listeners
	  };
	  
	  targets.push(target);
	  
	  return {
	    move: function(fn) {
	      listeners.move = listeners.move || [];
	      listeners.move.push(fn);
	      return this;
	    },
	    focus: function(fn) {
	      listeners.focus = listeners.focus || [];
	      listeners.focus.push(fn);
	      return this;
	    },
	    blur: function(fn) {
	      listeners.blur = listeners.blur || [];
	      listeners.blur.push(fn);
	      return this;
	    },
	    enter: function(fn) {
	      listeners.enter = listeners.enter || [];
	      listeners.enter.push(fn);
	      return this;
	    },
	    leave: function(fn) {
	      listeners.leave = listeners.leave || [];
	      listeners.leave.push(fn);
	      return this;
	    },
	    click: function(fn) {
	      listeners.click = listeners.click || [];
	      listeners.click.push(fn);
	      return this;
	    },
	    disconnect: function() {
	      remove(targets, target);
	      remove(entered, target);
	      if( focused === target ) focused = null;
	      return this;
	    }
	  }
	};
	
	module.exports = MouseObserver;

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var swal = __webpack_require__(11);
	var modal = __webpack_require__(20);
	
	__webpack_require__(28);
	
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
	    if( typeof options === 'string' ) options = {message:options};
	    if( typeof done === 'string' ) options.title = done, done = arguments[2];
	    
	    swal({
	      title: options.title,
	      text: options.message || options.text,
	      inputPlaceholder: options.inputPlaceholder || options.placeholder,
	      type: 'input',
	      confirmButtonColor: "#DD6B55",
	      confirmButtonText: "네",
	      cancelButtonText: "아니요",
	      showCancelButton: true,
	      closeOnConfirm: false
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
	      confirmButtonColor: "#DD6B55",
	      confirmButtonText: "네",
	      cancelButtonText: "아니요",
	      showCancelButton: true,
	      closeOnConfirm: false
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
	      html = '<div style="color:#474747;width:100%;height:150px;overflow:auto;font-size:12px;text-align:left;">' + text + '</div>';
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
	      html = '<div style="width:100%;height:150px;overflow:auto;font-size:9px;text-align:left;">' + text + '</div>';
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
/* 11 */
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
	
	var _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation = __webpack_require__(12);
	
	/*
	 * Handy utilities
	 */
	
	var _extend$hexToRgb$isIE8$logStr$colorLuminance = __webpack_require__(13);
	
	/*
	 *  Handle sweetAlert's DOM elements
	 */
	
	var _sweetAlertInitialize$getModal$getOverlay$getInput$setFocusStyle$openModal$resetInput$fixVerticalPosition = __webpack_require__(14);
	
	// Handle button events and keyboard events
	
	var _handleButton$handleConfirm$handleCancel = __webpack_require__(17);
	
	var _handleKeyDown = __webpack_require__(18);
	
	var _handleKeyDown2 = _interopRequireWildcard(_handleKeyDown);
	
	// Default values
	
	var _defaultParams = __webpack_require__(15);
	
	var _defaultParams2 = _interopRequireWildcard(_defaultParams);
	
	var _setParameters = __webpack_require__(19);
	
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
/* 12 */
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
/* 13 */
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
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	var _hexToRgb = __webpack_require__(13);
	
	var _removeClass$getTopMargin$fadeIn$show$addClass = __webpack_require__(12);
	
	var _defaultParams = __webpack_require__(15);
	
	var _defaultParams2 = _interopRequireWildcard(_defaultParams);
	
	/*
	 * Add modal + overlay to DOM
	 */
	
	var _injectedHTML = __webpack_require__(16);
	
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
/* 15 */
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
/* 16 */
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
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	var _colorLuminance = __webpack_require__(13);
	
	var _getModal = __webpack_require__(14);
	
	var _hasClass$isDescendant = __webpack_require__(12);
	
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
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	var _stopEventPropagation$fireClick = __webpack_require__(12);
	
	var _setFocusStyle = __webpack_require__(14);
	
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
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	var _isIE8 = __webpack_require__(13);
	
	var _getModal$getInput$setFocusStyle = __webpack_require__(14);
	
	var _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide = __webpack_require__(12);
	
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
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	var ajax = __webpack_require__(21);
	__webpack_require__(23);
	
	var z = 10000;
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
	        mask.style.display = 'none';
	        document.body.style.overflowY = null;
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
	    container.onclick = function(e) {
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
	  if( options.background ) div.style.background = options.background;
	  if( options.shadow !== false ) div.style.boxShadow = (typeof options.shadow == 'string') ? options.shadow : '0 5px 15px rgba(0,0,0,.5)';
	  
	  div.style.margin = (+options.margin || 0) + 'px auto';
	  
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
	        
	        if( options.closable !== false ) {
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
	        }
	      }, 10);
	    },
	    close: function() {
	      if( interval ) clearInterval(interval);
	      handle.onClose && handle.onClose(handle);
	      
	      div.style.opacity = 0;
	      div.style.transform = 'scale(.6,.6)';
	      
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
	    var shellhtml = __webpack_require__(27);
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
	      load({
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
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {module.export = function(src, done) {
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
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(22)(module)))

/***/ },
/* 22 */
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
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(24);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(26)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../css-loader/index.js!./../../../less-loader/index.js!./modal.less", function() {
				var newContent = require("!!./../../../css-loader/index.js!./../../../less-loader/index.js!./modal.less");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(25)();
	// imports
	
	
	// module
	exports.push([module.id, ".x-modal-shell {\n  background: #fff;\n}\n", ""]);
	
	// exports


/***/ },
/* 25 */
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
/* 26 */
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
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
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
/* 27 */
/***/ function(module, exports) {

	module.exports = "<div class=\"x-modal-shell\">\n  <div class=\"x-modal-shell-header\"></div>\n  <div class=\"x-modal-shell-body\"></div>\n  <div class=\"x-modal-shell-footer\"></div>\n</div>";

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(29);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(26)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../css-loader/index.js!./sweetalert.css", function() {
				var newContent = require("!!./../../css-loader/index.js!./sweetalert.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(25)();
	// imports
	
	
	// module
	exports.push([module.id, "body.stop-scrolling {\n  height: 100%;\n  overflow: hidden; }\n\n.sweet-overlay {\n  background-color: black;\n  /* IE8 */\n  -ms-filter: \"progid:DXImageTransform.Microsoft.Alpha(Opacity=40)\";\n  /* IE8 */\n  background-color: rgba(0, 0, 0, 0.4);\n  position: fixed;\n  left: 0;\n  right: 0;\n  top: 0;\n  bottom: 0;\n  display: none;\n  z-index: 10000; }\n\n.sweet-alert {\n  background-color: white;\n  font-family: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;\n  width: 478px;\n  padding: 17px;\n  border-radius: 5px;\n  text-align: center;\n  position: fixed;\n  left: 50%;\n  top: 50%;\n  margin-left: -256px;\n  margin-top: -200px;\n  overflow: hidden;\n  display: none;\n  z-index: 99999; }\n  @media all and (max-width: 540px) {\n    .sweet-alert {\n      width: auto;\n      margin-left: 0;\n      margin-right: 0;\n      left: 15px;\n      right: 15px; } }\n  .sweet-alert h2 {\n    color: #575757;\n    font-size: 30px;\n    text-align: center;\n    font-weight: 600;\n    text-transform: none;\n    position: relative;\n    margin: 25px 0;\n    padding: 0;\n    line-height: 40px;\n    display: block; }\n  .sweet-alert p {\n    color: #797979;\n    font-size: 16px;\n    text-align: center;\n    font-weight: 300;\n    position: relative;\n    text-align: inherit;\n    float: none;\n    margin: 0;\n    padding: 0;\n    line-height: normal; }\n  .sweet-alert fieldset {\n    border: none;\n    position: relative; }\n  .sweet-alert .sa-error-container {\n    background-color: #f1f1f1;\n    margin-left: -17px;\n    margin-right: -17px;\n    overflow: hidden;\n    padding: 0 10px;\n    max-height: 0;\n    webkit-transition: padding 0.15s, max-height 0.15s;\n    transition: padding 0.15s, max-height 0.15s; }\n    .sweet-alert .sa-error-container.show {\n      padding: 10px 0;\n      max-height: 100px;\n      webkit-transition: padding 0.2s, max-height 0.2s;\n      transition: padding 0.25s, max-height 0.25s; }\n    .sweet-alert .sa-error-container .icon {\n      display: inline-block;\n      width: 24px;\n      height: 24px;\n      border-radius: 50%;\n      background-color: #ea7d7d;\n      color: white;\n      line-height: 24px;\n      text-align: center;\n      margin-right: 3px; }\n    .sweet-alert .sa-error-container p {\n      display: inline-block; }\n  .sweet-alert .sa-input-error {\n    position: absolute;\n    top: 29px;\n    right: 26px;\n    width: 20px;\n    height: 20px;\n    opacity: 0;\n    -webkit-transform: scale(0.5);\n    transform: scale(0.5);\n    -webkit-transform-origin: 50% 50%;\n    transform-origin: 50% 50%;\n    -webkit-transition: all 0.1s;\n    transition: all 0.1s; }\n    .sweet-alert .sa-input-error::before, .sweet-alert .sa-input-error::after {\n      content: \"\";\n      width: 20px;\n      height: 6px;\n      background-color: #f06e57;\n      border-radius: 3px;\n      position: absolute;\n      top: 50%;\n      margin-top: -4px;\n      left: 50%;\n      margin-left: -9px; }\n    .sweet-alert .sa-input-error::before {\n      -webkit-transform: rotate(-45deg);\n      transform: rotate(-45deg); }\n    .sweet-alert .sa-input-error::after {\n      -webkit-transform: rotate(45deg);\n      transform: rotate(45deg); }\n    .sweet-alert .sa-input-error.show {\n      opacity: 1;\n      -webkit-transform: scale(1);\n      transform: scale(1); }\n  .sweet-alert input {\n    width: 100%;\n    box-sizing: border-box;\n    border-radius: 3px;\n    border: 1px solid #d7d7d7;\n    height: 43px;\n    margin-top: 10px;\n    margin-bottom: 17px;\n    font-size: 18px;\n    box-shadow: inset 0px 1px 1px rgba(0, 0, 0, 0.06);\n    padding: 0 12px;\n    display: none;\n    -webkit-transition: all 0.3s;\n    transition: all 0.3s; }\n    .sweet-alert input:focus {\n      outline: none;\n      box-shadow: 0px 0px 3px #c4e6f5;\n      border: 1px solid #b4dbed; }\n      .sweet-alert input:focus::-moz-placeholder {\n        transition: opacity 0.3s 0.03s ease;\n        opacity: 0.5; }\n      .sweet-alert input:focus:-ms-input-placeholder {\n        transition: opacity 0.3s 0.03s ease;\n        opacity: 0.5; }\n      .sweet-alert input:focus::-webkit-input-placeholder {\n        transition: opacity 0.3s 0.03s ease;\n        opacity: 0.5; }\n    .sweet-alert input::-moz-placeholder {\n      color: #bdbdbd; }\n    .sweet-alert input:-ms-input-placeholder {\n      color: #bdbdbd; }\n    .sweet-alert input::-webkit-input-placeholder {\n      color: #bdbdbd; }\n  .sweet-alert.show-input input {\n    display: block; }\n  .sweet-alert .sa-confirm-button-container {\n    display: inline-block;\n    position: relative; }\n  .sweet-alert .la-ball-fall {\n    position: absolute;\n    left: 50%;\n    top: 50%;\n    margin-left: -27px;\n    margin-top: 4px;\n    opacity: 0;\n    visibility: hidden; }\n  .sweet-alert button {\n    background-color: #8CD4F5;\n    color: white;\n    border: none;\n    box-shadow: none;\n    font-size: 17px;\n    font-weight: 500;\n    -webkit-border-radius: 4px;\n    border-radius: 5px;\n    padding: 10px 32px;\n    margin: 26px 5px 0 5px;\n    cursor: pointer; }\n    .sweet-alert button:focus {\n      outline: none;\n      box-shadow: 0 0 2px rgba(128, 179, 235, 0.5), inset 0 0 0 1px rgba(0, 0, 0, 0.05); }\n    .sweet-alert button:hover {\n      background-color: #7ecff4; }\n    .sweet-alert button:active {\n      background-color: #5dc2f1; }\n    .sweet-alert button.cancel {\n      background-color: #C1C1C1; }\n      .sweet-alert button.cancel:hover {\n        background-color: #b9b9b9; }\n      .sweet-alert button.cancel:active {\n        background-color: #a8a8a8; }\n      .sweet-alert button.cancel:focus {\n        box-shadow: rgba(197, 205, 211, 0.8) 0px 0px 2px, rgba(0, 0, 0, 0.0470588) 0px 0px 0px 1px inset !important; }\n    .sweet-alert button[disabled] {\n      opacity: .6;\n      cursor: default; }\n    .sweet-alert button.confirm[disabled] {\n      color: transparent; }\n      .sweet-alert button.confirm[disabled] ~ .la-ball-fall {\n        opacity: 1;\n        visibility: visible;\n        transition-delay: 0s; }\n    .sweet-alert button::-moz-focus-inner {\n      border: 0; }\n  .sweet-alert[data-has-cancel-button=false] button {\n    box-shadow: none !important; }\n  .sweet-alert[data-has-confirm-button=false][data-has-cancel-button=false] {\n    padding-bottom: 40px; }\n  .sweet-alert .sa-icon {\n    width: 80px;\n    height: 80px;\n    border: 4px solid gray;\n    -webkit-border-radius: 40px;\n    border-radius: 40px;\n    border-radius: 50%;\n    margin: 20px auto;\n    padding: 0;\n    position: relative;\n    box-sizing: content-box; }\n    .sweet-alert .sa-icon.sa-error {\n      border-color: #F27474; }\n      .sweet-alert .sa-icon.sa-error .sa-x-mark {\n        position: relative;\n        display: block; }\n      .sweet-alert .sa-icon.sa-error .sa-line {\n        position: absolute;\n        height: 5px;\n        width: 47px;\n        background-color: #F27474;\n        display: block;\n        top: 37px;\n        border-radius: 2px; }\n        .sweet-alert .sa-icon.sa-error .sa-line.sa-left {\n          -webkit-transform: rotate(45deg);\n          transform: rotate(45deg);\n          left: 17px; }\n        .sweet-alert .sa-icon.sa-error .sa-line.sa-right {\n          -webkit-transform: rotate(-45deg);\n          transform: rotate(-45deg);\n          right: 16px; }\n    .sweet-alert .sa-icon.sa-warning {\n      border-color: #F8BB86; }\n      .sweet-alert .sa-icon.sa-warning .sa-body {\n        position: absolute;\n        width: 5px;\n        height: 47px;\n        left: 50%;\n        top: 10px;\n        -webkit-border-radius: 2px;\n        border-radius: 2px;\n        margin-left: -2px;\n        background-color: #F8BB86; }\n      .sweet-alert .sa-icon.sa-warning .sa-dot {\n        position: absolute;\n        width: 7px;\n        height: 7px;\n        -webkit-border-radius: 50%;\n        border-radius: 50%;\n        margin-left: -3px;\n        left: 50%;\n        bottom: 10px;\n        background-color: #F8BB86; }\n    .sweet-alert .sa-icon.sa-info {\n      border-color: #C9DAE1; }\n      .sweet-alert .sa-icon.sa-info::before {\n        content: \"\";\n        position: absolute;\n        width: 5px;\n        height: 29px;\n        left: 50%;\n        bottom: 17px;\n        border-radius: 2px;\n        margin-left: -2px;\n        background-color: #C9DAE1; }\n      .sweet-alert .sa-icon.sa-info::after {\n        content: \"\";\n        position: absolute;\n        width: 7px;\n        height: 7px;\n        border-radius: 50%;\n        margin-left: -3px;\n        top: 19px;\n        background-color: #C9DAE1; }\n    .sweet-alert .sa-icon.sa-success {\n      border-color: #A5DC86; }\n      .sweet-alert .sa-icon.sa-success::before, .sweet-alert .sa-icon.sa-success::after {\n        content: '';\n        -webkit-border-radius: 40px;\n        border-radius: 40px;\n        border-radius: 50%;\n        position: absolute;\n        width: 60px;\n        height: 120px;\n        background: white;\n        -webkit-transform: rotate(45deg);\n        transform: rotate(45deg); }\n      .sweet-alert .sa-icon.sa-success::before {\n        -webkit-border-radius: 120px 0 0 120px;\n        border-radius: 120px 0 0 120px;\n        top: -7px;\n        left: -33px;\n        -webkit-transform: rotate(-45deg);\n        transform: rotate(-45deg);\n        -webkit-transform-origin: 60px 60px;\n        transform-origin: 60px 60px; }\n      .sweet-alert .sa-icon.sa-success::after {\n        -webkit-border-radius: 0 120px 120px 0;\n        border-radius: 0 120px 120px 0;\n        top: -11px;\n        left: 30px;\n        -webkit-transform: rotate(-45deg);\n        transform: rotate(-45deg);\n        -webkit-transform-origin: 0px 60px;\n        transform-origin: 0px 60px; }\n      .sweet-alert .sa-icon.sa-success .sa-placeholder {\n        width: 80px;\n        height: 80px;\n        border: 4px solid rgba(165, 220, 134, 0.2);\n        -webkit-border-radius: 40px;\n        border-radius: 40px;\n        border-radius: 50%;\n        box-sizing: content-box;\n        position: absolute;\n        left: -4px;\n        top: -4px;\n        z-index: 2; }\n      .sweet-alert .sa-icon.sa-success .sa-fix {\n        width: 5px;\n        height: 90px;\n        background-color: white;\n        position: absolute;\n        left: 28px;\n        top: 8px;\n        z-index: 1;\n        -webkit-transform: rotate(-45deg);\n        transform: rotate(-45deg); }\n      .sweet-alert .sa-icon.sa-success .sa-line {\n        height: 5px;\n        background-color: #A5DC86;\n        display: block;\n        border-radius: 2px;\n        position: absolute;\n        z-index: 2; }\n        .sweet-alert .sa-icon.sa-success .sa-line.sa-tip {\n          width: 25px;\n          left: 14px;\n          top: 46px;\n          -webkit-transform: rotate(45deg);\n          transform: rotate(45deg); }\n        .sweet-alert .sa-icon.sa-success .sa-line.sa-long {\n          width: 47px;\n          right: 8px;\n          top: 38px;\n          -webkit-transform: rotate(-45deg);\n          transform: rotate(-45deg); }\n    .sweet-alert .sa-icon.sa-custom {\n      background-size: contain;\n      border-radius: 0;\n      border: none;\n      background-position: center center;\n      background-repeat: no-repeat; }\n\n/*\n * Animations\n */\n@-webkit-keyframes showSweetAlert {\n  0% {\n    transform: scale(0.7);\n    -webkit-transform: scale(0.7); }\n  45% {\n    transform: scale(1.05);\n    -webkit-transform: scale(1.05); }\n  80% {\n    transform: scale(0.95);\n    -webkit-transform: scale(0.95); }\n  100% {\n    transform: scale(1);\n    -webkit-transform: scale(1); } }\n\n@keyframes showSweetAlert {\n  0% {\n    transform: scale(0.7);\n    -webkit-transform: scale(0.7); }\n  45% {\n    transform: scale(1.05);\n    -webkit-transform: scale(1.05); }\n  80% {\n    transform: scale(0.95);\n    -webkit-transform: scale(0.95); }\n  100% {\n    transform: scale(1);\n    -webkit-transform: scale(1); } }\n\n@-webkit-keyframes hideSweetAlert {\n  0% {\n    transform: scale(1);\n    -webkit-transform: scale(1); }\n  100% {\n    transform: scale(0.5);\n    -webkit-transform: scale(0.5); } }\n\n@keyframes hideSweetAlert {\n  0% {\n    transform: scale(1);\n    -webkit-transform: scale(1); }\n  100% {\n    transform: scale(0.5);\n    -webkit-transform: scale(0.5); } }\n\n@-webkit-keyframes slideFromTop {\n  0% {\n    top: 0%; }\n  100% {\n    top: 50%; } }\n\n@keyframes slideFromTop {\n  0% {\n    top: 0%; }\n  100% {\n    top: 50%; } }\n\n@-webkit-keyframes slideToTop {\n  0% {\n    top: 50%; }\n  100% {\n    top: 0%; } }\n\n@keyframes slideToTop {\n  0% {\n    top: 50%; }\n  100% {\n    top: 0%; } }\n\n@-webkit-keyframes slideFromBottom {\n  0% {\n    top: 70%; }\n  100% {\n    top: 50%; } }\n\n@keyframes slideFromBottom {\n  0% {\n    top: 70%; }\n  100% {\n    top: 50%; } }\n\n@-webkit-keyframes slideToBottom {\n  0% {\n    top: 50%; }\n  100% {\n    top: 70%; } }\n\n@keyframes slideToBottom {\n  0% {\n    top: 50%; }\n  100% {\n    top: 70%; } }\n\n.showSweetAlert[data-animation=pop] {\n  -webkit-animation: showSweetAlert 0.3s;\n  animation: showSweetAlert 0.3s; }\n\n.showSweetAlert[data-animation=none] {\n  -webkit-animation: none;\n  animation: none; }\n\n.showSweetAlert[data-animation=slide-from-top] {\n  -webkit-animation: slideFromTop 0.3s;\n  animation: slideFromTop 0.3s; }\n\n.showSweetAlert[data-animation=slide-from-bottom] {\n  -webkit-animation: slideFromBottom 0.3s;\n  animation: slideFromBottom 0.3s; }\n\n.hideSweetAlert[data-animation=pop] {\n  -webkit-animation: hideSweetAlert 0.2s;\n  animation: hideSweetAlert 0.2s; }\n\n.hideSweetAlert[data-animation=none] {\n  -webkit-animation: none;\n  animation: none; }\n\n.hideSweetAlert[data-animation=slide-from-top] {\n  -webkit-animation: slideToTop 0.4s;\n  animation: slideToTop 0.4s; }\n\n.hideSweetAlert[data-animation=slide-from-bottom] {\n  -webkit-animation: slideToBottom 0.3s;\n  animation: slideToBottom 0.3s; }\n\n@-webkit-keyframes animateSuccessTip {\n  0% {\n    width: 0;\n    left: 1px;\n    top: 19px; }\n  54% {\n    width: 0;\n    left: 1px;\n    top: 19px; }\n  70% {\n    width: 50px;\n    left: -8px;\n    top: 37px; }\n  84% {\n    width: 17px;\n    left: 21px;\n    top: 48px; }\n  100% {\n    width: 25px;\n    left: 14px;\n    top: 45px; } }\n\n@keyframes animateSuccessTip {\n  0% {\n    width: 0;\n    left: 1px;\n    top: 19px; }\n  54% {\n    width: 0;\n    left: 1px;\n    top: 19px; }\n  70% {\n    width: 50px;\n    left: -8px;\n    top: 37px; }\n  84% {\n    width: 17px;\n    left: 21px;\n    top: 48px; }\n  100% {\n    width: 25px;\n    left: 14px;\n    top: 45px; } }\n\n@-webkit-keyframes animateSuccessLong {\n  0% {\n    width: 0;\n    right: 46px;\n    top: 54px; }\n  65% {\n    width: 0;\n    right: 46px;\n    top: 54px; }\n  84% {\n    width: 55px;\n    right: 0px;\n    top: 35px; }\n  100% {\n    width: 47px;\n    right: 8px;\n    top: 38px; } }\n\n@keyframes animateSuccessLong {\n  0% {\n    width: 0;\n    right: 46px;\n    top: 54px; }\n  65% {\n    width: 0;\n    right: 46px;\n    top: 54px; }\n  84% {\n    width: 55px;\n    right: 0px;\n    top: 35px; }\n  100% {\n    width: 47px;\n    right: 8px;\n    top: 38px; } }\n\n@-webkit-keyframes rotatePlaceholder {\n  0% {\n    transform: rotate(-45deg);\n    -webkit-transform: rotate(-45deg); }\n  5% {\n    transform: rotate(-45deg);\n    -webkit-transform: rotate(-45deg); }\n  12% {\n    transform: rotate(-405deg);\n    -webkit-transform: rotate(-405deg); }\n  100% {\n    transform: rotate(-405deg);\n    -webkit-transform: rotate(-405deg); } }\n\n@keyframes rotatePlaceholder {\n  0% {\n    transform: rotate(-45deg);\n    -webkit-transform: rotate(-45deg); }\n  5% {\n    transform: rotate(-45deg);\n    -webkit-transform: rotate(-45deg); }\n  12% {\n    transform: rotate(-405deg);\n    -webkit-transform: rotate(-405deg); }\n  100% {\n    transform: rotate(-405deg);\n    -webkit-transform: rotate(-405deg); } }\n\n.animateSuccessTip {\n  -webkit-animation: animateSuccessTip 0.75s;\n  animation: animateSuccessTip 0.75s; }\n\n.animateSuccessLong {\n  -webkit-animation: animateSuccessLong 0.75s;\n  animation: animateSuccessLong 0.75s; }\n\n.sa-icon.sa-success.animate::after {\n  -webkit-animation: rotatePlaceholder 4.25s ease-in;\n  animation: rotatePlaceholder 4.25s ease-in; }\n\n@-webkit-keyframes animateErrorIcon {\n  0% {\n    transform: rotateX(100deg);\n    -webkit-transform: rotateX(100deg);\n    opacity: 0; }\n  100% {\n    transform: rotateX(0deg);\n    -webkit-transform: rotateX(0deg);\n    opacity: 1; } }\n\n@keyframes animateErrorIcon {\n  0% {\n    transform: rotateX(100deg);\n    -webkit-transform: rotateX(100deg);\n    opacity: 0; }\n  100% {\n    transform: rotateX(0deg);\n    -webkit-transform: rotateX(0deg);\n    opacity: 1; } }\n\n.animateErrorIcon {\n  -webkit-animation: animateErrorIcon 0.5s;\n  animation: animateErrorIcon 0.5s; }\n\n@-webkit-keyframes animateXMark {\n  0% {\n    transform: scale(0.4);\n    -webkit-transform: scale(0.4);\n    margin-top: 26px;\n    opacity: 0; }\n  50% {\n    transform: scale(0.4);\n    -webkit-transform: scale(0.4);\n    margin-top: 26px;\n    opacity: 0; }\n  80% {\n    transform: scale(1.15);\n    -webkit-transform: scale(1.15);\n    margin-top: -6px; }\n  100% {\n    transform: scale(1);\n    -webkit-transform: scale(1);\n    margin-top: 0;\n    opacity: 1; } }\n\n@keyframes animateXMark {\n  0% {\n    transform: scale(0.4);\n    -webkit-transform: scale(0.4);\n    margin-top: 26px;\n    opacity: 0; }\n  50% {\n    transform: scale(0.4);\n    -webkit-transform: scale(0.4);\n    margin-top: 26px;\n    opacity: 0; }\n  80% {\n    transform: scale(1.15);\n    -webkit-transform: scale(1.15);\n    margin-top: -6px; }\n  100% {\n    transform: scale(1);\n    -webkit-transform: scale(1);\n    margin-top: 0;\n    opacity: 1; } }\n\n.animateXMark {\n  -webkit-animation: animateXMark 0.5s;\n  animation: animateXMark 0.5s; }\n\n@-webkit-keyframes pulseWarning {\n  0% {\n    border-color: #F8D486; }\n  100% {\n    border-color: #F8BB86; } }\n\n@keyframes pulseWarning {\n  0% {\n    border-color: #F8D486; }\n  100% {\n    border-color: #F8BB86; } }\n\n.pulseWarning {\n  -webkit-animation: pulseWarning 0.75s infinite alternate;\n  animation: pulseWarning 0.75s infinite alternate; }\n\n@-webkit-keyframes pulseWarningIns {\n  0% {\n    background-color: #F8D486; }\n  100% {\n    background-color: #F8BB86; } }\n\n@keyframes pulseWarningIns {\n  0% {\n    background-color: #F8D486; }\n  100% {\n    background-color: #F8BB86; } }\n\n.pulseWarningIns {\n  -webkit-animation: pulseWarningIns 0.75s infinite alternate;\n  animation: pulseWarningIns 0.75s infinite alternate; }\n\n@-webkit-keyframes rotate-loading {\n  0% {\n    transform: rotate(0deg); }\n  100% {\n    transform: rotate(360deg); } }\n\n@keyframes rotate-loading {\n  0% {\n    transform: rotate(0deg); }\n  100% {\n    transform: rotate(360deg); } }\n\n/* Internet Explorer 9 has some special quirks that are fixed here */\n/* The icons are not animated. */\n/* This file is automatically merged into sweet-alert.min.js through Gulp */\n/* Error icon */\n.sweet-alert .sa-icon.sa-error .sa-line.sa-left {\n  -ms-transform: rotate(45deg) \\9; }\n\n.sweet-alert .sa-icon.sa-error .sa-line.sa-right {\n  -ms-transform: rotate(-45deg) \\9; }\n\n/* Success icon */\n.sweet-alert .sa-icon.sa-success {\n  border-color: transparent\\9; }\n\n.sweet-alert .sa-icon.sa-success .sa-line.sa-tip {\n  -ms-transform: rotate(45deg) \\9; }\n\n.sweet-alert .sa-icon.sa-success .sa-line.sa-long {\n  -ms-transform: rotate(-45deg) \\9; }\n\n/*!\n * Load Awesome v1.1.0 (http://github.danielcardoso.net/load-awesome/)\n * Copyright 2015 Daniel Cardoso <@DanielCardoso>\n * Licensed under MIT\n */\n.la-ball-fall,\n.la-ball-fall > div {\n  position: relative;\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box; }\n\n.la-ball-fall {\n  display: block;\n  font-size: 0;\n  color: #fff; }\n\n.la-ball-fall.la-dark {\n  color: #333; }\n\n.la-ball-fall > div {\n  display: inline-block;\n  float: none;\n  background-color: currentColor;\n  border: 0 solid currentColor; }\n\n.la-ball-fall {\n  width: 54px;\n  height: 18px; }\n\n.la-ball-fall > div {\n  width: 10px;\n  height: 10px;\n  margin: 4px;\n  border-radius: 100%;\n  opacity: 0;\n  -webkit-animation: ball-fall 1s ease-in-out infinite;\n  -moz-animation: ball-fall 1s ease-in-out infinite;\n  -o-animation: ball-fall 1s ease-in-out infinite;\n  animation: ball-fall 1s ease-in-out infinite; }\n\n.la-ball-fall > div:nth-child(1) {\n  -webkit-animation-delay: -200ms;\n  -moz-animation-delay: -200ms;\n  -o-animation-delay: -200ms;\n  animation-delay: -200ms; }\n\n.la-ball-fall > div:nth-child(2) {\n  -webkit-animation-delay: -100ms;\n  -moz-animation-delay: -100ms;\n  -o-animation-delay: -100ms;\n  animation-delay: -100ms; }\n\n.la-ball-fall > div:nth-child(3) {\n  -webkit-animation-delay: 0ms;\n  -moz-animation-delay: 0ms;\n  -o-animation-delay: 0ms;\n  animation-delay: 0ms; }\n\n.la-ball-fall.la-sm {\n  width: 26px;\n  height: 8px; }\n\n.la-ball-fall.la-sm > div {\n  width: 4px;\n  height: 4px;\n  margin: 2px; }\n\n.la-ball-fall.la-2x {\n  width: 108px;\n  height: 36px; }\n\n.la-ball-fall.la-2x > div {\n  width: 20px;\n  height: 20px;\n  margin: 8px; }\n\n.la-ball-fall.la-3x {\n  width: 162px;\n  height: 54px; }\n\n.la-ball-fall.la-3x > div {\n  width: 30px;\n  height: 30px;\n  margin: 12px; }\n\n/*\n * Animation\n */\n@-webkit-keyframes ball-fall {\n  0% {\n    opacity: 0;\n    -webkit-transform: translateY(-145%);\n    transform: translateY(-145%); }\n  10% {\n    opacity: .5; }\n  20% {\n    opacity: 1;\n    -webkit-transform: translateY(0);\n    transform: translateY(0); }\n  80% {\n    opacity: 1;\n    -webkit-transform: translateY(0);\n    transform: translateY(0); }\n  90% {\n    opacity: .5; }\n  100% {\n    opacity: 0;\n    -webkit-transform: translateY(145%);\n    transform: translateY(145%); } }\n\n@-moz-keyframes ball-fall {\n  0% {\n    opacity: 0;\n    -moz-transform: translateY(-145%);\n    transform: translateY(-145%); }\n  10% {\n    opacity: .5; }\n  20% {\n    opacity: 1;\n    -moz-transform: translateY(0);\n    transform: translateY(0); }\n  80% {\n    opacity: 1;\n    -moz-transform: translateY(0);\n    transform: translateY(0); }\n  90% {\n    opacity: .5; }\n  100% {\n    opacity: 0;\n    -moz-transform: translateY(145%);\n    transform: translateY(145%); } }\n\n@-o-keyframes ball-fall {\n  0% {\n    opacity: 0;\n    -o-transform: translateY(-145%);\n    transform: translateY(-145%); }\n  10% {\n    opacity: .5; }\n  20% {\n    opacity: 1;\n    -o-transform: translateY(0);\n    transform: translateY(0); }\n  80% {\n    opacity: 1;\n    -o-transform: translateY(0);\n    transform: translateY(0); }\n  90% {\n    opacity: .5; }\n  100% {\n    opacity: 0;\n    -o-transform: translateY(145%);\n    transform: translateY(145%); } }\n\n@keyframes ball-fall {\n  0% {\n    opacity: 0;\n    -webkit-transform: translateY(-145%);\n    -moz-transform: translateY(-145%);\n    -o-transform: translateY(-145%);\n    transform: translateY(-145%); }\n  10% {\n    opacity: .5; }\n  20% {\n    opacity: 1;\n    -webkit-transform: translateY(0);\n    -moz-transform: translateY(0);\n    -o-transform: translateY(0);\n    transform: translateY(0); }\n  80% {\n    opacity: 1;\n    -webkit-transform: translateY(0);\n    -moz-transform: translateY(0);\n    -o-transform: translateY(0);\n    transform: translateY(0); }\n  90% {\n    opacity: .5; }\n  100% {\n    opacity: 0;\n    -webkit-transform: translateY(145%);\n    -moz-transform: translateY(145%);\n    -o-transform: translateY(145%);\n    transform: translateY(145%); } }\n", ""]);
	
	// exports


/***/ },
/* 30 */
/***/ function(module, exports) {

	/*!
	 * Object.observe polyfill - v0.2.4
	 * by Massimo Artizzu (MaxArt2501)
	 *
	 * https://github.com/MaxArt2501/object-observe
	 *
	 * Licensed under the MIT License
	 * See LICENSE for details
	 */
	
	// Some type definitions
	/**
	 * This represents the data relative to an observed object
	 * @typedef  {Object}                     ObjectData
	 * @property {Map<Handler, HandlerData>}  handlers
	 * @property {String[]}                   properties
	 * @property {*[]}                        values
	 * @property {Descriptor[]}               descriptors
	 * @property {Notifier}                   notifier
	 * @property {Boolean}                    frozen
	 * @property {Boolean}                    extensible
	 * @property {Object}                     proto
	 */
	/**
	 * Function definition of a handler
	 * @callback Handler
	 * @param {ChangeRecord[]}                changes
	*/
	/**
	 * This represents the data relative to an observed object and one of its
	 * handlers
	 * @typedef  {Object}                     HandlerData
	 * @property {Map<Object, ObservedData>}  observed
	 * @property {ChangeRecord[]}             changeRecords
	 */
	/**
	 * @typedef  {Object}                     ObservedData
	 * @property {String[]}                   acceptList
	 * @property {ObjectData}                 data
	*/
	/**
	 * Type definition for a change. Any other property can be added using
	 * the notify() or performChange() methods of the notifier.
	 * @typedef  {Object}                     ChangeRecord
	 * @property {String}                     type
	 * @property {Object}                     object
	 * @property {String}                     [name]
	 * @property {*}                          [oldValue]
	 * @property {Number}                     [index]
	 */
	/**
	 * Type definition for a notifier (what Object.getNotifier returns)
	 * @typedef  {Object}                     Notifier
	 * @property {Function}                   notify
	 * @property {Function}                   performChange
	 */
	/**
	 * Function called with Notifier.performChange. It may optionally return a
	 * ChangeRecord that gets automatically notified, but `type` and `object`
	 * properties are overridden.
	 * @callback Performer
	 * @returns {ChangeRecord|undefined}
	 */
	
	Object.observe || (function(O, A, root, _undefined) {
	    "use strict";
	
	        /**
	         * Relates observed objects and their data
	         * @type {Map<Object, ObjectData}
	         */
	    var observed,
	        /**
	         * List of handlers and their data
	         * @type {Map<Handler, Map<Object, HandlerData>>}
	         */
	        handlers,
	
	        defaultAcceptList = [ "add", "update", "delete", "reconfigure", "setPrototype", "preventExtensions" ];
	
	    // Functions for internal usage
	
	        /**
	         * Checks if the argument is an Array object. Polyfills Array.isArray.
	         * @function isArray
	         * @param {?*} object
	         * @returns {Boolean}
	         */
	    var isArray = A.isArray || (function(toString) {
	            return function (object) { return toString.call(object) === "[object Array]"; };
	        })(O.prototype.toString),
	
	        /**
	         * Returns the index of an item in a collection, or -1 if not found.
	         * Uses the generic Array.indexOf or Array.prototype.indexOf if available.
	         * @function inArray
	         * @param {Array} array
	         * @param {*} pivot           Item to look for
	         * @param {Number} [start=0]  Index to start from
	         * @returns {Number}
	         */
	        inArray = A.prototype.indexOf ? A.indexOf || function(array, pivot, start) {
	            return A.prototype.indexOf.call(array, pivot, start);
	        } : function(array, pivot, start) {
	            for (var i = start || 0; i < array.length; i++)
	                if (array[i] === pivot)
	                    return i;
	            return -1;
	        },
	
	        /**
	         * Returns an instance of Map, or a Map-like object is Map is not
	         * supported or doesn't support forEach()
	         * @function createMap
	         * @returns {Map}
	         */
	        createMap = root.Map === _undefined || !Map.prototype.forEach ? function() {
	            // Lightweight shim of Map. Lacks clear(), entries(), keys() and
	            // values() (the last 3 not supported by IE11, so can't use them),
	            // it doesn't handle the constructor's argument (like IE11) and of
	            // course it doesn't support for...of.
	            // Chrome 31-35 and Firefox 13-24 have a basic support of Map, but
	            // they lack forEach(), so their native implementation is bad for
	            // this polyfill. (Chrome 36+ supports Object.observe.)
	            var keys = [], values = [];
	
	            return {
	                size: 0,
	                has: function(key) { return inArray(keys, key) > -1; },
	                get: function(key) { return values[inArray(keys, key)]; },
	                set: function(key, value) {
	                    var i = inArray(keys, key);
	                    if (i === -1) {
	                        keys.push(key);
	                        values.push(value);
	                        this.size++;
	                    } else values[i] = value;
	                },
	                "delete": function(key) {
	                    var i = inArray(keys, key);
	                    if (i > -1) {
	                        keys.splice(i, 1);
	                        values.splice(i, 1);
	                        this.size--;
	                    }
	                },
	                forEach: function(callback/*, thisObj*/) {
	                    for (var i = 0; i < keys.length; i++)
	                        callback.call(arguments[1], values[i], keys[i], this);
	                }
	            };
	        } : function() { return new Map(); },
	
	        /**
	         * Simple shim for Object.getOwnPropertyNames when is not available
	         * Misses checks on object, don't use as a replacement of Object.keys/getOwnPropertyNames
	         * @function getProps
	         * @param {Object} object
	         * @returns {String[]}
	         */
	        getProps = O.getOwnPropertyNames ? (function() {
	            var func = O.getOwnPropertyNames;
	            try {
	                arguments.callee;
	            } catch (e) {
	                // Strict mode is supported
	
	                // In strict mode, we can't access to "arguments", "caller" and
	                // "callee" properties of functions. Object.getOwnPropertyNames
	                // returns [ "prototype", "length", "name" ] in Firefox; it returns
	                // "caller" and "arguments" too in Chrome and in Internet
	                // Explorer, so those values must be filtered.
	                var avoid = (func(inArray).join(" ") + " ").replace(/prototype |length |name /g, "").slice(0, -1).split(" ");
	                if (avoid.length) func = function(object) {
	                    var props = O.getOwnPropertyNames(object);
	                    if (typeof object === "function")
	                        for (var i = 0, j; i < avoid.length;)
	                            if ((j = inArray(props, avoid[i++])) > -1)
	                                props.splice(j, 1);
	
	                    return props;
	                };
	            }
	            return func;
	        })() : function(object) {
	            // Poor-mouth version with for...in (IE8-)
	            var props = [], prop, hop;
	            if ("hasOwnProperty" in object) {
	                for (prop in object)
	                    if (object.hasOwnProperty(prop))
	                        props.push(prop);
	            } else {
	                hop = O.hasOwnProperty;
	                for (prop in object)
	                    if (hop.call(object, prop))
	                        props.push(prop);
	            }
	
	            // Inserting a common non-enumerable property of arrays
	            if (isArray(object))
	                props.push("length");
	
	            return props;
	        },
	
	        /**
	         * Return the prototype of the object... if defined.
	         * @function getPrototype
	         * @param {Object} object
	         * @returns {Object}
	         */
	        getPrototype = O.getPrototypeOf,
	
	        /**
	         * Return the descriptor of the object... if defined.
	         * IE8 supports a (useless) Object.getOwnPropertyDescriptor for DOM
	         * nodes only, so defineProperties is checked instead.
	         * @function getDescriptor
	         * @param {Object} object
	         * @param {String} property
	         * @returns {Descriptor}
	         */
	        getDescriptor = O.defineProperties && O.getOwnPropertyDescriptor,
	
	        /**
	         * Sets up the next check and delivering iteration, using
	         * requestAnimationFrame or a (close) polyfill.
	         * @function nextFrame
	         * @param {function} func
	         * @returns {number}
	         */
	        nextFrame = root.requestAnimationFrame || root.webkitRequestAnimationFrame || (function() {
	            var initial = +new Date,
	                last = initial;
	            return function(func) {
	                return setTimeout(function() {
	                    func((last = +new Date) - initial);
	                }, 17);
	            };
	        })(),
	
	        /**
	         * Sets up the observation of an object
	         * @function doObserve
	         * @param {Object} object
	         * @param {Handler} handler
	         * @param {String[]} [acceptList]
	         */
	        doObserve = function(object, handler, acceptList) {
	            var data = observed.get(object);
	
	            if (data) {
	                performPropertyChecks(data, object);
	                setHandler(object, data, handler, acceptList);
	            } else {
	                data = createObjectData(object);
	                setHandler(object, data, handler, acceptList);
	
	                if (observed.size === 1)
	                    // Let the observation begin!
	                    nextFrame(runGlobalLoop);
	            }
	        },
	
	        /**
	         * Creates the initial data for an observed object
	         * @function createObjectData
	         * @param {Object} object
	         */
	        createObjectData = function(object, data) {
	            var props = getProps(object),
	                values = [], descs, i = 0,
	                data = {
	                    handlers: createMap(),
	                    frozen: O.isFrozen ? O.isFrozen(object) : false,
	                    extensible: O.isExtensible ? O.isExtensible(object) : true,
	                    proto: getPrototype && getPrototype(object),
	                    properties: props,
	                    values: values,
	                    notifier: retrieveNotifier(object, data)
	                };
	
	            if (getDescriptor) {
	                descs = data.descriptors = [];
	                while (i < props.length) {
	                    descs[i] = getDescriptor(object, props[i]);
	                    values[i] = object[props[i++]];
	                }
	            } else while (i < props.length)
	                values[i] = object[props[i++]];
	
	            observed.set(object, data);
	
	            return data;
	        },
	
	        /**
	         * Performs basic property value change checks on an observed object
	         * @function performPropertyChecks
	         * @param {ObjectData} data
	         * @param {Object} object
	         * @param {String} [except]  Doesn't deliver the changes to the
	         *                           handlers that accept this type
	         */
	        performPropertyChecks = (function() {
	            var updateCheck = getDescriptor ? function(object, data, idx, except, descr) {
	                var key = data.properties[idx],
	                    value = object[key],
	                    ovalue = data.values[idx],
	                    odesc = data.descriptors[idx];
	
	                if ("value" in descr && (ovalue === value
	                        ? ovalue === 0 && 1/ovalue !== 1/value
	                        : ovalue === ovalue || value === value)) {
	                    addChangeRecord(object, data, {
	                        name: key,
	                        type: "update",
	                        object: object,
	                        oldValue: ovalue
	                    }, except);
	                    data.values[idx] = value;
	                }
	                if (odesc.configurable && (!descr.configurable
	                        || descr.writable !== odesc.writable
	                        || descr.enumerable !== odesc.enumerable
	                        || descr.get !== odesc.get
	                        || descr.set !== odesc.set)) {
	                    addChangeRecord(object, data, {
	                        name: key,
	                        type: "reconfigure",
	                        object: object,
	                        oldValue: ovalue
	                    }, except);
	                    data.descriptors[idx] = descr;
	                }
	            } : function(object, data, idx, except) {
	                var key = data.properties[idx],
	                    value = object[key],
	                    ovalue = data.values[idx];
	
	                if (ovalue === value ? ovalue === 0 && 1/ovalue !== 1/value
	                        : ovalue === ovalue || value === value) {
	                    addChangeRecord(object, data, {
	                        name: key,
	                        type: "update",
	                        object: object,
	                        oldValue: ovalue
	                    }, except);
	                    data.values[idx] = value;
	                }
	            };
	
	            // Checks if some property has been deleted
	            var deletionCheck = getDescriptor ? function(object, props, proplen, data, except) {
	                var i = props.length, descr;
	                while (proplen && i--) {
	                    if (props[i] !== null) {
	                        descr = getDescriptor(object, props[i]);
	                        proplen--;
	
	                        // If there's no descriptor, the property has really
	                        // been deleted; otherwise, it's been reconfigured so
	                        // that's not enumerable anymore
	                        if (descr) updateCheck(object, data, i, except, descr);
	                        else {
	                            addChangeRecord(object, data, {
	                                name: props[i],
	                                type: "delete",
	                                object: object,
	                                oldValue: data.values[i]
	                            }, except);
	                            data.properties.splice(i, 1);
	                            data.values.splice(i, 1);
	                            data.descriptors.splice(i, 1);
	                        }
	                    }
	                }
	            } : function(object, props, proplen, data, except) {
	                var i = props.length;
	                while (proplen && i--)
	                    if (props[i] !== null) {
	                        addChangeRecord(object, data, {
	                            name: props[i],
	                            type: "delete",
	                            object: object,
	                            oldValue: data.values[i]
	                        }, except);
	                        data.properties.splice(i, 1);
	                        data.values.splice(i, 1);
	                        proplen--;
	                    }
	            };
	
	            return function(data, object, except) {
	                if (!data.handlers.size || data.frozen) return;
	
	                var props, proplen, keys,
	                    values = data.values,
	                    descs = data.descriptors,
	                    i = 0, idx,
	                    key, value,
	                    proto, descr;
	
	                // If the object isn't extensible, we don't need to check for new
	                // or deleted properties
	                if (data.extensible) {
	
	                    props = data.properties.slice();
	                    proplen = props.length;
	                    keys = getProps(object);
	
	                    if (descs) {
	                        while (i < keys.length) {
	                            key = keys[i++];
	                            idx = inArray(props, key);
	                            descr = getDescriptor(object, key);
	
	                            if (idx === -1) {
	                                addChangeRecord(object, data, {
	                                    name: key,
	                                    type: "add",
	                                    object: object
	                                }, except);
	                                data.properties.push(key);
	                                values.push(object[key]);
	                                descs.push(descr);
	                            } else {
	                                props[idx] = null;
	                                proplen--;
	                                updateCheck(object, data, idx, except, descr);
	                            }
	                        }
	                        deletionCheck(object, props, proplen, data, except);
	
	                        if (!O.isExtensible(object)) {
	                            data.extensible = false;
	                            addChangeRecord(object, data, {
	                                type: "preventExtensions",
	                                object: object
	                            }, except);
	
	                            data.frozen = O.isFrozen(object);
	                        }
	                    } else {
	                        while (i < keys.length) {
	                            key = keys[i++];
	                            idx = inArray(props, key);
	                            value = object[key];
	
	                            if (idx === -1) {
	                                addChangeRecord(object, data, {
	                                    name: key,
	                                    type: "add",
	                                    object: object
	                                }, except);
	                                data.properties.push(key);
	                                values.push(value);
	                            } else {
	                                props[idx] = null;
	                                proplen--;
	                                updateCheck(object, data, idx, except);
	                            }
	                        }
	                        deletionCheck(object, props, proplen, data, except);
	                    }
	
	                } else if (!data.frozen) {
	
	                    // If the object is not extensible, but not frozen, we just have
	                    // to check for value changes
	                    for (; i < props.length; i++) {
	                        key = props[i];
	                        updateCheck(object, data, i, except, getDescriptor(object, key));
	                    }
	
	                    if (O.isFrozen(object))
	                        data.frozen = true;
	                }
	
	                if (getPrototype) {
	                    proto = getPrototype(object);
	                    if (proto !== data.proto) {
	                        addChangeRecord(object, data, {
	                            type: "setPrototype",
	                            name: "__proto__",
	                            object: object,
	                            oldValue: data.proto
	                        });
	                        data.proto = proto;
	                    }
	                }
	            };
	        })(),
	
	        /**
	         * Sets up the main loop for object observation and change notification
	         * It stops if no object is observed.
	         * @function runGlobalLoop
	         */
	        runGlobalLoop = function() {
	            if (observed.size) {
	                observed.forEach(performPropertyChecks);
	                handlers.forEach(deliverHandlerRecords);
	                nextFrame(runGlobalLoop);
	            }
	        },
	
	        /**
	         * Deliver the change records relative to a certain handler, and resets
	         * the record list.
	         * @param {HandlerData} hdata
	         * @param {Handler} handler
	         */
	        deliverHandlerRecords = function(hdata, handler) {
	            var records = hdata.changeRecords;
	            if (records.length) {
	                hdata.changeRecords = [];
	                handler(records);
	            }
	        },
	
	        /**
	         * Returns the notifier for an object - whether it's observed or not
	         * @function retrieveNotifier
	         * @param {Object} object
	         * @param {ObjectData} [data]
	         * @returns {Notifier}
	         */
	        retrieveNotifier = function(object, data) {
	            if (arguments.length < 2)
	                data = observed.get(object);
	
	            /** @type {Notifier} */
	            return data && data.notifier || {
	                /**
	                 * @method notify
	                 * @see http://arv.github.io/ecmascript-object-observe/#notifierprototype._notify
	                 * @memberof Notifier
	                 * @param {ChangeRecord} changeRecord
	                 */
	                notify: function(changeRecord) {
	                    changeRecord.type; // Just to check the property is there...
	
	                    // If there's no data, the object has been unobserved
	                    var data = observed.get(object);
	                    if (data) {
	                        var recordCopy = { object: object }, prop;
	                        for (prop in changeRecord)
	                            if (prop !== "object")
	                                recordCopy[prop] = changeRecord[prop];
	                        addChangeRecord(object, data, recordCopy);
	                    }
	                },
	
	                /**
	                 * @method performChange
	                 * @see http://arv.github.io/ecmascript-object-observe/#notifierprototype_.performchange
	                 * @memberof Notifier
	                 * @param {String} changeType
	                 * @param {Performer} func     The task performer
	                 * @param {*} [thisObj]        Used to set `this` when calling func
	                 */
	                performChange: function(changeType, func/*, thisObj*/) {
	                    if (typeof changeType !== "string")
	                        throw new TypeError("Invalid non-string changeType");
	
	                    if (typeof func !== "function")
	                        throw new TypeError("Cannot perform non-function");
	
	                    // If there's no data, the object has been unobserved
	                    var data = observed.get(object),
	                        prop, changeRecord,
	                        thisObj = arguments[2],
	                        result = thisObj === _undefined ? func() : func.call(thisObj);
	
	                    data && performPropertyChecks(data, object, changeType);
	
	                    // If there's no data, the object has been unobserved
	                    if (data && result && typeof result === "object") {
	                        changeRecord = { object: object, type: changeType };
	                        for (prop in result)
	                            if (prop !== "object" && prop !== "type")
	                                changeRecord[prop] = result[prop];
	                        addChangeRecord(object, data, changeRecord);
	                    }
	                }
	            };
	        },
	
	        /**
	         * Register (or redefines) an handler in the collection for a given
	         * object and a given type accept list.
	         * @function setHandler
	         * @param {Object} object
	         * @param {ObjectData} data
	         * @param {Handler} handler
	         * @param {String[]} acceptList
	         */
	        setHandler = function(object, data, handler, acceptList) {
	            var hdata = handlers.get(handler);
	            if (!hdata)
	                handlers.set(handler, hdata = {
	                    observed: createMap(),
	                    changeRecords: []
	                });
	            hdata.observed.set(object, {
	                acceptList: acceptList.slice(),
	                data: data
	            });
	            data.handlers.set(handler, hdata);
	        },
	
	        /**
	         * Adds a change record in a given ObjectData
	         * @function addChangeRecord
	         * @param {Object} object
	         * @param {ObjectData} data
	         * @param {ChangeRecord} changeRecord
	         * @param {String} [except]
	         */
	        addChangeRecord = function(object, data, changeRecord, except) {
	            data.handlers.forEach(function(hdata) {
	                var acceptList = hdata.observed.get(object).acceptList;
	                // If except is defined, Notifier.performChange has been
	                // called, with except as the type.
	                // All the handlers that accepts that type are skipped.
	                if ((typeof except !== "string"
	                        || inArray(acceptList, except) === -1)
	                        && inArray(acceptList, changeRecord.type) > -1)
	                    hdata.changeRecords.push(changeRecord);
	            });
	        };
	
	    observed = createMap();
	    handlers = createMap();
	
	    /**
	     * @function Object.observe
	     * @see http://arv.github.io/ecmascript-object-observe/#Object.observe
	     * @param {Object} object
	     * @param {Handler} handler
	     * @param {String[]} [acceptList]
	     * @throws {TypeError}
	     * @returns {Object}               The observed object
	     */
	    O.observe = function observe(object, handler, acceptList) {
	        if (!object || typeof object !== "object" && typeof object !== "function")
	            throw new TypeError("Object.observe cannot observe non-object");
	
	        if (typeof handler !== "function")
	            throw new TypeError("Object.observe cannot deliver to non-function");
	
	        if (O.isFrozen && O.isFrozen(handler))
	            throw new TypeError("Object.observe cannot deliver to a frozen function object");
	
	        if (acceptList === _undefined)
	            acceptList = defaultAcceptList;
	        else if (!acceptList || typeof acceptList !== "object")
	            throw new TypeError("Third argument to Object.observe must be an array of strings.");
	
	        doObserve(object, handler, acceptList);
	
	        return object;
	    };
	
	    /**
	     * @function Object.unobserve
	     * @see http://arv.github.io/ecmascript-object-observe/#Object.unobserve
	     * @param {Object} object
	     * @param {Handler} handler
	     * @throws {TypeError}
	     * @returns {Object}         The given object
	     */
	    O.unobserve = function unobserve(object, handler) {
	        if (object === null || typeof object !== "object" && typeof object !== "function")
	            throw new TypeError("Object.unobserve cannot unobserve non-object");
	
	        if (typeof handler !== "function")
	            throw new TypeError("Object.unobserve cannot deliver to non-function");
	
	        var hdata = handlers.get(handler), odata;
	
	        if (hdata && (odata = hdata.observed.get(object))) {
	            hdata.observed.forEach(function(odata, object) {
	                performPropertyChecks(odata.data, object);
	            });
	            nextFrame(function() {
	                deliverHandlerRecords(hdata, handler);
	            });
	
	            // In Firefox 13-18, size is a function, but createMap should fall
	            // back to the shim for those versions
	            if (hdata.observed.size === 1 && hdata.observed.has(object))
	                handlers["delete"](handler);
	            else hdata.observed["delete"](object);
	
	            if (odata.data.handlers.size === 1)
	                observed["delete"](object);
	            else odata.data.handlers["delete"](handler);
	        }
	
	        return object;
	    };
	
	    /**
	     * @function Object.getNotifier
	     * @see http://arv.github.io/ecmascript-object-observe/#GetNotifier
	     * @param {Object} object
	     * @throws {TypeError}
	     * @returns {Notifier}
	     */
	    O.getNotifier = function getNotifier(object) {
	        if (object === null || typeof object !== "object" && typeof object !== "function")
	            throw new TypeError("Object.getNotifier cannot getNotifier non-object");
	
	        if (O.isFrozen && O.isFrozen(object)) return null;
	
	        return retrieveNotifier(object);
	    };
	
	    /**
	     * @function Object.deliverChangeRecords
	     * @see http://arv.github.io/ecmascript-object-observe/#Object.deliverChangeRecords
	     * @see http://arv.github.io/ecmascript-object-observe/#DeliverChangeRecords
	     * @param {Handler} handler
	     * @throws {TypeError}
	     */
	    O.deliverChangeRecords = function deliverChangeRecords(handler) {
	        if (typeof handler !== "function")
	            throw new TypeError("Object.deliverChangeRecords cannot deliver to non-function");
	
	        var hdata = handlers.get(handler);
	        if (hdata) {
	            hdata.observed.forEach(function(odata, object) {
	                performPropertyChecks(odata.data, object);
	            });
	            deliverHandlerRecords(hdata, handler);
	        }
	    };
	
	})(Object, Array, this);


/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(32);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(26)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/less-loader/index.js!./index.less", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/less-loader/index.js!./index.less");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(25)();
	// imports
	
	
	// module
	exports.push([module.id, ".ff {\n  cursor: pointer;\n  cursor: hand;\n}\n.ff:hover {\n  outline: #eee dotted thin;\n}\n.ff {\n  cursor: pointer;\n  cursor: hand;\n}\n.ff:hover {\n  outline: #eee dotted thin;\n}\n.ff-toolbar {\n  border: none;\n  box-sizing: border-box;\n  border-radius: 50px;\n  background-color: rgba(0, 0, 0, 0.85);\n}\n.ff-toolbar ul {\n  display: block;\n  margin: 0;\n  padding: 0;\n}\n.ff-toolbar ul:after {\n  clear: both;\n  content: \"\";\n  display: table;\n}\n.ff-toolbar ul li {\n  float: left;\n  list-style: none;\n  margin: 0;\n  padding: 0;\n}\n.ff-toolbar ul li a:hover,\n.ff-toolbar ul li a:active,\n.ff-toolbar ul li a:focus {\n  text-decoration: none;\n}\n.ff-toolbar ul li a {\n  display: block;\n  cursor: pointer;\n  font-size: 1em;\n  line-height: 1em;\n  background-color: transparent;\n  color: #fff;\n  margin: 12px 10px;\n  text-decoration: none;\n}\n.ff-toolbar ul li a:hover {\n  color: #2796DD;\n}\n.ff-toolbar ul li.active a {\n  color: #2796DD;\n}\n.ff-toolbar ul li:first-child {\n  padding-left: 15px;\n}\n.ff-toolbar ul li:last-child {\n  padding-right: 15px;\n}\n.ff-toolbar.ff-toolbar-vertical ul li {\n  float: initial;\n}\n.ff-toolbar.ff-toolbar-vertical ul li a {\n  margin: 15px 14px;\n}\n.ff-toolbar.ff-toolbar-vertical ul li:first-child {\n  padding-top: 10px;\n  padding-left: 0;\n}\n.ff-toolbar.ff-toolbar-vertical ul li:last-child {\n  padding-bottom: 10px;\n  padding-right: 0;\n}\n", ""]);
	
	// exports


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	var xmodal = __webpack_require__(10);
	var Part = __webpack_require__(3);
	
	function anchorPrevent(e) {
	  e.preventDefault();
	  e.stopPropagation();
	}
	
	function HTMLPart(el) {
	  Part.call(this, el);
	  
	  var part = this;
	  var defaults = this._defaults = {
	    style: el.getAttribute('style'),
	    cls: el.className,
	    html: el.innerHTML
	  };
	  var prevented = [];
	  
	  this.highlighter().enable(false);
	  
	  part
	  .on('modechange', function(e) {
	    if( !this.editmode() ) {
	      el.removeAttribute('contenteditable');
	      
	      prevented.forEach(function(node) {
	        node.removeEventListener('click', anchorPrevent);
	      });
	      prevented = [];
	    } else {
	      el.setAttribute('contenteditable', 'true');
	      
	      [].forEach.call(el.querySelectorAll('[href]'), function(node) {
	        node.addEventListener('click', anchorPrevent);
	        prevented.push(node);
	      });
	    }
	  })
	  .on('update', function() {
	    var data = this.data();
	    
	    if( data.cls ) {
	      var cls = (ocls || '').trim().split(' ');
	      data.cls.split(' ').forEach(function(c) {
	        if( c ) cls.push(c);
	      });
	      el.className = cls.join(' ');
	    }
	    
	    if( data.style ) {
	      var style = (ostyle || '').trim().split(';');
	      data.style.split(' ').forEach(function(c) {
	        if( c ) style.push(c);
	      });
	      
	      el.style = style.join(';');
	    }
	    
	    if( data.html ) {
	      el.innerHTML = data.html;
	    } else {
	      el.innerHTML = this.defaults().html;
	    }
	  })
	  .on('close', function() {
	    el.removeAttribute('contenteditable');
	  })
	  .on('blur', function() {
	    this.data().html = el.innerHTML;
	  });
	  
	  this.toolbar().first({
	    text: '<i class="fa fa-gear"></i>',
	    fn: function(e) {
	      this.owner().config();
	    }
	  });
	};
	
	HTMLPart.prototype = new Part;
	
	HTMLPart.prototype.defaults = function() {
	  if( !arguments.length ) return this._defaults;
	};
	
	HTMLPart.prototype.restoreDefaults = function() {
	  var defaults = this._defaults;
	  var el = this.element();
	  if( defaults ) {
	    if( defaults.style ) el.setAttribute('style', defaults.style);
	    else el.removeAttribute('style');
	    
	    if( defaults.cls ) el.setAttribute('class', defaults.cls);
	    else el.removeAttribute('class');
	    
	    el.innerHTML = defaults.html || '';
	  }
	  return this;
	};
	
	HTMLPart.prototype.config = function() {
	  var part = this;
	  var el = this.element();
	  
	  xmodal.open(__webpack_require__(34), function(err, modal) {
	    if( err ) return xmodal.error(err);
	    
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
	};
	
	module.exports = HTMLPart;

/***/ },
/* 34 */
/***/ function(module, exports) {

	module.exports = "<div class=\"ff-dialog bs\">\n  <div class=\"p0\">\n    <form class=\"form-horizontal\">\n      <div class=\"panel m0\">\n        <div class=\"panel-heading\">\n          <ul class=\"nav panel-tabs panel-tabs-left\">\n            <li class=\"active\">\n              <a href=\"#style\" data-toggle=\"tab\"><i class=\"fa fa-info-circle\"></i> 스타일/클래스</a>\n            </li>\n            <li>\n              <a href=\"#source\" data-toggle=\"tab\"><i class=\"fa fa-check-circle-o\"></i> HTML 소스</a>\n            </li>\n          </ul>\n        </div>\n        \n        <div class=\"panel-body p15\">\n          <!-- panel body -->\n          <div class=\"tab-content\">\n            <!-- 스타일/클래스 -->\n            <div class=\"tab-pane active p15\" id=\"style\" role=\"tabpanel\">\n              <div class=\"form-group\">\n                <label>스타일</label>\n                <input type=\"text\" name=\"style\" class=\"form-control\" placeholder=\"스타일\">\n              </div>\n              <div class=\"form-group\">\n                <label>클래스</label>\n                <input type=\"text\" name=\"cls\" class=\"form-control\" placeholder=\"클래스\">\n              </div>\n            </div>\n            \n            <!-- HTML -->\n            <div class=\"tab-pane\" id=\"source\" role=\"tabpanel\">\n              <textarea name=\"html\" class=\"form-control\" style=\"height: 400px;\"></textarea>\n            </div>\n          </div>\n        </div>\n        \n        <div class=\"panel-footer\">\n          <div class=\"row\">\n            <div class=\"col-md-6\"></div>\n            <div class=\"col-md-6 text-right\">\n              <button type=\"button\" class=\"btn btn-default\" modal-close>취소</button>\n              <button type=\"submit\" class=\"btn btn-primary\">적용</button>\n            </div>\n          </div>\n        </div>\n      </div>\n    </form>\n  </div>\n</div>";

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	var xmodal = __webpack_require__(10);
	var Part = __webpack_require__(3);
	
	module.exports = function ImagePart(el) {
	  Part.call(this, el);
	};

/***/ },
/* 36 */
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

/***/ }
/******/ ])
});
;
//# sourceMappingURL=firefront.js.map