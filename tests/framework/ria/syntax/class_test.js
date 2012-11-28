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
                    },

                    ria.__SYNTAX.Modifiers.SELF, function me() {
                        return new BaseClass();
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
        },

        testFinalExtending: function () {
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

                    String, function hello() {
                        return 'Hello world';
                    },

                    Boolean, function isMyComputerOn() {
                        return true;
                    }
                ]]);

            assertException(function () {
                ria.__SYNTAX.buildClass('MyClass', childClassDef);
            });
        },

        testAbstractExtending: function () {
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
                    }
                ]]);

            assertException(function () {
                ria.__SYNTAX.buildClass('MyClass', childClassDef);
            });
        },

        testOverrideExtending: function () {
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
                    Number, function method2(a) {
                        return 3 * a;
                    },

                    ria.__SYNTAX.Modifiers.OVERRIDE, Boolean, function isMyComputerOn() {
                        return true;
                    }
                ]]);

            assertException(function () {
                ria.__SYNTAX.buildClass('MyClass', childClassDef);
            });

            var childClassDef2 = ria.__SYNTAX.parseClass([
                'MyClass2', ria.__SYNTAX.EXTENDS(BaseClass), [
                    function $() {},

                    [Number],
                    ria.__SYNTAX.Modifiers.OVERRIDE, Number, function method2(a) {
                        return 3 * a;
                    },

                    Boolean, function isMyComputerOn() {
                        return true;
                    }
                ]]);

            assertException(function () {
                ria.__SYNTAX.buildClass('MyClass2', childClassDef2);
            });
        }
    };

})(ria);