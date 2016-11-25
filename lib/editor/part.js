var Types = require('./types.js');
var Highlighter = require('./highlighter.js');
var Toolbar = require('./toolbar.js');
var Events = require('./events.js');
var MouseObserver = require('./mouseobserver.js');
var xmodal = require('x-modal');

require('object.observe');

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
  var ostyle = el.getAttribute('style');
  var ocls = el.className;
  var original = el.innerHTML;
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
  
  emitter.on('update', function(e) {
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
    } else {
      this.restoreDefaults();
    }
    
    emitter.emit('render', {
      type: 'update',
      originalEvent: e
    });
  })
  .on('modechange', function(e) {
    emitter.emit('render', {
      type: 'modechange',
      originalEvent: e
    });
  })
  .on('close', function(e) {
    this.restoreDefaults();
    
    emitter.emit('render', {
      type: 'close',
      originalEvent: e
    });
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
  this._defaults = original;
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
    
    if( prev !== data ) {
      this._emitter.emit('update', {
        prev: prev,
        data: data
      });
      
      if( prev && this._dataobserve ) Object.unobserve(prev, this._dataobserve);
      if( data ) {
        var self = this;
        this._dataobserve = function(changes) {
          self._emitter.emit('update', {
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
    this._defaults = defaults || '';
    return this;
  },
  restoreDefaults: function() {
    this.element().innerHTML = this._defaults || '';
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
  focus: function() {
    return this;
  },
  close: function() {
    this.restoreDefaults();
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