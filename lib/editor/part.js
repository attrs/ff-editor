var Types = require('./types.js');
var Highlighter = require('./highlighter.js');
var Toolbar = require('./toolbar.js');
var Events = require('./events.js');
var MouseObserver = require('./mouseobserver.js');
var xmodal = require('x-modal');

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
    xmodal.open(require('./html/config.html'), function(err, modal) {
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