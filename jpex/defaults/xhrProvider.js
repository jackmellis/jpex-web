  jpx.defaults.defaults.push(function (NewClass) {
    NewClass.Register.Factory('$xhrProvider', null, function () {
      return function(){
        return new XMLHttpRequest();
      };
    }).lifecycle.application();
  });
