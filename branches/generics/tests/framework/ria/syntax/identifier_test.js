(function (ria) {
    "use strict";

    TestCase("IdentifierTestCase").prototype = {
        testBuildIdentifier: function () {
            var result;
            assertNoException(function () {
                result = ria.__SYNTAX.compileIdentifier('MyIdentifier');
            });

            assertNotUndefined(result);
            assertFunction(result);
            assertTrue(ria.__API.isIdentifier(result));
        }
    };

})(ria);