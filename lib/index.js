var types = {
  html: require('./types/html.js')
};

module.exports = {
  endpoint: function(endpoint) {
    conn.endpoint(endpoint);
    return this;
  },
  render: function(parts, done) {
    done = typeof done === 'function' ? done : function(err) { if( err ) return console.error(err); };
    
    
    return this;
  },
  editmode: function(mode) {
    
  },
  types: {
    add: function(id, handler) {
      types[id] = handler;
      return this;
    }
  }
};

