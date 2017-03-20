var $ = require('tinyselector');
var Part = require('../../part.js');

require('./image.less');

function ImagePart(el) {
  Part.apply(this, arguments);
  
  var el = $(this.dom()).ac('ff-image');
  
  this.toolbar()
  .position('inside top center')
  .add({
    text: '<i class="fa fa-angle-left"></i>',
    tooltip: '좌측플로팅',
    fn: function(e) {
      this.owner().floating('left');
    }
  })
  .add({
    text: '<i class="fa fa-angle-up"></i>',
    tooltip: '플로팅제거',
    fn: function(e) {
      this.owner().floating(false);
    }
  })
  .add({
    text: '<i class="fa fa-angle-right"></i>',
    tooltip: '우측플로팅',
    fn: function(e) {
      this.owner().floating('right');
    }
  })
  .add({
    text: '<i class="fa fa-circle-o"></i>',
    tooltip: '원본크기',
    fn: function(e) {
      el
      .rc('ff-image-size-full')
      .rc('ff-image-size-medium');
    }
  })
  .add({
    text: '<i class="fa fa-square-o"></i>',
    tooltip: '기본크기',
    fn: function(e) {
      el
      .rc('ff-image-size-full')
      .ac('ff-image-size-medium');
    }
  })
  .add({
    text: '<i class="fa fa-arrows-alt"></i>',
    tooltip: '풀사이즈',
    fn: function(e) {
      el
      .rc('ff-image-size-medium')
      .ac('ff-image-size-full');
    }
  });
}

ImagePart.prototype = Object.create(Part.prototype, {
  ondragend: {
    value: function(e) {
      if( this.editmode() && !$(this.dom()).parent().hc('ff-image-float-wrap') ) {
        this.floating(false);
      }
    }
  },
  create: {
    value: function(arg) {
      var src;
      var title;
      
      if( typeof arg === 'object' ) {
        src = arg.src;
        title = arg.title;
      } else {
        src = arg;
      }
      
      return $('<img/>')
      .attr('title', title)
      .src(src || 'https://goo.gl/KRjd3U')[0];
    }
  },
  floating: {
    value: function(direction) {
      if( !arguments.length ) return el.hc('ff-image-float-left') ? 'left' : el.hc('ff-image-float-left') ? 'right' : false;
      
      var ctx = this.context();
      var el = $(this.dom()).unwrap('.ff-image-float-wrap');
      var paragraph = Part(el[0].nextSibling);
      
      if( !(paragraph instanceof ctx.Paragraph) ) {
        paragraph = new ctx.Paragraph();
      }
      
      if( direction === 'left' ) {
        el
        .rc('ff-image-float-right')
        .ac('ff-image-float-left')
        .wrap('<div class="ff-image-float-wrap" />')
        .parent()
        .on('click', function(e) {
          if( e.target !== el[0] ) paragraph.focus();
        })
        .append(paragraph.dom());
      } else if( direction === 'right' ) {
        el
        .rc('ff-image-float-left')
        .ac('ff-image-float-right')
        .wrap('<div class="ff-image-float-wrap" />')
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
    }
  }
});

module.exports = ImagePart;

