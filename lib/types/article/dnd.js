var modal = require('x-modal');
var each = require('async-each-series');
var $ = require('tinyselector');
var getOffsetTop = require('./offsettop.js');

require('./dnd.less');

function DnD(part, dom) {
  var el = $(dom);
  var marker = $('<div class="ff-dnd-marker ff-acc"></div>');
  
  function move(target, y) {
    if( !target ) return;
    
    if( y < getOffsetTop(target) + (target.offsetHeight / 2) ) {
      marker.insertBefore(target);
    } else {
      marker.insertAfter(target);
    }
  }
  
  function hide() {
    marker.remove();
  }
  
  function current(target) {
    if( target === el || target === marker ) return;
    var children = el.children();
    var current;
    children.each(function() {
      if( this.contains(target) ) current = this;
    });
    
    return current;
  }
  
  function ondragover(e) {
    e.stopPropagation();
    e.preventDefault();
    
    var dragging = part.context().dragging;
    
    if( e.target === dragging || dragging.contains(e.target) ) return hide();
    
    if( !e.target.contains(dragging) ) {
      move(current(e.target), e.pageY);
    }
  }
  
  function ondragend(e) {
    hide();
  }
  
  function ondrop(e) {
    e.stopPropagation();
    e.preventDefault();
    
    var dragging = part.context().dragging;
    var ref = marker[0].nextSibling;
    
    if( e.target === dragging || dragging.contains(e.target) || !dom.contains(marker[0]) ) return;
    
    if( dragging )
      part.insert(dragging, ref);
    else if( e.dataTransfer && e.dataTransfer.files )
      part.insert(e.dataTransfer.files, ref);
    
    hide();
  }
  
  el.on('dragover', ondragover)
  .on('dragend', ondragend)
  .on('drop', ondrop);
  
  return {
    move: move,
    hide: hide,
    destroy: function() {
      el.off('dragover', ondragover)
      .off('dragend', ondragend)
      .off('drop', ondrop);
      
      marker.remove();
    }
  };
}

module.exports = DnD;