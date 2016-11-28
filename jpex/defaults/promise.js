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
