var $ = require('tinyselector');
var context = require('../../context.js');
var modal = require('x-modal');
var Toolbar = context.Toolbar;

function rangeitem(text, tooltip, selector, fn) {
  return {
    text: text,
    tooltip: tooltip,
    onupdate: function() {
      var range = this.owner().range();
      if( !range ) return this.enable(false);
      
      this.enable(true);
      if( context.wrapped(range, selector) ) this.active(true);
    },
    fn: fn || function(e) {
      context.toggleWrap(this.owner().range(), selector);
    }
  };
}

module.exports = function(part) {
  return part.toolbar()
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
  .add(rangeitem('<i class="fa fa-bold"></i>', '굵게', 'b'))
  .add(rangeitem('<i class="fa fa-underline"></i>', '밑줄', 'span.underline'))
  .add(rangeitem('<i class="fa fa-italic"></i>', '이탤릭', 'i'))
  .add(rangeitem('<i class="fa fa-strikethrough"></i>', '가로줄', 'span.strike'))
  .add(rangeitem('<i class="fa fa-link"></i>', '링크', 'a', function(e) {
    var range = this.owner().range();
    if( !range || context.wrapped(range, 'a') ) return context.unwrap(range, 'a');
    
    modal.prompt('링크 주소를 입력해주세요', function(href) {
      context.wrap(range, $('<a href="' + href + '" />')[0]);
    });
  }))
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
      var el = $(part.dom());
      
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
};