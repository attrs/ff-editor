var endpoint;

module.exports = {
  endpoint: function(url) {
    endpoint = url;
  },
  load: function(url, done) {
    done();
  }
}