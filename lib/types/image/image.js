var $ = require('tinyselector');
var Part = require('../default/part.js');
var Toolbar = require('../../toolbar.js');

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

