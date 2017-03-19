var $ = require('tinyselector');
var Button = require('./types/');

function Buttons(toolbar) {
  this._toolbar = toolbar;
  this._el = $(toolbar.dom());
  this._first = [];
  this._buttons = [];
  this._last = [];
}

Buttons.prototype = {
  toolbar: function() {
    return this._toolbar;
  },
  update: function() {
    var el = this._el[0];
    var append = function(btns) {
      btns.forEach(function(btn) {
        btn.appendTo(el).update();
      });
    };
    
    append(this._first);
    append(this._buttons);
    append(this._last);
    return this;
  },
  add: function(btn, index) {
    if( !btn ) return this;
    if( !Array.isArray(btn) ) btn = [btn];
    
    var owner = this._toolbar.owner();
    var btns = this._buttons;
    btn.forEach(function(btn) {
      btn = Button.eval(btn).owner(owner);
      
      if( btn ) {
        if( index >= 0 ) btns.splice(index++, 0, btn);
        else btns.push(btn);
      }
    });
    
    this.update();
    return this;
  },
  first: function(btn, index) {
    if( !btn ) return this;
    if( !Array.isArray(btn) ) btn = [btn];
    
    var owner = this._toolbar.owner();
    var btns = this._first;
    btn.forEach(function(btn) {
      btn = Button.eval(btn).owner(owner);
      
      if( btn ) {
        if( index >= 0 ) btns.splice(index++, 0, btn);
        else btns.push(btn);
      }
    });
    
    this.update();
    return this;
  },
  last: function(btn, index) {
    if( !btn ) return this;
    if( !Array.isArray(btn) ) btn = [btn];
    
    var owner = this._toolbar.owner();
    var btns = this._last;
    btn.forEach(function(btn) {
      btn = Button.eval(btn).owner(owner);
      
      if( btn ) {
        if( index >= 0 ) btns.splice(index++, 0, btn);
        else btns.push(btn);
      }
    });
    
    this.update();
    return this;
  },
  remove: function(btn) {
    if( !btn ) return this;
    if( !Array.isArray(btn) ) btn = [btn];
    
    var remove = function(btns) {
      btns.forEach(function(btn) {
        if( ~btns.indexOf(btn) ) btns.splice(btns.indexOf(btn), 1);
      });
    };
    
    remove(this._last);
    remove(this._first);
    remove(this._buttons);
    
    this.update();
    return this;
  },
  clear: function() {
    this._el.html();
    return this;
  }
};

module.exports = Buttons;