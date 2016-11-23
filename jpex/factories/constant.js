(function(jpx){
// Return an object
  jpx.factories.factories.Constant = function (name, obj) {
    this._factories[name] = {
      value : obj,
      constant : true
    };
    return jpx.factories.wrapper(this._factories[name]).lifecycle.application();
  };
}(jpx));
