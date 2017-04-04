var $ = require('tinyselector');
var context = require('../../context.js');
var Items = require('../../items.js');

module.exports = new Items()
.add({
  text: '<i class="fa fa-header"></i>',
  tooltip: 'Heading',
  fn: function(e) {
    var placeholder = $(this.dom()).attr('placeholder');
    this.insert(new context.Heading().placeholder(placeholder));
  }
})
.add({
  text: '<i class="fa fa-font"></i>',
  tooltip: '문단',
  fn: function(e) {
    var placeholder = $(this.dom()).attr('placeholder');
    this.insert(new context.Paragraph().placeholder(placeholder));
  }
})
.add({
  text: '<i class="fa fa-picture-o"></i>',
  tooltip: '이미지 파일',
  fn: function(e) {
    var part = this;
    part.context().selectFiles(function(err, files) {
      if( err ) return context.error(err);
      if( !files.length ) return;
      
      part.insert(files);
    }, {
      upload: false,
      type: 'image'
    });
  }
})
.add({
  text: '<i class="fa fa-instagram"></i>',
  tooltip: '이미지',
  fn: function(e) {
    var part = this;
    
    context.prompt('Please enter the image URL.', function(src) {
      src && part.insert(new context.Image(src));
    });
  }
})
.add({
  text: '<i class="fa fa-youtube-square"></i>',
  tooltip: '동영상',
  fn: function(e) {
    var part = this;
    
    context.prompt('Please enter the video URL', function(src) {
      src && part.insert(new context.Video(src));
    });
  }
})
.add({
  text: '<i class="fa fa-minus"></i>',
  tooltip: '구분선',
  fn: function(e) {
    this.insert(new context.Separator());
  }
})
.add({
  text: '<i class="fa fa-link"></i>',
  tooltip: '링크',
  fn: function(e) {
    var part = this;
    
    context.prompt('Please enter the anchor URL', function(src) {
      src && part.insert(new context.Link(src));
    });
  }
})
.add({
  text: '<i class="fa fa-paperclip"></i>',
  tooltip: '첨부파일',
  fn: function(e) {
    var part = this;
    
    part.context().selectFile(function(err, file) {
      if( err ) return context.error(err);
      
      part.insert(new context.Link(file));
    });
  }
});
