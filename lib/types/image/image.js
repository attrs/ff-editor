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

ImagePart.placeholder = 'Caption Here';

var items = ImagePart.toolbar = require('./toolbar.js');
var proto = ImagePart.prototype = Object.create(Part.prototype);

proto.createToolbar = function() {
  return new Toolbar(this).position(items.position || 'inside top center').add(items);
};

proto.oninit = function() {
  var part = this;
  var dom = part.dom();
  
  var el = $(dom)
  .ac('f_img')
  .on('click', function(e) {
    if( !part.editmode() ) context.fire('ff-imageshow', {
      originalEvent: e,
      image: img[0] || dom,
      src: (img[0] || dom).src,
      part: part
    });
  });
  
  var img = el.find('img')
  .on('load', function(e) {
    part.fire(e.type);
  });
  
  var placeholder = part._placeholder = $('<div class="ff-placeholder ff-acc"/>')
  .attr('contenteditable', false)
  .html(el.attr('placeholder') || ImagePart.placeholder || '');
  
  var placeholderlistener = function(e) {
    var figcaption = el.find('figcaption');
    placeholder.remove();
    
    if( e.type == 'mousedown' ) return figcaption[0].click();
    
    setTimeout(function() {
      var caption = figcaption.html();
      if( !caption ) {
        placeholder.appendTo(figcaption);
      }
    }, 10);
  };
  
  part.on('ff-modechange', function() {
    var el = $(part.dom());
    var figcaption = el.find('figcaption');
  
    figcaption
    .off('mousedown', placeholderlistener)
    .off('keydown', placeholderlistener)
    .off('keyup', placeholderlistener);
    
    placeholder.off('mousedown', placeholderlistener);
    part.off('ff-blur', placeholderlistener);
    
    if( part.editmode() ) {
      if( !figcaption.length ) figcaption = $('<figcaption/>').appendTo(el);
      
      var caption = figcaption.html();
      if( !caption ) {
        placeholder.appendTo(figcaption);
      }
      
      figcaption
      .on('mousedown', placeholderlistener)
      .on('keydown', placeholderlistener)
      .on('keyup', placeholderlistener);
      
      placeholder.on('mousedown', placeholderlistener);
      part.on('ff-blur', placeholderlistener);
      
      figcaption.attr('contenteditable', true);
    } else {
      placeholder.remove();
      
      figcaption.attr('contenteditable', null);
    }
  });
};

proto.create = function(arg) {
  var src;
  var title;
  var caption;
  
  if( typeof arg === 'object' ) {
    src = arg.src;
    title = arg.name || arg.title;
    caption = arg.caption;
  } else {
    src = arg;
  }
  
  var el = $('<img/>')
  .attr('title', title)
  .src(translatesrc(src));
  
  if( caption ) {
    if( typeof caption !== 'string' ) caption = '';
    el = $('<figure/>').append(el).append($('<figcaption/>').html(caption));
  } else {
    el.ac('f_img_block');
  }
  
  return el[0];
};

proto.img = function() {
  var dom = this.dom();
  if( dom.tagName == 'IMG' ) return dom;
  return $(dom).find('img')[0];
};

proto.figcaption = function() {
  return $(this.dom()).find('figcaption')[0];
};

proto.src = function(src) {
  if( !arguments.length ) return this.img().src;
  
  src = translatesrc(src);
  if( src ) this.img().src = src;
  
  return this;
};

proto.title = function(title) {
  var el = $(this.img());
  if( !arguments.length ) return el.attr('title');
  el.attr('title', title);
  return this;
};

proto.isFigure = function() {
  var dom = this.dom();
  return dom.tagName == 'FIGURE' ? true : false;
};

proto.caption = function(caption) {
  var part = this;
  var dom = part.dom();
  
  if( !arguments.length ) return $(dom).find('figcaption').html();
  
  var el = $(part.dom());
  var parentpart = part.parent();
  var floating = part.floating();
  var blockmode = part.blockmode();
  
  var newpart = new ImagePart({
    src: part.src(),
    title: part.title(),
    caption: caption
  }).blockmode(blockmode).floating(floating);
  
  el.after(newpart.dom()).remove();
  
  return this;
};

proto.floating = function(direction) {
  var el = $(this.dom());
  if( !arguments.length ) return el.hc('f_pullleft') ? 'left' : el.hc('f_pullright') ? 'right' : false;
  
  el.rc('f_pullleft f_pullright')
  if( direction == 'left' ) el.ac('f_pullleft');
  else if( direction == 'right' ) el.ac('f_pullright');
  
  return this;
};

proto.blockmode = function(mode) {
  var el = $(this.dom());
  if( !arguments.length ) return el.hc('f_img_block') ? 'natural' : 
    el.hc('f_img_full') ? 'full' : 
    el.hc('f_img_medium') ? 'medium' : false;
  
  el.rc('f_img_block f_img_medium f_img_full');
  if( mode == 'natural' ) el.ac('f_img_block');
  else if( mode == 'medium') el.ac('f_img_medium');
  else if( mode == 'full') el.ac('f_img_full');
  else el.rc('f_pullleft f_pullright');
  
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

