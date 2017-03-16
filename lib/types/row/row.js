var $ = require('tinyselector');
var Part = require('../../part.js');

require('./row.less');

function RowPart(el) {
  Part.call(this, el);
  
  var el = $(this.dom()).ac('ff-row');
  
  this.toolbar()
  .add({
    text: '<i class="fa fa-angle-double-up"></i>',
    tooltip: '상단정렬',
    fn: function(e) {
      el
      .rc('ff-row-valign-bottom')
      .rc('ff-row-valign-middle')
      .ac('ff-row-valign-top');
    }
  }, 0)
  .add({
    text: '<i class="fa fa-dot-circle-o"></i>',
    tooltip: '중앙정렬',
    fn: function(e) {
      el
      .rc('ff-row-valign-bottom')
      .rc('ff-row-valign-top')
      .ac('ff-row-valign-middle');
    }
  }, 0)
  .add({
    text: '<i class="fa fa-angle-double-down"></i>',
    tooltip: '하단정렬',
    fn: function(e) {
      el
      .rc('ff-row-valign-top')
      .rc('ff-row-valign-middle')
      .ac('ff-row-valign-bottom');
    }
  }, 0);
  
  this.on('click', function() {
    this.toolbar().show();
  });
}

RowPart.prototype = Object.create(Part.prototype, {
  create: {
    value: function(items) {
      this.items(items);
      var el = $('<div ff-type="row" />')[0];
      
      return el;
    }
  },
  items: {
    value: function(items) {
      if( !arguments.length ) return this._items = this._items || [];
      
      if( items && !Array.isArray(items) ) items = [items];
      this._items = items || [];
      this.update();
      return this;
    }
  },
  update: {
    value: function() {
      var items = this.items();
      var el = $(this.dom()).empty();
      
      var wp = 100 / items.length;
      var row = $('<div class="ff-row-row" />').appendTo(el);
      
      items.forEach(function(item) {
        $('<div class="ff-row-cell" />')
        .css('width', wp + 'px')
        .append(function() {
          return (item && item.dom && item.dom()) || item;
        }).appendTo(row);
      });
      
      return this;
    }
  },
  add: {
    value: function(item) {
      if( !item ) return this;
      this.items().push(item);
      this.update();
      return this;
    }
  }
});

module.exports = RowPart;

