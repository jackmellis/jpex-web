/* globals describe, expect, it, beforeEach, afterEach ,spyOn*/
describe('Jpex - Default Factories', function(){
  describe('$timeout', function(){
    var BaseClass, $timeout, $interval, $immediate, $tick;

    beforeEach(function(){
      BaseClass = Jpex.extend(function(_$timeout_, _$interval_){
        $timeout = _$timeout_;
        $interval = _$interval_;
      });
      new BaseClass();
    });

    it('should inject a timeout', function(){
      expect($timeout).toBe(setTimeout);
      expect($interval).toBe(setInterval);
    });
  });
});
