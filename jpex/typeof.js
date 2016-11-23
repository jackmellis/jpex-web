(function(jpx) {
  var standardTypes = ['number', 'boolean', 'string', 'array', 'function', 'date', 'regexp', 'null', 'undefined'];
  jpx.typeof = function(obj){
    var t = Object.prototype.toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    return standardTypes.indexOf(t) < 0 ? 'object' : t;
  };
}(jpx));
