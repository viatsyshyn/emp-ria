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
            //assertNoException(function () {
                BaseClass = ria.__SYNTAX.buildClass('BaseClass', baseClassDef);
            //});

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
        },

        testBASE: function () {
            var baseClassDef = ria.__SYNTAX.parseClass([
                'BaseClass', [
                    ria.__SYNTAX.Modifiers.READONLY, Number, 'value',

                    function $(value) {
                        this.value = value;
                    },

                    ria.__SYNTAX.Modifiers.VOID, function method(value) {
                        this.value = value;
                    }
                ]]);

            var BaseClass;
            assertNoException(function () {
                BaseClass = ria.__SYNTAX.buildClass('BaseClass', baseClassDef);
            });

            var secondClassDef = ria.__SYNTAX.parseClass([
                'SecondClass', ria.__SYNTAX.EXTENDS(BaseClass), [
                    function $() {
                        BASE(5);
                    },

                    [Number],
                    ria.__SYNTAX.Modifiers.OVERRIDE, ria.__SYNTAX.Modifiers.VOID, function method(value) {
                        BASE(value);
                    }
                ]]);

            var SecondClass;
            assertNoException(function () {
                SecondClass = ria.__SYNTAX.buildClass('SecondClass', secondClassDef);
            });


            var instance;
            assertNoException(function () {
                instance = new SecondClass();
            });

            assertEquals(instance.getValue(), 5);

            assertNoException(function () {
                instance.method(7);
            });

            assertEquals(instance.getValue(), 7);
        },

        testSELF: function () {
            var baseClassDef = ria.__SYNTAX.parseClass([
                'BaseClass', [
                    Number, 'value',

                    function $() {
                        assertEquals(BaseClass, SELF);
                    },

                    ria.__SYNTAX.Modifiers.VOID, function method() {
                        assertEquals(BaseClass, SELF);
                    }
                ]]);

            var BaseClass;
            assertNoException(function () {
                BaseClass = ria.__SYNTAX.buildClass('BaseClass', baseClassDef);
            });

            assertNotEquals(BaseClass, SELF);
            var instance = new BaseClass();
            assertNotEquals(BaseClass, SELF);
            instance.method();
            assertNotEquals(BaseClass, SELF);
        },

        testPropertyInheritance: function () {
            var baseClassDef = ria.__SYNTAX.parseClass([
                'BaseClass', [
                    Number, 'value',

                    function $() { this.value = null; },

                    ria.__SYNTAX.Modifiers.VOID, function method(value) {
                        this.value = value;
                    }
                ]]);

            var BaseClass;
            assertNoException(function () {
                BaseClass = ria.__SYNTAX.buildClass('BaseClass', baseClassDef);
            });

            assertNotNull(BaseClass.__META.properties['value']);
            assertFunction(BaseClass.__META.properties['value'].getter);
            assertFunction(BaseClass.__META.properties['value'].setter);

            var instance = new BaseClass();

            assertUndefined(instance.value);
            instance.method(5);
            assertUndefined(instance.value);

            assertEquals(5, instance.__PROTECTED.value);

            assertEquals(5, instance.getValue());

            assertUndefined(instance.value);
            assertNoException(function (){
                instance.setValue(6);
            });
            assertUndefined(instance.value);

            assertEquals(6, instance.getValue());
        },

        testPropertyFlags: function () {
            var baseClassDef = ria.__SYNTAX.parseClass([
                'BaseClass', [
                    function $() {
                        this.abstractString = null;
                        this.value = null;
                        this.selfValue = null;
                    },

                    ria.__SYNTAX.Modifiers.ABSTRACT, String, 'abstractString',

                    ria.__SYNTAX.Modifiers.ABSTRACT, String, function getAbstractString() {
                        return this.abstractString;
                    },

                    [String],
                    ria.__SYNTAX.Modifiers.ABSTRACT, ria.__SYNTAX.Modifiers.VOID, function setAbstractString(string) {
                        this.abstractString = string;
                    },

                    ria.__SYNTAX.Modifiers.FINAL, Number, 'value',

                    ria.__SYNTAX.Modifiers.FINAL, Number, function getValue() {
                        return this.value;
                    },

                    ria.__SYNTAX.Modifiers.FINAL, Number, 'value2'
                ]]);

            var BaseClass;
            assertNoException(function () {
                BaseClass = ria.__SYNTAX.buildClass('BaseClass', baseClassDef);
            });

            var secondClassDef = ria.__SYNTAX.parseClass([
                'SecondClass', ria.__SYNTAX.EXTENDS(BaseClass), [
                    function $() {},

                    ria.__SYNTAX.Modifiers.OVERRIDE, String, function getAbstractString() {
                        return this.abstractString;
                    },

                    [String],
                    ria.__SYNTAX.Modifiers.OVERRIDE, ria.__SYNTAX.Modifiers.VOID, function setAbstractString(string) {
                        this.abstractString = string;
                    }
                ]]);

            var SecondClass;
            assertNoException(function () {
                SecondClass = ria.__SYNTAX.buildClass('SecondClass', secondClassDef);
            });
        },

        testPropertyFlags_redefining: function () {
            var baseClassDef = ria.__SYNTAX.parseClass([
                'BaseClass', [
                    function $() {},

                    Number, 'value'
                ]]);

            var BaseClass;
            assertNoException(function () {
                BaseClass = ria.__SYNTAX.buildClass('BaseClass', baseClassDef);
            });

            var secondClassDef = ria.__SYNTAX.parseClass([
                'SecondClass', ria.__SYNTAX.EXTENDS(BaseClass), [
                    function $() {},

                    ria.__SYNTAX.Modifiers.OVERRIDE, Number, 'value'
                ]]);

            var SecondClass;
            assertException(function () {
                SecondClass = ria.__SYNTAX.buildClass('SecondClass', secondClassDef);
            });

            var secondClass2Def = ria.__SYNTAX.parseClass([
                'SecondClass2', ria.__SYNTAX.EXTENDS(BaseClass), [
                    function $() {},

                    Number, 'value'
                ]]);

            var SecondClass2;
            assertException(function () {
                SecondClass2 = ria.__SYNTAX.buildClass('SecondClass2', secondClass2Def);
            });
        },

        testPropertyFlags_differentFlagsToGettersSetters: function () {
            var baseClassDef = ria.__SYNTAX.parseClass([
                'BaseClass', [
                    function $() {
                        this.value = null;
                    },

                    ria.__SYNTAX.Modifiers.FINAL, Number, 'value',

                    Number, function getValue() {
                        return this.value;
                    }
                ]]);

            var BaseClass;
            assertException(function () {
                BaseClass = ria.__SYNTAX.buildClass('BaseClass', baseClassDef);
            });

            var baseClass2Def = ria.__SYNTAX.parseClass([
                'BaseClass2', [
                    function $() {
                        this.value = null;
                    },

                    ria.__SYNTAX.Modifiers.FINAL, Number, 'value',

                    ria.__SYNTAX.Modifiers.ABSTRACT, Number, function getValue() {
                        return this.value;
                    }
                ]]);

            var BaseClass2;
            assertException(function () {
                BaseClass2 = ria.__SYNTAX.buildClass('BaseClass2', baseClass2Def);
            });
        },

        testPropertyFlags_abstractGettersSetters: function () {
            var baseClassDef = ria.__SYNTAX.parseClass([
                'BaseClass', [
                    function $() {
                        this.abstractString = null;
                        this.value = null;
                        this.selfValue = null;
                    },

                    ria.__SYNTAX.Modifiers.ABSTRACT, String, 'abstractString'
                ]]);

            var BaseClass;
            assertNoException(function () {
                BaseClass = ria.__SYNTAX.buildClass('BaseClass', baseClassDef);
            });

            var secondClassDef = ria.__SYNTAX.parseClass([
                'SecondClass', ria.__SYNTAX.EXTENDS(BaseClass), [
                    function $() {}
                ]]);

            var SecondClass;
            assertException(function () {
                SecondClass = ria.__SYNTAX.buildClass('SecondClass', secondClassDef);
            });

            var secondClass2Def = ria.__SYNTAX.parseClass([
                'SecondClass2', ria.__SYNTAX.EXTENDS(BaseClass), [
                    function $() {},

                    ria.__SYNTAX.Modifiers.OVERRIDE, String, function getAbstractString() {
                        return this.abstractString + "_";
                    }
                ]]);

            var SecondClass2;
            assertException(function () {
                SecondClass2 = ria.__SYNTAX.buildClass('SecondClass2', secondClass2Def);
            });

            var secondClass3Def = ria.__SYNTAX.parseClass([
                'SecondClass3', ria.__SYNTAX.EXTENDS(BaseClass), [
                    function $() {},

                    ria.__SYNTAX.Modifiers.OVERRIDE, String, function getAbstractString() {
                        return this.abstractString + "_";
                    },

                    [String],
                    ria.__SYNTAX.Modifiers.VOID, function setAbstractString(string) {
                        this.abstractString = string;
                    }
                ]]);

            var SecondClass3;
            assertException(function () {
                SecondClass3 = ria.__SYNTAX.buildClass('SecondClass2', secondClass3Def);
            });
        },

        testPropertyFlags_overriddenGettersSetters: function () {
            var baseClassDef = ria.__SYNTAX.parseClass([
                'BaseClass', [
                    function $() {
                        this.value = null;
                    },

                    Number, 'value',

                    Number, function getValue() {
                        return this.value;
                    }
                ]]);

            var BaseClass;
            assertNoException(function () {
                BaseClass = ria.__SYNTAX.buildClass('BaseClass', baseClassDef);
            });

            var secondClassDef = ria.__SYNTAX.parseClass([
                'SecondClass', ria.__SYNTAX.EXTENDS(BaseClass), [
                    function $() {}
                ]]);

            var SecondClass;
            assertNoException(function () {
                SecondClass = ria.__SYNTAX.buildClass('SecondClass', secondClassDef);
            });

            var thirdClassDef = ria.__SYNTAX.parseClass([
                'ThirdClass', ria.__SYNTAX.EXTENDS(SecondClass), [
                    function $() {},

                    Number, function getValue() {
                        return this.value;
                    }
                ]]);

            var ThirdClass;
            assertException(function () {
                ThirdClass = ria.__SYNTAX.buildClass('ThirdClass', thirdClassDef);
            });

            var thirdClass2Def = ria.__SYNTAX.parseClass([
                'ThirdClass2', ria.__SYNTAX.EXTENDS(SecondClass), [
                    function $() {},

                    [Number],
                    ria.__SYNTAX.Modifiers.VOID, function setValue(value) {
                        this.value = value;
                    }
                ]]);

            var ThirdClass2;
            assertException(function () {
                ThirdClass2 = ria.__SYNTAX.buildClass('ThirdClass2', thirdClass2Def);
            });

            var thirdClass3Def = ria.__SYNTAX.parseClass([
                'ThirdClass3', ria.__SYNTAX.EXTENDS(SecondClass), [
                    function $() {},

                    [Number],
                    ria.__SYNTAX.Modifiers.OVERRIDE, ria.__SYNTAX.Modifiers.VOID, function setValue(value) {
                        this.value = value;
                    }
                ]]);

            var ThirdClass3;
            assertNoException(function () {
                ThirdClass3 = ria.__SYNTAX.buildClass('ThirdClass3', thirdClass3Def);
            });

            var thirdClass4Def = ria.__SYNTAX.parseClass([
                'ThirdClass4', ria.__SYNTAX.EXTENDS(SecondClass), [
                    function $() {},

                    ria.__SYNTAX.Modifiers.OVERRIDE, Number, function getValue() {
                        return this.value;
                    }
                ]]);

            var ThirdClass4;
            assertNoException(function () {
                ThirdClass4 = ria.__SYNTAX.buildClass('ThirdClass4', thirdClass4Def);
            });

            var thirdClass5Def = ria.__SYNTAX.parseClass([
                'ThirdClass5', ria.__SYNTAX.EXTENDS(SecondClass), [
                    function $() {
                        this.value2 = null;
                    },

                    ria.__SYNTAX.Modifiers.OVERRIDE, Number, function getValue2() {
                        return this.value2;
                    }
                ]]);

            var ThirdClass5;
            assertException(function () {
                ThirdClass5 = ria.__SYNTAX.buildClass('ThirdClass5', thirdClass5Def);
            });
        },

        testPropertyFlags_finalGettersSetters: function () {
            var baseClassDef = ria.__SYNTAX.parseClass([
                'BaseClass', [
                    function $() {
                        this.value = null;
                        this.value2 = null;
                    },

                    ria.__SYNTAX.Modifiers.FINAL, Number, 'value',

                    ria.__SYNTAX.Modifiers.FINAL, Number, function getValue() {
                        return this.value;
                    },

                    Number, 'value2',

                    Number, function getValue2() {
                        return this.value2;
                    }
                ]]);

            var BaseClass;
            assertNoException(function () {
                BaseClass = ria.__SYNTAX.buildClass('BaseClass', baseClassDef);
            });

            var secondClassDef = ria.__SYNTAX.parseClass([
                'SecondClass', ria.__SYNTAX.EXTENDS(BaseClass), [
                    function $() {}
                ]]);

            var SecondClass;
            assertNoException(function () {
                SecondClass = ria.__SYNTAX.buildClass('SecondClass', secondClassDef);
            });

            var secondClass2Def = ria.__SYNTAX.parseClass([
                'SecondClass2', ria.__SYNTAX.EXTENDS(BaseClass), [
                    function $() {},

                    ria.__SYNTAX.Modifiers.OVERRIDE, Number, function getValue() {
                        return this.value;
                    }
                ]]);

            var SecondClass2;
            assertException(function () {
                SecondClass2 = ria.__SYNTAX.buildClass('SecondClass2', secondClass2Def);
            });

            var thirdClassDef = ria.__SYNTAX.parseClass([
                'ThirdClass', ria.__SYNTAX.EXTENDS(SecondClass), [
                    function $() {},

                    ria.__SYNTAX.Modifiers.OVERRIDE, Number, function getValue() {
                        return this.value;
                    }
                ]]);

            var ThirdClass;
            assertException(function () {
                ThirdClass = ria.__SYNTAX.buildClass('ThirdClass', thirdClassDef);
            });

            var thirdClass2Def = ria.__SYNTAX.parseClass([
                'ThirdClass2', ria.__SYNTAX.EXTENDS(SecondClass), [
                    function $() {},

                    ria.__SYNTAX.Modifiers.FINAL, ria.__SYNTAX.Modifiers.OVERRIDE, Number, function getValue2() {
                        return this.value2;
                    }
                ]]);

            var ThirdClass2;
            assertNoException(function () {
                ThirdClass2 = ria.__SYNTAX.buildClass('ThirdClass2', thirdClass2Def);
            });
        }
    };

})(ria);