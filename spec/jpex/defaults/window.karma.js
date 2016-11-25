/* globals describe, expect, it, beforeEach, afterEach ,spyOn*/
describe('Jpex - Default Factories', function(){
  describe('$window', function(){
    var BaseClass, $window;

    beforeEach(function(){
      BaseClass = Jpex.extend(function(_$window_){
        $window = _$window_;
      });
      new BaseClass();
    });

    it('should inject the window object', function () {
      expect($window).toBe(window);
    });
  });
});
