Jpex Web  
========
This is a lightweight browser-ready version of [Jpex](https://github.com/jackmellis/jpex).  

Installation  
------------  
`npm install jpex-web --save`  
The install comes with a full and minified version.  

Usage  
-----
Jpex can be included as a script tag:  
```html
<script src="node_modules/jpex-web/jpex.full.js"></script>
<script>
  var Class = Jpex.extend();
</script>
```

Or it can be *required* via a module loader such as *webpack* or *browserify*:  
```javascript
var Jpex = require('jpex-web');
```

Features  
--------  
Jpex-web has all the same features as the standard node-variant, except for a number of default factories...
- $fs, $require, $interval, and $tick have been removed.  
- $promise (and anything that uses promises) requires the Promise class to be defined on the global object.  
- $window has been added which gives access to the global window object.  
- $xhr has also been added which is a very lightweight ajax function.  

###$xhr###  
The $xhr factory allows you to make ajax requests. It is lightweight so the current configuration options are limited.  
$xhr is a function that takes a single options object with the following options:  
- method *default : get*  
    The transaction method i.e. get/put/post/delete  
- url  
    The url to send the request to  
- data *default : null*
    Data to be sent with the request. If method is set to *get* the data properties will be added onto the url  
- headers *default : { 'X-Requested-With' : 'XMLHttpRequest', 'Content-Type' : 'application/json' }*
    Headers to be attached to the request.  

$xhr will return a promise that is resolved with a resolve object in ths following format:
```javascript
{
  status : 200, // the repsonse status
  contentType : 'application/json', // the response header Content-Type property
  data : {} // the response body
}
```
If the contentType is application/json or text/json then the data will be converted into JSON using `JSON.parse`. Otherwise the data will contain the plain text response.  

It is possible to amend the default properties by overwriting the internal *$xhrConfig* factory. As $xhr uses interfaces to identify its dependencies, you can call your default properties whatever you want as long as it implements the *$ixhrConfig* interface.  
```javascript
var Class = Jpex.extend();
Class.Register.Factory('myAjaxConfig', function ($xhrConfig) { // injects the original $xhrConfig object
  $xhrConfig.headers.Authorization = 'myAuthToken';
  return $xhrConfig;
}).interface('$ixhrConfig');

// When Class uses $xhr it will now use the amended configuration object. Anything that extends Class will also use this object and can amend it futher...
var Child = Class.extend();
Child.Register.Factory('anotherConfig', function (myAjaxConfig) {
  myAjaxConfig.headers.Authorization === 'myAuthToken'; // true
  myAjaxConfig.url = 'localhost:8080/api';
  return myAjaxConfig;
}).interface('$ixhrConfig');

// Class will not use the amended config of Child, and Jpex will not use the amended configs of Class or Child.
```
