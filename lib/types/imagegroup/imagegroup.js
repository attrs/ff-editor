var $ = require('tinyselector');
var Part = require('../../part.js');
var Toolbar = require('../../toolbar.js');

require('./imagegroup.less');

function ImageGroup(el) {
  Part.call(this, el);
  
  var el = this.dom();
  
  this.toolbar()
  .add({
    text: '<i class="fa fa-angle-double-up"></i>',
    tooltip: '상단정렬',
    fn: function(e) {
      $(el)
      .removeClass('ff-imagegroup-valign-bottom')
      .removeClass('ff-imagegroup-valign-middle')
      .addClass('ff-imagegroup-valign-top');
    }
  }, 0)
  .add({
    text: '<i class="fa fa-dot-circle-o"></i>',
    tooltip: '중앙정렬',
    fn: function(e) {
      $(el)
      .removeClass('ff-imagegroup-valign-bottom')
      .removeClass('ff-imagegroup-valign-top')
      .addClass('ff-imagegroup-valign-middle');
    }
  }, 0)
  .add({
    text: '<i class="fa fa-angle-double-down"></i>',
    tooltip: '하단정렬',
    fn: function(e) {
      $(el)
      .removeClass('ff-imagegroup-valign-top')
      .removeClass('ff-imagegroup-valign-middle')
      .addClass('ff-imagegroup-valign-bottom');
    }
  }, 0);
}

ImageGroup.prototype = Object.create(Part.prototype, {
  create: {
    value: function(srcs) {
      if( !srcs ) srcs = [];
      if( !Array.isArray(srcs) ) srcs = [srcs];
      
      var wp = 100 / srcs.length;
      
      var el = document.createElement('div');
      el.setAttribute('ff-type', 'imagegroup');
      el.setAttribute('class', 'ff-imagegroup');
      
      var row = document.createElement('div');
      row.setAttribute('class', 'ff-imagegroup-row');
      
      srcs.forEach(function(src) {
        var title = src;
        if( typeof src === 'object' ) {
          title = src.title || src.src;
          src = src.src;
        }
        
        row.innerHTML += '<div class="ff-imagegroup-cell" style="width: ' + wp + '%">\
          <img src="' + src + '" title="' + title + '">\
        </div>';
      });
      
      el.appendChild(row);
      console.log('el', el);
      return el;
    }
  }
});

module.exports = ImageGroup;

