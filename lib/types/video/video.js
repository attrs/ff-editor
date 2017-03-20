var $ = require('tinyselector');
var Part = require('../../part.js');

require('./video.less');

function VideoPart() {
  Part.apply(this, arguments);
  
  var el = $(this.dom()).ac('ff-video');
  
  this.toolbar()
  .add({
    text: '<i class="fa fa-circle-o"></i>',
    tooltip: '작은크기',
    fn: function(e) {
      el
      .rc('ff-video-size-fit')
      .ac('ff-video-size-narrow');
    }
  }, 0)
  .add({
    text: '<i class="fa fa-arrows-alt"></i>',
    tooltip: '화면에 맞춤',
    fn: function(e) {
      el
      .rc('ff-video-size-narrow')
      .ac('ff-video-size-fit');
    }
  }, 0);
}

VideoPart.prototype = Object.create(Part.prototype, {
  onmodechange: {
    value: function() {
      var el = $(this.dom());
      if( this.editmode() ) {
        if( !el.find('.mask').length ) $('<div class="mask"></div>').appendTo(el);
        el.find('.mask').show();
      } else {
        el.find('.mask').hide();
      }
    }
  },
  create: {
    value: function(arg) {
      return $('<div ff-type="video" />').html('<div class="ff-video-embed-responsive ff-video-embed-responsive-16by9"><iframe class="ff-video-embed-responsive-item" src="' + (arg || 'https://www.youtube.com/embed/aoKNQF2a4xY') + '" frameborder="0" nwebkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div>')[0];
    }
  }
});

module.exports = VideoPart;

