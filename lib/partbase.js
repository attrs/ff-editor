var context = require('./context.js');
var Events = require('tinyevent');
var Types = require('./types.js');
var Highlighter = require('./highlighter.js');
var Toolbar = require('./toolbar.js');
var MouseObserver = require('./mouseobserver.js');

var CAMEL_MAP = {
  modechange: 'modeChange',
  attributechange: 'attributeChange'
};

function camelcase(value) {
  if( !value ) return '';
  value = CAMEL_MAP[value] || value;
  return value[0].toUpperCase() + value.substring(1) || '';
}

function PartBase(el) {
  if( !el ) el = this.create();
  if( !context.isElement(el) ) el = this.create(el);
  if( !context.isElement(el) ) throw new TypeError('illegal argument: el');
  if( el.__ff__ ) return el.__ff__;
  el.__ff__ = this;
  
  var dispatcher = Events(this);
  var highlighter = Highlighter(el);
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
  
  dispatcher.on('click', function(e) {
    if( this.editmode() ) this.toolbar().show();
  })
  .on('enter', function(e) {
    //console.log('enter', el);
    //if( this.editmode() ) this.highlighter().show();
  })
  .on('leave', function(e) {
    //console.log('leave', el);
    //if( this.editmode() ) this.highlighter().hide();
  })
  .on('focus', function(e) {
    if( this.editmode() ) this.toolbar().show();
  })
  .on('blur', function(e) {
    if( this.editmode() ) {
      this.highlighter().hide();
      this.toolbar().hide();
    }
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
  .on('*', function(e) {
    if( !e.type ) return;
    var type = e.type;
    var name = 'on' + type;
    var camel = 'on' + camelcase(type);
    
    if( typeof this.handleEvent == 'function' ) this.handleEvent(e);
    if( typeof this[name] == 'function' ) this[name](e);
    if( typeof this[camel] == 'function' ) this[camel](e);
  });
  
  MouseObserver(el)
  .enter(function(e) {
    dispatcher.fire('enter', e);
  })
  .leave(function(e) {
    dispatcher.fire('leave', e);
  })
  .click(function(e) {
    dispatcher.fire('click', e);
  })
  .focus(function(e) {
    dispatcher.fire('focus', e);
  })
  .blur(function(e) {
    dispatcher.fire('blur', e);
  });
  
  this._data = null;
  this._dom = el;
  this._dispatcher = dispatcher;
  this._toolbar = toolbar;
  this._highlighter = highlighter;
  
  dispatcher.fire('init');
  
  if( context.editmode() ) this.editmode(true);
}

PartBase.prototype = {
  context: function() {
    return context;
  },
  toolbar: function() {
    return this._toolbar;
  },
  highlighter: function() {
    return this._highlighter;
  },
  dom: function() {
    return this._dom;
  },
  create: function(arg) {
    var el = document.createElement('div');
    
    if( typeof arg === 'string' ) {
      el.innerHTML = arg;
    }
    
    return el;
  },
  remove: function() {
    var el = this.dom();
    if( el.parentNode ) el.parentNode.removeChild(el);
    return this;
  },
  editmode: function(b) {
    if( !arguments.length ) return !!this._editmode;
    var prev = this._editmode;
    var editmode = this._editmode = !!b;
    
    if( editmode !== prev ) this._dispatcher.fire('modechange', {editmode: editmode});
    return this;
  },
  getData: function() {
    return this._data;
  },
  setData: function(data) {
    return this;
  },
  data: function(data) {
    if( !arguments.length ) return this.getData();
    if( this._data !== data ) this._dispatcher.fire('update', {prev: this._data, data: data});
    this._data = data;
    this.setData(data);
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
  clear: function() {
    this.setData(null);
    this.fire('clear');
    return this;
  },
  focus: function() {
    this.fire('focus');
    return this;
  },
  range: function() {
    var el = this.dom();
    var range = this.context().getRange();
    if( range && el.contains(range.startContainer) && el.contains(range.endContainer) ) return range;
    
    return null;
  },
  insert: function(nodes, ranged) {
    if( !nodes ) return this;
    var el = this.dom();
    var range = ranged ? this.range() : null;
    
    if( typeof nodes === 'object' && typeof nodes.length !== 'number' ) {
      nodes = [nodes];
    } else if( typeof nodes === 'string' ) {
      var tmp = document.createElement('div');
      tmp.innerHTML = nodes;
      nodes = tmp.childNodes;
    } else {
      return console.error('[firefront] PartBase.insert: illegal arguments', nodes);
    }
    
    var self = this;
    if( range ) range.deleteContents();
    
    
    [].forEach.call(nodes, function(node) {
      if( !node ) return;
      if( node instanceof PartBase ) {
        node = node.dom();
        console.log('node', node);
      }
      
      if( range ) range.insertNode(node);
      else el.appendChild(node);
    });
    
    this._dispatcher.fire('insert', {
      range: range,
      nodes: nodes
    });
    
    return this;
  }
  
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
    var range = PartBase.getRange();
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
}

module.exports = PartBase;