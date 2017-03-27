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
ImagePart.matches = ['img'];

proto.createToolbar = function() {
  return new Toolbar(this).position(items.position || 'inside top center').add(items);
};

proto.oninit = function() {
  var self = this;
  var dom = this.dom();
  var el = $(dom).ac('ff-image')
  .on('click', function(e) {
    if( !self.editmode() ) context.fire('imageshow', {
      originalEvent: e,
      image: dom,
      src: dom.src,
      part: self
    });
  })
  .on('dragend', function(e) {
    if( self.editmode() && !$(self.dom()).parent().hc('f_img_wrap') )
      self.floating(false);
  })
  .on('drop', function(e) {
    //console.log('drop', e);
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
  if( !arguments.length ) return el.hc('f_img_left') ? 'left' : el.hc('f_img_right') ? 'right' : false;
  
  var ctx = this.context();
  var paragraph = Part(el[0].nextSibling);
  var parent = el.parent();
  
  if( parent.hc('f_img_wrap') ) parent.nodes().unwrap();
  
  if( !(paragraph instanceof ctx.Paragraph) )
    paragraph = new ctx.Paragraph();
  
  if( direction === 'left' ) {
    el
    .rc('f_img_right')
    .ac('f_img_left')
    .wrap('<div class="f_img_wrap ff-acc" />')
    .parent()
    .on('click', function(e) {
      var target = e.target || e.srcElement;
      if( target !== el[0] ) paragraph.focus();
    })
    .append(paragraph.dom());
  } else if( direction === 'right' ) {
    el
    .rc('f_img_left')
    .ac('f_img_right')
    .wrap('<div class="f_img_wrap ff-acc" />')
    .parent()
    .on('click', function(e) {
      var target = e.target || e.srcElement;
      if( target !== el[0] ) paragraph.focus();
    })
    .append(paragraph.dom());
  } else {
    el
    .rc('f_img_right')
    .rc('f_img_left');
  }
};

proto.blockmode = function(mode) {
  var el = $(this.dom());
  if( !arguments.length ) return el.hc('f_img_block') ? 'natural' : 
    el.hc('f_img_full') ? 'full' : 
    el.hc('f_img_medium') ? 'medium' : false;
  
  el.rc('f_img_block f_img_medium f_img_full')
  if( mode == 'natural' ) el.ac('f_img_block');
  else if( mode == 'medium') el.ac('f_img_medium');
  else if( mode == 'full') el.ac('f_img_full');
  
  return this;
};

module.exports = ImagePart;

