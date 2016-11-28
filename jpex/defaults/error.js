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
