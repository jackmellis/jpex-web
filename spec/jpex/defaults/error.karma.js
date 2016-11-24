/* globals describe, expect, it, beforeEach, afterEach ,spyOn*/
describe('Jpex - Default Factories', function(){
  describe('$error', function(){
    var BaseClass, $error;

    beforeEach(function(){
      BaseClass = Jpex.extend(function(_$error_){
        $error = _$error_;
      });
      new BaseClass();
    });

    describe('Define', function(){
      it('should have a standard error defined', function(){
        expect($error.Error).toBeDefined();
      });
      it('should be an instance of Error', function(){
        expect(new $error.Error() instanceof Error).toBe(true);
      });
      it('should create a new Error', function(){
        var TestError = $error.define('TestError');
        expect(TestError).toBeDefined();
      });
      it('should attach the new Error to the factory', function(){
        var TestError = $error.define('TestError');
        expect($error.TestError).toBeDefined();
        expect($error.TestError).toBe(TestError);
      });
    });

    describe('Create', function(){
      var err;
      beforeEach(function(){
        $error.define('TestError', function(message, code){
          this.code = code;
          this.type = 'test';
        });
        err = $error.TestError.create('this is a test error', 999);
      });

      it('should create an instance of error', function(){
        expect(err).toBeDefined();
        expect(err instanceof Error).toBe(true);
      });
      it('should be an instance of itself', function(){
        expect(err instanceof $error.TestError).toBe(true);
      });
      it('should have any custom properties', function(){
        expect(err.type).toBe('test');
      });
      it('should accept a message', function(){
        expect(err.message).toBe('this is a test error');
      });
      it('should accept additional arguments', function(){
        expect(err.code).toBe(999);
      });
    });

    describe('Throw ', function(){
      beforeEach(function(){
        $error.define('TestError', function(message, code){
          this.code = code;
          this.type = 'test';
        });
      });

      it('should throw an error', function(){
        var err;
        try{
          $error('error');
        }catch(e){
          err = e;
        }finally{
          expect(err).toBeDefined();
          expect(err instanceof Error).toBe(true);
          expect(err instanceof $error.TestError).toBe(false);
        }
      });
      it('should throw a specific error using .throw()', function(){
        var err;
        try{
          $error.TestError.throw('uhoh');
        }catch(e){
          err = e;
        }finally{
          expect(err).toBeDefined();
          expect(err instanceof $error.TestError).toBe(true);
        }
      });
      it('should throw an error using throw ...', function(){
        var err;
        try{
          throw $error.TestError.throw('uhoh');
        }catch(e){
          err = e;
        }finally{
          expect(err).toBeDefined();
          expect(err instanceof $error.TestError).toBe(true);
        }
      });
      it('should override the standard error to be thrown', function(){
        $error.default = $error.TestError;
        var err;
        try{
          $error('error');
        }catch(e){
          err = e;
        }finally{
          expect(err).toBeDefined();
          expect(err instanceof Error).toBe(true);
          expect(err instanceof $error.TestError).toBe(true);
        }
      });
    });
  });

  describe('$errorHandler', function(){
    var BaseClass;
    beforeEach(function(){
      BaseClass = Jpex.extend(function($error, $log){
        spyOn($log, 'error');
        $error.define('TestError', function(){
          this.code = 1234;
          this.message = ['Test Error!!', this.message].join('\n');
        });
        $error.TestError.throw('thrown by BaseClass');
      });
    });

    it('should rethrow the error if $errorHandler is not defined', function(){
      var err;
      try{
        new BaseClass();
      }catch(e){
        err = e;
      }finally{
        expect(err).toBeDefined();
        expect(err.code).toBe(1234);
        expect(err.message).toBe('Test Error!!\nthrown by BaseClass');
      }
    });
    it('should handle the exception', function(){
      BaseClass.Register.Factory('$errorHandler', function($log){
        return function (err){
          $log.error(err);
        };
      });
      new BaseClass();
    });
    it('should use the current class\'s handler', function(){
      var $log;
      BaseClass.Register.Factory('$errorHandler', function(_$log_){
        return function(){
          $log = _$log_;
          $log.error('handled by BaseClass');
        };
      });

      var A = BaseClass.extend();
      var B = BaseClass.extend(function($error){
        $error.TestError.throw('thrown by B');
      });
      B.Register.Factory('$errorHandler', function($log){
        return function(){
          $log.error('handled by B');
        };
      });

      new A();
      new B();

      expect($log.error).toHaveBeenCalledWith('handled by BaseClass');
      expect($log.error).toHaveBeenCalledWith('handled by B');
    });
  });
});
