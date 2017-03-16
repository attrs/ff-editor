var $ = require('tinyselector');
var Part = require('../../part.js');

require('./paragraph.less');

function wrap(range, node) {
  
}

function unwrap(range, selector) {
  
}


function ParagraphPart(el) {
  Part.call(this, el);
  
  var el = $(this.dom()).ac('ff-paragraph');
  
  this.toolbar()
  .add({
    text: '<i class="fa fa-align-right"></i>',
    tooltip: '우축정렬',
    fn: function(e) {
      el
      .rc('ff-paragraph-align-center')
      .ac('ff-paragraph-align-right');
    }
  }, 0)
  .add({
    text: '<i class="fa fa-align-center"></i>',
    tooltip: '중앙정렬',
    fn: function(e) {
      el
      .rc('ff-paragraph-align-right')
      .ac('ff-paragraph-align-center');
    }
  }, 0)
  .add({
    text: '<i class="fa fa-align-left"></i>',
    tooltip: '좌측정렬',
    fn: function(e) {
      el
      .rc('ff-paragraph-align-right')
      .rc('ff-paragraph-align-center');
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
  
  var placeholder = $('<div class="ff-paragraph-placeholder" />').html(el.attr('placeholder') || ParagraphPart.placeholder || '내용을 입력해주세요');
  this._placeholder = {
    html: function(html) {
      placeholder.html(html);
      return this;
    },
    show: function() {
      if( !el.text().split('\n').join().trim() ) el.empty().append(placeholder);
      return this;
    },
    hide: function() {
      placeholder.remove();
      return this;
    }
  };
}

ParagraphPart.prototype = Object.create(Part.prototype, {
  oninit: {
    value: function(e) {
      this.placeholder().show();
    }
  },
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
      this.placeholder().hide();
      
      if( this.editmode() ) {
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
      }
      
      el.focus();
    }
  },
  onblur: {
    value: function() {
      this.placeholder().show();
    }
  },
  onmodechange: {
    value: function(e) {
      var el = $(this.dom());
      if( e.detail.editmode ) {
        el.attr('contenteditable', true);
      } else if( el.is('[contenteditable]') ) {
        el.attr('contenteditable', null);
      }
    }
  },
  create: {
    value: function(arg) {
      var html = typeof arg == 'string' ? arg : '';
      return $('<p/>').attr('ff-type', 'paragraph').ac('ff-paragraph').html(html)[0];
    }
  },
  placeholder: {
    value: function(placeholder) {
      if( !arguments.length ) return this._placeholder;
      this._placeholder.html(placeholder);
      return this;
    }
  },
  click: {
    value: function() {
      this.focus();
    }
  }
});

module.exports = ParagraphPart;


