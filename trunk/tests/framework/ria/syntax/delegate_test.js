(function (ria) {
    "use strict";

    TestCase("DelegateTestCase").prototype = {
        testBuildDelegate: function () {
            var descriptor = ria.__SYNTAX.parseMethod([
                [String, String],
                Boolean, function compare(_1, _2) {}
            ]);

            var result;
            assertNoException(function() {
                result = ria.__SYNTAX.buildDelegate('Compare', descriptor);
            });

            assertNotUndefined(result);
            assertFunction(result);
            assertTrue(ria.__API.isDelegate(result));
            assertEquals('Compare', result.__META.name);
        },

        testBuildDelegateWithAnnotation: function () {

            var MyAnnotation = ria.__API.annotation('MyAnnotation', [], []);

            var descriptor = ria.__SYNTAX.parseMethod([
                [MyAnnotation],
                [String, String],
                Boolean, function compare(_1, _2) {}
            ]);

            assertException(function() {
                ria.__SYNTAX.buildDelegate('Compare', descriptor);
            }, 'Error');
        },

        testBuildDelegateWithFINAL: function () {

            var descriptor = ria.__SYNTAX.parseMethod([
                [String, String],
                ria.__SYNTAX.Modifiers.FINAL, Boolean, function compare(_1, _2) {}
            ]);

            assertException(function() {
                ria.__SYNTAX.buildDelegate('Compare', descriptor);
            }, 'Error');
        },

        testBuildDelegateWithAbstract: function () {

            var descriptor = ria.__SYNTAX.parseMethod([
                [String, String],
                ria.__SYNTAX.Modifiers.ABSTRACT, Boolean, function compare(_1, _2) {}
            ]);

            assertException(function() {
                ria.__SYNTAX.buildDelegate('Compare', descriptor);
            }, 'Error');
        },

        testBuildDelegateWithOverride: function () {

            var descriptor = ria.__SYNTAX.parseMethod([
                [String, String],
                ria.__SYNTAX.Modifiers.OVERRIDE, Boolean, function compare(_1, _2) {}
            ]);

            assertException(function() {
                ria.__SYNTAX.buildDelegate('Compare', descriptor);
            }, 'Error');
        }
    };

})(ria);