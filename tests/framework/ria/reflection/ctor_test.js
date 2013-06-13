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

    TestCase("ReflectionCtorTestCase").prototype = {
        testCtor: function () {
            var MyAnnotation = ria.__API.annotation('MyAnnotation', [], []);
            var MyAnnotation2 = ria.__API.annotation('MyAnnotation2', [], []);

            var baseClassDef = ClassDef([
                'BugWarrior', [
                    [MyAnnotation], [[Number, String, Number]],
                    function $(a, b, c_) {
                        this.a = a;
                        this.b = b;
                    }
            ]]);

            var cls = MakeClass('BugWarrior', baseClassDef);
            var reflectionCtor;

            assertNoException(function () {
                reflectionCtor = new ria.reflection.ReflectionCtor(cls);
            });

            var annotation1 = reflectionCtor.getAnnotations();

            assertEquals('BugWarrior#ctor', reflectionCtor.getName());

            assertArray(annotation1);
            assertEquals(annotation1.length, 1);
            assertEquals(annotation1[0].__META.name, 'MyAnnotation');

            assertTrue(reflectionCtor.isAnnotatedWith(MyAnnotation));
            assertFalse(reflectionCtor.isAnnotatedWith(MyAnnotation2));

            var args = reflectionCtor.getArguments();
            var types = reflectionCtor.getArgumentsTypes();
            var recArgs = reflectionCtor.getRequiredArguments();

            assertEquals(3, args.length);
            assertEquals(args[0], 'a');
            assertEquals(args[1], 'b');
            assertEquals(args[2], 'c_');

            assertEquals(3, types.length);
            assertEquals(types[0], Number);
            assertEquals(types[1], String);
            assertEquals(types[2], Number);

            assertEquals(2, recArgs.length);
            assertEquals(recArgs[0], 'a');
            assertEquals(recArgs[1], 'b');
        }
    };

})(ria);