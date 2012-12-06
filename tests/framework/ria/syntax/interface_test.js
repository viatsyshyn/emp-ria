(function (ria) {

    TestCase("InterfaceTestCase").prototype = {
        testSelf: function () {
            //noinspection WithStatementJS
            with (ria.__SYNTAX.Modifiers) {
                var ifcDef = ria.__SYNTAX.parseClass([
                    'MyIfc', [
                        READONLY, SELF, 'myProp',

                        SELF, function method1() {},

                        [SELF],
                        VOID, function method2(a) {}
                    ]
                ]);
            }

            var MyIfc;
            assertNoException(function () {
                MyIfc = ria.__SYNTAX.buildInterface(ifcDef.name, ifcDef);
            });

            assertEquals(MyIfc, MyIfc.__META.methods.method1.retType);
            assertEquals(MyIfc, MyIfc.__META.methods.method2.argsTypes[0]);
            assertEquals(MyIfc, MyIfc.__META.methods.getMyProp.retType);
        },

        testProperties: function () {
            //noinspection WithStatementJS
            with (ria.__SYNTAX.Modifiers) {
                var ifcDef = ria.__SYNTAX.parseClass([
                    'MyIfc', [
                        Number, 'myProp',

                        READONLY, Boolean, 'myFlag'
                    ]
                ]);
            }

            var MyIfc;
            assertNoException(function () {
                MyIfc = ria.__SYNTAX.buildInterface(ifcDef.name, ifcDef);
            });

            assertNotUndefined(MyIfc.__META.methods.getMyProp);
            assertNotUndefined(MyIfc.__META.methods.setMyProp);

            assertNotUndefined(MyIfc.__META.methods.isMyFlag);
            assertUndefined(MyIfc.__META.methods.setMyFlag);
        },

        testCtor: function() {
            //noinspection WithStatementJS
            with (ria.__SYNTAX.Modifiers) {
                var ifcDef = ria.__SYNTAX.parseClass([
                    'MyIfc', [
                        function $() {}
                    ]
                ]);
            }

            //assertException(function () {
                ria.__SYNTAX.buildInterface(ifcDef.name, ifcDef);
            //}, 'Error');
        },

        testFlags: function() {
            var ifcDef;
            //noinspection WithStatementJS
            with (ria.__SYNTAX.Modifiers) {
                ifcDef = ria.__SYNTAX.parseClass([ABSTRACT, 'MyIfc', []]);
            }

            assertException(function () {
                ria.__SYNTAX.buildInterface(ifcDef.name, ifcDef);
            }, 'Error');

            //noinspection WithStatementJS
            with (ria.__SYNTAX.Modifiers) {
                ifcDef = ria.__SYNTAX.parseClass([OVERRIDE, 'MyIfc', []]);
            }

            assertException(function () {
                ria.__SYNTAX.buildInterface(ifcDef.name, ifcDef);
            }, 'Error');

            //noinspection WithStatementJS
            with (ria.__SYNTAX.Modifiers) {
                ifcDef = ria.__SYNTAX.parseClass([FINAL, 'MyIfc', []]);
            }

            assertException(function () {
                ria.__SYNTAX.buildInterface(ifcDef.name, ifcDef);
            }, 'Error');

            //noinspection WithStatementJS
            with (ria.__SYNTAX.Modifiers) {
                ifcDef = ria.__SYNTAX.parseClass([READONLY, 'MyIfc', []]);
            }

            assertException(function () {
                ria.__SYNTAX.buildInterface(ifcDef.name, ifcDef);
            }, 'Error');
        }
    };

})(ria);