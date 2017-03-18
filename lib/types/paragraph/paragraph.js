var $ = require('tinyselector');
var Part = require('../../part.js');

require('./paragraph.less');

function wrap(range, node) {
  
}

function unwrap(range, selector) {
  
}


function ParagraphPart() {
  Part.apply(this, arguments);
}

ParagraphPart.prototype = Object.create(Part.prototype, {
  oninit: {
    value: function(e) {
      var part = this;
      var el = $(part.dom()).ac('ff-paragraph');
      
      part.toolbar()
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
      
      part._placeholder = {
        html: function(html) {
          placeholder.html(html);
          return part;
        },
        show: function() {
          if( !el.text().split('\n').join().trim() ) el.empty().append(placeholder);
          return part;
        },
        hide: function() {
          placeholder.remove();
          return part;
        }
      };
      
      placeholder.show();
      
      el.on('dragstart', function(e) {
        if( part.editmode() ) {
          e.stopPropagation();
          e.preventDefault();
        }
      });
    }
  },
  onfocus: {
    value: function() {
      if( !this.editmode() ) return;
        
      var el = this.dom();
      this.placeholder().hide();
      
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
    }
  },
  onblur: {
    value: function() {
      if( !this.editmode() ) return;
      
      this.placeholder().show();
    }
  },
  onmodechange: {
    value: function(e) {
      var el = $(this.dom());
      if( e.detail.editmode ) {
        el.attr('contenteditable', true);
        this.placeholder().show();
      } else {
        el.attr('contenteditable', null);
        this.placeholder().hide();
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


