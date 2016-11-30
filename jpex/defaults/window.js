  jpx.defaults.defaults.push(function (NewClass) {
    NewClass.Register.Factory('$window', function () {
      return window;
    }).lifecycle.application();
  });
