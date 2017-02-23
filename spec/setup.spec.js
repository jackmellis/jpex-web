describe("Setup", function () {
  it("should auto-register the plugin", function () {
    Object.keys(require.cache).forEach(key => delete require.cache[key]);
    global.window = {
      Jpex : {
        use : jasmine.createSpy()
      }
    };
    require('../src');
    expect(global.window.Jpex.use).toHaveBeenCalled();
    delete global.window;
  });
  it("should not install jpex-defaults if it already exists", function () {
    const Jpex = require('jpex').extend();
    const plugin = require('../src');
    const defaults = require('jpex-defaults');
    Jpex.use(defaults);
    Jpex.use(plugin);
  });
});
