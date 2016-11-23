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
