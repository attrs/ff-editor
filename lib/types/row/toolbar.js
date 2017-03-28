var $ = require('tinyselector');
var context = require('../../context.js');
var Items = require('../../items.js');

module.exports = new Items()
.add({
  text: '<i class="fa fa-align-justify"></i>',
  tooltip: '정렬',
  onupdate: function(btn) {
    var part = this;
    var valign = part.valign();
    
    if( valign == 'middle' ) btn.text('<i class="fa fa-align-center ff-vert"></i>');
    else if( valign == 'bottom' ) btn.text('<i class="fa fa-align-left ff-vert"></i>');
    else if( valign == 'justify' ) btn.text('<i class="fa fa-align-justify ff-vert"></i>');
    else btn.text('<i class="fa fa-align-right ff-vert"></i>');
  },
  fn: function(btn) {
    var part = this;
    var valign = part.valign();
    
    if( valign == 'middle' ) part.valign('bottom');
    else if( valign == 'bottom' ) part.valign('justify');
    else if( valign == 'justify' ) part.valign(false);
    else part.valign('middle');
  }
});