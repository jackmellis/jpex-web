# jpex-web
Default factories for Jpex in a browser environment

## Installation  
`npm install jpex-web --save`  

## Usage  
Webpack/Browserify:  
```javascript
var Jpex = require('jpex');
var jpexWeb = require('jpex-web');
Jpex.use(jpexWeb);
```
or...
```javascript
var Jpex = require('jpex');
var jpexWeb = require('jpex-web/dist/jpex-web');
Jpex.use(jpexWeb);
```

HTML/Javascript
```html
<script src="node_modules/jpex/dist/jpex.js"></script>
<script src="node_modules/jpex-web/dist/jpex-web.js"></script>
<script>
// jpex-defaults is automatically registered when imported via script tags
var t = Jpex.$resolve('$promise');
</script>
```

## API  
**jpex-web** automatically includes all factories from the **jpex-defaults** plugin, plus a few extras:  

### $promise  
Although **$promise** is already included as part of **jpex-defaults**, this plugin adds a polyfill that is leveraged when the browser doesn't natively support the Promise object.  

### $window  
This returns the global window object.  

### $document  
This returns the global document object.
