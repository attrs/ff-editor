var $ = require('tinyselector');
var context = require('../../context.js');
var Items = require('../../items.js');

module.exports = new Items()
.add({
  text: '<i class="fa fa-align-justify"></i>',
  tooltip: '정렬',
  onupdate: function() {
    var btn = this;
    var part = this.owner();
    var valign = part.valign();
    
    if( valign == 'middle' ) btn.text('<i class="fa fa-align-right ff-vert"></i>');
    else if( valign == 'bottom' ) btn.text('<i class="fa fa-align-left ff-vert"></i>');
    else btn.text('<i class="fa fa-align-center ff-vert"></i>');
  },
  fn: function(e) {
    var btn = this;
    var part = this.owner();
    var valign = part.valign();
    
    if( valign == 'middle' ) part.valign('bottom');
    else if( valign == 'bottom' ) part.valign(false);
    else part.valign('middle');
  }
});