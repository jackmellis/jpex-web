(function(jpx) {
  jpx.resolver.factoryService = {
    getFactory : function(Class, name, optional){
      var factory = Class._resolved[name];

      if (!isValidFactory(factory)){
        factory = Class._factories[name];

        if (!isValidFactory(factory)){
          if (optional){
            return undefined;
          }
          jpx.jpexError(['Unable to find required dependency:', name].join(' '));
        }
      }
    
      return factory;
    },

    cacheResult : function(Class, name, factory, value, namedParameters){
      switch(factory.lifecycle){
        case 1: //singleton
          factory.resolved = true;
          factory.value = value;
          break;
        case 2: //class
          Class._resolved[name] = {
            resolved : true,
            value : value
          };
          break;
        case 4: //none
          break;
        default: //instance
          namedParameters[name] = value;
          break;
      }
      return namedParameters;
    }
  };

  function isValidFactory(factory){
    return factory && ((factory.fn && typeof factory.fn === 'function') || factory.constant || factory.resolved);
  }
}(jpx));
