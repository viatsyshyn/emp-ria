(function (ria) {

    function ClassDef(def) {
        return ria.__SYNTAX.parseClassDef(new ria.__SYNTAX.Tokenizer([].slice.call(def)));
    }

    function MakeClass(name, def) {
        "use strict";
        ria.__SYNTAX.validateClassDecl(def, ria.__API.Class);
        return ria.__SYNTAX.compileClass(name, def);
    }

    TestCase("ClassTestCase").prototype = {
        testSelf: function () {
            var baseClassDef = ClassDef([
                'BaseClass', [
                    function $() {},

                    [[ria.__SYNTAX.Modifiers.SELF]],
                    Number, function method2(a) {
                        return 3;
                    },

                    ria.__SYNTAX.Modifiers.SELF, function me() {
                        return new BaseClass();
                    },

                    [[ria.__API.ArrayOf(ria.__SYNTAX.Modifiers.SELF)]],
                    ria.__API.ArrayOf(ria.__SYNTAX.Modifiers.SELF), function me1(a) {
                        return new BaseClass();
                    },

                    [[ria.__SYNTAX.Modifiers.SELF]],
                    ria.__SYNTAX.Modifiers.SELF, function me2(a) {
                        return new BaseClass();
                    }
                ]]);


            //assertNoException(function () {
                ria.__SYNTAX.validateClassDecl(baseClassDef, ria.__API.Class);
            //});

            var BaseClass = ria.__SYNTAX.compileClass('BaseClass', baseClassDef);

            assertEquals(BaseClass, BaseClass.__META.methods['me'].retType);
            assertInstanceOf(ria.__API.ArrayOfDescriptor, BaseClass.__META.methods['me1'].retType);
            assertEquals(BaseClass, BaseClass.__META.methods['me1'].retType.clazz);
            assertInstanceOf(ria.__API.ArrayOfDescriptor, BaseClass.__META.methods['me1'].argsTypes[0]);
            assertEquals(BaseClass, BaseClass.__META.methods['me1'].argsTypes[0].clazz);
            assertEquals(BaseClass, BaseClass.__META.methods['me2'].retType);
            assertEquals(BaseClass, BaseClass.__META.methods['me2'].argsTypes[0]);
            assertEquals(BaseClass, BaseClass.__META.methods['method2'].argsTypes[0]);
        },

        testExtending: function () {
            var baseClassDef = ClassDef([
                'BaseClass', [
                    function $() {},

                    [[Number]],
                    Number, function method1(a) {
                        return 2 * a;
                    },

                    [[Number]],
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
                BaseClass = MakeClass('BaseClass', baseClassDef);
            });

            var childClassDef = ClassDef([
                ria.__SYNTAX.Modifiers.FINAL, 'MyClass', ria.__SYNTAX.EXTENDS(BaseClass), [
                    function $() {},

                    [[Number]],
                    ria.__SYNTAX.Modifiers.OVERRIDE, Number, function method2(a) {
                        return 3 * a;
                    },

                    ria.__SYNTAX.Modifiers.OVERRIDE, Boolean, function isMyComputerOn() {
                        return true;
                    }
                ]]);

            var ChildClass;
            //assertNoException(function () {
                ChildClass = MakeClass('MyClass', childClassDef);
            //});

            assertTrue(ria.__SYNTAX.isDescendantOf(ChildClass, ria.__API.Class));
            assertTrue(ria.__SYNTAX.isDescendantOf(ChildClass, BaseClass));
            assertTrue(ria.__SYNTAX.isDescendantOf(ChildClass, ChildClass));
        },

        testFinalClassExtending: function () {
            var baseClassDef = ClassDef([
                ria.__SYNTAX.Modifiers.FINAL, 'BaseClass', [
                    function $() {},

                    [[Number]],
                    Number, function method1(a) {
                        return 2 * a;
                    },

                    [[Number]],
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
                BaseClass = MakeClass('BaseClass', baseClassDef);
            });

            var childClassDef = ClassDef([
                ria.__SYNTAX.Modifiers.FINAL, 'MyClass', ria.__SYNTAX.EXTENDS(BaseClass), [
                    function $() {},

                    [[Number]],
                    ria.__SYNTAX.Modifiers.OVERRIDE, Number, function method2(a) {
                        return 3 * a;
                    },

                    ria.__SYNTAX.Modifiers.OVERRIDE, Boolean, function isMyComputerOn() {
                        return true;
                    }
                ]]);

            assertException(function () {
                MakeClass('MyClass', childClassDef);
            });
        },

        testAbstractClassInstantiating: function(){
            var baseClassDef = ClassDef([
                ria.__SYNTAX.Modifiers.ABSTRACT, 'BaseClass', [
                    function $() {},

                    [[Number]],
                    Number, function method1(a) {
                        return 2 * a;
                    }
                ]]);

            var BaseClass;
            assertNoException(function () {
                BaseClass = MakeClass('BaseClass', baseClassDef);
            });

            assertException(function () {
                new BaseClass();
            });

            var baseClass2Def = ClassDef([
                'BaseClass2', [
                    function $() {},

                    [[Number]],
                    Number, function method1(a) {
                        return 2 * a;
                    }
                ]]);

            var BaseClass2;
            assertNoException(function () {
                BaseClass2 = MakeClass('BaseClass2', baseClass2Def);
            });

            assertNoException(function () {
                new BaseClass2();
            });
        },

        testFinalMethodExtending: function () {
            var baseClassDef = ClassDef([
                'BaseClass', [
                    function $() {},

                    [[Number]],
                    Number, function method1(a) {
                        return 2 * a;
                    },

                    [[Number]],
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
                BaseClass = MakeClass('BaseClass', baseClassDef);
            });

            var childClassDef = ClassDef([
                'MyClass', ria.__SYNTAX.EXTENDS(BaseClass), [
                    function $() {},

                    [[Number]],
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
                MakeClass('MyClass', childClassDef);
            });
        },

        testAbstractMethodExtending: function () {
            var baseClassDef = ClassDef([
                'BaseClass', [
                    function $() {},

                    [[Number]],
                    Number, function method1(a) {
                        return 2 * a;
                    },

                    [[Number]],
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
                BaseClass = MakeClass('BaseClass', baseClassDef);
            });

            var childClassDef = ClassDef([
                'MyClass', ria.__SYNTAX.EXTENDS(BaseClass), [
                    function $() {},

                    [[Number]],
                    ria.__SYNTAX.Modifiers.OVERRIDE, Number, function method2(a) {
                        return 3 * a;
                    }
                ]]);

            assertException(function () {
                MakeClass('MyClass', childClassDef);
            });
        },

        testOverrideMethodExtending: function () {
            var baseClassDef = ClassDef([
                'BaseClass', [
                    function $() {},

                    [[Number]],
                    Number, function method1(a) {
                        return 2 * a;
                    },

                    [[Number]],
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
                BaseClass = MakeClass('BaseClass', baseClassDef);
            });

            var childClassDef = ClassDef([
                'MyClass', ria.__SYNTAX.EXTENDS(BaseClass), [
                    function $() {},

                    [[Number]],
                    Number, function method2(a) {
                        return 3 * a;
                    },

                    ria.__SYNTAX.Modifiers.OVERRIDE, Boolean, function isMyComputerOn() {
                        return true;
                    }
                ]]);

            assertException(function () {
                MakeClass('MyClass', childClassDef);
            });

            var childClassDef2 = ClassDef([
                'MyClass2', ria.__SYNTAX.EXTENDS(BaseClass), [
                    function $() {},

                    [[Number]],
                    ria.__SYNTAX.Modifiers.OVERRIDE, Number, function method2(a) {
                        return 3 * a;
                    },

                    Boolean, function isMyComputerOn() {
                        return true;
                    }
                ]]);

            assertException(function () {
                MakeClass('MyClass2', childClassDef2);
            });
        },

        testTwoExtending: function () {
            var baseClassDef = ClassDef([
                'BaseClass', [
                    function $() {},

                    [[Number]],
                    Number, function method1(a) {
                        return 2 * a;
                    },

                    [[Number]],
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
                BaseClass = MakeClass('BaseClass', baseClassDef);
            });

            var firstClassDef = ClassDef([
                'FirstClass', ria.__SYNTAX.EXTENDS(BaseClass), [
                    function $() {},

                    [[Number]],
                    Number, function method3(a) {
                        return 4 * a;
                    },

                    [[Number]],
                    Number, function method4(a) {
                        return 5 * a;
                    },

                    [[Number]],
                    ria.__SYNTAX.Modifiers.OVERRIDE, Number, function method1(a) {
                        return 2 * a;
                    },

                    [[Number]],
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
                FirstClass = MakeClass('FirstClass', firstClassDef);
            });

            var secondClassDef = ClassDef([
                ria.__SYNTAX.Modifiers.ABSTRACT, 'SecondClass', ria.__SYNTAX.EXTENDS(FirstClass), [
                    function $() {},

                    [[Number]],
                    ria.__SYNTAX.Modifiers.OVERRIDE, Number, function method3(a) {
                        return 4 * a;
                    },

                    [[Number]],
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
                MakeClass('SecondClass', secondClassDef);
            });
        },

        testTwoExtendingWithFinal: function () {
            var baseClassDef = ClassDef([
                'BaseClass', [
                    function $() {},

                    [[Number]],
                    Number, function method1(a) {
                        return 2 * a;
                    },

                    [[Number]],
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
                BaseClass = MakeClass('BaseClass', baseClassDef);
            });

            var firstClassDef = ClassDef([
                'FirstClass', ria.__SYNTAX.EXTENDS(BaseClass), [
                    function $() {},

                    [[Number]],
                    Number, function method3(a) {
                        return 4 * a;
                    },

                    [[Number]],
                    Number, function method4(a) {
                        return 5 * a;
                    },

                    [[Number]],
                    ria.__SYNTAX.Modifiers.OVERRIDE, Number, function method1(a) {
                        return 2 * a;
                    },

                    [[Number]],
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
                FirstClass = MakeClass('FirstClass', firstClassDef);
            });

            var secondClassDef = ClassDef([
                'SecondClass', ria.__SYNTAX.EXTENDS(FirstClass), [
                    function $() {},

                    [[Number]],
                    ria.__SYNTAX.Modifiers.OVERRIDE, Number, function method3(a) {
                        return 4 * a;
                    },

                    [[Number]],
                    ria.__SYNTAX.Modifiers.OVERRIDE, Number, function method2(a) {
                        return 3 * a;
                    },

                    [[Number]],
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
                MakeClass('SecondClass', secondClassDef);
            });
        },

        testTwoExtendingWithOverride: function () {
            var baseClassDef = ClassDef([
                'BaseClass', [
                    function $() {},

                    [[Number]],
                    Number, function method1(a) {
                        return 2 * a;
                    },

                    [[Number]],
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
                BaseClass = MakeClass('BaseClass', baseClassDef);
            });

            var firstClassDef = ClassDef([
                'FirstClass', ria.__SYNTAX.EXTENDS(BaseClass), [
                    function $() {},

                    [[Number]],
                    Number, function method3(a) {
                        return 4 * a;
                    },

                    [[Number]],
                    Number, function method4(a) {
                        return 5 * a;
                    },

                    [[Number]],
                    ria.__SYNTAX.Modifiers.OVERRIDE, Number, function method1(a) {
                        return 2 * a;
                    },

                    [[Number]],
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
                FirstClass = MakeClass('FirstClass', firstClassDef);
            });

            var secondClassDef = ClassDef([
                'SecondClass', ria.__SYNTAX.EXTENDS(FirstClass), [
                    function $() {},

                    [[Number]],
                    ria.__SYNTAX.Modifiers.OVERRIDE, Number, function method3(a) {
                        return 4 * a;
                    },

                    [[Number]],
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
                MakeClass('SecondClass', secondClassDef);
            });
        },

        testTwoExtendingWithAbstract: function () {
            var baseClassDef = ClassDef([
                'BaseClass', [
                    function $() {},

                    [[Number]],
                    Number, function method1(a) {
                        return 2 * a;
                    },

                    [[Number]],
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
                BaseClass = MakeClass('BaseClass', baseClassDef);
            });

            var firstClassDef = ClassDef([
                'FirstClass', ria.__SYNTAX.EXTENDS(BaseClass), [
                    function $() {},

                    [[Number]],
                    Number, function method3(a) {
                        return 4 * a;
                    },

                    [[Number]],
                    Number, function method4(a) {
                        return 5 * a;
                    },

                    [[Number]],
                    ria.__SYNTAX.Modifiers.OVERRIDE, Number, function method1(a) {
                        return 2 * a;
                    },

                    [[Number]],
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
                FirstClass = MakeClass('FirstClass', firstClassDef);
            });

            var secondClassDef = ClassDef([
                'SecondClass', ria.__SYNTAX.EXTENDS(FirstClass), [
                    function $() {},

                    [[Number]],
                    ria.__SYNTAX.Modifiers.OVERRIDE, Number, function method3(a) {
                        return 4 * a;
                    },

                    [[Number]],
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
                MakeClass('SecondClass', secondClassDef);
            });

            var thirdClassDef = ClassDef([
                'ThirdClass', ria.__SYNTAX.EXTENDS(FirstClass), [
                    function $() {},

                    [[Number]],
                    ria.__SYNTAX.Modifiers.OVERRIDE, Number, function method3(a) {
                        return 4 * a;
                    },

                    [[Number]],
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
                MakeClass('ThirdClass', thirdClassDef);
            });
        },

        testBASE: function () {
            var baseClassDef = ClassDef([
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
                BaseClass = MakeClass('BaseClass', baseClassDef);
            });

            var secondClassDef = ClassDef([
                'SecondClass', ria.__SYNTAX.EXTENDS(BaseClass), [
                    function $() {
                        BASE(5);
                    },

                    [[Number]],
                    ria.__SYNTAX.Modifiers.OVERRIDE, ria.__SYNTAX.Modifiers.VOID, function method(value) {
                        BASE(value);
                    }
                ]]);

            var SecondClass;
            assertNoException(function () {
                SecondClass = MakeClass('SecondClass', secondClassDef);
            });


            var instance;
            //assertNoException(function () {
                instance = new SecondClass();
            //});

            assertEquals(instance.getValue(), 5);

            assertNoException(function () {
                instance.method(7);
            });

            assertEquals(instance.getValue(), 7);
        },

        testSELF: function () {
            var baseClassDef = ClassDef([
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
                BaseClass = MakeClass('BaseClass', baseClassDef);
            });

            assertNotEquals(BaseClass, SELF);
            var instance = new BaseClass();
            assertNotEquals(BaseClass, SELF);
            instance.method();
            assertNotEquals(BaseClass, SELF);
        },

        testPropertyInheritance: function () {
            var baseClassDef = ClassDef([
                'BaseClass', [
                    Number, 'value',

                    function $() { this.value = null; },

                    ria.__SYNTAX.Modifiers.VOID, function method(value) {
                        this.value = value;
                    }
                ]]);

            var BaseClass;
            assertNoException(function () {
                BaseClass = MakeClass('BaseClass', baseClassDef);
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
            var baseClassDef = ClassDef([
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

                    [[String]],
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
                BaseClass = MakeClass('BaseClass', baseClassDef);
            });

            var secondClassDef = ClassDef([
                'SecondClass', ria.__SYNTAX.EXTENDS(BaseClass), [
                    function $() {},

                    ria.__SYNTAX.Modifiers.OVERRIDE, String, function getAbstractString() {
                        return this.abstractString;
                    },

                    [[String]],
                    ria.__SYNTAX.Modifiers.OVERRIDE, ria.__SYNTAX.Modifiers.VOID, function setAbstractString(string) {
                        this.abstractString = string;
                    }
                ]]);

            var SecondClass;
            assertNoException(function () {
                SecondClass = MakeClass('SecondClass', secondClassDef);
            });
        },

        testPropertyFlags_redefining: function () {
            var baseClassDef = ClassDef([
                'BaseClass', [
                    function $() {},

                    Number, 'value'
                ]]);

            var BaseClass;
            assertNoException(function () {
                BaseClass = MakeClass('BaseClass', baseClassDef);
            });

            var secondClassDef = ClassDef([
                'SecondClass', ria.__SYNTAX.EXTENDS(BaseClass), [
                    function $() {},

                    ria.__SYNTAX.Modifiers.OVERRIDE, Number, 'value'
                ]]);

            var SecondClass;
            assertException(function () {
                SecondClass = MakeClass('SecondClass', secondClassDef);
            });

            var secondClass2Def = ClassDef([
                'SecondClass2', ria.__SYNTAX.EXTENDS(BaseClass), [
                    function $() {},

                    Number, 'value'
                ]]);

            var SecondClass2;
            assertException(function () {
                SecondClass2 = MakeClass('SecondClass2', secondClass2Def);
            });
        },

        testPropertyFlags_differentFlagsToGettersSetters: function () {
            var baseClassDef = ClassDef([
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
                BaseClass = MakeClass('BaseClass', baseClassDef);
            });

            var baseClass2Def = ClassDef([
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
                BaseClass2 = MakeClass('BaseClass2', baseClass2Def);
            });
        },

        testPropertyFlags_abstractGettersSetters: function () {
            var baseClassDef = ClassDef([
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
                BaseClass = MakeClass('BaseClass', baseClassDef);
            });

            var secondClassDef = ClassDef([
                'SecondClass', ria.__SYNTAX.EXTENDS(BaseClass), [
                    function $() {}
                ]]);

            var SecondClass;
            assertException(function () {
                SecondClass = MakeClass('SecondClass', secondClassDef);
            });

            var secondClass2Def = ClassDef([
                'SecondClass2', ria.__SYNTAX.EXTENDS(BaseClass), [
                    function $() {},

                    ria.__SYNTAX.Modifiers.OVERRIDE, String, function getAbstractString() {
                        return this.abstractString + "_";
                    }
                ]]);

            var SecondClass2;
            assertException(function () {
                SecondClass2 = MakeClass('SecondClass2', secondClass2Def);
            });

            var secondClass3Def = ClassDef([
                'SecondClass3', ria.__SYNTAX.EXTENDS(BaseClass), [
                    function $() {},

                    ria.__SYNTAX.Modifiers.OVERRIDE, String, function getAbstractString() {
                        return this.abstractString + "_";
                    },

                    [[String]],
                    ria.__SYNTAX.Modifiers.VOID, function setAbstractString(string) {
                        this.abstractString = string;
                    }
                ]]);

            var SecondClass3;
            assertException(function () {
                SecondClass3 = MakeClass('SecondClass2', secondClass3Def);
            });
        },

        testPropertyFlags_overriddenGettersSetters: function () {
            var baseClassDef = ClassDef([
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
                BaseClass = MakeClass('BaseClass', baseClassDef);
            });

            var secondClassDef = ClassDef([
                'SecondClass', ria.__SYNTAX.EXTENDS(BaseClass), [
                    function $() {}
                ]]);

            var SecondClass;
            assertNoException(function () {
                SecondClass = MakeClass('SecondClass', secondClassDef);
            });

            var thirdClassDef = ClassDef([
                'ThirdClass', ria.__SYNTAX.EXTENDS(SecondClass), [
                    function $() {},

                    Number, function getValue() {
                        return this.value;
                    }
                ]]);

            var ThirdClass;
            assertException(function () {
                ThirdClass = MakeClass('ThirdClass', thirdClassDef);
            });

            var thirdClass2Def = ClassDef([
                'ThirdClass2', ria.__SYNTAX.EXTENDS(SecondClass), [
                    function $() {},

                    [[Number]],
                    ria.__SYNTAX.Modifiers.VOID, function setValue(value) {
                        this.value = value;
                    }
                ]]);

            var ThirdClass2;
            assertException(function () {
                ThirdClass2 = MakeClass('ThirdClass2', thirdClass2Def);
            });

            var thirdClass3Def = ClassDef([
                'ThirdClass3', ria.__SYNTAX.EXTENDS(SecondClass), [
                    function $() {},

                    [[Number]],
                    ria.__SYNTAX.Modifiers.OVERRIDE, ria.__SYNTAX.Modifiers.VOID, function setValue(value) {
                        this.value = value;
                    }
                ]]);

            var ThirdClass3;
            assertNoException(function () {
                ThirdClass3 = MakeClass('ThirdClass3', thirdClass3Def);
            });

            var thirdClass4Def = ClassDef([
                'ThirdClass4', ria.__SYNTAX.EXTENDS(SecondClass), [
                    function $() {},

                    ria.__SYNTAX.Modifiers.OVERRIDE, Number, function getValue() {
                        return this.value;
                    }
                ]]);

            var ThirdClass4;
            assertNoException(function () {
                ThirdClass4 = MakeClass('ThirdClass4', thirdClass4Def);
            });

            var thirdClass5Def = ClassDef([
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
                ThirdClass5 = MakeClass('ThirdClass5', thirdClass5Def);
            });
        },

        testPropertyFlags_finalGettersSetters: function () {
            var baseClassDef = ClassDef([
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
                BaseClass = MakeClass('BaseClass', baseClassDef);
            });

            var secondClassDef = ClassDef([
                'SecondClass', ria.__SYNTAX.EXTENDS(BaseClass), [
                    function $() {}
                ]]);

            var SecondClass;
            assertNoException(function () {
                SecondClass = MakeClass('SecondClass', secondClassDef);
            });

            var secondClass2Def = ClassDef([
                'SecondClass2', ria.__SYNTAX.EXTENDS(BaseClass), [
                    function $() {},

                    ria.__SYNTAX.Modifiers.OVERRIDE, Number, function getValue() {
                        return this.value;
                    }
                ]]);

            var SecondClass2;
            assertException(function () {
                SecondClass2 = MakeClass('SecondClass2', secondClass2Def);
            });

            var thirdClassDef = ClassDef([
                'ThirdClass', ria.__SYNTAX.EXTENDS(SecondClass), [
                    function $() {},

                    ria.__SYNTAX.Modifiers.OVERRIDE, Number, function getValue() {
                        return this.value;
                    }
                ]]);

            var ThirdClass;
            assertException(function () {
                ThirdClass = MakeClass('ThirdClass', thirdClassDef);
            });

            var thirdClass2Def = ClassDef([
                'ThirdClass2', ria.__SYNTAX.EXTENDS(SecondClass), [
                    function $() {},

                    ria.__SYNTAX.Modifiers.FINAL, ria.__SYNTAX.Modifiers.OVERRIDE, Number, function getValue2() {
                        return this.value2;
                    }
                ]]);

            var ThirdClass2;
            assertNoException(function () {
                ThirdClass2 = MakeClass('ThirdClass2', thirdClass2Def);
            });
        },

        testPropertyFlags_overriddenAndFinal: function () {
            var baseClassDef = ClassDef([
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
                BaseClass = MakeClass('BaseClass', baseClassDef);
            });

            var secondClassDef = ClassDef([
                'SecondClass', ria.__SYNTAX.EXTENDS(BaseClass), [
                    function $() {},

                    ria.__SYNTAX.Modifiers.OVERRIDE, ria.__SYNTAX.Modifiers.FINAL, Number, function getValue() {
                        return this.value * 2;
                    }
                ]]);

            var SecondClass;
            assertNoException(function () {
                SecondClass = MakeClass('SecondClass', secondClassDef);
            });

            var thirdClassDef = ClassDef([
                'ThirdClass', ria.__SYNTAX.EXTENDS(SecondClass), [
                    function $() {},

                    ria.__SYNTAX.Modifiers.OVERRIDE, Number, function getValue() {
                        return this.value * 3;
                    }
                ]]);

            var ThirdClass;
            assertException(function () {
                ThirdClass = MakeClass('ThirdClass', thirdClassDef);
            });

            var first = new BaseClass();
            first.setValue(3);

            var second = new SecondClass();
            second.setValue(3);

            assertEquals(3, first.getValue());
            assertEquals(6, second.getValue());
        }
    };

})(ria);