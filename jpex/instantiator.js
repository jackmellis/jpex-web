(function(jpx) {
  jpx.instantiator = function(context, args){
    return new (Function.prototype.bind.apply(context, args));
  };
}(jpx));
