var Jpex = require('jpex');
var compile = Jpex.extend(function (glob, $fs, $log, $promise, uglify) {
  var self = this;

  this.index = function () {
    return $promise(function (resolve, reject) {
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
      glob('../jpex/main.js', function (err, data) {
        if (err){
          return reject(err);
        }

        resolve(list.concat(data));
      });
    });
  };

  this.concat = function (list) {
    var promises = list.map( path => $fs.readFile(path) );
    return $promise
      .all(promises)
      .then( data => data.join('\n') );
  };

  this.wrap = function (str) {
    return [
      '(function(window, jpx){',
      str,
      '}(window, {}));'
    ].join('\n');
  };

  this.uglify = function (str) {
    str = uglify.minify(str, {fromString : true}).code;
    return $fs.writeFile('../bin/jpex.min.js', str, 'utf8');
  };

  this.write = function (str) {
    return $fs.writeFile('../bin/jpex.full.js', str, 'utf8').then(() => str);
  };

  self.index().then(self.elements).then(self.main).then(self.concat).then(self.wrap).then(self.write).then(self.uglify).catch(e => $log.error(e.stack));
});
compile.Register.Constant('uglify', require('uglify-js'));

compile();
