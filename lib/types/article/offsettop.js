module.exports = function(el) {
  var top = 0;
  do {
    if( !isNaN( el.offsetTop ) ) top += el.offsetTop;
  } while( el = el.offsetParent );
  return top;
};