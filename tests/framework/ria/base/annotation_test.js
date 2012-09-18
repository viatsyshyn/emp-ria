(function (ria) {
    "use strict";

    TestCase("AnnotationTestCase").prototype = {
        setUp: function(){},

        testCreate: function () {
            var a = ria.__API.annotation('TestAnnotation', [Boolean, Number], ['x', 'y_']);

            assertFunction(a);
            assertNotUndefined(a.__META);
        },

        testUsage: function() {
            var a = ria.__API.annotation('TestAnnotation', [Boolean, Number], ['x', 'y_']);

            assertNoException(function () { a(true); });
            assertNoException(function () { a(true,2); });

            assertException(function () { a('2'); }, 'Error');

            assertException(function () { a(true, 5, null); }, 'Error');
        }
    }
})(ria);
