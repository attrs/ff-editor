var Types = require('./types.js');
var Highlighter = require('./highlighter.js');
var Toolbar = require('./toolbar.js');
var Events = require('./events.js');
var MouseObserver = require('./mouseobserver.js');
var xmodal = require('x-modal');
require('object.observe');

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