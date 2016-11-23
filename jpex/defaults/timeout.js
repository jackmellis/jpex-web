(function(jpx) {
  jpx.defaults.defaults.push(function (NewClass) {
    NewClass.Register.Interface('$itimeout', function(i){ return i.function });
    NewClass.Register.Interface('$iinterval', function(i){ return i.function });

    NewClass.Register.Constant('$timeout', setTimeout).interface('$itimeout');
    NewClass.Register.Constant('$interval', setInterval).interface('$iinterval');
  });
}(jpx));
