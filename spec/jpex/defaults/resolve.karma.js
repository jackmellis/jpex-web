/* globals describe, expect, it, beforeEach, afterEach ,spyOn*/
describe('Jpex - Default Factories', function(){
  describe('$resolve', function(){
    var BaseClass, $resolve;

    beforeEach(function(){
      BaseClass = Jpex.extend(function(_$resolve_){
        $resolve = _$resolve_;
      });
      BaseClass();
    });

    it('should resolve a dependency', function () {
      var $log = $resolve('$log');
      var $timeout = $resolve('$timeout');

      expect($log).toBeDefined();
      expect($timeout).toBeDefined();
    });

    it('should resolve a dependency on the current class', function () {
      BaseClass.Register.Constant('foo', 'bah');
      var foo = $resolve('foo');
      expect(foo).toBe('bah');
    });

    it('should be able to resolve itself!', function () {
      var r = $resolve('$resolve');
      expect(r).toBe($resolve);
    });

    it('should error if dependency cannot be resolved', function () {
      expect(function() { $resolve('blugh') }).toThrow();
    });

    it('should accept named parameters', function () {
      var test = $resolve('foo', {foo : 'bah'});
      expect(test).toBe('bah');
    });
  });
});
