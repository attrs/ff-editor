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
  if( !isElement(el) ) throw new TypeError('Argument element must be an element');
  
  var id = el.getAttribute('ff-id');
  var ostyle = el.style;
  var original = el.innerHTML;
  var ocls = el.className;
  var emitter = Events(this);
  var highlighter = Highlighter(el);
  var editmode = false;
  var data;
  var self = this;
  var toolbar = Toolbar({
    group: 'part',
    cls: 'ff-part-toolbar',
    get owner() {
      return self;
    },
    target: el
  }).add({
    text: '<i class="fa fa-gear"></i>',
    fn: function(e) {
      self.config();
    }
  });
  
  document.body.appendChild(toolbar.element);
  
  emitter.on('update', function() {
    if( !data ) el.innerHTML = original;
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
    if( !editmode ) return;
    if( !isenter(e.target) ) return;
    highlighter.show();
    emitter.emit('enter');
  })
  .leave(function(e) {
    if( !editmode ) return;
    highlighter.hide();
    emitter.emit('leave');
  })
  .click(function(e) {
    if( !editmode ) return;
    if( !isenter(e.target) ) return;
    emitter.emit('click');
  })
  .focus(function(e) {
    if( !editmode ) return;
    if( !isenter(e.target) ) return;
    toolbar.show();
    emitter.emit('focus');
  })
  .blur(function(e) {
    if( !editmode ) return;
    toolbar.hide();
    highlighter.hide();
    emitter.emit('blur');
  });
  
  Object.defineProperties(this, {
    _emitter: {
      get: function() {
        return emitter;
      }
    },
    _mouseobserver: {
      get: function() {
        return mouseobserver;
      }
    },
    id: {
      get: function() {
        return id;
      }
    },
    original: {
      get: function() {
        return original;
      }
    },
    element: {
      get: function() {
        return el;
      }
    },
    toolbar: {
      value: function() {
        return toolbar;
      }
    },
    highlighter: {
      get: function() {
        return highlighter;
      }
    },
    editmode: {
      get: function() {
        return editmode;
      },
      set: function(b) {
        var prev = editmode;
        editmode = !!b;
        
        if( editmode !== prev ) emitter.emit('modechange', {editmode:editmode});
        if( !editmode ) {
          toolbar.hide();
          highlighter.hide();
        }
      }
    },
    data: {
      get: function() {
        return data;
      },
      set: function(value) {
        if( value !== undefined && typeof value !== 'object' ) throw new TypeError('data must be an object');
        data = value || null;
        if( !data ) this.defaults();
      }
    }
  });
}

Part.prototype = {
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
  edit: function(b) {
    if( !arguments.length ) b = true;
    this.editmode = !!b;
    return this;
  },
  defaults: function() {
    this.element.innerHTML = this.original || '';
  },
  config: function() {
    var data = this.data;
    var el = this.element;
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
  update: function(data) {
    var prev = this.data || null;
    this.data = data || null;
    if( prev !== data ) this._emitter.emit('update', {
      prev: prev,
      data: data
    });
    return this;
  },
  focus: function() {
    return this;
  },
  close: function() {
    this.defaults();
    this._mouseobserver.disconnect();
    this.toolbar().hide();
    this.highlighter.hide();
    this._emitter.emit('close');
    return this;
  }
}

Part.isElement = isElement;
Part.types = Types;

module.exports = Part;