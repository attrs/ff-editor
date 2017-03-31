var Events = require('tinyevent');
var Types = require('./types.js');
var Toolbar = require('./toolbar/');
var $ = require('tinyselector');
var context = require('./context.js');

function Part(arg) {
  var dom = arg;
  if( dom && dom.__ff__ ) return dom.__ff__;
  if( !(this instanceof Part) ) return null;
  
  if( !dom || !$.util.isElement(dom) ) dom = this.create.apply(this, arguments);
  if( !$.util.isElement(dom) ) throw new TypeError('illegal arguments: dom');
  
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
      el.rc('ff-edit-state').rc('ff-focus-state').rc('ff-enter-state').rc('ff-dragging');
      dispatcher.fire('viewmode');
      self.blur();
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
      e.dataTransfer.setDragImage(el[0], 0, 0);
      e.dataTransfer.setData('text', target.outerHTML);
      el.ac('ff-dragging');
    }
  })
  .on('dragend', function(e) {
    if( !self.editmode() ) return;
    
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
  
  var toolbarposition = el.attr('ff-toolbar');
  if( toolbarposition === 'false' ) this.toolbar().enable(false);
  else if( toolbarposition ) this.toolbar().position(toolbarposition);
  
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
        this.remove();
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
  ranges: function(collapsed) {
    return context.ranges(this.dom(), collapsed);
  },
  range: function(collapsed) {
    return context.range(this.dom(), collapsed);
  }
};

module.exports = Part;