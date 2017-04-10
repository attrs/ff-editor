var $ = require('tinyselector');
var Toolbar = require('./toolbar.js');

Toolbar.Button = require('./types/button.js');
Toolbar.Separator = require('./types/separator.js');
Toolbar.ListButton = require('./types/list.js');

Toolbar.update = function() {
  $('.ff-toolbar').each(function(i, el) {
    var toolbar = el.toolbar;
    toolbar && toolbar.update();
  });
};

module.exports = Toolbar;