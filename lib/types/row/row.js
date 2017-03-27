var $ = require('tinyselector');
var context = require('../../context.js');
var Part = require('../../part.js');
var Toolbar = require('../../toolbar/');

require('./row.less');

function RowPart(el) {
  Part.call(this, el);
}

var items = RowPart.toolbar = require('./toolbar.js');
var proto = RowPart.prototype = Object.create(Part.prototype);

proto.createToolbar = function() {
  return new Toolbar(this).position(items.position).add(items);
};

proto.create = function(arg) {
  var el = $('<div ff-type="row" />')[0];
  this.add(arg);
  return el;
};

proto.oninit = function() {
  var part = this;
  var dom = part.dom();
  $(dom)
  .ac('ff-row')
  .on('drop', function(e) {
    e.stopPropagation();
    e.preventDefault();
    
    var target = e.target || e.srcElement;
    var dragging = part.context().dragging;
    var ref; // TODO
    
    if( dragging ) {
      if( target === dragging || dragging.contains(target) ) return;
      part.add(dragging, ref);
    } else if( e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length ) {
      $(e.dataTransfer.files).each(function() {
        var type = this.type;
        if( type ) {
          context.upload(this, function(err, result) {
            if( type.indexOf('image/') === 0 )
              part.add(new context.Image(result), ref);
          });
        }
      });
    }
  });
};

proto.oneditmode = function() {
  if( window.MutationObserver ) {
    var part = this;
    var observer = this._observer = new MutationObserver(function(mutations){
      part.validate();
    });
    
    observer.observe(this.dom(), {
      childList: true,
      subtree: true
    });
  }
};

proto.onviewmode = function() {
  var observer = this._observer;
  if( observer ) {
    observer.disconnect();
    delete this._observer;
  }
};

proto.validate = function() {
  var el = $(this.dom())
  
  el.find('.f_row_cell').each(function() {
    if( !this.children.length ) this.parentNode.removeChild(this);
  });
  
  var cells = el.children('.f_row_cell');
  var cellwidth = 100 / cells.length;
  cells.each(function() {
    $(this).css('width', cellwidth + '%');
  });
  
  return this;
};

proto.add = function(arg, ref) {
  var dom = this.dom();
  
  $(arg).each(function(i, item) {
    var cell = $('<div class="f_row_cell" />')
    .append(function() {
      return (item && item.dom && item.dom()) || item;
    })
    
    if( ref ) cell.insertBefore(ref);
    else cell.appendTo(dom);
  });
  
  this.validate();
  
  return this;
};

proto.valign = function(align) {
  var el = $(this.dom());
  if( !arguments.length ) return el.hc('f_row_middle') ? 'middle' : 
    el.hc('f_row_bottom') ? 'bottom' : 'top';
  
  el.rc('f_row_middle f_row_bottom');
  
  if( align == 'middle') el.ac('f_row_middle');
  else if( align == 'bottom' ) el.ac('f_row_bottom');
  
  return this;
};

module.exports = RowPart;

