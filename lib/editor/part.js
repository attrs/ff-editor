var Types = require('./types.js');
var Highlighter = require('./highlighter.js');
var Toolbar = require('./toolbar.js');
var Events = require('./events.js');
var MouseObserver = require('./mouseobserver.js');
var xmodal = require('x-modal');
require('object.observe');

function Part(el) {
  if( !arguments.length ) return;
  if( typeof el === 'string' ) el = Part.evalElement(el);
  if( !Part.isElement(el) ) throw new TypeError('Argument element must be an element');
  
  var id = el.getAttribute('ff-id');
  var ostyle = el.getAttribute('style');
  var ocls = el.className;
  var defaults = {
    style: ostyle,
    cls: ocls,
    html: el.innerHTML
  };
  var dispatcher = Events(this);
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
  }).add({
    text: '<i class="fa fa-remove"></i>',
    fn: function(e) {
      self.clear();
    }
  });
  
  dispatcher.on('update', function(e) {
    var data = this.data();
    
    if( data ) {
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
    }
    
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
  });
  
  el.addEventListener('keyup', function(e) {
    dispatcher.dispatch('keyup', e);
  });
  
  el.addEventListener('keydown', function(e) {
    dispatcher.dispatch('keydown', e);
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
  this._dispatcher = dispatcher;
  this._element = el;
  this._defaults = defaults;
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
    
    if( editmode !== prev ) this.dispatch('modechange', {editmode: editmode});
    if( !editmode ) {
      this.toolbar().hide();
      this.highlighter().hide();
    }
    return this;
  },
  data: function(value, update) {
    if( !arguments.length ) return this._data;
    //console.log('update', this.id(), value);
    if( value !== undefined && typeof value !== 'object' ) throw new TypeError('data must be an object');
    var prev = this._data || null;
    var data = this._data = value || null;
    
    if( prev !== data ) {
      if( update !== false ) this.dispatch('update', {
        prev: prev,
        data: data
      });
      
      if( prev && this._dataobserve ) Object.unobserve(prev, this._dataobserve);
      if( data ) {
        var self = this;
        this._dataobserve = function(changes) {
          self._dispatcher.dispatch('update', {
            prev: prev,
            data: data,
            changes: changes
          });
        };
      
        Object.observe(data, this._dataobserve);
      }
    }
    
    return this;
  },
  defaults: function(defaults) {
    if( !arguments.length ) return this._defaults;
    
    var prev = this._defaults || {};
    if( typeof defaults === 'string' ) defaults = {html:defaults,cls:prev.cls,style:prev.style};
    if( typeof defaults !== 'object' ) return console.error('defaults must be an object but', defaults);
    
    this._defaults = defaults || this._defaults;
    return this;
  },
  restoreDefaults: function() {
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
  config: function() {
    var self = this;
    
    xmodal.open(require('./html/config.html'), function(err, modal) {
      if( err ) return xmodal.error(err);
      
      var data = self.data();
      
      var form = modal.body.querySelector('form');
      if( data && data.style ) form.style.value = data && data.style;
      if( data && data.cls ) form.cls.value = data && data.cls;
      
      form.onsubmit = function(e) {
        e.preventDefault();
        
        data = data || {};
        
        if( form.style.value ) data.style = form.style.value;
        else delete data.style;
        
        if( form.cls.value ) data.cls = form.cls.value;
        else delete data.cls;
        
        if( Object.keys(data).length ) self.data(data);
        
        modal.close();
      };
    });
    return this;
  },
  clear: function() {
    this.data(null);
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
    this.dispatch('destroy');
    this.restoreDefaults();
    this.dispatch('render', {
      type: 'destroy'
    });
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
  insert: function(nodes) {
    if( !nodes ) return this;
    var el = this.element();
    var range = this.range();
    
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
    typeof HTMLElement === 'object' ? o instanceof HTMLElement : node && typeof node === 'object' && node !== null && node.nodeType === 1 && typeof node.nodeName === 'string'
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