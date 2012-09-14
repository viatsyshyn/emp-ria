(function (ria) {
    "use strict";

    TestCase("InterfaceTestCase").prototype = {
        setUp: function(){},

        testCreate: function () {
            var i = ria.__API.ifc('TestInterface');
            ria.__API.method(i, null, 'compare', Boolean, [String, String], ['_1', '_2'], []);
            ria.__API.compile(i);

            assertFunction(i);
            assertNotUndefined(i.__META);
        },

        testUsage: function() {
            var i = ria.__API.ifc('TestInterface');
            ria.__API.method(i, null, 'compare', Boolean, [String, String], ['_1', '_2'], []);
            ria.__API.compile(i);

            assertNoException(function () {
                i();
            });

            assertException(function () {
                i();
            }, ria.__API.InvalidArgumentException);
        }
    }
})(ria);
