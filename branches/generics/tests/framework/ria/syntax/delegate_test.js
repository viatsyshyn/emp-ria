(function (ria) {
    "use strict";

    var OVERRIDE = ria.__SYNTAX.Modifiers.OVERRIDE;
    var ABSTRACT = ria.__SYNTAX.Modifiers.ABSTRACT;
    var VOID = ria.__SYNTAX.Modifiers.VOID;
    var SELF = ria.__SYNTAX.Modifiers.SELF;
    var FINAL = ria.__SYNTAX.Modifiers.FINAL;
    var READONLY = ria.__SYNTAX.Modifiers.READONLY;

    var Class = ria.__API.Class;
    var Interface = ria.__API.Interface;
    var Exception = ria.__API.Exception;

    var IMPLEMENTS = ria.__SYNTAX.IMPLEMENTS;
    /** @type {Function} */
    var EXTENDS = ria.__SYNTAX.EXTENDS;
    /** @type {Function} */
    var VALIDATE_ARG = ria.__SYNTAX.checkArg;
    /** @type {Function} */
    var VALIDATE_ARGS = ria.__SYNTAX.checkArgs;
    /** @type {Function} */
    var ArrayOf = ria.__API.ArrayOf;
    /** @type {Function} */
    var ClassOf = ria.__API.ClassOf;
    /** @type {Function} */
    var ImplementerOf = ria.__API.ImplementerOf;

    function DELEGATE() {
        var def = ria.__SYNTAX.parseMember(new ria.__SYNTAX.Tokenizer([].slice.call(arguments)));
        ria.__SYNTAX.validateDelegateDecl(def);
        return ria.__SYNTAX.compileDelegate('test.' + name, def);
    }

    kfunction DELEGATE_E(error, arg) {
        var def = ria.__SYNTAX.parseMember(new ria.__SYNTAX.Tokenizer([].slice.call(arguments)));
        ria.__SYNTAX.validateDelegateDecl(def);
        return ria.__SYNTAX.compileDelegate('test.' + name, def);
    }

    TestCase("DelegateTestCase").prototype = {
        testBuildDelegate: function () {
            var descriptor = DELEGATE(
                [[String, String]],
                Boolean, function compare(_1, _2) {});

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