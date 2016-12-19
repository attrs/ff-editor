function EventObject(type, detail, target, cancelable) {
  this.type = type;
  this.detail = detail || {};
  this.target = this.currentTarget = target;
  this.cancelable = cancelable === true ? true : false;
  this.defaultPrevented = false;
  this.stopped = false;
  this.timeStamp = new Date().getTime();
}

EventObject.prototype = {
  preventDefault: function() {
    if( this.cancelable ) this.defaultPrevented = true;
  },
  stopPropagation: function() {
    this.stopped = true;
  },
  stopImmediatePropagation: function() {
    this.stoppedImmediate = true;
  }
};

EventObject.createEvent = function(type, detail, target, cancelable) {
  return new EventObject(type, detail, target, cancelable);
};


module.exports = function(scope) {
  var listeners = {}, paused = false;
  
  var on = function(type, fn) {
    if( !type || typeof type !== 'string' ) return console.error('[firefront] type must be a string');
    if( typeof fn !== 'function' ) return console.error('[firefront] listener must be a function');
    
    var types = type.split(' ');
    types.forEach(function(type) {
      listeners[type] = listeners[type] || [];
      listeners[type].push(fn);
    });
    
    return this;
  };
  
  var once = function(type, fn) {
    if( !type || typeof type !== 'string' ) return console.error('[firefront] type must be a string');
    if( typeof fn !== 'function' ) return console.error('[firefront] listener must be a function');
    
    var types = type.split(' ');
    types.forEach(function(type) {
      var wrap = function(e) {
        body.off(type, wrap);
        return fn.call(this, e);
      };
      body.on(type, wrap);
    });
    
    return this;
  };
  
  var off = function(type, fn) {
    if( !type || typeof type !== 'string' ) return console.error('[firefront] type must be a string');
    if( typeof fn !== 'function' ) return console.error('[firefront] listener must be a function');
    
    var types = type.split(' ');
    types.forEach(function(type) {
      var fns = listeners[type];
      if( fns ) for(var i;~(i = fns.indexOf(fn));) fns.splice(i, 1);
    });
    
    return this;
  };
  
  var dispatch = function(type, detail) {
    if( paused ) return;
    var typename = (type && type.type) || type;
    if( !listeners[typename] && !listeners['*'] ) return;
    
    var event;
    if( typeof type === 'string' ) {
      event = EventObject.createEvent(type, detail, scope);
    } else if( type instanceof EventObject ) {
      event = type;
    } else {
      return console.error('illegal arguments, type is must be a string or event', type);
    }
    event.currentTarget = scope;
    
    var stopped = false, prevented = false;
    var action = function(listener) {
      if( stopped ) return;
      listener.call(scope, event);
      if( event.defaultPrevented === true ) prevented = true;
      if( event.stopped === true ) stopped = true;
      if( event.stoppedImmediate === true ) stopped = true;
    };
    
    (listeners['*'] || []).slice().reverse().forEach(action);
    (listeners[event.type] || []).slice().reverse().forEach(action);
    
    return !prevented;
  };
  
  var has = function(type) {
    if( typeof type === 'function' ) {
      var found = false;
      listeners.forEach(function(fn) {
        if( found ) return;
        if( fn === type ) found = true;
      });
      return found;
    }
    return listeners[type] && listeners[type].length ? true : false;
  };
  
  var destroy = function() {
    listeners = null;
    return this;
  };
  
  var pause = function() {
    paused = true;
    return this;
  };
  
  var resume = function() {
    paused = false;
    return this;
  };
  
  return {
    on: on,
    once: once,
    off: off,
    dispatch: dispatch,
    has: has,
    destroy: destroy,
    pause: pause,
    resume: resume
  };
};