// Create an Enumeration
(function(jpx) {
  jpx.factories.factories.Enum = function(name, value){
    var self = this;

    var obj = {};
    var lastIndex = -1;

    [].concat(value).forEach(function(v){
      switch(typeof v){
        case 'object':
          Object.keys(v).forEach(function(v2){
            var id = v[v2];
            obj[v2] = id;
            if (typeof id === 'number' && id > lastIndex){
              lastIndex = id;
            }
          });
          break;
        case 'string':
        case 'number':
          obj[v] = ++lastIndex;
          break;
      }
    });

    Object.freeze(obj);

    return this.Register.Constant(name, obj);
  };
}(jpx));
