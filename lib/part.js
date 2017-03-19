var context = require('./context.js');
var Events = require('tinyevent');
var Types = require('./types.js');
var Toolbar = require('./toolbar/');
var $ = require('tinyselector');

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
  else if( focused && typeof focused.blur == 'function' ) focused.blur();
});

function Part(dom) {
  if( dom && dom.__ff__ ) return dom.__ff__;
  if( !(this instanceof Part) ) return null;
  if( !dom ) dom = this.create();
  if( !context.isElement(dom) ) dom = this.create(dom);
  if( !context.isElement(dom) ) throw new TypeError('illegal argument: dom');
  dom.__ff__ = this;
  
  var el = $(dom).addClass('ff ff-part');
  
  var dispatcher = Events(this);
  var self = this;
  
  var toolbar = new Toolbar(this, {
    position: 'top center',
    group: 'part',
    cls: 'ff-part-toolbar'
  });
  
  if( dom !== arguments[0] ) {
    toolbar.last({
      text: '<i class="fa fa-remove"></i>',
      fn: function(e) {
        self.remove();
      }
    });
  }
  
  dispatcher
  .on('focus', function(e) {
    if( e.defaultPrevented || !this.editmode() ) return;
    
    el.ac('ff-focus-state');
    this.toolbar().show();
  })
  .on('blur', function(e) {
    if( e.defaultPrevented || !this.editmode() ) return;
    
    el.rc('ff-focus-state');
    this.toolbar().hide();
  })
  .on('data', function(e) {
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
  .on('mousedown', function(e) {
    if( !self.editmode() ) return;
  
    self.toolbar().update();
  })
  .on('mouseleave', function(e) {
    if( !self.editmode() ) return;
  
    el.removeClass('ff-enter-state');
  })
  .on('dragstart', function(e) {
    if( !self.editmode() ) return;
    
    if( e.target === dom ) {
      self.blur();
      context.dragging = dom;
      el.ac('ff-dragging');
    }
  })
  .on('dragend', function(e) {
    if( e.target === dom ) {
      context.dragging = null;
      el.rc('ff-dragging');
    }
  });
  
  this._data = null;
  this._dom = dom;
  this._dispatcher = dispatcher;
  this._toolbar = toolbar;
  
  var observer;
  setTimeout(function() {
    observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if( mutation.type == 'attributes' ) {
          dispatcher.fire('attr', {
            name: mutation.attributeName,
            old: mutation.oldValue,
            value: dom.getAttribute(mutation.attributeName)
          });
        } else if( mutation.type == 'childList' ) {
          dispatcher.fire('childlist', {
            added: mutation.added,
            removed: mutation.removed
          });
        }
      });
    });
    
    observer.observe(dom, {
      attributes: true,
      attributeOldValue: true,
      childList: true
    });
  }, 1);
  
  dispatcher.fire('init');
  if( context.editmode() ) self.editmode(true);
}

var proto = Part.prototype = {};

proto.context = function() {
  return context;
};

proto.toolbar = function() {
  return this._toolbar;
};

proto.dom = function() {
  return this._dom;
};

proto.create = function(arg) {
  return $('<div />').html(arg)[0];
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
  this._data = data;
  this.fire('data', {old: this._data, data: data});
  return this;
};

proto.data = function(data) {
  return !arguments.length ? this.getData() : this.setData(data);
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