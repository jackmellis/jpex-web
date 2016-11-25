(function(jpx, window){
  jpx.defaults.defaults.push(function (NewClass) {
    NewClass.Register.Constant('$window', window);
  });
}(jpx, window));
