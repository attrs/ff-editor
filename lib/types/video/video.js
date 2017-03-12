var $ = require('tinyselector');
var Part = require('../../part.js');

require('./video.less');

function VideoPart(el) {
  el = Part.call(this, el);
  
  this.on('modechange', function(e) {
    if( e.detail.editmode ) {
      el.querySelector('.mask').style.display = 'block';
    } else {
      el.querySelector('.mask').style.display = '';
    }
  });
  
  this.toolbar()
  .add({
    text: '<i class="fa fa-circle-o"></i>',
    tooltip: '작은크기',
    fn: function(e) {
      $(el)
      .removeClass('ff-video-size-fit')
      .addClass('ff-video-size-narrow');
    }
  }, 0)
  .add({
    text: '<i class="fa fa-arrows-alt"></i>',
    tooltip: '화면에 맞춤',
    fn: function(e) {
      $(el)
      .removeClass('ff-video-size-narrow')
      .addClass('ff-video-size-fit');
    }
  }, 0);
}

VideoPart.prototype = Object.create(Part.prototype, {
  create: {
    value: function(arg) {
      var el = document.createElement('div');
      
      el.innerHTML = '<div class="ff-video-embed-responsive ff-video-embed-responsive-16by9"><iframe class="ff-video-embed-responsive-item" src="' + (arg || 'https://www.youtube.com/embed/aoKNQF2a4xY') + '" frameborder="0" nwebkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div><div class="mask"></div>';
      el.setAttribute('ff-type', 'video');
      el.setAttribute('class', 'ff-video');
      
      return el;
    }
  }
});

module.exports = VideoPart;

