  jpx.resolver.interfaceService = {
    factoryImplements : function(Class, fname, iname){
        var factory = Class._factories[fname];

        // Check that factory has any interfaces
        if (!(factory && factory.interface && factory.interface.length)){
          return false;
        }

        // Expand to include all interfaces
        if (!factory.interfaceResolved){
          factory.interface = listInterfaces(Class, factory.interface);
          factory.interfaceResolved = true;
        }

        return factory.interface.indexOf(iname) > -1;
    },

    findFactory : function(Class, iname){
      for (var fname in Class._factories){
        if (jpx.resolver.interfaceService.factoryImplements(Class, fname, iname)){
          return fname;
        }
      }

      return iname; // no corresponding factory but it is an interface
    },

    validateInterface : function(Class, ifc, value){
      if (ifc === undefined){
        return;
      }
      var stack = crossReferenceInterface(Class, ifc.pattern, value);

      if (stack){
        var message = ['Factory', ifc.name, 'does not match interface pattern.'].concat(stack).join(' ');
        jpx.jpexError(message);
      }

      if (ifc.interface){
        ifc.interface.forEach(function(i) { return jpx.resolver.interfaceService.validateInterface(Class, Class._interfaces[i], value) });
      }
    }
  };



  function crossReferenceInterface(Class, ifc, obj){
    var stack = [];
    var itype = jpx.typeof(ifc);
    var otype = jpx.typeof(obj);

    if (itype === 'array'){
      switch(ifc.iType){
        case 'any':
          if (otype === 'undefined'){
            stack.push('Must be defined');
            return stack;
          }
          return;

        case 'either':
          for (var z = 0; z < ifc.length; z++){
            var t = crossReferenceInterface(Class, ifc[z], obj);
            if (t){
              stack.push(jpx.typeof(ifc[z]));
            }else{
              return;
            }
          }
          return [stack.join('/')];
      }
    }

    if (itype !== otype){
      // Type mismatch
      stack.push('Not a', itype);
      return stack;
    }

    switch(itype){
      case 'function':
      case 'object':
        Object.keys(ifc).forEach(function(key){
          var result = crossReferenceInterface(Class, ifc[key], obj[key]);
          if (result){
            stack = stack.concat([key, ':']).concat(result);
          }
        });
        break;

      case 'array':
        if (!ifc.length || !obj.length){
          //Empty
          return;
        }
        ifc = ifc[0];
        for (var y = 0; y < obj.length; y++){
          var result = crossReferenceInterface(Class, ifc, obj[y]);
          if (result){
            stack = stack.concat(result);
          }
        }
        break;
    }

    if (stack.length){
      return stack;
    }
  }

  function listInterfaces(Class, name){
    var list = [].concat(name);

    list.forEach(function(n){
      var ifc = Class._interfaces[n];
      if (ifc && ifc.interface && ifc.interface.length){
        var arr = ifc.interface.map(function(i) { return listInterfaces(Class, i); });
        if (arr && arr.length){
          list = list.concat.apply(list, arr);
        }
      }
    });

    return list;
  }
