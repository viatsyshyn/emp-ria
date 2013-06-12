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

    TestCase("RelectionTestCase").prototype = {
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
        }
    };

})(ria);