  jpx.factories = {
    factories : {},
    apply : function (Class) {
      var self = this;
      var register = function () {
        return register.Factory.apply(Class, arguments);
      };
      Object.keys(self.factories).forEach(function (f) {
        var fn = self.factories[f];
        register[f] = fn.bind(Class);
      });

      Class.Register = register;
    }
  };
