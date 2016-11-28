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
        setRequestHeader : jasmine.createSpy(),
        getResponseHeader : jasmine.createSpy().and.returnValue('application/json; utf8')
      };
      BaseClass = Jpex.extend(function(_$xhr_, _$promise_){
        $xhr = _$xhr_;
        $promise = _$promise_;
      });
      BaseClass.Register.Constant('$xhrProvider', $xhrProvider);
      BaseClass();
    });

    it('should be a function', function () {
      expect(typeof $xhr).toBe('function');
    });
    it('should return a promise', function () {
      var result = $xhr();
      expect(result.then).toBeDefined();
      expect(result.catch).toBeDefined();
    });
    it('should open an xhr request', function () {
      $xhr({url : 'path', method : 'post'});
      expect(xhr.open).toHaveBeenCalledWith('post', 'path');
    });
    it('should set the request header', function () {
      $xhr({
        headers : {
          'Authorization' : '12345',
          'Foo' : 'Bah'
        }
      });
      expect(xhr.setRequestHeader).toHaveBeenCalledWith('Authorization', '12345');
      expect(xhr.setRequestHeader).toHaveBeenCalledWith('Foo', 'Bah');
      expect(xhr.setRequestHeader).toHaveBeenCalledWith('X-Requested-With', 'XMLHttpRequest');
    });
    it('should send the data', function () {
      $xhr({
        data : {x : 3}
      });
      expect(xhr.send).toHaveBeenCalledWith('{"x":3}');
    });
    it('should resolve the promise with data on load', function (done) {
      var onload;
      xhr.addEventListener.and.callFake(function (key, fn) {
        if (key === 'load'){
          onload = fn;
        }
      });

      xhr.status = 304;
      xhr.response = "{\"v\" : \"OK\"}";

      $xhr().then(function (result) {
        expect(result.status).toBe(304);
        expect(result.contentType).toBe('application/json');
        expect(result.data).toEqual({v : 'OK'});
        done();
      });

      onload();
    });
    it('should resolve with plain text', function (done) {
      var onload;
      xhr.addEventListener.and.callFake(function (key, fn) {
        if (key === 'load'){
          onload = fn;
        }
      });

      xhr.responseType = 'text';
      xhr.status = 200;
      xhr.responseText = "{\"v\" : \"OK\"}";
      xhr.getResponseHeader.and.returnValue('text/plain');

      $xhr().then(function (result) {
        expect(result.status).toBe(200);
        expect(result.contentType).toBe('text/plain');
        expect(result.data).toEqual("{\"v\" : \"OK\"}");
        done();
      });

      onload();
    });
    it('should reject if the status is errorful', function (done) {
      var onload;
      xhr.addEventListener.and.callFake(function (key, fn) {
        if (key === 'load'){
          onload = fn;
        }
      });

      xhr.status = 400;
      xhr.response = '"Something went wrong"';

      $xhr().catch(function (result) {
        expect(result.status).toBe(400);
        expect(result.contentType).toBe('application/json');
        expect(result.data).toEqual('Something went wrong');
        done();
      });

      onload();
    });
    it('should reject if the reuest fails to send', function (done) {
      var onerror;
      xhr.addEventListener.and.callFake(function (key, fn) {
        if (key === 'error'){
          onerror = fn;
        }
      });

      xhr.status = 0;

      $xhr().catch(function (result) {
        expect(result.status).toBe(0);
        expect(result.data).toBeUndefined();
        done();
      });

      onerror();
    });
  });
});
