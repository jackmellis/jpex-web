module.exports = function (config) {
  config.set({
    basePath : '../bin',
    frameworks : ['jasmine'],
    files : ['./jpex.full.js', '../spec/**/*.karma.js'],
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
