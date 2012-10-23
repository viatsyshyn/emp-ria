(function (ria) {
    "use strict";

    TestCase("ExceptionTestCase").prototype = {
        testBuildException: function () {
            var result;

            var exception = ria.__SYNTAX.parseClass(
                'MyException', [
                    String, 'member',

                    function $() {},

                    [String],
                    String, function method(_1) {
                        return 'I think, this is error: ' + _1;
                    }
                ]);

            exception.base = ria.__API.Exception;

            assertNoException(function () {
                result = ria.__SYNTAX.buildException('MyException', exception);
            });

            assertEquals('MyException', result.__META.name);
            assertNotUndefined(result);
            assertFunction(result);
        }
    };

})(ria);