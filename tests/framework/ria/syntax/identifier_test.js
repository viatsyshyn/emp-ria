(function (ria) {
    "use strict";

    TestCase("IdentifierTestCase").prototype = {

        tearDown: function () {
            if (ria.__SYNTAX) {
                ria.__SYNTAX.Registry.cleanUp();
                ria.__SYNTAX.registerSymbolsMeta();
                window.SELF = ria.__SYNTAX.Modifiers.SELF;
            }
        },

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