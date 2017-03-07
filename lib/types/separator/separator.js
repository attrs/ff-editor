var $ = require('tinyselector');
var Part = require('../../part.js');
var Toolbar = require('../../toolbar.js');

require('./separator.less');

function Separator(el) {
  Part.call(this, el);
  
  var el = this.dom();
  
  this.toolbar()
  .add({
    text: '<i class="fa fa-align-right"></i>',
    tooltip: '좌측정렬',
    fn: function(e) {
      $(el)
      .removeClass('ff-separator-align-left')
      .removeClass('ff-separator-align-center')
      .addClass('ff-separator-align-right');
    }
  }, 0)
  .add({
    text: '<i class="fa fa-align-center"></i>',
    tooltip: '중앙정렬',
    fn: function(e) {
      $(el)
      .removeClass('ff-separator-align-right')
      .removeClass('ff-separator-align-left')
      .addClass('ff-separator-align-center');
    }
  }, 0)
  .add({
    text: '<i class="fa fa-align-left"></i>',
    tooltip: '우축정렬',
    fn: function(e) {
      $(el)
      .removeClass('ff-separator-align-right')
      .removeClass('ff-separator-align-center')
      .addClass('ff-separator-align-left');
    }
  }, 0);
}

Separator.prototype = Object.create(Part.prototype, {
  create: {
    value: function(arg) {
      var el = document.createElement('div');
      el.setAttribute('ff-type', 'separator');
      el.setAttribute('class', 'ff-separator');
      return el;
    }
  }
});

module.exports = Separator;

