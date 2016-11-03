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
/******/ ({

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	var Editor = __webpack_require__(71);
	var Part = __webpack_require__(72);
	var HTMLPart = __webpack_require__(85);
	var Toolbar = __webpack_require__(76);
	var ImagePart = __webpack_require__(87);
	var Types = __webpack_require__(73);
	var connect = __webpack_require__(88);
	
	var editors = new WeakMap();
	var emptykey = {};
	var ctx = module.exports = {
	  Part: Part,
	  HTMLPart: HTMLPart,
	  ImagePart: ImagePart,
	  Toolbar: Toolbar,
	  connect: connect,
	  editor: function(el) {
	    var key = el || emptykey;
	    if( editors.has(key) ) return editors.get(key);
	    editors.set(key, new Editor(el));
	    return editors.get(key);
	  },
	  type: function(type, fn) {
	    if( !arguments.length ) return console.error('missing type name');
	    if( arguments.length === 1 ) return Part.types.get(type);
	    Part.types.add(type, fn);
	    return this;
	  }
	};
	
	ctx.type('html', ctx.HTMLPart);
	ctx.type('image', ctx.ImagePart);


/***/ },

/***/ 71:
/***/ function(module, exports, __webpack_require__) {

	var Part = __webpack_require__(72);
	var Toolbar = __webpack_require__(76);
	
	__webpack_require__(81);
	
	function ensure(fn) {
	  if( document.body ) fn();
	  else window.addEventListener('DOMContentLoaded', fn);
	}
	
	var Editor = function(root) {
	  if( root && !Part.isElement(root) ) throw new TypeError('invalid element');
	  
	  var parts = {};
	  var data = {};
	  var types = {};
	  var observer;
	  var editmode = false;
	  
	  ensure(function() {
	    editor.reset();
	  });
	  
	  var editor = {
	    element: function() {
	      return root || document.body;
	    },
	    editmode: function(b) {
	      if( !arguments.length ) return editmode;
	      editmode = !!b;
	      for(var k in parts) {
	        parts[k].editmode(!!b);
	      }
	      return this;
	    },
	    data: function(d) {
	      if( !arguments.length ) {
	        var data = {};
	        for(var k in parts) data[k] = parts[k].data;
	        return data;
	      }
	      
	      editor.reset(d || {});
	      return this;
	    },
	    reset: function(d) {
	      if( !arguments.length ) d = data;
	      data = d || {};
	      if( !document.body ) return this;
	      
	      var root = this.element();
	      for(var k in parts) {
	        if( !root.contains(parts[k].element()) ) {
	          parts[k].close();
	          delete parts[k];
	        }
	      }
	      
	      [].forEach.call(root.querySelectorAll('[ff-id]') , function(el) {
	        var id = el.getAttribute('ff-id');
	        var part = el.__ff__;
	        
	        if( !part ) {
	          var type = el.getAttribute('ff-type') || 'html';
	          var Type = editor.type(type);
	          if( !Type ) Type = Part;
	          part = el.__ff__ = new Type(el);
	        }
	        
	        part.editor = editor;
	        part.data(data[id] || null);
	        part.editmode(editmode);
	        
	        parts[id] = part;
	      });
	      return this;
	    },
	    toolbar: function() {
	      return toolbar;
	    },
	    part: function(id) {
	      return parts[id];
	    },
	    clear: function(id) {
	      parts[id] && parts[id].data(null);
	      return this;
	    },
	    close: function() {
	      this.editmode(false);
	      for(var k in parts) parts[k].close();
	      return this;
	    },
	    type: function(type, fn) {
	      if( !arguments.length ) return console.error('missing type name');
	      if( arguments.length === 1 ) return types[type] || Part.types.get(type);
	      types[type] = fn;
	      return this;
	    }
	  };
	  
	  var toolbar = new Toolbar(editor, {
	    fixed: true,
	    top: 20,
	    right: 20,
	    cls: 'ff-editor-toolbar'
	  });
	  
	  return editor;
	};
	
	module.exports = Editor;

/***/ },

/***/ 72:
/***/ function(module, exports, __webpack_require__) {

	var Types = __webpack_require__(73);
	var Highlighter = __webpack_require__(74);
	var Toolbar = __webpack_require__(76);
	var Events = __webpack_require__(77);
	var MouseObserver = __webpack_require__(78);
	var xmodal = __webpack_require__(79);
	
	function isElement(o){
	  return (
	    typeof HTMLElement === 'object' ? o instanceof HTMLElement : //DOM2
	    o && typeof o === 'object' && o !== null && o.nodeType === 1 && typeof o.nodeName==='string'
	  );
	}
	
	function Part(el) {
	  if( !arguments.length ) return;
	  if( !isElement(el) ) throw new TypeError('Argument element must be an element');
	  
	  var id = el.getAttribute('ff-id');
	  var ostyle = el.style;
	  var original = el.innerHTML;
	  var ocls = el.className;
	  var emitter = Events(this);
	  var highlighter = Highlighter(el);
	  var self = this;
	  
	  var toolbar = new Toolbar(this, {
	    position: 'top center',
	    group: 'part',
	    cls: 'ff-part-toolbar'
	  }).add({
	    text: '<i class="fa fa-gear"></i>',
	    fn: function(e) {
	      self.config();
	    }
	  });
	  
	  emitter.on('update', function() {
	    if( !this.data() ) el.innerHTML = original;
	  })
	  .on('close', function() {
	    el.innerHTML = original;
	  });
	  
	  var isenter = function(target) {
	    var hel = highlighter.element;
	    if( target === el || el.contains(target) || hel === target || (hel && hel.contains(target)) ) return true;
	    return false;
	  };
	  
	  var mouseobserver = MouseObserver(el)
	  .enter(function(e) {
	    if( !self.editmode() ) return;
	    if( !isenter(e.target) ) return;
	    self.highlighter().show();
	    emitter.emit('enter');
	  })
	  .leave(function(e) {
	    if( !self.editmode() ) return;
	    self.highlighter().hide();
	    emitter.emit('leave');
	  })
	  .click(function(e) {
	    if( !self.editmode() ) return;
	    if( !isenter(e.target) ) return;
	    emitter.emit('click');
	  })
	  .focus(function(e) {
	    if( !self.editmode() ) return;
	    if( !isenter(e.target) ) return;
	    self.toolbar().show();
	    emitter.emit('focus');
	  })
	  .blur(function(e) {
	    if( !self.editmode() ) return;
	    self.toolbar().hide();
	    highlighter.hide();
	    emitter.emit('blur');
	  });
	  
	  this._id = id;
	  this._data = {};
	  this._emitter = emitter;
	  this._mouseobserver = mouseobserver;
	  this._emitter = emitter;
	  this._element = el;
	  this._original = original;
	  this._toolbar = toolbar;
	  this._highlighter = highlighter;
	}
	
	Part.prototype = {
	  id: function() {
	    return this._id;
	  },
	  mouseobserver: function() {
	    return this._mouseobserver;
	  },
	  toolbar: function() {
	    return this._toolbar;
	  },
	  highlighter: function() {
	    return this._highlighter;
	  },
	  element: function() {
	    return this._element;
	  },
	  editmode: function(b) {
	    if( !arguments.length ) return this._editmode;
	    var prev = this._editmode;
	    var editmode = this._editmode = !!b;
	    
	    if( editmode !== prev ) this._emitter.emit('modechange', {editmode: editmode});
	    if( !editmode ) {
	      this.toolbar().hide();
	      this.highlighter().hide();
	    }
	    return this;
	  },
	  data: function(value) {
	    if( !arguments.length ) return this._data;
	    //console.log('update', this.id(), value);
	    if( value !== undefined && typeof value !== 'object' ) throw new TypeError('data must be an object');
	    var prev = this._data || null;
	    var data = this._data = value || null;
	    if( !data ) this.defaults();
	    if( prev !== data ) {
	      this._emitter.emit('update', {
	        prev: prev,
	        data: data
	      });
	    }
	    return this;
	  },
	  defaults: function() {
	    this.element().innerHTML = this._original || '';
	    return this;
	  },
	  on: function(type, fn) {
	    this._emitter.on(type, fn);
	    return this;
	  },
	  once: function(type, fn) {
	    this._emitter.once(type, fn);
	    return this;
	  },
	  off: function(type, fn) {
	    this._emitter.off(type, fn);
	    return this;
	  },
	  config: function() {
	    var data = this.data();
	    var el = this.element();
	    xmodal.open(__webpack_require__(80), function(err, modal) {
	      if( err ) return xmodal.error(err);
	      
	      var form = modal.body.querySelector('form');
	      form.style.value = el.getAttribute('style') || '';
	      form.cls.value = el.className;
	      form.onsubmit = function(e) {
	        e.preventDefault();
	        if( form.style.value ) data.style = form.style.value;
	        else delete data.style;
	        
	        if( form.cls.value ) data.cls = form.cls.value;
	        else delete data.cls;
	        
	        if( data.style ) el.setAttribute('style', data.style);
	        else el.removeAttribute('style');
	        el.className = data.cls;
	        
	        modal.close();
	      };
	    });
	    return this;
	  },
	  focus: function() {
	    return this;
	  },
	  close: function() {
	    this.defaults();
	    this.mouseobserver().disconnect();
	    this.toolbar().hide();
	    this.highlighter().hide();
	    this._emitter.emit('close');
	    return this;
	  }
	}
	
	Part.isElement = isElement;
	Part.types = Types;
	
	module.exports = Part;

/***/ },

/***/ 73:
/***/ function(module, exports) {

	var types = {};
	
	module.exports = {
	  get: function(id) {
	    return types[id];
	  },
	  add: function(id, handler) {
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

/***/ 74:
/***/ function(module, exports, __webpack_require__) {

	var getPosition = __webpack_require__(75);
	
	module.exports = function(el) {
	  var highlighter;
	  
	  var instance = {
	    get element() {
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
	      if( highlighter ) {
	        highlighter.style.opacity = 0;
	        highlighter.style.display = 'none';
	      }
	      return this;
	    }
	  };
	  
	  return instance;
	};

/***/ },

/***/ 75:
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

/***/ 76:
/***/ function(module, exports, __webpack_require__) {

	var getPosition = __webpack_require__(75);
	
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
	        
	        var li = document.createElement('li');
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
	            li.innerHTML = '<a>' + btn.text + '</a>';
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
	        toolbar.style.top = top + 'px';
	        toolbar.style.left = left + 'px';
	      }
	      
	      if( +options.top >= 0 ) toolbar.style.top = options.top + 'px';
	      if( +options.bottom >= 0 ) toolbar.style.bottom = options.bottom + 'px';
	      if( +options.left >= 0 ) toolbar.style.left = options.left + 'px';
	      if( +options.right >= 0 ) toolbar.style.right = options.right + 'px';
	      
	      return this;
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
	    add: function(btn) {
	      if( ~btns.indexOf(btn) ) btns.splice(btns.indexOf(btn), 1);
	      btns.push(btn);
	      instance.update();
	      return this;
	    },
	    remove: function(btn) {
	      if( ~btns.indexOf(btn) ) btns.splice(btns.indexOf(btn), 1);
	      instance.update();
	      return this;
	    }
	  };
	  
	  return instance;
	}
	
	
	module.exports = Toolbar;


/***/ },

/***/ 77:
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
	  var listeners = {};
	  
	  var on = function(type, fn) {
	    listeners[type] = listeners[type] || [];
	    listeners[type].push(fn);
	    return this;
	  };
	  
	  var once = function(type, fn) {
	    var wrap = function(e) {
	      body.off(type, wrap);
	      return fn.call(this, e);
	    };
	    body.on(type, wrap);
	    return this;
	  };
	  
	  var off = function(type, fn) {
	    var fns = listeners[type];
	    if( fns ) for(var i;~(i = fns.indexOf(fn));) fns.splice(i, 1);
	    return this;
	  };
	  
	  var emit = function(type, detail) {
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
	  
	  return {
	    on: on,
	    once: once,
	    off: off,
	    emit: emit,
	    has: has
	  };
	};

/***/ },

/***/ 78:
/***/ function(module, exports, __webpack_require__) {

	var getPosition = __webpack_require__(75);
	
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
	      return this;
	    }
	  }
	};
	
	module.exports = MouseObserver;

/***/ },

