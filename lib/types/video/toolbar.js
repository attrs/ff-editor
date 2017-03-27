var $ = require('tinyselector');
var context = require('../../context.js');
var Items = require('../../items.js');

module.exports = new Items()
.add({
  text: '<i class="fa fa-circle-o"></i>',
  tooltip: '작은크기',
  fn: function(e) {
    $(this.owner().dom())
    .rc('f_video_fit')
    .ac('f_video_narrow');
  }
})
.add({
  text: '<i class="fa fa-arrows-alt"></i>',
  tooltip: '화면에 맞춤',
  fn: function(e) {
    $(this.owner().dom())
    .ac('f_video_fit')
    .rc('f_video_narrow');
  }
});