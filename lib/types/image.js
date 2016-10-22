module.exports = function(el) {
  return {
    init: function(done) {
      done();
    },
    setData: function(src) {
      if( data.src ) el.src = data.src;
    },
    getData: function() {
      return {
        src: el.src
      };
    },
    editmode: function(b) {
    }
  };
};