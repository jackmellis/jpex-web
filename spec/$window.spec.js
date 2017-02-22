describe("$window", function () {
  let Jpex, defaults, $window, window;
  beforeEach(function () {
    global.window = window = {};
    Jpex = require('jpex').extend();
    defaults = require('../src');
    Jpex.use(defaults);
    Jpex.extend(function (_$window_) {
      $window = _$window_;
    })();
  });

  it("should wrap the window object", function () {
    expect($window).toBe(window);
  });
});
