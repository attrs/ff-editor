var $ = require('tinyselector');
var Button = require('./button.js');

require('./separator.less');

function Separator() {
  Button.apply(this, arguments);
  $(this.dom()).ac('ff-toolbar-separator-btn');
}

var proto = Separator.prototype = Object.create(Button.prototype);

proto.handleEvent = function(e) {};

module.exports = Separator;