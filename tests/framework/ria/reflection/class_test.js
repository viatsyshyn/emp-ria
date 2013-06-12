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

    function InterfaceDef(def) {
        return ria.__SYNTAX.parseClassDef(new ria.__SYNTAX.Tokenizer([].slice.call(def)));
    }

    function MakeInterface(name, def) {
        "use strict";
        ria.__SYNTAX.validateInterfaceDecl(def);
        return ria.__SYNTAX.compileInterface(name, def);
    }

    TestCase("ReflectionTestCase").prototype = {
        testGetName: function () {

            var baseClassDef = ClassDef([
                'BugWarrior', [
                    function $() {}
            ]]);

            var cls = MakeClass('BugWarrior', baseClassDef);
            var reflectionCls;

            assertNoException(function () {
                reflectionCls = new ria.reflection.ReflectionClass(cls);
            });

            assertEquals('BugWarrior', reflectionCls.getName());
        },
        testGetBaseClass: function(){
            var baseClassDef = ClassDef([
                'BugWarrior', [
                    function $() {}
                ]]);

            var BaseClass;
            assertNoException(function () {
                BaseClass = MakeClass('BugWarrior', baseClassDef);
            });

            var secondClassDef = ClassDef([
                'BugWarriorTaras', ria.__SYNTAX.EXTENDS(BaseClass), [
                    function $() {}
                ]]);

            var SecondClass;
            assertNoException(function () {
                SecondClass = MakeClass('BugWarriorTaras', secondClassDef);
            });

            var reflectionCls;

            assertNoException(function () {
                reflectionCls = new ria.reflection.ReflectionClass(SecondClass);
            });


            assertEquals(BaseClass, reflectionCls.getBaseClass());
        },
        testGetInterfaces: function(){
            var ifcDef =  InterfaceDef([
                'TestInterface', [
                    ria.__SYNTAX.Modifiers.READONLY, Number, 'Propertya',
                    ria.__SYNTAX.Modifiers.VOID, function method1() {}
                ]
            ]);


            var Interface = MakeInterface('TestInterface', ifcDef);

            var clsDef = ClassDef([
                'Implementor', ria.__SYNTAX.IMPLEMENTS(Interface), [
                    function $() {},
                    ria.__SYNTAX.Modifiers.READONLY,  Number, 'Propertya',
                    [[Number]], function getPropertya(){
                        return 5;
                    },
                    [[String]], function method1() {
                        return 'test';
                    }
                ]]);

            var impl;
            assertNoException(function () {
                impl = MakeClass('Implementor', clsDef);
            });

            var reflectionCls;

            assertNoException(function () {
                reflectionCls = new ria.reflection.ReflectionClass(impl);
            });

            var interfaces = reflectionCls.getInterfaces();

            assertNotUndefined(interfaces);
            assertEquals(1, interfaces.length);
            assertEquals(Interface, interfaces[0]);

        },
        testGetAnnotations: function() {

            var WarriorAnnotation = ria.__API.annotation('Annotation', [Number, Boolean], ['param', 'optional_']);

            var baseClassDef = ClassDef([
                [WarriorAnnotation(42)],
                'BugWarrior', [
                    function $() {},
                    [[Number]],
                    Number, function methodThatReturnsNumber(){
                        return 4; //choosed by fair dice roll}
                    },
                    [[String]],
                    String, function methodThatReturnsString() {
                        return 'example';
                    }
                ]]);

            var cls = MakeClass('BugWarrior', baseClassDef);
            var reflectionCls;

            assertNoException(function () {
                reflectionCls = new ria.reflection.ReflectionClass(cls);
            });

            var annotations = reflectionCls.getAnnotations();

            assertNotUndefined(annotations);
            assertEquals(1, annotations.length);
            assertEquals(42, annotations[0].param);
            assertUndefined(annotations[0].optional_);
        },
        testIsAnnotatedWith: function() {

            var WarriorAnnotation = ria.__API.annotation('Annotation', [Number, Boolean], ['param', 'optional_']);
            var WarriorAnnotation2 = ria.__API.annotation('Annotation', [Number, Boolean], ['param', 'optional_']);

            var baseClassDef = ClassDef([
                [WarriorAnnotation(42)],
                'BugWarrior', [
                    function $() {},
                    [[Number]],
                    Number, function methodThatReturnsNumber(){
                        return 4; //choosed by fair dice roll}
                    },
                    [[String]],
                    String, function methodThatReturnsString() {
                        return 'example';
                    }
                ]]);

            var cls = MakeClass('BugWarrior', baseClassDef);
            var reflectionCls;

            assertNoException(function () {
                reflectionCls = new ria.reflection.ReflectionClass(cls);
            });

            var annotations = reflectionCls.getAnnotations();

            assertTrue(reflectionCls.isAnnotatedWith(WarriorAnnotation));
            assertFalse(reflectionCls.isAnnotatedWith(WarriorAnnotation2));
        },
        testHasMethod: function(){
            var baseClassDef = ClassDef([
                'Cls', [
                    function $() {},
                    ria.__SYNTAX.Modifiers.VOID, function test(){}
                ]]);

            var cls = MakeClass('Cls', baseClassDef);
            var reflectionCls;

            assertNoException(function () {
                reflectionCls = new ria.reflection.ReflectionClass(cls);
            });

            assertTrue(reflectionCls.hasMethod('test'));
        },
        testHasProperty: function(){
            var baseClassDef = ClassDef([
                'Cls', [
                    function $() {},
                    ria.__SYNTAX.Modifiers.READONLY, Number, 'Property',
                    function getProperty(){
                        return 42;
                    }
                ]]);

            var cls = MakeClass('Cls', baseClassDef);
            var reflectionCls;

            assertNoException(function () {
                reflectionCls = new ria.reflection.ReflectionClass(cls);
            });

            assertTrue(reflectionCls.hasProperty('Property'));
        },
        testImplementsIfc: function(){

            var ifcDef =  InterfaceDef([
                'TestInterface', [
                    ria.__SYNTAX.Modifiers.READONLY, Number, 'Propertya',
                    ria.__SYNTAX.Modifiers.VOID, function method1() {}
                ]
            ]);

            var ifcDef2 = InterfaceDef([
                'TestInterface2', [
                    ria.__SYNTAX.Modifiers.READONLY, Number, 'Propertya'
                ]
            ]);

            var Interface = MakeInterface('TestInterface', ifcDef);
            var Interface2 = MakeInterface('TestInterface2', ifcDef2);

            var clsDef = ClassDef([
                'Implementor', ria.__SYNTAX.IMPLEMENTS(Interface), [
                    function $() {},
                    ria.__SYNTAX.Modifiers.READONLY,  Number, 'Propertya',
                    [[Number]], function getPropertya(){
                        return 5;
                    },
                    [[String]], function method1() {
                        return 'test';
                    }
                ]]);

            var impl;
            assertNoException(function () {
                impl = MakeClass('Implementor', clsDef);
            });

            var reflectionCls;

            assertNoException(function () {
                reflectionCls = new ria.reflection.ReflectionClass(impl);
            });

            assertTrue(reflectionCls.implementsIfc(Interface));
            assertFalse(reflectionCls.implementsIfc(Interface2));
        },
        testExtendsClass: function(){
            var baseClassDef = ClassDef([
                'BugWarrior', [
                    function $() {}
                ]]);

            var BaseClass;
            assertNoException(function () {
                BaseClass = MakeClass('BugWarrior', baseClassDef);
            });

            var notBaseClassDef = ClassDef([
                'No', [
                    function $() {}
                ]]);

            var NotBaseClass;
            assertNoException(function () {
                NotBaseClass = MakeClass('No', notBaseClassDef);
            });

            var secondClassDef = ClassDef([
                'BugWarriorT', ria.__SYNTAX.EXTENDS(BaseClass), [
                    function $() {}
                ]]);

            var SecondClass;
            assertNoException(function () {
                SecondClass = MakeClass('BugWarriorT', secondClassDef);
            });

            var reflectionCls;

            assertNoException(function () {
                reflectionCls = new ria.reflection.ReflectionClass(SecondClass);
            });


            assertTrue(reflectionCls.extendsClass(BaseClass));
            assertFalse(reflectionCls.extendsClass(NotBaseClass));
        },
        testGetParents: function(){
            var aDef = ClassDef([
                'A', [
                    function $() {}
                ]]);

            var A;
            assertNoException(function () {
                A = MakeClass('A', aDef);
            });

            var bDef = ClassDef([
                'B', ria.__SYNTAX.EXTENDS(A), [
                    function $() {}
                ]]);

            var B;
            assertNoException(function () {
                B = MakeClass('B', bDef);
            });


            var cDef = ClassDef([
                'C', ria.__SYNTAX.EXTENDS(B), [
                    function $() {}
                ]]);

            var C;
            assertNoException(function () {
                C = MakeClass('C', cDef);
            });



            var cRefl;
            assertNoException(function () {
                cRefl = new ria.reflection.ReflectionClass(C);
            });

            var cParents = cRefl.getParents();
            assertNotUndefined(cParents);
            assertEquals(3, cParents.length);
            assertEquals(B, cParents[0]);
            assertEquals(A, cParents[1]);
            assertEquals(ria.__API.Class, cParents[2]);
        }
        /*testIsAbstract: function(){

            var baseClassDef = ClassDef([
                ABSTRACT, 'BugWarrior', [
                    function $() {}
                ]]);

            var cls = MakeClass('BugWarrior', baseClassDef);
            var reflectionCls;

            assertNoException(function () {
                reflectionCls = new ria.reflection.ReflectionClass(cls);
            });

            assertTrue(reflectionCls.isAbstract(), true);
        }*/
        /*testGetBaseClassReflector: function(){
         var baseClassDef = ClassDef([
         'BugWarrior', [
         function $() {}
         ]]);

         var cls = MakeClass('BugWarrior', baseClassDef);
         var reflectionCls;

         assertNoException(function () {
         reflectionCls = new ria.reflection.ReflectionClass(cls);
         });

         assertEquals(reflectionCls.getBaseClassReflector(), cls);
         }*/
        /*testIsAbstract: function(){

             var baseClassDef = ClassDef([
                 FINAL, 'BugWarrior', [
                 function $() {}
             ]]);

             var cls = MakeClass('BugWarrior', baseClassDef);
             var reflectionCls;

             assertNoException(function () {
                reflectionCls = new ria.reflection.ReflectionClass(cls);
             });

             assertTrue(reflectionCls.isFinal(), true);
        }*/
    };

})(ria);