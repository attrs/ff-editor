var $ = require('tinyselector');
var getOffsetTop = require('./offsettop.js');
var components = require('./components.js');
var Button = require('../../toolbar/button.js');

require('./marker.less');

function Marker(part) {
  var el = $(part.dom());
  var marker = $('<div class="ff-marker"><div class="ff-marker-head"></div><div class="ff-marker-tools"></div></div>');
  var lastref;
  
  var update = function() {
    var tools = marker.find('.ff-marker-tools').empty();
    components.forEach(function(item) {
      if( !item || !item.text ) return;
      
      new Button(item).cls('ff-marker-tools-btn').owner(part).appendTo(tools);
    });
  };
  
  var show = function(ref) {
    ref = (typeof ref == 'number' ? el.children()[ref] : ref);
    
    if( lastref === ref ) return this;
    lastref = ref;
    
    //marker.remove();
    if( ref ) marker.insertBefore(ref);
    else marker.appendTo(el);
    
    return this;
  };
  
  var hide = function() {
    collapse();
    marker.remove();
    return this;
  };
  
  var expand = function() {
    marker.ac('ff-marker-open');
    return this;
  };
  
  var collapse = function() {
    marker.rc('ff-marker-open');
    return this;
  };
  
  marker.find('.ff-marker-head').on('click', function() {
    update();
    marker.tc('ff-marker-open');
  });
  
  el.on('click', function(e) {
    if( !marker[0].contains(e.target) ) marker.rc('ff-marker-open');
  });
  
  el.on('mousemove', function(e) {
    if( part.editmode() ) {
      var target = e.target;
      var y = e.pageY;
      
      if( target === el || target === marker ) return;
      var children = el.children();
      var current;
      children.each(function() {
        if( this.contains(target) ) current = this;
      });
      
      if( !current ) return;
      
      var index = children.indexOf(current);
      if( y > getOffsetTop(current) + (current.offsetHeight / 2) ) index = index + 1;
      show(index);
    } else {
      hide();
    }
  });
  
  this.show = show;
  this.hide = hide;
  this.expand = expand;
  this.collapse = collapse;
  this.getIndex = function() {
    return el.children().indexOf(marker[0]);
  };
  this.isExpanded = function() {
    return marker.hc('ff-marker-open')
  };
}

module.exports = Marker;