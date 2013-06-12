(function (ria) {
    "use strict";

    function ClassDef(def) {
        return ria.__SYNTAX.parseClassDef(new ria.__SYNTAX.Tokenizer([].slice.call(def)));
    }

    function MakeClass(name, def) {
        "use strict";
        ria.__SYNTAX.validateClassDecl(def, ria.__API.Class);
        return ria.__SYNTAX.compileClass(name, def);
    }

    TestCase("ReflectionMethodTestCase").prototype = {
        testGetName: function () {

            var baseClassDef = ClassDef([
                'BugWarrior', [
                    function $() {},

                    [[Number, String]],
                    String, function method1(a, b) {
                        return a + b;
                    },

                    String, function method2() {
                        return "aaa";
                    }
            ]]);

            var cls = MakeClass('BugWarrior', baseClassDef);
            var reflectionMethod, reflectionMethod2;

            assertNoException(function () {
                reflectionMethod = new ria.reflection.ReflectionMethod(cls, 'method1');
            });

            assertNoException(function () {
                reflectionMethod2 = new ria.reflection.ReflectionMethod(cls, 'method2');
            });

            assertEquals('BugWarrior#method1', reflectionMethod.getName());
            assertEquals('method1', reflectionMethod.getShortName());

            assertEquals('BugWarrior#method2', reflectionMethod2.getName());
            assertEquals('method2', reflectionMethod2.getShortName());
        },

        testAnnotationAndArgs: function () {

            var MyAnnotation = ria.__API.annotation('MyAnnotation', [], []);

            var baseClassDef = ClassDef([
                'BugWarrior', [
                    function $() {},

                    [MyAnnotation], [[Number, String]],
                    String, function method1(a, b) {
                        return a + b;
                    },

                    Number, function method2() {
                        return "aaa";
                    }
            ]]);

            var cls = MakeClass('BugWarrior', baseClassDef);
            var reflectionMethod1, reflectionMethod2;

            assertNoException(function () {
                reflectionMethod1 = new ria.reflection.ReflectionMethod(cls, 'method1');
            });

            assertNoException(function () {
                reflectionMethod2 = new ria.reflection.ReflectionMethod(cls, 'method2');
            });

            var annotation1 = reflectionMethod1.getAnnotations();
            var annotation2 = reflectionMethod2.getAnnotations();

            assertArray(annotation1);
            assertEquals(annotation1.length, 1);
            assertEquals(annotation1[0].__META.name, 'MyAnnotation');

            assertArray(annotation2);
            assertEquals(annotation2.length, 0);

            assertEquals(reflectionMethod1.getReturnType(), String);
            assertEquals(reflectionMethod2.getReturnType(), Number);

            var args1 = reflectionMethod1.getArguments();
            var args2 = reflectionMethod2.getArguments();

            assertEquals(args1.length, 2);
            assertEquals(args1[0], 'a');
            assertEquals(args1[1], 'b');

            assertEquals(args2.length, 0);

            var argsTypes1 = reflectionMethod1.getArgumentsTypes();
            var argsTypes2 = reflectionMethod2.getArgumentsTypes();

            assertEquals(argsTypes1.length, 2);
            assertEquals(argsTypes1[0], Number);
            assertEquals(argsTypes1[1], String);

            assertEquals(argsTypes2.length, 0);
        },

        testInvokeOn: function () {

            var baseClassDef = ClassDef([
                'BugWarrior', [
                    function $() {
                        this.prop = 0;
                    },

                    Number, 'prop',

                    [[Number]],
                    ria.__SYNTAX.Modifiers.VOID, function method1(a) {
                        this.prop += a;
                    }
            ]]);

            var baseClassDef2 = ClassDef([
                'BugWarrior2', [
                    function $() {
                        this.prop = 0;
                    },

                    Number, 'prop'
            ]]);

            var cls = new MakeClass('BugWarrior', baseClassDef);
            var cls2 = new MakeClass('BugWarrior', baseClassDef2);
            var reflectionMethod1;

            assertNoException(function () {
                reflectionMethod1 = new ria.reflection.ReflectionMethod(cls, 'method1');
            });

            reflectionMethod1.invokeOn(cls, [5]);

            assertEquals(cls.getProp(), 0);
            assertEquals(cls2.getProp(), 5);
        }
    };

})(ria);