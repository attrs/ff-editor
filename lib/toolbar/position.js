module.exports = function(el) {
  var top = 0;
  var left = 0;
  
  var c = el;
  do {
    if ( +c.offsetTop ) top += c.offsetTop;
    if ( +c.offsetLeft ) left += c.offsetLeft;
  } while( c = c.offsetParent );
  
  return {
    top: top,
    left: left,
    width: el.offsetWidth,
    height: el.offsetHeight
  };
};