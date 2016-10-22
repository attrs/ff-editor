var $ = require('./selector.js');
var Types = require('./types.js');
var Remarker = require('./remarker.js');
var Events = require('./events.js');
var mouseobserver = require('./mouseobserver.js');
var xmodal = require('x-modal');
var observejs = require('observe-js');

function Part(el) {
  var id = el.getAttribute('ff-id');
  var type = el.getAttribute('ff-type');
  var ostyle = el.style;
  var ocls = el.className;
  type = type || (el.tagName === 'IMG' ? 'image' : 'html');
  
  if( !id ) throw new Error('missing ff-id');
  if( !Types.exists(type) ) throw new Error('not defined type:' + type);
  
  var part = {
    get id() {
      return id;
    },
    get element() {
      return el;
    },
    get type() {
      return type;
    },
    get data() {
      return data;
    },
    set data(d) {
      applydata(d);
    },
    get remarker() {
      return remarker;
    },
    get toolbar() {
      return remarker.toolbar;
    },
    on: function(type, fn) {
      emitter.on(type, fn);
      return this;
    },
    once: function(type, fn) {
      emitter.once(type, fn);
      return this;
    },
    off: function(type, fn) {
      emitter.off(type, fn);
      return this;
    },
    editmode: function(b) {
      if( !arguments.length ) b = true;
      b = !!b;
      editmode = b;
      if( editmode !== b ) emitter.emit('modechange', {editmode:editmode});
      return this;
    },
    config: function() {
      xmodal.open(require('./html/config.html'), function(err, modal) {
        if( err ) return xmodal.error(err);
        
        var form = modal.body.querySelector('#form');
        form.onsubmit = function(e) {
          e.preventDefault();
          part.data.html = form.style.value || '';
        };
      });
      return this;
    },
    focus: function() {
      remarker.highlight();
      emitter.focus();
      return this;
    },
    close: function() {
      mo.disconnect();
      observer && observer.close();
      emitter.emit('close');
      return this;
    }
  };
  
  var Type = Types.get(type);
  var instance = new Type();
  var emitter = Events(el);
  var remarker = Remarker(part, emitter);
  var editmode = false;
  var data, observer;
  
  var applydata = function(d) {
    if( data !== d ) {
      data = d || {};
      emitter.emit('update', {data: data});
      observer && observer.close();
      observer = new ObjectObserver(data);
      observer.open(function(added, removed, changed, getOldValueFn) {
        emitter.emit('update', {data: data});
      });
      
      if( data.style ) element.style = ostyle + data.style;
      if( data.cls ) element.className = ocls + ' ' + data.cls;
    }
  };
  applydata();
  
  var mo = mouseobserver(el).enter(function(e) {
    emitter.emit('enter');
  })
  .leave(function(e) {
    emitter.emit('leave');
  })
  .click(function(e) {
    part.focus();
  });
  
  emitter.on('enter', function(e) {
    if( editmode ) remarker.show();
  });
  
  return part;
}

module.exports = Part;