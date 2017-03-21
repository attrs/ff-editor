var context = require('../../context.js');
var Toolbar = context.Toolbar;


function wrap(range, node) {
  range.surroundContents(node);
}

function unwrap(range, selector) {
  console.log('unwrap', range);
}

function iswrapped(range, selector) {
  return false;
}

module.exports = function(part) {
  var el = part.dom();
  
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
};