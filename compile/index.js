var Jpex = require('jpex');
var compile = Jpex.extend(function (glob, $fs, $log, $promise, uglify) {
  var self = this;

  this.index = function () {
    return $promise(function (resolve, reject) {
      $log('Collecting all components');
      glob('../jpex/**/index.js', function (err, data) {
        if (err){
          return reject(err);
        }

        resolve(data);
      });
    });
  };

  this.elements = function (list) {
    return $promise(function (resolve, reject) {
      $log('Collecting all component elements');
      glob('../jpex/**/!(index|main).js', function (err, data) {
        if (err){
          return reject(err);
        }

        resolve(list.concat(data));
      });
    });
  };

  this.main = function (list) {
    return $promise(function (resolve, reject) {
      $log('Adding main entry point');
      glob('../jpex/main.js', function (err, data) {
        if (err){
          return reject(err);
        }

        resolve(list.concat(data));
      });
    });
  };

  this.concat = function (list) {
    $log('Concatenating files');
    var promises = list.map( path => $fs.readFile(path) );
    return $promise
      .all(promises)
      .then( data => data.join('\n') );
  };

  this.wrap = function (str) {
    $log('Applying IIFE');
    return [
      '(function(window, jpx){',
      str,
      '}(window, {}));'
    ].join('\n');
  };

  this.uglify = function (str) {
    $log('Uglifying');
    str = uglify.minify(str, {fromString : true}).code;
    return dowrite('../bin/jpex.min.js', str);
  };

  this.write = function (str) {
    return dowrite('../bin/jpex.full.js', str);
  };

  function dowrite(path, content){
    $log('Writing ' + path + ' (' + (content.length) + ')');
    return $fs.writeFile(path, content, 'utf8').then(() => content);
  }

  self.index().then(self.elements).then(self.main).then(self.concat).then(self.wrap).then(self.write).then(self.uglify).catch(e => $log.error(e.stack));
});
compile.Register.Constant('uglify', require('uglify-js'));

compile();
