var $ = require('tinyselector');

require('./dnd.less');

function DnD(part, dom) {
  var el = $(dom);
  var marker = $('<div class="ff-dnd-marker ff-acc"></div>');
  
  function move(target, y) {
    if( !target ) return;
    
    if( y < $.util.offset(target, true).top + (target.offsetHeight / 2) ) {
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
    
    move(current(e.target || e.srcElement), e.pageY);
  }
  
  function ondragend(e) {
    hide();
  }
  
  function ondrop(e) {
    e.stopPropagation();
    e.preventDefault();
    
    var target = e.target || e.srcElement;
    var dragging = part.context().dragging;
    var ref = marker[0].nextSibling;
    
    if( dragging ) {
      if( !dom.contains(marker[0]) ) return;
      part.insert(dragging, ref);
    } else if( e.dataTransfer && e.dataTransfer.files ) {
      part.insert(e.dataTransfer.files, ref);
    }
    
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