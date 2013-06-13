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

    TestCase("ReflectionPropertyTestCase").prototype = {
        testGetNameAndReadOnly: function () {

            var baseClassDef = ClassDef([
                'BugWarrior', [
                    function $() {},

                    ria.__SYNTAX.Modifiers.READONLY, ria.__SYNTAX.Modifiers.SELF, 'myProp1',

                    String, 'myProp2',

                    String, function method2() {
                        return "aaa";
                    }
            ]]);

            var cls = MakeClass('BugWarrior', baseClassDef);
            var reflectionProperty1, reflectionProperty2;

            assertNoException(function () {
                reflectionProperty1 = new ria.reflection.ReflectionProperty(cls, 'myProp1');
            });

            assertNoException(function () {
                reflectionProperty2 = new ria.reflection.ReflectionProperty(cls, 'myProp2');
            });

            assertEquals('BugWarrior#myProp1', reflectionProperty1.getName());
            assertEquals('myProp1', reflectionProperty1.getShortName());

            assertEquals('BugWarrior#myProp2', reflectionProperty2.getName());
            assertEquals('myProp2', reflectionProperty2.getShortName());

            assertTrue(reflectionProperty1.isReadonly());
            assertFalse(reflectionProperty2.isReadonly());
        },

        testAnnotationAndArgs: function () {

            var MyAnnotation = ria.__API.annotation('MyAnnotation', [], []);
            var MyAnnotation2 = ria.__API.annotation('MyAnnotation2', [], []);

            var baseClassDef = ClassDef([
                'BugWarrior', [
                    function $() {},

                    [MyAnnotation], ria.__SYNTAX.Modifiers.READONLY, ria.__SYNTAX.Modifiers.SELF, 'myProp1',

                    String, 'myProp2',

                    [MyAnnotation2], Number, 'myProp3'
            ]]);

            var cls = MakeClass('BugWarrior', baseClassDef);
            var reflectionProperty1, reflectionProperty2, reflectionProperty3;

            assertNoException(function () {
                reflectionProperty1 = new ria.reflection.ReflectionProperty(cls, 'myProp1');
            });

            assertNoException(function () {
                reflectionProperty2 = new ria.reflection.ReflectionProperty(cls, 'myProp2');
            });

            assertNoException(function () {
                reflectionProperty3 = new ria.reflection.ReflectionProperty(cls, 'myProp3');
            });

            var annotation1 = reflectionProperty1.getAnnotations();
            var annotation2 = reflectionProperty2.getAnnotations();
            var annotation3 = reflectionProperty3.getAnnotations();

            assertArray(annotation1);
            assertEquals(annotation1.length, 1);
            assertEquals(annotation1[0].__META.name, 'MyAnnotation');

            assertArray(annotation2);
            assertEquals(annotation2.length, 0);
            
            assertArray(annotation3);
            assertEquals(annotation3.length, 1);
            assertEquals(annotation3[0].__META.name, 'MyAnnotation2');

            assertTrue(reflectionProperty1.isAnnotatedWith(MyAnnotation));
            assertFalse(reflectionProperty2.isAnnotatedWith(MyAnnotation2));
            assertFalse(reflectionProperty2.isAnnotatedWith(MyAnnotation));
            assertFalse(reflectionProperty3.isAnnotatedWith(MyAnnotation));
            assertTrue(reflectionProperty3.isAnnotatedWith(MyAnnotation2));

            assertEquals(reflectionProperty1.getType(), cls);
            assertEquals(reflectionProperty2.getType(), String);
            assertEquals(reflectionProperty3.getType(), Number);
        },

        testInvokeOn: function () {

            var baseClassDef = ClassDef([
                'BugWarrior', [
                    function $() {
                        this.prop = 0;
                    },

                    Number, 'prop',

                    ria.__SYNTAX.Modifiers.READONLY, String, 'prop2'
            ]]);

            var baseClassDef2 = ClassDef([
                'BugWarrior2', [
                    function $() {
                        this.prop = 0;
                    },

                    Number, 'prop'
            ]]);

            var cls = MakeClass('BugWarrior', baseClassDef);
            var cls2 = MakeClass('BugWarrior2', baseClassDef2);
            var baseClassDef3 = ClassDef([
                'BugWarrior3', ria.__SYNTAX.EXTENDS(cls), []]);
            var cls3 = MakeClass('BugWarrior3', baseClassDef3);
            var reflectionProperty1;

            assertNoException(function () {
                reflectionProperty1 = new ria.reflection.ReflectionProperty(cls, 'prop');
            });

            var inst = new cls();
            var inst2 = new cls2();
            var inst3 = new cls3();

            reflectionProperty1.invokeSetterOn(inst, 5);
            reflectionProperty1.invokeSetterOn(inst3, 3);

            assertException(function(){
                reflectionProperty1.invokeSetterOn(inst2, 5);
            });

            assertEquals(5, reflectionProperty1.invokeGetterOn(inst));
            assertEquals(3, reflectionProperty1.invokeGetterOn(inst3));
        }
    };

})(ria);