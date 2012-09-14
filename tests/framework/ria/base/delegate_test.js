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
            fail('implement this');
        }
    }
})(ria);
