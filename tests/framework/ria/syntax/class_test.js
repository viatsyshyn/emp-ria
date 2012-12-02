(function (ria) {

    TestCase("ClassTestCase").prototype = {
        testSelf: function () {
            var baseClassDef = ria.__SYNTAX.parseClass([
                'BaseClass', [
                    function $() {},

                    [ria.__SYNTAX.Modifiers.SELF],
                    Number, function method2(a) {
                        return 3;
                    },

                    ria.__SYNTAX.Modifiers.SELF, function me() {
                        return new BaseClass();
                    },

                    [ria.__SYNTAX.Modifiers.SELF],
                    ria.__SYNTAX.Modifiers.SELF, function me2(a) {
                        return new BaseClass();
                    }
                ]]);

            var BaseClass;
            assertNoException(function () {
                BaseClass = ria.__SYNTAX.buildClass('BaseClass', baseClassDef);
            });

            assertEquals(BaseClass, BaseClass.__META.methods['me'].retType);
            assertEquals(BaseClass, BaseClass.__META.methods['me2'].retType);
            assertEquals(BaseClass, BaseClass.__META.methods['me2'].argsTypes[0]);
            assertEquals(BaseClass, BaseClass.__META.methods['method2'].argsTypes[0]);
        },

        testExtending: function () {
            var baseClassDef = ria.__SYNTAX.parseClass([
                'BaseClass', [
                    function $() {},

                    [Number],
                    Number, function method1(a) {
                        return 2 * a;
                    },

                    [Number],
                    Number, function method2(a) {
                        return 3 * a;
                    },

                    ria.__SYNTAX.Modifiers.FINAL, String, function hello() {
                        return 'Hello';
                    },

                    ria.__SYNTAX.Modifiers.ABSTRACT, Boolean, function isMyComputerOn() {
                        return false;
                    },

                    ria.__SYNTAX.Modifiers.SELF, function me() {
                        return new BaseClass();
                    }
                ]]);

            var BaseClass;
            assertNoException(function () {
                BaseClass = ria.__SYNTAX.buildClass('BaseClass', baseClassDef);
            });

            var childClassDef = ria.__SYNTAX.parseClass([
                ria.__SYNTAX.Modifiers.FINAL, 'MyClass', ria.__SYNTAX.EXTENDS(BaseClass), [
                    function $() {},

                    [Number],
                    ria.__SYNTAX.Modifiers.OVERRIDE, Number, function method2(a) {
                        return 3 * a;
                    },

                    ria.__SYNTAX.Modifiers.OVERRIDE, Boolean, function isMyComputerOn() {
                        return true;
                    }
                ]]);

            var ChildClass;
            assertNoException(function () {
                ChildClass = ria.__SYNTAX.buildClass('MyClass', childClassDef);
            });

            assertTrue(ria.__SYNTAX.isDescendantOf(ChildClass, ria.__API.Class));
            assertTrue(ria.__SYNTAX.isDescendantOf(ChildClass, BaseClass));
            assertTrue(ria.__SYNTAX.isDescendantOf(ChildClass, ChildClass));
        },

        testFinalClassExtending: function () {
            var baseClassDef = ria.__SYNTAX.parseClass([
                ria.__SYNTAX.Modifiers.FINAL, 'BaseClass', [
                    function $() {},

                    [Number],
                    Number, function method1(a) {
                        return 2 * a;
                    },

                    [Number],
                    Number, function method2(a) {
                        return 3 * a;
                    },

                    ria.__SYNTAX.Modifiers.FINAL, String, function hello() {
                        return 'Hello';
                    },

                    ria.__SYNTAX.Modifiers.ABSTRACT, Boolean, function isMyComputerOn() {
                        return false;
                    },

                    ria.__SYNTAX.Modifiers.SELF, function me() {
                        return new BaseClass();
                    }
                ]]);

            var BaseClass;
            assertNoException(function () {
                BaseClass = ria.__SYNTAX.buildClass('BaseClass', baseClassDef);
            });

            var childClassDef = ria.__SYNTAX.parseClass([
                ria.__SYNTAX.Modifiers.FINAL, 'MyClass', ria.__SYNTAX.EXTENDS(BaseClass), [
                    function $() {},

                    [Number],
                    ria.__SYNTAX.Modifiers.OVERRIDE, Number, function method2(a) {
                        return 3 * a;
                    },

                    ria.__SYNTAX.Modifiers.OVERRIDE, Boolean, function isMyComputerOn() {
                        return true;
                    }
                ]]);

            assertException(function () {
                ria.__SYNTAX.buildClass('MyClass', childClassDef);
            });
        },

        testAbstractClassInstantiating: function(){
            var baseClassDef = ria.__SYNTAX.parseClass([
                ria.__SYNTAX.Modifiers.ABSTRACT, 'BaseClass', [
                    function $() {},

                    [Number],
                    Number, function method1(a) {
                        return 2 * a;
                    }
                ]]);

            var BaseClass;
            assertNoException(function () {
                BaseClass = ria.__SYNTAX.buildClass('BaseClass', baseClassDef);
            });

            assertException(function () {
                new BaseClass();
            });

            var baseClass2Def = ria.__SYNTAX.parseClass([
                'BaseClass2', [
                    function $() {},

                    [Number],
                    Number, function method1(a) {
                        return 2 * a;
                    }
                ]]);

            var BaseClass2;
            assertNoException(function () {
                BaseClass2 = ria.__SYNTAX.buildClass('BaseClass2', baseClass2Def);
            });

            assertNoException(function () {
                new BaseClass2();
            });
        },

        testFinalMethodExtending: function () {
            var baseClassDef = ria.__SYNTAX.parseClass([
                'BaseClass', [
                    function $() {},

                    [Number],
                    Number, function method1(a) {
                        return 2 * a;
                    },

                    [Number],
                    Number, function method2(a) {
                        return 3 * a;
                    },

                    ria.__SYNTAX.Modifiers.FINAL, String, function hello() {
                        return 'Hello';
                    },

                    ria.__SYNTAX.Modifiers.ABSTRACT, Boolean, function isMyComputerOn() {
                        return false;
                    }
                ]]);

            var BaseClass;
            assertNoException(function () {
                BaseClass = ria.__SYNTAX.buildClass('BaseClass', baseClassDef);
            });

            var childClassDef = ria.__SYNTAX.parseClass([
                'MyClass', ria.__SYNTAX.EXTENDS(BaseClass), [
                    function $() {},

                    [Number],
                    ria.__SYNTAX.Modifiers.OVERRIDE, Number, function method2(a) {
                        return 3 * a;
                    },

                    String, function hello() {
                        return 'Hello world';
                    },

                    Boolean, function isMyComputerOn() {
                        return true;
                    }
                ]]);

            assertException(function () {
                ria.__SYNTAX.buildClass('MyClass', childClassDef);
            });
        },

        testAbstractMethodExtending: function () {
            var baseClassDef = ria.__SYNTAX.parseClass([
                'BaseClass', [
                    function $() {},

                    [Number],
                    Number, function method1(a) {
                        return 2 * a;
                    },

                    [Number],
                    Number, function method2(a) {
                        return 3 * a;
                    },

                    ria.__SYNTAX.Modifiers.FINAL, String, function hello() {
                        return 'Hello';
                    },

                    ria.__SYNTAX.Modifiers.ABSTRACT, Boolean, function isMyComputerOn() {
                        return false;
                    }
                ]]);

            var BaseClass;
            assertNoException(function () {
                BaseClass = ria.__SYNTAX.buildClass('BaseClass', baseClassDef);
            });

            var childClassDef = ria.__SYNTAX.parseClass([
                'MyClass', ria.__SYNTAX.EXTENDS(BaseClass), [
                    function $() {},

                    [Number],
                    ria.__SYNTAX.Modifiers.OVERRIDE, Number, function method2(a) {
                        return 3 * a;
                    }
                ]]);

            assertException(function () {
                ria.__SYNTAX.buildClass('MyClass', childClassDef);
            });
        },

        testOverrideMethodExtending: function () {
            var baseClassDef = ria.__SYNTAX.parseClass([
                'BaseClass', [
                    function $() {},

                    [Number],
                    Number, function method1(a) {
                        return 2 * a;
                    },

                    [Number],
                    Number, function method2(a) {
                        return 3 * a;
                    },

                    ria.__SYNTAX.Modifiers.FINAL, String, function hello() {
                        return 'Hello';
                    },

                    ria.__SYNTAX.Modifiers.ABSTRACT, Boolean, function isMyComputerOn() {
                        return false;
                    }
                ]]);

            var BaseClass;
            assertNoException(function () {
                BaseClass = ria.__SYNTAX.buildClass('BaseClass', baseClassDef);
            });

            var childClassDef = ria.__SYNTAX.parseClass([
                'MyClass', ria.__SYNTAX.EXTENDS(BaseClass), [
                    function $() {},

                    [Number],
                    Number, function method2(a) {
                        return 3 * a;
                    },

                    ria.__SYNTAX.Modifiers.OVERRIDE, Boolean, function isMyComputerOn() {
                        return true;
                    }
                ]]);

            assertException(function () {
                ria.__SYNTAX.buildClass('MyClass', childClassDef);
            });

            var childClassDef2 = ria.__SYNTAX.parseClass([
                'MyClass2', ria.__SYNTAX.EXTENDS(BaseClass), [
                    function $() {},

                    [Number],
                    ria.__SYNTAX.Modifiers.OVERRIDE, Number, function method2(a) {
                        return 3 * a;
                    },

                    Boolean, function isMyComputerOn() {
                        return true;
                    }
                ]]);

            assertException(function () {
                ria.__SYNTAX.buildClass('MyClass2', childClassDef2);
            });
        },

        testTwoExtending: function () {
            var baseClassDef = ria.__SYNTAX.parseClass([
                'BaseClass', [
                    function $() {},

                    [Number],
                    Number, function method1(a) {
                        return 2 * a;
                    },

                    [Number],
                    Number, function method2(a) {
                        return 3 * a;
                    },

                    ria.__SYNTAX.Modifiers.FINAL, String, function hello() {
                        return 'Hello';
                    },

                    ria.__SYNTAX.Modifiers.ABSTRACT, Boolean, function isMyComputerOn() {
                        return false;
                    },

                    ria.__SYNTAX.Modifiers.SELF, function me() {
                        return new BaseClass();
                    }
                ]]);

            var BaseClass;
            assertNoException(function () {
                BaseClass = ria.__SYNTAX.buildClass('BaseClass', baseClassDef);
            });

            var firstClassDef = ria.__SYNTAX.parseClass([
                'FirstClass', ria.__SYNTAX.EXTENDS(BaseClass), [
                    function $() {},

                    [Number],
                    Number, function method3(a) {
                        return 4 * a;
                    },

                    [Number],
                    Number, function method4(a) {
                        return 5 * a;
                    },

                    [Number],
                    ria.__SYNTAX.Modifiers.OVERRIDE, Number, function method1(a) {
                        return 2 * a;
                    },

                    [Number],
                    ria.__SYNTAX.Modifiers.OVERRIDE, Number, function method2(a) {
                        return 3 * a;
                    },

                    ria.__SYNTAX.Modifiers.OVERRIDE, Boolean, function isMyComputerOn() {
                        return true;
                    },

                    ria.__SYNTAX.Modifiers.ABSTRACT, Boolean, function isItToday() {
                        return false;
                    }
                ]]);
            var FirstClass;
            assertNoException(function () {
                FirstClass = ria.__SYNTAX.buildClass('FirstClass', firstClassDef);
            });

            var secondClassDef = ria.__SYNTAX.parseClass([
                ria.__SYNTAX.Modifiers.ABSTRACT, 'SecondClass', ria.__SYNTAX.EXTENDS(FirstClass), [
                    function $() {},

                    [Number],
                    ria.__SYNTAX.Modifiers.OVERRIDE, Number, function method3(a) {
                        return 4 * a;
                    },

                    [Number],
                    ria.__SYNTAX.Modifiers.OVERRIDE, Number, function method2(a) {
                        return 3 * a;
                    },

                    ria.__SYNTAX.Modifiers.OVERRIDE, ria.__SYNTAX.Modifiers.FINAL, Boolean, function isMyComputerOn() {
                        return true;
                    },

                    ria.__SYNTAX.Modifiers.OVERRIDE, Boolean, function isItToday() {
                        return false;
                    }
                ]]);

            assertNoException(function () {
                ria.__SYNTAX.buildClass('SecondClass', secondClassDef);
            });
        },

        testTwoExtendingWithFinal: function () {
            var baseClassDef = ria.__SYNTAX.parseClass([
                'BaseClass', [
                    function $() {},

                    [Number],
                    Number, function method1(a) {
                        return 2 * a;
                    },

                    [Number],
                    Number, function method2(a) {
                        return 3 * a;
                    },

                    ria.__SYNTAX.Modifiers.FINAL, String, function hello() {
                        return 'Hello';
                    },

                    ria.__SYNTAX.Modifiers.ABSTRACT, Boolean, function isMyComputerOn() {
                        return false;
                    },

                    ria.__SYNTAX.Modifiers.SELF, function me() {
                        return new BaseClass();
                    }
                ]]);

            var BaseClass;
            assertNoException(function () {
                BaseClass = ria.__SYNTAX.buildClass('BaseClass', baseClassDef);
            });

            var firstClassDef = ria.__SYNTAX.parseClass([
                'FirstClass', ria.__SYNTAX.EXTENDS(BaseClass), [
                    function $() {},

                    [Number],
                    Number, function method3(a) {
                        return 4 * a;
                    },

                    [Number],
                    Number, function method4(a) {
                        return 5 * a;
                    },

                    [Number],
                    ria.__SYNTAX.Modifiers.OVERRIDE, Number, function method1(a) {
                        return 2 * a;
                    },

                    [Number],
                    ria.__SYNTAX.Modifiers.OVERRIDE, Number, function method2(a) {
                        return 3 * a;
                    },

                    ria.__SYNTAX.Modifiers.OVERRIDE, Boolean, function isMyComputerOn() {
                        return true;
                    },

                    ria.__SYNTAX.Modifiers.ABSTRACT, Boolean, function isItToday() {
                        return false;
                    }
                ]]);
            var FirstClass;
            assertNoException(function () {
                FirstClass = ria.__SYNTAX.buildClass('FirstClass', firstClassDef);
            });

            var secondClassDef = ria.__SYNTAX.parseClass([
                'SecondClass', ria.__SYNTAX.EXTENDS(FirstClass), [
                    function $() {},

                    [Number],
                    ria.__SYNTAX.Modifiers.OVERRIDE, Number, function method3(a) {
                        return 4 * a;
                    },

                    [Number],
                    ria.__SYNTAX.Modifiers.OVERRIDE, Number, function method2(a) {
                        return 3 * a;
                    },

                    [Number],
                    ria.__SYNTAX.Modifiers.OVERRIDE, String, function hello() {
                        return 'Hello';
                    },

                    ria.__SYNTAX.Modifiers.OVERRIDE, ria.__SYNTAX.Modifiers.FINAL, Boolean, function isMyComputerOn() {
                        return true;
                    },

                    ria.__SYNTAX.Modifiers.OVERRIDE, Boolean, function isItToday() {
                        return false;
                    }
                ]]);

            assertException(function () {
                ria.__SYNTAX.buildClass('SecondClass', secondClassDef);
            });
        },

        testTwoExtendingWithOverride: function () {
            var baseClassDef = ria.__SYNTAX.parseClass([
                'BaseClass', [
                    function $() {},

                    [Number],
                    Number, function method1(a) {
                        return 2 * a;
                    },

                    [Number],
                    Number, function method2(a) {
                        return 3 * a;
                    },

                    ria.__SYNTAX.Modifiers.FINAL, String, function hello() {
                        return 'Hello';
                    },

                    ria.__SYNTAX.Modifiers.ABSTRACT, Boolean, function isMyComputerOn() {
                        return false;
                    },

                    ria.__SYNTAX.Modifiers.SELF, function me() {
                        return new BaseClass();
                    }
                ]]);

            var BaseClass;
            assertNoException(function () {
                BaseClass = ria.__SYNTAX.buildClass('BaseClass', baseClassDef);
            });

            var firstClassDef = ria.__SYNTAX.parseClass([
                'FirstClass', ria.__SYNTAX.EXTENDS(BaseClass), [
                    function $() {},

                    [Number],
                    Number, function method3(a) {
                        return 4 * a;
                    },

                    [Number],
                    Number, function method4(a) {
                        return 5 * a;
                    },

                    [Number],
                    ria.__SYNTAX.Modifiers.OVERRIDE, Number, function method1(a) {
                        return 2 * a;
                    },

                    [Number],
                    ria.__SYNTAX.Modifiers.OVERRIDE, Number, function method2(a) {
                        return 3 * a;
                    },

                    ria.__SYNTAX.Modifiers.OVERRIDE, Boolean, function isMyComputerOn() {
                        return true;
                    },

                    ria.__SYNTAX.Modifiers.ABSTRACT, Boolean, function isItToday() {
                        return false;
                    }
                ]]);
            var FirstClass;
            assertNoException(function () {
                FirstClass = ria.__SYNTAX.buildClass('FirstClass', firstClassDef);
            });

            var secondClassDef = ria.__SYNTAX.parseClass([
                'SecondClass', ria.__SYNTAX.EXTENDS(FirstClass), [
                    function $() {},

                    [Number],
                    ria.__SYNTAX.Modifiers.OVERRIDE, Number, function method3(a) {
                        return 4 * a;
                    },

                    [Number],
                    Number, function method2(a) {
                        return 3 * a;
                    },

                    ria.__SYNTAX.Modifiers.OVERRIDE, ria.__SYNTAX.Modifiers.FINAL, Boolean, function isMyComputerOn() {
                        return true;
                    },

                    ria.__SYNTAX.Modifiers.OVERRIDE, Boolean, function isItToday() {
                        return false;
                    }
                ]]);

            assertException(function () {
                ria.__SYNTAX.buildClass('SecondClass', secondClassDef);
            });
        },

        testTwoExtendingWithAbstract: function () {
            var baseClassDef = ria.__SYNTAX.parseClass([
                'BaseClass', [
                    function $() {},

                    [Number],
                    Number, function method1(a) {
                        return 2 * a;
                    },

                    [Number],
                    Number, function method2(a) {
                        return 3 * a;
                    },

                    ria.__SYNTAX.Modifiers.FINAL, String, function hello() {
                        return 'Hello';
                    },

                    ria.__SYNTAX.Modifiers.ABSTRACT, Boolean, function isMyComputerOn() {
                        return false;
                    },

                    ria.__SYNTAX.Modifiers.SELF, function me() {
                        return new BaseClass();
                    }
                ]]);

            var BaseClass;
            assertNoException(function () {
                BaseClass = ria.__SYNTAX.buildClass('BaseClass', baseClassDef);
            });

            var firstClassDef = ria.__SYNTAX.parseClass([
                'FirstClass', ria.__SYNTAX.EXTENDS(BaseClass), [
                    function $() {},

                    [Number],
                    Number, function method3(a) {
                        return 4 * a;
                    },

                    [Number],
                    Number, function method4(a) {
                        return 5 * a;
                    },

                    [Number],
                    ria.__SYNTAX.Modifiers.OVERRIDE, Number, function method1(a) {
                        return 2 * a;
                    },

                    [Number],
                    ria.__SYNTAX.Modifiers.OVERRIDE, Number, function method2(a) {
                        return 3 * a;
                    },

                    ria.__SYNTAX.Modifiers.OVERRIDE, Boolean, function isMyComputerOn() {
                        return true;
                    },

                    ria.__SYNTAX.Modifiers.ABSTRACT, Boolean, function isItToday() {
                        return false;
                    }
                ]]);
            var FirstClass;
            assertNoException(function () {
                FirstClass = ria.__SYNTAX.buildClass('FirstClass', firstClassDef);
            });

            var secondClassDef = ria.__SYNTAX.parseClass([
                'SecondClass', ria.__SYNTAX.EXTENDS(FirstClass), [
                    function $() {},

                    [Number],
                    ria.__SYNTAX.Modifiers.OVERRIDE, Number, function method3(a) {
                        return 4 * a;
                    },

                    [Number],
                    ria.__SYNTAX.Modifiers.OVERRIDE, ria.__SYNTAX.Modifiers.ABSTRACT, Number, function method2(a) {
                        return 3 * a;
                    },

                    ria.__SYNTAX.Modifiers.OVERRIDE, ria.__SYNTAX.Modifiers.FINAL, Boolean, function isMyComputerOn() {
                        return true;
                    },

                    ria.__SYNTAX.Modifiers.OVERRIDE, Boolean, function isItToday() {
                        return false;
                    }
                ]]);

            assertException(function () {
                ria.__SYNTAX.buildClass('SecondClass', secondClassDef);
            });

            var thirdClassDef = ria.__SYNTAX.parseClass([
                'ThirdClass', ria.__SYNTAX.EXTENDS(FirstClass), [
                    function $() {},

                    [Number],
                    ria.__SYNTAX.Modifiers.OVERRIDE, Number, function method3(a) {
                        return 4 * a;
                    },

                    [Number],
                    ria.__SYNTAX.Modifiers.ABSTRACT, Number, function method2(a) {
                        return 3 * a;
                    },

                    ria.__SYNTAX.Modifiers.OVERRIDE, ria.__SYNTAX.Modifiers.FINAL, Boolean, function isMyComputerOn() {
                        return true;
                    },

                    ria.__SYNTAX.Modifiers.OVERRIDE, Boolean, function isItToday() {
                        return false;
                    }
                ]]);

            assertException(function () {
                ria.__SYNTAX.buildClass('ThirdClass', thirdClassDef);
            });
        }
    };

})(ria);