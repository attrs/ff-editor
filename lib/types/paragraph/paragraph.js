var $ = require('tinyselector');
var Part = require('../../part.js');

require('./paragraph.less');

function wrap(range, node) {
  range.surroundContents(node);
}

function unwrap(range, selector) {
  console.log('unwrap', range);
}

function iswrapped(range, selector) {
  return false;
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
        type: 'list',
        text: '<i class="fa fa-font"></i>',
        onselect: function(selected) {
          
        },
        onupdate: function() {
          
        },
        fn: function(e) {
          
        },
        list: [
          '기본폰트',
          '나눔고딕',
          '나눔명조',
          'Helvetica',
          'Times New Roman'
        ]
      })
      .add({
        text: '<i class="fa fa-bold"></i>',
        tooltip: '굵게',
        onupdate: function() {
          var range = this.owner().range();
          if( !range ) return this.enable(false);
          
          this.enable(true);
          if( iswrapped(range, 'b') ) this.active(true);
        },
        fn: function(e) {
          var range = this.owner().range();
          if( !range ) return;
          
          if( iswrapped(range, 'b') ) unwrap(range, 'b');
          else wrap(range, $('<b/>')[0]);
        }
      })
      .add({
        text: '<i class="fa fa-underline"></i>',
        tooltip: '밑줄',
        onupdate: function() {
          var range = this.owner().range();
          if( !range ) return this.active(false);
          
          if( iswrapped(range, 'span.underline') ) this.active(true);
        },
        fn: function(e) {
          var range = this.owner().range();
          if( !range ) return;
          
          if( iswrapped(range, 'span.underline') ) unwrap(range, 'span.underline');
          else wrap(range, $('<span class="underline" style="text-decoration:underline;" />')[0]);
        }
      })
      .add({
        text: '<i class="fa fa-italic"></i>',
        tooltip: '이탤릭',
        onupdate: function() {
          var range = this.owner().range();
          if( !range ) return this.active(false);
          
          if( iswrapped(range, 'i') ) this.active(true);
        },
        fn: function(e) {
          var range = this.owner().range();
          if( !range ) return;
          
          if( iswrapped(range, 'i') ) unwrap(range, 'i');
          else wrap(range, $('<i />')[0]);
        }
      })
      .add({
        text: '<i class="fa fa-strikethrough"></i>',
        tooltip: '가로줄',
        onupdate: function() {
          var range = this.owner().range();
          if( !range ) return this.active(false);
          
          if( iswrapped(range, 'span.strikethrough') ) this.active(true);
        },
        fn: function(e) {
          var range = this.owner().range();
          if( !range ) return;
          
          if( iswrapped(range, 'span.strikethrough') ) unwrap(range, 'span.strikethrough');
          else wrap(range, $('<span class="strikethrough" style="text-decoration:line-through;" />')[0]);
        }
      })
      .add({
        text: '<i class="fa fa-link"></i>',
        tooltip: '링크',
        onupdate: function() {
          var range = this.owner().range();
          if( !range ) return this.active(false);
          
          if( iswrapped(range, 'a') ) this.active(true);
        },
        fn: function(e) {
          var range = this.owner().range();
          if( !range ) return;
          
          if( iswrapped(range, 'a') ) unwrap(range, 'a');
          else wrap(range, $('<a href="" />').html('link')[0]);
        }
      })
      .add({
        text: '<i class="fa fa-align-justify"></i>',
        tooltip: '정렬',
        onupdate: function() {
          var btn = this;
          if( btn.align == 'center' ) btn.text('<i class="fa fa-align-center"></i>');
          else if( btn.align == 'right' ) btn.text('<i class="fa fa-align-right"></i>');
          else if( btn.align == 'left' ) btn.text('<i class="fa fa-align-left"></i>');
          else btn.text('<i class="fa fa-align-justify"></i>');
        },
        fn: function(e) {
          var btn = this;
          if( btn.align == 'center' ) {
            el.css('text-align', 'right');
            btn.align = 'right';
          } else if( btn.align == 'right' ) {
            el.css('text-align', 'left');
            btn.align = 'left';
          } else if( btn.align == 'left' ) {
            el.css('text-align', '');
            btn.align = '';
          } else {
            el.css('text-align', 'center');
            btn.align = 'center';
          }
        }
      });
      
      var placeholder = $('<div class="ff-paragraph-placeholder" />').html(el.attr('placeholder') || ParagraphPart.placeholder);
      
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
      return $('<p/>').html(html)[0];
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


