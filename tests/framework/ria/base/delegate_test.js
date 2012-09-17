(function (ria) {
    "use strict";

    TestCase("DelegateTestCase").prototype = {
        setUp: function(){},

        testCreate: function () {
            var d = ria.__API.delegate('TestDelegate', Boolean, [String, Number], ['s', 'n']);

            assertFunction(d);
            assertNotUndefined(d.__META);
        },

        testUsage: function() {
            var d = ria.__API.delegate('TestDelegate', Boolean, [String, Number], ['s', 'n']);

            var wrapper = d(function (s, n) { return s === String(n); });
            assertFunction(wrapper);
        },

        testTypeHinting: function () {

            var d = ria.__API.delegate('TestDelegate', Boolean, [String, Number], ['s', 'n_']);

            var wrapper = d(function (s, n) { return s === String(n); });

            assertNoException(function () {
                wrapper('1');
                wrapper('1', 2);
            });

            assertException(function () { wrapper(); }, Error);
            assertException(function () { wrapper(2, '3'); }, Error);
            assertException(function () { wrapper('2', 1, 3); }, Error);
        },

        testReturnTypeHinting: function () {

            var d = ria.__API.delegate('TestDelegate', Boolean, [Object], ['s']);

            var wrapper = d(function (s) { return s; });

            assertNoException(function () {
                wrapper(true);
            });

            assertException(function () { wrapper(2); }, Error);
        }
    }
})(ria);
