var $ = require('tinyselector');
var getOffsetTop = require('./offsettop.js');
var components = require('./components.js');

require('./marker.less');

function Marker(part) {
  var el = $(part.dom());
  var marker = $('<div class="ff-marker"><div class="ff-marker-head"></div><div class="ff-marker-tools"></div></div>');
  var currentIndex;
  
  var update = function() {
    var tools = marker.find('.ff-marker-tools').empty();
    components.forEach(function(item) {
      if( !item || !item.text ) return;
      $('<a class="ff-marker-tools-item"></a>')
      .html(item.text)
      .appendTo(tools);
    });
  };
  
  var move = function(target, y) {
    if( !target ) return;
    
    if( y < getOffsetTop(target) + (target.offsetHeight / 2) ) {
      marker.insertBefore(target);
    } else {
      marker.insertAfter(target);
    }
  };
  
  var hide = function() {
    marker.remove();
  };
  
  var current = function(target) {
    if( target === el || target === marker ) return;
    var children = el.children();
    var current;
    children.each(function() {
      if( this.contains(target) ) current = this;
    });
    
    return current;
  }
  
  marker.find('.ff-marker-head').on('click', function() {
    update();
    marker.tc('ff-marker-open');
  });
  
  el.on('click', function(e) {
    if( !marker[0].contains(e.target) ) marker.rc('ff-marker-open');
  });
  
  el.on('mousemove', function(e) {
    if( part.editmode() ) {
      return move(current(e.target), e.pageY);
    }
    
    hide();
  });
  
  this.currentIndex = function() {
    return currentIndex;
  };
}

module.exports = Marker;