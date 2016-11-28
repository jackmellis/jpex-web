/* globals describe, expect, it, beforeEach, afterEach ,spyOn*/
describe('Jpex - Default Factories', function(){
  describe('$xhr', function(){
    var BaseClass, $xhr, $xhrConfig, $xhrProvider, xhr, $promise;

    beforeEach(function(){
      $xhrProvider = function () {
        return xhr;
      };
      xhr = {
        addEventListener : jasmine.createSpy(),
        open : jasmine.createSpy(),
        send : jasmine.createSpy(),
        setRequestHeader : jasmine
      };
      BaseClass = Jpex.extend(function(_$xhr_, _$promise_){
        $xhr = _$xhr_;
        $promise = _$promise_;
      });
      BaseClass.Register.Constant('$xhrProvider', $xhrProvider);
      BaseClass();
    });

    it('should be a function');
    it('should return a promise');
    it('should open an xhr request');
    it('should set the request header');
    it('should send the data');
    it('should resolve the promise with data on load');
    it('should reject if the status is errorful');
    it('should reject if the reuest fails to send');

    it('should be possible to override the default config');
    it('should be possible to override the default config with ancestoral injection');
  });
});
