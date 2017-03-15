var $ = require('tinyselector');
var Part = require('../../part.js');

require('./paragraph.less');

function wrap(range, node) {
  
}

function unwrap(range, selector) {
  
}


function ParagraphPart(el) {
  Part.call(this, el);
  
  var el = this.dom();
  var context = this.context();
  
  var part = this.on('modechange', function(e) {
    if( e.detail.editmode ) {
      el.setAttribute('contenteditable', 'true');
    } else if( el.hasAttribute('contenteditable') ) {
      el.removeAttribute('contenteditable');
    }
  });
  
  this.toolbar()
  .add({
    text: '<i class="fa fa-align-right"></i>',
    tooltip: '좌측정렬',
    fn: function(e) {
      $(el)
      .removeClass('ff-paragraph-align-left')
      .removeClass('ff-paragraph-align-center')
      .addClass('ff-paragraph-align-right');
    }
  }, 0)
  .add({
    text: '<i class="fa fa-align-center"></i>',
    tooltip: '중앙정렬',
    fn: function(e) {
      $(el)
      .removeClass('ff-paragraph-align-right')
      .removeClass('ff-paragraph-align-left')
      .addClass('ff-paragraph-align-center');
    }
  }, 0)
  .add({
    text: '<i class="fa fa-align-left"></i>',
    tooltip: '우축정렬',
    fn: function(e) {
      $(el)
      .removeClass('ff-paragraph-align-right')
      .removeClass('ff-paragraph-align-center')
      .addClass('ff-paragraph-align-left');
    }
  }, 0)
  .add({
    text: '<i class="fa fa-strikethrough"></i>',
    tooltip: '가로줄',
    fn: function(e) {
    }
  }, 0)
  .add({
    text: '<i class="fa fa-underline"></i>',
    tooltip: '밑줄',
    fn: function(e) {
    }
  }, 0)
  .add({
    text: '<i class="fa fa-bold"></i>',
    tooltip: '굵게',
    fn: function(e) {
      var range = this.owner().range();
      if( !range ) return;
      
      var bold = document.createElement('b');
      range.surroundContents(bold);
      console.log(range, range.toString());
    }
  }, 0);
}

ParagraphPart.prototype = Object.create(Part.prototype, {
  ondragstart: {
    value: function(e) {
      if( this.editmode() ) {
        e.stopPropagation();
        e.preventDefault();
      }
    }
  },
  onfocus: {
    value: function() {
      if( this.editmode() ) {
        
      }
    }
  },
  onblur: {
    value: function() {
      if( this.editmode() ) {
      }
    }
  },
  onmodechange: {
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
      var el = document.createElement('div');
      el.innerHTML = typeof arg === 'string' ? arg : '<p>내용을 입력해주세요</p>';
      el.setAttribute('ff-type', 'paragraph');
      el.setAttribute('class', 'ff-paragraph ff-paragraph-align-left ff-paragraph-align-left');
      return el;
    }
  },
  focus: {
    value: function() {
      var el = this.dom();
      
      // 커서가 다른 곳에 있다면 옮긴다.
      var selection = window.getSelection();
      var range = selection.rangeCount && selection.getRangeAt(0);
      
      if( !range || !el.contains(range.startContainer) ) {
        var lastindex = el.childNodes.length;
        range = document.createRange();
        range.setStart(el, lastindex);
        range.setEnd(el, lastindex);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      
      el.focus();
      Part.prototype.focus.apply(this, arguments);
    }
  },
  click: {
    value: function() {
      this.focus();
    }
  }
});

module.exports = ParagraphPart;


