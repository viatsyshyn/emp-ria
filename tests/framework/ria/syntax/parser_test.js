(function (ria) {
    "use strict";

    TestCase("ParserTestCase").prototype = {
        testParseMethod: function () {

            var result = ria.__SYNTAX.parseMethod([
                [String, Number, Boolean],
                Object, function protected_(a, b, c) {}
            ]);

            assertNotUndefined(result);
            assertInstanceOf(ria.__SYNTAX.MethodDescriptor, result);
        }
    };

})(ria);
