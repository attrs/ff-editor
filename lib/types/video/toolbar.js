var $ = require('tinyselector');
var context = require('../../context.js');
var Items = require('../../items.js');

module.exports = new Items()
.add({
  text: '<i class="fa fa-circle-o"></i>',
  tooltip: '크기변경',
  onupdate: function(btn) {
    var el = $(this.dom());
    if( el.hc('f_video_fit') ) btn.text('<i class="fa fa-circle-o"></i>');
    else btn.text('<i class="fa fa-arrows-alt"></i>');
  },
  fn: function() {
    var el = $(this.dom());
    
    if( el.hc('f_video_fit') ) el.rc('f_video_fit').ac('f_video_narrow');
    else el.rc('f_video_narrow').ac('f_video_fit');
  }
});