  jpx.defaults.defaults.push(function (NewClass) {
    NewClass.Register.Interface('$itimeout', function(i){ return i.function });
    NewClass.Register.Interface('$iinterval', function(i){ return i.function });
    NewClass.Register.Interface('$iimediate', function(i){ return i.function });

    NewClass.Register.Factory('$timeout', function () {
      var fn = function (cb, duration) {
        return setTimeout(cb, duration);
      };
      fn.clear = function (t) {
        return clearTimeout(t);
      };
      return fn;
    })
    .lifecycle.application()
    .interface('$itimeout');

    NewClass.Register.Factory('$interval', function () {
      var fn = function (cb, duration) {
        return setInterval(cb, duration);
      };
      fn.clear = function (t) {
        return clearInterval(t);
      };
    })
    .lifecycle.application()
    .interface('$iinterval');

    NewClass.Register.Factory('$immediate', '$itimeout', function ($timeout) {
      var fn = function(cb){
        return $timeout(cb, 0);
      };
      fn.clear = function (t) {
        return $timeout.clear(t);
      };
    })
    .lifecycle.application()
    .interface('$iimediate');

    NewClass.Register.Constant('$timeout', setTimeout).interface('$itimeout');
    NewClass.Register.Constant('$interval', setInterval).interface('$iinterval');
  });
