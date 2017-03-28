var $ = require('tinyselector');
var context = require('../../context.js');
var Items = require('../../items.js');

module.exports = new Items()
.add({
  text: '<i class="fa fa-dedent"></i>',
  tooltip: '좌측플로팅',
  fn: function(btn) {
    this.floating('left');
  }
})
.add({
  text: '<i class="fa fa-dedent ff-flip"></i>',
  tooltip: '우측플로팅',
  fn: function(btn) {
    this.floating('right');
  }
})
.add({
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
  }
})
.add({
  text: '<i class="fa fa-file-image-o"></i>',
  tooltip: '사진변경(업로드)',
  fn: function() {
    var part = this;
    context.selectFile(function(err, file) {
      if( err ) return context.error(err);
      if( !file ) return;
      
      part.src(file.src).title(file.name);
    });
  }
})
.add({
  text: '<i class="fa fa-instagram"></i>',
  tooltip: '사진변경',
  fn: function() {
    var part = this;
    context.prompt('Please enter the image URL.', function(src) {
      src && part.src(src).title(null);
    });
  }
});