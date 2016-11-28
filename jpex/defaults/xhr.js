  jpx.defaults.defaults.push(function (NewClass) {
    NewClass.Register.Interface('$ixhr', function(i){ return i.function; });

    NewClass.Register.Factory('$xhr', ['$ipromise', '$xhrProvider', '$copy', '$ixhrConfig'], function ($promise, $xhrProvider, $copy, $xhrConfig) {
      return function (opt) {
        opt = $copy.extend($xhrConfig, opt);

        return $promise(function(resolve, reject){
          var xhr = $xhrProvider();

          xhr.addEventListener('load', onLoad);
          xhr.addEventListener('error', onError);

          xhr.open(opt.method, opt.url);
          setRequestHeaders();

          var data = formatData();
          xhr.send(data);

          function formatData(){
            return opt.data ? JSON.stringify(opt.data) : null;
          }

          function setRequestHeaders() {
            var keys = Object.keys(opt.headers);
            if (!keys.length){
              return;
            }
            keys.forEach(function (key) {
              var value = opt.headers[key];
              xhr.setRequestHeader(key, value);
            });
          }

          function onLoad() {
            var result = getResponseData();
            result = createResult(result);

            if (xhr.status >= 200 && xhr.status < 400){
              resolve(result);
            }else{
              reject(result);
            }
          }

          function onError() {
            reject(createResult(''));
          }

          function getResponseData(){
            switch(xhr.responseType){
              case 'text':
                return xhr.responseText;
              case 'document':
                return xhr.responseXML;
              default:
                return xhr.response;
            }
          }

          function createResult(data) {
            var result = {};
            result.status = xhr.status;
            result.contentType = xhr.getResponseHeader('Content-Type').split(';')[0];

            if (data && typeof data === 'string'){
              switch(result.contentType){
                case 'application/json':
                case 'text/json':
                  data = JSON.parse(data);
              }
              result.data = data;
            }
            return result;
          }
        });
      };
    }).interface('$ixhr');
  });
