module.exports = function () {
    if (typeof Promise !== 'undefined'){
        return Promise; // eslint-disable-line
    }
    return require('promise-polyfill');
};
