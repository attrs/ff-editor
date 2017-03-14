var $ = require('tinyselector');
var modal = require('x-modal');
var URL = require('url');
var querystring = require('querystring');
var Items = require('./items');
var context = require('../../context.js');

var items = Items();

items
.add({
  text: '<i class="fa fa-font"></i>',
  tooltip: '문단',
  fn: function(e) {
    this.owner().insert(new context.Paragraph());
  }
})
.add({
  text: '<i class="fa fa-picture-o"></i>',
  tooltip: '이미지 파일',
  fn: function(e) {
    var part = this.owner();
    part.context().selectFiles(function(err, files) {
      if( err ) return modal.error(err);
      if( !files.length ) return;
      
      if( files.length === 1 ) {
        part.insert(new context.Image(files[0]));
      } else {
        part.insert(new context.ImageGroup(files));
      }
    });
  }
})
.add({
  text: '<i class="fa fa-instagram"></i>',
  tooltip: '이미지',
  fn: function(e) {
    var part = this.owner();
    modal.prompt('이미지 URL을 입력해주세요', function(src) {
      if( !src ) return;
      
      var url = URL.parse(src);
      if( !url || !url.hostname ) return modal.error('URL을 정확히 입력해주세요');
      
      if( ~url.hostname.indexOf('instagram.com') ) {
        if( url.pathname.indexOf('/p/') !== 0 ) return modal.error('URL을 정확히 입력해주세요');
        var shortid = url.pathname.substring(3).split('/')[0];
        src = 'https://www.instagram.com/p/' + shortid + '/media';
      }
      
      part.insert(new context.Image(src));
    });
  }
})
.add({
  text: '<i class="fa fa-youtube-square"></i>',
  tooltip: '동영상',
  fn: function(e) {
    var part = this.owner();
    modal.prompt('동영상 URL을 입력해주세요', function(src) {
      if( !src ) return;
      
      var url = URL.parse(src);
      if( !url || !url.hostname ) return modal.error('URL을 정확히 입력해주세요');
      
      if( ~url.hostname.indexOf('youtube.com') ) {
        var qry = url && url.query && querystring.parse(url.query);
        if( !qry || !qry.v ) return modal.error('URL을 정확히 입력해주세요');
        
        src = 'https://www.youtube.com/embed/' + qry.v;
      } else if( ~url.hostname.indexOf('vimeo.com') ) {
        var videoid = url.pathname.substring(1);
        if( !videoid ) return modal.error('URL을 정확히 입력해주세요');
        
        src = 'https://player.vimeo.com/video/' + videoid;
      }
      
      part.insert(new context.Video(src));
    });
  }
})
.add({
  text: '<i class="fa fa-arrows-h"></i>',
  tooltip: '구분선',
  fn: function(e) {
    this.owner().insert(new context.Separator());
  }
})
.add({
  text: '<i class="fa fa-paperclip"></i>',
  tooltip: '첨부파일',
  fn: function(e) {
    var part = this.owner();
    part.context().selectFile(function(err, file) {
      if( err ) return modal.error(err);
      
      part.insert(new context.Attachment(file));
    });
  }
});

module.exports = items;