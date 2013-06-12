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

            assertEquals(reflectionCls.getName(), 'BugWarrior');
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


            assertEquals(reflectionCls.getBaseClass(), BaseClass);
        }//,
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

        /*testGetAnnotations: function() {

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

            assertNoUndefined(annotations);
            assertEquals(annotations.length, 1);
        }*/
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