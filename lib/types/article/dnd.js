var modal = require('x-modal');
var each = require('async-each-series');
var $ = require('tinyselector');
var getOffsetTop = require('./offsettop.js');

require('./dnd.less');

function DnD(part) {
  var el = $(part.dom());
  var marker = $('<div class="ff-dnd-marker"></div>');
  
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
  };
  
  var update = function() {
    if( part.editmode() )
      el.find('.ff-part').attr('draggable', true);
    else
      el.find('.ff-part').attr('draggable', false);
  };
  
  el.on('dragover', function(e) {
    if( !part.editmode() ) return;
    e.stopPropagation();
    e.preventDefault();
    
    // show marker
    move(current(e.target), e.pageY);
  })
  .on('dragend', function(e) {
    // hide marker
    hide();
  })
  .on('drop', function(e) {
    if( !part.editmode() ) return;
    e.stopPropagation();
    e.preventDefault();
    
    var dragging = part.context().dragging;
    if( dragging )
      part.insert(dragging, marker[0]);
    else if( e.dataTransfer && e.dataTransfer.files )
      part.insert(e.dataTransfer.files);
  });
  
  this.update = update;
}

module.exports = DnD;