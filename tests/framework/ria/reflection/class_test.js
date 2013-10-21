(function (ria) {
    "use strict";

    function ClassDef(def) {
        return ria.__SYNTAX.parseClassDef(new ria.__SYNTAX.Tokenizer([].slice.call(def)));
    }

    function MakeClass(name, def) {
        "use strict";
        ria.__SYNTAX.precalcClassOptionalsAndBaseRefs(def, ria.__API.Class);
        ria.__SYNTAX.validateClassDecl(def, 'Class');
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

    TestCase("ReflectionClassTestCase").prototype = {
        testGetName: function () {
            var BugWarrior = CLASS('BugWarrior', []);
            var reflectionCls = new ria.reflection.ReflectionClass(BugWarrior);
            assertEquals('window.BugWarrior', reflectionCls.getName());
        },
        testGetShortName: function() {
            var BugWarrior = CLASS('BugWarrior', []);
            var reflectionCls = new ria.reflection.ReflectionClass(BugWarrior);
            assertEquals('BugWarrior', reflectionCls.getShortName());
        },
        testGetBaseClass: function(){
            var BugWarrior = CLASS(
                'BugWarrior', []);

            var BugWarriorTaras = CLASS(
                'BugWarriorTaras', EXTENDS(BugWarrior), []);

            var reflectionCls = new ria.reflection.ReflectionClass(BugWarriorTaras);

            assertEquals(BugWarrior, reflectionCls.getBaseClass());
        },
        testGetBaseClassReflector: function(){
            var BugWarrior = CLASS(
                'BugWarrior', []);

            var BugWarriorTaras = CLASS(
                'BugWarriorTaras', EXTENDS(BugWarrior), []);

            var reflectionCls = new ria.reflection.ReflectionClass(BugWarriorTaras);

            assertEquals(reflectionCls.getBaseClassReflector().getClazz(), reflectionCls.getBaseClass());
        },
        testGetInterfaces: function(){
            var TestInterface =
                INTERFACE('TestInterface', [
                    READONLY, Number, 'Propertya',
                    VOID, function method1() {}
                ]);

            var Implementor = CLASS(
                'Implementor', IMPLEMENTS(TestInterface), [
                    READONLY, Number, 'Propertya',
                    Number, function getPropertya() { return 5; },
                    [[String]],
                    VOID, function method1() {}
                ]);


            var reflectionCls = new ria.reflection.ReflectionClass(Implementor);

            var interfaces = reflectionCls.getInterfaces();

            assertNotUndefined(interfaces);
            assertEquals(1, interfaces.length);
            assertEquals(TestInterface, interfaces[0]);
        },
        testGetInterfacesReflector: function(){
            var TestInterface =
                INTERFACE('TestInterface', [
                    READONLY, Number, 'Propertya',
                    VOID, function method1() {}
                ]);

            var Implementor = CLASS(
                'Implementor', IMPLEMENTS(TestInterface), [
                    READONLY, Number, 'Propertya',
                    Number, function getPropertya() { return 5; },
                    [[String]],
                    VOID, function method1() {}
                ]);

            var reflectionCls = new ria.reflection.ReflectionClass(Implementor);

            var reflectors = reflectionCls.getInterfacesReflector();
            assertNotUndefined(reflectors);
            assertEquals(1, reflectors.length);
            assertInstanceOf(ria.reflection.ReflectionInterface, reflectors[0]);
            assertEquals(TestInterface, reflectors[0].getIfc());
        },
        testGetAnnotations: function() {

            var WarriorAnnotation = ANNOTATION(
                [[Number, Boolean]],
                function Annotation(param, optional_){});

            var BugWarrior = CLASS(
                [WarriorAnnotation(42)],
                'BugWarrior', [
                    Number, function methodThatReturnsNumber(){ return 4; /*choosed by fair dice roll*/ },
                    String, function methodThatReturnsString() { return 'example'; }
                ]);

            var reflectionCls = new ria.reflection.ReflectionClass(BugWarrior);

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

                ]]);

            var BaseClass;
            assertNoException(function () {
                BaseClass = MakeClass('BugWarrior', baseClassDef);
            });

            var notBaseClassDef = ClassDef([
                'No', [

                ]]);

            var NotBaseClass;
            assertNoException(function () {
                NotBaseClass = MakeClass('No', notBaseClassDef);
            });

            var secondClassDef = ClassDef([
                'BugWarriorT', ria.__SYNTAX.EXTENDS(BaseClass), [

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

                ]]);

            var A;
            assertNoException(function () {
                A = MakeClass('A', aDef);
            });

            var bDef = ClassDef([
                'B', ria.__SYNTAX.EXTENDS(A), [

                ]]);

            var B;
            assertNoException(function () {
                B = MakeClass('B', bDef);
            });


            var cDef = ClassDef([
                'C', ria.__SYNTAX.EXTENDS(B), [

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
        },
        testFindAnnotation: function(){
            var WarriorAnnotation = ria.__API.annotation('Annotation', [Number, Boolean], ['param', 'optional_']);

            var WarriorAnnotation2 = ria.__API.annotation('Annotation2', [Number, Boolean], ['param2', 'optional_']);

            var baseClassDef = ClassDef([
                [WarriorAnnotation(42)],
                'BugWarrior', [

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

            var annotation;
            assertNoException(function () {
                annotation = reflectionCls.findAnnotation(WarriorAnnotation);
            });

            assertNotUndefined(annotation);
            assertEquals(1, annotation.length);
            assertEquals(42, annotation[0].param);
            assertUndefined(annotation[0].optional_);

            var annotation2 = reflectionCls.findAnnotation(WarriorAnnotation2);
            assertEquals(0, annotation2.length);
        },
        testGetMethodsNames: function(){
            var baseClassDef = ClassDef([
                'BugWarrior', [

                    [[Number]],
                    Number, function method1(){
                        return 4; //choosed by fair dice roll}
                    },
                    [[String]],
                    String, function method2() {
                        return 'example';
                    }
                ]]);

            var cls = MakeClass('BugWarrior', baseClassDef);
            var reflectionCls;

            assertNoException(function () {
                reflectionCls = new ria.reflection.ReflectionClass(cls);
            });

            var methodNames = reflectionCls.getMethodsNames();
            assertNotUndefined(methodNames);
            assertEquals(5, methodNames.length);
            assertEquals('method1', methodNames[3]);
            assertEquals('method2', methodNames[4]);

        },
        testGetMethodsReflector: function(){
            var baseClassDef = ClassDef([
                'BugWarrior', [

                    [[Number]],
                    Number, function method1(){
                        return 4; //choosed by fair dice roll}
                    },
                    [[String]],
                    String, function method12() {
                        return 'example';
                    }
                ]]);

            var cls = MakeClass('BugWarrior', baseClassDef);
            var reflectionCls;

            assertNoException(function () {
                reflectionCls = new ria.reflection.ReflectionClass(cls);
            });

            var methodReflectors = reflectionCls.getMethodsReflector();

            assertNotUndefined(methodReflectors);
            assertEquals(5, methodReflectors.length);
            assertInstanceOf(ria.reflection.ReflectionMethod, methodReflectors[3]);
            assertInstanceOf(ria.reflection.ReflectionMethod, methodReflectors[4]);
            assertSame(Number, methodReflectors[3].getReturnType());
            assertSame(String, methodReflectors[4].getReturnType());
        },
        testGetMethodReflector: function(){
            var baseClassDef = ClassDef([
                'BugWarrior', [

                    [[Number]],
                    Number, function method1(){
                        return 4; //choosed by fair dice roll}
                    },
                    [[String]],
                    String, function method12() {
                        return 'example';
                    }
                ]]);

            var cls = MakeClass('BugWarrior', baseClassDef);
            var reflectionCls;

            assertNoException(function () {
                reflectionCls = new ria.reflection.ReflectionClass(cls);
            });

            var methodReflector = reflectionCls.getMethodReflector('method1');
            assertNotUndefined(methodReflector);
            assertInstanceOf(ria.reflection.ReflectionMethod, methodReflector);
            var retType = methodReflector.getReturnType();
            assertSame(Number, retType);

        },
        testGetPropertyReflector: function(){
            var baseClassDef = ClassDef([
                'Cls', [

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

            var propertyReflector = reflectionCls.getPropertyReflector('Property');
            assertNotUndefined(propertyReflector);
            assertInstanceOf(ria.reflection.ReflectionProperty, propertyReflector);
            assertTrue(propertyReflector.isReadonly());
            assertSame(Number, propertyReflector.getType());

        },
        testGetPropertiesNames: function(){
            var baseClassDef = ClassDef([
                'Cls', [

                    ria.__SYNTAX.Modifiers.READONLY, Number, 'Property1',
                    function getProperty1(){
                        return 42;
                    },
                    Number, 'Property2',
                    function getProperty2(){
                        return 43;
                    }
                ]]);

            var cls = MakeClass('Cls', baseClassDef);
            var reflectionCls;

            assertNoException(function () {
                reflectionCls = new ria.reflection.ReflectionClass(cls);
            });

            var props = reflectionCls.getPropertiesNames();
            assertNotUndefined(props);
            assertEquals(2, props.length);
            assertEquals('Property1', props[0]);
            assertEquals('Property2', props[1]);
        },
        testGetPropertiesReflector: function(){
            var baseClassDef = ClassDef([
                'Cls', [

                    ria.__SYNTAX.Modifiers.READONLY, Number, 'Property1',
                    function getProperty1(){
                        return 42;
                    },
                    Number, 'Property2',
                    function getProperty2(){
                        return 43;
                    }
                ]]);

            var cls = MakeClass('Cls', baseClassDef);
            var reflectionCls;

            assertNoException(function () {
                reflectionCls = new ria.reflection.ReflectionClass(cls);
            });

            var props = reflectionCls.getPropertiesReflector();
            assertNotUndefined(props);
            assertEquals(2, props.length);
            assertInstanceOf(ria.reflection.ReflectionProperty, props[0]);
            assertInstanceOf(ria.reflection.ReflectionProperty, props[1]);
            assertSame(Number, props[0].getType());
            assertSame(Number, props[1].getType());
            assertTrue(props[0].isReadonly());
            assertFalse(props[1].isReadonly());
        },
        testGetChildren: function(){
            var aDef = ClassDef([
                'A', [

                ]]);

            var A;
            assertNoException(function () {
                A = MakeClass('A', aDef);
            });

            var bDef = ClassDef([
                'B', ria.__SYNTAX.EXTENDS(A), [

                ]]);

            var B;
            assertNoException(function () {
                B = MakeClass('B', bDef);
            });


            var cDef = ClassDef([
                'C', ria.__SYNTAX.EXTENDS(B), [

                ]]);

            var C;
            assertNoException(function () {
                C = MakeClass('C', cDef);
            });



            var cRefl;
            assertNoException(function () {
                cRefl = new ria.reflection.ReflectionClass(C);
            });

            var cChildren = cRefl.getChildren();
            assertNotUndefined(cChildren);
            assertEquals(0, cChildren.length);

            var aRefl;
            assertNoException(function () {
                aRefl = new ria.reflection.ReflectionClass(A);
            });

            var aChildren = aRefl.getChildren();
            assertNotUndefined(aChildren);
            assertEquals(1, aChildren.length);
            assertEquals(B, aChildren[0]);
        },
        testGetChildrenReflector: function(){
            var aDef = ClassDef([
                'A', [

                ]]);

            var A;
            assertNoException(function () {
                A = MakeClass('A', aDef);
            });

            var bDef = ClassDef([
                'B', ria.__SYNTAX.EXTENDS(A), [

                ]]);

            var B;
            assertNoException(function () {
                B = MakeClass('B', bDef);
            });


            var aRefl;
            assertNoException(function () {
                aRefl = new ria.reflection.ReflectionClass(A);
            });

            var aChildrenReflectors = aRefl.getChildrenReflector();
            assertNotUndefined(aChildrenReflectors);
            assertEquals(1, aChildrenReflectors.length);
            assertInstanceOf(ria.reflection.ReflectionClass, aChildrenReflectors[0]);
            assertEquals(B, aChildrenReflectors[0].getClazz());
        },
        testGetCtorReflector: function(){
            var baseClassDef = ClassDef([

                'BugWarrior', [

                ]]);

            var cls = MakeClass('BugWarrior', baseClassDef);
            var reflectionCls;

            assertNoException(function () {
                reflectionCls = new ria.reflection.ReflectionClass(cls);
            });


            var ctorReflector = reflectionCls.getCtorReflector();
            assertNotUndefined(ctorReflector);
            assertInstanceOf(ria.reflection.ReflectionCtor, ctorReflector);

        },
        testInstantiate: function(){
            var baseClassDef = ClassDef([

                'BugWarrior', [

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


            assertNotUndefined(reflectionCls);
            var inst = reflectionCls.instantiate();

            assertInstanceOf(cls, inst);
        },
        testInstantiateGenericChild: function(){
            var BaseClass = CLASS(
                GENERIC('T'),
                'BaseClass', []);

            var ChildClass = CLASS(
                'ChildClass', EXTENDS(BaseClass.OF(String)), []);

            var reflectionCls = new ria.reflection.ReflectionClass(ChildClass);

            assertNotUndefined(reflectionCls);
            var inst = reflectionCls.instantiate();

            assertInstanceOf(ChildClass, inst);
        },
        testInstantiateGenericChild2: function(){
            var BaseClass = CLASS(
                GENERIC('T'),
                'BaseClass', []);

            var ChildClass = CLASS(
                'ChildClass', EXTENDS(BaseClass), []);

            var reflectionCls = new ria.reflection.ReflectionClass(ChildClass);

            assertNotUndefined(reflectionCls);
            var inst = reflectionCls.instantiate();

            assertInstanceOf(ChildClass, inst);
        },
        testParentsReflector: function(){
            var aDef = ClassDef([
                'A', [

                ]]);

            var A;
            assertNoException(function () {
                A = MakeClass('A', aDef);
            });

            var bDef = ClassDef([
                'B', ria.__SYNTAX.EXTENDS(A), [

                ]]);

            var B;
            assertNoException(function () {
                B = MakeClass('B', bDef);
            });


            var cDef = ClassDef([
                'C', ria.__SYNTAX.EXTENDS(B), [

                ]]);

            var C;
            assertNoException(function () {
                C = MakeClass('C', cDef);
            });



            var cRefl;
            assertNoException(function () {
                cRefl = new ria.reflection.ReflectionClass(C);
            });

            var cParentsReflectors = cRefl.getParentsReflector();

            assertNotUndefined(cParentsReflectors);

            assertInstanceOf(ria.reflection.ReflectionClass, cParentsReflectors[0]);
            assertInstanceOf(ria.reflection.ReflectionClass, cParentsReflectors[1]);
            assertInstanceOf(ria.reflection.ReflectionClass, cParentsReflectors[2]);
            assertEquals(3, cParentsReflectors.length);
            assertEquals(B, cParentsReflectors[0].getClazz());
            assertEquals(A, cParentsReflectors[1].getClazz());
            assertEquals(ria.__API.Class, cParentsReflectors[2].getClazz());
        }
        /*testIsAbstract: function(){

            var baseClassDef = ClassDef([
                ABSTRACT, 'BugWarrior', [

                ]]);

            var cls = MakeClass('BugWarrior', baseClassDef);
            var reflectionCls;

            assertNoException(function () {
                reflectionCls = new ria.reflection.ReflectionClass(cls);
            });

            assertTrue(reflectionCls.isAbstract(), true);
        }*/

        /*testIsAbstract: function(){

             var baseClassDef = ClassDef([
                 FINAL, 'BugWarrior', [

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