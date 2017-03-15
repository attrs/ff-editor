var context = require('./context.js');
var Events = require('tinyevent');
var Types = require('./types.js');
var Toolbar = require('./toolbar/');
var $ = require('tinyselector');

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
  if( el && el.__ff__ ) return el.__ff__;
  if( !(this instanceof Part) ) return null;
  if( !el ) el = this.create();
  if( !context.isElement(el) ) el = this.create(el);
  if( !context.isElement(el) ) throw new TypeError('illegal argument: el');
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
    if( e.defaultPrevented ) return;
    if( !this.editmode() ) return;
    
    $(el).ac('ff-enter-state');
  })
  .on('mousedown', function(e) {
    if( e.defaultPrevented ) return;
    if( !this.editmode() ) return;
    
    this.toolbar().update();
  })
  .on('mousemove', function(e) {
    if( e.defaultPrevented ) return;
    if( !this.editmode() ) return;
    
    this.toolbar().update();
  })
  .on('mouseleave', function(e) {
    if( e.defaultPrevented ) return;
    if( !this.editmode() ) return;
    
    $(el).removeClass('ff-enter-state');
  })
  .on('focus', function(e) {
    if( e.defaultPrevented ) return;
    if( !this.editmode() ) return;
    
    $(el).ac('ff-focus-state');
    this.toolbar().show();
  })
  .on('blur', function(e) {
    if( e.defaultPrevented ) return;
    if( !this.editmode() ) return;
    
    $(el).rc('ff-focus-state');
    this.toolbar().hide();
  })
  .on('update', function(e) {
    if( e.defaultPrevented ) return;
    
    dispatcher.fire('render', {
      type: 'update',
      originalEvent: e
    });
  })
  .on('modechange', function(e) {
    if( e.defaultPrevented ) return;
    
    dispatcher.fire('render', {
      type: 'modechange',
      originalEvent: e
    });
  })
  .on('dragstart', function(e) {
    if( e.defaultPrevented ) return;
    
    if( !this.editmode() ) return;
    
    if( e.target === el ) {
      this.blur();
      context.dragging = this;
      $(el).ac('ff-dragging');
    }
  })
  .on('dragend', function(e) {
    if( e.defaultPrevented ) return;
    
    if( e.target === el ) {
      context.dragging = null;
      $(el).rc('ff-dragging');
    }
  })
  .on('*', function(e) {
    if( e.defaultPrevented ) return;
    
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
        if( mutation.type == 'attributes' ) {
          dispatcher.fire('attr', {
            name: mutation.attributeName,
            old: mutation.oldValue,
            value: el.getAttribute(mutation.attributeName)
          });
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

var proto = Part.prototype = {};

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

proto.click = function() {
  this.dom().click();
};

proto.focus = function() {
  if( this !== focused ) {
    if( focused && typeof focused.blur == 'function' ) focused.blur();
    this.fire('focus');
    focused = this;
  }
};

proto.blur = function() {
  if( this === focused ) {
    this.fire('blur');
    focused = null;
  }
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