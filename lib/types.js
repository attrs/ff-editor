var types = {
  html: require('./types/html.js'),
  //image: require('./types/image.js'),
  //article: require('./types/article.js')
};

module.exports = {
  get: function(id) {
    return types[id];
  },
  add: function(id, handler) {
    if( !id ) throw new TypeError('missing id');
    if( typeof id !== 'string' ) throw new TypeError('id must be a string');
    if( typeof handler !== 'function' ) throw new TypeError('type plugin must be a function');
    
    types[id] = handler;
    return this;
  },
  exists: function(id) {
    return !!types[id];
  }
};