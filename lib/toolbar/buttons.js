var $ = require('tinyselector');
var Button = require('./types/');

function Buttons(toolbar) {
  var self = this;
  self._toolbar = toolbar;
  self._el = $(toolbar.dom());
  self._first = [];
  self._buttons = [];
  self._last = [];
}

Buttons.prototype = {
  toolbar: function() {
    return this._toolbar;
  },
  update: function() {
    var self = this;
    var toolbar = self.toolbar();
    var scope = toolbar.scope();
    var el = self._el.empty()[0];
    var list = self._list = [];
    var append = function(btns) {
      btns.forEach(function(btn) {
        btn.scope(scope).toolbar(toolbar).appendTo(el).update();
        list.push(btn);
        if( btn.id ) list[btn.id] = btn;
      });
    };
    
    append(self._first);
    append(self._buttons);
    append(self._last);
    return self;
  },
  get: function(id) {
    return this._list && this._list[id];
  },
  add: function(btn, index) {
    var self = this;
    if( !btn ) return self;
    
    var btns = self._buttons;
    $.each(btn, function() {
      var btn = Button.eval(this);
      if( !btn ) return;
      
      if( index >= 0 ) btns.splice(index++, 0, btn);
      else btns.push(btn);
    });
    
    self.update();
    return self;
  },
  first: function(btn, index) {
    var self = this;
    if( !btn ) return this;
    
    var btns = self._first;
    
    $.each(btn, function() {
      var btn = Button.eval(this);
      if( !btn ) return;
      
      if( index >= 0 ) btns.splice(index++, 0, btn);
      else btns.push(btn);
    });
    
    self.update();
    return self;
  },
  last: function(btn, index) {
    var self = this;
    if( !btn ) return self;
    
    var btns = self._last;
    
    $.each(btn, function() {
      var btn = Button.eval(this);
      if( !btn ) return;
      
      if( index >= 0 ) btns.splice(index++, 0, btn);
      else btns.push(btn);
    });
    
    self.update();
    return self;
  },
  remove: function(target) {
    var self = this;
    if( ~['string', 'number'].indexOf(typeof target) ) target = self.get(target);
    if( !target ) return self;
    
    var remove = function(btns) {
      btns.forEach(function(btn) {
        if( btn === target ) btns.splice(btns.indexOf(btn), 1);
      });
    };
    
    remove(self._first);
    remove(self._buttons);
    remove(self._last);
    
    self.update();
    return self;
  },
  clear: function() {
    var self = this;
    self._first = [];
    self._buttons = [];
    self._last = [];
    self.update();
    return self;
  }
};

module.exports = Buttons;