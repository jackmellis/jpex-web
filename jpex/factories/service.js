  jpx.factories.factories.Service = function (name, dependencies, fn, singleton) {
    if (typeof dependencies === 'function'){
      singleton = fn;
      fn = dependencies;
      dependencies = null;
    }

    if (typeof fn !== 'function'){
      return this;
    }

    if (fn.extend && fn.Register && fn.Register.Factory){
      return jaas.call(this, name, dependencies, fn, singleton);
    }

    if (dependencies){
      dependencies = [].concat(dependencies);
    }else{
      dependencies = jpx.resolver.extractParameters(fn);
    }

    function factory(){
      var args = Array.prototype.slice.call(arguments);
      args.unshift({});
      return jpx.instantiator(fn, args);
    }

    return this.Register.Factory(name, dependencies, factory, singleton);
  };

  // Jpex Class As A Service
  function jaas(name, dependencies, Fn, singleton){
    // Assuming the parameters have been validated and sorted already
    dependencies = dependencies ? [].concat(dependencies) : [];
    dependencies.unshift('$namedParameters');

    function instantiator(){
      var args = Array.prototype.slice.call(arguments);

      var params = {};

      // Get factory dependencies
      var i = 1;
      dependencies.forEach(function(key, index){
        if (index === 0){return;}

        if (typeof key === 'object'){
          Object.keys(key).forEach(function(key2){
            var val = args[i++];
            if (val !== undefined){
              params[key2] = val;
            }
          });
        }else{
          var val = args[i++];
          if (val !== undefined){
            params[key] = val;
          }
        }
      });

      // Get named dependencies
      if (args[0] && typeof args[0] === 'object'){
        Object.keys(args[0]).forEach(function(key){
          var val = args[0][key];
          if (val !== undefined){
            params[key] = args[0][key];
          }
        });
      }

      // Instantiate the class
      return new Fn(params);
    }

    var service = this.Register.Factory(name, dependencies, instantiator, singleton);
    if (Fn.Interface){
      service.interface(Fn.Interface);
    }
    return service;
  }
