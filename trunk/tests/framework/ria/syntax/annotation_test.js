(function (ria) {
    "use strict";

    TestCase("AnnotationTestCase").prototype = {
        testBuildAnnotation: function () {
            var annotation = ria.__SYNTAX.parseMethod([
                [String, String],
                function compare(_1, _2) {}
            ]);

            var result;
            assertNoException(function() {
                result = ria.__SYNTAX.buildAnnotation('Compare', annotation);
            });

            assertNotUndefined(result);
            assertFunction(result);
            assertTrue(ria.__API.isAnnotation(result));
            assertEquals('Compare', result.__META.name);
        },

        testBuildAnnotationWithAnnotation: function () {

            var MyAnnotation = ria.__API.annotation('MyAnnotation', [], []);

            var annotation = ria.__SYNTAX.parseMethod([
                [MyAnnotation],
                [String, String],
                function compare(_1, _2) {}
            ]);

            assertException(function() {
                ria.__SYNTAX.buildAnnotation('Compare', annotation);
            }, 'Error');
        },

        testBuildAnnotationWithFINAL: function () {

            var annotation = ria.__SYNTAX.parseMethod([
                [String, String],
                ria.__SYNTAX.Modifiers.FINAL, function compare(_1, _2) {}
            ]);

            assertException(function() {
                ria.__SYNTAX.buildAnnotation('Compare', annotation);
            }, 'Error');
        },

        testBuildAnnotationWithAbstract: function () {

            var annotation = ria.__SYNTAX.parseMethod([
                [String, String],
                ria.__SYNTAX.Modifiers.ABSTRACT, function compare(_1, _2) {}
            ]);

            assertException(function() {
                ria.__SYNTAX.buildAnnotation('Compare', annotation);
            }, 'Error');
        },

        testBuildAnnotationWithOverride: function () {

            var annotation = ria.__SYNTAX.parseMethod([
                [String, String],
                ria.__SYNTAX.Modifiers.OVERRIDE, function compare(_1, _2) {}
            ]);

            assertException(function() {
                ria.__SYNTAX.buildAnnotation('Compare', annotation);
            }, 'Error');
        },

        testBuildAnnotationWithReturnType: function () {

            var annotation = ria.__SYNTAX.parseMethod([
                [String, String],
                Boolean, function compare(_1, _2) {}
            ]);

            assertException(function() {
                ria.__SYNTAX.buildAnnotation('Compare', annotation);
            }, 'Error');
        },

        testBuildAnnotationWithVoid: function () {

            var annotation = ria.__SYNTAX.parseMethod([
                [String, String],
                ria.__SYNTAX.Modifiers.VOID, function compare(_1, _2) {}
            ]);

            assertException(function() {
                ria.__SYNTAX.buildAnnotation('Compare', annotation);
            }, 'Error');
        },

        testBuildAnnotationWithSelf: function () {

            var annotation = ria.__SYNTAX.parseMethod([
                [String, String],
                ria.__SYNTAX.Modifiers.SELF, function compare(_1, _2) {}
            ]);

            assertException(function() {
                ria.__SYNTAX.buildAnnotation('Compare', annotation);
            }, 'Error');

            var annotation2 = ria.__SYNTAX.parseMethod([
                [String, ria.__SYNTAX.Modifiers.SELF],
                function compare2(_1, _2) {}
            ]);

            assertException(function() {
                ria.__SYNTAX.buildAnnotation('Compare2', annotation2);
            }, 'Error');
        }
    };

})(ria);