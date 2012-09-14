//#ifdef _DEBUG
(function main() {
  "use strict";

  var HTTP_PATH_REGEX = /(http:\/\/[^\/]+\/[^:]*)/;

  function getCallerRootModuleId() {
    try {
      throw Error();
    } catch(e) {
      var stack = e.stack.toString().split(/\n/ig);
      var s = stack.pop();
      while (stack.length > 0 && (!s || !s.match(HTTP_PATH_REGEX)))
        s = stack.pop();

      var matches = s.match(HTTP_PATH_REGEX) || [];
      return matches.pop();
    }
  }

  var root;
  var rnd = ''; // '?_=' + 1;//Math.random().toString(36).substr(2);

  window.REQUIRE = function (path) {
    if (!root) root = getCallerRootModuleId().replace(/base\.js/, '');
    document.write('<script src="' + root + path + rnd + '" type="text/javascript"></script>');
  }
})();

REQUIRE('base/_base.js');
REQUIRE('base/_loader.js');
REQUIRE('base/function.js');
REQUIRE('base/enum.js');
REQUIRE('base/identifier.js');
REQUIRE('base/ns.js');
REQUIRE('base/annotation.js');
REQUIRE('base/types.js');
REQUIRE('base/parser.js');
REQUIRE('base/interface.js');
REQUIRE('base/class.js');
REQUIRE('base/exception.js');
REQUIRE('base/syntax.js');
REQUIRE('base/common.js');

delete window.REQUIRE;
//#endif