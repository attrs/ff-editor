var getPosition = require('./position.js');

function isin(el, x, y) {
  var position = getPosition(el);
  return false;
}

var current;
function update(e) {
  var x = e.pageX, y = e.pageY;
  var prev = current;
  
  if( prev && !isin(current.el, x, y) && prev.listeners.leave ) {
    prev.listeners.leave.forEach(function(fn) {
      fn.call(prev.el, e);
    });
  }
  
  targets.forEach(function(target) {
    if( isin(target.el, x, y) ) {
      current = target;
      
      if( prev !== target && target.listeners.enter ) {
        target.listeners.enter.forEach(function(fn) {
          fn.call(target.el, e);
        });
      }
      
      if( e.type === 'click' && target.listeners.click ) {
        target.listeners.click.forEach(function(fn) {
          fn.call(target.el, e);
        });
      }
    }
  });
};

document.addEventListener('mousemove', update, false);
document.addEventListener('mouseenter', update, false);
document.addEventListener('click', update, false);

var targets = [];
module.exports = function(el) {
  var listeners = {};
  
  targets.push({
    el: el,
    listeners: listeners
  });
  
  return {
    enter: function(fn) {
      listeners.enter = listeners.enter || [];
      listeners.enter.push(fn);
      return this;
    },
    leave: function() {
      listeners.leave = listeners.leave || [];
      listeners.leave.push(fn);
      return this;
    },
    click: function() {
      listeners.click = listeners.click || [];
      listeners.click.push(fn);
      return this;
    }
  }
};