var $ = require('tinyselector');
var context = require('../../context.js');
var Part = require('../../part.js');
var Toolbar = require('../../toolbar/');

require('./image.less');

function translatesrc(src) {
  if( src && ~src.indexOf('instagram.com') ) {
    var vid = src.split('//')[1];
    vid = vid && vid.split('/p/')[1];
    vid = vid && vid.split('/')[0];
    
    if( vid ) src = 'https://www.instagram.com/p/' + vid + '/media';
  }
  
  return src;
}

function ImagePart(el) {
  Part.apply(this, arguments);
}

var items = ImagePart.toolbar = require('./toolbar.js');
var proto = ImagePart.prototype = Object.create(Part.prototype);

proto.createToolbar = function() {
  return new Toolbar(this).position(items.position || 'inside top center').add(items);
};

proto.oninit = function() {
  var self = this;
  var dom = this.dom();
  var el = $(dom)
  .on('click', function(e) {
    if( !self.editmode() ) context.fire('ff-imageshow', {
      originalEvent: e,
      image: dom,
      src: dom.src,
      part: self
    });
  });
};

proto.create = function(arg) {
  var src;
  var title;
  
  if( typeof arg === 'object' ) {
    src = arg.src;
    title = arg.name || arg.title;
  } else {
    src = arg;
  }
  
  return $('<img/>')
  .ac('f_img_block')
  .attr('title', title)
  .src(translatesrc(src))[0];
};

proto.src = function(src) {
  if( !arguments.length ) return this.dom().src;
  
  src = translatesrc(src);
  if( src ) this.dom().src = src;
  
  return this;
};

proto.title = function(title) {
  var el = $(this.dom());
  if( !arguments.length ) return el.attr('title');
  el.attr('title', title);
  return this;
};

proto.floating = function(direction) {
  var el = $(this.dom());
  if( !arguments.length ) return el.hc('f_pullleft') ? 'left' : el.hc('f_pullright') ? 'right' : false;
  
  el.rc('f_pullleft f_pullright')
  if( direction == 'left' ) el.ac('f_pullleft');
  else if( direction == 'right') el.ac('f_pullright');
  
  return this;
};

proto.blockmode = function(mode) {
  var el = $(this.dom());
  if( !arguments.length ) return el.hc('f_img_block') ? 'natural' : 
    el.hc('f_img_full') ? 'full' : 
    el.hc('f_img_medium') ? 'medium' : false;
  
  el.rc('f_pullleft f_pullright f_img_block f_img_medium f_img_full');
  if( mode == 'natural' ) el.ac('f_img_block');
  else if( mode == 'medium') el.ac('f_img_medium');
  else if( mode == 'full') el.ac('f_img_full');
  
  return this;
};

proto.createHistory = function() {
  var part = this;
  var dom = part.dom();
  return (function(src, cls, css) {
    return function() {
      dom.src = src;
      dom.className = cls || '';
      dom.style.cssText = css || '';
      part.focus();
    };
  })(dom.src, dom.className, dom.style.cssText);
};

module.exports = ImagePart;

