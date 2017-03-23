var $ = require('tinyselector');
var context = require('../../context.js');
var Items = context.Items;

module.exports = new Items()
.add({
  text: '<i class="fa fa-dedent"></i>',
  tooltip: '좌측플로팅',
  fn: function(e) {
    this.owner().floating('left');
  }
})
.add({
  text: '<i class="fa fa-angle-up"></i>',
  tooltip: '플로팅제거',
  onupdate: function() {
    if( this.owner().floating() ) this.show();
    else this.hide();
  },
  fn: function(e) {
    this.owner().floating(false);
  }
})
.add({
  text: '<i class="fa fa-dedent ff-flip"></i>',
  tooltip: '우측플로팅',
  fn: function(e) {
    this.owner().floating('right');
  }
})
.add({
  text: '<i class="fa fa-circle-o"></i>',
  tooltip: '원본크기',
  onupdate: function() {
    if( this.owner().floating() ) this.hide();
    else this.show();
  },
  fn: function(e) {
    $(this.owner().dom())
    .rc('ff-image-size-full')
    .rc('ff-image-size-medium');
  }
})
.add({
  text: '<i class="fa fa-square-o"></i>',
  tooltip: '기본크기',
  onupdate: function() {
    if( this.owner().floating() ) this.hide();
    else this.show();
  },
  fn: function(e) {
    $(this.owner().dom())
    .rc('ff-image-size-full')
    .ac('ff-image-size-medium');
  }
})
.add({
  text: '<i class="fa fa-arrows-alt"></i>',
  tooltip: '풀사이즈',
  onupdate: function() {
    if( this.owner().floating() ) this.hide();
    else this.show();
  },
  fn: function(e) {
    $(this.owner().dom())
    .rc('ff-image-size-medium')
    .ac('ff-image-size-full');
  }
});