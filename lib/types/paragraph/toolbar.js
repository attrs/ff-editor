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
  var dom = part.dom();
  var el = $(dom);
  
  return part.toolbar()
  .add({
    type: 'list',
    text: '<i class="fa fa-font"></i>',
    tooltip: 'Select Font',
    onupdate: function(btn) {
      var range = this.range();
      
      range && btn.active(context.wrapped(range, 'span.f_txt_font'));
    },
    onselect: function(item, i, btn) {
      var range = this.range();
      if( !range ) {
        dom.style.fontFamily = item.font || '';
        return;
      }
      
      context.unwrap(range, 'span.f_txt_font');
      
      var node = context.wrap(range, 'span.f_txt_font');
      node.style.fontFamily = item.font || '';
    },
    items: function() {
      return context.fonts();
    }
  })
  .add({
    type: 'list',
    text: '<i class="fa fa-text-height"></i>',
    tooltip: 'Select Font Size',
    onupdate: function(btn) {
      var range = this.range();
      range && btn.active(context.wrapped(range, 'span.f_txt_fontsize'));
    },
    onselect: function(item, i, btn) {
      var range = this.range();
      if( !range ) {
        dom.style.fontSize = item.size || '';
        return;
      }
      
      context.unwrap(range, 'span.f_txt_fontsize');
      
      var node = context.wrap(range, 'span.f_txt_fontsize');
      node.style.fontSize = item.size || '';
    },
    items: [
      { text: 'Default' },
      { text: '<span style="font-size:11px;">11px</span>', size: '11px' },
      { text: '<span style="font-size:12px;">12px</span>', size: '12px' },
      { text: '<span style="font-size:14px;">14px</span>', size: '14px' },
      { text: '<span style="font-size:16px;">16px</span>', size: '16px' },
      { text: '<span style="font-size:18px;">18px</span>', size: '18px' },
      { text: '<span style="font-size:20px;">20px</span>', size: '20px' }
    ]
  })
  .add({
    type: 'color',
    text: '<i class="fa fa-square"></i>',
    tooltip: 'Select Color',
    onupdate: function(btn) {
      var range = this.range();
      range && btn.active(context.wrapped(range, 'span.f_txt_color'));
    },
    onselect: function(item, i, btn) {
      var range = this.range();
      if( !range ) {
        dom.style.color = item.color || '';
        return;
      }
      
      context.unwrap(range, '.f_txt_color');
      context.wrap(range, item.tag + '.f_txt_color');
      node.style.color = item.color || '';
    },
    items: function() {
      return context.colors();
    }
  })
  .add('-')
  .add({
    type: 'list',
    text: '<i class="fa fa-header"></i>',
    tooltip: 'Select Heading',
    onupdate: function(btn) {
      var range = this.range();
      if( !range ) return btn.enable(false);
      
      btn.enable(true);
      
      range && btn.active(context.wrapped(range, '.f_txt_heading'));
    },
    onselect: function(item, i, btn) {
      var range = this.range();
      if( !range ) return;
      
      context.unwrap(range, '.f_txt_heading');
      item.tag && context.wrap(range, item.tag + '.f_txt_heading');
    },
    items: [
      { text: 'Default' },
      { text: '<h1>Heading</h1>', tag: 'h1' },
      { text: '<h2>Heading</h2>', tag: 'h2' },
      { text: '<h3>Heading</h3>', tag: 'h3' },
      { text: '<h4>Heading</h4>', tag: 'h4' },
      { text: '<h5>Heading</h5>', tag: 'h5' },
      { text: '<h6>Heading</h6>', tag: 'h6' }
    ]
  })
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