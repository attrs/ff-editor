var $ = require('tinyselector');
var context = require('../../context.js');
var Part = context.Part;
var Toolbar = context.Toolbar;

require('./image.less');

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
  var el = $(dom).ac('ff-image')
  .on('click', function(e) {
    if( self.editmode() ) return;
    
    context.fire('imageshow', {
      originalEvent: e,
      image: dom,
      src: dom.src,
      part: self
    });
  });
  
  el.on('dragend', function(e) {
    if( this.editmode() && !$(this.dom()).parent().hc('ff-image-float-wrap') ) {
      this.floating(false);
    }
  }.bind(this));
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
  .attr('title', title)
  .src(src || 'https://goo.gl/KRjd3U')[0];
};

proto.floating = function(direction) {
  var el = $(this.dom());
  if( !arguments.length ) return el.hc('ff-image-float-left') ? 'left' : el.hc('ff-image-float-left') ? 'right' : false;
  
  var ctx = this.context();
  var paragraph = Part(el[0].nextSibling);
  
  el.unwrap('.ff-image-float-wrap');
  
  if( !(paragraph instanceof ctx.Paragraph) ) {
    paragraph = new ctx.Paragraph();
  }
  
  if( direction === 'left' ) {
    el
    .rc('ff-image-float-right')
    .ac('ff-image-float-left')
    .wrap('<div class="ff-image-float-wrap ff-acc" />')
    .parent()
    .on('click', function(e) {
      if( e.target !== el[0] ) paragraph.focus();
    })
    .append(paragraph.dom());
  } else if( direction === 'right' ) {
    el
    .rc('ff-image-float-left')
    .ac('ff-image-float-right')
    .wrap('<div class="ff-image-float-wrap ff-acc" />')
    .parent()
    .on('click', function(e) {
      if( e.target !== el[0] ) paragraph.focus();
    })
    .append(paragraph.dom());
  } else {
    el
    .rc('ff-image-float-right')
    .rc('ff-image-float-left');
  }
};

module.exports = ImagePart;

