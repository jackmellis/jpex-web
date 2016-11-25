/* globals describe, expect, it, beforeEach, afterEach ,spyOn*/
describe('Jpex - Default Factories', function(){
  describe('$promise', function(){
    var BaseClass, $promise;

    beforeEach(function(){
      BaseClass = Jpex.extend(function($ipromise){
        $promise = $ipromise;
      });
      new BaseClass();
    });

    it('should wrap promise methods', function(){
      expect($promise.all).toBe(Promise.all);
      expect($promise.race).toBe(Promise.race);
      expect($promise.resolve).toBe(Promise.resolve);
      expect($promise.reject).toBe(Promise.reject);
    });

    it('should create a promise', function(done){
      $promise(function(resolve, reject){
        setTimeout(resolve, 100);
      })
      .then(function(){
        done();
      });
    });
  });
});
