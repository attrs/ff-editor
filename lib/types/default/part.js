var PartBase = require('../../partbase.js');

function Part(el) {
  PartBase.call(this, el);
}

Part.prototype = Object.create(PartBase.prototype, {
});

module.exports = Part;