var $ = require('tinyselector');
var Items = require('./items');

require('./marker.less');

function getOffsetTop(el) {
  var top = 0;
  do {
    if( !isNaN( el.offsetLeft ) ) top += el.offsetTop;
  } while( el = el.offsetParent );
  return top;
}

function Marker(part) {
  var el = $(part.dom());
  var marker = $('<div class="ff-marker"><div class="ff-marker-head"></div></div>');
  
  el.append(marker);
  
  var show = function(target, y) {
    if( !target ) return;
    marker.ac('ff-marker-active');
    
    var middleY = getOffsetTop(target) + (target.offsetHeight / 2);
    
    if( y < middleY ) {
      marker.insertBefore(target);
    } else {
      marker.insertAfter(target);
    }
  };
  
  var hide = function() {
    marker.rc('ff-marker-active');
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
  
  el.on('mousemove', function(e) {
    if( part.editmode() ) {
      return show(current(e.target), e.pageY);
    }
    
    hide();
  });
}


var items = Items();

Marker.items = items;
module.exports = Marker;