var Button = require('./button.js');
var Separator = require('./separator.js');
var ListButton = require('./list.js');

Button.eval = function(o) {
  if( !o ) return null;
  if( o instanceof Button ) return o;
  
  if( o == '-' || o.type == 'separator' ) return new Separator(o);
  else if( o.type == 'list' ) return new ListButton(o);
  
  return new Button(o);
};

Button.Separator = Separator;
Button.ListButton = ListButton;

module.exports = Button;