var $ = require('tinyselector');

function Separator(options) {
  self.el = $('<div class="ff-toolbar-separator"></div>')[0];
}

Separator.prototype = {
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