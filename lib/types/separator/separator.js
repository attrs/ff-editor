var $ = require('tinyselector');
var Part = require('../../part.js');

require('./separator.less');

function Separator(el) {
  Part.call(this, el);
  
  var el = $(this.dom()).ac('ff-separator');
  
  this.toolbar()
  .add({
    text: '<i class="fa fa-ellipsis-h"></i>',
    tooltip: '점선',
    fn: function(e) {
      el.tc('ff-separator-dashed');
    }
  }, 0)
  .add({
    text: '<i class="fa fa-arrows-h"></i>',
    tooltip: '넓게',
    fn: function(e) {
      el.tc('ff-separator-wide');
    }
  }, 0);
}

Separator.prototype = Object.create(Part.prototype, {
  create: {
    value: function(arg) {
      return $('<div ff-type="separator" />')[0];
    }
  }
});

module.exports = Separator;