var $ = require('tinyselector');
var Button = require('./button.js');

function ListButton() {
  Button.apply(this, arguments);
  
  this._el.ac('ff-toolbar-list-btn');
}

ListButton.prototype = Object.create(Button.prototype, {
  handleEvent: {
    value: function(e) {
      if( e.type == 'click' ) {
        e.stopPropagation();
        this.click(e);
        this.toggleList();
        this.update(e);
      }
    }
  },
  toggleList: {
    value: function() {
      console.log('toggle');
    }
  },
  text: {
    value: function(txt) {
      this._el.html(txt);
      return this;
    }
  }
});

module.exports = ListButton;