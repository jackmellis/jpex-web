  jpx.jpexError = function(mess){
    var e = new Error(mess);
    e.jpexInternalError = true;
    throw e;
  };