/***/ 79:
/***/ function(module, exports, __webpack_require__) {

	!function(e,t){ true?module.exports=t():"function"==typeof define&&define.amd?define("XModal",[],t):"object"==typeof exports?exports.XModal=t():e.XModal=t()}(this,function(){return function(e){function t(o){if(n[o])return n[o].exports;var r=n[o]={exports:{},id:o,loaded:!1};return e[o].call(r.exports,r,r.exports,t),r.loaded=!0,r.exports}var n={};return t.m=e,t.c=n,t.p="",t(0)}([function(e,t,n){function o(e){if(!e||"object"!=typeof e)return"";var t="";for(var n in e){if(!n||!e[n])return;t+=n+": "+e[n]+";"}return t}function r(e,t){e=e||{};var n=e.id||""+a++,r=Array.isArray(e.cls)?e.cls.join(" "):e.cls,l=o(e.style),s=document.createElement("div");s.setAttribute("id","modal-"+n),s.className="x-modal-container",s.style.position="fixed",s.style.top=s.style.left=s.style.right=s.style.bottom=0,s.style.zIndex=i++,s.style.overflowY="auto",s.style.transition="opacity .25s ease-in-out",s.onclick=function(e){(e.target||e.srcElement)===s&&u.close()};var c=document.createElement("div");l&&c.setAttribute("style",l),r?c.className="x-modal "+r:c.setAttribute("class","x-modal"),c.style.position="relative",c.style.boxSizing="border-box",c.style.transition="all .15s ease-in",c.style.transform="scale(.6,.6)",c.style.opacity=0,c.style.width="number"==typeof e.width?e.width+"px":e.width,c.style.height="number"==typeof e.height?e.height+"px":e.height,e.background&&(c.style.background=e.background),e.shadow!==!1&&(c.style.boxShadow="0 5px 15px rgba(0,0,0,.5)"),c.style.margin=(+e.margin||0)+"px auto",s.appendChild(c);var u={id:n,target:c,body:c,container:s,open:function(){u.onOpen&&u.onOpen(u),document.body.appendChild(s),setTimeout(function(){if(c.style.opacity=1,c.style.transform="scale(1,1)",e.closable!==!1){var t=c.querySelectorAll("*[modal-close], .modal-close"),n=!t.length;if("closebtn"in e&&(n=e.closebtn),n){var o=document.createElement("div");o.style.position="absolute",o.style.right="20px",o.style.top="20px",o.style.cursor="pointer",o.style.opacity="0.5",o.style.zIndex=10001,o.innerHTML='<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAB1WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI+CiAgICAgICAgIDx0aWZmOkNvbXByZXNzaW9uPjE8L3RpZmY6Q29tcHJlc3Npb24+CiAgICAgICAgIDx0aWZmOk9yaWVudGF0aW9uPjE8L3RpZmY6T3JpZW50YXRpb24+CiAgICAgICAgIDx0aWZmOlBob3RvbWV0cmljSW50ZXJwcmV0YXRpb24+MjwvdGlmZjpQaG90b21ldHJpY0ludGVycHJldGF0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KAtiABQAAAaRJREFUSA3tlltSwzAMRcsbVgBsC9gqfPBqYGNwzySn48kkrfP4a++MYsuSriJbcbvZnHDsO3CZDTifsQnEELsYFxMYpviO0r7E8tBZayrQhxhiJ8Hg50T9RX4irjkOEWpjJIZYOIC2Vht5eqb3sW8jEHxGbiJgiMS129jxJYZYOICcrbbn6Tkxvkcgooqh5GXS386XmJIjaj0kJFkTIflHxHWIJb/KvKx06AXjUg+TQERSt/CuoGDOtmKj0usIMLbVZjwlYPyOkIBtP+vERsJW+kZdDglpniZC8rdOmDcRbEDfVlvh6XlS6WuEhAhzoY/66Fjd5j0Gkgu3XH3V0e2jkTxTKrXyJnMbTt8sLYNEjNsI28sIqLaJuFb6Znk+JCpvpK/Q2UgwM7fb+eRW+4YhLm8kX6a8QFjzO+cofDF9s1QHu5PAQzeS5OUNR4zrch3MbKc/xrOsdN+NZJLyhqNyOICcrTbylMSfRRrJt9Y2FKqNsYnQcJN+FuO/w1Nm/rRJvDMOTPThjwCxi2HFNURTfEf5qKDqfHoMxFh9z3RSj2UH/gFDp0r+/I0dzwAAAABJRU5ErkJggg==" title="close">',c.appendChild(o),o.onclick=function(){u.close()}}[].forEach.call(t,function(e){e.onclick=function(){u.close()}})}},10)},close:function(){u.onClose&&u.onClose(u),c.style.opacity=0,c.style.transform="scale(.6,.6)",setTimeout(function(){try{document.body.removeChild(s)}catch(e){}},200)}};t(null,u)}var l=n(1);n(3);var i=1e4,s=function(){var e=document.createElement("div");return e.setAttribute("class","x-modal-mask"),e.style.background="rgba(0,0,0,.5)",e.style.position="fixed",e.style.top=e.style.bottom=e.style.left=e.style.right=0,e.style.opacity=0,e.style.zIndex=i++,e.style.overflow="hidden",e.style.transition="opacity .25s ease-in-out",{show:function(){return e.parentNode!==document.body&&document.body.appendChild(e),e.style.display="block",e.style.opacity=1,document.body.style.overflowY="hidden",this},hide:function(){return e.style.opacity=0,setTimeout(function(){e.style.display="none",document.body.style.overflowY=null},200),this}}}(),a=100,c=[],u=e.exports={open:function(e,t){"string"==typeof e&&(e={html:e}),e=e||{};var o=e.id?u.get(e.id):null;if(o)return t(null,o);var i=function(t){var n=e.src,o=e.html,r=e.el;return"string"!=typeof r||(r=document.querySelector(r))?o?t(null,o):r?t(null,r):n?l(n,t):void t():t(new Error("not found element: "+e.el))};return i(function(o,l){return o?t(o):(console.log("options",e),void r({id:e.id,cls:e.cls,style:e.style,background:e.background,closebtn:e.closebtn,closable:e.closable,shadow:e.shadow,width:e.width||700,height:e.height,margin:e.margin||50},function(o,r){if(o)return t(o);r.onOpen=function(e){~c.indexOf(e)&&c.splice(c.indexOf(e),1);var t=c[c.length-1];c.push(e),t&&(t.body.style.transform="scale(.85, .85)",t.body.style.opacity=".9"),s.show()},r.onClose=function(e){if(~c.indexOf(e)&&c.splice(c.indexOf(e),1),c.length){var t=c[c.length-1];t.body.style.transform="scale(1, 1)",t.body.style.opacity="1"}else s.hide()};var i=e.shell,a=e.title,u=e.icon,d=e.btns;if(i!==!1&&(a||u||d)&&(i=!0),i){var f=(i.cls,i.style,n(7));r.target.innerHTML=f,r.target=r.body.querySelector(".x-modal-shell-body"),r.shell={shell:r.body.querySelector(".x-modal-shell"),header:r.body.querySelector(".x-modal-shell-header"),body:r.body.querySelector(".x-modal-shell-body"),footer:r.body.querySelector(".x-modal-shell-footer")},a||u||(r.shell.header.display="none"),d&&d.length||(r.shell.footer.display="none"),u&&r.shell.header.appendChild(function(){var e=document.createElement("span");return e.className="x-modal-shell-icon",e.innerHTML=u,e}()),a&&r.shell.header.appendChild(function(){var e=document.createElement("h3");return e.className="x-modal-shell-title",e.innerHTML=a,e}()),(d||[]).forEach(function(e){r.shell.footer.appendChild(function(){var t=document.createElement("a");return t.className="x-modal-shell-btn",t.innerHTML=e.icon+" "+e.text,t}())})}l&&(l.nodeType&&r.target.appendChild(l),"string"==typeof l?r.target.innerHTML=l:"number"==typeof l.length&&[].forEach.call(l,function(e){r.target.appendChild(e)})),r.open(),t(null,r)}))}),this},current:function(){return c[c.length-1]},ids:function(){var e=[];return c.forEach(function(t){e.push(t.id)}),e},get:function(e){if(!arguments.length)return u.current();var t;return c.forEach(function(n){n.id===e&&(t=n)}),t},close:function(e){return arguments.length||u.closeAll(),c.forEach(function(t){t.id===e&&t.close()}),this},closeAll:function(){return c.forEach(function(e){e.close()}),this}}},function(e,t,n){(function(e){e.export=function(e,t){var n=win.XMLHttpRequest?new XMLHttpRequest:new ActiveXObject("Microsoft.XMLHTTP");n.open("GET",e),n.onreadystatechange=function(e){if(4==this.readyState){var n=this.status,o=this.responseText;0===n||n>=200&&n<300?t(null,o):t(new Error("["+n+"] "+o))}},n.send()}}).call(t,n(2)(e))},function(e,t){e.exports=function(e){return e.webpackPolyfill||(e.deprecate=function(){},e.paths=[],e.children=[],e.webpackPolyfill=1),e}},function(e,t,n){var o=n(4);"string"==typeof o&&(o=[[e.id,o,""]]);n(6)(o,{});o.locals&&(e.exports=o.locals)},function(e,t,n){t=e.exports=n(5)(),t.push([e.id,".x-modal-shell {\n  background: #fff;\n}\n",""])},function(e,t){e.exports=function(){var e=[];return e.toString=function(){for(var e=[],t=0;t<this.length;t++){var n=this[t];n[2]?e.push("@media "+n[2]+"{"+n[1]+"}"):e.push(n[1])}return e.join("")},e.i=function(t,n){"string"==typeof t&&(t=[[null,t,""]]);for(var o={},r=0;r<this.length;r++){var l=this[r][0];"number"==typeof l&&(o[l]=!0)}for(r=0;r<t.length;r++){var i=t[r];"number"==typeof i[0]&&o[i[0]]||(n&&!i[2]?i[2]=n:n&&(i[2]="("+i[2]+") and ("+n+")"),e.push(i))}},e}},function(e,t,n){function o(e,t){for(var n=0;n<e.length;n++){var o=e[n],r=p[o.id];if(r){r.refs++;for(var l=0;l<r.parts.length;l++)r.parts[l](o.parts[l]);for(;l<o.parts.length;l++)r.parts.push(c(o.parts[l],t))}else{for(var i=[],l=0;l<o.parts.length;l++)i.push(c(o.parts[l],t));p[o.id]={id:o.id,refs:1,parts:i}}}}function r(e){for(var t=[],n={},o=0;o<e.length;o++){var r=e[o],l=r[0],i=r[1],s=r[2],a=r[3],c={css:i,media:s,sourceMap:a};n[l]?n[l].parts.push(c):t.push(n[l]={id:l,parts:[c]})}return t}function l(e,t){var n=m(),o=v[v.length-1];if("top"===e.insertAt)o?o.nextSibling?n.insertBefore(t,o.nextSibling):n.appendChild(t):n.insertBefore(t,n.firstChild),v.push(t);else{if("bottom"!==e.insertAt)throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");n.appendChild(t)}}function i(e){e.parentNode.removeChild(e);var t=v.indexOf(e);t>=0&&v.splice(t,1)}function s(e){var t=document.createElement("style");return t.type="text/css",l(e,t),t}function a(e){var t=document.createElement("link");return t.rel="stylesheet",l(e,t),t}function c(e,t){var n,o,r;if(t.singleton){var l=b++;n=g||(g=s(t)),o=u.bind(null,n,l,!1),r=u.bind(null,n,l,!0)}else e.sourceMap&&"function"==typeof URL&&"function"==typeof URL.createObjectURL&&"function"==typeof URL.revokeObjectURL&&"function"==typeof Blob&&"function"==typeof btoa?(n=a(t),o=f.bind(null,n),r=function(){i(n),n.href&&URL.revokeObjectURL(n.href)}):(n=s(t),o=d.bind(null,n),r=function(){i(n)});return o(e),function(t){if(t){if(t.css===e.css&&t.media===e.media&&t.sourceMap===e.sourceMap)return;o(e=t)}else r()}}function u(e,t,n,o){var r=n?"":o.css;if(e.styleSheet)e.styleSheet.cssText=A(t,r);else{var l=document.createTextNode(r),i=e.childNodes;i[t]&&e.removeChild(i[t]),i.length?e.insertBefore(l,i[t]):e.appendChild(l)}}function d(e,t){var n=t.css,o=t.media;if(o&&e.setAttribute("media",o),e.styleSheet)e.styleSheet.cssText=n;else{for(;e.firstChild;)e.removeChild(e.firstChild);e.appendChild(document.createTextNode(n))}}function f(e,t){var n=t.css,o=t.sourceMap;o&&(n+="\n/*# sourceMappingURL=data:application/json;base64,"+btoa(unescape(encodeURIComponent(JSON.stringify(o))))+" */");var r=new Blob([n],{type:"text/css"}),l=e.href;e.href=URL.createObjectURL(r),l&&URL.revokeObjectURL(l)}var p={},h=function(e){var t;return function(){return"undefined"==typeof t&&(t=e.apply(this,arguments)),t}},y=h(function(){return/msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase())}),m=h(function(){return document.head||document.getElementsByTagName("head")[0]}),g=null,b=0,v=[];e.exports=function(e,t){t=t||{},"undefined"==typeof t.singleton&&(t.singleton=y()),"undefined"==typeof t.insertAt&&(t.insertAt="bottom");var n=r(e);return o(n,t),function(e){for(var l=[],i=0;i<n.length;i++){var s=n[i],a=p[s.id];a.refs--,l.push(a)}if(e){var c=r(e);o(c,t)}for(var i=0;i<l.length;i++){var a=l[i];if(0===a.refs){for(var u=0;u<a.parts.length;u++)a.parts[u]();delete p[a.id]}}}};var A=function(){var e=[];return function(t,n){return e[t]=n,e.filter(Boolean).join("\n")}}()},function(e,t){e.exports='<div class="x-modal-shell">\n  <div class="x-modal-shell-header"></div>\n  <div class="x-modal-shell-body"></div>\n  <div class="x-modal-shell-footer"></div>\n</div>'}])});

/***/ },

/***/ 80:
/***/ function(module, exports) {

	module.exports = "<div class=\"ff-body\">\n  <form>\n    <div class=\"panel m0\">\n      <div class=\"panel-heading\">\n        <h3 class=\"panel-title\">기본 설정</h3>\n      </div>\n      <div class=\"panel-body\">\n        <div class=\"form-group\">\n          <label>스타일</label>\n          <input type=\"text\" name=\"style\" class=\"form-control\" placeholder=\"스타일\">\n        </div>\n        <div class=\"form-group\">\n          <label>클래스</label>\n          <input type=\"text\" name=\"cls\" class=\"form-control\" placeholder=\"클래스\">\n        </div>\n        <div class=\"form-group\">\n          <label>폰트</label>\n          <select class=\"form-control\">\n            <option>기본</option>\n          </select>\n        </div>\n      </div>\n      <div class=\"panel-footer\">\n        <div class=\"row\">\n          <div class=\"col-md-6\"></div>\n          <div class=\"col-md-6 text-right\">\n            <button type=\"button\" class=\"btn btn-default\" modal-close>취소</button>\n            <button type=\"submit\" class=\"btn btn-primary\">적용</button>\n          </div>\n        </div>\n      </div>\n    </div>\n  </form>\n</div>";

/***/ },

/***/ 81:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(82);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(84)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/less-loader/index.js!./editor.less", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/less-loader/index.js!./editor.less");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 82:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(83)();
	// imports
	
	
	// module
	exports.push([module.id, ".ff {\n  cursor: pointer;\n  cursor: hand;\n}\n.ff:hover {\n  outline: #dedede dotted thin;\n}\n.ff-body {\n  font-size: 12px;\n  /*! normalize.css v3.0.3 | MIT License | github.com/necolas/normalize.css */\n}\n.ff-body html {\n  font-family: sans-serif;\n  -ms-text-size-adjust: 100%;\n  -webkit-text-size-adjust: 100%;\n}\n.ff-body body {\n  margin: 0;\n}\n.ff-body article,\n.ff-body aside,\n.ff-body details,\n.ff-body figcaption,\n.ff-body figure,\n.ff-body footer,\n.ff-body header,\n.ff-body hgroup,\n.ff-body main,\n.ff-body menu,\n.ff-body nav,\n.ff-body section,\n.ff-body summary {\n  display: block;\n}\n.ff-body audio,\n.ff-body canvas,\n.ff-body progress,\n.ff-body video {\n  display: inline-block;\n  vertical-align: baseline;\n}\n.ff-body audio:not([controls]) {\n  display: none;\n  height: 0;\n}\n.ff-body [hidden],\n.ff-body template {\n  display: none;\n}\n.ff-body a {\n  background-color: transparent;\n}\n.ff-body a:active,\n.ff-body a:hover {\n  outline: 0;\n}\n.ff-body abbr[title] {\n  border-bottom: 1px dotted;\n}\n.ff-body b,\n.ff-body strong {\n  font-weight: bold;\n}\n.ff-body dfn {\n  font-style: italic;\n}\n.ff-body h1 {\n  font-size: 2em;\n  margin: 0.67em 0;\n}\n.ff-body mark {\n  background: #ff0;\n  color: #000;\n}\n.ff-body small {\n  font-size: 80%;\n}\n.ff-body sub,\n.ff-body sup {\n  font-size: 75%;\n  line-height: 0;\n  position: relative;\n  vertical-align: baseline;\n}\n.ff-body sup {\n  top: -0.5em;\n}\n.ff-body sub {\n  bottom: -0.25em;\n}\n.ff-body img {\n  border: 0;\n}\n.ff-body svg:not(:root) {\n  overflow: hidden;\n}\n.ff-body figure {\n  margin: 1em 40px;\n}\n.ff-body hr {\n  box-sizing: content-box;\n  height: 0;\n}\n.ff-body pre {\n  overflow: auto;\n}\n.ff-body code,\n.ff-body kbd,\n.ff-body pre,\n.ff-body samp {\n  font-family: monospace, monospace;\n  font-size: 1em;\n}\n.ff-body button,\n.ff-body input,\n.ff-body optgroup,\n.ff-body select,\n.ff-body textarea {\n  color: inherit;\n  font: inherit;\n  margin: 0;\n}\n.ff-body button {\n  overflow: visible;\n}\n.ff-body button,\n.ff-body select {\n  text-transform: none;\n}\n.ff-body button,\n.ff-body html input[type=\"button\"],\n.ff-body input[type=\"reset\"],\n.ff-body input[type=\"submit\"] {\n  -webkit-appearance: button;\n  cursor: pointer;\n}\n.ff-body button[disabled],\n.ff-body html input[disabled] {\n  cursor: default;\n}\n.ff-body button::-moz-focus-inner,\n.ff-body input::-moz-focus-inner {\n  border: 0;\n  padding: 0;\n}\n.ff-body input {\n  line-height: normal;\n}\n.ff-body input[type=\"checkbox\"],\n.ff-body input[type=\"radio\"] {\n  box-sizing: border-box;\n  padding: 0;\n}\n.ff-body input[type=\"number\"]::-webkit-inner-spin-button,\n.ff-body input[type=\"number\"]::-webkit-outer-spin-button {\n  height: auto;\n}\n.ff-body input[type=\"search\"] {\n  -webkit-appearance: textfield;\n  box-sizing: content-box;\n}\n.ff-body input[type=\"search\"]::-webkit-search-cancel-button,\n.ff-body input[type=\"search\"]::-webkit-search-decoration {\n  -webkit-appearance: none;\n}\n.ff-body fieldset {\n  border: 1px solid #c0c0c0;\n  margin: 0 2px;\n  padding: 0.35em 0.625em 0.75em;\n}\n.ff-body legend {\n  border: 0;\n  padding: 0;\n}\n.ff-body textarea {\n  overflow: auto;\n}\n.ff-body optgroup {\n  font-weight: bold;\n}\n.ff-body table {\n  border-collapse: collapse;\n  border-spacing: 0;\n}\n.ff-body td,\n.ff-body th {\n  padding: 0;\n}\n@font-face {\n  font-family: 'Glyphicons Halflings';\n  src: url('//maxcdn.bootstrapcdn.com/bootstrap/3.3.6/fonts/glyphicons-halflings-regular.eot');\n  src: url('//maxcdn.bootstrapcdn.com/bootstrap/3.3.6/fonts/glyphicons-halflings-regular.eot?#iefix') format('embedded-opentype'), url('//maxcdn.bootstrapcdn.com/bootstrap/3.3.6/fonts/glyphicons-halflings-regular.woff2') format('woff2'), url('//maxcdn.bootstrapcdn.com/bootstrap/3.3.6/fonts/glyphicons-halflings-regular.woff') format('woff'), url('//maxcdn.bootstrapcdn.com/bootstrap/3.3.6/fonts/glyphicons-halflings-regular.ttf') format('truetype'), url('//maxcdn.bootstrapcdn.com/bootstrap/3.3.6/fonts/glyphicons-halflings-regular.svg#glyphicons_halflingsregular') format('svg');\n}\n.ff-body .glyphicon {\n  position: relative;\n  top: 1px;\n  display: inline-block;\n  font-family: 'Glyphicons Halflings';\n  font-style: normal;\n  font-weight: normal;\n  line-height: 1;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n}\n.ff-body .glyphicon-asterisk:before {\n  content: \"*\";\n}\n.ff-body .glyphicon-plus:before {\n  content: \"+\";\n}\n.ff-body .glyphicon-euro:before,\n.ff-body .glyphicon-eur:before {\n  content: \"\\20AC\";\n}\n.ff-body .glyphicon-minus:before {\n  content: \"\\2212\";\n}\n.ff-body .glyphicon-cloud:before {\n  content: \"\\2601\";\n}\n.ff-body .glyphicon-envelope:before {\n  content: \"\\2709\";\n}\n.ff-body .glyphicon-pencil:before {\n  content: \"\\270F\";\n}\n.ff-body .glyphicon-glass:before {\n  content: \"\\E001\";\n}\n.ff-body .glyphicon-music:before {\n  content: \"\\E002\";\n}\n.ff-body .glyphicon-search:before {\n  content: \"\\E003\";\n}\n.ff-body .glyphicon-heart:before {\n  content: \"\\E005\";\n}\n.ff-body .glyphicon-star:before {\n  content: \"\\E006\";\n}\n.ff-body .glyphicon-star-empty:before {\n  content: \"\\E007\";\n}\n.ff-body .glyphicon-user:before {\n  content: \"\\E008\";\n}\n.ff-body .glyphicon-film:before {\n  content: \"\\E009\";\n}\n.ff-body .glyphicon-th-large:before {\n  content: \"\\E010\";\n}\n.ff-body .glyphicon-th:before {\n  content: \"\\E011\";\n}\n.ff-body .glyphicon-th-list:before {\n  content: \"\\E012\";\n}\n.ff-body .glyphicon-ok:before {\n  content: \"\\E013\";\n}\n.ff-body .glyphicon-remove:before {\n  content: \"\\E014\";\n}\n.ff-body .glyphicon-zoom-in:before {\n  content: \"\\E015\";\n}\n.ff-body .glyphicon-zoom-out:before {\n  content: \"\\E016\";\n}\n.ff-body .glyphicon-off:before {\n  content: \"\\E017\";\n}\n.ff-body .glyphicon-signal:before {\n  content: \"\\E018\";\n}\n.ff-body .glyphicon-cog:before {\n  content: \"\\E019\";\n}\n.ff-body .glyphicon-trash:before {\n  content: \"\\E020\";\n}\n.ff-body .glyphicon-home:before {\n  content: \"\\E021\";\n}\n.ff-body .glyphicon-file:before {\n  content: \"\\E022\";\n}\n.ff-body .glyphicon-time:before {\n  content: \"\\E023\";\n}\n.ff-body .glyphicon-road:before {\n  content: \"\\E024\";\n}\n.ff-body .glyphicon-download-alt:before {\n  content: \"\\E025\";\n}\n.ff-body .glyphicon-download:before {\n  content: \"\\E026\";\n}\n.ff-body .glyphicon-upload:before {\n  content: \"\\E027\";\n}\n.ff-body .glyphicon-inbox:before {\n  content: \"\\E028\";\n}\n.ff-body .glyphicon-play-circle:before {\n  content: \"\\E029\";\n}\n.ff-body .glyphicon-repeat:before {\n  content: \"\\E030\";\n}\n.ff-body .glyphicon-refresh:before {\n  content: \"\\E031\";\n}\n.ff-body .glyphicon-list-alt:before {\n  content: \"\\E032\";\n}\n.ff-body .glyphicon-lock:before {\n  content: \"\\E033\";\n}\n.ff-body .glyphicon-flag:before {\n  content: \"\\E034\";\n}\n.ff-body .glyphicon-headphones:before {\n  content: \"\\E035\";\n}\n.ff-body .glyphicon-volume-off:before {\n  content: \"\\E036\";\n}\n.ff-body .glyphicon-volume-down:before {\n  content: \"\\E037\";\n}\n.ff-body .glyphicon-volume-up:before {\n  content: \"\\E038\";\n}\n.ff-body .glyphicon-qrcode:before {\n  content: \"\\E039\";\n}\n.ff-body .glyphicon-barcode:before {\n  content: \"\\E040\";\n}\n.ff-body .glyphicon-tag:before {\n  content: \"\\E041\";\n}\n.ff-body .glyphicon-tags:before {\n  content: \"\\E042\";\n}\n.ff-body .glyphicon-book:before {\n  content: \"\\E043\";\n}\n.ff-body .glyphicon-bookmark:before {\n  content: \"\\E044\";\n}\n.ff-body .glyphicon-print:before {\n  content: \"\\E045\";\n}\n.ff-body .glyphicon-camera:before {\n  content: \"\\E046\";\n}\n.ff-body .glyphicon-font:before {\n  content: \"\\E047\";\n}\n.ff-body .glyphicon-bold:before {\n  content: \"\\E048\";\n}\n.ff-body .glyphicon-italic:before {\n  content: \"\\E049\";\n}\n.ff-body .glyphicon-text-height:before {\n  content: \"\\E050\";\n}\n.ff-body .glyphicon-text-width:before {\n  content: \"\\E051\";\n}\n.ff-body .glyphicon-align-left:before {\n  content: \"\\E052\";\n}\n.ff-body .glyphicon-align-center:before {\n  content: \"\\E053\";\n}\n.ff-body .glyphicon-align-right:before {\n  content: \"\\E054\";\n}\n.ff-body .glyphicon-align-justify:before {\n  content: \"\\E055\";\n}\n.ff-body .glyphicon-list:before {\n  content: \"\\E056\";\n}\n.ff-body .glyphicon-indent-left:before {\n  content: \"\\E057\";\n}\n.ff-body .glyphicon-indent-right:before {\n  content: \"\\E058\";\n}\n.ff-body .glyphicon-facetime-video:before {\n  content: \"\\E059\";\n}\n.ff-body .glyphicon-picture:before {\n  content: \"\\E060\";\n}\n.ff-body .glyphicon-map-marker:before {\n  content: \"\\E062\";\n}\n.ff-body .glyphicon-adjust:before {\n  content: \"\\E063\";\n}\n.ff-body .glyphicon-tint:before {\n  content: \"\\E064\";\n}\n.ff-body .glyphicon-edit:before {\n  content: \"\\E065\";\n}\n.ff-body .glyphicon-share:before {\n  content: \"\\E066\";\n}\n.ff-body .glyphicon-check:before {\n  content: \"\\E067\";\n}\n.ff-body .glyphicon-move:before {\n  content: \"\\E068\";\n}\n.ff-body .glyphicon-step-backward:before {\n  content: \"\\E069\";\n}\n.ff-body .glyphicon-fast-backward:before {\n  content: \"\\E070\";\n}\n.ff-body .glyphicon-backward:before {\n  content: \"\\E071\";\n}\n.ff-body .glyphicon-play:before {\n  content: \"\\E072\";\n}\n.ff-body .glyphicon-pause:before {\n  content: \"\\E073\";\n}\n.ff-body .glyphicon-stop:before {\n  content: \"\\E074\";\n}\n.ff-body .glyphicon-forward:before {\n  content: \"\\E075\";\n}\n.ff-body .glyphicon-fast-forward:before {\n  content: \"\\E076\";\n}\n.ff-body .glyphicon-step-forward:before {\n  content: \"\\E077\";\n}\n.ff-body .glyphicon-eject:before {\n  content: \"\\E078\";\n}\n.ff-body .glyphicon-chevron-left:before {\n  content: \"\\E079\";\n}\n.ff-body .glyphicon-chevron-right:before {\n  content: \"\\E080\";\n}\n.ff-body .glyphicon-plus-sign:before {\n  content: \"\\E081\";\n}\n.ff-body .glyphicon-minus-sign:before {\n  content: \"\\E082\";\n}\n.ff-body .glyphicon-remove-sign:before {\n  content: \"\\E083\";\n}\n.ff-body .glyphicon-ok-sign:before {\n  content: \"\\E084\";\n}\n.ff-body .glyphicon-question-sign:before {\n  content: \"\\E085\";\n}\n.ff-body .glyphicon-info-sign:before {\n  content: \"\\E086\";\n}\n.ff-body .glyphicon-screenshot:before {\n  content: \"\\E087\";\n}\n.ff-body .glyphicon-remove-circle:before {\n  content: \"\\E088\";\n}\n.ff-body .glyphicon-ok-circle:before {\n  content: \"\\E089\";\n}\n.ff-body .glyphicon-ban-circle:before {\n  content: \"\\E090\";\n}\n.ff-body .glyphicon-arrow-left:before {\n  content: \"\\E091\";\n}\n.ff-body .glyphicon-arrow-right:before {\n  content: \"\\E092\";\n}\n.ff-body .glyphicon-arrow-up:before {\n  content: \"\\E093\";\n}\n.ff-body .glyphicon-arrow-down:before {\n  content: \"\\E094\";\n}\n.ff-body .glyphicon-share-alt:before {\n  content: \"\\E095\";\n}\n.ff-body .glyphicon-resize-full:before {\n  content: \"\\E096\";\n}\n.ff-body .glyphicon-resize-small:before {\n  content: \"\\E097\";\n}\n.ff-body .glyphicon-exclamation-sign:before {\n  content: \"\\E101\";\n}\n.ff-body .glyphicon-gift:before {\n  content: \"\\E102\";\n}\n.ff-body .glyphicon-leaf:before {\n  content: \"\\E103\";\n}\n.ff-body .glyphicon-fire:before {\n  content: \"\\E104\";\n}\n.ff-body .glyphicon-eye-open:before {\n  content: \"\\E105\";\n}\n.ff-body .glyphicon-eye-close:before {\n  content: \"\\E106\";\n}\n.ff-body .glyphicon-warning-sign:before {\n  content: \"\\E107\";\n}\n.ff-body .glyphicon-plane:before {\n  content: \"\\E108\";\n}\n.ff-body .glyphicon-calendar:before {\n  content: \"\\E109\";\n}\n.ff-body .glyphicon-random:before {\n  content: \"\\E110\";\n}\n.ff-body .glyphicon-comment:before {\n  content: \"\\E111\";\n}\n.ff-body .glyphicon-magnet:before {\n  content: \"\\E112\";\n}\n.ff-body .glyphicon-chevron-up:before {\n  content: \"\\E113\";\n}\n.ff-body .glyphicon-chevron-down:before {\n  content: \"\\E114\";\n}\n.ff-body .glyphicon-retweet:before {\n  content: \"\\E115\";\n}\n.ff-body .glyphicon-shopping-cart:before {\n  content: \"\\E116\";\n}\n.ff-body .glyphicon-folder-close:before {\n  content: \"\\E117\";\n}\n.ff-body .glyphicon-folder-open:before {\n  content: \"\\E118\";\n}\n.ff-body .glyphicon-resize-vertical:before {\n  content: \"\\E119\";\n}\n.ff-body .glyphicon-resize-horizontal:before {\n  content: \"\\E120\";\n}\n.ff-body .glyphicon-hdd:before {\n  content: \"\\E121\";\n}\n.ff-body .glyphicon-bullhorn:before {\n  content: \"\\E122\";\n}\n.ff-body .glyphicon-bell:before {\n  content: \"\\E123\";\n}\n.ff-body .glyphicon-certificate:before {\n  content: \"\\E124\";\n}\n.ff-body .glyphicon-thumbs-up:before {\n  content: \"\\E125\";\n}\n.ff-body .glyphicon-thumbs-down:before {\n  content: \"\\E126\";\n}\n.ff-body .glyphicon-hand-right:before {\n  content: \"\\E127\";\n}\n.ff-body .glyphicon-hand-left:before {\n  content: \"\\E128\";\n}\n.ff-body .glyphicon-hand-up:before {\n  content: \"\\E129\";\n}\n.ff-body .glyphicon-hand-down:before {\n  content: \"\\E130\";\n}\n.ff-body .glyphicon-circle-arrow-right:before {\n  content: \"\\E131\";\n}\n.ff-body .glyphicon-circle-arrow-left:before {\n  content: \"\\E132\";\n}\n.ff-body .glyphicon-circle-arrow-up:before {\n  content: \"\\E133\";\n}\n.ff-body .glyphicon-circle-arrow-down:before {\n  content: \"\\E134\";\n}\n.ff-body .glyphicon-globe:before {\n  content: \"\\E135\";\n}\n.ff-body .glyphicon-wrench:before {\n  content: \"\\E136\";\n}\n.ff-body .glyphicon-tasks:before {\n  content: \"\\E137\";\n}\n.ff-body .glyphicon-filter:before {\n  content: \"\\E138\";\n}\n.ff-body .glyphicon-briefcase:before {\n  content: \"\\E139\";\n}\n.ff-body .glyphicon-fullscreen:before {\n  content: \"\\E140\";\n}\n.ff-body .glyphicon-dashboard:before {\n  content: \"\\E141\";\n}\n.ff-body .glyphicon-paperclip:before {\n  content: \"\\E142\";\n}\n.ff-body .glyphicon-heart-empty:before {\n  content: \"\\E143\";\n}\n.ff-body .glyphicon-link:before {\n  content: \"\\E144\";\n}\n.ff-body .glyphicon-phone:before {\n  content: \"\\E145\";\n}\n.ff-body .glyphicon-pushpin:before {\n  content: \"\\E146\";\n}\n.ff-body .glyphicon-usd:before {\n  content: \"\\E148\";\n}\n.ff-body .glyphicon-gbp:before {\n  content: \"\\E149\";\n}\n.ff-body .glyphicon-sort:before {\n  content: \"\\E150\";\n}\n.ff-body .glyphicon-sort-by-alphabet:before {\n  content: \"\\E151\";\n}\n.ff-body .glyphicon-sort-by-alphabet-alt:before {\n  content: \"\\E152\";\n}\n.ff-body .glyphicon-sort-by-order:before {\n  content: \"\\E153\";\n}\n.ff-body .glyphicon-sort-by-order-alt:before {\n  content: \"\\E154\";\n}\n.ff-body .glyphicon-sort-by-attributes:before {\n  content: \"\\E155\";\n}\n.ff-body .glyphicon-sort-by-attributes-alt:before {\n  content: \"\\E156\";\n}\n.ff-body .glyphicon-unchecked:before {\n  content: \"\\E157\";\n}\n.ff-body .glyphicon-expand:before {\n  content: \"\\E158\";\n}\n.ff-body .glyphicon-collapse-down:before {\n  content: \"\\E159\";\n}\n.ff-body .glyphicon-collapse-up:before {\n  content: \"\\E160\";\n}\n.ff-body .glyphicon-log-in:before {\n  content: \"\\E161\";\n}\n.ff-body .glyphicon-flash:before {\n  content: \"\\E162\";\n}\n.ff-body .glyphicon-log-out:before {\n  content: \"\\E163\";\n}\n.ff-body .glyphicon-new-window:before {\n  content: \"\\E164\";\n}\n.ff-body .glyphicon-record:before {\n  content: \"\\E165\";\n}\n.ff-body .glyphicon-save:before {\n  content: \"\\E166\";\n}\n.ff-body .glyphicon-open:before {\n  content: \"\\E167\";\n}\n.ff-body .glyphicon-saved:before {\n  content: \"\\E168\";\n}\n.ff-body .glyphicon-import:before {\n  content: \"\\E169\";\n}\n.ff-body .glyphicon-export:before {\n  content: \"\\E170\";\n}\n.ff-body .glyphicon-send:before {\n  content: \"\\E171\";\n}\n.ff-body .glyphicon-floppy-disk:before {\n  content: \"\\E172\";\n}\n.ff-body .glyphicon-floppy-saved:before {\n  content: \"\\E173\";\n}\n.ff-body .glyphicon-floppy-remove:before {\n  content: \"\\E174\";\n}\n.ff-body .glyphicon-floppy-save:before {\n  content: \"\\E175\";\n}\n.ff-body .glyphicon-floppy-open:before {\n  content: \"\\E176\";\n}\n.ff-body .glyphicon-credit-card:before {\n  content: \"\\E177\";\n}\n.ff-body .glyphicon-transfer:before {\n  content: \"\\E178\";\n}\n.ff-body .glyphicon-cutlery:before {\n  content: \"\\E179\";\n}\n.ff-body .glyphicon-header:before {\n  content: \"\\E180\";\n}\n.ff-body .glyphicon-compressed:before {\n  content: \"\\E181\";\n}\n.ff-body .glyphicon-earphone:before {\n  content: \"\\E182\";\n}\n.ff-body .glyphicon-phone-alt:before {\n  content: \"\\E183\";\n}\n.ff-body .glyphicon-tower:before {\n  content: \"\\E184\";\n}\n.ff-body .glyphicon-stats:before {\n  content: \"\\E185\";\n}\n.ff-body .glyphicon-sd-video:before {\n  content: \"\\E186\";\n}\n.ff-body .glyphicon-hd-video:before {\n  content: \"\\E187\";\n}\n.ff-body .glyphicon-subtitles:before {\n  content: \"\\E188\";\n}\n.ff-body .glyphicon-sound-stereo:before {\n  content: \"\\E189\";\n}\n.ff-body .glyphicon-sound-dolby:before {\n  content: \"\\E190\";\n}\n.ff-body .glyphicon-sound-5-1:before {\n  content: \"\\E191\";\n}\n.ff-body .glyphicon-sound-6-1:before {\n  content: \"\\E192\";\n}\n.ff-body .glyphicon-sound-7-1:before {\n  content: \"\\E193\";\n}\n.ff-body .glyphicon-copyright-mark:before {\n  content: \"\\E194\";\n}\n.ff-body .glyphicon-registration-mark:before {\n  content: \"\\E195\";\n}\n.ff-body .glyphicon-cloud-download:before {\n  content: \"\\E197\";\n}\n.ff-body .glyphicon-cloud-upload:before {\n  content: \"\\E198\";\n}\n.ff-body .glyphicon-tree-conifer:before {\n  content: \"\\E199\";\n}\n.ff-body .glyphicon-tree-deciduous:before {\n  content: \"\\E200\";\n}\n.ff-body .glyphicon-cd:before {\n  content: \"\\E201\";\n}\n.ff-body .glyphicon-save-file:before {\n  content: \"\\E202\";\n}\n.ff-body .glyphicon-open-file:before {\n  content: \"\\E203\";\n}\n.ff-body .glyphicon-level-up:before {\n  content: \"\\E204\";\n}\n.ff-body .glyphicon-copy:before {\n  content: \"\\E205\";\n}\n.ff-body .glyphicon-paste:before {\n  content: \"\\E206\";\n}\n.ff-body .glyphicon-alert:before {\n  content: \"\\E209\";\n}\n.ff-body .glyphicon-equalizer:before {\n  content: \"\\E210\";\n}\n.ff-body .glyphicon-king:before {\n  content: \"\\E211\";\n}\n.ff-body .glyphicon-queen:before {\n  content: \"\\E212\";\n}\n.ff-body .glyphicon-pawn:before {\n  content: \"\\E213\";\n}\n.ff-body .glyphicon-bishop:before {\n  content: \"\\E214\";\n}\n.ff-body .glyphicon-knight:before {\n  content: \"\\E215\";\n}\n.ff-body .glyphicon-baby-formula:before {\n  content: \"\\E216\";\n}\n.ff-body .glyphicon-tent:before {\n  content: \"\\26FA\";\n}\n.ff-body .glyphicon-blackboard:before {\n  content: \"\\E218\";\n}\n.ff-body .glyphicon-bed:before {\n  content: \"\\E219\";\n}\n.ff-body .glyphicon-apple:before {\n  content: \"\\F8FF\";\n}\n.ff-body .glyphicon-erase:before {\n  content: \"\\E221\";\n}\n.ff-body .glyphicon-hourglass:before {\n  content: \"\\231B\";\n}\n.ff-body .glyphicon-lamp:before {\n  content: \"\\E223\";\n}\n.ff-body .glyphicon-duplicate:before {\n  content: \"\\E224\";\n}\n.ff-body .glyphicon-piggy-bank:before {\n  content: \"\\E225\";\n}\n.ff-body .glyphicon-scissors:before {\n  content: \"\\E226\";\n}\n.ff-body .glyphicon-bitcoin:before {\n  content: \"\\E227\";\n}\n.ff-body .glyphicon-btc:before {\n  content: \"\\E227\";\n}\n.ff-body .glyphicon-xbt:before {\n  content: \"\\E227\";\n}\n.ff-body .glyphicon-yen:before {\n  content: \"\\A5\";\n}\n.ff-body .glyphicon-jpy:before {\n  content: \"\\A5\";\n}\n.ff-body .glyphicon-ruble:before {\n  content: \"\\20BD\";\n}\n.ff-body .glyphicon-rub:before {\n  content: \"\\20BD\";\n}\n.ff-body .glyphicon-scale:before {\n  content: \"\\E230\";\n}\n.ff-body .glyphicon-ice-lolly:before {\n  content: \"\\E231\";\n}\n.ff-body .glyphicon-ice-lolly-tasted:before {\n  content: \"\\E232\";\n}\n.ff-body .glyphicon-education:before {\n  content: \"\\E233\";\n}\n.ff-body .glyphicon-option-horizontal:before {\n  content: \"\\E234\";\n}\n.ff-body .glyphicon-option-vertical:before {\n  content: \"\\E235\";\n}\n.ff-body .glyphicon-menu-hamburger:before {\n  content: \"\\E236\";\n}\n.ff-body .glyphicon-modal-window:before {\n  content: \"\\E237\";\n}\n.ff-body .glyphicon-oil:before {\n  content: \"\\E238\";\n}\n.ff-body .glyphicon-grain:before {\n  content: \"\\E239\";\n}\n.ff-body .glyphicon-sunglasses:before {\n  content: \"\\E240\";\n}\n.ff-body .glyphicon-text-size:before {\n  content: \"\\E241\";\n}\n.ff-body .glyphicon-text-color:before {\n  content: \"\\E242\";\n}\n.ff-body .glyphicon-text-background:before {\n  content: \"\\E243\";\n}\n.ff-body .glyphicon-object-align-top:before {\n  content: \"\\E244\";\n}\n.ff-body .glyphicon-object-align-bottom:before {\n  content: \"\\E245\";\n}\n.ff-body .glyphicon-object-align-horizontal:before {\n  content: \"\\E246\";\n}\n.ff-body .glyphicon-object-align-left:before {\n  content: \"\\E247\";\n}\n.ff-body .glyphicon-object-align-vertical:before {\n  content: \"\\E248\";\n}\n.ff-body .glyphicon-object-align-right:before {\n  content: \"\\E249\";\n}\n.ff-body .glyphicon-triangle-right:before {\n  content: \"\\E250\";\n}\n.ff-body .glyphicon-triangle-left:before {\n  content: \"\\E251\";\n}\n.ff-body .glyphicon-triangle-bottom:before {\n  content: \"\\E252\";\n}\n.ff-body .glyphicon-triangle-top:before {\n  content: \"\\E253\";\n}\n.ff-body .glyphicon-console:before {\n  content: \"\\E254\";\n}\n.ff-body .glyphicon-superscript:before {\n  content: \"\\E255\";\n}\n.ff-body .glyphicon-subscript:before {\n  content: \"\\E256\";\n}\n.ff-body .glyphicon-menu-left:before {\n  content: \"\\E257\";\n}\n.ff-body .glyphicon-menu-right:before {\n  content: \"\\E258\";\n}\n.ff-body .glyphicon-menu-down:before {\n  content: \"\\E259\";\n}\n.ff-body .glyphicon-menu-up:before {\n  content: \"\\E260\";\n}\n.ff-body * {\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box;\n}\n.ff-body *:before,\n.ff-body *:after {\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box;\n}\n.ff-body html {\n  font-size: 10px;\n  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);\n}\n.ff-body body {\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Helvetica, Arial, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\";\n  font-size: 14px;\n  line-height: 1.42857143;\n  color: #424242;\n  background-color: #fff;\n}\n.ff-body input,\n.ff-body button,\n.ff-body select,\n.ff-body textarea {\n  font-family: inherit;\n  font-size: inherit;\n  line-height: inherit;\n}\n.ff-body a {\n  color: #3498db;\n  text-decoration: none;\n}\n.ff-body a:hover,\n.ff-body a:focus {\n  color: #1d6fa5;\n  text-decoration: underline;\n}\n.ff-body a:focus {\n  outline: thin dotted;\n  outline: 5px auto -webkit-focus-ring-color;\n  outline-offset: -2px;\n}\n.ff-body figure {\n  margin: 0;\n}\n.ff-body img {\n  vertical-align: middle;\n}\n.ff-body .img-responsive {\n  display: block;\n  max-width: 100%;\n  height: auto;\n}\n.ff-body .img-rounded {\n  border-radius: 0px;\n}\n.ff-body .img-thumbnail {\n  padding: 4px;\n  line-height: 1.42857143;\n  background-color: #fff;\n  border: 1px solid #ddd;\n  border-radius: 0px;\n  -webkit-transition: all 0.2s ease-in-out;\n  -o-transition: all 0.2s ease-in-out;\n  transition: all 0.2s ease-in-out;\n  display: inline-block;\n  max-width: 100%;\n  height: auto;\n}\n.ff-body .img-circle {\n  border-radius: 50%;\n}\n.ff-body hr {\n  margin-top: 20px;\n  margin-bottom: 20px;\n  border: 0;\n  border-top: 1px solid #eeeeee;\n}\n.ff-body .sr-only {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  margin: -1px;\n  padding: 0;\n  overflow: hidden;\n  clip: rect(0, 0, 0, 0);\n  border: 0;\n}\n.ff-body .sr-only-focusable:active,\n.ff-body .sr-only-focusable:focus {\n  position: static;\n  width: auto;\n  height: auto;\n  margin: 0;\n  overflow: visible;\n  clip: auto;\n}\n.ff-body [role=\"button\"] {\n  cursor: pointer;\n}\n.ff-body h1,\n.ff-body h2,\n.ff-body h3,\n.ff-body h4,\n.ff-body h5,\n.ff-body h6,\n.ff-body .h1,\n.ff-body .h2,\n.ff-body .h3,\n.ff-body .h4,\n.ff-body .h5,\n.ff-body .h6 {\n  font-family: inherit;\n  font-weight: 500;\n  line-height: 1.1;\n  color: inherit;\n}\n.ff-body h1 small,\n.ff-body h2 small,\n.ff-body h3 small,\n.ff-body h4 small,\n.ff-body h5 small,\n.ff-body h6 small,\n.ff-body .h1 small,\n.ff-body .h2 small,\n.ff-body .h3 small,\n.ff-body .h4 small,\n.ff-body .h5 small,\n.ff-body .h6 small,\n.ff-body h1 .small,\n.ff-body h2 .small,\n.ff-body h3 .small,\n.ff-body h4 .small,\n.ff-body h5 .small,\n.ff-body h6 .small,\n.ff-body .h1 .small,\n.ff-body .h2 .small,\n.ff-body .h3 .small,\n.ff-body .h4 .small,\n.ff-body .h5 .small,\n.ff-body .h6 .small {\n  font-weight: normal;\n  line-height: 1;\n  color: #777777;\n}\n.ff-body h1,\n.ff-body .h1,\n.ff-body h2,\n.ff-body .h2,\n.ff-body h3,\n.ff-body .h3 {\n  margin-top: 20px;\n  margin-bottom: 10px;\n}\n.ff-body h1 small,\n.ff-body .h1 small,\n.ff-body h2 small,\n.ff-body .h2 small,\n.ff-body h3 small,\n.ff-body .h3 small,\n.ff-body h1 .small,\n.ff-body .h1 .small,\n.ff-body h2 .small,\n.ff-body .h2 .small,\n.ff-body h3 .small,\n.ff-body .h3 .small {\n  font-size: 65%;\n}\n.ff-body h4,\n.ff-body .h4,\n.ff-body h5,\n.ff-body .h5,\n.ff-body h6,\n.ff-body .h6 {\n  margin-top: 10px;\n  margin-bottom: 10px;\n}\n.ff-body h4 small,\n.ff-body .h4 small,\n.ff-body h5 small,\n.ff-body .h5 small,\n.ff-body h6 small,\n.ff-body .h6 small,\n.ff-body h4 .small,\n.ff-body .h4 .small,\n.ff-body h5 .small,\n.ff-body .h5 .small,\n.ff-body h6 .small,\n.ff-body .h6 .small {\n  font-size: 75%;\n}\n.ff-body h1,\n.ff-body .h1 {\n  font-size: 36px;\n}\n.ff-body h2,\n.ff-body .h2 {\n  font-size: 30px;\n}\n.ff-body h3,\n.ff-body .h3 {\n  font-size: 24px;\n}\n.ff-body h4,\n.ff-body .h4 {\n  font-size: 18px;\n}\n.ff-body h5,\n.ff-body .h5 {\n  font-size: 14px;\n}\n.ff-body h6,\n.ff-body .h6 {\n  font-size: 12px;\n}\n.ff-body p {\n  margin: 0 0 10px;\n}\n.ff-body .lead {\n  margin-bottom: 20px;\n  font-size: 16px;\n  font-weight: 300;\n  line-height: 1.4;\n}\n@media (min-width: 768px) {\n  .ff-body .lead {\n    font-size: 21px;\n  }\n}\n.ff-body small,\n.ff-body .small {\n  font-size: 85%;\n}\n.ff-body mark,\n.ff-body .mark {\n  background-color: #fcf8e3;\n  padding: .2em;\n}\n.ff-body .text-left {\n  text-align: left;\n}\n.ff-body .text-right {\n  text-align: right;\n}\n.ff-body .text-center {\n  text-align: center;\n}\n.ff-body .text-justify {\n  text-align: justify;\n}\n.ff-body .text-nowrap {\n  white-space: nowrap;\n}\n.ff-body .text-lowercase {\n  text-transform: lowercase;\n}\n.ff-body .text-uppercase {\n  text-transform: uppercase;\n}\n.ff-body .text-capitalize {\n  text-transform: capitalize;\n}\n.ff-body .text-muted {\n  color: #777777;\n}\n.ff-body .text-primary {\n  color: #3498db;\n}\na.ff-body .text-primary:hover,\na.ff-body .text-primary:focus {\n  color: #217dbb;\n}\n.ff-body .text-success {\n  color: #3c763d;\n}\na.ff-body .text-success:hover,\na.ff-body .text-success:focus {\n  color: #2b542c;\n}\n.ff-body .text-info {\n  color: #31708f;\n}\na.ff-body .text-info:hover,\na.ff-body .text-info:focus {\n  color: #245269;\n}\n.ff-body .text-warning {\n  color: #8a6d3b;\n}\na.ff-body .text-warning:hover,\na.ff-body .text-warning:focus {\n  color: #66512c;\n}\n.ff-body .text-danger {\n  color: #a94442;\n}\na.ff-body .text-danger:hover,\na.ff-body .text-danger:focus {\n  color: #843534;\n}\n.ff-body .bg-primary {\n  color: #fff;\n  background-color: #3498db;\n}\na.ff-body .bg-primary:hover,\na.ff-body .bg-primary:focus {\n  background-color: #217dbb;\n}\n.ff-body .bg-success {\n  background-color: #dff0d8;\n}\na.ff-body .bg-success:hover,\na.ff-body .bg-success:focus {\n  background-color: #c1e2b3;\n}\n.ff-body .bg-info {\n  background-color: #d9edf7;\n}\na.ff-body .bg-info:hover,\na.ff-body .bg-info:focus {\n  background-color: #afd9ee;\n}\n.ff-body .bg-warning {\n  background-color: #fcf8e3;\n}\na.ff-body .bg-warning:hover,\na.ff-body .bg-warning:focus {\n  background-color: #f7ecb5;\n}\n.ff-body .bg-danger {\n  background-color: #f2dede;\n}\na.ff-body .bg-danger:hover,\na.ff-body .bg-danger:focus {\n  background-color: #e4b9b9;\n}\n.ff-body .page-header {\n  padding-bottom: 9px;\n  margin: 40px 0 20px;\n  border-bottom: 1px solid #eeeeee;\n}\n.ff-body ul,\n.ff-body ol {\n  margin-top: 0;\n  margin-bottom: 10px;\n}\n.ff-body ul ul,\n.ff-body ol ul,\n.ff-body ul ol,\n.ff-body ol ol {\n  margin-bottom: 0;\n}\n.ff-body .list-unstyled {\n  padding-left: 0;\n  list-style: none;\n}\n.ff-body .list-inline {\n  padding-left: 0;\n  list-style: none;\n  margin-left: -5px;\n}\n.ff-body .list-inline > li {\n  display: inline-block;\n  padding-left: 5px;\n  padding-right: 5px;\n}\n.ff-body dl {\n  margin-top: 0;\n  margin-bottom: 20px;\n}\n.ff-body dt,\n.ff-body dd {\n  line-height: 1.42857143;\n}\n.ff-body dt {\n  font-weight: bold;\n}\n.ff-body dd {\n  margin-left: 0;\n}\n@media (min-width: 768px) {\n  .ff-body .dl-horizontal dt {\n    float: left;\n    width: 160px;\n    clear: left;\n    text-align: right;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    white-space: nowrap;\n  }\n  .ff-body .dl-horizontal dd {\n    margin-left: 180px;\n  }\n}\n.ff-body abbr[title],\n.ff-body abbr[data-original-title] {\n  cursor: help;\n  border-bottom: 1px dotted #777777;\n}\n.ff-body .initialism {\n  font-size: 90%;\n  text-transform: uppercase;\n}\n.ff-body blockquote {\n  padding: 10px 20px;\n  margin: 0 0 20px;\n  font-size: 17.5px;\n  border-left: 5px solid #eeeeee;\n}\n.ff-body blockquote p:last-child,\n.ff-body blockquote ul:last-child,\n.ff-body blockquote ol:last-child {\n  margin-bottom: 0;\n}\n.ff-body blockquote footer,\n.ff-body blockquote small,\n.ff-body blockquote .small {\n  display: block;\n  font-size: 80%;\n  line-height: 1.42857143;\n  color: #777777;\n}\n.ff-body blockquote footer:before,\n.ff-body blockquote small:before,\n.ff-body blockquote .small:before {\n  content: '\\2014   \\A0';\n}\n.ff-body .blockquote-reverse,\n.ff-body blockquote.pull-right {\n  padding-right: 15px;\n  padding-left: 0;\n  border-right: 5px solid #eeeeee;\n  border-left: 0;\n  text-align: right;\n}\n.ff-body .blockquote-reverse footer:before,\n.ff-body blockquote.pull-right footer:before,\n.ff-body .blockquote-reverse small:before,\n.ff-body blockquote.pull-right small:before,\n.ff-body .blockquote-reverse .small:before,\n.ff-body blockquote.pull-right .small:before {\n  content: '';\n}\n.ff-body .blockquote-reverse footer:after,\n.ff-body blockquote.pull-right footer:after,\n.ff-body .blockquote-reverse small:after,\n.ff-body blockquote.pull-right small:after,\n.ff-body .blockquote-reverse .small:after,\n.ff-body blockquote.pull-right .small:after {\n  content: '\\A0   \\2014';\n}\n.ff-body address {\n  margin-bottom: 20px;\n  font-style: normal;\n  line-height: 1.42857143;\n}\n.ff-body code,\n.ff-body kbd,\n.ff-body pre,\n.ff-body samp {\n  font-family: Menlo, Monaco, Consolas, \"Courier New\", monospace, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\";\n}\n.ff-body code {\n  padding: 2px 4px;\n  font-size: 90%;\n  color: #c7254e;\n  background-color: #f9f2f4;\n  border-radius: 0px;\n}\n.ff-body kbd {\n  padding: 2px 4px;\n  font-size: 90%;\n  color: #fff;\n  background-color: #333;\n  border-radius: 0px;\n  box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.25);\n}\n.ff-body kbd kbd {\n  padding: 0;\n  font-size: 100%;\n  font-weight: bold;\n  box-shadow: none;\n}\n.ff-body pre {\n  display: block;\n  padding: 9.5px;\n  margin: 0 0 10px;\n  font-size: 13px;\n  line-height: 1.42857143;\n  word-break: break-all;\n  word-wrap: break-word;\n  color: #333333;\n  background-color: #f5f5f5;\n  border: 1px solid #ccc;\n  border-radius: 0px;\n}\n.ff-body pre code {\n  padding: 0;\n  font-size: inherit;\n  color: inherit;\n  white-space: pre-wrap;\n  background-color: transparent;\n  border-radius: 0;\n}\n.ff-body .pre-scrollable {\n  max-height: 340px;\n  overflow-y: scroll;\n}\n.ff-body .container {\n  margin-right: auto;\n  margin-left: auto;\n  padding-left: 15px;\n  padding-right: 15px;\n}\n@media (min-width: 768px) {\n  .ff-body .container {\n    width: 750px;\n  }\n}\n@media (min-width: 992px) {\n  .ff-body .container {\n    width: 970px;\n  }\n}\n@media (min-width: 1200px) {\n  .ff-body .container {\n    width: 1170px;\n  }\n}\n.ff-body .container-fluid {\n  margin-right: auto;\n  margin-left: auto;\n  padding-left: 15px;\n  padding-right: 15px;\n}\n.ff-body .row {\n  margin-left: -15px;\n  margin-right: -15px;\n}\n.ff-body .col-xs-1, .col-sm-1, .col-md-1, .col-lg-1, .col-xs-2, .col-sm-2, .col-md-2, .col-lg-2, .col-xs-3, .col-sm-3, .col-md-3, .col-lg-3, .col-xs-4, .col-sm-4, .col-md-4, .col-lg-4, .col-xs-5, .col-sm-5, .col-md-5, .col-lg-5, .col-xs-6, .col-sm-6, .col-md-6, .col-lg-6, .col-xs-7, .col-sm-7, .col-md-7, .col-lg-7, .col-xs-8, .col-sm-8, .col-md-8, .col-lg-8, .col-xs-9, .col-sm-9, .col-md-9, .col-lg-9, .col-xs-10, .col-sm-10, .col-md-10, .col-lg-10, .col-xs-11, .col-sm-11, .col-md-11, .col-lg-11, .col-xs-12, .col-sm-12, .col-md-12, .col-lg-12 {\n  position: relative;\n  min-height: 1px;\n  padding-left: 15px;\n  padding-right: 15px;\n}\n.ff-body .col-xs-1, .col-xs-2, .col-xs-3, .col-xs-4, .col-xs-5, .col-xs-6, .col-xs-7, .col-xs-8, .col-xs-9, .col-xs-10, .col-xs-11, .col-xs-12 {\n  float: left;\n}\n.ff-body .col-xs-12 {\n  width: 100%;\n}\n.ff-body .col-xs-11 {\n  width: 91.66666667%;\n}\n.ff-body .col-xs-10 {\n  width: 83.33333333%;\n}\n.ff-body .col-xs-9 {\n  width: 75%;\n}\n.ff-body .col-xs-8 {\n  width: 66.66666667%;\n}\n.ff-body .col-xs-7 {\n  width: 58.33333333%;\n}\n.ff-body .col-xs-6 {\n  width: 50%;\n}\n.ff-body .col-xs-5 {\n  width: 41.66666667%;\n}\n.ff-body .col-xs-4 {\n  width: 33.33333333%;\n}\n.ff-body .col-xs-3 {\n  width: 25%;\n}\n.ff-body .col-xs-2 {\n  width: 16.66666667%;\n}\n.ff-body .col-xs-1 {\n  width: 8.33333333%;\n}\n.ff-body .col-xs-pull-12 {\n  right: 100%;\n}\n.ff-body .col-xs-pull-11 {\n  right: 91.66666667%;\n}\n.ff-body .col-xs-pull-10 {\n  right: 83.33333333%;\n}\n.ff-body .col-xs-pull-9 {\n  right: 75%;\n}\n.ff-body .col-xs-pull-8 {\n  right: 66.66666667%;\n}\n.ff-body .col-xs-pull-7 {\n  right: 58.33333333%;\n}\n.ff-body .col-xs-pull-6 {\n  right: 50%;\n}\n.ff-body .col-xs-pull-5 {\n  right: 41.66666667%;\n}\n.ff-body .col-xs-pull-4 {\n  right: 33.33333333%;\n}\n.ff-body .col-xs-pull-3 {\n  right: 25%;\n}\n.ff-body .col-xs-pull-2 {\n  right: 16.66666667%;\n}\n.ff-body .col-xs-pull-1 {\n  right: 8.33333333%;\n}\n.ff-body .col-xs-pull-0 {\n  right: auto;\n}\n.ff-body .col-xs-push-12 {\n  left: 100%;\n}\n.ff-body .col-xs-push-11 {\n  left: 91.66666667%;\n}\n.ff-body .col-xs-push-10 {\n  left: 83.33333333%;\n}\n.ff-body .col-xs-push-9 {\n  left: 75%;\n}\n.ff-body .col-xs-push-8 {\n  left: 66.66666667%;\n}\n.ff-body .col-xs-push-7 {\n  left: 58.33333333%;\n}\n.ff-body .col-xs-push-6 {\n  left: 50%;\n}\n.ff-body .col-xs-push-5 {\n  left: 41.66666667%;\n}\n.ff-body .col-xs-push-4 {\n  left: 33.33333333%;\n}\n.ff-body .col-xs-push-3 {\n  left: 25%;\n}\n.ff-body .col-xs-push-2 {\n  left: 16.66666667%;\n}\n.ff-body .col-xs-push-1 {\n  left: 8.33333333%;\n}\n.ff-body .col-xs-push-0 {\n  left: auto;\n}\n.ff-body .col-xs-offset-12 {\n  margin-left: 100%;\n}\n.ff-body .col-xs-offset-11 {\n  margin-left: 91.66666667%;\n}\n.ff-body .col-xs-offset-10 {\n  margin-left: 83.33333333%;\n}\n.ff-body .col-xs-offset-9 {\n  margin-left: 75%;\n}\n.ff-body .col-xs-offset-8 {\n  margin-left: 66.66666667%;\n}\n.ff-body .col-xs-offset-7 {\n  margin-left: 58.33333333%;\n}\n.ff-body .col-xs-offset-6 {\n  margin-left: 50%;\n}\n.ff-body .col-xs-offset-5 {\n  margin-left: 41.66666667%;\n}\n.ff-body .col-xs-offset-4 {\n  margin-left: 33.33333333%;\n}\n.ff-body .col-xs-offset-3 {\n  margin-left: 25%;\n}\n.ff-body .col-xs-offset-2 {\n  margin-left: 16.66666667%;\n}\n.ff-body .col-xs-offset-1 {\n  margin-left: 8.33333333%;\n}\n.ff-body .col-xs-offset-0 {\n  margin-left: 0%;\n}\n@media (min-width: 768px) {\n  .ff-body .col-sm-1, .col-sm-2, .col-sm-3, .col-sm-4, .col-sm-5, .col-sm-6, .col-sm-7, .col-sm-8, .col-sm-9, .col-sm-10, .col-sm-11, .col-sm-12 {\n    float: left;\n  }\n  .ff-body .col-sm-12 {\n    width: 100%;\n  }\n  .ff-body .col-sm-11 {\n    width: 91.66666667%;\n  }\n  .ff-body .col-sm-10 {\n    width: 83.33333333%;\n  }\n  .ff-body .col-sm-9 {\n    width: 75%;\n  }\n  .ff-body .col-sm-8 {\n    width: 66.66666667%;\n  }\n  .ff-body .col-sm-7 {\n    width: 58.33333333%;\n  }\n  .ff-body .col-sm-6 {\n    width: 50%;\n  }\n  .ff-body .col-sm-5 {\n    width: 41.66666667%;\n  }\n  .ff-body .col-sm-4 {\n    width: 33.33333333%;\n  }\n  .ff-body .col-sm-3 {\n    width: 25%;\n  }\n  .ff-body .col-sm-2 {\n    width: 16.66666667%;\n  }\n  .ff-body .col-sm-1 {\n    width: 8.33333333%;\n  }\n  .ff-body .col-sm-pull-12 {\n    right: 100%;\n  }\n  .ff-body .col-sm-pull-11 {\n    right: 91.66666667%;\n  }\n  .ff-body .col-sm-pull-10 {\n    right: 83.33333333%;\n  }\n  .ff-body .col-sm-pull-9 {\n    right: 75%;\n  }\n  .ff-body .col-sm-pull-8 {\n    right: 66.66666667%;\n  }\n  .ff-body .col-sm-pull-7 {\n    right: 58.33333333%;\n  }\n  .ff-body .col-sm-pull-6 {\n    right: 50%;\n  }\n  .ff-body .col-sm-pull-5 {\n    right: 41.66666667%;\n  }\n  .ff-body .col-sm-pull-4 {\n    right: 33.33333333%;\n  }\n  .ff-body .col-sm-pull-3 {\n    right: 25%;\n  }\n  .ff-body .col-sm-pull-2 {\n    right: 16.66666667%;\n  }\n  .ff-body .col-sm-pull-1 {\n    right: 8.33333333%;\n  }\n  .ff-body .col-sm-pull-0 {\n    right: auto;\n  }\n  .ff-body .col-sm-push-12 {\n    left: 100%;\n  }\n  .ff-body .col-sm-push-11 {\n    left: 91.66666667%;\n  }\n  .ff-body .col-sm-push-10 {\n    left: 83.33333333%;\n  }\n  .ff-body .col-sm-push-9 {\n    left: 75%;\n  }\n  .ff-body .col-sm-push-8 {\n    left: 66.66666667%;\n  }\n  .ff-body .col-sm-push-7 {\n    left: 58.33333333%;\n  }\n  .ff-body .col-sm-push-6 {\n    left: 50%;\n  }\n  .ff-body .col-sm-push-5 {\n    left: 41.66666667%;\n  }\n  .ff-body .col-sm-push-4 {\n    left: 33.33333333%;\n  }\n  .ff-body .col-sm-push-3 {\n    left: 25%;\n  }\n  .ff-body .col-sm-push-2 {\n    left: 16.66666667%;\n  }\n  .ff-body .col-sm-push-1 {\n    left: 8.33333333%;\n  }\n  .ff-body .col-sm-push-0 {\n    left: auto;\n  }\n  .ff-body .col-sm-offset-12 {\n    margin-left: 100%;\n  }\n  .ff-body .col-sm-offset-11 {\n    margin-left: 91.66666667%;\n  }\n  .ff-body .col-sm-offset-10 {\n    margin-left: 83.33333333%;\n  }\n  .ff-body .col-sm-offset-9 {\n    margin-left: 75%;\n  }\n  .ff-body .col-sm-offset-8 {\n    margin-left: 66.66666667%;\n  }\n  .ff-body .col-sm-offset-7 {\n    margin-left: 58.33333333%;\n  }\n  .ff-body .col-sm-offset-6 {\n    margin-left: 50%;\n  }\n  .ff-body .col-sm-offset-5 {\n    margin-left: 41.66666667%;\n  }\n  .ff-body .col-sm-offset-4 {\n    margin-left: 33.33333333%;\n  }\n  .ff-body .col-sm-offset-3 {\n    margin-left: 25%;\n  }\n  .ff-body .col-sm-offset-2 {\n    margin-left: 16.66666667%;\n  }\n  .ff-body .col-sm-offset-1 {\n    margin-left: 8.33333333%;\n  }\n  .ff-body .col-sm-offset-0 {\n    margin-left: 0%;\n  }\n}\n@media (min-width: 992px) {\n  .ff-body .col-md-1, .col-md-2, .col-md-3, .col-md-4, .col-md-5, .col-md-6, .col-md-7, .col-md-8, .col-md-9, .col-md-10, .col-md-11, .col-md-12 {\n    float: left;\n  }\n  .ff-body .col-md-12 {\n    width: 100%;\n  }\n  .ff-body .col-md-11 {\n    width: 91.66666667%;\n  }\n  .ff-body .col-md-10 {\n    width: 83.33333333%;\n  }\n  .ff-body .col-md-9 {\n    width: 75%;\n  }\n  .ff-body .col-md-8 {\n    width: 66.66666667%;\n  }\n  .ff-body .col-md-7 {\n    width: 58.33333333%;\n  }\n  .ff-body .col-md-6 {\n    width: 50%;\n  }\n  .ff-body .col-md-5 {\n    width: 41.66666667%;\n  }\n  .ff-body .col-md-4 {\n    width: 33.33333333%;\n  }\n  .ff-body .col-md-3 {\n    width: 25%;\n  }\n  .ff-body .col-md-2 {\n    width: 16.66666667%;\n  }\n  .ff-body .col-md-1 {\n    width: 8.33333333%;\n  }\n  .ff-body .col-md-pull-12 {\n    right: 100%;\n  }\n  .ff-body .col-md-pull-11 {\n    right: 91.66666667%;\n  }\n  .ff-body .col-md-pull-10 {\n    right: 83.33333333%;\n  }\n  .ff-body .col-md-pull-9 {\n    right: 75%;\n  }\n  .ff-body .col-md-pull-8 {\n    right: 66.66666667%;\n  }\n  .ff-body .col-md-pull-7 {\n    right: 58.33333333%;\n  }\n  .ff-body .col-md-pull-6 {\n    right: 50%;\n  }\n  .ff-body .col-md-pull-5 {\n    right: 41.66666667%;\n  }\n  .ff-body .col-md-pull-4 {\n    right: 33.33333333%;\n  }\n  .ff-body .col-md-pull-3 {\n    right: 25%;\n  }\n  .ff-body .col-md-pull-2 {\n    right: 16.66666667%;\n  }\n  .ff-body .col-md-pull-1 {\n    right: 8.33333333%;\n  }\n  .ff-body .col-md-pull-0 {\n    right: auto;\n  }\n  .ff-body .col-md-push-12 {\n    left: 100%;\n  }\n  .ff-body .col-md-push-11 {\n    left: 91.66666667%;\n  }\n  .ff-body .col-md-push-10 {\n    left: 83.33333333%;\n  }\n  .ff-body .col-md-push-9 {\n    left: 75%;\n  }\n  .ff-body .col-md-push-8 {\n    left: 66.66666667%;\n  }\n  .ff-body .col-md-push-7 {\n    left: 58.33333333%;\n  }\n  .ff-body .col-md-push-6 {\n    left: 50%;\n  }\n  .ff-body .col-md-push-5 {\n    left: 41.66666667%;\n  }\n  .ff-body .col-md-push-4 {\n    left: 33.33333333%;\n  }\n  .ff-body .col-md-push-3 {\n    left: 25%;\n  }\n  .ff-body .col-md-push-2 {\n    left: 16.66666667%;\n  }\n  .ff-body .col-md-push-1 {\n    left: 8.33333333%;\n  }\n  .ff-body .col-md-push-0 {\n    left: auto;\n  }\n  .ff-body .col-md-offset-12 {\n    margin-left: 100%;\n  }\n  .ff-body .col-md-offset-11 {\n    margin-left: 91.66666667%;\n  }\n  .ff-body .col-md-offset-10 {\n    margin-left: 83.33333333%;\n  }\n  .ff-body .col-md-offset-9 {\n    margin-left: 75%;\n  }\n  .ff-body .col-md-offset-8 {\n    margin-left: 66.66666667%;\n  }\n  .ff-body .col-md-offset-7 {\n    margin-left: 58.33333333%;\n  }\n  .ff-body .col-md-offset-6 {\n    margin-left: 50%;\n  }\n  .ff-body .col-md-offset-5 {\n    margin-left: 41.66666667%;\n  }\n  .ff-body .col-md-offset-4 {\n    margin-left: 33.33333333%;\n  }\n  .ff-body .col-md-offset-3 {\n    margin-left: 25%;\n  }\n  .ff-body .col-md-offset-2 {\n    margin-left: 16.66666667%;\n  }\n  .ff-body .col-md-offset-1 {\n    margin-left: 8.33333333%;\n  }\n  .ff-body .col-md-offset-0 {\n    margin-left: 0%;\n  }\n}\n@media (min-width: 1200px) {\n  .ff-body .col-lg-1, .col-lg-2, .col-lg-3, .col-lg-4, .col-lg-5, .col-lg-6, .col-lg-7, .col-lg-8, .col-lg-9, .col-lg-10, .col-lg-11, .col-lg-12 {\n    float: left;\n  }\n  .ff-body .col-lg-12 {\n    width: 100%;\n  }\n  .ff-body .col-lg-11 {\n    width: 91.66666667%;\n  }\n  .ff-body .col-lg-10 {\n    width: 83.33333333%;\n  }\n  .ff-body .col-lg-9 {\n    width: 75%;\n  }\n  .ff-body .col-lg-8 {\n    width: 66.66666667%;\n  }\n  .ff-body .col-lg-7 {\n    width: 58.33333333%;\n  }\n  .ff-body .col-lg-6 {\n    width: 50%;\n  }\n  .ff-body .col-lg-5 {\n    width: 41.66666667%;\n  }\n  .ff-body .col-lg-4 {\n    width: 33.33333333%;\n  }\n  .ff-body .col-lg-3 {\n    width: 25%;\n  }\n  .ff-body .col-lg-2 {\n    width: 16.66666667%;\n  }\n  .ff-body .col-lg-1 {\n    width: 8.33333333%;\n  }\n  .ff-body .col-lg-pull-12 {\n    right: 100%;\n  }\n  .ff-body .col-lg-pull-11 {\n    right: 91.66666667%;\n  }\n  .ff-body .col-lg-pull-10 {\n    right: 83.33333333%;\n  }\n  .ff-body .col-lg-pull-9 {\n    right: 75%;\n  }\n  .ff-body .col-lg-pull-8 {\n    right: 66.66666667%;\n  }\n  .ff-body .col-lg-pull-7 {\n    right: 58.33333333%;\n  }\n  .ff-body .col-lg-pull-6 {\n    right: 50%;\n  }\n  .ff-body .col-lg-pull-5 {\n    right: 41.66666667%;\n  }\n  .ff-body .col-lg-pull-4 {\n    right: 33.33333333%;\n  }\n  .ff-body .col-lg-pull-3 {\n    right: 25%;\n  }\n  .ff-body .col-lg-pull-2 {\n    right: 16.66666667%;\n  }\n  .ff-body .col-lg-pull-1 {\n    right: 8.33333333%;\n  }\n  .ff-body .col-lg-pull-0 {\n    right: auto;\n  }\n  .ff-body .col-lg-push-12 {\n    left: 100%;\n  }\n  .ff-body .col-lg-push-11 {\n    left: 91.66666667%;\n  }\n  .ff-body .col-lg-push-10 {\n    left: 83.33333333%;\n  }\n  .ff-body .col-lg-push-9 {\n    left: 75%;\n  }\n  .ff-body .col-lg-push-8 {\n    left: 66.66666667%;\n  }\n  .ff-body .col-lg-push-7 {\n    left: 58.33333333%;\n  }\n  .ff-body .col-lg-push-6 {\n    left: 50%;\n  }\n  .ff-body .col-lg-push-5 {\n    left: 41.66666667%;\n  }\n  .ff-body .col-lg-push-4 {\n    left: 33.33333333%;\n  }\n  .ff-body .col-lg-push-3 {\n    left: 25%;\n  }\n  .ff-body .col-lg-push-2 {\n    left: 16.66666667%;\n  }\n  .ff-body .col-lg-push-1 {\n    left: 8.33333333%;\n  }\n  .ff-body .col-lg-push-0 {\n    left: auto;\n  }\n  .ff-body .col-lg-offset-12 {\n    margin-left: 100%;\n  }\n  .ff-body .col-lg-offset-11 {\n    margin-left: 91.66666667%;\n  }\n  .ff-body .col-lg-offset-10 {\n    margin-left: 83.33333333%;\n  }\n  .ff-body .col-lg-offset-9 {\n    margin-left: 75%;\n  }\n  .ff-body .col-lg-offset-8 {\n    margin-left: 66.66666667%;\n  }\n  .ff-body .col-lg-offset-7 {\n    margin-left: 58.33333333%;\n  }\n  .ff-body .col-lg-offset-6 {\n    margin-left: 50%;\n  }\n  .ff-body .col-lg-offset-5 {\n    margin-left: 41.66666667%;\n  }\n  .ff-body .col-lg-offset-4 {\n    margin-left: 33.33333333%;\n  }\n  .ff-body .col-lg-offset-3 {\n    margin-left: 25%;\n  }\n  .ff-body .col-lg-offset-2 {\n    margin-left: 16.66666667%;\n  }\n  .ff-body .col-lg-offset-1 {\n    margin-left: 8.33333333%;\n  }\n  .ff-body .col-lg-offset-0 {\n    margin-left: 0%;\n  }\n}\n.ff-body table {\n  background-color: transparent;\n}\n.ff-body caption {\n  padding-top: 8px;\n  padding-bottom: 8px;\n  color: #777777;\n  text-align: left;\n}\n.ff-body th {\n  text-align: left;\n}\n.ff-body .table {\n  width: 100%;\n  max-width: 100%;\n  margin-bottom: 20px;\n}\n.ff-body .table > thead > tr > th,\n.ff-body .table > tbody > tr > th,\n.ff-body .table > tfoot > tr > th,\n.ff-body .table > thead > tr > td,\n.ff-body .table > tbody > tr > td,\n.ff-body .table > tfoot > tr > td {\n  padding: 8px;\n  line-height: 1.42857143;\n  vertical-align: top;\n  border-top: 1px solid #ddd;\n}\n.ff-body .table > thead > tr > th {\n  vertical-align: bottom;\n  border-bottom: 2px solid #ddd;\n}\n.ff-body .table > caption + thead > tr:first-child > th,\n.ff-body .table > colgroup + thead > tr:first-child > th,\n.ff-body .table > thead:first-child > tr:first-child > th,\n.ff-body .table > caption + thead > tr:first-child > td,\n.ff-body .table > colgroup + thead > tr:first-child > td,\n.ff-body .table > thead:first-child > tr:first-child > td {\n  border-top: 0;\n}\n.ff-body .table > tbody + tbody {\n  border-top: 2px solid #ddd;\n}\n.ff-body .table .table {\n  background-color: #fff;\n}\n.ff-body .table-condensed > thead > tr > th,\n.ff-body .table-condensed > tbody > tr > th,\n.ff-body .table-condensed > tfoot > tr > th,\n.ff-body .table-condensed > thead > tr > td,\n.ff-body .table-condensed > tbody > tr > td,\n.ff-body .table-condensed > tfoot > tr > td {\n  padding: 5px;\n}\n.ff-body .table-bordered {\n  border: 1px solid #ddd;\n}\n.ff-body .table-bordered > thead > tr > th,\n.ff-body .table-bordered > tbody > tr > th,\n.ff-body .table-bordered > tfoot > tr > th,\n.ff-body .table-bordered > thead > tr > td,\n.ff-body .table-bordered > tbody > tr > td,\n.ff-body .table-bordered > tfoot > tr > td {\n  border: 1px solid #ddd;\n}\n.ff-body .table-bordered > thead > tr > th,\n.ff-body .table-bordered > thead > tr > td {\n  border-bottom-width: 2px;\n}\n.ff-body .table-striped > tbody > tr:nth-of-type(odd) {\n  background-color: #f9f9f9;\n}\n.ff-body .table-hover > tbody > tr:hover {\n  background-color: #f5f5f5;\n}\n.ff-body table col[class*=\"col-\"] {\n  position: static;\n  float: none;\n  display: table-column;\n}\n.ff-body table td[class*=\"col-\"],\n.ff-body table th[class*=\"col-\"] {\n  position: static;\n  float: none;\n  display: table-cell;\n}\n.ff-body .table > thead > tr > td.active,\n.ff-body .table > tbody > tr > td.active,\n.ff-body .table > tfoot > tr > td.active,\n.ff-body .table > thead > tr > th.active,\n.ff-body .table > tbody > tr > th.active,\n.ff-body .table > tfoot > tr > th.active,\n.ff-body .table > thead > tr.active > td,\n.ff-body .table > tbody > tr.active > td,\n.ff-body .table > tfoot > tr.active > td,\n.ff-body .table > thead > tr.active > th,\n.ff-body .table > tbody > tr.active > th,\n.ff-body .table > tfoot > tr.active > th {\n  background-color: #f5f5f5;\n}\n.ff-body .table-hover > tbody > tr > td.active:hover,\n.ff-body .table-hover > tbody > tr > th.active:hover,\n.ff-body .table-hover > tbody > tr.active:hover > td,\n.ff-body .table-hover > tbody > tr:hover > .active,\n.ff-body .table-hover > tbody > tr.active:hover > th {\n  background-color: #e8e8e8;\n}\n.ff-body .table > thead > tr > td.success,\n.ff-body .table > tbody > tr > td.success,\n.ff-body .table > tfoot > tr > td.success,\n.ff-body .table > thead > tr > th.success,\n.ff-body .table > tbody > tr > th.success,\n.ff-body .table > tfoot > tr > th.success,\n.ff-body .table > thead > tr.success > td,\n.ff-body .table > tbody > tr.success > td,\n.ff-body .table > tfoot > tr.success > td,\n.ff-body .table > thead > tr.success > th,\n.ff-body .table > tbody > tr.success > th,\n.ff-body .table > tfoot > tr.success > th {\n  background-color: #dff0d8;\n}\n.ff-body .table-hover > tbody > tr > td.success:hover,\n.ff-body .table-hover > tbody > tr > th.success:hover,\n.ff-body .table-hover > tbody > tr.success:hover > td,\n.ff-body .table-hover > tbody > tr:hover > .success,\n.ff-body .table-hover > tbody > tr.success:hover > th {\n  background-color: #d0e9c6;\n}\n.ff-body .table > thead > tr > td.info,\n.ff-body .table > tbody > tr > td.info,\n.ff-body .table > tfoot > tr > td.info,\n.ff-body .table > thead > tr > th.info,\n.ff-body .table > tbody > tr > th.info,\n.ff-body .table > tfoot > tr > th.info,\n.ff-body .table > thead > tr.info > td,\n.ff-body .table > tbody > tr.info > td,\n.ff-body .table > tfoot > tr.info > td,\n.ff-body .table > thead > tr.info > th,\n.ff-body .table > tbody > tr.info > th,\n.ff-body .table > tfoot > tr.info > th {\n  background-color: #d9edf7;\n}\n.ff-body .table-hover > tbody > tr > td.info:hover,\n.ff-body .table-hover > tbody > tr > th.info:hover,\n.ff-body .table-hover > tbody > tr.info:hover > td,\n.ff-body .table-hover > tbody > tr:hover > .info,\n.ff-body .table-hover > tbody > tr.info:hover > th {\n  background-color: #c4e3f3;\n}\n.ff-body .table > thead > tr > td.warning,\n.ff-body .table > tbody > tr > td.warning,\n.ff-body .table > tfoot > tr > td.warning,\n.ff-body .table > thead > tr > th.warning,\n.ff-body .table > tbody > tr > th.warning,\n.ff-body .table > tfoot > tr > th.warning,\n.ff-body .table > thead > tr.warning > td,\n.ff-body .table > tbody > tr.warning > td,\n.ff-body .table > tfoot > tr.warning > td,\n.ff-body .table > thead > tr.warning > th,\n.ff-body .table > tbody > tr.warning > th,\n.ff-body .table > tfoot > tr.warning > th {\n  background-color: #fcf8e3;\n}\n.ff-body .table-hover > tbody > tr > td.warning:hover,\n.ff-body .table-hover > tbody > tr > th.warning:hover,\n.ff-body .table-hover > tbody > tr.warning:hover > td,\n.ff-body .table-hover > tbody > tr:hover > .warning,\n.ff-body .table-hover > tbody > tr.warning:hover > th {\n  background-color: #faf2cc;\n}\n.ff-body .table > thead > tr > td.danger,\n.ff-body .table > tbody > tr > td.danger,\n.ff-body .table > tfoot > tr > td.danger,\n.ff-body .table > thead > tr > th.danger,\n.ff-body .table > tbody > tr > th.danger,\n.ff-body .table > tfoot > tr > th.danger,\n.ff-body .table > thead > tr.danger > td,\n.ff-body .table > tbody > tr.danger > td,\n.ff-body .table > tfoot > tr.danger > td,\n.ff-body .table > thead > tr.danger > th,\n.ff-body .table > tbody > tr.danger > th,\n.ff-body .table > tfoot > tr.danger > th {\n  background-color: #f2dede;\n}\n.ff-body .table-hover > tbody > tr > td.danger:hover,\n.ff-body .table-hover > tbody > tr > th.danger:hover,\n.ff-body .table-hover > tbody > tr.danger:hover > td,\n.ff-body .table-hover > tbody > tr:hover > .danger,\n.ff-body .table-hover > tbody > tr.danger:hover > th {\n  background-color: #ebcccc;\n}\n.ff-body .table-responsive {\n  overflow-x: auto;\n  min-height: 0.01%;\n}\n@media screen and (max-width: 767px) {\n  .ff-body .table-responsive {\n    width: 100%;\n    margin-bottom: 15px;\n    overflow-y: hidden;\n    -ms-overflow-style: -ms-autohiding-scrollbar;\n    border: 1px solid #ddd;\n  }\n  .ff-body .table-responsive > .table {\n    margin-bottom: 0;\n  }\n  .ff-body .table-responsive > .table > thead > tr > th,\n  .ff-body .table-responsive > .table > tbody > tr > th,\n  .ff-body .table-responsive > .table > tfoot > tr > th,\n  .ff-body .table-responsive > .table > thead > tr > td,\n  .ff-body .table-responsive > .table > tbody > tr > td,\n  .ff-body .table-responsive > .table > tfoot > tr > td {\n    white-space: nowrap;\n  }\n  .ff-body .table-responsive > .table-bordered {\n    border: 0;\n  }\n  .ff-body .table-responsive > .table-bordered > thead > tr > th:first-child,\n  .ff-body .table-responsive > .table-bordered > tbody > tr > th:first-child,\n  .ff-body .table-responsive > .table-bordered > tfoot > tr > th:first-child,\n  .ff-body .table-responsive > .table-bordered > thead > tr > td:first-child,\n  .ff-body .table-responsive > .table-bordered > tbody > tr > td:first-child,\n  .ff-body .table-responsive > .table-bordered > tfoot > tr > td:first-child {\n    border-left: 0;\n  }\n  .ff-body .table-responsive > .table-bordered > thead > tr > th:last-child,\n  .ff-body .table-responsive > .table-bordered > tbody > tr > th:last-child,\n  .ff-body .table-responsive > .table-bordered > tfoot > tr > th:last-child,\n  .ff-body .table-responsive > .table-bordered > thead > tr > td:last-child,\n  .ff-body .table-responsive > .table-bordered > tbody > tr > td:last-child,\n  .ff-body .table-responsive > .table-bordered > tfoot > tr > td:last-child {\n    border-right: 0;\n  }\n  .ff-body .table-responsive > .table-bordered > tbody > tr:last-child > th,\n  .ff-body .table-responsive > .table-bordered > tfoot > tr:last-child > th,\n  .ff-body .table-responsive > .table-bordered > tbody > tr:last-child > td,\n  .ff-body .table-responsive > .table-bordered > tfoot > tr:last-child > td {\n    border-bottom: 0;\n  }\n}\n.ff-body fieldset {\n  padding: 0;\n  margin: 0;\n  border: 0;\n  min-width: 0;\n}\n.ff-body legend {\n  display: block;\n  width: 100%;\n  padding: 0;\n  margin-bottom: 20px;\n  font-size: 21px;\n  line-height: inherit;\n  color: #333333;\n  border: 0;\n  border-bottom: 1px solid #e5e5e5;\n}\n.ff-body label {\n  display: inline-block;\n  max-width: 100%;\n  margin-bottom: 5px;\n  font-weight: bold;\n}\n.ff-body input[type=\"search\"] {\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box;\n}\n.ff-body input[type=\"radio\"],\n.ff-body input[type=\"checkbox\"] {\n  margin: 4px 0 0;\n  margin-top: 1px \\9;\n  line-height: normal;\n}\n.ff-body input[type=\"file\"] {\n  display: block;\n}\n.ff-body input[type=\"range\"] {\n  display: block;\n  width: 100%;\n}\n.ff-body select[multiple],\n.ff-body select[size] {\n  height: auto;\n}\n.ff-body input[type=\"file\"]:focus,\n.ff-body input[type=\"radio\"]:focus,\n.ff-body input[type=\"checkbox\"]:focus {\n  outline: thin dotted;\n  outline: 5px auto -webkit-focus-ring-color;\n  outline-offset: -2px;\n}\n.ff-body output {\n  display: block;\n  padding-top: 7px;\n  font-size: 14px;\n  line-height: 1.42857143;\n  color: #555555;\n}\n.ff-body .form-control {\n  display: block;\n  width: 100%;\n  height: 34px;\n  padding: 6px 12px;\n  font-size: 14px;\n  line-height: 1.42857143;\n  color: #555555;\n  background-color: #fff;\n  background-image: none;\n  border: 1px solid #ccc;\n  border-radius: 0px;\n  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);\n  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);\n  -webkit-transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s;\n  -o-transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s;\n  transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s;\n}\n.ff-body .form-control:focus {\n  border-color: #66afe9;\n  outline: 0;\n  -webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(102, 175, 233, 0.6);\n  box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(102, 175, 233, 0.6);\n}\n.ff-body .form-control::-moz-placeholder {\n  color: #999;\n  opacity: 1;\n}\n.ff-body .form-control:-ms-input-placeholder {\n  color: #999;\n}\n.ff-body .form-control::-webkit-input-placeholder {\n  color: #999;\n}\n.ff-body .form-control::-ms-expand {\n  border: 0;\n  background-color: transparent;\n}\n.ff-body .form-control[disabled],\n.ff-body .form-control[readonly],\nfieldset[disabled] .ff-body .form-control {\n  background-color: #eeeeee;\n  opacity: 1;\n}\n.ff-body .form-control[disabled],\nfieldset[disabled] .ff-body .form-control {\n  cursor: not-allowed;\n}\ntextarea.ff-body .form-control {\n  height: auto;\n}\n.ff-body input[type=\"search\"] {\n  -webkit-appearance: none;\n}\n@media screen and (-webkit-min-device-pixel-ratio: 0) {\n  .ff-body input[type=\"date\"].form-control,\n  .ff-body input[type=\"time\"].form-control,\n  .ff-body input[type=\"datetime-local\"].form-control,\n  .ff-body input[type=\"month\"].form-control {\n    line-height: 34px;\n  }\n  .ff-body input[type=\"date\"].input-sm,\n  .ff-body input[type=\"time\"].input-sm,\n  .ff-body input[type=\"datetime-local\"].input-sm,\n  .ff-body input[type=\"month\"].input-sm,\n  .input-group-sm .ff-body input[type=\"date\"],\n  .input-group-sm .ff-body input[type=\"time\"],\n  .input-group-sm .ff-body input[type=\"datetime-local\"],\n  .input-group-sm .ff-body input[type=\"month\"] {\n    line-height: 30px;\n  }\n  .ff-body input[type=\"date\"].input-lg,\n  .ff-body input[type=\"time\"].input-lg,\n  .ff-body input[type=\"datetime-local\"].input-lg,\n  .ff-body input[type=\"month\"].input-lg,\n  .input-group-lg .ff-body input[type=\"date\"],\n  .input-group-lg .ff-body input[type=\"time\"],\n  .input-group-lg .ff-body input[type=\"datetime-local\"],\n  .input-group-lg .ff-body input[type=\"month\"] {\n    line-height: 46px;\n  }\n}\n.ff-body .form-group {\n  margin-bottom: 15px;\n}\n.ff-body .radio,\n.ff-body .checkbox {\n  position: relative;\n  display: block;\n  margin-top: 10px;\n  margin-bottom: 10px;\n}\n.ff-body .radio label,\n.ff-body .checkbox label {\n  min-height: 20px;\n  padding-left: 20px;\n  margin-bottom: 0;\n  font-weight: normal;\n  cursor: pointer;\n}\n.ff-body .radio input[type=\"radio\"],\n.ff-body .radio-inline input[type=\"radio\"],\n.ff-body .checkbox input[type=\"checkbox\"],\n.ff-body .checkbox-inline input[type=\"checkbox\"] {\n  position: absolute;\n  margin-left: -20px;\n  margin-top: 4px \\9;\n}\n.ff-body .radio + .radio,\n.ff-body .checkbox + .checkbox {\n  margin-top: -5px;\n}\n.ff-body .radio-inline,\n.ff-body .checkbox-inline {\n  position: relative;\n  display: inline-block;\n  padding-left: 20px;\n  margin-bottom: 0;\n  vertical-align: middle;\n  font-weight: normal;\n  cursor: pointer;\n}\n.ff-body .radio-inline + .radio-inline,\n.ff-body .checkbox-inline + .checkbox-inline {\n  margin-top: 0;\n  margin-left: 10px;\n}\n.ff-body input[type=\"radio\"][disabled],\n.ff-body input[type=\"checkbox\"][disabled],\n.ff-body input[type=\"radio\"].disabled,\n.ff-body input[type=\"checkbox\"].disabled,\nfieldset[disabled] .ff-body input[type=\"radio\"],\nfieldset[disabled] .ff-body input[type=\"checkbox\"] {\n  cursor: not-allowed;\n}\n.ff-body .radio-inline.disabled,\n.ff-body .checkbox-inline.disabled,\nfieldset[disabled] .ff-body .radio-inline,\nfieldset[disabled] .ff-body .checkbox-inline {\n  cursor: not-allowed;\n}\n.ff-body .radio.disabled label,\n.ff-body .checkbox.disabled label,\nfieldset[disabled] .ff-body .radio label,\nfieldset[disabled] .ff-body .checkbox label {\n  cursor: not-allowed;\n}\n.ff-body .form-control-static {\n  padding-top: 7px;\n  padding-bottom: 7px;\n  margin-bottom: 0;\n  min-height: 34px;\n}\n.ff-body .form-control-static.input-lg,\n.ff-body .form-control-static.input-sm {\n  padding-left: 0;\n  padding-right: 0;\n}\n.ff-body .input-sm {\n  height: 30px;\n  padding: 5px 10px;\n  font-size: 12px;\n  line-height: 1.5;\n  border-radius: 0px;\n}\nselect.ff-body .input-sm {\n  height: 30px;\n  line-height: 30px;\n}\ntextarea.ff-body .input-sm,\nselect[multiple].ff-body .input-sm {\n  height: auto;\n}\n.ff-body .form-group-sm .form-control {\n  height: 30px;\n  padding: 5px 10px;\n  font-size: 12px;\n  line-height: 1.5;\n  border-radius: 0px;\n}\n.ff-body .form-group-sm select.form-control {\n  height: 30px;\n  line-height: 30px;\n}\n.ff-body .form-group-sm textarea.form-control,\n.ff-body .form-group-sm select[multiple].form-control {\n  height: auto;\n}\n.ff-body .form-group-sm .form-control-static {\n  height: 30px;\n  min-height: 32px;\n  padding: 6px 10px;\n  font-size: 12px;\n  line-height: 1.5;\n}\n.ff-body .input-lg {\n  height: 46px;\n  padding: 10px 16px;\n  font-size: 18px;\n  line-height: 1.3333333;\n  border-radius: 0px;\n}\nselect.ff-body .input-lg {\n  height: 46px;\n  line-height: 46px;\n}\ntextarea.ff-body .input-lg,\nselect[multiple].ff-body .input-lg {\n  height: auto;\n}\n.ff-body .form-group-lg .form-control {\n  height: 46px;\n  padding: 10px 16px;\n  font-size: 18px;\n  line-height: 1.3333333;\n  border-radius: 0px;\n}\n.ff-body .form-group-lg select.form-control {\n  height: 46px;\n  line-height: 46px;\n}\n.ff-body .form-group-lg textarea.form-control,\n.ff-body .form-group-lg select[multiple].form-control {\n  height: auto;\n}\n.ff-body .form-group-lg .form-control-static {\n  height: 46px;\n  min-height: 38px;\n  padding: 11px 16px;\n  font-size: 18px;\n  line-height: 1.3333333;\n}\n.ff-body .has-feedback {\n  position: relative;\n}\n.ff-body .has-feedback .form-control {\n  padding-right: 42.5px;\n}\n.ff-body .form-control-feedback {\n  position: absolute;\n  top: 0;\n  right: 0;\n  z-index: 2;\n  display: block;\n  width: 34px;\n  height: 34px;\n  line-height: 34px;\n  text-align: center;\n  pointer-events: none;\n}\n.ff-body .input-lg + .form-control-feedback,\n.ff-body .input-group-lg + .form-control-feedback,\n.ff-body .form-group-lg .form-control + .form-control-feedback {\n  width: 46px;\n  height: 46px;\n  line-height: 46px;\n}\n.ff-body .input-sm + .form-control-feedback,\n.ff-body .input-group-sm + .form-control-feedback,\n.ff-body .form-group-sm .form-control + .form-control-feedback {\n  width: 30px;\n  height: 30px;\n  line-height: 30px;\n}\n.ff-body .has-success .help-block,\n.ff-body .has-success .control-label,\n.ff-body .has-success .radio,\n.ff-body .has-success .checkbox,\n.ff-body .has-success .radio-inline,\n.ff-body .has-success .checkbox-inline,\n.ff-body .has-success.radio label,\n.ff-body .has-success.checkbox label,\n.ff-body .has-success.radio-inline label,\n.ff-body .has-success.checkbox-inline label {\n  color: #3c763d;\n}\n.ff-body .has-success .form-control {\n  border-color: #3c763d;\n  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);\n  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);\n}\n.ff-body .has-success .form-control:focus {\n  border-color: #2b542c;\n  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 6px #67b168;\n  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 6px #67b168;\n}\n.ff-body .has-success .input-group-addon {\n  color: #3c763d;\n  border-color: #3c763d;\n  background-color: #dff0d8;\n}\n.ff-body .has-success .form-control-feedback {\n  color: #3c763d;\n}\n.ff-body .has-warning .help-block,\n.ff-body .has-warning .control-label,\n.ff-body .has-warning .radio,\n.ff-body .has-warning .checkbox,\n.ff-body .has-warning .radio-inline,\n.ff-body .has-warning .checkbox-inline,\n.ff-body .has-warning.radio label,\n.ff-body .has-warning.checkbox label,\n.ff-body .has-warning.radio-inline label,\n.ff-body .has-warning.checkbox-inline label {\n  color: #8a6d3b;\n}\n.ff-body .has-warning .form-control {\n  border-color: #8a6d3b;\n  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);\n  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);\n}\n.ff-body .has-warning .form-control:focus {\n  border-color: #66512c;\n  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 6px #c0a16b;\n  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 6px #c0a16b;\n}\n.ff-body .has-warning .input-group-addon {\n  color: #8a6d3b;\n  border-color: #8a6d3b;\n  background-color: #fcf8e3;\n}\n.ff-body .has-warning .form-control-feedback {\n  color: #8a6d3b;\n}\n.ff-body .has-error .help-block,\n.ff-body .has-error .control-label,\n.ff-body .has-error .radio,\n.ff-body .has-error .checkbox,\n.ff-body .has-error .radio-inline,\n.ff-body .has-error .checkbox-inline,\n.ff-body .has-error.radio label,\n.ff-body .has-error.checkbox label,\n.ff-body .has-error.radio-inline label,\n.ff-body .has-error.checkbox-inline label {\n  color: #a94442;\n}\n.ff-body .has-error .form-control {\n  border-color: #a94442;\n  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);\n  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);\n}\n.ff-body .has-error .form-control:focus {\n  border-color: #843534;\n  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 6px #ce8483;\n  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 6px #ce8483;\n}\n.ff-body .has-error .input-group-addon {\n  color: #a94442;\n  border-color: #a94442;\n  background-color: #f2dede;\n}\n.ff-body .has-error .form-control-feedback {\n  color: #a94442;\n}\n.ff-body .has-feedback label ~ .form-control-feedback {\n  top: 25px;\n}\n.ff-body .has-feedback label.sr-only ~ .form-control-feedback {\n  top: 0;\n}\n.ff-body .help-block {\n  display: block;\n  margin-top: 5px;\n  margin-bottom: 10px;\n  color: #828282;\n}\n@media (min-width: 768px) {\n  .ff-body .form-inline .form-group {\n    display: inline-block;\n    margin-bottom: 0;\n    vertical-align: middle;\n  }\n  .ff-body .form-inline .form-control {\n    display: inline-block;\n    width: auto;\n    vertical-align: middle;\n  }\n  .ff-body .form-inline .form-control-static {\n    display: inline-block;\n  }\n  .ff-body .form-inline .input-group {\n    display: inline-table;\n    vertical-align: middle;\n  }\n  .ff-body .form-inline .input-group .input-group-addon,\n  .ff-body .form-inline .input-group .input-group-btn,\n  .ff-body .form-inline .input-group .form-control {\n    width: auto;\n  }\n  .ff-body .form-inline .input-group > .form-control {\n    width: 100%;\n  }\n  .ff-body .form-inline .control-label {\n    margin-bottom: 0;\n    vertical-align: middle;\n  }\n  .ff-body .form-inline .radio,\n  .ff-body .form-inline .checkbox {\n    display: inline-block;\n    margin-top: 0;\n    margin-bottom: 0;\n    vertical-align: middle;\n  }\n  .ff-body .form-inline .radio label,\n  .ff-body .form-inline .checkbox label {\n    padding-left: 0;\n  }\n  .ff-body .form-inline .radio input[type=\"radio\"],\n  .ff-body .form-inline .checkbox input[type=\"checkbox\"] {\n    position: relative;\n    margin-left: 0;\n  }\n  .ff-body .form-inline .has-feedback .form-control-feedback {\n    top: 0;\n  }\n}\n.ff-body .form-horizontal .radio,\n.ff-body .form-horizontal .checkbox,\n.ff-body .form-horizontal .radio-inline,\n.ff-body .form-horizontal .checkbox-inline {\n  margin-top: 0;\n  margin-bottom: 0;\n  padding-top: 7px;\n}\n.ff-body .form-horizontal .radio,\n.ff-body .form-horizontal .checkbox {\n  min-height: 27px;\n}\n.ff-body .form-horizontal .form-group {\n  margin-left: -15px;\n  margin-right: -15px;\n}\n@media (min-width: 768px) {\n  .ff-body .form-horizontal .control-label {\n    text-align: right;\n    margin-bottom: 0;\n    padding-top: 7px;\n  }\n}\n.ff-body .form-horizontal .has-feedback .form-control-feedback {\n  right: 15px;\n}\n@media (min-width: 768px) {\n  .ff-body .form-horizontal .form-group-lg .control-label {\n    padding-top: 11px;\n    font-size: 18px;\n  }\n}\n@media (min-width: 768px) {\n  .ff-body .form-horizontal .form-group-sm .control-label {\n    padding-top: 6px;\n    font-size: 12px;\n  }\n}\n.ff-body .btn {\n  display: inline-block;\n  margin-bottom: 0;\n  font-weight: normal;\n  text-align: center;\n  vertical-align: middle;\n  touch-action: manipulation;\n  cursor: pointer;\n  background-image: none;\n  border: 1px solid transparent;\n  white-space: nowrap;\n  padding: 6px 12px;\n  font-size: 14px;\n  line-height: 1.42857143;\n  border-radius: 0px;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n}\n.ff-body .btn:focus,\n.ff-body .btn:active:focus,\n.ff-body .btn.active:focus,\n.ff-body .btn.focus,\n.ff-body .btn:active.focus,\n.ff-body .btn.active.focus {\n  outline: thin dotted;\n  outline: 5px auto -webkit-focus-ring-color;\n  outline-offset: -2px;\n}\n.ff-body .btn:hover,\n.ff-body .btn:focus,\n.ff-body .btn.focus {\n  color: #333;\n  text-decoration: none;\n}\n.ff-body .btn:active,\n.ff-body .btn.active {\n  outline: 0;\n  background-image: none;\n  -webkit-box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);\n  box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);\n}\n.ff-body .btn.disabled,\n.ff-body .btn[disabled],\nfieldset[disabled] .ff-body .btn {\n  cursor: not-allowed;\n  opacity: 0.65;\n  filter: alpha(opacity=65);\n  -webkit-box-shadow: none;\n  box-shadow: none;\n}\na.ff-body .btn.disabled,\nfieldset[disabled] a.ff-body .btn {\n  pointer-events: none;\n}\n.ff-body .btn-default {\n  color: #333;\n  background-color: #fff;\n  border-color: #ccc;\n}\n.ff-body .btn-default:focus,\n.ff-body .btn-default.focus {\n  color: #333;\n  background-color: #e6e6e6;\n  border-color: #8c8c8c;\n}\n.ff-body .btn-default:hover {\n  color: #333;\n  background-color: #e6e6e6;\n  border-color: #adadad;\n}\n.ff-body .btn-default:active,\n.ff-body .btn-default.active,\n.open > .dropdown-toggle.ff-body .btn-default {\n  color: #333;\n  background-color: #e6e6e6;\n  border-color: #adadad;\n}\n.ff-body .btn-default:active:hover,\n.ff-body .btn-default.active:hover,\n.open > .dropdown-toggle.ff-body .btn-default:hover,\n.ff-body .btn-default:active:focus,\n.ff-body .btn-default.active:focus,\n.open > .dropdown-toggle.ff-body .btn-default:focus,\n.ff-body .btn-default:active.focus,\n.ff-body .btn-default.active.focus,\n.open > .dropdown-toggle.ff-body .btn-default.focus {\n  color: #333;\n  background-color: #d4d4d4;\n  border-color: #8c8c8c;\n}\n.ff-body .btn-default:active,\n.ff-body .btn-default.active,\n.open > .dropdown-toggle.ff-body .btn-default {\n  background-image: none;\n}\n.ff-body .btn-default.disabled:hover,\n.ff-body .btn-default[disabled]:hover,\nfieldset[disabled] .ff-body .btn-default:hover,\n.ff-body .btn-default.disabled:focus,\n.ff-body .btn-default[disabled]:focus,\nfieldset[disabled] .ff-body .btn-default:focus,\n.ff-body .btn-default.disabled.focus,\n.ff-body .btn-default[disabled].focus,\nfieldset[disabled] .ff-body .btn-default.focus {\n  background-color: #fff;\n  border-color: #ccc;\n}\n.ff-body .btn-default .badge {\n  color: #fff;\n  background-color: #333;\n}\n.ff-body .btn-primary {\n  color: #3498db;\n  background-color: #fff;\n  border-color: #3498db;\n}\n.ff-body .btn-primary:focus,\n.ff-body .btn-primary.focus {\n  color: #3498db;\n  background-color: #e6e6e6;\n  border-color: #16527a;\n}\n.ff-body .btn-primary:hover {\n  color: #3498db;\n  background-color: #e6e6e6;\n  border-color: #2077b2;\n}\n.ff-body .btn-primary:active,\n.ff-body .btn-primary.active,\n.open > .dropdown-toggle.ff-body .btn-primary {\n  color: #3498db;\n  background-color: #e6e6e6;\n  border-color: #2077b2;\n}\n.ff-body .btn-primary:active:hover,\n.ff-body .btn-primary.active:hover,\n.open > .dropdown-toggle.ff-body .btn-primary:hover,\n.ff-body .btn-primary:active:focus,\n.ff-body .btn-primary.active:focus,\n.open > .dropdown-toggle.ff-body .btn-primary:focus,\n.ff-body .btn-primary:active.focus,\n.ff-body .btn-primary.active.focus,\n.open > .dropdown-toggle.ff-body .btn-primary.focus {\n  color: #3498db;\n  background-color: #d4d4d4;\n  border-color: #16527a;\n}\n.ff-body .btn-primary:active,\n.ff-body .btn-primary.active,\n.open > .dropdown-toggle.ff-body .btn-primary {\n  background-image: none;\n}\n.ff-body .btn-primary.disabled:hover,\n.ff-body .btn-primary[disabled]:hover,\nfieldset[disabled] .ff-body .btn-primary:hover,\n.ff-body .btn-primary.disabled:focus,\n.ff-body .btn-primary[disabled]:focus,\nfieldset[disabled] .ff-body .btn-primary:focus,\n.ff-body .btn-primary.disabled.focus,\n.ff-body .btn-primary[disabled].focus,\nfieldset[disabled] .ff-body .btn-primary.focus {\n  background-color: #fff;\n  border-color: #3498db;\n}\n.ff-body .btn-primary .badge {\n  color: #fff;\n  background-color: #3498db;\n}\n.ff-body .btn-success {\n  color: #70AB4F;\n  background-color: #fff;\n  border-color: #70AB4F;\n}\n.ff-body .btn-success:focus,\n.ff-body .btn-success.focus {\n  color: #70AB4F;\n  background-color: #e6e6e6;\n  border-color: #375427;\n}\n.ff-body .btn-success:hover {\n  color: #70AB4F;\n  background-color: #e6e6e6;\n  border-color: #55813c;\n}\n.ff-body .btn-success:active,\n.ff-body .btn-success.active,\n.open > .dropdown-toggle.ff-body .btn-success {\n  color: #70AB4F;\n  background-color: #e6e6e6;\n  border-color: #55813c;\n}\n.ff-body .btn-success:active:hover,\n.ff-body .btn-success.active:hover,\n.open > .dropdown-toggle.ff-body .btn-success:hover,\n.ff-body .btn-success:active:focus,\n.ff-body .btn-success.active:focus,\n.open > .dropdown-toggle.ff-body .btn-success:focus,\n.ff-body .btn-success:active.focus,\n.ff-body .btn-success.active.focus,\n.open > .dropdown-toggle.ff-body .btn-success.focus {\n  color: #70AB4F;\n  background-color: #d4d4d4;\n  border-color: #375427;\n}\n.ff-body .btn-success:active,\n.ff-body .btn-success.active,\n.open > .dropdown-toggle.ff-body .btn-success {\n  background-image: none;\n}\n.ff-body .btn-success.disabled:hover,\n.ff-body .btn-success[disabled]:hover,\nfieldset[disabled] .ff-body .btn-success:hover,\n.ff-body .btn-success.disabled:focus,\n.ff-body .btn-success[disabled]:focus,\nfieldset[disabled] .ff-body .btn-success:focus,\n.ff-body .btn-success.disabled.focus,\n.ff-body .btn-success[disabled].focus,\nfieldset[disabled] .ff-body .btn-success.focus {\n  background-color: #fff;\n  border-color: #70AB4F;\n}\n.ff-body .btn-success .badge {\n  color: #fff;\n  background-color: #70AB4F;\n}\n.ff-body .btn-info {\n  color: #3bafda;\n  background-color: #fff;\n  border-color: #28a5d4;\n}\n.ff-body .btn-info:focus,\n.ff-body .btn-info.focus {\n  color: #3bafda;\n  background-color: #e6e6e6;\n  border-color: #145168;\n}\n.ff-body .btn-info:hover {\n  color: #3bafda;\n  background-color: #e6e6e6;\n  border-color: #1e7da0;\n}\n.ff-body .btn-info:active,\n.ff-body .btn-info.active,\n.open > .dropdown-toggle.ff-body .btn-info {\n  color: #3bafda;\n  background-color: #e6e6e6;\n  border-color: #1e7da0;\n}\n.ff-body .btn-info:active:hover,\n.ff-body .btn-info.active:hover,\n.open > .dropdown-toggle.ff-body .btn-info:hover,\n.ff-body .btn-info:active:focus,\n.ff-body .btn-info.active:focus,\n.open > .dropdown-toggle.ff-body .btn-info:focus,\n.ff-body .btn-info:active.focus,\n.ff-body .btn-info.active.focus,\n.open > .dropdown-toggle.ff-body .btn-info.focus {\n  color: #3bafda;\n  background-color: #d4d4d4;\n  border-color: #145168;\n}\n.ff-body .btn-info:active,\n.ff-body .btn-info.active,\n.open > .dropdown-toggle.ff-body .btn-info {\n  background-image: none;\n}\n.ff-body .btn-info.disabled:hover,\n.ff-body .btn-info[disabled]:hover,\nfieldset[disabled] .ff-body .btn-info:hover,\n.ff-body .btn-info.disabled:focus,\n.ff-body .btn-info[disabled]:focus,\nfieldset[disabled] .ff-body .btn-info:focus,\n.ff-body .btn-info.disabled.focus,\n.ff-body .btn-info[disabled].focus,\nfieldset[disabled] .ff-body .btn-info.focus {\n  background-color: #fff;\n  border-color: #28a5d4;\n}\n.ff-body .btn-info .badge {\n  color: #fff;\n  background-color: #3bafda;\n}\n.ff-body .btn-warning {\n  color: #f6bb42;\n  background-color: #fff;\n  border-color: #f6bb42;\n}\n.ff-body .btn-warning:focus,\n.ff-body .btn-warning.focus {\n  color: #f6bb42;\n  background-color: #e6e6e6;\n  border-color: #b07908;\n}\n.ff-body .btn-warning:hover {\n  color: #f6bb42;\n  background-color: #e6e6e6;\n  border-color: #efa50b;\n}\n.ff-body .btn-warning:active,\n.ff-body .btn-warning.active,\n.open > .dropdown-toggle.ff-body .btn-warning {\n  color: #f6bb42;\n  background-color: #e6e6e6;\n  border-color: #efa50b;\n}\n.ff-body .btn-warning:active:hover,\n.ff-body .btn-warning.active:hover,\n.open > .dropdown-toggle.ff-body .btn-warning:hover,\n.ff-body .btn-warning:active:focus,\n.ff-body .btn-warning.active:focus,\n.open > .dropdown-toggle.ff-body .btn-warning:focus,\n.ff-body .btn-warning:active.focus,\n.ff-body .btn-warning.active.focus,\n.open > .dropdown-toggle.ff-body .btn-warning.focus {\n  color: #f6bb42;\n  background-color: #d4d4d4;\n  border-color: #b07908;\n}\n.ff-body .btn-warning:active,\n.ff-body .btn-warning.active,\n.open > .dropdown-toggle.ff-body .btn-warning {\n  background-image: none;\n}\n.ff-body .btn-warning.disabled:hover,\n.ff-body .btn-warning[disabled]:hover,\nfieldset[disabled] .ff-body .btn-warning:hover,\n.ff-body .btn-warning.disabled:focus,\n.ff-body .btn-warning[disabled]:focus,\nfieldset[disabled] .ff-body .btn-warning:focus,\n.ff-body .btn-warning.disabled.focus,\n.ff-body .btn-warning[disabled].focus,\nfieldset[disabled] .ff-body .btn-warning.focus {\n  background-color: #fff;\n  border-color: #f6bb42;\n}\n.ff-body .btn-warning .badge {\n  color: #fff;\n  background-color: #f6bb42;\n}\n.ff-body .btn-danger {\n  color: #e9573f;\n  background-color: #fff;\n  border-color: #e9573f;\n}\n.ff-body .btn-danger:focus,\n.ff-body .btn-danger.focus {\n  color: #e9573f;\n  background-color: #e6e6e6;\n  border-color: #972411;\n}\n.ff-body .btn-danger:hover {\n  color: #e9573f;\n  background-color: #e6e6e6;\n  border-color: #d33218;\n}\n.ff-body .btn-danger:active,\n.ff-body .btn-danger.active,\n.open > .dropdown-toggle.ff-body .btn-danger {\n  color: #e9573f;\n  background-color: #e6e6e6;\n  border-color: #d33218;\n}\n.ff-body .btn-danger:active:hover,\n.ff-body .btn-danger.active:hover,\n.open > .dropdown-toggle.ff-body .btn-danger:hover,\n.ff-body .btn-danger:active:focus,\n.ff-body .btn-danger.active:focus,\n.open > .dropdown-toggle.ff-body .btn-danger:focus,\n.ff-body .btn-danger:active.focus,\n.ff-body .btn-danger.active.focus,\n.open > .dropdown-toggle.ff-body .btn-danger.focus {\n  color: #e9573f;\n  background-color: #d4d4d4;\n  border-color: #972411;\n}\n.ff-body .btn-danger:active,\n.ff-body .btn-danger.active,\n.open > .dropdown-toggle.ff-body .btn-danger {\n  background-image: none;\n}\n.ff-body .btn-danger.disabled:hover,\n.ff-body .btn-danger[disabled]:hover,\nfieldset[disabled] .ff-body .btn-danger:hover,\n.ff-body .btn-danger.disabled:focus,\n.ff-body .btn-danger[disabled]:focus,\nfieldset[disabled] .ff-body .btn-danger:focus,\n.ff-body .btn-danger.disabled.focus,\n.ff-body .btn-danger[disabled].focus,\nfieldset[disabled] .ff-body .btn-danger.focus {\n  background-color: #fff;\n  border-color: #e9573f;\n}\n.ff-body .btn-danger .badge {\n  color: #fff;\n  background-color: #e9573f;\n}\n.ff-body .btn-link {\n  color: #3498db;\n  font-weight: normal;\n  border-radius: 0;\n}\n.ff-body .btn-link,\n.ff-body .btn-link:active,\n.ff-body .btn-link.active,\n.ff-body .btn-link[disabled],\nfieldset[disabled] .ff-body .btn-link {\n  background-color: transparent;\n  -webkit-box-shadow: none;\n  box-shadow: none;\n}\n.ff-body .btn-link,\n.ff-body .btn-link:hover,\n.ff-body .btn-link:focus,\n.ff-body .btn-link:active {\n  border-color: transparent;\n}\n.ff-body .btn-link:hover,\n.ff-body .btn-link:focus {\n  color: #1d6fa5;\n  text-decoration: underline;\n  background-color: transparent;\n}\n.ff-body .btn-link[disabled]:hover,\nfieldset[disabled] .ff-body .btn-link:hover,\n.ff-body .btn-link[disabled]:focus,\nfieldset[disabled] .ff-body .btn-link:focus {\n  color: #777777;\n  text-decoration: none;\n}\n.ff-body .btn-lg {\n  padding: 10px 16px;\n  font-size: 18px;\n  line-height: 1.3333333;\n  border-radius: 0px;\n}\n.ff-body .btn-sm {\n  padding: 5px 10px;\n  font-size: 12px;\n  line-height: 1.5;\n  border-radius: 0px;\n}\n.ff-body .btn-xs {\n  padding: 1px 5px;\n  font-size: 12px;\n  line-height: 1.5;\n  border-radius: 0px;\n}\n.ff-body .btn-block {\n  display: block;\n  width: 100%;\n}\n.ff-body .btn-block + .btn-block {\n  margin-top: 5px;\n}\n.ff-body input[type=\"submit\"].btn-block,\n.ff-body input[type=\"reset\"].btn-block,\n.ff-body input[type=\"button\"].btn-block {\n  width: 100%;\n}\n.ff-body .fade {\n  opacity: 0;\n  -webkit-transition: opacity 0.15s linear;\n  -o-transition: opacity 0.15s linear;\n  transition: opacity 0.15s linear;\n}\n.ff-body .fade.in {\n  opacity: 1;\n}\n.ff-body .collapse {\n  display: none;\n}\n.ff-body .collapse.in {\n  display: block;\n}\ntr.ff-body .collapse.in {\n  display: table-row;\n}\ntbody.ff-body .collapse.in {\n  display: table-row-group;\n}\n.ff-body .collapsing {\n  position: relative;\n  height: 0;\n  overflow: hidden;\n  -webkit-transition-property: height, visibility;\n  transition-property: height, visibility;\n  -webkit-transition-duration: 0.35s;\n  transition-duration: 0.35s;\n  -webkit-transition-timing-function: ease;\n  transition-timing-function: ease;\n}\n.ff-body .caret {\n  display: inline-block;\n  width: 0;\n  height: 0;\n  margin-left: 2px;\n  vertical-align: middle;\n  border-top: 4px dashed;\n  border-top: 4px solid \\9;\n  border-right: 4px solid transparent;\n  border-left: 4px solid transparent;\n}\n.ff-body .dropup,\n.ff-body .dropdown {\n  position: relative;\n}\n.ff-body .dropdown-toggle:focus {\n  outline: 0;\n}\n.ff-body .dropdown-menu {\n  position: absolute;\n  top: 100%;\n  left: 0;\n  z-index: 1000;\n  display: none;\n  float: left;\n  min-width: 160px;\n  padding: 5px 0;\n  margin: 2px 0 0;\n  list-style: none;\n  font-size: 14px;\n  text-align: left;\n  background-color: #fff;\n  border: 1px solid #ccc;\n  border: 1px solid rgba(0, 0, 0, 0.15);\n  border-radius: 0px;\n  -webkit-box-shadow: 0 6px 12px rgba(0, 0, 0, 0.175);\n  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.175);\n  background-clip: padding-box;\n}\n.ff-body .dropdown-menu.pull-right {\n  right: 0;\n  left: auto;\n}\n.ff-body .dropdown-menu .divider {\n  height: 1px;\n  margin: 9px 0;\n  overflow: hidden;\n  background-color: #e5e5e5;\n}\n.ff-body .dropdown-menu > li > a {\n  display: block;\n  padding: 3px 20px;\n  clear: both;\n  font-weight: normal;\n  line-height: 1.42857143;\n  color: #333333;\n  white-space: nowrap;\n}\n.ff-body .dropdown-menu > li > a:hover,\n.ff-body .dropdown-menu > li > a:focus {\n  text-decoration: none;\n  color: #262626;\n  background-color: #f5f5f5;\n}\n.ff-body .dropdown-menu > .active > a,\n.ff-body .dropdown-menu > .active > a:hover,\n.ff-body .dropdown-menu > .active > a:focus {\n  color: #fff;\n  text-decoration: none;\n  outline: 0;\n  background-color: #3498db;\n}\n.ff-body .dropdown-menu > .disabled > a,\n.ff-body .dropdown-menu > .disabled > a:hover,\n.ff-body .dropdown-menu > .disabled > a:focus {\n  color: #777777;\n}\n.ff-body .dropdown-menu > .disabled > a:hover,\n.ff-body .dropdown-menu > .disabled > a:focus {\n  text-decoration: none;\n  background-color: transparent;\n  background-image: none;\n  filter: progid:DXImageTransform.Microsoft.gradient(enabled = false);\n  cursor: not-allowed;\n}\n.ff-body .open > .dropdown-menu {\n  display: block;\n}\n.ff-body .open > a {\n  outline: 0;\n}\n.ff-body .dropdown-menu-right {\n  left: auto;\n  right: 0;\n}\n.ff-body .dropdown-menu-left {\n  left: 0;\n  right: auto;\n}\n.ff-body .dropdown-header {\n  display: block;\n  padding: 3px 20px;\n  font-size: 12px;\n  line-height: 1.42857143;\n  color: #777777;\n  white-space: nowrap;\n}\n.ff-body .dropdown-backdrop {\n  position: fixed;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  top: 0;\n  z-index: 990;\n}\n.ff-body .pull-right > .dropdown-menu {\n  right: 0;\n  left: auto;\n}\n.ff-body .dropup .caret,\n.ff-body .navbar-fixed-bottom .dropdown .caret {\n  border-top: 0;\n  border-bottom: 4px dashed;\n  border-bottom: 4px solid \\9;\n  content: \"\";\n}\n.ff-body .dropup .dropdown-menu,\n.ff-body .navbar-fixed-bottom .dropdown .dropdown-menu {\n  top: auto;\n  bottom: 100%;\n  margin-bottom: 2px;\n}\n@media (min-width: 768px) {\n  .ff-body .navbar-right .dropdown-menu {\n    left: auto;\n    right: 0;\n  }\n  .ff-body .navbar-right .dropdown-menu-left {\n    left: 0;\n    right: auto;\n  }\n}\n.ff-body .btn-group,\n.ff-body .btn-group-vertical {\n  position: relative;\n  display: inline-block;\n  vertical-align: middle;\n}\n.ff-body .btn-group > .btn,\n.ff-body .btn-group-vertical > .btn {\n  position: relative;\n  float: left;\n}\n.ff-body .btn-group > .btn:hover,\n.ff-body .btn-group-vertical > .btn:hover,\n.ff-body .btn-group > .btn:focus,\n.ff-body .btn-group-vertical > .btn:focus,\n.ff-body .btn-group > .btn:active,\n.ff-body .btn-group-vertical > .btn:active,\n.ff-body .btn-group > .btn.active,\n.ff-body .btn-group-vertical > .btn.active {\n  z-index: 2;\n}\n.ff-body .btn-group .btn + .btn,\n.ff-body .btn-group .btn + .btn-group,\n.ff-body .btn-group .btn-group + .btn,\n.ff-body .btn-group .btn-group + .btn-group {\n  margin-left: -1px;\n}\n.ff-body .btn-toolbar {\n  margin-left: -5px;\n}\n.ff-body .btn-toolbar .btn,\n.ff-body .btn-toolbar .btn-group,\n.ff-body .btn-toolbar .input-group {\n  float: left;\n}\n.ff-body .btn-toolbar > .btn,\n.ff-body .btn-toolbar > .btn-group,\n.ff-body .btn-toolbar > .input-group {\n  margin-left: 5px;\n}\n.ff-body .btn-group > .btn:not(:first-child):not(:last-child):not(.dropdown-toggle) {\n  border-radius: 0;\n}\n.ff-body .btn-group > .btn:first-child {\n  margin-left: 0;\n}\n.ff-body .btn-group > .btn:first-child:not(:last-child):not(.dropdown-toggle) {\n  border-bottom-right-radius: 0;\n  border-top-right-radius: 0;\n}\n.ff-body .btn-group > .btn:last-child:not(:first-child),\n.ff-body .btn-group > .dropdown-toggle:not(:first-child) {\n  border-bottom-left-radius: 0;\n  border-top-left-radius: 0;\n}\n.ff-body .btn-group > .btn-group {\n  float: left;\n}\n.ff-body .btn-group > .btn-group:not(:first-child):not(:last-child) > .btn {\n  border-radius: 0;\n}\n.ff-body .btn-group > .btn-group:first-child:not(:last-child) > .btn:last-child,\n.ff-body .btn-group > .btn-group:first-child:not(:last-child) > .dropdown-toggle {\n  border-bottom-right-radius: 0;\n  border-top-right-radius: 0;\n}\n.ff-body .btn-group > .btn-group:last-child:not(:first-child) > .btn:first-child {\n  border-bottom-left-radius: 0;\n  border-top-left-radius: 0;\n}\n.ff-body .btn-group .dropdown-toggle:active,\n.ff-body .btn-group.open .dropdown-toggle {\n  outline: 0;\n}\n.ff-body .btn-group > .btn + .dropdown-toggle {\n  padding-left: 8px;\n  padding-right: 8px;\n}\n.ff-body .btn-group > .btn-lg + .dropdown-toggle {\n  padding-left: 12px;\n  padding-right: 12px;\n}\n.ff-body .btn-group.open .dropdown-toggle {\n  -webkit-box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);\n  box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);\n}\n.ff-body .btn-group.open .dropdown-toggle.btn-link {\n  -webkit-box-shadow: none;\n  box-shadow: none;\n}\n.ff-body .btn .caret {\n  margin-left: 0;\n}\n.ff-body .btn-lg .caret {\n  border-width: 5px 5px 0;\n  border-bottom-width: 0;\n}\n.ff-body .dropup .btn-lg .caret {\n  border-width: 0 5px 5px;\n}\n.ff-body .btn-group-vertical > .btn,\n.ff-body .btn-group-vertical > .btn-group,\n.ff-body .btn-group-vertical > .btn-group > .btn {\n  display: block;\n  float: none;\n  width: 100%;\n  max-width: 100%;\n}\n.ff-body .btn-group-vertical > .btn-group > .btn {\n  float: none;\n}\n.ff-body .btn-group-vertical > .btn + .btn,\n.ff-body .btn-group-vertical > .btn + .btn-group,\n.ff-body .btn-group-vertical > .btn-group + .btn,\n.ff-body .btn-group-vertical > .btn-group + .btn-group {\n  margin-top: -1px;\n  margin-left: 0;\n}\n.ff-body .btn-group-vertical > .btn:not(:first-child):not(:last-child) {\n  border-radius: 0;\n}\n.ff-body .btn-group-vertical > .btn:first-child:not(:last-child) {\n  border-top-right-radius: 0px;\n  border-top-left-radius: 0px;\n  border-bottom-right-radius: 0;\n  border-bottom-left-radius: 0;\n}\n.ff-body .btn-group-vertical > .btn:last-child:not(:first-child) {\n  border-top-right-radius: 0;\n  border-top-left-radius: 0;\n  border-bottom-right-radius: 0px;\n  border-bottom-left-radius: 0px;\n}\n.ff-body .btn-group-vertical > .btn-group:not(:first-child):not(:last-child) > .btn {\n  border-radius: 0;\n}\n.ff-body .btn-group-vertical > .btn-group:first-child:not(:last-child) > .btn:last-child,\n.ff-body .btn-group-vertical > .btn-group:first-child:not(:last-child) > .dropdown-toggle {\n  border-bottom-right-radius: 0;\n  border-bottom-left-radius: 0;\n}\n.ff-body .btn-group-vertical > .btn-group:last-child:not(:first-child) > .btn:first-child {\n  border-top-right-radius: 0;\n  border-top-left-radius: 0;\n}\n.ff-body .btn-group-justified {\n  display: table;\n  width: 100%;\n  table-layout: fixed;\n  border-collapse: separate;\n}\n.ff-body .btn-group-justified > .btn,\n.ff-body .btn-group-justified > .btn-group {\n  float: none;\n  display: table-cell;\n  width: 1%;\n}\n.ff-body .btn-group-justified > .btn-group .btn {\n  width: 100%;\n}\n.ff-body .btn-group-justified > .btn-group .dropdown-menu {\n  left: auto;\n}\n.ff-body [data-toggle=\"buttons\"] > .btn input[type=\"radio\"],\n.ff-body [data-toggle=\"buttons\"] > .btn-group > .btn input[type=\"radio\"],\n.ff-body [data-toggle=\"buttons\"] > .btn input[type=\"checkbox\"],\n.ff-body [data-toggle=\"buttons\"] > .btn-group > .btn input[type=\"checkbox\"] {\n  position: absolute;\n  clip: rect(0, 0, 0, 0);\n  pointer-events: none;\n}\n.ff-body .input-group {\n  position: relative;\n  display: table;\n  border-collapse: separate;\n}\n.ff-body .input-group[class*=\"col-\"] {\n  float: none;\n  padding-left: 0;\n  padding-right: 0;\n}\n.ff-body .input-group .form-control {\n  position: relative;\n  z-index: 2;\n  float: left;\n  width: 100%;\n  margin-bottom: 0;\n}\n.ff-body .input-group .form-control:focus {\n  z-index: 3;\n}\n.ff-body .input-group-lg > .form-control,\n.ff-body .input-group-lg > .input-group-addon,\n.ff-body .input-group-lg > .input-group-btn > .btn {\n  height: 46px;\n  padding: 10px 16px;\n  font-size: 18px;\n  line-height: 1.3333333;\n  border-radius: 0px;\n}\nselect.ff-body .input-group-lg > .form-control,\nselect.ff-body .input-group-lg > .input-group-addon,\nselect.ff-body .input-group-lg > .input-group-btn > .btn {\n  height: 46px;\n  line-height: 46px;\n}\ntextarea.ff-body .input-group-lg > .form-control,\ntextarea.ff-body .input-group-lg > .input-group-addon,\ntextarea.ff-body .input-group-lg > .input-group-btn > .btn,\nselect[multiple].ff-body .input-group-lg > .form-control,\nselect[multiple].ff-body .input-group-lg > .input-group-addon,\nselect[multiple].ff-body .input-group-lg > .input-group-btn > .btn {\n  height: auto;\n}\n.ff-body .input-group-sm > .form-control,\n.ff-body .input-group-sm > .input-group-addon,\n.ff-body .input-group-sm > .input-group-btn > .btn {\n  height: 30px;\n  padding: 5px 10px;\n  font-size: 12px;\n  line-height: 1.5;\n  border-radius: 0px;\n}\nselect.ff-body .input-group-sm > .form-control,\nselect.ff-body .input-group-sm > .input-group-addon,\nselect.ff-body .input-group-sm > .input-group-btn > .btn {\n  height: 30px;\n  line-height: 30px;\n}\ntextarea.ff-body .input-group-sm > .form-control,\ntextarea.ff-body .input-group-sm > .input-group-addon,\ntextarea.ff-body .input-group-sm > .input-group-btn > .btn,\nselect[multiple].ff-body .input-group-sm > .form-control,\nselect[multiple].ff-body .input-group-sm > .input-group-addon,\nselect[multiple].ff-body .input-group-sm > .input-group-btn > .btn {\n  height: auto;\n}\n.ff-body .input-group-addon,\n.ff-body .input-group-btn,\n.ff-body .input-group .form-control {\n  display: table-cell;\n}\n.ff-body .input-group-addon:not(:first-child):not(:last-child),\n.ff-body .input-group-btn:not(:first-child):not(:last-child),\n.ff-body .input-group .form-control:not(:first-child):not(:last-child) {\n  border-radius: 0;\n}\n.ff-body .input-group-addon,\n.ff-body .input-group-btn {\n  width: 1%;\n  white-space: nowrap;\n  vertical-align: middle;\n}\n.ff-body .input-group-addon {\n  padding: 6px 12px;\n  font-size: 14px;\n  font-weight: normal;\n  line-height: 1;\n  color: #555555;\n  text-align: center;\n  background-color: #eeeeee;\n  border: 1px solid #ccc;\n  border-radius: 0px;\n}\n.ff-body .input-group-addon.input-sm {\n  padding: 5px 10px;\n  font-size: 12px;\n  border-radius: 0px;\n}\n.ff-body .input-group-addon.input-lg {\n  padding: 10px 16px;\n  font-size: 18px;\n  border-radius: 0px;\n}\n.ff-body .input-group-addon input[type=\"radio\"],\n.ff-body .input-group-addon input[type=\"checkbox\"] {\n  margin-top: 0;\n}\n.ff-body .input-group .form-control:first-child,\n.ff-body .input-group-addon:first-child,\n.ff-body .input-group-btn:first-child > .btn,\n.ff-body .input-group-btn:first-child > .btn-group > .btn,\n.ff-body .input-group-btn:first-child > .dropdown-toggle,\n.ff-body .input-group-btn:last-child > .btn:not(:last-child):not(.dropdown-toggle),\n.ff-body .input-group-btn:last-child > .btn-group:not(:last-child) > .btn {\n  border-bottom-right-radius: 0;\n  border-top-right-radius: 0;\n}\n.ff-body .input-group-addon:first-child {\n  border-right: 0;\n}\n.ff-body .input-group .form-control:last-child,\n.ff-body .input-group-addon:last-child,\n.ff-body .input-group-btn:last-child > .btn,\n.ff-body .input-group-btn:last-child > .btn-group > .btn,\n.ff-body .input-group-btn:last-child > .dropdown-toggle,\n.ff-body .input-group-btn:first-child > .btn:not(:first-child),\n.ff-body .input-group-btn:first-child > .btn-group:not(:first-child) > .btn {\n  border-bottom-left-radius: 0;\n  border-top-left-radius: 0;\n}\n.ff-body .input-group-addon:last-child {\n  border-left: 0;\n}\n.ff-body .input-group-btn {\n  position: relative;\n  font-size: 0;\n  white-space: nowrap;\n}\n.ff-body .input-group-btn > .btn {\n  position: relative;\n}\n.ff-body .input-group-btn > .btn + .btn {\n  margin-left: -1px;\n}\n.ff-body .input-group-btn > .btn:hover,\n.ff-body .input-group-btn > .btn:focus,\n.ff-body .input-group-btn > .btn:active {\n  z-index: 2;\n}\n.ff-body .input-group-btn:first-child > .btn,\n.ff-body .input-group-btn:first-child > .btn-group {\n  margin-right: -1px;\n}\n.ff-body .input-group-btn:last-child > .btn,\n.ff-body .input-group-btn:last-child > .btn-group {\n  z-index: 2;\n  margin-left: -1px;\n}\n.ff-body .nav {\n  margin-bottom: 0;\n  padding-left: 0;\n  list-style: none;\n}\n.ff-body .nav > li {\n  position: relative;\n  display: block;\n}\n.ff-body .nav > li > a {\n  position: relative;\n  display: block;\n  padding: 10px 15px;\n}\n.ff-body .nav > li > a:hover,\n.ff-body .nav > li > a:focus {\n  text-decoration: none;\n  background-color: #eeeeee;\n}\n.ff-body .nav > li.disabled > a {\n  color: #777777;\n}\n.ff-body .nav > li.disabled > a:hover,\n.ff-body .nav > li.disabled > a:focus {\n  color: #777777;\n  text-decoration: none;\n  background-color: transparent;\n  cursor: not-allowed;\n}\n.ff-body .nav .open > a,\n.ff-body .nav .open > a:hover,\n.ff-body .nav .open > a:focus {\n  background-color: #eeeeee;\n  border-color: #3498db;\n}\n.ff-body .nav .nav-divider {\n  height: 1px;\n  margin: 9px 0;\n  overflow: hidden;\n  background-color: #e5e5e5;\n}\n.ff-body .nav > li > a > img {\n  max-width: none;\n}\n.ff-body .nav-tabs {\n  border-bottom: 1px solid #ddd;\n}\n.ff-body .nav-tabs > li {\n  float: left;\n  margin-bottom: -1px;\n}\n.ff-body .nav-tabs > li > a {\n  margin-right: 2px;\n  line-height: 1.42857143;\n  border: 1px solid transparent;\n  border-radius: 0px 0px 0 0;\n}\n.ff-body .nav-tabs > li > a:hover {\n  border-color: #eeeeee #eeeeee #ddd;\n}\n.ff-body .nav-tabs > li.active > a,\n.ff-body .nav-tabs > li.active > a:hover,\n.ff-body .nav-tabs > li.active > a:focus {\n  color: #555555;\n  background-color: #fff;\n  border: 1px solid #ddd;\n  border-bottom-color: transparent;\n  cursor: default;\n}\n.ff-body .nav-tabs.nav-justified {\n  width: 100%;\n  border-bottom: 0;\n}\n.ff-body .nav-tabs.nav-justified > li {\n  float: none;\n}\n.ff-body .nav-tabs.nav-justified > li > a {\n  text-align: center;\n  margin-bottom: 5px;\n}\n.ff-body .nav-tabs.nav-justified > .dropdown .dropdown-menu {\n  top: auto;\n  left: auto;\n}\n@media (min-width: 768px) {\n  .ff-body .nav-tabs.nav-justified > li {\n    display: table-cell;\n    width: 1%;\n  }\n  .ff-body .nav-tabs.nav-justified > li > a {\n    margin-bottom: 0;\n  }\n}\n.ff-body .nav-tabs.nav-justified > li > a {\n  margin-right: 0;\n  border-radius: 0px;\n}\n.ff-body .nav-tabs.nav-justified > .active > a,\n.ff-body .nav-tabs.nav-justified > .active > a:hover,\n.ff-body .nav-tabs.nav-justified > .active > a:focus {\n  border: 1px solid #ddd;\n}\n@media (min-width: 768px) {\n  .ff-body .nav-tabs.nav-justified > li > a {\n    border-bottom: 1px solid #ddd;\n    border-radius: 0px 0px 0 0;\n  }\n  .ff-body .nav-tabs.nav-justified > .active > a,\n  .ff-body .nav-tabs.nav-justified > .active > a:hover,\n  .ff-body .nav-tabs.nav-justified > .active > a:focus {\n    border-bottom-color: #fff;\n  }\n}\n.ff-body .nav-pills > li {\n  float: left;\n}\n.ff-body .nav-pills > li > a {\n  border-radius: 0px;\n}\n.ff-body .nav-pills > li + li {\n  margin-left: 2px;\n}\n.ff-body .nav-pills > li.active > a,\n.ff-body .nav-pills > li.active > a:hover,\n.ff-body .nav-pills > li.active > a:focus {\n  color: #fff;\n  background-color: #3498db;\n}\n.ff-body .nav-stacked > li {\n  float: none;\n}\n.ff-body .nav-stacked > li + li {\n  margin-top: 2px;\n  margin-left: 0;\n}\n.ff-body .nav-justified {\n  width: 100%;\n}\n.ff-body .nav-justified > li {\n  float: none;\n}\n.ff-body .nav-justified > li > a {\n  text-align: center;\n  margin-bottom: 5px;\n}\n.ff-body .nav-justified > .dropdown .dropdown-menu {\n  top: auto;\n  left: auto;\n}\n@media (min-width: 768px) {\n  .ff-body .nav-justified > li {\n    display: table-cell;\n    width: 1%;\n  }\n  .ff-body .nav-justified > li > a {\n    margin-bottom: 0;\n  }\n}\n.ff-body .nav-tabs-justified {\n  border-bottom: 0;\n}\n.ff-body .nav-tabs-justified > li > a {\n  margin-right: 0;\n  border-radius: 0px;\n}\n.ff-body .nav-tabs-justified > .active > a,\n.ff-body .nav-tabs-justified > .active > a:hover,\n.ff-body .nav-tabs-justified > .active > a:focus {\n  border: 1px solid #ddd;\n}\n@media (min-width: 768px) {\n  .ff-body .nav-tabs-justified > li > a {\n    border-bottom: 1px solid #ddd;\n    border-radius: 0px 0px 0 0;\n  }\n  .ff-body .nav-tabs-justified > .active > a,\n  .ff-body .nav-tabs-justified > .active > a:hover,\n  .ff-body .nav-tabs-justified > .active > a:focus {\n    border-bottom-color: #fff;\n  }\n}\n.ff-body .tab-content > .tab-pane {\n  display: none;\n}\n.ff-body .tab-content > .active {\n  display: block;\n}\n.ff-body .nav-tabs .dropdown-menu {\n  margin-top: -1px;\n  border-top-right-radius: 0;\n  border-top-left-radius: 0;\n}\n.ff-body .navbar {\n  position: relative;\n  min-height: 50px;\n  margin-bottom: 20px;\n  border: 1px solid transparent;\n}\n@media (min-width: 768px) {\n  .ff-body .navbar {\n    border-radius: 0px;\n  }\n}\n@media (min-width: 768px) {\n  .ff-body .navbar-header {\n    float: left;\n  }\n}\n.ff-body .navbar-collapse {\n  overflow-x: visible;\n  padding-right: 15px;\n  padding-left: 15px;\n  border-top: 1px solid transparent;\n  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);\n  -webkit-overflow-scrolling: touch;\n}\n.ff-body .navbar-collapse.in {\n  overflow-y: auto;\n}\n@media (min-width: 768px) {\n  .ff-body .navbar-collapse {\n    width: auto;\n    border-top: 0;\n    box-shadow: none;\n  }\n  .ff-body .navbar-collapse.collapse {\n    display: block !important;\n    height: auto !important;\n    padding-bottom: 0;\n    overflow: visible !important;\n  }\n  .ff-body .navbar-collapse.in {\n    overflow-y: visible;\n  }\n  .navbar-fixed-top .ff-body .navbar-collapse,\n  .navbar-static-top .ff-body .navbar-collapse,\n  .navbar-fixed-bottom .ff-body .navbar-collapse {\n    padding-left: 0;\n    padding-right: 0;\n  }\n}\n.ff-body .navbar-fixed-top .navbar-collapse,\n.ff-body .navbar-fixed-bottom .navbar-collapse {\n  max-height: 340px;\n}\n@media (max-device-width: 480px) and (orientation: landscape) {\n  .ff-body .navbar-fixed-top .navbar-collapse,\n  .ff-body .navbar-fixed-bottom .navbar-collapse {\n    max-height: 200px;\n  }\n}\n.ff-body .container > .navbar-header,\n.ff-body .container-fluid > .navbar-header,\n.ff-body .container > .navbar-collapse,\n.ff-body .container-fluid > .navbar-collapse {\n  margin-right: -15px;\n  margin-left: -15px;\n}\n@media (min-width: 768px) {\n  .ff-body .container > .navbar-header,\n  .ff-body .container-fluid > .navbar-header,\n  .ff-body .container > .navbar-collapse,\n  .ff-body .container-fluid > .navbar-collapse {\n    margin-right: 0;\n    margin-left: 0;\n  }\n}\n.ff-body .navbar-static-top {\n  z-index: 1000;\n  border-width: 0 0 1px;\n}\n@media (min-width: 768px) {\n  .ff-body .navbar-static-top {\n    border-radius: 0;\n  }\n}\n.ff-body .navbar-fixed-top,\n.ff-body .navbar-fixed-bottom {\n  position: fixed;\n  right: 0;\n  left: 0;\n  z-index: 1030;\n}\n@media (min-width: 768px) {\n  .ff-body .navbar-fixed-top,\n  .ff-body .navbar-fixed-bottom {\n    border-radius: 0;\n  }\n}\n.ff-body .navbar-fixed-top {\n  top: 0;\n  border-width: 0 0 1px;\n}\n.ff-body .navbar-fixed-bottom {\n  bottom: 0;\n  margin-bottom: 0;\n  border-width: 1px 0 0;\n}\n.ff-body .navbar-brand {\n  float: left;\n  padding: 15px 15px;\n  font-size: 18px;\n  line-height: 20px;\n  height: 50px;\n}\n.ff-body .navbar-brand:hover,\n.ff-body .navbar-brand:focus {\n  text-decoration: none;\n}\n.ff-body .navbar-brand > img {\n  display: block;\n}\n@media (min-width: 768px) {\n  .navbar > .container .ff-body .navbar-brand,\n  .navbar > .container-fluid .ff-body .navbar-brand {\n    margin-left: -15px;\n  }\n}\n.ff-body .navbar-toggle {\n  position: relative;\n  float: right;\n  margin-right: 15px;\n  padding: 9px 10px;\n  margin-top: 8px;\n  margin-bottom: 8px;\n  background-color: transparent;\n  background-image: none;\n  border: 1px solid transparent;\n  border-radius: 0px;\n}\n.ff-body .navbar-toggle:focus {\n  outline: 0;\n}\n.ff-body .navbar-toggle .icon-bar {\n  display: block;\n  width: 22px;\n  height: 2px;\n  border-radius: 1px;\n}\n.ff-body .navbar-toggle .icon-bar + .icon-bar {\n  margin-top: 4px;\n}\n@media (min-width: 768px) {\n  .ff-body .navbar-toggle {\n    display: none;\n  }\n}\n.ff-body .navbar-nav {\n  margin: 7.5px -15px;\n}\n.ff-body .navbar-nav > li > a {\n  padding-top: 10px;\n  padding-bottom: 10px;\n  line-height: 20px;\n}\n@media (max-width: 767px) {\n  .ff-body .navbar-nav .open .dropdown-menu {\n    position: static;\n    float: none;\n    width: auto;\n    margin-top: 0;\n    background-color: transparent;\n    border: 0;\n    box-shadow: none;\n  }\n  .ff-body .navbar-nav .open .dropdown-menu > li > a,\n  .ff-body .navbar-nav .open .dropdown-menu .dropdown-header {\n    padding: 5px 15px 5px 25px;\n  }\n  .ff-body .navbar-nav .open .dropdown-menu > li > a {\n    line-height: 20px;\n  }\n  .ff-body .navbar-nav .open .dropdown-menu > li > a:hover,\n  .ff-body .navbar-nav .open .dropdown-menu > li > a:focus {\n    background-image: none;\n  }\n}\n@media (min-width: 768px) {\n  .ff-body .navbar-nav {\n    float: left;\n    margin: 0;\n  }\n  .ff-body .navbar-nav > li {\n    float: left;\n  }\n  .ff-body .navbar-nav > li > a {\n    padding-top: 15px;\n    padding-bottom: 15px;\n  }\n}\n.ff-body .navbar-form {\n  margin-left: -15px;\n  margin-right: -15px;\n  padding: 10px 15px;\n  border-top: 1px solid transparent;\n  border-bottom: 1px solid transparent;\n  -webkit-box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 1px 0 rgba(255, 255, 255, 0.1);\n  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 1px 0 rgba(255, 255, 255, 0.1);\n  margin-top: 8px;\n  margin-bottom: 8px;\n}\n@media (min-width: 768px) {\n  .ff-body .navbar-form .form-group {\n    display: inline-block;\n    margin-bottom: 0;\n    vertical-align: middle;\n  }\n  .ff-body .navbar-form .form-control {\n    display: inline-block;\n    width: auto;\n    vertical-align: middle;\n  }\n  .ff-body .navbar-form .form-control-static {\n    display: inline-block;\n  }\n  .ff-body .navbar-form .input-group {\n    display: inline-table;\n    vertical-align: middle;\n  }\n  .ff-body .navbar-form .input-group .input-group-addon,\n  .ff-body .navbar-form .input-group .input-group-btn,\n  .ff-body .navbar-form .input-group .form-control {\n    width: auto;\n  }\n  .ff-body .navbar-form .input-group > .form-control {\n    width: 100%;\n  }\n  .ff-body .navbar-form .control-label {\n    margin-bottom: 0;\n    vertical-align: middle;\n  }\n  .ff-body .navbar-form .radio,\n  .ff-body .navbar-form .checkbox {\n    display: inline-block;\n    margin-top: 0;\n    margin-bottom: 0;\n    vertical-align: middle;\n  }\n  .ff-body .navbar-form .radio label,\n  .ff-body .navbar-form .checkbox label {\n    padding-left: 0;\n  }\n  .ff-body .navbar-form .radio input[type=\"radio\"],\n  .ff-body .navbar-form .checkbox input[type=\"checkbox\"] {\n    position: relative;\n    margin-left: 0;\n  }\n  .ff-body .navbar-form .has-feedback .form-control-feedback {\n    top: 0;\n  }\n}\n@media (max-width: 767px) {\n  .ff-body .navbar-form .form-group {\n    margin-bottom: 5px;\n  }\n  .ff-body .navbar-form .form-group:last-child {\n    margin-bottom: 0;\n  }\n}\n@media (min-width: 768px) {\n  .ff-body .navbar-form {\n    width: auto;\n    border: 0;\n    margin-left: 0;\n    margin-right: 0;\n    padding-top: 0;\n    padding-bottom: 0;\n    -webkit-box-shadow: none;\n    box-shadow: none;\n  }\n}\n.ff-body .navbar-nav > li > .dropdown-menu {\n  margin-top: 0;\n  border-top-right-radius: 0;\n  border-top-left-radius: 0;\n}\n.ff-body .navbar-fixed-bottom .navbar-nav > li > .dropdown-menu {\n  margin-bottom: 0;\n  border-top-right-radius: 0px;\n  border-top-left-radius: 0px;\n  border-bottom-right-radius: 0;\n  border-bottom-left-radius: 0;\n}\n.ff-body .navbar-btn {\n  margin-top: 8px;\n  margin-bottom: 8px;\n}\n.ff-body .navbar-btn.btn-sm {\n  margin-top: 10px;\n  margin-bottom: 10px;\n}\n.ff-body .navbar-btn.btn-xs {\n  margin-top: 14px;\n  margin-bottom: 14px;\n}\n.ff-body .navbar-text {\n  margin-top: 15px;\n  margin-bottom: 15px;\n}\n@media (min-width: 768px) {\n  .ff-body .navbar-text {\n    float: left;\n    margin-left: 15px;\n    margin-right: 15px;\n  }\n}\n@media (min-width: 768px) {\n  .ff-body .navbar-left {\n    float: left !important;\n  }\n  .ff-body .navbar-right {\n    float: right !important;\n    margin-right: -15px;\n  }\n  .ff-body .navbar-right ~ .navbar-right {\n    margin-right: 0;\n  }\n}\n.ff-body .navbar-default {\n  background-color: #f8f8f8;\n  border-color: #e7e7e7;\n}\n.ff-body .navbar-default .navbar-brand {\n  color: #777;\n}\n.ff-body .navbar-default .navbar-brand:hover,\n.ff-body .navbar-default .navbar-brand:focus {\n  color: #5e5e5e;\n  background-color: transparent;\n}\n.ff-body .navbar-default .navbar-text {\n  color: #777;\n}\n.ff-body .navbar-default .navbar-nav > li > a {\n  color: #777;\n}\n.ff-body .navbar-default .navbar-nav > li > a:hover,\n.ff-body .navbar-default .navbar-nav > li > a:focus {\n  color: #333;\n  background-color: transparent;\n}\n.ff-body .navbar-default .navbar-nav > .active > a,\n.ff-body .navbar-default .navbar-nav > .active > a:hover,\n.ff-body .navbar-default .navbar-nav > .active > a:focus {\n  color: #555;\n  background-color: #e7e7e7;\n}\n.ff-body .navbar-default .navbar-nav > .disabled > a,\n.ff-body .navbar-default .navbar-nav > .disabled > a:hover,\n.ff-body .navbar-default .navbar-nav > .disabled > a:focus {\n  color: #ccc;\n  background-color: transparent;\n}\n.ff-body .navbar-default .navbar-toggle {\n  border-color: #ddd;\n}\n.ff-body .navbar-default .navbar-toggle:hover,\n.ff-body .navbar-default .navbar-toggle:focus {\n  background-color: #ddd;\n}\n.ff-body .navbar-default .navbar-toggle .icon-bar {\n  background-color: #888;\n}\n.ff-body .navbar-default .navbar-collapse,\n.ff-body .navbar-default .navbar-form {\n  border-color: #e7e7e7;\n}\n.ff-body .navbar-default .navbar-nav > .open > a,\n.ff-body .navbar-default .navbar-nav > .open > a:hover,\n.ff-body .navbar-default .navbar-nav > .open > a:focus {\n  background-color: #e7e7e7;\n  color: #555;\n}\n@media (max-width: 767px) {\n  .ff-body .navbar-default .navbar-nav .open .dropdown-menu > li > a {\n    color: #777;\n  }\n  .ff-body .navbar-default .navbar-nav .open .dropdown-menu > li > a:hover,\n  .ff-body .navbar-default .navbar-nav .open .dropdown-menu > li > a:focus {\n    color: #333;\n    background-color: transparent;\n  }\n  .ff-body .navbar-default .navbar-nav .open .dropdown-menu > .active > a,\n  .ff-body .navbar-default .navbar-nav .open .dropdown-menu > .active > a:hover,\n  .ff-body .navbar-default .navbar-nav .open .dropdown-menu > .active > a:focus {\n    color: #555;\n    background-color: #e7e7e7;\n  }\n  .ff-body .navbar-default .navbar-nav .open .dropdown-menu > .disabled > a,\n  .ff-body .navbar-default .navbar-nav .open .dropdown-menu > .disabled > a:hover,\n  .ff-body .navbar-default .navbar-nav .open .dropdown-menu > .disabled > a:focus {\n    color: #ccc;\n    background-color: transparent;\n  }\n}\n.ff-body .navbar-default .navbar-link {\n  color: #777;\n}\n.ff-body .navbar-default .navbar-link:hover {\n  color: #333;\n}\n.ff-body .navbar-default .btn-link {\n  color: #777;\n}\n.ff-body .navbar-default .btn-link:hover,\n.ff-body .navbar-default .btn-link:focus {\n  color: #333;\n}\n.ff-body .navbar-default .btn-link[disabled]:hover,\nfieldset[disabled] .ff-body .navbar-default .btn-link:hover,\n.ff-body .navbar-default .btn-link[disabled]:focus,\nfieldset[disabled] .ff-body .navbar-default .btn-link:focus {\n  color: #ccc;\n}\n.ff-body .navbar-inverse {\n  background-color: #222;\n  border-color: #080808;\n}\n.ff-body .navbar-inverse .navbar-brand {\n  color: #9d9d9d;\n}\n.ff-body .navbar-inverse .navbar-brand:hover,\n.ff-body .navbar-inverse .navbar-brand:focus {\n  color: #fff;\n  background-color: transparent;\n}\n.ff-body .navbar-inverse .navbar-text {\n  color: #9d9d9d;\n}\n.ff-body .navbar-inverse .navbar-nav > li > a {\n  color: #9d9d9d;\n}\n.ff-body .navbar-inverse .navbar-nav > li > a:hover,\n.ff-body .navbar-inverse .navbar-nav > li > a:focus {\n  color: #fff;\n  background-color: transparent;\n}\n.ff-body .navbar-inverse .navbar-nav > .active > a,\n.ff-body .navbar-inverse .navbar-nav > .active > a:hover,\n.ff-body .navbar-inverse .navbar-nav > .active > a:focus {\n  color: #fff;\n  background-color: #080808;\n}\n.ff-body .navbar-inverse .navbar-nav > .disabled > a,\n.ff-body .navbar-inverse .navbar-nav > .disabled > a:hover,\n.ff-body .navbar-inverse .navbar-nav > .disabled > a:focus {\n  color: #444;\n  background-color: transparent;\n}\n.ff-body .navbar-inverse .navbar-toggle {\n  border-color: #333;\n}\n.ff-body .navbar-inverse .navbar-toggle:hover,\n.ff-body .navbar-inverse .navbar-toggle:focus {\n  background-color: #333;\n}\n.ff-body .navbar-inverse .navbar-toggle .icon-bar {\n  background-color: #fff;\n}\n.ff-body .navbar-inverse .navbar-collapse,\n.ff-body .navbar-inverse .navbar-form {\n  border-color: #101010;\n}\n.ff-body .navbar-inverse .navbar-nav > .open > a,\n.ff-body .navbar-inverse .navbar-nav > .open > a:hover,\n.ff-body .navbar-inverse .navbar-nav > .open > a:focus {\n  background-color: #080808;\n  color: #fff;\n}\n@media (max-width: 767px) {\n  .ff-body .navbar-inverse .navbar-nav .open .dropdown-menu > .dropdown-header {\n    border-color: #080808;\n  }\n  .ff-body .navbar-inverse .navbar-nav .open .dropdown-menu .divider {\n    background-color: #080808;\n  }\n  .ff-body .navbar-inverse .navbar-nav .open .dropdown-menu > li > a {\n    color: #9d9d9d;\n  }\n  .ff-body .navbar-inverse .navbar-nav .open .dropdown-menu > li > a:hover,\n  .ff-body .navbar-inverse .navbar-nav .open .dropdown-menu > li > a:focus {\n    color: #fff;\n    background-color: transparent;\n  }\n  .ff-body .navbar-inverse .navbar-nav .open .dropdown-menu > .active > a,\n  .ff-body .navbar-inverse .navbar-nav .open .dropdown-menu > .active > a:hover,\n  .ff-body .navbar-inverse .navbar-nav .open .dropdown-menu > .active > a:focus {\n    color: #fff;\n    background-color: #080808;\n  }\n  .ff-body .navbar-inverse .navbar-nav .open .dropdown-menu > .disabled > a,\n  .ff-body .navbar-inverse .navbar-nav .open .dropdown-menu > .disabled > a:hover,\n  .ff-body .navbar-inverse .navbar-nav .open .dropdown-menu > .disabled > a:focus {\n    color: #444;\n    background-color: transparent;\n  }\n}\n.ff-body .navbar-inverse .navbar-link {\n  color: #9d9d9d;\n}\n.ff-body .navbar-inverse .navbar-link:hover {\n  color: #fff;\n}\n.ff-body .navbar-inverse .btn-link {\n  color: #9d9d9d;\n}\n.ff-body .navbar-inverse .btn-link:hover,\n.ff-body .navbar-inverse .btn-link:focus {\n  color: #fff;\n}\n.ff-body .navbar-inverse .btn-link[disabled]:hover,\nfieldset[disabled] .ff-body .navbar-inverse .btn-link:hover,\n.ff-body .navbar-inverse .btn-link[disabled]:focus,\nfieldset[disabled] .ff-body .navbar-inverse .btn-link:focus {\n  color: #444;\n}\n.ff-body .breadcrumb {\n  padding: 8px 15px;\n  margin-bottom: 20px;\n  list-style: none;\n  background-color: #f5f5f5;\n  border-radius: 0px;\n}\n.ff-body .breadcrumb > li {\n  display: inline-block;\n}\n.ff-body .breadcrumb > li + li:before {\n  content: \"/\\A0\";\n  padding: 0 5px;\n  color: #ccc;\n}\n.ff-body .breadcrumb > .active {\n  color: #777777;\n}\n.ff-body .pagination {\n  display: inline-block;\n  padding-left: 0;\n  margin: 20px 0;\n  border-radius: 0px;\n}\n.ff-body .pagination > li {\n  display: inline;\n}\n.ff-body .pagination > li > a,\n.ff-body .pagination > li > span {\n  position: relative;\n  float: left;\n  padding: 6px 12px;\n  line-height: 1.42857143;\n  text-decoration: none;\n  color: #3498db;\n  background-color: #fff;\n  border: 1px solid #ddd;\n  margin-left: -1px;\n}\n.ff-body .pagination > li:first-child > a,\n.ff-body .pagination > li:first-child > span {\n  margin-left: 0;\n  border-bottom-left-radius: 0px;\n  border-top-left-radius: 0px;\n}\n.ff-body .pagination > li:last-child > a,\n.ff-body .pagination > li:last-child > span {\n  border-bottom-right-radius: 0px;\n  border-top-right-radius: 0px;\n}\n.ff-body .pagination > li > a:hover,\n.ff-body .pagination > li > span:hover,\n.ff-body .pagination > li > a:focus,\n.ff-body .pagination > li > span:focus {\n  z-index: 2;\n  color: #1d6fa5;\n  background-color: #eeeeee;\n  border-color: #ddd;\n}\n.ff-body .pagination > .active > a,\n.ff-body .pagination > .active > span,\n.ff-body .pagination > .active > a:hover,\n.ff-body .pagination > .active > span:hover,\n.ff-body .pagination > .active > a:focus,\n.ff-body .pagination > .active > span:focus {\n  z-index: 3;\n  color: #3498db;\n  background-color: #fff;\n  border-color: #3498db;\n  cursor: default;\n}\n.ff-body .pagination > .disabled > span,\n.ff-body .pagination > .disabled > span:hover,\n.ff-body .pagination > .disabled > span:focus,\n.ff-body .pagination > .disabled > a,\n.ff-body .pagination > .disabled > a:hover,\n.ff-body .pagination > .disabled > a:focus {\n  color: #777777;\n  background-color: #fff;\n  border-color: #ddd;\n  cursor: not-allowed;\n}\n.ff-body .pagination-lg > li > a,\n.ff-body .pagination-lg > li > span {\n  padding: 10px 16px;\n  font-size: 18px;\n  line-height: 1.3333333;\n}\n.ff-body .pagination-lg > li:first-child > a,\n.ff-body .pagination-lg > li:first-child > span {\n  border-bottom-left-radius: 0px;\n  border-top-left-radius: 0px;\n}\n.ff-body .pagination-lg > li:last-child > a,\n.ff-body .pagination-lg > li:last-child > span {\n  border-bottom-right-radius: 0px;\n  border-top-right-radius: 0px;\n}\n.ff-body .pagination-sm > li > a,\n.ff-body .pagination-sm > li > span {\n  padding: 5px 10px;\n  font-size: 12px;\n  line-height: 1.5;\n}\n.ff-body .pagination-sm > li:first-child > a,\n.ff-body .pagination-sm > li:first-child > span {\n  border-bottom-left-radius: 0px;\n  border-top-left-radius: 0px;\n}\n.ff-body .pagination-sm > li:last-child > a,\n.ff-body .pagination-sm > li:last-child > span {\n  border-bottom-right-radius: 0px;\n  border-top-right-radius: 0px;\n}\n.ff-body .pager {\n  padding-left: 0;\n  margin: 20px 0;\n  list-style: none;\n  text-align: center;\n}\n.ff-body .pager li {\n  display: inline;\n}\n.ff-body .pager li > a,\n.ff-body .pager li > span {\n  display: inline-block;\n  padding: 5px 14px;\n  background-color: #fff;\n  border: 1px solid #ddd;\n  border-radius: 15px;\n}\n.ff-body .pager li > a:hover,\n.ff-body .pager li > a:focus {\n  text-decoration: none;\n  background-color: #eeeeee;\n}\n.ff-body .pager .next > a,\n.ff-body .pager .next > span {\n  float: right;\n}\n.ff-body .pager .previous > a,\n.ff-body .pager .previous > span {\n  float: left;\n}\n.ff-body .pager .disabled > a,\n.ff-body .pager .disabled > a:hover,\n.ff-body .pager .disabled > a:focus,\n.ff-body .pager .disabled > span {\n  color: #777777;\n  background-color: #fff;\n  cursor: not-allowed;\n}\n.ff-body .label {\n  display: inline;\n  padding: .2em .6em .3em;\n  font-size: 75%;\n  font-weight: bold;\n  line-height: 1;\n  color: #fff;\n  text-align: center;\n  white-space: nowrap;\n  vertical-align: baseline;\n  border-radius: .25em;\n}\na.ff-body .label:hover,\na.ff-body .label:focus {\n  color: #fff;\n  text-decoration: none;\n  cursor: pointer;\n}\n.ff-body .label:empty {\n  display: none;\n}\n.btn .ff-body .label {\n  position: relative;\n  top: -1px;\n}\n.ff-body .label-default {\n  background-color: #777777;\n}\n.ff-body .label-default[href]:hover,\n.ff-body .label-default[href]:focus {\n  background-color: #5e5e5e;\n}\n.ff-body .label-primary {\n  background-color: #3498db;\n}\n.ff-body .label-primary[href]:hover,\n.ff-body .label-primary[href]:focus {\n  background-color: #217dbb;\n}\n.ff-body .label-success {\n  background-color: #70AB4F;\n}\n.ff-body .label-success[href]:hover,\n.ff-body .label-success[href]:focus {\n  background-color: #59883f;\n}\n.ff-body .label-info {\n  background-color: #3bafda;\n}\n.ff-body .label-info[href]:hover,\n.ff-body .label-info[href]:focus {\n  background-color: #2494be;\n}\n.ff-body .label-warning {\n  background-color: #f6bb42;\n}\n.ff-body .label-warning[href]:hover,\n.ff-body .label-warning[href]:focus {\n  background-color: #f4a911;\n}\n.ff-body .label-danger {\n  background-color: #e9573f;\n}\n.ff-body .label-danger[href]:hover,\n.ff-body .label-danger[href]:focus {\n  background-color: #dc3519;\n}\n.ff-body .badge {\n  display: inline-block;\n  min-width: 10px;\n  padding: 3px 7px;\n  font-size: 12px;\n  font-weight: bold;\n  color: #fff;\n  line-height: 1;\n  vertical-align: middle;\n  white-space: nowrap;\n  text-align: center;\n  background-color: #777777;\n  border-radius: 10px;\n}\n.ff-body .badge:empty {\n  display: none;\n}\n.btn .ff-body .badge {\n  position: relative;\n  top: -1px;\n}\n.btn-xs .ff-body .badge,\n.btn-group-xs > .btn .ff-body .badge {\n  top: 0;\n  padding: 1px 5px;\n}\na.ff-body .badge:hover,\na.ff-body .badge:focus {\n  color: #fff;\n  text-decoration: none;\n  cursor: pointer;\n}\n.list-group-item.active > .ff-body .badge,\n.nav-pills > .active > a > .ff-body .badge {\n  color: #3498db;\n  background-color: #fff;\n}\n.list-group-item > .ff-body .badge {\n  float: right;\n}\n.list-group-item > .ff-body .badge + .ff-body .badge {\n  margin-right: 5px;\n}\n.nav-pills > li > a > .ff-body .badge {\n  margin-left: 3px;\n}\n.ff-body .jumbotron {\n  padding-top: 30px;\n  padding-bottom: 30px;\n  margin-bottom: 30px;\n  color: inherit;\n  background-color: #eeeeee;\n}\n.ff-body .jumbotron h1,\n.ff-body .jumbotron .h1 {\n  color: inherit;\n}\n.ff-body .jumbotron p {\n  margin-bottom: 15px;\n  font-size: 21px;\n  font-weight: 200;\n}\n.ff-body .jumbotron > hr {\n  border-top-color: #d5d5d5;\n}\n.container .ff-body .jumbotron,\n.container-fluid .ff-body .jumbotron {\n  border-radius: 0px;\n  padding-left: 15px;\n  padding-right: 15px;\n}\n.ff-body .jumbotron .container {\n  max-width: 100%;\n}\n@media screen and (min-width: 768px) {\n  .ff-body .jumbotron {\n    padding-top: 48px;\n    padding-bottom: 48px;\n  }\n  .container .ff-body .jumbotron,\n  .container-fluid .ff-body .jumbotron {\n    padding-left: 60px;\n    padding-right: 60px;\n  }\n  .ff-body .jumbotron h1,\n  .ff-body .jumbotron .h1 {\n    font-size: 63px;\n  }\n}\n.ff-body .thumbnail {\n  display: block;\n  padding: 4px;\n  margin-bottom: 20px;\n  line-height: 1.42857143;\n  background-color: #fff;\n  border: 1px solid #ddd;\n  border-radius: 0px;\n  -webkit-transition: border 0.2s ease-in-out;\n  -o-transition: border 0.2s ease-in-out;\n  transition: border 0.2s ease-in-out;\n}\n.ff-body .thumbnail > img,\n.ff-body .thumbnail a > img {\n  margin-left: auto;\n  margin-right: auto;\n}\na.ff-body .thumbnail:hover,\na.ff-body .thumbnail:focus,\na.ff-body .thumbnail.active {\n  border-color: #3498db;\n}\n.ff-body .thumbnail .caption {\n  padding: 9px;\n  color: #424242;\n}\n.ff-body .alert {\n  padding: 15px;\n  margin-bottom: 20px;\n  border: 1px solid transparent;\n  border-radius: 0px;\n}\n.ff-body .alert h4 {\n  margin-top: 0;\n  color: inherit;\n}\n.ff-body .alert .alert-link {\n  font-weight: bold;\n}\n.ff-body .alert > p,\n.ff-body .alert > ul {\n  margin-bottom: 0;\n}\n.ff-body .alert > p + p {\n  margin-top: 5px;\n}\n.ff-body .alert-dismissable,\n.ff-body .alert-dismissible {\n  padding-right: 35px;\n}\n.ff-body .alert-dismissable .close,\n.ff-body .alert-dismissible .close {\n  position: relative;\n  top: -2px;\n  right: -21px;\n  color: inherit;\n}\n.ff-body .alert-success {\n  background-color: #dff0d8;\n  border-color: #d6e9c6;\n  color: #3c763d;\n}\n.ff-body .alert-success hr {\n  border-top-color: #c9e2b3;\n}\n.ff-body .alert-success .alert-link {\n  color: #2b542c;\n}\n.ff-body .alert-info {\n  background-color: #d9edf7;\n  border-color: #bce8f1;\n  color: #31708f;\n}\n.ff-body .alert-info hr {\n  border-top-color: #a6e1ec;\n}\n.ff-body .alert-info .alert-link {\n  color: #245269;\n}\n.ff-body .alert-warning {\n  background-color: #fcf8e3;\n  border-color: #faebcc;\n  color: #8a6d3b;\n}\n.ff-body .alert-warning hr {\n  border-top-color: #f7e1b5;\n}\n.ff-body .alert-warning .alert-link {\n  color: #66512c;\n}\n.ff-body .alert-danger {\n  background-color: #f2dede;\n  border-color: #ebccd1;\n  color: #a94442;\n}\n.ff-body .alert-danger hr {\n  border-top-color: #e4b9c0;\n}\n.ff-body .alert-danger .alert-link {\n  color: #843534;\n}\n@-webkit-keyframes progress-bar-stripes {\n  from {\n    background-position: 40px 0;\n  }\n  to {\n    background-position: 0 0;\n  }\n}\n@keyframes progress-bar-stripes {\n  from {\n    background-position: 40px 0;\n  }\n  to {\n    background-position: 0 0;\n  }\n}\n.ff-body .progress {\n  overflow: hidden;\n  height: 20px;\n  margin-bottom: 20px;\n  background-color: #f5f5f5;\n  border-radius: 0px;\n  -webkit-box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);\n  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);\n}\n.ff-body .progress-bar {\n  float: left;\n  width: 0%;\n  height: 100%;\n  font-size: 12px;\n  line-height: 20px;\n  color: #fff;\n  text-align: center;\n  background-color: #3498db;\n  -webkit-box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.15);\n  box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.15);\n  -webkit-transition: width 0.6s ease;\n  -o-transition: width 0.6s ease;\n  transition: width 0.6s ease;\n}\n.ff-body .progress-striped .progress-bar,\n.ff-body .progress-bar-striped {\n  background-image: -webkit-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n  background-image: -o-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n  background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n  background-size: 40px 40px;\n}\n.ff-body .progress.active .progress-bar,\n.ff-body .progress-bar.active {\n  -webkit-animation: progress-bar-stripes 2s linear infinite;\n  -o-animation: progress-bar-stripes 2s linear infinite;\n  animation: progress-bar-stripes 2s linear infinite;\n}\n.ff-body .progress-bar-success {\n  background-color: #70AB4F;\n}\n.progress-striped .ff-body .progress-bar-success {\n  background-image: -webkit-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n  background-image: -o-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n  background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n}\n.ff-body .progress-bar-info {\n  background-color: #3bafda;\n}\n.progress-striped .ff-body .progress-bar-info {\n  background-image: -webkit-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n  background-image: -o-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n  background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n}\n.ff-body .progress-bar-warning {\n  background-color: #f6bb42;\n}\n.progress-striped .ff-body .progress-bar-warning {\n  background-image: -webkit-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n  background-image: -o-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n  background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n}\n.ff-body .progress-bar-danger {\n  background-color: #e9573f;\n}\n.progress-striped .ff-body .progress-bar-danger {\n  background-image: -webkit-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n  background-image: -o-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n  background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n}\n.ff-body .media {\n  margin-top: 15px;\n}\n.ff-body .media:first-child {\n  margin-top: 0;\n}\n.ff-body .media,\n.ff-body .media-body {\n  zoom: 1;\n  overflow: hidden;\n}\n.ff-body .media-body {\n  width: 10000px;\n}\n.ff-body .media-object {\n  display: block;\n}\n.ff-body .media-object.img-thumbnail {\n  max-width: none;\n}\n.ff-body .media-right,\n.ff-body .media > .pull-right {\n  padding-left: 10px;\n}\n.ff-body .media-left,\n.ff-body .media > .pull-left {\n  padding-right: 10px;\n}\n.ff-body .media-left,\n.ff-body .media-right,\n.ff-body .media-body {\n  display: table-cell;\n  vertical-align: top;\n}\n.ff-body .media-middle {\n  vertical-align: middle;\n}\n.ff-body .media-bottom {\n  vertical-align: bottom;\n}\n.ff-body .media-heading {\n  margin-top: 0;\n  margin-bottom: 5px;\n}\n.ff-body .media-list {\n  padding-left: 0;\n  list-style: none;\n}\n.ff-body .list-group {\n  margin-bottom: 20px;\n  padding-left: 0;\n}\n.ff-body .list-group-item {\n  position: relative;\n  display: block;\n  padding: 10px 15px;\n  margin-bottom: -1px;\n  background-color: #fff;\n  border: 1px solid #ddd;\n}\n.ff-body .list-group-item:first-child {\n  border-top-right-radius: 0px;\n  border-top-left-radius: 0px;\n}\n.ff-body .list-group-item:last-child {\n  margin-bottom: 0;\n  border-bottom-right-radius: 0px;\n  border-bottom-left-radius: 0px;\n}\n.ff-body a.list-group-item,\n.ff-body button.list-group-item {\n  color: #555;\n}\n.ff-body a.list-group-item .list-group-item-heading,\n.ff-body button.list-group-item .list-group-item-heading {\n  color: #333;\n}\n.ff-body a.list-group-item:hover,\n.ff-body button.list-group-item:hover,\n.ff-body a.list-group-item:focus,\n.ff-body button.list-group-item:focus {\n  text-decoration: none;\n  color: #555;\n  background-color: #f5f5f5;\n}\n.ff-body button.list-group-item {\n  width: 100%;\n  text-align: left;\n}\n.ff-body .list-group-item.disabled,\n.ff-body .list-group-item.disabled:hover,\n.ff-body .list-group-item.disabled:focus {\n  background-color: #eeeeee;\n  color: #777777;\n  cursor: not-allowed;\n}\n.ff-body .list-group-item.disabled .list-group-item-heading,\n.ff-body .list-group-item.disabled:hover .list-group-item-heading,\n.ff-body .list-group-item.disabled:focus .list-group-item-heading {\n  color: inherit;\n}\n.ff-body .list-group-item.disabled .list-group-item-text,\n.ff-body .list-group-item.disabled:hover .list-group-item-text,\n.ff-body .list-group-item.disabled:focus .list-group-item-text {\n  color: #777777;\n}\n.ff-body .list-group-item.active,\n.ff-body .list-group-item.active:hover,\n.ff-body .list-group-item.active:focus {\n  z-index: 2;\n  color: #fff;\n  background-color: #3498db;\n  border-color: #3498db;\n}\n.ff-body .list-group-item.active .list-group-item-heading,\n.ff-body .list-group-item.active:hover .list-group-item-heading,\n.ff-body .list-group-item.active:focus .list-group-item-heading,\n.ff-body .list-group-item.active .list-group-item-heading > small,\n.ff-body .list-group-item.active:hover .list-group-item-heading > small,\n.ff-body .list-group-item.active:focus .list-group-item-heading > small,\n.ff-body .list-group-item.active .list-group-item-heading > .small,\n.ff-body .list-group-item.active:hover .list-group-item-heading > .small,\n.ff-body .list-group-item.active:focus .list-group-item-heading > .small {\n  color: inherit;\n}\n.ff-body .list-group-item.active .list-group-item-text,\n.ff-body .list-group-item.active:hover .list-group-item-text,\n.ff-body .list-group-item.active:focus .list-group-item-text {\n  color: #e1f0fa;\n}\n.ff-body .list-group-item-success {\n  color: #3c763d;\n  background-color: #dff0d8;\n}\na.ff-body .list-group-item-success,\nbutton.ff-body .list-group-item-success {\n  color: #3c763d;\n}\na.ff-body .list-group-item-success .list-group-item-heading,\nbutton.ff-body .list-group-item-success .list-group-item-heading {\n  color: inherit;\n}\na.ff-body .list-group-item-success:hover,\nbutton.ff-body .list-group-item-success:hover,\na.ff-body .list-group-item-success:focus,\nbutton.ff-body .list-group-item-success:focus {\n  color: #3c763d;\n  background-color: #d0e9c6;\n}\na.ff-body .list-group-item-success.active,\nbutton.ff-body .list-group-item-success.active,\na.ff-body .list-group-item-success.active:hover,\nbutton.ff-body .list-group-item-success.active:hover,\na.ff-body .list-group-item-success.active:focus,\nbutton.ff-body .list-group-item-success.active:focus {\n  color: #fff;\n  background-color: #3c763d;\n  border-color: #3c763d;\n}\n.ff-body .list-group-item-info {\n  color: #31708f;\n  background-color: #d9edf7;\n}\na.ff-body .list-group-item-info,\nbutton.ff-body .list-group-item-info {\n  color: #31708f;\n}\na.ff-body .list-group-item-info .list-group-item-heading,\nbutton.ff-body .list-group-item-info .list-group-item-heading {\n  color: inherit;\n}\na.ff-body .list-group-item-info:hover,\nbutton.ff-body .list-group-item-info:hover,\na.ff-body .list-group-item-info:focus,\nbutton.ff-body .list-group-item-info:focus {\n  color: #31708f;\n  background-color: #c4e3f3;\n}\na.ff-body .list-group-item-info.active,\nbutton.ff-body .list-group-item-info.active,\na.ff-body .list-group-item-info.active:hover,\nbutton.ff-body .list-group-item-info.active:hover,\na.ff-body .list-group-item-info.active:focus,\nbutton.ff-body .list-group-item-info.active:focus {\n  color: #fff;\n  background-color: #31708f;\n  border-color: #31708f;\n}\n.ff-body .list-group-item-warning {\n  color: #8a6d3b;\n  background-color: #fcf8e3;\n}\na.ff-body .list-group-item-warning,\nbutton.ff-body .list-group-item-warning {\n  color: #8a6d3b;\n}\na.ff-body .list-group-item-warning .list-group-item-heading,\nbutton.ff-body .list-group-item-warning .list-group-item-heading {\n  color: inherit;\n}\na.ff-body .list-group-item-warning:hover,\nbutton.ff-body .list-group-item-warning:hover,\na.ff-body .list-group-item-warning:focus,\nbutton.ff-body .list-group-item-warning:focus {\n  color: #8a6d3b;\n  background-color: #faf2cc;\n}\na.ff-body .list-group-item-warning.active,\nbutton.ff-body .list-group-item-warning.active,\na.ff-body .list-group-item-warning.active:hover,\nbutton.ff-body .list-group-item-warning.active:hover,\na.ff-body .list-group-item-warning.active:focus,\nbutton.ff-body .list-group-item-warning.active:focus {\n  color: #fff;\n  background-color: #8a6d3b;\n  border-color: #8a6d3b;\n}\n.ff-body .list-group-item-danger {\n  color: #a94442;\n  background-color: #f2dede;\n}\na.ff-body .list-group-item-danger,\nbutton.ff-body .list-group-item-danger {\n  color: #a94442;\n}\na.ff-body .list-group-item-danger .list-group-item-heading,\nbutton.ff-body .list-group-item-danger .list-group-item-heading {\n  color: inherit;\n}\na.ff-body .list-group-item-danger:hover,\nbutton.ff-body .list-group-item-danger:hover,\na.ff-body .list-group-item-danger:focus,\nbutton.ff-body .list-group-item-danger:focus {\n  color: #a94442;\n  background-color: #ebcccc;\n}\na.ff-body .list-group-item-danger.active,\nbutton.ff-body .list-group-item-danger.active,\na.ff-body .list-group-item-danger.active:hover,\nbutton.ff-body .list-group-item-danger.active:hover,\na.ff-body .list-group-item-danger.active:focus,\nbutton.ff-body .list-group-item-danger.active:focus {\n  color: #fff;\n  background-color: #a94442;\n  border-color: #a94442;\n}\n.ff-body .list-group-item-heading {\n  margin-top: 0;\n  margin-bottom: 5px;\n}\n.ff-body .list-group-item-text {\n  margin-bottom: 0;\n  line-height: 1.3;\n}\n.ff-body .panel {\n  margin-bottom: 20px;\n  background-color: #fff;\n  border: 1px solid transparent;\n  border-radius: 0px;\n  -webkit-box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);\n  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);\n}\n.ff-body .panel-body {\n  padding: 15px;\n}\n.ff-body .panel-heading {\n  padding: 10px 15px;\n  border-bottom: 1px solid transparent;\n  border-top-right-radius: -1px;\n  border-top-left-radius: -1px;\n}\n.ff-body .panel-heading > .dropdown .dropdown-toggle {\n  color: inherit;\n}\n.ff-body .panel-title {\n  margin-top: 0;\n  margin-bottom: 0;\n  font-size: 16px;\n  color: inherit;\n}\n.ff-body .panel-title > a,\n.ff-body .panel-title > small,\n.ff-body .panel-title > .small,\n.ff-body .panel-title > small > a,\n.ff-body .panel-title > .small > a {\n  color: inherit;\n}\n.ff-body .panel-footer {\n  padding: 10px 15px;\n  background-color: #f5f5f5;\n  border-top: 1px solid #ddd;\n  border-bottom-right-radius: -1px;\n  border-bottom-left-radius: -1px;\n}\n.ff-body .panel > .list-group,\n.ff-body .panel > .panel-collapse > .list-group {\n  margin-bottom: 0;\n}\n.ff-body .panel > .list-group .list-group-item,\n.ff-body .panel > .panel-collapse > .list-group .list-group-item {\n  border-width: 1px 0;\n  border-radius: 0;\n}\n.ff-body .panel > .list-group:first-child .list-group-item:first-child,\n.ff-body .panel > .panel-collapse > .list-group:first-child .list-group-item:first-child {\n  border-top: 0;\n  border-top-right-radius: -1px;\n  border-top-left-radius: -1px;\n}\n.ff-body .panel > .list-group:last-child .list-group-item:last-child,\n.ff-body .panel > .panel-collapse > .list-group:last-child .list-group-item:last-child {\n  border-bottom: 0;\n  border-bottom-right-radius: -1px;\n  border-bottom-left-radius: -1px;\n}\n.ff-body .panel > .panel-heading + .panel-collapse > .list-group .list-group-item:first-child {\n  border-top-right-radius: 0;\n  border-top-left-radius: 0;\n}\n.ff-body .panel-heading + .list-group .list-group-item:first-child {\n  border-top-width: 0;\n}\n.ff-body .list-group + .panel-footer {\n  border-top-width: 0;\n}\n.ff-body .panel > .table,\n.ff-body .panel > .table-responsive > .table,\n.ff-body .panel > .panel-collapse > .table {\n  margin-bottom: 0;\n}\n.ff-body .panel > .table caption,\n.ff-body .panel > .table-responsive > .table caption,\n.ff-body .panel > .panel-collapse > .table caption {\n  padding-left: 15px;\n  padding-right: 15px;\n}\n.ff-body .panel > .table:first-child,\n.ff-body .panel > .table-responsive:first-child > .table:first-child {\n  border-top-right-radius: -1px;\n  border-top-left-radius: -1px;\n}\n.ff-body .panel > .table:first-child > thead:first-child > tr:first-child,\n.ff-body .panel > .table-responsive:first-child > .table:first-child > thead:first-child > tr:first-child,\n.ff-body .panel > .table:first-child > tbody:first-child > tr:first-child,\n.ff-body .panel > .table-responsive:first-child > .table:first-child > tbody:first-child > tr:first-child {\n  border-top-left-radius: -1px;\n  border-top-right-radius: -1px;\n}\n.ff-body .panel > .table:first-child > thead:first-child > tr:first-child td:first-child,\n.ff-body .panel > .table-responsive:first-child > .table:first-child > thead:first-child > tr:first-child td:first-child,\n.ff-body .panel > .table:first-child > tbody:first-child > tr:first-child td:first-child,\n.ff-body .panel > .table-responsive:first-child > .table:first-child > tbody:first-child > tr:first-child td:first-child,\n.ff-body .panel > .table:first-child > thead:first-child > tr:first-child th:first-child,\n.ff-body .panel > .table-responsive:first-child > .table:first-child > thead:first-child > tr:first-child th:first-child,\n.ff-body .panel > .table:first-child > tbody:first-child > tr:first-child th:first-child,\n.ff-body .panel > .table-responsive:first-child > .table:first-child > tbody:first-child > tr:first-child th:first-child {\n  border-top-left-radius: -1px;\n}\n.ff-body .panel > .table:first-child > thead:first-child > tr:first-child td:last-child,\n.ff-body .panel > .table-responsive:first-child > .table:first-child > thead:first-child > tr:first-child td:last-child,\n.ff-body .panel > .table:first-child > tbody:first-child > tr:first-child td:last-child,\n.ff-body .panel > .table-responsive:first-child > .table:first-child > tbody:first-child > tr:first-child td:last-child,\n.ff-body .panel > .table:first-child > thead:first-child > tr:first-child th:last-child,\n.ff-body .panel > .table-responsive:first-child > .table:first-child > thead:first-child > tr:first-child th:last-child,\n.ff-body .panel > .table:first-child > tbody:first-child > tr:first-child th:last-child,\n.ff-body .panel > .table-responsive:first-child > .table:first-child > tbody:first-child > tr:first-child th:last-child {\n  border-top-right-radius: -1px;\n}\n.ff-body .panel > .table:last-child,\n.ff-body .panel > .table-responsive:last-child > .table:last-child {\n  border-bottom-right-radius: -1px;\n  border-bottom-left-radius: -1px;\n}\n.ff-body .panel > .table:last-child > tbody:last-child > tr:last-child,\n.ff-body .panel > .table-responsive:last-child > .table:last-child > tbody:last-child > tr:last-child,\n.ff-body .panel > .table:last-child > tfoot:last-child > tr:last-child,\n.ff-body .panel > .table-responsive:last-child > .table:last-child > tfoot:last-child > tr:last-child {\n  border-bottom-left-radius: -1px;\n  border-bottom-right-radius: -1px;\n}\n.ff-body .panel > .table:last-child > tbody:last-child > tr:last-child td:first-child,\n.ff-body .panel > .table-responsive:last-child > .table:last-child > tbody:last-child > tr:last-child td:first-child,\n.ff-body .panel > .table:last-child > tfoot:last-child > tr:last-child td:first-child,\n.ff-body .panel > .table-responsive:last-child > .table:last-child > tfoot:last-child > tr:last-child td:first-child,\n.ff-body .panel > .table:last-child > tbody:last-child > tr:last-child th:first-child,\n.ff-body .panel > .table-responsive:last-child > .table:last-child > tbody:last-child > tr:last-child th:first-child,\n.ff-body .panel > .table:last-child > tfoot:last-child > tr:last-child th:first-child,\n.ff-body .panel > .table-responsive:last-child > .table:last-child > tfoot:last-child > tr:last-child th:first-child {\n  border-bottom-left-radius: -1px;\n}\n.ff-body .panel > .table:last-child > tbody:last-child > tr:last-child td:last-child,\n.ff-body .panel > .table-responsive:last-child > .table:last-child > tbody:last-child > tr:last-child td:last-child,\n.ff-body .panel > .table:last-child > tfoot:last-child > tr:last-child td:last-child,\n.ff-body .panel > .table-responsive:last-child > .table:last-child > tfoot:last-child > tr:last-child td:last-child,\n.ff-body .panel > .table:last-child > tbody:last-child > tr:last-child th:last-child,\n.ff-body .panel > .table-responsive:last-child > .table:last-child > tbody:last-child > tr:last-child th:last-child,\n.ff-body .panel > .table:last-child > tfoot:last-child > tr:last-child th:last-child,\n.ff-body .panel > .table-responsive:last-child > .table:last-child > tfoot:last-child > tr:last-child th:last-child {\n  border-bottom-right-radius: -1px;\n}\n.ff-body .panel > .panel-body + .table,\n.ff-body .panel > .panel-body + .table-responsive,\n.ff-body .panel > .table + .panel-body,\n.ff-body .panel > .table-responsive + .panel-body {\n  border-top: 1px solid #ddd;\n}\n.ff-body .panel > .table > tbody:first-child > tr:first-child th,\n.ff-body .panel > .table > tbody:first-child > tr:first-child td {\n  border-top: 0;\n}\n.ff-body .panel > .table-bordered,\n.ff-body .panel > .table-responsive > .table-bordered {\n  border: 0;\n}\n.ff-body .panel > .table-bordered > thead > tr > th:first-child,\n.ff-body .panel > .table-responsive > .table-bordered > thead > tr > th:first-child,\n.ff-body .panel > .table-bordered > tbody > tr > th:first-child,\n.ff-body .panel > .table-responsive > .table-bordered > tbody > tr > th:first-child,\n.ff-body .panel > .table-bordered > tfoot > tr > th:first-child,\n.ff-body .panel > .table-responsive > .table-bordered > tfoot > tr > th:first-child,\n.ff-body .panel > .table-bordered > thead > tr > td:first-child,\n.ff-body .panel > .table-responsive > .table-bordered > thead > tr > td:first-child,\n.ff-body .panel > .table-bordered > tbody > tr > td:first-child,\n.ff-body .panel > .table-responsive > .table-bordered > tbody > tr > td:first-child,\n.ff-body .panel > .table-bordered > tfoot > tr > td:first-child,\n.ff-body .panel > .table-responsive > .table-bordered > tfoot > tr > td:first-child {\n  border-left: 0;\n}\n.ff-body .panel > .table-bordered > thead > tr > th:last-child,\n.ff-body .panel > .table-responsive > .table-bordered > thead > tr > th:last-child,\n.ff-body .panel > .table-bordered > tbody > tr > th:last-child,\n.ff-body .panel > .table-responsive > .table-bordered > tbody > tr > th:last-child,\n.ff-body .panel > .table-bordered > tfoot > tr > th:last-child,\n.ff-body .panel > .table-responsive > .table-bordered > tfoot > tr > th:last-child,\n.ff-body .panel > .table-bordered > thead > tr > td:last-child,\n.ff-body .panel > .table-responsive > .table-bordered > thead > tr > td:last-child,\n.ff-body .panel > .table-bordered > tbody > tr > td:last-child,\n.ff-body .panel > .table-responsive > .table-bordered > tbody > tr > td:last-child,\n.ff-body .panel > .table-bordered > tfoot > tr > td:last-child,\n.ff-body .panel > .table-responsive > .table-bordered > tfoot > tr > td:last-child {\n  border-right: 0;\n}\n.ff-body .panel > .table-bordered > thead > tr:first-child > td,\n.ff-body .panel > .table-responsive > .table-bordered > thead > tr:first-child > td,\n.ff-body .panel > .table-bordered > tbody > tr:first-child > td,\n.ff-body .panel > .table-responsive > .table-bordered > tbody > tr:first-child > td,\n.ff-body .panel > .table-bordered > thead > tr:first-child > th,\n.ff-body .panel > .table-responsive > .table-bordered > thead > tr:first-child > th,\n.ff-body .panel > .table-bordered > tbody > tr:first-child > th,\n.ff-body .panel > .table-responsive > .table-bordered > tbody > tr:first-child > th {\n  border-bottom: 0;\n}\n.ff-body .panel > .table-bordered > tbody > tr:last-child > td,\n.ff-body .panel > .table-responsive > .table-bordered > tbody > tr:last-child > td,\n.ff-body .panel > .table-bordered > tfoot > tr:last-child > td,\n.ff-body .panel > .table-responsive > .table-bordered > tfoot > tr:last-child > td,\n.ff-body .panel > .table-bordered > tbody > tr:last-child > th,\n.ff-body .panel > .table-responsive > .table-bordered > tbody > tr:last-child > th,\n.ff-body .panel > .table-bordered > tfoot > tr:last-child > th,\n.ff-body .panel > .table-responsive > .table-bordered > tfoot > tr:last-child > th {\n  border-bottom: 0;\n}\n.ff-body .panel > .table-responsive {\n  border: 0;\n  margin-bottom: 0;\n}\n.ff-body .panel-group {\n  margin-bottom: 20px;\n}\n.ff-body .panel-group .panel {\n  margin-bottom: 0;\n  border-radius: 0px;\n}\n.ff-body .panel-group .panel + .panel {\n  margin-top: 5px;\n}\n.ff-body .panel-group .panel-heading {\n  border-bottom: 0;\n}\n.ff-body .panel-group .panel-heading + .panel-collapse > .panel-body,\n.ff-body .panel-group .panel-heading + .panel-collapse > .list-group {\n  border-top: 1px solid #ddd;\n}\n.ff-body .panel-group .panel-footer {\n  border-top: 0;\n}\n.ff-body .panel-group .panel-footer + .panel-collapse .panel-body {\n  border-bottom: 1px solid #ddd;\n}\n.ff-body .panel-default {\n  border-color: #ddd;\n}\n.ff-body .panel-default > .panel-heading {\n  color: #333333;\n  background-color: #f5f5f5;\n  border-color: #ddd;\n}\n.ff-body .panel-default > .panel-heading + .panel-collapse > .panel-body {\n  border-top-color: #ddd;\n}\n.ff-body .panel-default > .panel-heading .badge {\n  color: #f5f5f5;\n  background-color: #333333;\n}\n.ff-body .panel-default > .panel-footer + .panel-collapse > .panel-body {\n  border-bottom-color: #ddd;\n}\n.ff-body .panel-primary {\n  border-color: #3498db;\n}\n.ff-body .panel-primary > .panel-heading {\n  color: #fff;\n  background-color: #3498db;\n  border-color: #3498db;\n}\n.ff-body .panel-primary > .panel-heading + .panel-collapse > .panel-body {\n  border-top-color: #3498db;\n}\n.ff-body .panel-primary > .panel-heading .badge {\n  color: #3498db;\n  background-color: #fff;\n}\n.ff-body .panel-primary > .panel-footer + .panel-collapse > .panel-body {\n  border-bottom-color: #3498db;\n}\n.ff-body .panel-success {\n  border-color: #d6e9c6;\n}\n.ff-body .panel-success > .panel-heading {\n  color: #3c763d;\n  background-color: #dff0d8;\n  border-color: #d6e9c6;\n}\n.ff-body .panel-success > .panel-heading + .panel-collapse > .panel-body {\n  border-top-color: #d6e9c6;\n}\n.ff-body .panel-success > .panel-heading .badge {\n  color: #dff0d8;\n  background-color: #3c763d;\n}\n.ff-body .panel-success > .panel-footer + .panel-collapse > .panel-body {\n  border-bottom-color: #d6e9c6;\n}\n.ff-body .panel-info {\n  border-color: #bce8f1;\n}\n.ff-body .panel-info > .panel-heading {\n  color: #31708f;\n  background-color: #d9edf7;\n  border-color: #bce8f1;\n}\n.ff-body .panel-info > .panel-heading + .panel-collapse > .panel-body {\n  border-top-color: #bce8f1;\n}\n.ff-body .panel-info > .panel-heading .badge {\n  color: #d9edf7;\n  background-color: #31708f;\n}\n.ff-body .panel-info > .panel-footer + .panel-collapse > .panel-body {\n  border-bottom-color: #bce8f1;\n}\n.ff-body .panel-warning {\n  border-color: #faebcc;\n}\n.ff-body .panel-warning > .panel-heading {\n  color: #8a6d3b;\n  background-color: #fcf8e3;\n  border-color: #faebcc;\n}\n.ff-body .panel-warning > .panel-heading + .panel-collapse > .panel-body {\n  border-top-color: #faebcc;\n}\n.ff-body .panel-warning > .panel-heading .badge {\n  color: #fcf8e3;\n  background-color: #8a6d3b;\n}\n.ff-body .panel-warning > .panel-footer + .panel-collapse > .panel-body {\n  border-bottom-color: #faebcc;\n}\n.ff-body .panel-danger {\n  border-color: #ebccd1;\n}\n.ff-body .panel-danger > .panel-heading {\n  color: #a94442;\n  background-color: #f2dede;\n  border-color: #ebccd1;\n}\n.ff-body .panel-danger > .panel-heading + .panel-collapse > .panel-body {\n  border-top-color: #ebccd1;\n}\n.ff-body .panel-danger > .panel-heading .badge {\n  color: #f2dede;\n  background-color: #a94442;\n}\n.ff-body .panel-danger > .panel-footer + .panel-collapse > .panel-body {\n  border-bottom-color: #ebccd1;\n}\n.ff-body .embed-responsive {\n  position: relative;\n  display: block;\n  height: 0;\n  padding: 0;\n  overflow: hidden;\n}\n.ff-body .embed-responsive .embed-responsive-item,\n.ff-body .embed-responsive iframe,\n.ff-body .embed-responsive embed,\n.ff-body .embed-responsive object,\n.ff-body .embed-responsive video {\n  position: absolute;\n  top: 0;\n  left: 0;\n  bottom: 0;\n  height: 100%;\n  width: 100%;\n  border: 0;\n}\n.ff-body .embed-responsive-16by9 {\n  padding-bottom: 56.25%;\n}\n.ff-body .embed-responsive-4by3 {\n  padding-bottom: 75%;\n}\n.ff-body .well {\n  min-height: 20px;\n  padding: 19px;\n  margin-bottom: 20px;\n  background-color: #f5f5f5;\n  border: 1px solid #e3e3e3;\n  border-radius: 0px;\n  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.05);\n  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.05);\n}\n.ff-body .well blockquote {\n  border-color: #ddd;\n  border-color: rgba(0, 0, 0, 0.15);\n}\n.ff-body .well-lg {\n  padding: 24px;\n  border-radius: 0px;\n}\n.ff-body .well-sm {\n  padding: 9px;\n  border-radius: 0px;\n}\n.ff-body .close {\n  float: right;\n  font-size: 21px;\n  font-weight: bold;\n  line-height: 1;\n  color: #000;\n  text-shadow: 0 1px 0 #fff;\n  opacity: 0.2;\n  filter: alpha(opacity=20);\n}\n.ff-body .close:hover,\n.ff-body .close:focus {\n  color: #000;\n  text-decoration: none;\n  cursor: pointer;\n  opacity: 0.5;\n  filter: alpha(opacity=50);\n}\nbutton.ff-body .close {\n  padding: 0;\n  cursor: pointer;\n  background: transparent;\n  border: 0;\n  -webkit-appearance: none;\n}\n.ff-body .modal-open {\n  overflow: hidden;\n}\n.ff-body .modal {\n  display: none;\n  overflow: hidden;\n  position: fixed;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  z-index: 1050;\n  -webkit-overflow-scrolling: touch;\n  outline: 0;\n}\n.ff-body .modal.fade .modal-dialog {\n  -webkit-transform: translate(0, -25%);\n  -ms-transform: translate(0, -25%);\n  -o-transform: translate(0, -25%);\n  transform: translate(0, -25%);\n  -webkit-transition: -webkit-transform 0.3s ease-out;\n  -moz-transition: -moz-transform 0.3s ease-out;\n  -o-transition: -o-transform 0.3s ease-out;\n  transition: transform 0.3s ease-out;\n}\n.ff-body .modal.in .modal-dialog {\n  -webkit-transform: translate(0, 0);\n  -ms-transform: translate(0, 0);\n  -o-transform: translate(0, 0);\n  transform: translate(0, 0);\n}\n.ff-body .modal-open .modal {\n  overflow-x: hidden;\n  overflow-y: auto;\n}\n.ff-body .modal-dialog {\n  position: relative;\n  width: auto;\n  margin: 10px;\n}\n.ff-body .modal-content {\n  position: relative;\n  background-color: #fff;\n  border: 1px solid #999;\n  border: 1px solid rgba(0, 0, 0, 0.2);\n  border-radius: 0px;\n  -webkit-box-shadow: 0 3px 9px rgba(0, 0, 0, 0.5);\n  box-shadow: 0 3px 9px rgba(0, 0, 0, 0.5);\n  background-clip: padding-box;\n  outline: 0;\n}\n.ff-body .modal-backdrop {\n  position: fixed;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  z-index: 1040;\n  background-color: #000;\n}\n.ff-body .modal-backdrop.fade {\n  opacity: 0;\n  filter: alpha(opacity=0);\n}\n.ff-body .modal-backdrop.in {\n  opacity: 0.5;\n  filter: alpha(opacity=50);\n}\n.ff-body .modal-header {\n  padding: 15px;\n  border-bottom: 1px solid #e5e5e5;\n}\n.ff-body .modal-header .close {\n  margin-top: -2px;\n}\n.ff-body .modal-title {\n  margin: 0;\n  line-height: 1.42857143;\n}\n.ff-body .modal-body {\n  position: relative;\n  padding: 15px;\n}\n.ff-body .modal-footer {\n  padding: 15px;\n  text-align: right;\n  border-top: 1px solid #e5e5e5;\n}\n.ff-body .modal-footer .btn + .btn {\n  margin-left: 5px;\n  margin-bottom: 0;\n}\n.ff-body .modal-footer .btn-group .btn + .btn {\n  margin-left: -1px;\n}\n.ff-body .modal-footer .btn-block + .btn-block {\n  margin-left: 0;\n}\n.ff-body .modal-scrollbar-measure {\n  position: absolute;\n  top: -9999px;\n  width: 50px;\n  height: 50px;\n  overflow: scroll;\n}\n@media (min-width: 768px) {\n  .ff-body .modal-dialog {\n    width: 600px;\n    margin: 30px auto;\n  }\n  .ff-body .modal-content {\n    -webkit-box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);\n    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);\n  }\n  .ff-body .modal-sm {\n    width: 300px;\n  }\n}\n@media (min-width: 992px) {\n  .ff-body .modal-lg {\n    width: 900px;\n  }\n}\n.ff-body .tooltip {\n  position: absolute;\n  z-index: 1070;\n  display: block;\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Helvetica, Arial, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\";\n  font-style: normal;\n  font-weight: normal;\n  letter-spacing: normal;\n  line-break: auto;\n  line-height: 1.42857143;\n  text-align: left;\n  text-align: start;\n  text-decoration: none;\n  text-shadow: none;\n  text-transform: none;\n  white-space: normal;\n  word-break: normal;\n  word-spacing: normal;\n  word-wrap: normal;\n  font-size: 12px;\n  opacity: 0;\n  filter: alpha(opacity=0);\n}\n.ff-body .tooltip.in {\n  opacity: 0.9;\n  filter: alpha(opacity=90);\n}\n.ff-body .tooltip.top {\n  margin-top: -3px;\n  padding: 5px 0;\n}\n.ff-body .tooltip.right {\n  margin-left: 3px;\n  padding: 0 5px;\n}\n.ff-body .tooltip.bottom {\n  margin-top: 3px;\n  padding: 5px 0;\n}\n.ff-body .tooltip.left {\n  margin-left: -3px;\n  padding: 0 5px;\n}\n.ff-body .tooltip-inner {\n  max-width: 200px;\n  padding: 3px 8px;\n  color: #fff;\n  text-align: center;\n  background-color: #000;\n  border-radius: 0px;\n}\n.ff-body .tooltip-arrow {\n  position: absolute;\n  width: 0;\n  height: 0;\n  border-color: transparent;\n  border-style: solid;\n}\n.ff-body .tooltip.top .tooltip-arrow {\n  bottom: 0;\n  left: 50%;\n  margin-left: -5px;\n  border-width: 5px 5px 0;\n  border-top-color: #000;\n}\n.ff-body .tooltip.top-left .tooltip-arrow {\n  bottom: 0;\n  right: 5px;\n  margin-bottom: -5px;\n  border-width: 5px 5px 0;\n  border-top-color: #000;\n}\n.ff-body .tooltip.top-right .tooltip-arrow {\n  bottom: 0;\n  left: 5px;\n  margin-bottom: -5px;\n  border-width: 5px 5px 0;\n  border-top-color: #000;\n}\n.ff-body .tooltip.right .tooltip-arrow {\n  top: 50%;\n  left: 0;\n  margin-top: -5px;\n  border-width: 5px 5px 5px 0;\n  border-right-color: #000;\n}\n.ff-body .tooltip.left .tooltip-arrow {\n  top: 50%;\n  right: 0;\n  margin-top: -5px;\n  border-width: 5px 0 5px 5px;\n  border-left-color: #000;\n}\n.ff-body .tooltip.bottom .tooltip-arrow {\n  top: 0;\n  left: 50%;\n  margin-left: -5px;\n  border-width: 0 5px 5px;\n  border-bottom-color: #000;\n}\n.ff-body .tooltip.bottom-left .tooltip-arrow {\n  top: 0;\n  right: 5px;\n  margin-top: -5px;\n  border-width: 0 5px 5px;\n  border-bottom-color: #000;\n}\n.ff-body .tooltip.bottom-right .tooltip-arrow {\n  top: 0;\n  left: 5px;\n  margin-top: -5px;\n  border-width: 0 5px 5px;\n  border-bottom-color: #000;\n}\n.ff-body .popover {\n  position: absolute;\n  top: 0;\n  left: 0;\n  z-index: 1060;\n  display: none;\n  max-width: 276px;\n  padding: 1px;\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Helvetica, Arial, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\";\n  font-style: normal;\n  font-weight: normal;\n  letter-spacing: normal;\n  line-break: auto;\n  line-height: 1.42857143;\n  text-align: left;\n  text-align: start;\n  text-decoration: none;\n  text-shadow: none;\n  text-transform: none;\n  white-space: normal;\n  word-break: normal;\n  word-spacing: normal;\n  word-wrap: normal;\n  font-size: 14px;\n  background-color: #fff;\n  background-clip: padding-box;\n  border: 1px solid #ccc;\n  border: 1px solid rgba(0, 0, 0, 0.2);\n  border-radius: 0px;\n  -webkit-box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);\n  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);\n}\n.ff-body .popover.top {\n  margin-top: -10px;\n}\n.ff-body .popover.right {\n  margin-left: 10px;\n}\n.ff-body .popover.bottom {\n  margin-top: 10px;\n}\n.ff-body .popover.left {\n  margin-left: -10px;\n}\n.ff-body .popover-title {\n  margin: 0;\n  padding: 8px 14px;\n  font-size: 14px;\n  background-color: #f7f7f7;\n  border-bottom: 1px solid #ebebeb;\n  border-radius: -1px -1px 0 0;\n}\n.ff-body .popover-content {\n  padding: 9px 14px;\n}\n.ff-body .popover > .arrow,\n.ff-body .popover > .arrow:after {\n  position: absolute;\n  display: block;\n  width: 0;\n  height: 0;\n  border-color: transparent;\n  border-style: solid;\n}\n.ff-body .popover > .arrow {\n  border-width: 11px;\n}\n.ff-body .popover > .arrow:after {\n  border-width: 10px;\n  content: \"\";\n}\n.ff-body .popover.top > .arrow {\n  left: 50%;\n  margin-left: -11px;\n  border-bottom-width: 0;\n  border-top-color: #999999;\n  border-top-color: rgba(0, 0, 0, 0.25);\n  bottom: -11px;\n}\n.ff-body .popover.top > .arrow:after {\n  content: \" \";\n  bottom: 1px;\n  margin-left: -10px;\n  border-bottom-width: 0;\n  border-top-color: #fff;\n}\n.ff-body .popover.right > .arrow {\n  top: 50%;\n  left: -11px;\n  margin-top: -11px;\n  border-left-width: 0;\n  border-right-color: #999999;\n  border-right-color: rgba(0, 0, 0, 0.25);\n}\n.ff-body .popover.right > .arrow:after {\n  content: \" \";\n  left: 1px;\n  bottom: -10px;\n  border-left-width: 0;\n  border-right-color: #fff;\n}\n.ff-body .popover.bottom > .arrow {\n  left: 50%;\n  margin-left: -11px;\n  border-top-width: 0;\n  border-bottom-color: #999999;\n  border-bottom-color: rgba(0, 0, 0, 0.25);\n  top: -11px;\n}\n.ff-body .popover.bottom > .arrow:after {\n  content: \" \";\n  top: 1px;\n  margin-left: -10px;\n  border-top-width: 0;\n  border-bottom-color: #fff;\n}\n.ff-body .popover.left > .arrow {\n  top: 50%;\n  right: -11px;\n  margin-top: -11px;\n  border-right-width: 0;\n  border-left-color: #999999;\n  border-left-color: rgba(0, 0, 0, 0.25);\n}\n.ff-body .popover.left > .arrow:after {\n  content: \" \";\n  right: 1px;\n  border-right-width: 0;\n  border-left-color: #fff;\n  bottom: -10px;\n}\n.ff-body .carousel {\n  position: relative;\n}\n.ff-body .carousel-inner {\n  position: relative;\n  overflow: hidden;\n  width: 100%;\n}\n.ff-body .carousel-inner > .item {\n  display: none;\n  position: relative;\n  -webkit-transition: 0.6s ease-in-out left;\n  -o-transition: 0.6s ease-in-out left;\n  transition: 0.6s ease-in-out left;\n}\n.ff-body .carousel-inner > .item > img,\n.ff-body .carousel-inner > .item > a > img {\n  line-height: 1;\n}\n@media all and (transform-3d), (-webkit-transform-3d) {\n  .ff-body .carousel-inner > .item {\n    -webkit-transition: -webkit-transform 0.6s ease-in-out;\n    -moz-transition: -moz-transform 0.6s ease-in-out;\n    -o-transition: -o-transform 0.6s ease-in-out;\n    transition: transform 0.6s ease-in-out;\n    -webkit-backface-visibility: hidden;\n    -moz-backface-visibility: hidden;\n    backface-visibility: hidden;\n    -webkit-perspective: 1000px;\n    -moz-perspective: 1000px;\n    perspective: 1000px;\n  }\n  .ff-body .carousel-inner > .item.next,\n  .ff-body .carousel-inner > .item.active.right {\n    -webkit-transform: translate3d(100%, 0, 0);\n    transform: translate3d(100%, 0, 0);\n    left: 0;\n  }\n  .ff-body .carousel-inner > .item.prev,\n  .ff-body .carousel-inner > .item.active.left {\n    -webkit-transform: translate3d(-100%, 0, 0);\n    transform: translate3d(-100%, 0, 0);\n    left: 0;\n  }\n  .ff-body .carousel-inner > .item.next.left,\n  .ff-body .carousel-inner > .item.prev.right,\n  .ff-body .carousel-inner > .item.active {\n    -webkit-transform: translate3d(0, 0, 0);\n    transform: translate3d(0, 0, 0);\n    left: 0;\n  }\n}\n.ff-body .carousel-inner > .active,\n.ff-body .carousel-inner > .next,\n.ff-body .carousel-inner > .prev {\n  display: block;\n}\n.ff-body .carousel-inner > .active {\n  left: 0;\n}\n.ff-body .carousel-inner > .next,\n.ff-body .carousel-inner > .prev {\n  position: absolute;\n  top: 0;\n  width: 100%;\n}\n.ff-body .carousel-inner > .next {\n  left: 100%;\n}\n.ff-body .carousel-inner > .prev {\n  left: -100%;\n}\n.ff-body .carousel-inner > .next.left,\n.ff-body .carousel-inner > .prev.right {\n  left: 0;\n}\n.ff-body .carousel-inner > .active.left {\n  left: -100%;\n}\n.ff-body .carousel-inner > .active.right {\n  left: 100%;\n}\n.ff-body .carousel-control {\n  position: absolute;\n  top: 0;\n  left: 0;\n  bottom: 0;\n  width: 15%;\n  opacity: 0.5;\n  filter: alpha(opacity=50);\n  font-size: 20px;\n  color: #fff;\n  text-align: center;\n  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);\n  background-color: rgba(0, 0, 0, 0);\n}\n.ff-body .carousel-control.left {\n  background-image: -webkit-linear-gradient(left, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.0001) 100%);\n  background-image: -o-linear-gradient(left, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.0001) 100%);\n  background-image: linear-gradient(to right, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.0001) 100%);\n  background-repeat: repeat-x;\n  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#80000000', endColorstr='#00000000', GradientType=1);\n}\n.ff-body .carousel-control.right {\n  left: auto;\n  right: 0;\n  background-image: -webkit-linear-gradient(left, rgba(0, 0, 0, 0.0001) 0%, rgba(0, 0, 0, 0.5) 100%);\n  background-image: -o-linear-gradient(left, rgba(0, 0, 0, 0.0001) 0%, rgba(0, 0, 0, 0.5) 100%);\n  background-image: linear-gradient(to right, rgba(0, 0, 0, 0.0001) 0%, rgba(0, 0, 0, 0.5) 100%);\n  background-repeat: repeat-x;\n  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#00000000', endColorstr='#80000000', GradientType=1);\n}\n.ff-body .carousel-control:hover,\n.ff-body .carousel-control:focus {\n  outline: 0;\n  color: #fff;\n  text-decoration: none;\n  opacity: 0.9;\n  filter: alpha(opacity=90);\n}\n.ff-body .carousel-control .icon-prev,\n.ff-body .carousel-control .icon-next,\n.ff-body .carousel-control .glyphicon-chevron-left,\n.ff-body .carousel-control .glyphicon-chevron-right {\n  position: absolute;\n  top: 50%;\n  margin-top: -10px;\n  z-index: 5;\n  display: inline-block;\n}\n.ff-body .carousel-control .icon-prev,\n.ff-body .carousel-control .glyphicon-chevron-left {\n  left: 50%;\n  margin-left: -10px;\n}\n.ff-body .carousel-control .icon-next,\n.ff-body .carousel-control .glyphicon-chevron-right {\n  right: 50%;\n  margin-right: -10px;\n}\n.ff-body .carousel-control .icon-prev,\n.ff-body .carousel-control .icon-next {\n  width: 20px;\n  height: 20px;\n  line-height: 1;\n  font-family: serif;\n}\n.ff-body .carousel-control .icon-prev:before {\n  content: '\\2039';\n}\n.ff-body .carousel-control .icon-next:before {\n  content: '\\203A';\n}\n.ff-body .carousel-indicators {\n  position: absolute;\n  bottom: 10px;\n  left: 50%;\n  z-index: 15;\n  width: 60%;\n  margin-left: -30%;\n  padding-left: 0;\n  list-style: none;\n  text-align: center;\n}\n.ff-body .carousel-indicators li {\n  display: inline-block;\n  width: 10px;\n  height: 10px;\n  margin: 1px;\n  text-indent: -999px;\n  border: 1px solid #fff;\n  border-radius: 10px;\n  cursor: pointer;\n  background-color: #000 \\9;\n  background-color: rgba(0, 0, 0, 0);\n}\n.ff-body .carousel-indicators .active {\n  margin: 0;\n  width: 12px;\n  height: 12px;\n  background-color: #fff;\n}\n.ff-body .carousel-caption {\n  position: absolute;\n  left: 15%;\n  right: 15%;\n  bottom: 20px;\n  z-index: 10;\n  padding-top: 20px;\n  padding-bottom: 20px;\n  color: #fff;\n  text-align: center;\n  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);\n}\n.ff-body .carousel-caption .btn {\n  text-shadow: none;\n}\n@media screen and (min-width: 768px) {\n  .ff-body .carousel-control .glyphicon-chevron-left,\n  .ff-body .carousel-control .glyphicon-chevron-right,\n  .ff-body .carousel-control .icon-prev,\n  .ff-body .carousel-control .icon-next {\n    width: 30px;\n    height: 30px;\n    margin-top: -10px;\n    font-size: 30px;\n  }\n  .ff-body .carousel-control .glyphicon-chevron-left,\n  .ff-body .carousel-control .icon-prev {\n    margin-left: -10px;\n  }\n  .ff-body .carousel-control .glyphicon-chevron-right,\n  .ff-body .carousel-control .icon-next {\n    margin-right: -10px;\n  }\n  .ff-body .carousel-caption {\n    left: 20%;\n    right: 20%;\n    padding-bottom: 30px;\n  }\n  .ff-body .carousel-indicators {\n    bottom: 20px;\n  }\n}\n.ff-body .clearfix:before,\n.ff-body .clearfix:after,\n.ff-body .ff-body .dl-horizontal dd:before,\n.ff-body .ff-body .dl-horizontal dd:after,\n.ff-body .ff-body .container:before,\n.ff-body .ff-body .container:after,\n.ff-body .ff-body .container-fluid:before,\n.ff-body .ff-body .container-fluid:after,\n.ff-body .ff-body .row:before,\n.ff-body .ff-body .row:after,\n.ff-body .ff-body .form-horizontal .form-group:before,\n.ff-body .ff-body .form-horizontal .form-group:after,\n.ff-body .ff-body .btn-toolbar:before,\n.ff-body .ff-body .btn-toolbar:after,\n.ff-body .ff-body .btn-group-vertical > .btn-group:before,\n.ff-body .ff-body .btn-group-vertical > .btn-group:after,\n.ff-body .ff-body .nav:before,\n.ff-body .ff-body .nav:after,\n.ff-body .ff-body .navbar:before,\n.ff-body .ff-body .navbar:after,\n.ff-body .ff-body .navbar-header:before,\n.ff-body .ff-body .navbar-header:after,\n.ff-body .ff-body .navbar-collapse:before,\n.ff-body .ff-body .navbar-collapse:after,\n.ff-body .ff-body .pager:before,\n.ff-body .ff-body .pager:after,\n.ff-body .ff-body .panel-body:before,\n.ff-body .ff-body .panel-body:after,\n.ff-body .ff-body .modal-header:before,\n.ff-body .ff-body .modal-header:after,\n.ff-body .ff-body .modal-footer:before,\n.ff-body .ff-body .modal-footer:after {\n  content: \" \";\n  display: table;\n}\n.ff-body .clearfix:after,\n.ff-body .ff-body .dl-horizontal dd:after,\n.ff-body .ff-body .container:after,\n.ff-body .ff-body .container-fluid:after,\n.ff-body .ff-body .row:after,\n.ff-body .ff-body .form-horizontal .form-group:after,\n.ff-body .ff-body .btn-toolbar:after,\n.ff-body .ff-body .btn-group-vertical > .btn-group:after,\n.ff-body .ff-body .nav:after,\n.ff-body .ff-body .navbar:after,\n.ff-body .ff-body .navbar-header:after,\n.ff-body .ff-body .navbar-collapse:after,\n.ff-body .ff-body .pager:after,\n.ff-body .ff-body .panel-body:after,\n.ff-body .ff-body .modal-header:after,\n.ff-body .ff-body .modal-footer:after {\n  clear: both;\n}\n.ff-body .clearfix:before,\n.ff-body .clearfix:after,\n.ff-body .ff-body .dl-horizontal dd:before,\n.ff-body .ff-body .dl-horizontal dd:after,\n.ff-body .ff-body .container:before,\n.ff-body .ff-body .container:after,\n.ff-body .ff-body .container-fluid:before,\n.ff-body .ff-body .container-fluid:after,\n.ff-body .ff-body .row:before,\n.ff-body .ff-body .row:after,\n.ff-body .ff-body .form-horizontal .form-group:before,\n.ff-body .ff-body .form-horizontal .form-group:after,\n.ff-body .ff-body .btn-toolbar:before,\n.ff-body .ff-body .btn-toolbar:after,\n.ff-body .ff-body .btn-group-vertical > .btn-group:before,\n.ff-body .ff-body .btn-group-vertical > .btn-group:after,\n.ff-body .ff-body .nav:before,\n.ff-body .ff-body .nav:after,\n.ff-body .ff-body .navbar:before,\n.ff-body .ff-body .navbar:after,\n.ff-body .ff-body .navbar-header:before,\n.ff-body .ff-body .navbar-header:after,\n.ff-body .ff-body .navbar-collapse:before,\n.ff-body .ff-body .navbar-collapse:after,\n.ff-body .ff-body .pager:before,\n.ff-body .ff-body .pager:after,\n.ff-body .ff-body .panel-body:before,\n.ff-body .ff-body .panel-body:after,\n.ff-body .ff-body .modal-header:before,\n.ff-body .ff-body .modal-header:after,\n.ff-body .ff-body .modal-footer:before,\n.ff-body .ff-body .modal-footer:after {\n  content: \" \";\n  display: table;\n}\n.ff-body .clearfix:after,\n.ff-body .ff-body .dl-horizontal dd:after,\n.ff-body .ff-body .container:after,\n.ff-body .ff-body .container-fluid:after,\n.ff-body .ff-body .row:after,\n.ff-body .ff-body .form-horizontal .form-group:after,\n.ff-body .ff-body .btn-toolbar:after,\n.ff-body .ff-body .btn-group-vertical > .btn-group:after,\n.ff-body .ff-body .nav:after,\n.ff-body .ff-body .navbar:after,\n.ff-body .ff-body .navbar-header:after,\n.ff-body .ff-body .navbar-collapse:after,\n.ff-body .ff-body .pager:after,\n.ff-body .ff-body .panel-body:after,\n.ff-body .ff-body .modal-header:after,\n.ff-body .ff-body .modal-footer:after {\n  clear: both;\n}\n.ff-body .center-block {\n  float: none;\n  display: block;\n  margin-left: auto;\n  margin-right: auto;\n}\n.ff-body .pull-right {\n  float: right !important;\n}\n.ff-body .pull-left {\n  float: left !important;\n}\n.ff-body .hide {\n  display: none !important;\n}\n.ff-body .show {\n  display: block !important;\n}\n.ff-body .invisible {\n  visibility: hidden;\n}\n.ff-body .text-hide {\n  font: 0/0 a;\n  color: transparent;\n  text-shadow: none;\n  background-color: transparent;\n  border: 0;\n}\n.ff-body .hidden {\n  display: none !important;\n}\n.ff-body .affix {\n  position: fixed;\n}\n@-ms-viewport {\n  width: device-width;\n}\n.ff-body .visible-xs,\n.ff-body .visible-sm,\n.ff-body .visible-md,\n.ff-body .visible-lg {\n  display: none !important;\n}\n.ff-body .visible-xs-block,\n.ff-body .visible-xs-inline,\n.ff-body .visible-xs-inline-block,\n.ff-body .visible-sm-block,\n.ff-body .visible-sm-inline,\n.ff-body .visible-sm-inline-block,\n.ff-body .visible-md-block,\n.ff-body .visible-md-inline,\n.ff-body .visible-md-inline-block,\n.ff-body .visible-lg-block,\n.ff-body .visible-lg-inline,\n.ff-body .visible-lg-inline-block {\n  display: none !important;\n}\n@media (max-width: 767px) {\n  .ff-body .visible-xs {\n    display: block !important;\n  }\n  table.ff-body .visible-xs {\n    display: table !important;\n  }\n  tr.ff-body .visible-xs {\n    display: table-row !important;\n  }\n  th.ff-body .visible-xs,\n  td.ff-body .visible-xs {\n    display: table-cell !important;\n  }\n}\n@media (max-width: 767px) {\n  .ff-body .visible-xs-block {\n    display: block !important;\n  }\n}\n@media (max-width: 767px) {\n  .ff-body .visible-xs-inline {\n    display: inline !important;\n  }\n}\n@media (max-width: 767px) {\n  .ff-body .visible-xs-inline-block {\n    display: inline-block !important;\n  }\n}\n@media (min-width: 768px) and (max-width: 991px) {\n  .ff-body .visible-sm {\n    display: block !important;\n  }\n  table.ff-body .visible-sm {\n    display: table !important;\n  }\n  tr.ff-body .visible-sm {\n    display: table-row !important;\n  }\n  th.ff-body .visible-sm,\n  td.ff-body .visible-sm {\n    display: table-cell !important;\n  }\n}\n@media (min-width: 768px) and (max-width: 991px) {\n  .ff-body .visible-sm-block {\n    display: block !important;\n  }\n}\n@media (min-width: 768px) and (max-width: 991px) {\n  .ff-body .visible-sm-inline {\n    display: inline !important;\n  }\n}\n@media (min-width: 768px) and (max-width: 991px) {\n  .ff-body .visible-sm-inline-block {\n    display: inline-block !important;\n  }\n}\n@media (min-width: 992px) and (max-width: 1199px) {\n  .ff-body .visible-md {\n    display: block !important;\n  }\n  table.ff-body .visible-md {\n    display: table !important;\n  }\n  tr.ff-body .visible-md {\n    display: table-row !important;\n  }\n  th.ff-body .visible-md,\n  td.ff-body .visible-md {\n    display: table-cell !important;\n  }\n}\n@media (min-width: 992px) and (max-width: 1199px) {\n  .ff-body .visible-md-block {\n    display: block !important;\n  }\n}\n@media (min-width: 992px) and (max-width: 1199px) {\n  .ff-body .visible-md-inline {\n    display: inline !important;\n  }\n}\n@media (min-width: 992px) and (max-width: 1199px) {\n  .ff-body .visible-md-inline-block {\n    display: inline-block !important;\n  }\n}\n@media (min-width: 1200px) {\n  .ff-body .visible-lg {\n    display: block !important;\n  }\n  table.ff-body .visible-lg {\n    display: table !important;\n  }\n  tr.ff-body .visible-lg {\n    display: table-row !important;\n  }\n  th.ff-body .visible-lg,\n  td.ff-body .visible-lg {\n    display: table-cell !important;\n  }\n}\n@media (min-width: 1200px) {\n  .ff-body .visible-lg-block {\n    display: block !important;\n  }\n}\n@media (min-width: 1200px) {\n  .ff-body .visible-lg-inline {\n    display: inline !important;\n  }\n}\n@media (min-width: 1200px) {\n  .ff-body .visible-lg-inline-block {\n    display: inline-block !important;\n  }\n}\n@media (max-width: 767px) {\n  .ff-body .hidden-xs {\n    display: none !important;\n  }\n}\n@media (min-width: 768px) and (max-width: 991px) {\n  .ff-body .hidden-sm {\n    display: none !important;\n  }\n}\n@media (min-width: 992px) and (max-width: 1199px) {\n  .ff-body .hidden-md {\n    display: none !important;\n  }\n}\n@media (min-width: 1200px) {\n  .ff-body .hidden-lg {\n    display: none !important;\n  }\n}\n.ff-body .visible-print {\n  display: none !important;\n}\n@media print {\n  .ff-body .visible-print {\n    display: block !important;\n  }\n  table.ff-body .visible-print {\n    display: table !important;\n  }\n  tr.ff-body .visible-print {\n    display: table-row !important;\n  }\n  th.ff-body .visible-print,\n  td.ff-body .visible-print {\n    display: table-cell !important;\n  }\n}\n.ff-body .visible-print-block {\n  display: none !important;\n}\n@media print {\n  .ff-body .visible-print-block {\n    display: block !important;\n  }\n}\n.ff-body .visible-print-inline {\n  display: none !important;\n}\n@media print {\n  .ff-body .visible-print-inline {\n    display: inline !important;\n  }\n}\n.ff-body .visible-print-inline-block {\n  display: none !important;\n}\n@media print {\n  .ff-body .visible-print-inline-block {\n    display: inline-block !important;\n  }\n}\n@media print {\n  .ff-body .hidden-print {\n    display: none !important;\n  }\n}\n.ff-body .dashed {\n  border-top: 1px dashed #dedede;\n  margin: 15px 0;\n}\n.ff-body .scrollbar-xs::-webkit-scrollbar-track {\n  -webkit-box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.3);\n  background-color: #F5F5F5;\n}\n.ff-body .scrollbar-xs::-webkit-scrollbar {\n  width: 4px;\n  background-color: rgba(100, 100, 100, 0.1);\n}\n.ff-body .scrollbar-xs::-webkit-scrollbar-thumb {\n  background-color: rgba(0, 0, 0, 0.2);\n}\n.ff-body .scrollbar-none::-webkit-scrollbar-track {\n  background-color: rgba(0, 0, 0, 0);\n}\n.ff-body .scrollbar-none::-webkit-scrollbar {\n  width: 1px;\n  background-color: rgba(0, 0, 0, 0);\n}\n.ff-body .scrollbar-none::-webkit-scrollbar-thumb {\n  background-color: rgba(0, 0, 0, 0);\n}\n.ff-body desc {\n  font-size: 0.9em;\n  color: #777777;\n}\n.ff-body .inlineblock {\n  display: inline-block !important;\n}\n.ff-body hr.separator {\n  margin: 15px 0;\n  border-color: #e6e6e6;\n}\n.ff-body .inline {\n  display: inline-block !important;\n}\n.ff-body .pointer {\n  cursor: hand;\n  cursor: pointer;\n}\n.ff-body .center-block {\n  float: none;\n  display: block;\n  margin-left: auto;\n  margin-right: auto;\n}\n.ff-body .center,\n.ff-body .text-center {\n  text-align: center;\n}\n.ff-body .text-left {\n  text-align: left !important;\n}\n.ff-body .text-right {\n  text-align: right !important;\n}\n.ff-body .v-middle {\n  vertical-align: middle !important;\n}\n.ff-body .v-top {\n  vertical-align: top !important;\n}\n.ff-body .v-bottom {\n  vertical-align: bottom !important;\n}\n.ff-body .v-baseline {\n  vertical-align: baseline !important;\n}\n.ff-body .hidden {\n  display: none !important;\n}\n.ff-body .block {\n  display: block !important;\n}\n.ff-body .wide {\n  display: block !important;\n  width: 100% !important;\n}\n.ff-body .fit {\n  position: absolute;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n}\n.ff-body .wfit {\n  width: 100%;\n}\n.ff-body .hfit {\n  height: 100%;\n}\n.ff-body .rel {\n  position: relative;\n}\n.ff-body .fixed {\n  position: fixed;\n}\n.ff-body .w50 {\n  width: 50px !important;\n}\n.ff-body .w100 {\n  width: 100px !important;\n}\n.ff-body .w150 {\n  width: 150px !important;\n}\n.ff-body .w200 {\n  width: 200px !important;\n}\n.ff-body .w250 {\n  width: 250px !important;\n}\n.ff-body .w300 {\n  width: 300px !important;\n}\n.ff-body .w600 {\n  width: 600px !important;\n}\n.ff-body .w900 {\n  width: 900px !important;\n}\n.ff-body .w1200 {\n  width: 1200px !important;\n}\n.ff-body .xw50 {\n  max-width: 50px !important;\n}\n.ff-body .xw100 {\n  max-width: 100px !important;\n}\n.ff-body .xw150 {\n  max-width: 150px !important;\n}\n.ff-body .xw200 {\n  max-width: 200px !important;\n}\n.ff-body .xw250 {\n  max-width: 250px !important;\n}\n.ff-body .xw300 {\n  max-width: 300px !important;\n}\n.ff-body .xw600 {\n  max-width: 600px !important;\n}\n.ff-body .xw900 {\n  max-width: 900px !important;\n}\n.ff-body .xw1200 {\n  max-width: 1200px !important;\n}\n.ff-body .h50 {\n  height: 50px !important;\n}\n.ff-body .h100 {\n  height: 100px !important;\n}\n.ff-body .h150 {\n  height: 150px !important;\n}\n.ff-body .h200 {\n  height: 200px !important;\n}\n.ff-body .h250 {\n  height: 250px !important;\n}\n.ff-body .h300 {\n  height: 300px !important;\n}\n.ff-body .h600 {\n  height: 600px !important;\n}\n.ff-body .h900 {\n  height: 900px !important;\n}\n.ff-body .h1200 {\n  height: 1200px !important;\n}\n.ff-body .antialiased {\n  font-smoothing: antialiased;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  text-rendering: optimizeLegibility;\n  font-feature-settings: \"kern\" 1;\n  font-kerning: normal;\n  letter-spacing: -0.05em;\n}\n.ff-body .noborder,\n.ff-body .b0 {\n  border: none;\n}\n.ff-body .border {\n  border: 1px solid #dedede;\n}\n.ff-body .border-muted {\n  border-color: #999 !important;\n}\n.ff-body .bt {\n  border-top: 1px solid #dedede !important;\n}\n.ff-body .br {\n  border-right: 1px solid #dedede !important;\n}\n.ff-body .bl {\n  border-left: 1px solid #dedede !important;\n}\n.ff-body .bb {\n  border-bottom: 1px solid #dedede !important;\n}\n.ff-body .bt0 {\n  border-top: none !important;\n}\n.ff-body .br0 {\n  border-right: none !important;\n}\n.ff-body .bl0 {\n  border-left: none !important;\n}\n.ff-body .bb0 {\n  border-bottom: none !important;\n}\n.ff-body .text-serif {\n  font-family: Georgia, \"Times New Roman\", Times, serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\" !important;\n}\n.ff-body .text-sans {\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Helvetica, Arial, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\" !important;\n}\n.ff-body .text-mono {\n  font-family: Menlo, Monaco, Consolas, \"Courier New\", monospace, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\" !important;\n}\n.ff-body .text-script {\n  font-family: Georgia, \"Times New Roman\", Times, serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\" !important;\n}\n.ff-body .text-white {\n  color: #fff !important;\n}\n.ff-body .text-primary {\n  color: #3498db !important;\n}\n.ff-body .text-info {\n  color: #3bafda !important;\n}\n.ff-body .text-success {\n  color: #70AB4F !important;\n}\n.ff-body .text-warning {\n  color: #f6bb42 !important;\n}\n.ff-body .text-danger {\n  color: #e9573f !important;\n}\n.ff-body .text-alert {\n  color: #967adc !important;\n}\n.ff-body .text-muted {\n  color: #999 !important;\n}\n.ff-body .bg-system {\n  background-color: #37bc9b !important;\n}\n.ff-body .bg-white {\n  background-color: #fff !important;\n}\n.ff-body .bg-primary {\n  background-color: #3498db !important;\n}\n.ff-body .bg-info {\n  background-color: #3bafda !important;\n}\n.ff-body .bg-success {\n  background-color: #70AB4F !important;\n}\n.ff-body .bg-warning {\n  background-color: #f6bb42 !important;\n}\n.ff-body .bg-danger {\n  background-color: #e9573f !important;\n}\n.ff-body .bg-alert {\n  background-color: #967adc !important;\n}\n.ff-body .bg-system {\n  background-color: #37bc9b !important;\n}\n.ff-body .bg-default,\n.ff-body .bg-contents {\n  background-color: #eee;\n}\n.ff-body .bg-light {\n  background-color: #fafafa;\n}\n.ff-body .bg-lighter {\n  background-color: #ffffff;\n}\n.ff-body .bg-dark {\n  background-color: #e1e1e1;\n}\n.ff-body .bg-darker {\n  background-color: #d5d5d5;\n}\n.ff-body .bg-border {\n  background-color: #dedede;\n}\n.ff-body .bg-text {\n  background-color: #424242;\n}\n.ff-body .bold {\n  font-weight: bold;\n}\n.ff-body .m0 {\n  margin: 0 !important;\n}\n.ff-body .m5 {\n  margin: 5px !important;\n}\n.ff-body .m10 {\n  margin: 10px !important;\n}\n.ff-body .m15 {\n  margin: 15px !important;\n}\n.ff-body .m20 {\n  margin: 20px !important;\n}\n.ff-body .mt0 {\n  margin-top: 0 !important;\n}\n.ff-body .mt5 {\n  margin-top: 5px !important;\n}\n.ff-body .mt10 {\n  margin-top: 10px !important;\n}\n.ff-body .mt15 {\n  margin-top: 15px !important;\n}\n.ff-body .mt20 {\n  margin-top: 20px !important;\n}\n.ff-body .mb0 {\n  margin-bottom: 0 !important;\n}\n.ff-body .mb5 {\n  margin-bottom: 5px !important;\n}\n.ff-body .mb10 {\n  margin-bottom: 10px !important;\n}\n.ff-body .mb15 {\n  margin-bottom: 15px !important;\n}\n.ff-body .mb20 {\n  margin-bottom: 20px !important;\n}\n.ff-body .ml0 {\n  margin-left: 0 !important;\n}\n.ff-body .ml5 {\n  margin-left: 5px !important;\n}\n.ff-body .ml10 {\n  margin-left: 10px !important;\n}\n.ff-body .ml15 {\n  margin-left: 15px !important;\n}\n.ff-body .ml20 {\n  margin-left: 20px !important;\n}\n.ff-body .mr0 {\n  margin-right: 0 !important;\n}\n.ff-body .mr5 {\n  margin-right: 5px !important;\n}\n.ff-body .mr10 {\n  margin-right: 10px !important;\n}\n.ff-body .mr15 {\n  margin-right: 15px !important;\n}\n.ff-body .mr20 {\n  margin-right: 20px !important;\n}\n.ff-body .mv0 {\n  margin-top: 0 !important;\n  margin-bottom: 0 !important;\n}\n.ff-body .mv5 {\n  margin-top: 5px !important;\n  margin-bottom: 5px !important;\n}\n.ff-body .mv10 {\n  margin-top: 10px !important;\n  margin-bottom: 10px !important;\n}\n.ff-body .mv15 {\n  margin-top: 15px !important;\n  margin-bottom: 15px !important;\n}\n.ff-body .mv20 {\n  margin-top: 20px !important;\n  margin-bottom: 20px !important;\n}\n.ff-body .mh0 {\n  margin-left: 0 !important;\n  margin-right: 0 !important;\n}\n.ff-body .mh5 {\n  margin-left: 5px !important;\n  margin-right: 5px !important;\n}\n.ff-body .mh10 {\n  margin-left: 10px !important;\n  margin-right: 10px !important;\n}\n.ff-body .mh15 {\n  margin-left: 15px !important;\n  margin-right: 15px !important;\n}\n.ff-body .mh20 {\n  margin-left: 20px !important;\n  margin-right: 20px !important;\n}\n.ff-body .p0 {\n  padding: 0 !important;\n}\n.ff-body .p5 {\n  padding: 5px !important;\n}\n.ff-body .p10 {\n  padding: 10px !important;\n}\n.ff-body .p15 {\n  padding: 15px !important;\n}\n.ff-body .p20 {\n  padding: 20px !important;\n}\n.ff-body .pt0 {\n  padding-top: 0 !important;\n}\n.ff-body .pt5 {\n  padding-top: 5px !important;\n}\n.ff-body .pt10 {\n  padding-top: 10px !important;\n}\n.ff-body .pt15 {\n  padding-top: 15px !important;\n}\n.ff-body .pt20 {\n  padding-top: 20px !important;\n}\n.ff-body .pb0 {\n  padding-bottom: 0 !important;\n}\n.ff-body .pb5 {\n  padding-bottom: 5px !important;\n}\n.ff-body .pb10 {\n  padding-bottom: 10px !important;\n}\n.ff-body .pb15 {\n  padding-bottom: 15px !important;\n}\n.ff-body .pb20 {\n  padding-bottom: 20px !important;\n}\n.ff-body .pl0 {\n  padding-left: 0 !important;\n}\n.ff-body .pl5 {\n  padding-left: 5px !important;\n}\n.ff-body .pl10 {\n  padding-left: 10px !important;\n}\n.ff-body .pl15 {\n  padding-left: 15px !important;\n}\n.ff-body .pl20 {\n  padding-left: 20px !important;\n}\n.ff-body .pr0 {\n  padding-right: 0 !important;\n}\n.ff-body .pr5 {\n  padding-right: 5px !important;\n}\n.ff-body .pr10 {\n  padding-right: 10px !important;\n}\n.ff-body .pr15 {\n  padding-right: 15px !important;\n}\n.ff-body .pr20 {\n  padding-right: 20px !important;\n}\n.ff-body .pv0 {\n  padding-top: 0 !important;\n  padding-bottom: 0 !important;\n}\n.ff-body .pv5 {\n  padding-top: 5px !important;\n  padding-bottom: 5px !important;\n}\n.ff-body .pv10 {\n  padding-top: 10px !important;\n  padding-bottom: 10px !important;\n}\n.ff-body .pv15 {\n  padding-top: 15px !important;\n  padding-bottom: 15px !important;\n}\n.ff-body .pv20 {\n  padding-top: 20px !important;\n  padding-bottom: 20px !important;\n}\n.ff-body .ph0 {\n  padding-left: 0 !important;\n  padding-right: 0 !important;\n}\n.ff-body .ph5 {\n  padding-left: 5px !important;\n  padding-right: 5px !important;\n}\n.ff-body .ph10 {\n  padding-left: 10px !important;\n  padding-right: 10px !important;\n}\n.ff-body .ph15 {\n  padding-left: 15px !important;\n  padding-right: 15px !important;\n}\n.ff-body .pr20 {\n  padding-left: 20px !important;\n  padding-right: 20px !important;\n}\n.ff-body .nosel {\n  user-select: none !important;\n}\n.ff-body .z0 {\n  z-index: 0 !important;\n}\n.ff-body .z1 {\n  z-index: 1 !important;\n}\n.ff-body .z2 {\n  z-index: 2 !important;\n}\n.ff-body .z3 {\n  z-index: 3 !important;\n}\n.ff-body .z4 {\n  z-index: 4 !important;\n}\n.ff-body .z5 {\n  z-index: 5 !important;\n}\n.ff-body .fs8 {\n  font-size: 8px !important;\n}\n.ff-body .fs9 {\n  font-size: 9px !important;\n}\n.ff-body .fs10 {\n  font-size: 10px !important;\n}\n.ff-body .fs11 {\n  font-size: 11px !important;\n}\n.ff-body .fs12 {\n  font-size: 12px !important;\n}\n.ff-body .fs13 {\n  font-size: 13px !important;\n}\n.ff-body .fs14 {\n  font-size: 14px !important;\n}\n.ff-body .fs15 {\n  font-size: 15px !important;\n}\n.ff-body .fs16 {\n  font-size: 16px !important;\n}\n.ff-body body {\n  -moz-osx-font-smoothing: grayscale;\n  -webkit-font-smoothing: antialiased;\n  color: #424242;\n  padding: 0;\n  margin: 0;\n  font-weight: 400;\n}\n.ff-body *::selection {\n  background-color: #343434;\n  color: #fff;\n}\n.ff-body input:focus {\n  outline: none;\n  box-shadow: none;\n}\n.ff-body a {\n  color: #424242;\n  text-decoration: none;\n}\n.ff-body b,\n.ff-body strong {\n  font-weight: 600;\n}\n.ff-body *[contenteditable] {\n  border: none;\n}\n.ff-body *[contenteditable]:focus,\n.ff-body *[contenteditable]:hover {\n  outline: none;\n  border: none;\n}\n.ff-body .clearfix:before,\n.ff-body .clearfix:after,\n.ff-body .dl-horizontal dd:before,\n.ff-body .dl-horizontal dd:after,\n.ff-body .container:before,\n.ff-body .container:after,\n.ff-body .container-fluid:before,\n.ff-body .container-fluid:after,\n.ff-body .row:before,\n.ff-body .row:after,\n.ff-body .form-horizontal .form-group:before,\n.ff-body .form-horizontal .form-group:after,\n.ff-body .btn-toolbar:before,\n.ff-body .btn-toolbar:after,\n.ff-body .btn-group-vertical > .btn-group:before,\n.ff-body .btn-group-vertical > .btn-group:after,\n.ff-body .nav:before,\n.ff-body .nav:after,\n.ff-body .navbar:before,\n.ff-body .navbar:after,\n.ff-body .navbar-header:before,\n.ff-body .navbar-header:after,\n.ff-body .navbar-collapse:before,\n.ff-body .navbar-collapse:after,\n.ff-body .pager:before,\n.ff-body .pager:after,\n.ff-body .panel-body:before,\n.ff-body .panel-body:after,\n.ff-body .modal-header:before,\n.ff-body .modal-header:after,\n.ff-body .modal-footer:before,\n.ff-body .modal-footer:after,\n.ff-body .ff-body .dl-horizontal dd:before,\n.ff-body .ff-body .dl-horizontal dd:after,\n.ff-body .ff-body .container:before,\n.ff-body .ff-body .container:after,\n.ff-body .ff-body .container-fluid:before,\n.ff-body .ff-body .container-fluid:after,\n.ff-body .ff-body .row:before,\n.ff-body .ff-body .row:after,\n.ff-body .ff-body .form-horizontal .form-group:before,\n.ff-body .ff-body .form-horizontal .form-group:after,\n.ff-body .ff-body .btn-toolbar:before,\n.ff-body .ff-body .btn-toolbar:after,\n.ff-body .ff-body .btn-group-vertical > .btn-group:before,\n.ff-body .ff-body .btn-group-vertical > .btn-group:after,\n.ff-body .ff-body .nav:before,\n.ff-body .ff-body .nav:after,\n.ff-body .ff-body .navbar:before,\n.ff-body .ff-body .navbar:after,\n.ff-body .ff-body .navbar-header:before,\n.ff-body .ff-body .navbar-header:after,\n.ff-body .ff-body .navbar-collapse:before,\n.ff-body .ff-body .navbar-collapse:after,\n.ff-body .ff-body .pager:before,\n.ff-body .ff-body .pager:after,\n.ff-body .ff-body .panel-body:before,\n.ff-body .ff-body .panel-body:after,\n.ff-body .ff-body .modal-header:before,\n.ff-body .ff-body .modal-header:after,\n.ff-body .ff-body .modal-footer:before,\n.ff-body .ff-body .modal-footer:after {\n  content: \" \";\n  display: table;\n}\n.ff-body .clearfix:before,\n.ff-body .clearfix:after,\n.ff-body .dl-horizontal dd:before,\n.ff-body .dl-horizontal dd:after,\n.ff-body .container:before,\n.ff-body .container:after,\n.ff-body .container-fluid:before,\n.ff-body .container-fluid:after,\n.ff-body .row:before,\n.ff-body .row:after,\n.ff-body .form-horizontal .form-group:before,\n.ff-body .form-horizontal .form-group:after,\n.ff-body .btn-toolbar:before,\n.ff-body .btn-toolbar:after,\n.ff-body .btn-group-vertical > .btn-group:before,\n.ff-body .btn-group-vertical > .btn-group:after,\n.ff-body .nav:before,\n.ff-body .nav:after,\n.ff-body .navbar:before,\n.ff-body .navbar:after,\n.ff-body .navbar-header:before,\n.ff-body .navbar-header:after,\n.ff-body .navbar-collapse:before,\n.ff-body .navbar-collapse:after,\n.ff-body .pager:before,\n.ff-body .pager:after,\n.ff-body .panel-body:before,\n.ff-body .panel-body:after,\n.ff-body .modal-header:before,\n.ff-body .modal-header:after,\n.ff-body .modal-footer:before,\n.ff-body .modal-footer:after,\n.ff-body .ff-body .dl-horizontal dd:before,\n.ff-body .ff-body .dl-horizontal dd:after,\n.ff-body .ff-body .container:before,\n.ff-body .ff-body .container:after,\n.ff-body .ff-body .container-fluid:before,\n.ff-body .ff-body .container-fluid:after,\n.ff-body .ff-body .row:before,\n.ff-body .ff-body .row:after,\n.ff-body .ff-body .form-horizontal .form-group:before,\n.ff-body .ff-body .form-horizontal .form-group:after,\n.ff-body .ff-body .btn-toolbar:before,\n.ff-body .ff-body .btn-toolbar:after,\n.ff-body .ff-body .btn-group-vertical > .btn-group:before,\n.ff-body .ff-body .btn-group-vertical > .btn-group:after,\n.ff-body .ff-body .nav:before,\n.ff-body .ff-body .nav:after,\n.ff-body .ff-body .navbar:before,\n.ff-body .ff-body .navbar:after,\n.ff-body .ff-body .navbar-header:before,\n.ff-body .ff-body .navbar-header:after,\n.ff-body .ff-body .navbar-collapse:before,\n.ff-body .ff-body .navbar-collapse:after,\n.ff-body .ff-body .pager:before,\n.ff-body .ff-body .pager:after,\n.ff-body .ff-body .panel-body:before,\n.ff-body .ff-body .panel-body:after,\n.ff-body .ff-body .modal-header:before,\n.ff-body .ff-body .modal-header:after,\n.ff-body .ff-body .modal-footer:before,\n.ff-body .ff-body .modal-footer:after {\n  content: \" \";\n  display: table;\n}\n.ff-body .clearfix:after,\n.ff-body .dl-horizontal dd:after,\n.ff-body .container:after,\n.ff-body .container-fluid:after,\n.ff-body .row:after,\n.ff-body .form-horizontal .form-group:after,\n.ff-body .btn-toolbar:after,\n.ff-body .btn-group-vertical > .btn-group:after,\n.ff-body .nav:after,\n.ff-body .navbar:after,\n.ff-body .navbar-header:after,\n.ff-body .navbar-collapse:after,\n.ff-body .pager:after,\n.ff-body .panel-body:after,\n.ff-body .modal-header:after,\n.ff-body .modal-footer:after,\n.ff-body .ff-body .dl-horizontal dd:after,\n.ff-body .ff-body .container:after,\n.ff-body .ff-body .container-fluid:after,\n.ff-body .ff-body .row:after,\n.ff-body .ff-body .form-horizontal .form-group:after,\n.ff-body .ff-body .btn-toolbar:after,\n.ff-body .ff-body .btn-group-vertical > .btn-group:after,\n.ff-body .ff-body .nav:after,\n.ff-body .ff-body .navbar:after,\n.ff-body .ff-body .navbar-header:after,\n.ff-body .ff-body .navbar-collapse:after,\n.ff-body .ff-body .pager:after,\n.ff-body .ff-body .panel-body:after,\n.ff-body .ff-body .modal-header:after,\n.ff-body .ff-body .modal-footer:after {\n  clear: both;\n}\n.ff-toolbar {\n  border: none;\n  box-sizing: border-box;\n  border-radius: 50px;\n  background-color: rgba(0, 0, 0, 0.85);\n}\n.ff-toolbar ul {\n  display: block;\n  margin: 0;\n  padding: 0;\n}\n.ff-toolbar ul:after {\n  clear: both;\n  content: \"\";\n  display: table;\n}\n.ff-toolbar ul li {\n  float: left;\n  list-style: none;\n  margin: 0;\n  padding: 0;\n}\n.ff-toolbar ul li a:hover,\n.ff-toolbar ul li a:active,\n.ff-toolbar ul li a:focus {\n  text-decoration: none;\n}\n.ff-toolbar ul li a {\n  display: block;\n  cursor: pointer;\n  font-size: 1em;\n  line-height: 1em;\n  background-color: transparent;\n  color: #fff;\n  margin: 12px 10px;\n  text-decoration: none;\n}\n.ff-toolbar ul li a:hover {\n  color: #3bafda;\n}\n.ff-toolbar ul li.active a {\n  color: #3bafda;\n}\n.ff-toolbar ul li:first-child {\n  padding-left: 15px;\n}\n.ff-toolbar ul li:last-child {\n  padding-right: 15px;\n}\n.ff-toolbar.ff-toolbar-vertical ul li {\n  float: initial;\n}\n.ff-toolbar.ff-toolbar-vertical ul li a {\n  margin: 15px 14px;\n}\n.ff-toolbar.ff-toolbar-vertical ul li:first-child {\n  padding-top: 10px;\n  padding-left: 0;\n}\n.ff-toolbar.ff-toolbar-vertical ul li:last-child {\n  padding-bottom: 10px;\n  padding-right: 0;\n}\n", ""]);
	
	// exports


/***/ },

/***/ 83:
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

/***/ 84:
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

/***/ 85:
/***/ function(module, exports, __webpack_require__) {

	var xmodal = __webpack_require__(79);
	var Part = __webpack_require__(72);
	
	function getCaretPosition(editableDiv) {
	  var caretPos = 0,
	    sel, range;
	  if (window.getSelection) {
	    sel = window.getSelection();
	    if (sel.rangeCount) {
	      range = sel.getRangeAt(0);
	      if (range.commonAncestorContainer.parentNode == editableDiv) {
	        caretPos = range.endOffset;
	      }
	    }
	  } else if (document.selection && document.selection.createRange) {
	    range = document.selection.createRange();
	    if (range.parentElement() == editableDiv) {
	      var tempEl = document.createElement("span");
	      editableDiv.insertBefore(tempEl, editableDiv.firstChild);
	      var tempRange = range.duplicate();
	      tempRange.moveToElementText(tempEl);
	      tempRange.setEndPoint("EndToEnd", range);
	      caretPos = tempRange.text.length;
	    }
	  }
	  return caretPos;
	}
	
	function HTMLPart(el) {
	  Part.call(this, el);
	  
	  var id = this.id();
	  var part = this;
	  var el = this.element();
	  var original = el.innerHTML;
	  
	  part.toolbar().add({
	    text: '<i class="fa fa-pencil"></i>',
	    fn: function(e) {
	      xmodal.open(__webpack_require__(86), function(err, modal) {
	        if( err ) return xmodal.error(err);
	        
	        var form = modal.body.querySelector('form');
	        form.html.value = el.innerHTML || '';
	        form.onsubmit = function(e) {
	          e.preventDefault();
	          el.innerHTML = part.data.html = form.html.value;
	          modal.close();
	        };
	      });
	    }
	  });
	  
	  part.on('click', function(e) {
	    part.highlighter().hide();
	    el.setAttribute('contenteditable', 'true');
	    el.click();
	  })
	  .on('blur', function(e) {
	    el.setAttribute('contenteditable', 'false');
	  })
	  .on('modechange', function(e) {
	    if( !part.editmode ) 
	      el.setAttribute('contenteditable', 'false');
	  })
	  .on('update', function(e) {
	    //console.error('update', id, e.detail.prev, e.detail.data);
	    var data = part.data();
	    el.innerHTML = (data && data.html) || original;
	  })
	  .on('click', function(e) {
	    this._range = window.getSelection().getRangeAt(0);
	  })
	  .on('close', function() {
	    //console.log('close', id);
	    el.setAttribute('contenteditable', 'false');
	    el.onkeyup = null;
	  });
	  
	  el.onkeyup = function() {
	    this._range = window.getSelection().getRangeAt(0);
	  };
	  
	  if( part.data && 'html' in part.data ) {
	    el.innerHTML = part.data().html;
	  }
	};
	
	var fn = HTMLPart.prototype = new Part;
	
	fn.range = function() {
	  var el = this.element();
	  var range = this._range;
	  if( range && el.contains(range.startContainer) && el.contains(range.endContainer) ) return range;
	  return null;
	};
	
	var tmp;
	fn.insert = function(html) {
	  if( !html ) return this;
	  var el = this.element();
	  var range = this.range();
	  
	  if( !tmp ) tmp = document.createElement('div');
	  tmp.innerHTML = html;
	  
	  [].forEach.call(tmp.childNodes || [], function(node) {
	    if( range ) range.insertNode(node);
	    else el.appendChild(node);
	  });
	  
	  return this;
	};
	
	module.exports = HTMLPart;

/***/ },

/***/ 86:
/***/ function(module, exports) {

	module.exports = "<div class=\"ff-body\">\n  <form>\n    <div class=\"panel m0\">\n      <div class=\"panel-heading\">\n        <h3 class=\"panel-title\">소스코드</h3>\n      </div>\n      <div class=\"panel-body\">\n        <textarea name=\"html\" class=\"form-control\" style=\"height: 400px;\"></textarea>\n      </div>\n      <div class=\"panel-footer\">\n        <div class=\"row\">\n          <div class=\"col-md-6\"></div>\n          <div class=\"col-md-6 text-right\">\n            <button type=\"button\" class=\"btn btn-default\" modal-close>취소</button>\n            <button type=\"submit\" class=\"btn btn-primary\">적용</button>\n          </div>\n        </div>\n      </div>\n    </div>\n  </form>\n</div>\n";

/***/ },

/***/ 87:
/***/ function(module, exports, __webpack_require__) {

	var xmodal = __webpack_require__(79);
	var Part = __webpack_require__(72);
	
	module.exports = function ImagePart(el) {
	  Part.call(this, el);
	};

/***/ },

/***/ 88:
/***/ function(module, exports) {

	module.exports = {
	  load: function(url, done) {
	    done();
	  }
	}

/***/ }

/******/ })
});
;
//# sourceMappingURL=firefront.js.map