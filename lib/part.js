var $ = require('./selector.js');
var Types = require('./types.js');
var Remarker = require('./remarker.js');
var Events = require('./events.js');
var mouseobserver = require('./mouseobserver.js');
var xmodal = require('x-modal');
var observejs = require('observe-js');
var ObjectObserver = observejs.ObjectObserver;

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
      setdata(d);
    },
    get remarker() {
      return remarker;
    },
    get editmode() {
      return editmode;
    },
    set editmode(b) {
      if( editmode !== !!b ) emitter.emit('modechange', {editmode:editmode});
      editmode = !!b;
    },
    check: function() {
      observer && observer.deliver();
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
    config: function() {
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
      emitter.emit('focus');
      return this;
    },
    close: function() {
      mo.disconnect();
      observer && observer.close();
      emitter.emit('close');
      return this;
    }
  };
  
  var emitter = Events(part);
  var remarker = Remarker(part, emitter);
  var editmode = false;
  var data, observer;
  
  var setdata = function(d) {
    if( data !== d ) {
      data = d || {};
      emitter.emit('update', {data: data});
      observer && observer.close();
      observer = new ObjectObserver(data);
      observer.open(function(added, removed, changed, getOldValueFn) {
        emitter.emit('update', {data: data});
      });
      
      if( data.style ) el.setAttribute('style', data.style);
      else el.removeAttribute('style');
      el.className = ocls + ' ' + (data.cls || '');
    }
  };
  setdata({});
  
  var Type = Types.get(type);
  Type.call(part);
  
  var mo = mouseobserver(el)
  .move(function(e) {
    //emitter.emit('reposition');
  })
  .enter(function(e) {
    emitter.emit('enter');
  })
  .leave(function(e) {
    emitter.emit('leave');
  })
  .click(function(e) {
    part.focus();
  });
  
  return part;
}

module.exports = Part;