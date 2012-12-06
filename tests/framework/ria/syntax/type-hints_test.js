(function () {
    "use strict";

    TestCase("TypeHintsTestCase").prototype = {

        testCheckArgs: function () {
            var d = ria.__SYNTAX.buildDelegate('TestDelegate', Boolean, [String, Number], ['s', 'n_']);
            var wrapper = d(function (s, n) { return s === String(n); });

            assertNoException(function () { wrapper('1'); });
            assertNoException(function () { wrapper('1', 2); });

            assertException(function () { wrapper(); }, 'Error');
            assertException(function () { wrapper(2, '3'); }, 'Error');
            assertException(function () { wrapper('2', 1, 3); }, 'Error');
        },

        testCheckReturn: function () {
            var d = ria.__SYNTAX.buildDelegate('TestDelegate', Boolean, [Object], ['s']);
            var wrapper = d(function (s) { return s; });

            assertNoException(function () { wrapper(true); });

            assertException(function () { wrapper(2); }, 'Error');
        }
    };
})();