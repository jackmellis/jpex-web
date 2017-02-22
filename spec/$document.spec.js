describe("$document", function () {
  let Jpex, defaults, $window, $document;
  beforeEach(function () {
    Jpex = require('jpex');
    defaults = require('../src');
    Jpex.use(defaults);

    $window = { document : {} };
    Jpex.register.constant('$window', $window);

    Jpex.extend(function (_$document_) {
      $document = _$document_;
    })();
  });

  it("should return the docuemnt", function () {
    expect($document).toBe($window.document);
  });
});
