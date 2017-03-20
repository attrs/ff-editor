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
    var list = this._list = [];
    var append = function(btns) {
      btns.forEach(function(btn) {
        btn.appendTo(el).update();
        list.push(btn);
        if( btn.id ) list[btn.id] = btn;
      });
    };
    
    append(this._first);
    append(this._buttons);
    append(this._last);
    return this;
  },
  get: function(id) {
    return this._list && this._list[id];
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
  remove: function(target) {
    if( ~['string', 'number'].indexOf(typeof target) ) target = this.get(target);
    if( !target ) return this;
    
    var remove = function(btns) {
      btns.forEach(function(btn) {
        if( btn === target ) btns.splice(btns.indexOf(btn), 1);
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