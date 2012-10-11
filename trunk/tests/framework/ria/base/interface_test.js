(function (ria) {
    "use strict";

    TestCase("InterfaceTestCase").prototype = {
        setUp: function(){},

        testCreate: function () {
            var i = ria.__API.ifc('TestInterface', ['compare', Boolean, [String, String], ['_1', '_2']]);

            assertFunction(i);
            assertNotUndefined(i.__META);
        },

        testUsage: function() {
            var i = ria.__API.ifc('TestInterface', ['compare', Boolean, [String, String], ['_1', '_2']]);

            assertException(function () { i(); }, 'Error');
        }
    }
})(ria);
