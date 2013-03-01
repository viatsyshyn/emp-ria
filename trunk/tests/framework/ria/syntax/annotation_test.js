(function (ria) {
    "use strict";

    TestCase("AnnotationTestCase").prototype = {
        testBuildAnnotation: function () {
            var annotation = ria.__SYNTAX.parseMember(new ria.__SYNTAX.Tokenizer([
                [[String, String]],
                function compare(_1, _2) {}
            ]));

            assertNoException(function() {
                ria.__SYNTAX.validateAnnotationDecl(annotation);
            });

            var result = ria.__SYNTAX.compileAnnotation('Compare', annotation);

            assertNotUndefined(result);
            assertFunction(result);
            assertTrue(ria.__API.isAnnotation(result));
            assertEquals('Compare', result.__META.name);
        },

        testBuildAnnotationWithAnnotation: function () {

            var MyAnnotation = ria.__API.annotation('MyAnnotation', [], []);

            var annotation = ria.__SYNTAX.parseMember(new ria.__SYNTAX.Tokenizer([
                [MyAnnotation],
                [[String, String]],
                function compare(_1, _2) {}
            ]));

            assertException(function() {
                ria.__SYNTAX.validateAnnotationDecl(annotation);
            }, 'Error');
        },

        testBuildAnnotationWithFINAL: function () {

            var annotation = ria.__SYNTAX.parseMember(new ria.__SYNTAX.Tokenizer([
                [[String, String]],
                ria.__SYNTAX.Modifiers.FINAL, function compare(_1, _2) {}
            ]));

            assertException(function() {
                ria.__SYNTAX.validateAnnotationDecl(annotation);
            }, 'Error');
        },

        testBuildAnnotationWithAbstract: function () {

            var annotation = ria.__SYNTAX.parseMember(new ria.__SYNTAX.Tokenizer([
                [[String, String]],
                ria.__SYNTAX.Modifiers.ABSTRACT, function compare(_1, _2) {}
            ]));

            assertException(function() {
                ria.__SYNTAX.validateAnnotationDecl(annotation);
            }, 'Error');
        },

        testBuildAnnotationWithOverride: function () {

            var annotation = ria.__SYNTAX.parseMember(new ria.__SYNTAX.Tokenizer([
                [[String, String]],
                ria.__SYNTAX.Modifiers.OVERRIDE, function compare(_1, _2) {}
            ]));

            assertException(function() {
                ria.__SYNTAX.validateAnnotationDecl(annotation);
            }, 'Error');
        },

        testBuildAnnotationWithReturnType: function () {

            var annotation = ria.__SYNTAX.parseMember(new ria.__SYNTAX.Tokenizer([
                [[String, String]],
                Boolean, function compare(_1, _2) {}
            ]));

            assertException(function() {
                ria.__SYNTAX.validateAnnotationDecl(annotation);
            }, 'Error');
        },

        testBuildAnnotationWithVoid: function () {

            var annotation = ria.__SYNTAX.parseMember(new ria.__SYNTAX.Tokenizer([
                [[String, String]],
                ria.__SYNTAX.Modifiers.VOID, function compare(_1, _2) {}
            ]));

            assertException(function() {
                ria.__SYNTAX.validateAnnotationDecl(annotation);
            }, 'Error');
        },

        testBuildAnnotationWithSelf: function () {

            var annotation = ria.__SYNTAX.parseMember(new ria.__SYNTAX.Tokenizer([
                [[String, String]],
                ria.__SYNTAX.Modifiers.SELF, function compare(_1, _2) {}
            ]));

            assertException(function() {
                ria.__SYNTAX.validateAnnotationDecl(annotation);
            }, 'Error');

            var annotation2 = ria.__SYNTAX.parseMember(new ria.__SYNTAX.Tokenizer([
                [[String, ria.__SYNTAX.Modifiers.SELF]],
                function compare2(_1, _2) {}
            ]));

            assertException(function() {
                ria.__SYNTAX.validateAnnotationDecl(annotation);
            }, 'Error');
        }
    };

})(ria);