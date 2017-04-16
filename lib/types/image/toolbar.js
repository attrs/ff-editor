var $ = require('tinyselector');
var context = require('../../context.js');
var Items = require('../../items.js');

module.exports = new Items()
.add({
  id: 'float-left',
  text: '<i class="fa fa-dedent"></i>',
  tooltip: '좌측플로팅',
  fn: function(btn) {
    this.floating('left').history().save();
  }
})
.add({
  id: 'float-right',
  text: '<i class="fa fa-dedent ff-flip"></i>',
  tooltip: '우측플로팅',
  fn: function(btn) {
    this.floating('right').history().save();
  }
})
.add({
  id: 'rotate-size',
  text: '<i class="fa fa-circle-o"></i>',
  tooltip: '크기변경',
  onupdate: function(btn) {
    var part = this;
    
    var blockmode = part.blockmode();
    if( blockmode == 'natural' ) btn.text('<i class="fa fa-square-o"></i>');
    else if( blockmode == 'medium' ) btn.text('<i class="fa fa-arrows-alt"></i>');
    else if( blockmode == 'full' ) btn.text('<i class="fa fa-circle-o"></i>');
    else btn.text('<i class="fa fa-align-center"></i>');
  },
  fn: function(btn) {
    var part = this;
    
    var blockmode = part.blockmode();
    if( blockmode == 'natural' ) part.blockmode('medium');
    else if( blockmode == 'medium' ) part.blockmode('full');
    else if( blockmode == 'full' ) part.blockmode(false);
    else part.blockmode('natural');
    
    part.history().save();
  }
})
.add({
  id: 'upload-image',
  text: '<i class="fa fa-file-image-o"></i>',
  tooltip: '사진변경(업로드)',
  fn: function() {
    var part = this;
    context.selectFile(function(err, file) {
      if( err ) return context.error(err);
      if( !file ) return;
      
      part.src(file.src).title(file.name);
      part.history().save();
    });
  }
})
.add({
  id: 'change-image',
  text: '<i class="fa fa-instagram"></i>',
  tooltip: '사진변경',
  fn: function() {
    var part = this;
    context.prompt('Please enter the image URL.', function(src) {
      src && part.src(src).title(null);
      part.history().save();
    });
  }
})
.add({
  text: '<i class="fa fa-align-justify"></i>',
  tooltip: '정렬',
  onupdate: function(btn) {
    var part = this;
    var el = $(part.figcaption());
    var align = el.css('text-align');
    
    if( part.isFigure() ) btn.show();
    else btn.hide();
    
    if( align == 'right' ) btn.text('<i class="fa fa-align-right"></i>');
    else if( align == 'left' ) btn.text('<i class="fa fa-align-left"></i>');
    else btn.text('<i class="fa fa-align-center"></i>');
  },
  fn: function(btn) {
    var part = this;
    var el = $(part.figcaption());
    var align = el.css('text-align');
    
    if( align == 'right' ) {
      el.css('text-align', 'left');
    } else if( align == 'left' ) {
      el.css('text-align', null);
    } else {
      el.css('text-align', 'right');
    }
    part.history().save();
  }
})
.add({
  id: 'change-image',
  text: '<i class="fa fa-text-width"></i>',
  onupdate: function(btn) {
    if( this.isFigure() ) btn.active(true);
    else btn.active(false);
  },
  tooltip: '캡션',
  fn: function() {
    this.caption(!this.isFigure());
  }
});