(function (ria) {
    "use strict";

    TestCase("InterfaceTestCase").prototype = {
        testSelf: function () {

            var MyIfc = INTERFACE(
                'MyIfc', [
                    READONLY, SELF, 'myProp',

                    SELF, function method1() {},

                    [[SELF]],
                    VOID, function method2(a) {}
                ]);

            assertEquals(MyIfc, MyIfc.__META.methods.method1.retType);
            assertEquals(MyIfc, MyIfc.__META.methods.method2.argsTypes[0]);
            assertEquals(MyIfc, MyIfc.__META.methods.getMyProp.retType);
        },

        testProperties: function () {
            var MyIfc = INTERFACE(
                'MyIfc', [
                    Number, 'myProp',

                    READONLY, Boolean, 'myFlag'
                ]);

            assertNotUndefined(MyIfc.__META.methods.getMyProp);
            assertNotUndefined(MyIfc.__META.methods.setMyProp);

            assertNotUndefined(MyIfc.__META.methods.isMyFlag);
            assertUndefined(MyIfc.__META.methods.setMyFlag);
        },

        testCtor: function() {
            INTERFACE_E(Error('ctor not supported'),
                'MyIfc', [
                    function $() {}
                ]);

            INTERFACE_E(Error('ctor not supported'),
                'MyIfc', [
                    function $fromData(d) {}
                ]);
        },

        testExtends: function() {
            INTERFACE_E(Error('EXTENDS not supported'),
                'MyIfc', EXTENDS(Class), []);
        },

        testImplements: function() {
            var BaseIfc = INTERFACE('BaseIfc', []);

            INTERFACE_E(Error('IMPLEMENTS not supported'),
                'MyIfc', IMPLEMENTS(BaseIfc), []);
        },

        testDublicates: function() {
            INTERFACE_E(Error('dublicate methods'),
                'MyIfc', [
                    function method1() {},
                    function method1(a, b) {}
                ]);
        },

        testMethodFlags: function() {
            INTERFACE_E(Error('Interface method can NOT be marked with ABSTRACT, OVERRIDE, READONLY or FINAL'),
                'MyIfc', [
                    OVERRIDE, function method1() {}
                ]);

            INTERFACE_E(Error('Interface method can NOT be marked with ABSTRACT, OVERRIDE, READONLY or FINAL'),
                'MyIfc', [
                    ABSTRACT, function method1() {}
                ]);

            INTERFACE_E(Error('Interface method can NOT be marked with ABSTRACT, OVERRIDE, READONLY or FINAL'),
                'MyIfc', [
                    READONLY, function method1() {}
                ]);

            INTERFACE_E(Error('Interface method can NOT be marked with ABSTRACT, OVERRIDE, READONLY or FINAL'),
                'MyIfc', [
                    FINAL, function method1() {}
                ]);
        },

        testPropertyFlags: function() {
            INTERFACE_E(Error('Interface property can NOT be marked with ABSTRACT, OVERRIDE or FINAL'),
                'MyIfc', [
                    OVERRIDE, 'prop'
                ]);

            INTERFACE_E(Error('Interface property can NOT be marked with ABSTRACT, OVERRIDE or FINAL'),
                'MyIfc', [
                    ABSTRACT, 'prop'
                ]);

            INTERFACE_E(Error('Interface property can NOT be marked with ABSTRACT, OVERRIDE or FINAL'),
                'MyIfc', [
                    FINAL, 'prop'
                ]);
        },

        testMethodAnnotation: function () {
            var MyAnnotation = ANNOTATION(
                function MyAnnotation() {});

            INTERFACE_E(Error('annotations not supported'),
                'MyIfc', [
                    [MyAnnotation],
                    function method1() {}
                ]);
        },

        testFlags: function() {
            INTERFACE_E(Error('Interface can NOT be marked with ABSTRACT'),
                ABSTRACT, 'MyIfc', []);

            INTERFACE_E(Error('Interface can NOT be marked with FINAL'),
                FINAL, 'MyIfc', []);

            INTERFACE_E(Error('Interface can NOT be marked with READONLY'),
                READONLY, 'MyIfc', []);
        }
    };

})(ria);