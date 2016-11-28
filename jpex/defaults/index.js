  jpx.defaults = {
    defaults : [],
    apply : function (Class) {
      this.defaults.forEach(function (n) {
        n(Class);
      })
    }
  }
