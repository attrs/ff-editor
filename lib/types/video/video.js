var $ = require('tinyselector');
var context = require('../../context.js');
var Part = require('../../part.js');
var Toolbar = require('../../toolbar/');

require('./video.less');

function translatesrc(src) {
  if( ~src.indexOf('youtube.com') ) {
    var vid = src.split('v=')[1];
    vid = vid && vid.split('&')[0];
    vid = vid && vid.split('#')[0];
    
    if( vid ) src = 'https://www.youtube.com/embed/' + vid;
  } else if( ~src.indexOf('vimeo.com') ) {
    var vid = src.split('//')[1];
    vid = vid && vid.split('/')[1];
    vid = vid && vid.split('?')[0];
    vid = vid && vid.split('&')[0];
    vid = vid && vid.split('#')[0];
    
    if( vid ) src = 'https://player.vimeo.com/video/' + vid;
  }
  
  return src;
}

function VideoPart() {
  Part.apply(this, arguments);
}

var items = VideoPart.toolbar = require('./toolbar.js');
var proto = VideoPart.prototype = Object.create(Part.prototype);

proto.createToolbar = function() {
  return new Toolbar(this).position(items.position).add(items);
};

proto.create = function(arg) {
  var src = translatesrc((arg && arg.src) || arg) || 'about:blank';
  
  return $('<div ff-type="video" />').ac('f_video_16by9').html('<div class="f_video_container"><iframe src="' + src + '" frameborder="0" nwebkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div>')[0];
};

proto.src = function(src) {
  var el = $(this.dom());
  if( !arguments.length ) return el.find('iframe').src;
  
  src = translatesrc(src) || 'about:blank';
  if( src ) el.find('iframe').src = src;
  
  return this;
};

proto.oninit = function() {
  $(this.dom()).ac('ff-video');
};

proto.onmodechange = function() {
  var el = $(this.dom());
  if( this.editmode() ) {
    if( !el.find('.ff-mask').length ) $('<div class="ff-mask"></div>').appendTo(el[0]);
    el.find('.ff-mask').show();
  } else {
    el.find('.ff-mask').hide();
  }
};

module.exports = VideoPart;

