
(function (__API, ria) {
    "use strict";

    var CLASS = __API.ClassDescriptor.build;

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
        }
    }
})(ria.__API, ria);
