module.exports = function(el) {
  var top = 0;
  var left = 0;
  
  do {
    if ( +el.offsetTop ) top += el.offsetTop;
    if ( +el.offsetLeft ) left += el.offsetLeft;
  } while( el = el.offsetParent );
  
  return {
    top: top,
    left: left,
    width: el.offsetWidth,
    height: el.offsetHeight
  };
};