(function (ria) {
    "use strict";

    TestCase("EnumTestCase").prototype = {
        testBuildEnum: function () {
            var result;
            assertNoException(function () {
                result = ria.__SYNTAX.compileEnum('Enumchyk', {
                    TWIX: true,
                    MARS: 2,
                    NUTS: '3'
                });
            });

            assertNotUndefined(result);
            assertFunction(result);
            assertTrue(ria.__API.isEnum(result));
        },

        testEnumException: function () {
            assertException(function () {
                ria.__SYNTAX.validateEnumDecl('Enumchyk', {
                    TWIX: true,
                    MARS: function (){},
                    NUTS: '3'
                });
            }, Error('Enum value should Number, String or Boolean, got function'));
        }
    };

})(ria);