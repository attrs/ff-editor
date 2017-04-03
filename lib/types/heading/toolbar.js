var $ = require('tinyselector');
var context = require('../../context.js');
var Items = require('../../items.js');


module.exports = new Items()
.add({
  type: 'list',
  text: '<i class="fa fa-header"></i>',
  tooltip: 'Select Heading',
  onselect: function(item, i, btn) {
    var part = this;
    var dom = part.dom();
    
    if( dom.tagName.toLowerCase() !== item.tag ) {
      var el = $(part.dom());
      var parentpart = part.parent();
      
      var newpart = new context.Heading({
        tag: item.tag,
        html: el.html()
      });
      
      el.after(newpart.dom()).remove();
      
      newpart.focus();
      parentpart && parentpart.history().save();
    }
  },
  items: [
    { text: '<h1>Title</h1>', tag: 'h1' },
    { text: '<h2>Title</h2>', tag: 'h2' },
    { text: '<h3>Title</h3>', tag: 'h3' },
    { text: '<h4>Title</h4>', tag: 'h4' },
    { text: '<h5>Title</h5>', tag: 'h5' },
    { text: '<h6>Title</h6>', tag: 'h6' }
  ]
})
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
    var part = this;
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
    part.history().save();
  }
})
.add({
  text: '<i class="fa fa-hand-pointer-o"></i>',
  tooltip: '요소이동',
  onupdate: function(btn) {
    var part = this;
    var el = $(part.dom());
    
    if( el.ha('draggable') ) btn.active(true);
    else btn.active(false);
  },
  fn: function() {
    var part = this;
    part.dragmode(!part.dragmode());
  }
});