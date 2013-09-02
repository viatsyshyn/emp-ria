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

    /**
     * @param [arg*]
     * @returns {Function|ClassDescriptor}
     */
    function CLASS(arg) {
        var def = ria.__SYNTAX.parseClassDef(new ria.__SYNTAX.Tokenizer(ria.__API.clone(arguments)));
        ria.__SYNTAX.precalcClassOptionalsAndBaseRefs(def, ria.__API.Class);
        ria.__SYNTAX.validateClassDecl(def, ria.__API.Class);
        return ria.__SYNTAX.compileClass('test.' + def.name, def);
    }

    /**
     * @param [arg*]
     */
    function CLASS_E(arg) {
        var def = ria.__SYNTAX.parseClassDef(new ria.__SYNTAX.Tokenizer(ria.__API.clone(arguments)));
        ria.__SYNTAX.precalcClassOptionalsAndBaseRefs(def, ria.__API.Class);

        assertException(function () {
            ria.__SYNTAX.validateClassDecl(def, ria.__API.Class);
            ria.__SYNTAX.compileClass('test.' + def.name, def);
        })
    }

    TestCase("ClassTestCase").prototype = {

        /*setUp: function () {
            ria.__SYNTAX.Registry.cleanUp();
            ria.__SYNTAX.registerSymbolsMeta();
        },*/

        tearDown: function () {
            ria.__SYNTAX.Registry.cleanUp();
            ria.__SYNTAX.registerSymbolsMeta();
        },

        testSelf: function () {
            var BaseClass =
                CLASS('BaseClass', [
                    function $() {},

                    [[SELF]],
                    Number, function method2(a) {
                        return 3;
                    },

                    SELF, function me() {
                        return new BaseClass();
                    },

                    [[ArrayOf(SELF)]],
                    ArrayOf(SELF), function me1(a) {
                        return new BaseClass();
                    },

                    [[SELF]],
                    SELF, function me2(a) {
                        return new BaseClass();
                    }
                ]);

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
            var BaseClass = CLASS(
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

                    FINAL, String, function hello() {
                        return 'Hello';
                    },

                    ABSTRACT, Boolean, function isMyComputerOn() {
                        return false;
                    },

                    SELF, function me() {
                        return new BaseClass();
                    }
                ]);

            var ChildClass = CLASS(
                FINAL, 'ChildClass', EXTENDS(BaseClass), [
                    function $() {},

                    [[Number]],
                    OVERRIDE, Number, function method2(a) {
                        return 3 * a;
                    },

                    OVERRIDE, Boolean, function isMyComputerOn() {
                        return true;
                    }
                ]);

            assertTrue(ria.__SYNTAX.isDescendantOf(ChildClass, ria.__API.Class));
            assertTrue(ria.__SYNTAX.isDescendantOf(ChildClass, BaseClass));
            assertTrue(ria.__SYNTAX.isDescendantOf(ChildClass, ChildClass));
        },

        testFinalClassExtending: function () {
            var BaseClass = CLASS(
                FINAL, 'BaseClass', [
                    function $() {},

                    [[Number]],
                    Number, function method1(a) {
                        return 2 * a;
                    },

                    [[Number]],
                    Number, function method2(a) {
                        return 3 * a;
                    },

                    FINAL, String, function hello() {
                        return 'Hello';
                    },

                    ABSTRACT, Boolean, function isMyComputerOn() {
                        return false;
                    },

                    SELF, function me() {
                        return new BaseClass();
                    }
                ]);

            CLASS_E(
                FINAL, 'MyClass', EXTENDS(BaseClass), [
                    function $() {},

                    [[Number]],
                    OVERRIDE, Number, function method2(a) {
                        return 3 * a;
                    },

                    OVERRIDE, Boolean, function isMyComputerOn() {
                        return true;
                    }
                ]);
        },

        testAbstractClassInstantiating: function(){
            var BaseClass = CLASS(
                ABSTRACT, 'BaseClass', [
                    function $() {},

                    [[Number]],
                    Number, function method1(a) {
                        return 2 * a;
                    }
                ]);

            var BaseClass2 = CLASS(
                'BaseClass2', [
                    function $() {},

                    [[Number]],
                    Number, function method1(a) {
                        return 2 * a;
                    }
                ]);

            assertException(function () { new BaseClass(); });
            assertNoException(function () { new BaseClass2(); });
        },

        testFinalMethodExtending: function () {
            var BaseClass = CLASS(
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

                    FINAL, String, function hello() {
                        return 'Hello';
                    },

                    ABSTRACT, Boolean, function isMyComputerOn() {
                        return false;
                    }
                ]);

            CLASS_E(
                'MyClass', EXTENDS(BaseClass), [
                    function $() {},

                    [[Number]],
                    OVERRIDE, Number, function method2(a) {
                        return 3 * a;
                    },

                    String, function hello() {
                        return 'Hello world';
                    },

                    Boolean, function isMyComputerOn() {
                        return true;
                    }
                ]);
        },

        testAbstractMethodExtending: function () {
            var BaseClass = CLASS(
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

                    FINAL, String, function hello() {
                        return 'Hello';
                    },

                    ABSTRACT, Boolean, function isMyComputerOn() {
                        return false;
                    }
                ]);

            CLASS_E(
                'MyClass', EXTENDS(BaseClass), [
                    function $() {},

                    [[Number]],
                    OVERRIDE, Number, function method2(a) {
                        return 3 * a;
                    }
                ]);
        },

        testOverrideMethodExtending: function () {
            var BaseClass = CLASS(
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

                    FINAL, String, function hello() {
                        return 'Hello';
                    },

                    ABSTRACT, Boolean, function isMyComputerOn() {
                        return false;
                    }
                ]);

            CLASS_E(
                'MyClass', EXTENDS(BaseClass), [
                    function $() {},

                    [[Number]],
                    Number, function method2(a) {
                        return 3 * a;
                    },

                    OVERRIDE, Boolean, function isMyComputerOn() {
                        return true;
                    }
                ]);

            CLASS_E(
                'MyClass2', EXTENDS(BaseClass), [
                function $() {},

                [[Number]],
                OVERRIDE, Number, function method2(a) {
                    return 3 * a;
                },

                Boolean, function isMyComputerOn() {
                    return true;
                }
            ]);
        },

        testTwoExtending: function () {
            var BaseClass = CLASS(
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

                    FINAL, String, function hello() {
                        return 'Hello';
                    },

                    ABSTRACT, Boolean, function isMyComputerOn() {
                        return false;
                    },

                    SELF, function me() {
                        return new BaseClass();
                    }
                ]);

            var FirstClass = CLASS(
                'FirstClass', EXTENDS(BaseClass), [
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
                    OVERRIDE, Number, function method1(a) {
                        return 2 * a;
                    },

                    [[Number]],
                    OVERRIDE, Number, function method2(a) {
                        return 3 * a;
                    },

                    OVERRIDE, Boolean, function isMyComputerOn() {
                        return true;
                    },

                    ABSTRACT, Boolean, function isItToday() {
                        return false;
                    }
                ]);

            var SecondClass = CLASS(
                ABSTRACT, 'SecondClass', EXTENDS(FirstClass), [
                    function $() {},

                    [[Number]],
                    OVERRIDE, Number, function method3(a) {
                        return 4 * a;
                    },

                    [[Number]],
                    OVERRIDE, Number, function method2(a) {
                        return 3 * a;
                    },

                    OVERRIDE, FINAL, Boolean, function isMyComputerOn() {
                        return true;
                    },

                    OVERRIDE, Boolean, function isItToday() {
                        return false;
                    }
                ]);
        },

        testTwoExtendingWithFinal: function () {
            var BaseClass = CLASS(
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

                    FINAL, String, function hello() {
                        return 'Hello';
                    },

                    ABSTRACT, Boolean, function isMyComputerOn() {
                        return false;
                    },

                    SELF, function me() {
                        return new BaseClass();
                    }
                ]);

            var FirstClass = CLASS(
                'FirstClass', EXTENDS(BaseClass), [
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
                    OVERRIDE, Number, function method1(a) {
                        return 2 * a;
                    },

                    [[Number]],
                    OVERRIDE, Number, function method2(a) {
                        return 3 * a;
                    },

                    OVERRIDE, Boolean, function isMyComputerOn() {
                        return true;
                    },

                    ABSTRACT, Boolean, function isItToday() {
                        return false;
                    }
                ]);

            CLASS_E(
                'SecondClass', EXTENDS(FirstClass), [
                    function $() {},

                    [[Number]],
                    OVERRIDE, Number, function method3(a) {
                        return 4 * a;
                    },

                    [[Number]],
                    OVERRIDE, Number, function method2(a) {
                        return 3 * a;
                    },

                    [[Number]],
                    OVERRIDE, String, function hello() {
                        return 'Hello';
                    },

                    OVERRIDE, FINAL, Boolean, function isMyComputerOn() {
                        return true;
                    },

                    OVERRIDE, Boolean, function isItToday() {
                        return false;
                    }
                ]);
        },

        testTwoExtendingWithOverride: function () {
            var BaseClass = CLASS(
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

                    FINAL, String, function hello() {
                        return 'Hello';
                    },

                    ABSTRACT, Boolean, function isMyComputerOn() {
                        return false;
                    },

                    SELF, function me() {
                        return new BaseClass();
                    }
                ]);

            var FirstClass = CLASS(
                'FirstClass', EXTENDS(BaseClass), [
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
                    OVERRIDE, Number, function method1(a) {
                        return 2 * a;
                    },

                    [[Number]],
                    OVERRIDE, Number, function method2(a) {
                        return 3 * a;
                    },

                    OVERRIDE, Boolean, function isMyComputerOn() {
                        return true;
                    },

                    ABSTRACT, Boolean, function isItToday() {
                        return false;
                    }
                ]);

            CLASS_E(
                'SecondClass', EXTENDS(FirstClass), [
                    function $() {},

                    [[Number]],
                    OVERRIDE, Number, function method3(a) {
                        return 4 * a;
                    },

                    [[Number]],
                    Number, function method2(a) {
                        return 3 * a;
                    },

                    OVERRIDE, FINAL, Boolean, function isMyComputerOn() {
                        return true;
                    },

                    OVERRIDE, Boolean, function isItToday() {
                        return false;
                    }
                ]);
        },

        testTwoExtendingWithAbstract: function () {
            var BaseClass = CLASS(
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

                    FINAL, String, function hello() {
                        return 'Hello';
                    },

                    ABSTRACT, Boolean, function isMyComputerOn() {
                        return false;
                    },

                    SELF, function me() {
                        return new BaseClass();
                    }
                ]);

            var FirstClass = CLASS(
                'FirstClass', EXTENDS(BaseClass), [
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
                    OVERRIDE, Number, function method1(a) {
                        return 2 * a;
                    },

                    [[Number]],
                    OVERRIDE, Number, function method2(a) {
                        return 3 * a;
                    },

                    OVERRIDE, Boolean, function isMyComputerOn() {
                        return true;
                    },

                    ABSTRACT, Boolean, function isItToday() {
                        return false;
                    }
                ]);

            CLASS_E(
                'SecondClass', EXTENDS(FirstClass), [
                    function $() {},

                    [[Number]],
                    OVERRIDE, Number, function method3(a) {
                        return 4 * a;
                    },

                    [[Number]],
                    OVERRIDE, ABSTRACT, Number, function method2(a) {
                        return 3 * a;
                    },

                    OVERRIDE, FINAL, Boolean, function isMyComputerOn() {
                        return true;
                    },

                    OVERRIDE, Boolean, function isItToday() {
                        return false;
                    }
                ]);

            CLASS_E(
                'ThirdClass', EXTENDS(FirstClass), [
                    function $() {},

                    [[Number]],
                    OVERRIDE, Number, function method3(a) {
                        return 4 * a;
                    },

                    [[Number]],
                    ABSTRACT, Number, function method2(a) {
                        return 3 * a;
                    },

                    OVERRIDE, FINAL, Boolean, function isMyComputerOn() {
                        return true;
                    },

                    OVERRIDE, Boolean, function isItToday() {
                        return false;
                    }
                ]);
        },

        testBASE: function () {
            var BaseClass = CLASS(
                'BaseClass', [
                    READONLY, Number, 'value',

                    function $(value) {
                        this.value = value;
                    },

                    VOID, function method(value) {
                        this.value = value;
                    }
                ]);

            var SecondClass = CLASS(
                'SecondClass', EXTENDS(BaseClass), [
                    function $() {
                        BASE(5);
                    },

                    [[Number]],
                    OVERRIDE, VOID, function method(value) {
                        BASE(value);
                    }
                ]);


            var instance = new SecondClass();

            assertEquals(instance.getValue(), 5);

            assertNoException(function () { instance.method(7); });

            assertEquals(instance.getValue(), 7);
        },

        testSELF: function () {
            var BaseClass = CLASS(
                'BaseClass', [
                    Number, 'value',

                    function $() {
                        assertEquals(BaseClass, window.SELF);
                    },

                    VOID, function method() {
                        assertEquals(BaseClass, window.SELF);
                    }
                ]);

            assertNotEquals(BaseClass, SELF);

            var instance = new BaseClass();

            assertNotEquals(BaseClass, SELF);

            instance.method();

            assertNotEquals(BaseClass, SELF);
        },

        testPropertyInheritance: function () {
            var BaseClass = CLASS(
                'BaseClass', [
                    Number, 'value',

                    function $() { this.value = null; },

                    VOID, function method(value) {
                        this.value = value;
                    }
                ]);

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
            assertNoException(function (){ instance.setValue(6); });
            assertUndefined(instance.value);

            assertEquals(6, instance.getValue());
        },

        testPropertyFlags: function () {
            var BaseClass = CLASS(
                'BaseClass', [
                    function $() {
                        this.abstractString = null;
                        this.value = null;
                        this.selfValue = null;
                    },

                    ABSTRACT, String, 'abstractString',

                    ABSTRACT, String, function getAbstractString() {
                        return this.abstractString;
                    },

                    [[String]],
                    ABSTRACT, VOID, function setAbstractString(string) {
                        this.abstractString = string;
                    },

                    FINAL, Number, 'value',

                    FINAL, Number, function getValue() {
                        return this.value;
                    },

                    FINAL, Number, 'value2'
                ]);

            var SecondClass = CLASS(
                'SecondClass', EXTENDS(BaseClass), [
                    function $() {},

                    OVERRIDE, String, function getAbstractString() {
                        return this.abstractString;
                    },

                    [[String]],
                    OVERRIDE, VOID, function setAbstractString(string) {
                        this.abstractString = string;
                    }
                ]);
        },

        testPropertyFlags_redefining: function () {
            var BaseClass = CLASS(
                'BaseClass', [
                    function $() {},

                    Number, 'value'
                ]);

            CLASS_E(
                'SecondClass', EXTENDS(BaseClass), [
                    function $() {},

                    OVERRIDE, Number, 'value'
                ]);

            CLASS_E(
                'SecondClass2', EXTENDS(BaseClass), [
                    function $() {},

                    Number, 'value'
                ]);
        },

        testPropertyFlags_differentFlagsToGettersSetters: function () {
            var BaseClass = CLASS(
                'BaseClass', [
                    function $() {
                        this.value = null;
                    },

                    FINAL, Number, 'value',

                    FINAL, Number, function getValue() {
                        return this.value;
                    }
                ]);

            CLASS_E(
                'BaseClass2', [
                    function $() {
                        this.value = null;
                    },

                    FINAL, Number, 'value',

                    ABSTRACT, Number, function getValue() {
                        return this.value;
                    }
                ]);
        },

        testPropertyFlags_abstractGettersSetters: function () {
            var BaseClass = CLASS(
                'BaseClass', [
                    function $() {
                        this.abstractString = null;
                        this.value = null;
                        this.selfValue = null;
                    },

                    ABSTRACT, String, 'abstractString'
                ]);

            CLASS_E(
                'SecondClass', EXTENDS(BaseClass), [
                    function $() {}
                ]);

            CLASS_E(
                'SecondClass2', EXTENDS(BaseClass), [
                    function $() {},

                    OVERRIDE, String, function getAbstractString() {
                        return this.abstractString + "_";
                    }
                ]);

            CLASS_E(
                'SecondClass3', EXTENDS(BaseClass), [
                    function $() {},

                    OVERRIDE, String, function getAbstractString() {
                        return this.abstractString + "_";
                    },

                    [[String]],
                    VOID, function setAbstractString(string) {
                        this.abstractString = string;
                    }
                ]);
        },

        testPropertyFlags_overriddenGettersSetters: function () {
            var BaseClass = CLASS(
                'BaseClass', [
                    function $() {
                        this.value = null;
                    },

                    Number, 'value',

                    Number, function getValue() {
                        return this.value;
                    }
                ]);

            var SecondClass = CLASS(
                'SecondClass', EXTENDS(BaseClass), [
                    function $() {}
                ]);

            CLASS_E(
                'ThirdClass', EXTENDS(SecondClass), [
                    function $() {},

                    Number, function getValue() {
                        return this.value;
                    }
                ]);

            CLASS_E(
                'ThirdClass2', EXTENDS(SecondClass), [
                    function $() {},

                    [[Number]],
                    VOID, function setValue(value) {
                        this.value = value;
                    }
                ]);

            var ThirdClass3 = CLASS(
                'ThirdClass3', EXTENDS(SecondClass), [
                    function $() {},

                    [[Number]],
                    OVERRIDE, VOID, function setValue(value) {
                        this.value = value;
                    }
                ]);


            var ThirdClass4 = CLASS(
                'ThirdClass4', EXTENDS(SecondClass), [
                    function $() {},

                    OVERRIDE, Number, function getValue() {
                        return this.value;
                    }
                ]);

            CLASS_E(
                'ThirdClass5', EXTENDS(SecondClass), [
                    function $() {
                        this.value2 = null;
                    },

                    OVERRIDE, Number, function getValue2() {
                        return this.value2;
                    }
                ]);
        },

        testPropertyFlags_finalGettersSetters: function () {
            var BaseClass = CLASS(
                'BaseClass', [
                    function $() {
                        this.value = null;
                        this.value2 = null;
                    },

                    FINAL, Number, 'value',

                    FINAL, Number, function getValue() {
                        return this.value;
                    },

                    Number, 'value2',

                    Number, function getValue2() {
                        return this.value2;
                    }
                ]);

            var SecondClass = CLASS(
                'SecondClass', EXTENDS(BaseClass), [
                    function $() {}
                ]);

            CLASS_E(
                'SecondClass2', EXTENDS(BaseClass), [
                    function $() {},

                    OVERRIDE, Number, function getValue() {
                        return this.value;
                    }
                ]);

            CLASS_E(
                'ThirdClass', EXTENDS(SecondClass), [
                    function $() {},

                    OVERRIDE, Number, function getValue() {
                        return this.value;
                    }
                ]);

            var ThirdClass2 = CLASS(
                'ThirdClass2', EXTENDS(SecondClass), [
                    function $() {},

                    FINAL, OVERRIDE, Number, function getValue2() {
                        return this.value2;
                    }
                ]);
        },

        testPropertyFlags_overriddenAndFinal: function () {
            var BaseClass = CLASS(
                'BaseClass', [
                    function $() {
                        this.value = null;
                    },

                    Number, 'value',

                    Number, function getValue() {
                        return this.value;
                    }
                ]);

            var SecondClass = CLASS(
                'SecondClass', EXTENDS(BaseClass), [
                    function $() {},

                    OVERRIDE, FINAL, Number, function getValue() {
                        return this.value * 2;
                    }
                ]);

            CLASS_E(
                'ThirdClass', EXTENDS(SecondClass), [
                    function $() {},

                    OVERRIDE, Number, function getValue() {
                        return this.value * 3;
                    }
                ]);

            var first = new BaseClass();
            first.setValue(3);

            var second = new SecondClass();
            second.setValue(3);

            assertEquals(3, first.getValue());
            assertEquals(6, second.getValue());
        },

        test$$: function () {
            var BaseClass = CLASS(
                'BaseClass', [
                    function $$(instance, clazz, ctor, args) {
                        //assertNotUndefined(instance);
                        assertFunction(clazz);
                        assertEquals(BaseClass, clazz);
                        assertFunction(ctor);
                        assertEquals(BaseClass.prototype.$, ctor);
                        assertEquals([1,2,'3'], args);
                        assertEquals(BaseClass, window.SELF);

                        return ria.__API.init(instance, clazz, ctor, ria.__API.clone(args).map(Number));
                    },

                    [[Number, Number, Number]],
                    function $(a,b,c) {
                        this.value = a + b + c;
                    },

                    Number, 'value'
                ]);

            var instance;
            instance = BaseClass(1,2,'3');

            assertEquals(6, instance.getValue());

            instance = new BaseClass(1,2,'3');

            assertEquals(6, instance.getValue());
        }
    };

})(ria);