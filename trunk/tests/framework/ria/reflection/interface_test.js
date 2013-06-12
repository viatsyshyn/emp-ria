(function (ria) {
    "use strict";

    function InterfaceDef(def) {
        return ria.__SYNTAX.parseClassDef(new ria.__SYNTAX.Tokenizer([].slice.call(def)));
    }

    function MakeInterface(name, def) {
        "use strict";
        ria.__SYNTAX.validateInterfaceDecl(def);
        return ria.__SYNTAX.compileInterface(name, def);
    }

    TestCase("ReflectionInterfaceTestCase").prototype = {
        testGetName: function () {
            var baseIfcDef = InterfaceDef([
                'BugWarrior', [
                    ria.__SYNTAX.Modifiers.READONLY, ria.__SYNTAX.Modifiers.SELF, 'myProp',

                    ria.__SYNTAX.Modifiers.SELF, function method1() {},

                    [[ria.__SYNTAX.Modifiers.SELF]],
                    VOID, function method2(a) {}
            ]]);

            var ifc = MakeInterface('BugWarrior', baseIfcDef);
            var reflectionIfc;

            assertNoException(function () {
                reflectionIfc = new ria.reflection.ReflectionInterface(ifc);
            });

            assertEquals(reflectionIfc.getName(), 'BugWarrior');
        },

        testGetMethodNames: function(){
            var baseIfcDef = InterfaceDef([
                'BugWarrior', [
                    ria.__SYNTAX.Modifiers.READONLY, ria.__SYNTAX.Modifiers.SELF, 'myProp',

                    ria.__SYNTAX.Modifiers.SELF, function method1() {},

                    [[ria.__SYNTAX.Modifiers.SELF]],
                    ria.__SYNTAX.Modifiers.VOID, function method2(a) {}
            ]]);

            var ifc = MakeInterface('BugWarrior', baseIfcDef);
            var reflectionIfc;

            assertNoException(function () {
                reflectionIfc = new ria.reflection.ReflectionInterface(ifc);
            });

            var methodNames = reflectionIfc.getMethodsNames();

            assertArray(methodNames);

            assertTrue(methodNames.indexOf('method1') > -1);
            assertTrue(methodNames.indexOf('method2') > -1);
            assertTrue(methodNames.indexOf('getMyProp') > -1);
            assertEquals(methodNames.length, 3);
        },

        testGetMethodReturnType: function(){
            var baseIfcDef = InterfaceDef([
                'BugWarrior', [
                    ria.__SYNTAX.Modifiers.READONLY, ria.__SYNTAX.Modifiers.SELF, 'myProp',

                    ria.__SYNTAX.Modifiers.SELF, function method1() {},

                    [[ria.__SYNTAX.Modifiers.SELF]],
                    ria.__SYNTAX.Modifiers.VOID, function method2(a) {},

                    String, function method3() {}

            ]]);

            var ifc = MakeInterface('BugWarrior', baseIfcDef);
            var reflectionIfc;

            assertNoException(function () {
                reflectionIfc = new ria.reflection.ReflectionInterface(ifc);
            });

            assertEquals(reflectionIfc.getMethodReturnType('method1'), ifc);
            assertUndefined(reflectionIfc.getMethodReturnType('method2'));
            assertEquals(reflectionIfc.getMethodReturnType('method3'), String);
            assertEquals(reflectionIfc.getMethodReturnType('getMyProp'), ifc);
        },

        testGetMethodArguments: function(){
            var baseIfcDef = InterfaceDef([
                'BugWarrior', [
                    ria.__SYNTAX.Modifiers.READONLY, ria.__SYNTAX.Modifiers.SELF, 'myProp',

                    ria.__SYNTAX.Modifiers.SELF, function method1() {},

                    [[ria.__SYNTAX.Modifiers.SELF, String]],
                    ria.__SYNTAX.Modifiers.VOID, function method2(a, b) {},

                    String, function method3() {}

            ]]);

            var ifc = MakeInterface('BugWarrior', baseIfcDef);
            var reflectionIfc;

            assertNoException(function () {
                reflectionIfc = new ria.reflection.ReflectionInterface(ifc);
            });

            var methodArguments = reflectionIfc.getMethodArguments('method1');
            assertArray(methodArguments);
            assertEquals(methodArguments.length, 0);

            methodArguments = reflectionIfc.getMethodArguments('method2');
            assertArray(methodArguments);
            assertEquals(methodArguments.length, 2);
            assertTrue(methodArguments.indexOf('a') > -1);
            assertTrue(methodArguments.indexOf('b') > -1);

            methodArguments = reflectionIfc.getMethodArguments('getMyProp');
            assertArray(methodArguments);
            assertEquals(methodArguments.length, 0);
        },

        testGetMethodArgumentsTypes: function(){
            var baseIfcDef = InterfaceDef([
                'BugWarrior', [
                    ria.__SYNTAX.Modifiers.READONLY, ria.__SYNTAX.Modifiers.SELF, 'myProp',

                    ria.__SYNTAX.Modifiers.SELF, function method1() {},

                    [[ria.__SYNTAX.Modifiers.SELF, String]],
                    ria.__SYNTAX.Modifiers.VOID, function method2(a, b) {},

                    String, function method3() {}

            ]]);

            var ifc = MakeInterface('BugWarrior', baseIfcDef);
            var reflectionIfc;

            assertNoException(function () {
                reflectionIfc = new ria.reflection.ReflectionInterface(ifc);
            });

            var methodArgumentsTypes = reflectionIfc.getMethodArgumentsTypes('method1');
            assertArray(methodArgumentsTypes);
            assertEquals(methodArgumentsTypes.length, 0);

            methodArgumentsTypes = reflectionIfc.getMethodArgumentsTypes('method2');
            assertArray(methodArgumentsTypes);
            assertEquals(methodArgumentsTypes.length, 2);
            assertTrue(methodArgumentsTypes.indexOf(String) > -1);
            assertTrue(methodArgumentsTypes.indexOf(ifc) > -1);

            methodArgumentsTypes = reflectionIfc.getMethodArgumentsTypes('getMyProp');
            assertArray(methodArgumentsTypes);
            assertEquals(methodArgumentsTypes.length, 0);
        },

        testHasMethod: function(){
            var baseIfcDef = InterfaceDef([
                'BugWarrior', [
                    ria.__SYNTAX.Modifiers.READONLY, ria.__SYNTAX.Modifiers.SELF, 'myProp',

                    ria.__SYNTAX.Modifiers.SELF, function method1() {},

                    [[ria.__SYNTAX.Modifiers.SELF, String]],
                    ria.__SYNTAX.Modifiers.VOID, function method2(a, b) {},

                    String, function method3() {}

            ]]);

            var ifc = MakeInterface('BugWarrior', baseIfcDef);
            var reflectionIfc;

            assertNoException(function () {
                reflectionIfc = new ria.reflection.ReflectionInterface(ifc);
            });

            assertTrue(reflectionIfc.hasMethod('method1'));
            assertTrue(reflectionIfc.hasMethod('method2'));
            assertTrue(reflectionIfc.hasMethod('method3'));
            assertTrue(reflectionIfc.hasMethod('getMyProp'));
            assertFalse(reflectionIfc.hasMethod('method4'))
        }
    };

})(ria);