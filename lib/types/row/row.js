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
  })
  .on('dragend', function(e) {
    this.validate();
  });
}

RowPart.prototype = Object.create(Part.prototype, {
  create: {
    value: function(items) {
      var el = $('<div ff-type="row" />')[0];
      this.add(items);
      return el;
    }
  },
  validate: {
    value: function() {
      var el = $(this.dom());
      el.find('.ff-row-cell').each(function() {
        if( !this.children.length ) this.parentNode.removeChild(this);
      });
      
      var cells = el.find('.ff-row-row').children('.ff-row-cell');
      var cellwidth = 100 / cells.length;
      cells.each(function() {
        $(this).css('width', cellwidth + '%');
      });
      
      return this;
    }
  },
  add: {
    value: function(items) {
      var el = $(this.dom());
      var row = el.find('.ff-row-row');
      
      if( !row.length ) row = $('<div class="ff-row-row" />').appendTo(el);
      
      $(items).each(function(i, item) {
        $('<div class="ff-row-cell" />')
        .append(function() {
          return (item && item.dom && item.dom()) || item;
        })
        .appendTo(row);
      });
      
      return this;
    }
  }
});

module.exports = RowPart;

