(function (ria) {

    TestCase("ClassTestCase").prototype = {
        testExtending: function () {
            var baseClassDef = ria.__SYNTAX.parseClass([
                'BaseClass', [
                    function $() {},

                    [Number],
                    Number, function method1(a) {
                        return 2 * a;
                    },

                    [Number],
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
                BaseClass = ria.__SYNTAX.buildClass('BaseClass', baseClassDef);
            });

            var childClassDef = ria.__SYNTAX.parseClass([
                'MyClass', ria.__SYNTAX.EXTENDS(BaseClass), [
                    function $() {},

                    [Number],
                    ria.__SYNTAX.Modifiers.OVERRIDE, Number, function method2(a) {
                        return 3 * a;
                    },

                    Boolean, function isMyComputerOn() {
                        return true;
                    }
                ]]);

            assertNoException(function () {
                ria.__SYNTAX.buildClass('MyClass', childClassDef);
            });
        }
    };

})(ria);