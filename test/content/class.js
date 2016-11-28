var Jpex = require('./jpex.full');

var Class = Jpex.extend(function ($xhr, $log) {
  $xhr({
    url : './data',
    method : 'post',
    data : {name:'harry'},
    headers : {
      'Content-Type' : 'application/json'
    }
  })
  .then(function (response) {
    $log(response.data);
  });
});

module.exports = Class;
