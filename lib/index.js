var types = {
  html: require('./types/html.js')
};

module.exports = {
  render: function(parts, done) {
    done = typeof done === 'function' ? done : function(err) { if( err ) return console.error(err); };
    
    
    return this;
  },
  editmode: function(mode) {
    
  },
  types: {
    get: function(id) {
      return types[id];
    }
    add: function(id, handler) {
      types[id] = handler;
      return this;
    }
  }
};

