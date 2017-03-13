var $ = require('tinyselector');

function Separator(options) {
  self.el = $('<div class="ff-toolbar-separator"></div>')[0];
}

Separator.prototype = {
  owner: function(owner) {
    if( !arguments.length ) return this._owner;
    this._owner = owner;
    return this;
  },
  appendTo: function(parent) {
    $(parent).append(this.el);
    return this;
  },
  remove: function() {
    $(this.el).remove();
    return this;
  }
};

module.exports = Separator;