
(function (__API, ria) {
    "use strict";

    var CLASS = __API.ClassDescriptor.build,
        EXTENDS,
        STATIC,
        OVERRIDE,
        ABSTRACT,
        REINTRODUCE; // TODO assign value

    TestCase("ClassTestCase").prototype = {
        setUp: function(){},

        testDeclaration: function () {
            var TestClass = CLASS('TestClass', [
                function $() {},
                function $namedCtor() {},

                function publicMember() {},
                function protectedMember_() {},

                'publicField',
                'protectedField_',

                STATIC, function staticMember() {}
            ]);

            assertFunction(TestClass);
            assertEquals(ria.getConstructorOf(TestClass), TestClass);
            assertFunction(TestClass.$namedCtor);
            assertFunction(TestClass.staticMember);

            var instance;
            assertNoException(function () {
                instance = new TestClass();
            });

            assertFunction(instance.publicMember);
            assertUndefined(instance.protectedMember_);

            assertFunction(instance.getPublicField);
            assertFunction(instance.setPublicField);

            assertUndefined(instance.getProtectedField_);
            assertUndefined(instance.setProtectedField_);
        },

        testDublicateMethods: function () {
            assertException(function () {
                CLASS('TestClass', [
                    function publicMember() {},
                    function publicMember(a, b) {}
                ])
            }, MethodRedeclaredException)
        },

        testDublicateStaticMethods: function () {
            assertException(function () {
                CLASS('TestClass', [
                    STATIC, function staticMember() {},
                    STATIC, function staticMember(a, b) {}
                ])
            }, MethodRedeclaredException)
        },

        testDublicateCtors: function () {
            assertException(function () {
                CLASS('TestClass', [
                    function $() {},
                    function $(a, b) {}
                ])
            }, MethodRedeclaredException)
        },

        testDublicateNamedCtors: function () {
            assertException(function () {
                CLASS('TestClass', [
                    function $namedCtor() {},
                    function $namedCtor(a, b) {}
                ])
            }, MethodRedeclaredException)
        },

        testDublicateMember: function () {
            assertException(function () {
                CLASS('TestClass', [
                    String, 'publicMember',
                    Number, 'publicMember'
                ])
            }, MethodRedeclaredException)
        },

        testPrivateStaticMethod: function () {
            assertException(function () {
                CLASS('TestClass', [
                    STATIC, function staticMember_() {}
                ])
            }, InvalidClassDeclarationException)
        },

        testOverride: function () {
            var BaseClass = CLASS('BaseClass', [
                function publicMethod() {}
            ]);

            assertNoException(function () {
                CLASS('TestClass', EXTENDS(BaseClass), [
                    OVERRIDE, function publicMethod() {}
                ])
            });

            assertException(function () {
                CLASS('TestClass', EXTENDS(BaseClass), [
                    function publicMethod() {}
                ])
            }, InvalidClassDeclarationException)
        }
    }
})//(ria.__API, ria);
