var $ = require('tinyselector');
var Button = require('./button.js');

require('./list.less');

function ListButton(options) {
  Button.apply(this, arguments);
  
  var dropdown = this._dropdown = $('<ul/>').ac('ff-toolbar-list-dropdown').html('dropdown');
  $(this.dom()).ac('ff-toolbar-list-btn').append(dropdown);
  
  options && options.items && this.items(options.items);
}

var proto = ListButton.prototype = Object.create(Button.prototype);

proto.dropdown = function() {
  return this._dropdown[0];
};

proto.handleEvent = function(e) {
  this.toggleList();
  Button.prototype.handleEvent.call(this, e);
};

proto.toggleList = function() {
  $(this.dropdown()).tc('open');
  return this;
};

proto.text = function(txt) {
  this._el.html(txt).append(this.dropdown());
  return this;
};

proto.select = function(item) {
  var items = this.items();
  var index = items.indexOf(item);
  var o = this.options();
  var fn = o.onselect;
  fn && fn.call(this.scope(), item, index, this);
  return this;
};

proto.items = function(items) {
  if( !arguments.length ) return this._items;
  if( !items ) items = [];
  
  var self = this;
  var dropdown = $(this.dropdown()).empty()[0];
  this._items = $.each(items, function(i, item) {
    var html = (typeof item == 'string' ? item : item.text) || item;
    $('<li/>').html(html).appendTo(dropdown).on('click', function(e) {
      self.select(item);
    });
  });
  
  return this;
};

$(document).ready(function() {
  $(document.body).on('click', function() {
    $('.ff-toolbar-list-dropdown').rc('open');
  });
});


module.exports = ListButton;