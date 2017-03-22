var $ = require('tinyselector');
var swal = require('sweetalert');
var Items = require('./items');
var context = require('../../context.js');

var items = Items();

function error(msg) {
  if( !msg ) msg = 'Error';
  swal(msg.message || msg, 'error');
}

items
.add({
  text: '<i class="fa fa-font"></i>',
  tooltip: '문단',
  fn: function(e) {
    var placeholder = $(this.owner().dom()).attr('placeholder');
    this.owner().insert(new context.Paragraph().placeholder(placeholder));
  }
})
.add({
  text: '<i class="fa fa-picture-o"></i>',
  tooltip: '이미지 파일',
  fn: function(e) {
    var part = this.owner();
    part.context().selectFiles(function(err, files) {
      if( err ) return error(err);
      if( !files.length ) return;
      
      if( files.length === 1 ) {
        part.insert(new context.Image(files[0]));
      } else {
        var row = new context.Row();
        files.forEach(function(file) {
          row.add(new context.Image(file));
        });
        part.insert(row);
      }
    });
  }
})
.add({
  text: '<i class="fa fa-instagram"></i>',
  tooltip: '이미지',
  fn: function(e) {
    var part = this.owner();
    
    swal({
      title: '이미지 URL을 입력해주세요',
      type: 'input',
      showCancelButton: true,
      closeOnConfirm: true,
      animation: 'slide-from-top'
    }, function(src){
      if( !src ) return;
      
      if( ~src.indexOf('instagram.com') ) {
        var vid = src.split('//')[1];
        vid = vid && vid.split('/p/')[1];
        vid = vid && vid.split('/')[0];
        
        if( vid ) src = 'https://www.instagram.com/p/' + vid + '/media';
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
    
    swal({
      title: '동영상 URL을 입력해주세요',
      type: 'input',
      showCancelButton: true,
      closeOnConfirm: true,
      animation: 'slide-from-top'
    }, function(src){
      if( !src ) return;
      
      if( ~src.indexOf('youtube.com') ) {
        var vid = src.split('v=')[1];
        vid = vid && vid.split('&')[0];
        vid = vid && vid.split('#')[0];
        
        if( !vid ) return error('URL을 정확히 입력해주세요');
        src = 'https://www.youtube.com/embed/' + vid;
      } else if( ~src.indexOf('vimeo.com') ) {
        var vid = src.split('//')[1];
        vid = vid && vid.split('/')[1];
        vid = vid && vid.split('?')[0];
        vid = vid && vid.split('&')[0];
        vid = vid && vid.split('#')[0];
        
        if( !vid ) return error('URL을 정확히 입력해주세요');
        src = 'https://player.vimeo.com/video/' + vid;
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
      if( err ) return error(err);
      
      part.insert(new context.File(file));
    });
  }
});

module.exports = items;