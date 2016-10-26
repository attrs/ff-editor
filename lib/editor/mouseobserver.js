var getPosition = require('./position.js');

function isin(el, x, y) {
  var p = getPosition(el);
  if( x >= p.left && x <= (p.left + p.width) && y >= p.top && y <= (p.top + p.height) ) return true;
  return false;
}

function remove(arr, item) {
  if( ~arr.indexOf(item) ) arr.splice(arr.indexOf(item), 1);
}

var targets = [], entered = [], focused;
function update(e) {
  var x = e.pageX, y = e.pageY;
  
  if( !x && !y ) return;
  
  MouseObserver.x = x;
  MouseObserver.y = y;
  
  var enter = false;
  targets.forEach(function(target) {
    if( isin(target.el, x, y) ) {
      enter = true;
      if( target.listeners.move ) {
        target.listeners.move.forEach(function(fn) {
          fn.call(target.el, e);
        });
      }
      
      if( !~entered.indexOf(target) && target.listeners.enter ) {
        entered.push(target);
        target.listeners.enter.forEach(function(fn) {
          fn.call(target.el, e);
        });
      }
      
      if( e.type === 'click' ) {
        if( target.listeners.click ) {
          target.listeners.click.forEach(function(fn) {
            fn.call(target.el, e);
          });
        }
        
        if( focused !== target ) {
          if( focused && focused.listeners.blur ) {
            focused.listeners.blur.forEach(function(fn) {
              fn.call(focused.el, e);
            });
          }
          
          focused = target;
          
          if( target.listeners.focus ) {
            target.listeners.focus.forEach(function(fn) {
              fn.call(target.el, e);
            });
          }
        }
      }
    } else {
      if( ~entered.indexOf(target) && target.listeners.leave ) {
        remove(entered, target);
        target.listeners.leave.forEach(function(fn) {
          fn.call(target.el, e);
        });
      }
    }
  });
  
  if( !enter && e.type == 'click' ) {
    if( focused && focused.listeners.blur ) {
      focused.listeners.blur.forEach(function(fn) {
        fn.call(focused.el, e);
      });
    }
    focused = null;
  }
};

document.addEventListener('mousemove', update, false);
document.addEventListener('mouseenter', update, false);
document.addEventListener('click', update, false);

var MouseObserver = function(el) {
  var listeners = {};
  var target = {
    el: el,
    listeners: listeners
  };
  
  targets.push(target);
  
  return {
    move: function(fn) {
      listeners.move = listeners.move || [];
      listeners.move.push(fn);
      return this;
    },
    focus: function(fn) {
      listeners.focus = listeners.focus || [];
      listeners.focus.push(fn);
      return this;
    },
    blur: function(fn) {
      listeners.blur = listeners.blur || [];
      listeners.blur.push(fn);
      return this;
    },
    enter: function(fn) {
      listeners.enter = listeners.enter || [];
      listeners.enter.push(fn);
      return this;
    },
    leave: function(fn) {
      listeners.leave = listeners.leave || [];
      listeners.leave.push(fn);
      return this;
    },
    click: function(fn) {
      listeners.click = listeners.click || [];
      listeners.click.push(fn);
      return this;
    },
    disconnect: function() {
      remove(targets, target);
      return this;
    }
  }
};

module.exports = MouseObserver;