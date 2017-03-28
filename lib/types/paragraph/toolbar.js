var $ = require('tinyselector');
var context = require('../../context.js');
var Toolbar = context.Toolbar;

function rangeitem(text, tooltip, selector, fn) {
  return {
    text: text,
    tooltip: tooltip,
    onupdate: function(btn) {
      var range = this.range();
      if( !range ) return btn.enable(false);
      
      btn.enable(true);
      btn.active(context.wrapped(range, selector));
    },
    fn: fn || function(btn) {
      context.toggleWrap(this.range(), selector);
    }
  };
}

module.exports = function(part) {
  var dom = part.dom()
  var el = $(dom);
  
  return part.toolbar()
  .add({
    type: 'list',
    text: '<i class="fa fa-font"></i>',
    onupdate: function(btn) {
      var range = this.range();
      if( !range ) return btn.enable(false);
      
      btn.enable(true);
      btn.active(context.wrapped(range, 'span.f_txt_font'));
    },
    onselect: function(item, i, btn) {
      var range = this.range();
      if( !range ) return;
      
      context.unwrap(range, 'span.f_txt_font');
      
      if( item.id == 'default' ) return;
      var node = context.wrap(range, 'span.f_txt_font');
      node.style.fontFamily = item.font || item;
    },
    items: [
      {id: 'default', text:'기본폰트'},
      {id: 'helvetica', text:'<span style="font-family: Helvetica;">Helvetica</span>', font: 'Helvetica'},
      {id: 'times', text:'<span style="font-family: Times New Roman;">Times New Roman</span>', font: 'Times New Roman'},
      {id: 'courier', text:'<span style="font-family: Courier New;">Courier New</span>', font: 'Courier New'},
      {id: 'notosans', text:'<span style="font-family: NotoSansKR;">Noto Sans</span>', font: 'NotoSansKR'},
      {id: 'nanumghothic', text:'<span style="font-family: NanumGhothic;">나눔고딕</span>', font: 'NanumGhothic'},
      {id: 'nanumbarungothic', text:'<span style="font-family: NanumBarunGothic;">나눔바른고딕</span>', font: 'NanumBarunGothic'},
      {id: 'nanummyungjo', text:'<span style="font-family: NanumMyungjo;">나눔명조</span>', font: 'NanumMyungjo'}
    ]
  })
  .add('-')
  .add(rangeitem('<i class="fa fa-bold"></i>', '굵게', 'b'))
  .add(rangeitem('<i class="fa fa-underline"></i>', '밑줄', 'u'))
  .add(rangeitem('<i class="fa fa-italic"></i>', '이탤릭', 'i'))
  .add(rangeitem('<i class="fa fa-strikethrough"></i>', '가로줄', 'strike'))
  .add(rangeitem('<i class="fa fa-link"></i>', '링크', 'a', function(e) {
    var range = this.range();
    if( !range || context.wrapped(range, 'a') ) return context.unwrap(range, 'a');
    
    context.prompt('Please enter the anchor URL.', function(href) {
      if( !href ) return;
      var a = context.wrap(range, 'a');
      a.href = href;
      a.target = '_blank';
    });
  }))
  .add({
    text: '<i class="fa fa-align-justify"></i>',
    tooltip: '정렬',
    onupdate: function(btn) {
      if( btn.align == 'center' ) btn.text('<i class="fa fa-align-center"></i>');
      else if( btn.align == 'right' ) btn.text('<i class="fa fa-align-right"></i>');
      else if( btn.align == 'left' ) btn.text('<i class="fa fa-align-left"></i>');
      else btn.text('<i class="fa fa-align-justify"></i>');
    },
    fn: function(btn) {
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
  })
  .add({
    text: '<i class="fa fa-hand-pointer-o"></i>',
    tooltip: '요소이동',
    onupdate: function(btn) {
      if( el.ha('draggable') ) btn.active(true);
      else btn.active(false);
    },
    fn: function() {
      part.dragmode(!part.dragmode());
    }
  });
};