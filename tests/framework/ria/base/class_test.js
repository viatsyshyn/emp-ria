
(function () {
    "use strict";

    var CLASS = ria.__API.ClassDescriptor.build;

    TestCase("ClassTestCase").prototype = {
        setUp: function(){},

        testDeclaration: function () {
            var TestClass = CLASS('TestClass', [
                function $() {},
                function $nameCtor() {},

                function publicMember() {},
                function protectedMember_() {},

                'publicField',
                'protectedField_',

                STATIC, function staticMember() {}
            ]);

            assertFunction(TestClass);
            assertEquals(ria.getConstructorOf(TestClass), TestClass);
            assertFunction(TestClass.$nameCtor);
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
})();
