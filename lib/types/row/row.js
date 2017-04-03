var $ = require('tinyselector');
var context = require('../../context.js');
var Part = require('../../part.js');
var Toolbar = require('../../toolbar/');

require('./row.less');

function isedge(dom, y) {
  var top = $.util.offset(dom, true).top;
  var height = dom.offsetHeight;
  
  if( y < top + 30 || y > top + height - 30 ) return true;
  return false;
}

function getcellindex(dom, target, x) {
  if( !dom.contains(target) ) return -1;
  var cells = $(dom).children('.f_row_cell').each(function(i, el) {
    el.style.borderLeft = el.style.borderRight = null;
  });
  var cell = $(target).parent('.f_row_cell')[0];
  var index = cells.indexOf(cell);
  
  if( !~index ) return index;
  if( x > $.util.offset(cell, true).left + (cell.offsetWidth / 2) ) {
    index = index + 1;
    cell.style.borderRight = '2px solid #2796DD';
  } else {
    cell.style.borderLeft = '2px solid #2796DD';
  }
  
  return index;
}

function RowPart(el) {
  Part.call(this, el);
}

var items = RowPart.toolbar = require('./toolbar.js');
var proto = RowPart.prototype = Object.create(Part.prototype);

proto.createToolbar = function() {
  return new Toolbar(this).position(items.position).add(items);
};

proto.oninit = function() {
  var part = this;
  var dom = part.dom();
  
  var release = function() {
    //dom.style.opacity = null;
    el.children('.f_row_cell').each(function(i, el) {
      el.style.borderLeft = el.style.borderRight = null;
    });
  };
  
  var el = $(dom)
  .ac('f_row')
  .on('mouseleave dragend', function() {
    release();
  })
  .on('dragover', function(e) {
    if( !part.editmode() ) return;
    if( isedge(dom, e.pageY) ) return release();
    //else dom.style.opacity = 0.9;
    
    var target = e.target || e.srcElement;
    var dragging = part.context().dragging;
    var cellindex = getcellindex(dom, target, e.pageX);
    
    if( dragging ) {
      e.stopPropagation();
      e.preventDefault();
    } else if( e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length ) {
      e.stopPropagation();
      e.preventDefault();
    }
  })
  .on('drop', function(e) {
    if( !part.editmode() ) return;
    if( isedge(dom, e.pageY) ) return;
    
    var target = e.target || e.srcElement;
    var dragging = part.context().dragging;
    var cellindex = getcellindex(dom, target, e.pageX);
    
    release();
    
    if( dragging ) {
      e.stopPropagation();
      e.preventDefault();
      
      if( dragging.tagName != 'IMG' || target === dragging || dragging.contains(target) ) return;
      part.add(dragging, cellindex);
    } else if( e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length ) {
      e.stopPropagation();
      e.preventDefault();
      
      $(e.dataTransfer.files).each(function() {
        var type = this.type;
        if( type ) {
          context.upload(this, function(err, result) {
            if( type.indexOf('image/') === 0 ) {
              part.add(new context.Image(result), cellindex);
              part.validate();
            }
          });
        }
      });
    }
  });
};

proto.oneditmode = function() {
  if( window.MutationObserver ) {
    var part = this;
    var observer = this._observer = new MutationObserver(function(){
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

proto.create = function(arg) {
  return $('<div ff-type="row" />').ac('f_clearfix')[0];
};

proto.cols = function(cols) {
  var el = $(this.dom());
  if( !arguments.length ) return +el.attr('cols') || 0;
  el.attr('cols', +cols || null);
  return this;
};

proto.validate = function() {
  var part = this;
  var dom = part.dom();
  var el = $(dom);
  
  el.find('.f_row_cell').each(function(i, el) {
    var el = this;
    if( !el.children.length ) el.parentNode.removeChild(el);
  });
  
  var cells = el.children('.f_row_cell');
  var cols = part.cols() || cells.length;
  
  if( el.hc('f_row_justify') ) {
    var totalwidth = 0;
    var warr = [];
    cells
    .children(':first-child')
    .each(function(i, el) {
      var width = el.naturalWidth;
      var height = el.naturalHeight;
      
      if( width ) {
        width = 100 * (width / height);
        totalwidth += width;
        warr.push(width);
      } else {
        el.style.width = 'auto';
        el.style.height = '100px';
        var width = el.offsetWidth;
        totalwidth += width;
        warr.push(width);
        el.style.display = null;
        el.style.width = null;
        el.style.height = null;
      }
      //console.log(i, this, width);
    });
    
    cells.each(function(i, el) {
      //console.log(i, this, ((warr[i] / totalwidth) * 100) + '%');
      $(el).css('width', ((warr[i] / totalwidth) * 100) + '%');
    });
  } else {
    cells.each(function(i, el) {
      $(el).css('width', (100 / cols) + '%');
    });
  }
  
  return part;
};

proto.add = function(arg, index) {
  var part = this;
  var dom = part.dom();
  var cells = $(dom).children('.f_row_cell');
  
  $(arg).each(function(i, item) {
    var cell = $('<div class="f_row_cell" />')
    .append(function() {
      return (item && item.dom && item.dom()) || item;
    });
    
    if( ~index ) {
      var ref = cells[index++];
      if( ref ) return cell.insertBefore(ref);
    }
    
    cell.appendTo(dom);
  });
  
  part.validate().history().save();
  
  return part;
};

proto.valign = function(align) {
  var part = this;
  var el = $(part.dom());
  if( !arguments.length ) return el.hc('f_row_middle') ? 'middle' : 
    el.hc('f_row_bottom') ? 'bottom' : el.hc('f_row_justify') ? 'justify' : false;
  
  el.rc('f_row_middle f_row_bottom f_row_justify');
  
  if( align == 'middle') el.ac('f_row_middle');
  else if( align == 'bottom' ) el.ac('f_row_bottom');
  else if( align == 'justify' ) el.ac('f_row_justify');
  
  part.validate().history().save();
  
  return part;
};

proto.createHistory = function() {
  var part = this;
  var dom = part.dom();
  var html = dom.innerHTML;
  
  return (function(html, cls, css) {
    return function() {
      dom.className = cls || '';
      dom.style.cssText = css || '';
      dom.innerHTML = html;
      part.focus();
    };
  })(html, dom.className, dom.style.cssText);
};

module.exports = RowPart;

