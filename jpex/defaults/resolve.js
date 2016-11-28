  jpx.defaults.defaults.push(function (NewClass) {
      NewClass.Register.Factory('$resolve', null, function () {
        var TheClass = this;
        return function (name, parameters) {
          return jpx.resolver.resolve(TheClass, name, parameters);
        };
      }).lifecycle.class();
  });
