/* globals describe, expect, it, beforeEach, afterEach ,spyOn*/
describe('Jpex - Default Factories', function(){
  describe('$xhrProvider', function(){
    var BaseClass, $xhrProvider;

    beforeEach(function(){
      BaseClass = Jpex.extend(function(_$xhrProvider_){
        $xhrProvider = _$xhrProvider_;
      });
      new BaseClass();
    });

    it('should inject the $xhrProvider object', function () {
      expect(typeof $xhrProvider).toBe('function');
    });
    it('should create a new instance of xmlHttpRequest', function () {
      var result = $xhrProvider();
      expect(result instanceof XMLHttpRequest).toBe(true);
    });
  });
});
