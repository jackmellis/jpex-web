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
