describe("$$promise (with polyfill)", function () {
  var Jpex, Class, defaults, $promise, $$promise;
  beforeEach(function () {
    Jpex = require('jpex').extend();
    defaults = require('../src');
    Jpex.use(defaults);
    Class = Jpex.extend(function (_$promise_, _$$promise_) {
      $promise = _$promise_;
      $$promise = _$$promise_;
    });
  });

  describe("(with polyfill)", function () {
    var promise_bk;
    beforeAll(function () {
      Object.keys(require.cache).forEach(key => delete require.cache[key]);
      promise_bk = global.Promise;
      global.Promise = undefined;
    });
    beforeEach(function () {
      Class();
    });
    afterAll(function () {
      global.Promise = promise_bk;
    });

    it("should use a polyfill if Promise is unavailable", function () {
      expect($$promise).toBeDefined();
      expect($$promise).not.toBe(promise_bk);
    });
    it("creates a promise", function (done) {
      $promise(function (resolve) {
        setTimeout(resolve, 100);
      })
      .then(function () {
        done();
      });
    });

    it("resolves all promises", function (done) {
      $promise.all([
        123,
        $promise(resolve => { setTimeout(resolve, 100); })
      ]).then(function () {
        done();
      });
    });

    it("resolves any promise", function (done) {
      $promise.race([
        $promise(resolve => resolve()),
        $promise(resolve => {})
      ]).then(function () {
        done();
      });
    });

    it("creates a resolved promise", function (done) {
      $promise.resolve().then(done);
    });

    it("creates a rejected promise", function (done) {
      $promise.reject().catch(done);
    });
  });
  describe("without polyfill", function () {
    beforeAll(function () {
      Object.keys(require.cache).forEach(key => delete require.cache[key]);
      Class();
    });
    it("should use Promise", function () {
      expect($$promise).toBeDefined();
      expect($$promise).toBe(global.Promise);
    });
    it("creates a promise", function (done) {
      $promise(function (resolve) {
        setTimeout(resolve, 100);
      })
      .then(function () {
        done();
      });
    });

    it("resolves all promises", function (done) {
      $promise.all([
        123,
        $promise(resolve => { setTimeout(resolve, 100); })
      ]).then(function () {
        done();
      });
    });

    it("resolves any promise", function (done) {
      $promise.race([
        $promise(resolve => resolve()),
        $promise(resolve => {})
      ]).then(function () {
        done();
      });
    });

    it("creates a resolved promise", function (done) {
      $promise.resolve().then(done);
    });

    it("creates a rejected promise", function (done) {
      $promise.reject().catch(done);
    });
  });
});
