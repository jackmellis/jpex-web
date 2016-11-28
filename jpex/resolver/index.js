  jpx.resolver = {
    extractParameters : function(fn){
      var reg_comments = /\/\*(.*)\*\//g,
          chr_open = '(',
          chr_close = ')',
          chr_arrow = '=>',
          chr_delimeter = ',';

      // Remove comments
      var str = fn.toString().replace(reg_comments, '');

      // Find the start and end of the function parameters
      var open = str.indexOf(chr_open);
      var close = str.indexOf(chr_close);
      var arrow = str.indexOf(chr_arrow);

      // Arrow functions be declared with no brackets
      if (arrow > -1 && (arrow < open || open < 0)){
          str = str.substring(0, arrow).trim();
          return str ? [str] : [];
      }

      // Pull out the parameters and split into an array
      str = str.substring(open + 1, close);
      return str ? str.split(chr_delimeter).map(function(s) {return s.trim(); }) : [];
    },

    // Resolve all dependencies for a class
    resolveDependencies : function(Class, definition, namedParameters){
      return resolveMany(Class, definition, namedParameters);
    },

    // Resolve a single dependency for a class
    resolve : function(Class, name, namedParameters){
      return resolveDependency(Class, name, null, namedParameters, []);
    }
  };

  // Resolves all dependencies for a factory
  function resolveMany(Class, definition, namedParameters, globalOptions, stack){
    if (!definition || !definition.dependencies){
      return [];
    }
    if (!stack){
      stack = [];
    }
    if (!namedParameters){
      namedParameters = {};
    }

    var args = [].concat(definition.dependencies).map(function(name){
      if (typeof name === 'object'){
        return Object.keys(name).map(function(key){
          resolveDependency(Class, key, name[key], namedParameters, stack)
        });
      }else{
        return [resolveDependency(Class, name, globalOptions, namedParameters, stack)];
      }
    });

    return Array.prototype.concat.apply([], args);
  }

  // Resolves a single dependency
  function resolveDependency(Class, name, localOptions, namedParameters, stack){
    var factory;

    if (!namedParameters){
      namedParameters = {};
    }

    // Special cases
    if (name === '$options'){
      return localOptions;
    }
    if (name === '$namedParameters'){
      return namedParameters;
    }

    var ancestoral = checkAncestoral(name);
    if (ancestoral){
      name = ancestoral;
      if (Class._parent){
        return resolveDependency(Class._parent, name, localOptions, namedParameters, []);
      }
    }
    var optional = checkOptional(name);
    if (optional){
      name = optional;
      optional = true;
    }

    var ifc = Class._interfaces[name], iname;
    if (ifc){
      iname = jpx.resolver.interfaceService.findFactory(Class, name);
      if (iname && iname !== name){
        var t = name;
        name = iname;
        iname = t;
        t = null;
      }
    }

    // Check Named Parameters
    if (iname){
      factory = namedParameters[iname];
      if (factory === undefined){
        Object.keys(namedParameters).forEach(function(n){
          if (jpx.resolver.interfaceService.factoryImplements(Class, n, iname)){
            factory = namedParameters[n];
          }
        });
      }
    }else{
      factory = namedParameters[name];
    }
    if (factory !== undefined){
      jpx.resolver.interfaceService.validateInterface(Class, ifc, factory);
      return factory;
    }

    // Check for recursive loop
    if (stack.indexOf(name) > -1){
      jpx.jpexError(['Recursive loop for dependency', name, 'encountered'].join(' '));
    }

    // Get the factory. If it returns null with no error, it must be optional so just return it
    factory = jpx.resolver.factoryService.getFactory(Class, name, optional);
    if (!factory){
      return factory;
    }

    if (factory.resolved){ // Already been resolved within its lifecycle
      return factory.value;
    }

    // Constant values don't need any more calculations
    if (factory.constant){
      var value = factory.value;
      jpx.resolver.interfaceService.validateInterface(Class, ifc, value);
      namedParameters = jpx.resolver.factoryService.cacheResult(Class, name, factory, value, namedParameters);
      return value;
    }

    var args;

    //Get the dependency's dependencies
    if (factory.dependencies && factory.dependencies.length){
      try{
        args = resolveMany(Class, factory, namedParameters, localOptions, stack.concat(name));
      }
      catch(e){
        if (optional){
          return undefined;
        }
        throw e;
      }
    }

    //Run the factory function and return the result
    var result = factory.fn.apply(Class, args);

    jpx.resolver.interfaceService.validateInterface(Class, ifc, result);
    namedParameters = jpx.resolver.factoryService.cacheResult(Class, name, factory, result, namedParameters);

    return result;
  }

  // Check for _name_ syntax
  function checkOptional(name){
    if (name[0] === '_'){
      var arr = name.split('_');
      if (arr[arr.length-1] === ''){
        arr.shift();
        arr.pop();
        name = arr.join('_');
        return name;
      }
    }
    return false;
  }

  // Check ancestoral
  function checkAncestoral(name){
    if (name[0] === '^'){
      return name.substr(1);
    }
  }
