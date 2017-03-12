var $ = require('tinyselector');
var Part = require('../../part.js');

require('./image.less');

function ImagePart(el) {
  Part.call(this, el);
  
  var el = this.dom();
  
  this.toolbar()
  .position('inside top center')
  .add({
    text: '<i class="fa fa-circle-o"></i>',
    tooltip: '원본크기',
    fn: function(e) {
      $(el)
      .removeClass('ff-image-size-full')
      .removeClass('ff-image-size-medium');
    }
  }, 0)
  /*.add({
    text: '<i class="fa fa-square-o"></i>',
    tooltip: '기본크기',
    fn: function(e) {
      $(el)
      .removeClass('ff-image-size-full')
      .addClass('ff-image-size-medium');
    }
  }, 0)*/
  .add({
    text: '<i class="fa fa-arrows-alt"></i>',
    tooltip: '풀사이즈',
    fn: function(e) {
      $(el)
      .removeClass('ff-image-size-medium')
      .addClass('ff-image-size-full');
    }
  }, 0)
  .add({
    text: '<i class="fa fa-angle-right"></i>',
    tooltip: '우측플로팅',
    fn: function(e) {
      $(el)
      .removeClass('ff-image-float-left')
      .addClass('ff-image-float-right');
    }
  }, 0)
  .add({
    text: '<i class="fa fa-angle-up"></i>',
    tooltip: '플로팅제거',
    fn: function(e) {
      $(el)
      .removeClass('ff-image-float-right')
      .removeClass('ff-image-float-left');
    }
  }, 0)
  .add({
    text: '<i class="fa fa-angle-left"></i>',
    tooltip: '좌측플로팅',
    fn: function(e) {
      $(el)
      .removeClass('ff-image-float-right')
      .addClass('ff-image-float-left');
    }
  }, 0);
}

ImagePart.prototype = Object.create(Part.prototype, {
  create: {
    value: function(arg) {
      var src;
      var title;
      
      if( typeof arg === 'object' ) {
        src = arg.src;
        title = arg.title;
      } else if( typeof arg === 'string' ) {
        src = arg;
      }
      
      var el = document.createElement('img');
      el.src = src || 'https://goo.gl/KRjd3U';
      el.setAttribute('ff-type', 'image');
      el.setAttribute('class', 'ff-image');
      if( title ) el.setAttribute('title', title);
      
      return el;
    }
  }
});

module.exports = ImagePart;

