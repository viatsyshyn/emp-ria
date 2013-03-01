(function (ria) {
    "use strict";

    TestCase("DelegateTestCase").prototype = {
        testBuildDelegate: function () {
            var descriptor = ria.__SYNTAX.parseMember(new ria.__SYNTAX.Tokenizer([
                [[String, String]],
                Boolean, function compare(_1, _2) {}
            ]));

            assertNoException(function() {
                ria.__SYNTAX.validateDelegateDecl(descriptor);
            });

            var result = ria.__SYNTAX.compileDelegate('Compare', descriptor);

            assertNotUndefined(result);
            assertFunction(result);
            assertTrue(ria.__API.isDelegate(result));
            assertEquals('Compare', result.__META.name);
        },

        testBuildDelegateWithAnnotation: function () {

            var MyAnnotation = ria.__API.annotation('MyAnnotation', [], []);

            var descriptor = ria.__SYNTAX.parseMember(new ria.__SYNTAX.Tokenizer([
                [MyAnnotation],
                [[String, String]],
                Boolean, function compare(_1, _2) {}
            ]));

            assertException(function() {
                ria.__SYNTAX.validateDelegateDecl(descriptor);
            }, 'Error');
        },

        testBuildDelegateWithFINAL: function () {

            var descriptor = ria.__SYNTAX.parseMember(new ria.__SYNTAX.Tokenizer([
                [[String, String]],
                ria.__SYNTAX.Modifiers.FINAL, Boolean, function compare(_1, _2) {}
            ]));

            assertException(function() {
                ria.__SYNTAX.validateDelegateDecl(descriptor);
            }, 'Error');
        },

        testBuildDelegateWithAbstract: function () {

            var descriptor = ria.__SYNTAX.parseMember(new ria.__SYNTAX.Tokenizer([
                [[String, String]],
                ria.__SYNTAX.Modifiers.ABSTRACT, Boolean, function compare(_1, _2) {}
            ]));

            assertException(function() {
                ria.__SYNTAX.validateDelegateDecl(descriptor);
            }, 'Error');
        },

        testBuildDelegateWithOverride: function () {

            var descriptor = ria.__SYNTAX.parseMember(new ria.__SYNTAX.Tokenizer([
                [[String, String]],
                ria.__SYNTAX.Modifiers.OVERRIDE, Boolean, function compare(_1, _2) {}
            ]));

            assertException(function() {
                ria.__SYNTAX.validateDelegateDecl(descriptor);
            }, 'Error');
        },

        testBuildAnnotationWithSelf: function () {

            var descriptor = ria.__SYNTAX.parseMember(new ria.__SYNTAX.Tokenizer([
                [[String, String]],
                ria.__SYNTAX.Modifiers.SELF, function compare(_1, _2) {}
            ]));

            assertException(function() {
                ria.__SYNTAX.validateDelegateDecl(descriptor);
            }, 'Error');

            var descriptor2 = ria.__SYNTAX.parseMember(new ria.__SYNTAX.Tokenizer([
                [[String, ria.__SYNTAX.Modifiers.SELF]],
                Boolean,function compare2(_1, _2) {}
            ]));

            assertException(function() {
                ria.__SYNTAX.validateDelegateDecl(descriptor2);
            }, 'Error');
        }
    };

})(ria);