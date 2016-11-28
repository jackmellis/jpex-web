webpackJsonp([1],[
/* 0 */,
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(setImmediate) {(function(window, jpx){
	(function(jpx) {
	  jpx.defaults = {
	    defaults : [],
	    apply : function (Class) {
	      this.defaults.forEach(function (n) {
	        n(Class);
	      })
	    }
	  }
	}(jpx));

	(function (jpx) {
	  jpx.factories = {
	    factories : {},
	    apply : function (Class) {
	      var self = this;
	      var register = function () {
	        return register.Factory.apply(Class, arguments);
	      };
	      Object.keys(self.factories).forEach(function (f) {
	        var fn = self.factories[f];
	        register[f] = fn.bind(Class);
	      });

	      Class.Register = register;
	    }
	  };
	}(jpx));

	(function(jpx) {
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
	}(jpx));

	(function(jpx){
	  // These are private methods attached to each Class extended from jpex
	  // As it's used so often, the first parameter of every method should be ParentClass
	  jpx.privates = {
	    getters : {},
	    manual : {
	      // Builds a list of key value pairs for the class's named parameters
	      NamedParameters : function(keys, values, args){
	        if (!args || typeof args !== 'object'){
	          args = {};
	        }

	        var i = 0;

	        if (keys && values){
	          keys.forEach(function(key){
	            if (typeof key === 'object'){
	              Object.keys(key).forEach(function(key){
	                if (args[key] === undefined && values[i] !== undefined){
	                  args[key] = values[i];
	                }
	                i++;
	              });
	            }else{
	              if (args[key] === undefined && values[i] !== undefined){
	                args[key] = values[i];
	              }
	              i++;
	            }
	          });
	        }

	        return args;
	      },
	      InvokeParent : function(parentClass, instance, values, args){
	        if (values && !Array.isArray(values)){
	          values = Array.prototype.slice.call(values);
	        }
	        args = this.NamedParameters(values, args);
	        parentClass.call(instance, args);
	      }
	    },

	    properties : {},

	    apply : function(Class, Parent, dependencies){
	      Object.keys(this.getters).forEach(function(n) {
	        Object.defineProperty(Class, n, {
	          value : this.getters[n].bind(Class, Parent)
	        });
	      });

	      Object.keys(this.properties).forEach(function(n) {
	        Class[n] = this.properties[n].call(Class);
	      });

	      Object.defineProperties(Class, {
	        NamedParameters : {
	          value : this.manual.NamedParameters.bind(Class, dependencies)
	        },
	        InvokeParent : {
	          value : this.manual.InvokeParent.bind(Class, Parent)
	        },
	        _parent : {
	          value : Parent
	        },
	        _factories : {
	          writable : true,
	          value : Object.create(Parent._factories || null)
	        },
	        _resolved : {
	          writeable : true,
	          value : {}
	        },
	        _interfaces : {
	          writeable : true,
	          value : Object.create(Parent._interfaces || null)
	        },
	        _folders : {
	          writable : true,
	          value : []
	        }
	      });
	    }
	  };
	}(jpx));

	(function(jpx) {
	  jpx.defaults.defaults.push(function (NewClass) {
	    NewClass.Register.Factory('$copy', ['$typeof'], function ($typeof) {
	      var copier = function (from, to, recur) {
	        switch ($typeof(from)){
	          case 'string':
	          case 'number':
	          case 'boolean':
	          case 'function':
	          case 'null':
	          case 'undefined':
	            return from;

	          case 'date':
	            return new Date(from);

	          case 'regexp':
	            var flags = [];
	            if (from.global){flags.push('g');}
	            if (from.ignoreCase){flags.push('i');}
	            return new RegExp(from.source, flags.join(''));

	          case 'array':
	            return (to || []).concat(from.map(function (item) {
	              return recur ? copier(item) : item;
	            }));

	          case 'object':
	            to = to || {};
	            Object.keys(from).forEach(function (key) {
	              to[key] = recur ? copier(from[key], to[key], recur) : from[key];
	            });
	            return to;

	          default:
	            throw new Error('Unexpected type: ' + $typeof(from));
	        }
	      };
	      var $copy = function (obj) {
	        return $copy.shallow(obj);
	      };
	      $copy.shallow = function (obj) {
	        return copier(obj);
	      };
	      $copy.deep = function (obj) {
	        return copier(obj, null, true);
	      };
	      $copy.extend = function () {
	        var args = Array.prototype.slice.call(arguments);
	        var target = args.shift();
	        args.forEach(function (arg) {
	          copier(arg, target, true);
	        });
	        return target;
	      };
	      return $copy;
	    }).lifecycle.application();
	  });
	}(jpx));

	(function(jpx) {
	  jpx.defaults.defaults.push(function(NewClass){
	    NewClass.Register.Interface('$ierror', function(i){
	      return i.functionWith({
	        define : i.function,
	        default : i.function,
	        Error : i.function
	      })
	    });

	    NewClass.Register
	      .Factory('$error', '$errorFactory', function($errorFactory){
	        return $errorFactory;
	      })
	      .interface('$ierror')
	      .lifecycle.application();
	  });
	}(jpx));

	(function(jpx) {
	  jpx.defaults.defaults.push(function (NewClass) {
	    NewClass.Register
	      .Factory('$errorFactory', null, function(){
	      // Throw the standard error
	      var $error = function(){
	        $error.default.throw.apply($error.default, arguments);
	      };

	      // create a new error type and add it to $error
	      $error.define = function(name, fn){
	        var NewError = function(message){
	          this.message = message;
	          this.name = name;
	          this.stack = (new Error()).stack;

	          if (fn){
	            fn.apply(this, arguments);
	          }
	        };
	        NewError.prototype = Object.create(Error.prototype);
	        NewError.prototype.constructor = NewError;
	        NewError.create = function(){
	          var args = Array.prototype.slice.call(arguments);
	          args.unshift(NewError);
	          var err = jpx.instantiator(this, args);
	          return err;
	        };
	        NewError.throw = function(){
	          throw this.create.apply(this, arguments);
	        };

	        $error[name] = NewError;
	        return NewError;
	      };

	      $error.default = $error.define('Error');

	      return $error;
	    })
	    .lifecycle.none();
	  });
	}(jpx));

	(function(jpx) {
	  jpx.defaults.defaults.push(function (NewClass) {
	    NewClass.Register.Interface('$ilog', function(i){
	      return i.functionWith({
	        log : i.function,
	        info : i.function,
	        warn : i.function,
	        error : i.function
	      })
	    });

	    // Log a message to the console
	    NewClass.Register
	      .Factory('$log', null, function(){
	        var $log = function(){
	          console.log.apply(console, arguments);
	        };
	        $log.log = console.log;
	        $log.info = console.info;
	        $log.warn = console.warn;
	        $log.error = console.error;
	        return $log;
	    })
	    .interface('$ilog')
	    .lifecycle.application();
	  });
	}(jpx));

	(function(jpx){
	  jpx.defaults.defaults.push(function(NewClass){
	    NewClass.Register.Interface('$ipromise', function(i){
	      return i.functionWith({
	        all : i.function,
	        race : i.function,
	        reject : i.function,
	        resolve : i.function
	      });
	    });

	    // wraps the Promise class
	    NewClass.Register
	      .Factory('$promise', null, function(){
	        var $promise = function(fn){
	          return new Promise(fn);
	        };
	        $promise.all = Promise.all;
	        $promise.race = Promise.race;
	        $promise.reject = Promise.reject;
	        $promise.resolve = Promise.resolve;
	        return $promise;
	      })
	      .interface('$ipromise')
	      .lifecycle.application();
	  });
	}(jpx));

	(function(jpx) {
	  jpx.defaults.defaults.push(function (NewClass) {
	      NewClass.Register.Factory('$resolve', null, function () {
	        var TheClass = this;
	        return function (name, parameters) {
	          return jpx.resolver.resolve(TheClass, name, parameters);
	        };
	      }).lifecycle.class();
	  });
	}(jpx));

	(function(jpx) {
	  jpx.defaults.defaults.push(function (NewClass) {
	    NewClass.Register.Interface('$itimeout', function(i){ return i.function });
	    NewClass.Register.Interface('$iinterval', function(i){ return i.function });

	    NewClass.Register.Constant('$timeout', setTimeout).interface('$itimeout');
	    NewClass.Register.Constant('$interval', setInterval).interface('$iinterval');
	  });
	}(jpx));

	(function(jpx) {
	  jpx.defaults.defaults.push(function(NewClass){
	    NewClass.Register.Factory('$typeof', null, function () {
	      var standardTypes = ['number', 'boolean', 'string', 'array', 'function', 'date', 'regexp', 'null', 'undefined'];
	      return function(obj, returnClassName){
	        var t = Object.prototype.toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
	        return (!returnClassName && standardTypes.indexOf(t) < 0) ? 'object' : t;
	      };
	    }).lifecycle.application();
	  });
	}(jpx));

	(function(jpx, window){
	  jpx.defaults.defaults.push(function (NewClass) {
	    NewClass.Register.Constant('$window', window);
	  });
	}(jpx, window));

	(function(jpx){
	  jpx.defaults.defaults.push(function (NewClass) {
	    NewClass.Register.Interface('$ixhr', function(i){ return i.function; });

	    NewClass.Register.Factory('$xhr', ['$ipromise', '$xhrProvider', '$copy', '$ixhrConfig'], function ($promise, $xhrProvider, $copy, $xhrConfig) {
	      return function (opt) {
	        opt = $copy.extend($xhrConfig, opt);

	        return $promise(function(resolve, reject){
	          var xhr = $xhrProvider();

	          xhr.addEventListener('load', onLoad);
	          xhr.addEventListener('error', onError);

	          xhr.open(opt.method, opt.url);
	          setRequestHeaders();

	          var data = formatData();
	          xhr.send(data);

	          function formatData(){
	            return JSON.stringify(opt.data);
	          }

	          function setRequestHeaders() {
	            var keys = Object.keys(opt.headers);
	            if (!keys.length){
	              return;
	            }
	            keys.forEach(function (key) {
	              var value = opt.headers[key];
	              xhr.setRequestHeader(key, value);
	            });
	          }

	          function onLoad() {
	            var result = getResponseData();
	            result = createResult(result);

	            if (xhr.status >= 200 && xhr.status < 400){
	              resolve(result);
	            }else{
	              reject(result);
	            }
	          }

	          function onError() {
	            reject(createResult(''));
	          }

	          function getResponseData(){
	            switch(xhr.responseType){
	              case 'text':
	                return xhr.responseText;
	              case 'document':
	                return xhr.responseXML;
	              default:
	                return xhr.response;
	            }
	          }

	          function createResult(data) {
	            var result = {};
	            result.status = xhr.status;
	            result.contentType = xhr.getResponseHeader('Content-Type').split(';')[0];

	            if (data && typeof data === 'string'){
	              switch(result.contentType){
	                case 'application/json':
	                case 'text/json':
	                  data = JSON.parse(data);
	              }
	              result.data = data;
	            }
	            return result;
	          }
	        });
	      };
	    }).interface('$ixhr');
	  });
	}(jpx));

	(function(jpx){
	  jpx.defaults.defaults.push(function (NewClass) {
	    NewClass.Register.Interface('$ixhrConfig', function(i){
	      return {
	        method : i.string,
	        url : i.string,
	        data : i.any(),
	        headers : i.object
	      };
	    });

	    NewClass.Register.Factory('$xhrConfig', function(){
	      return {
	        method : 'GET',
	        url : '',
	        data : null,
	        headers : {
	          'X-Requested-With' : 'XMLHttpRequest',
	          'Content-Type' : 'application/json'
	        }
	      };
	    }).interface('$ixhrConfig');
	  });
	}(jpx));

	(function(jpx){
	  jpx.defaults.defaults.push(function (NewClass) {
	    NewClass.Register.Factory('$xhrProvider', null, function () {
	      return function(){
	        return new XMLHttpRequest();
	      };
	    }).lifecycle.application();
	  });
	}(jpx));

	(function(jpx){
	// Return an object
	  jpx.factories.factories.Constant = function (name, obj) {
	    this._factories[name] = {
	      value : obj,
	      constant : true
	    };
	    return jpx.factories.wrapper(this._factories[name]).lifecycle.application();
	  };
	}(jpx));

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

	(function(jpx) {
	  jpx.factories.factories.ErrorType = function(name, fn){
	    // Register an error types constant
	    if (!Object.hasOwnProperty.call(this._factories, '_errorTypes')){
	      this.Register.Constant('_errorTypes', []);
	    }
	    // Add the error type to the class
	    this._factories._errorTypes.value.push({name : name, fn : fn});

	    // Register $errorFactory
	    if (!Object.hasOwnProperty.call(this._factories, '$errorFactory')){
	      this.Register.Factory('$errorFactory', ['^$errorFactory', '_errorTypes'], function($errorFactory, errorTypes){
	        errorTypes.forEach(function(type){
	          $errorFactory.define(type.name, type.fn);
	        });

	        return $errorFactory;
	      });
	    }

	    // Register $error
	    if (!Object.hasOwnProperty.call(this._factories, '$error')){
	      this.Register.Factory('$error', '$errorFactory', function($errorFactory){
	        return $errorFactory;
	      })
	      .interface('$ierror')
	      .lifecycle.application();
	    }

	    return this;
	  };

	}(jpx));

	(function(jpx){
	  jpx.factories.factories.Factory = function (name, dependencies, fn, singleton) {
	    if (typeof dependencies === 'function'){
	      singleton = fn;
	      fn = dependencies;
	      dependencies = null;
	    }

	    if (typeof fn !== 'function'){
	      return this;
	    }

	    if (dependencies){
	      dependencies = [].concat(dependencies);
	    }else{
	      dependencies = jpx.resolver.extractParameters(fn);
	    }
	    if (!dependencies.length){
	      dependencies = null;
	    }

	    var factoryObj = {
	      fn : fn,
	      dependencies : dependencies
	    };
	  //  var result = wrapper(factoryObj);
	    this._factories[name] = factoryObj;

	    return jpx.factories.wrapper(factoryObj).lifecycle[singleton ? 'application' : 'instance']();
	  }
	}(jpx));

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

	(function (jpx) {
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
	}(jpx));

	(function (jpx) {
	  jpx.factories.wrapper = function(factory){
	    var wrapper = {
	      interface : function(val){
	        factory.interface = (factory.interface || []).concat(val);
	        return wrapper;
	      },
	      lifecycle : {
	        application : function(){
	          factory.lifecycle = 1;
	          return wrapper;
	        },
	        class : function(){
	          factory.lifecycle = 2;
	          return wrapper;
	        },
	        instance : function(){
	          factory.lifecycle = 3;
	          return wrapper;
	        },
	        none : function(){
	          factory.lifecycle = 4;
	          return wrapper;
	        }
	      }
	    };

	    return wrapper;
	  };
	}(jpx));

	(function(jpx) {
	  jpx.instantiator = function(context, args){
	    return new (Function.prototype.bind.apply(context, args));
	  };
	}(jpx));

	(function(jpx) {
	  jpx.jpexError = function(mess){
	    var e = new Error(mess);
	    e.jpexInternalError = true;
	    throw e;
	  };
	}(jpx));

	(function (root) {

	  // Store setTimeout reference so promise-polyfill will be unaffected by
	  // other code modifying setTimeout (like sinon.useFakeTimers())
	  var setTimeoutFunc = setTimeout;

	  function noop() {}

	  // Polyfill for Function.prototype.bind
	  function bind(fn, thisArg) {
	    return function () {
	      fn.apply(thisArg, arguments);
	    };
	  }

	  function Promise(fn) {
	    if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new');
	    if (typeof fn !== 'function') throw new TypeError('not a function');
	    this._state = 0;
	    this._handled = false;
	    this._value = undefined;
	    this._deferreds = [];

	    doResolve(fn, this);
	  }

	  function handle(self, deferred) {
	    while (self._state === 3) {
	      self = self._value;
	    }
	    if (self._state === 0) {
	      self._deferreds.push(deferred);
	      return;
	    }
	    self._handled = true;
	    Promise._immediateFn(function () {
	      var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
	      if (cb === null) {
	        (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
	        return;
	      }
	      var ret;
	      try {
	        ret = cb(self._value);
	      } catch (e) {
	        reject(deferred.promise, e);
	        return;
	      }
	      resolve(deferred.promise, ret);
	    });
	  }

	  function resolve(self, newValue) {
	    try {
	      // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
	      if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.');
	      if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
	        var then = newValue.then;
	        if (newValue instanceof Promise) {
	          self._state = 3;
	          self._value = newValue;
	          finale(self);
	          return;
	        } else if (typeof then === 'function') {
	          doResolve(bind(then, newValue), self);
	          return;
	        }
	      }
	      self._state = 1;
	      self._value = newValue;
	      finale(self);
	    } catch (e) {
	      reject(self, e);
	    }
	  }

	  function reject(self, newValue) {
	    self._state = 2;
	    self._value = newValue;
	    finale(self);
	  }

	  function finale(self) {
	    if (self._state === 2 && self._deferreds.length === 0) {
	      Promise._immediateFn(function() {
	        if (!self._handled) {
	          Promise._unhandledRejectionFn(self._value);
	        }
	      });
	    }

	    for (var i = 0, len = self._deferreds.length; i < len; i++) {
	      handle(self, self._deferreds[i]);
	    }
	    self._deferreds = null;
	  }

	  function Handler(onFulfilled, onRejected, promise) {
	    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
	    this.onRejected = typeof onRejected === 'function' ? onRejected : null;
	    this.promise = promise;
	  }

	  /**
	   * Take a potentially misbehaving resolver function and make sure
	   * onFulfilled and onRejected are only called once.
	   *
	   * Makes no guarantees about asynchrony.
	   */
	  function doResolve(fn, self) {
	    var done = false;
	    try {
	      fn(function (value) {
	        if (done) return;
	        done = true;
	        resolve(self, value);
	      }, function (reason) {
	        if (done) return;
	        done = true;
	        reject(self, reason);
	      });
	    } catch (ex) {
	      if (done) return;
	      done = true;
	      reject(self, ex);
	    }
	  }

	  Promise.prototype['catch'] = function (onRejected) {
	    return this.then(null, onRejected);
	  };

	  Promise.prototype.then = function (onFulfilled, onRejected) {
	    var prom = new (this.constructor)(noop);

	    handle(this, new Handler(onFulfilled, onRejected, prom));
	    return prom;
	  };

	  Promise.all = function (arr) {
	    var args = Array.prototype.slice.call(arr);

	    return new Promise(function (resolve, reject) {
	      if (args.length === 0) return resolve([]);
	      var remaining = args.length;

	      function res(i, val) {
	        try {
	          if (val && (typeof val === 'object' || typeof val === 'function')) {
	            var then = val.then;
	            if (typeof then === 'function') {
	              then.call(val, function (val) {
	                res(i, val);
	              }, reject);
	              return;
	            }
	          }
	          args[i] = val;
	          if (--remaining === 0) {
	            resolve(args);
	          }
	        } catch (ex) {
	          reject(ex);
	        }
	      }

	      for (var i = 0; i < args.length; i++) {
	        res(i, args[i]);
	      }
	    });
	  };

	  Promise.resolve = function (value) {
	    if (value && typeof value === 'object' && value.constructor === Promise) {
	      return value;
	    }

	    return new Promise(function (resolve) {
	      resolve(value);
	    });
	  };

	  Promise.reject = function (value) {
	    return new Promise(function (resolve, reject) {
	      reject(value);
	    });
	  };

	  Promise.race = function (values) {
	    return new Promise(function (resolve, reject) {
	      for (var i = 0, len = values.length; i < len; i++) {
	        values[i].then(resolve, reject);
	      }
	    });
	  };

	  // Use polyfill for setImmediate for performance gains
	  Promise._immediateFn = (typeof setImmediate === 'function' && function (fn) { setImmediate(fn); }) ||
	    function (fn) {
	      setTimeoutFunc(fn, 0);
	    };

	  Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
	    if (typeof console !== 'undefined' && console) {
	      console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
	    }
	  };

	  /**
	   * Set the immediate function to execute callbacks
	   * @param fn {function} Function to execute
	   * @deprecated
	   */
	  Promise._setImmediateFn = function _setImmediateFn(fn) {
	    Promise._immediateFn = fn;
	  };

	  /**
	   * Change the function to execute on unhandled rejection
	   * @param {function} fn Function to execute on unhandled rejection
	   * @deprecated
	   */
	  Promise._setUnhandledRejectionFn = function _setUnhandledRejectionFn(fn) {
	    Promise._unhandledRejectionFn = fn;
	  };

	  root.Promise = Promise;

	})(window);

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

	(function(jpx) {
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
	}(jpx));

	(function(jpx) {
	  var standardTypes = ['number', 'boolean', 'string', 'array', 'function', 'date', 'regexp', 'null', 'undefined'];
	  jpx.typeof = function(obj){
	    var t = Object.prototype.toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
	    return standardTypes.indexOf(t) < 0 ? 'object' : t;
	  };
	}(jpx));

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

	}(window, {}));
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2).setImmediate))

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(setImmediate, clearImmediate) {var nextTick = __webpack_require__(3).nextTick;
	var apply = Function.prototype.apply;
	var slice = Array.prototype.slice;
	var immediateIds = {};
	var nextImmediateId = 0;

	// DOM APIs, for completeness

	exports.setTimeout = function() {
	  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
	};
	exports.setInterval = function() {
	  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
	};
	exports.clearTimeout =
	exports.clearInterval = function(timeout) { timeout.close(); };

	function Timeout(id, clearFn) {
	  this._id = id;
	  this._clearFn = clearFn;
	}
	Timeout.prototype.unref = Timeout.prototype.ref = function() {};
	Timeout.prototype.close = function() {
	  this._clearFn.call(window, this._id);
	};

	// Does not start the time, just sets up the members needed.
	exports.enroll = function(item, msecs) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = msecs;
	};

	exports.unenroll = function(item) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = -1;
	};

	exports._unrefActive = exports.active = function(item) {
	  clearTimeout(item._idleTimeoutId);

	  var msecs = item._idleTimeout;
	  if (msecs >= 0) {
	    item._idleTimeoutId = setTimeout(function onTimeout() {
	      if (item._onTimeout)
	        item._onTimeout();
	    }, msecs);
	  }
	};

	// That's not how node.js implements it but the exposed api is the same.
	exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
	  var id = nextImmediateId++;
	  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

	  immediateIds[id] = true;

	  nextTick(function onNextTick() {
	    if (immediateIds[id]) {
	      // fn.call() is faster so we optimize for the common use-case
	      // @see http://jsperf.com/call-apply-segu
	      if (args) {
	        fn.apply(null, args);
	      } else {
	        fn.call(null);
	      }
	      // Prevent ids from leaking
	      exports.clearImmediate(id);
	    }
	  });

	  return id;
	};

	exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
	  delete immediateIds[id];
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2).setImmediate, __webpack_require__(2).clearImmediate))

/***/ },
/* 3 */
/***/ function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};

	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.

	var cachedSetTimeout;
	var cachedClearTimeout;

	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }


	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }



	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var Jpex = __webpack_require__(1);

	var Class = Jpex.extend(function ($xhr, $log) {
	  $xhr({
	    url : './data',
	    method : 'post',
	    data : {name:'harry'},
	    headers : {
	      'Content-Type' : 'application/json'
	    }
	  })
	  .then(function (response) {
	    $log(response.data);
	  });
	});

	module.exports = Class;


/***/ }
]);