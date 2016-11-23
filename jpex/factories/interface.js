(function(jpx) {
  var util = {
    string : '',
    number : 0,
    null : null,
    boolean : true,
    object : {},
    array : [],
    function : function(){},

    arrayOf : function(){
      return [util.either.apply(util, arguments)];
    },
    functionWith : function(obj){
      var fn = function(){};
      Object.keys(obj).forEach(function(k){
        fn[k] = obj[k];
      });
      return fn;
    },
    either : function(){
      var arr = Array.prototype.slice.call(arguments);
      if (arr.length === 1){
        return arr[0];
      }
      arr.iType = 'either';
      return arr;
    },
    any : function(){
      var arr = [];
      arr.iType = 'any';
      return arr;
    }
  };

  jpx.factories.factories.Interface = function(name, fn, ifc){
    if (ifc){
      ifc = [].concat(ifc);
    }
    this._interfaces[name] = {
      name : name,
      pattern : fn(util),
      interface : ifc
    };
    return jpx.factories.wrapper(this._interfaces[name]);
  };
}(jpx));
