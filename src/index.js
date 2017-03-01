var $document = require('./$document');
var $window = require('./$window');
var $$promise = require('./$$promise');

exports.name = 'jpex-web';
exports.install = function (options) {
    var Jpex = options.Jpex;

    if (!Jpex.$$factories.$promise){
        var defaults = require('jpex-defaults');
        Jpex.use(defaults);
    }

    Jpex.register.factory('$document', '$window', $document).lifecycle.application();

    Jpex.register.factory('$window', [], $window).lifecycle.application();

    Jpex.register.factory('$$promise', [], $$promise);
};

if (typeof window !== 'undefined' && window.Jpex && typeof window.Jpex.use === 'function'){
    window.Jpex.use(exports);
}
