module.exports = function (config) {
  config.set({
    basePath : '../',
    frameworks : ['jasmine'],
    files : [
      './spec/setup.js',
      './spec/node_modules/promise-polyfill/promise.js',
      './jpex/**/index.js',
      './jpex/**/!(index|main).js',
      './jpex/main.js',

      './spec/**/*.karma.js'
    ],
    reporters : ['progress'],
    port : 9876,
    colors : true,
    logLevel : config.LOG_INFO,
    autoWatch : true,
    browsers : ['PhantomJS'],
    singleRun : false,
    concurrency : Infinity
  });
};
