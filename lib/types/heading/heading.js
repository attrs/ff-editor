var $ = require('tinyselector');
var Part = require('../default/part.js');
var Toolbar = require('../../toolbar.js');

require('./heading.less');

function Heading(el) {
  Part.call(this, el);
  
  var el = this.dom();
  
  this.toolbar()
  .add({
    text: '<i class="fa fa-align-right"></i>',
    tooltip: '좌측정렬',
    fn: function(e) {
      $(el)
      .removeClass('ff-heading-align-left')
      .removeClass('ff-heading-align-center')
      .addClass('ff-heading-align-right');
    }
  }, 0)
  .add({
    text: '<i class="fa fa-align-center"></i>',
    tooltip: '중앙정렬',
    fn: function(e) {
      $(el)
      .removeClass('ff-heading-align-right')
      .removeClass('ff-heading-align-left')
      .addClass('ff-heading-align-center');
    }
  }, 0)
  .add({
    text: '<i class="fa fa-align-left"></i>',
    tooltip: '우축정렬',
    fn: function(e) {
      $(el)
      .removeClass('ff-heading-align-right')
      .removeClass('ff-heading-align-center')
      .addClass('ff-heading-align-left');
    }
  }, 0);
}

Heading.prototype = Object.create(Part.prototype, {
  onModeChange: {
    value: function(e) {
      var el = this.dom();
      if( e.detail.editmode ) {
        el.setAttribute('contenteditable', 'true');
      } else if( el.hasAttribute('contenteditable') ) {
        el.removeAttribute('contenteditable');
      }
    }
  },
  create: {
    value: function(arg) {
      var el = document.createElement('h2');
      el.innerHTML = typeof arg === 'string' ? arg : '제목을 입력해주세요';
      el.setAttribute('ff-type', 'heading');
      el.setAttribute('class', 'ff-heading');
      return el;
    }
  }
});

module.exports = Heading;

