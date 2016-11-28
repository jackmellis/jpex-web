  jpx.defaults.defaults.push(function (NewClass) {
    NewClass.Register.Interface('$ixhrConfig', function(i){
      return {
        method : i.string,
        url : i.string,
        data : i.any(),
        headers : i.object
      };
    });

    NewClass.Register.Factory('$xhrConfig', function(){
      return {
        method : 'GET',
        url : '',
        data : null,
        headers : {
          'X-Requested-With' : 'XMLHttpRequest',
          'Content-Type' : 'application/json'
        }
      };
    }).interface('$ixhrConfig');
  });
