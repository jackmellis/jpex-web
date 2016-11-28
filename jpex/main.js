(function(jpx){
  var Fn = function(){};
  Fn.extend = extend;

  var Base = Fn.extend();
  jpx.defaults.apply(Base);
  Object.defineProperty(Base, '_jpx', {
    value : jpx
  });

  if (typeof module !== 'undefined' && module.exports){
    module.exports = Base;
  }else if (window){
    window.Jpex = Base;
  }

  function extend(options){
    var Parent = this;
    options = createOptions(options);

    var Class = createClass(Parent, options);

    setPrivates(Class, Parent, options.dependencies);
    setFactories(Class);

    return Class;
  }

  function createOptions(opt){
    // Defaults
    var options = {
      constructor : (typeof opt === 'function') ? opt : null,
      invokeParent : !(typeof opt === 'function' || (opt && opt.constructor)),
      prototype : null,
      static : null,
      dependencies : [],
      interface : [],
      bindToInstance : false
    };

    // Merge options with defaults
    if (opt && typeof opt === 'object'){
      var keys = Object.keys(opt);
      Object.keys(opt).forEach(function(key) {
        if (options[key] !== undefined){
          options[key] = opt[key];
        }
      });
    }

    // Get dependencies
    if (opt && !opt.dependencies && typeof options.constructor === 'function'){
      options.dependencies = jpx.resolver.extractParameters(options.constructor);
    }else{
      options.dependencies = [].concat(options.dependencies);
    }
    if (!options.dependencies.length){
      options.dependencies = null;
    }

    if (options.interface){
      options.interface = [].concat(options.interface);
    }
    if (!options.interface.length){
      options.interface = null;
    }

    return options;
  }

  function createClass(Parent, options){
    var Class = classBody(options);

    // Create a prototype that inherits the parent class
    Class.prototype = Object.create(Parent.prototype);

    // Apply new prototype methods
    if (options.prototype){
      Object.keys(options.prototype).forEach(function(key){ Class.prototype[key] = options.prototype[key] });
    }

    Class.prototype.constructor = Class;

    // Apply static methods from this class
    if (options.static){
      Object.keys(options.static).forEach(function(key){ Class[key] = options.static[key] });
    }

    // Apply static methods from parent class
    Object.keys(Parent).forEach(function(key) {
      if (Class[key] === undefined){
        Class[key] = Parent[key];
      }
    });

    Object.defineProperties(Class, {
      Dependencies : {
        get : function() { return options.dependencies; }
      },
      Interface : {
        get : function() { return options.interface; }
      }
    });

    return Class;
  }

  function classBody(options){
    var Class;
    Class = function(namedParameters){
      if (!(this instanceof Class)){
        return new Class(namedParameters);
      }

      try{
        // Resolve dependencies
        var args = jpx.resolver.resolveDependencies(Class, {dependencies : options.dependencies}, namedParameters);

        // Invoke Parent
        if (options.invokeParent && options.invokeParent !== 'after'){
          Class.InvokeParent(this, args, namedParameters);
        }

        // Bind dependencies
        if (options.bindToInstance){
          bindToInstance(this, Class, args, namedParameters, options.bindToInstance);
        }

        if (typeof options.constructor === 'function'){
          options.constructor.apply(this, args);
        }

        // Invoke parent after?
        if (options.invokeParent === 'after'){
          Class.InvokeParent(this, args, namedParameters);
        }
      }
      catch(e){
        if (e && e.jpexInternalError){
          e.stack = (new Error(e.message)).stack;
        }

        var errorHandler = jpx.resolver.resolve(Class, '_$errorHandler_', namedParameters);
        if (errorHandler){
          errorHandler(e);
        }else{
          throw e;
        }
      }
    };

    return Class;
  }
  function bindToInstance(instance, Class, args, namedParameters, option){
    var bindTo = instance;
    if (typeof option === 'string'){
      bindTo = {};
      instance[option] = bindTo;
    }
    var bindParameters = Class.NamedParameters(args, namedParameters);
    Object.keys(bindParameters).forEach(function(key) { bindTo[key] = bindParameters[key] });
  }
  function setPrivates(Class, Parent, dependencies){
    jpx.privates.apply(Class, Parent, dependencies);
  }
  function setFactories(Class){
    jpx.factories.apply(Class);
  }
}(jpx));
