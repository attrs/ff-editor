var context = require('./context.js');
var Events = require('tinyevent');
var Types = require('./types.js');
var Toolbar = require('./toolbar.js');
var $ = require('tinyselector');

//var Highlighter = require('./highlighter.js');
//var MouseObserver = require('./mouseobserver.js');

var focused, currentRange;
$(document).on('mouseup', function(e) {
  var part = context.getPart(e.target);
  var isToolbar = $(e.target).parent('.ff-toolbar')[0];
  if( isToolbar ) {
    setTimeout(function() {
      context.setRange(currentRange);
      e.preventDefault();
      e.stopPropagation();
    }, 0);
    return;
  }
  
  if( part ) part.focus();
  else if( focused && typeof focused.blur == 'function' ) {
    focused.blur();
  }
  
  var range = context.getRange();
  if( range ) currentRange = range;
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
    $(el).addClass('ff-enter-state');
    //console.log('enter', el);
    //if( this.editmode() ) this.highlighter().show();
  })
  .on('mousedown', function(e) {
    this.toolbar().update();
  })
  .on('mousemove', function(e) {
    this.toolbar().update();
  })
  .on('mouseleave', function(e) {
    $(el).removeClass('ff-enter-state');
    //console.log('leave', el);
    //if( this.editmode() ) this.highlighter().hide();
  })
  .on('focus', function(e) {
    $(el).addClass('ff-focus-state');
    if( this.editmode() ) this.toolbar().show();
  })
  .on('blur', function(e) {
    $(el).removeClass('ff-focus-state');
    if( this.editmode() ) {
      //this.highlighter().hide();
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
    var type = e.type;
    var name = 'on' + type;
    
    if( typeof this.handleEvent == 'function' ) this.handleEvent(e);
    if( typeof this[name] == 'function' ) this[name](e);
  });
  
  $(el)
  .on('click mouseup mousedown mouseenter mouseleave mousemove', dispatcher);
  
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
  
  if( context.editmode() ) this.editmode(true);
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
  var el = this.dom();
  if( el.parentNode ) el.parentNode.removeChild(el);
  return this;
};

proto.editmode = function(b) {
  if( !arguments.length ) return !!this._editmode;
  var prev = this._editmode;
  var editmode = this._editmode = !!b;
  
  if( editmode !== prev ) this._dispatcher.fire('modechange', {editmode: editmode});
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
  if( this._data !== data ) this._dispatcher.fire('update', {prev: this._data, data: data});
  this._data = data;
  this.setData(data);
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
  this._dispatcher.fire('clear');
  return this;
};

proto.focus = function() {
  if( this !== focused ) {
    if( focused && typeof focused.blur == 'function' ) focused.blur();
    this._dispatcher.fire('focus');
    focused = this;
  }
  return this;
};

proto.blur = function() {
  if( this === focused ) {
    this._dispatcher.fire('blur');
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

proto.insert = function(nodes, ranged) {
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
    return console.error('[firefront] Part.insert: illegal arguments', nodes);
  }
  
  var self = this;
  if( range ) range.deleteContents();
  
  
  [].forEach.call(nodes, function(node) {
    if( !node ) return;
    if( node instanceof Part ) {
      node = node.dom();
    }
    
    if( range ) range.insertNode(node);
    else el.appendChild(node);
  });
  
  this._dispatcher.fire('insert', {
    range: range,
    nodes: nodes
  });
  
  return this;
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