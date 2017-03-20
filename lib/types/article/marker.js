var $ = require('tinyselector');
var getOffsetTop = require('./offsettop.js');
var components = require('./components.js');
var Button = require('../../toolbar/').Button;

require('./marker.less');

function Marker(part, dom) {
  var el = $(dom);
  var marker = $('<div class="ff-marker"><div class="ff-marker-head"></div><div class="ff-marker-tools"></div></div>');
  var lastref;
  
  marker[0].__marker__ = true;
  
  function update() {
    var tools = marker.find('.ff-marker-tools').empty();
    components.forEach(function(item) {
      if( !item || !item.text ) return;
      
      new Button(item).cls('ff-marker-tools-btn').owner(part).appendTo(tools);
    });
  }
  
  function show(ref) {
    ref = (typeof ref == 'number' ? el.children()[ref] : ref);
    
    if( lastref === ref ) return this;
    lastref = ref;
    
    //marker.remove();
    if( ref ) marker.insertBefore(ref);
    else marker.appendTo(el);
    
    return this;
  }
  
  function hide() {
    collapse();
    marker.remove();
    return this;
  }
  
  function expand() {
    marker.ac('ff-marker-open');
    return this;
  }
  
  function collapse() {
    marker.rc('ff-marker-open');
    return this;
  }
  
  function onclick(e) {
    if( !marker[0].contains(e.target) ) marker.rc('ff-marker-open');
  }
  
  function onmousemove(e) {
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
  }
  
  marker.find('.ff-marker-head').on('click', function() {
    update();
    marker.tc('ff-marker-open');
  });
  
  el.on('click', onclick).on('mousemove', onmousemove);
  
  return {
    show: show,
    hide: hide,
    expand: expand,
    collapse: collapse,
    getIndex: function() {
      return el.children().indexOf(marker[0]);
    },
    getRef: function() {
      return marker[0].nextSibling;
    },
    isExpanded: function() {
      return marker.hc('ff-marker-open')
    },
    destroy: function() {
      el.off('click', onclick).off('mousemove', onmousemove);
      marker.remove();
    }
  };
}

module.exports = Marker;