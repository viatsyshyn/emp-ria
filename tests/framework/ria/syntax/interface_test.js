(function (ria) {

    TestCase("InterfaceTestCase").prototype = {
        testSelf: function () {
            //noinspection WithStatementJS
            with (ria.__SYNTAX.Modifiers) {
                var ifcDef = ria.__SYNTAX.parseClassDef(new ria.__SYNTAX.Tokenizer([
                    'MyIfc', [
                        READONLY, SELF, 'myProp',

                        SELF, function method1() {},

                        [[SELF]],
                        VOID, function method2(a) {}
                    ]
                ]));
            }

            assertNoException(function () {
                ria.__SYNTAX.validateInterfaceDecl(ifcDef);
            });

            var MyIfc = ria.__SYNTAX.compileInterface(ifcDef.name, ifcDef);

            assertEquals(MyIfc, MyIfc.__META.methods.method1.retType);
            assertEquals(MyIfc, MyIfc.__META.methods.method2.argsTypes[0]);
            assertEquals(MyIfc, MyIfc.__META.methods.getMyProp.retType);
        },

        testProperties: function () {
            //noinspection WithStatementJS
            with (ria.__SYNTAX.Modifiers) {
                var ifcDef = ria.__SYNTAX.parseClassDef(new ria.__SYNTAX.Tokenizer([
                    'MyIfc', [
                        Number, 'myProp',

                        READONLY, Boolean, 'myFlag'
                    ]
                ]));
            }

            assertNoException(function () {
                ria.__SYNTAX.validateInterfaceDecl(ifcDef);
            });

            var MyIfc = ria.__SYNTAX.compileInterface(ifcDef.name, ifcDef);

            assertNotUndefined(MyIfc.__META.methods.getMyProp);
            assertNotUndefined(MyIfc.__META.methods.setMyProp);

            assertNotUndefined(MyIfc.__META.methods.isMyFlag);
            assertUndefined(MyIfc.__META.methods.setMyFlag);
        },

        testCtor: function() {
            //noinspection WithStatementJS
            with (ria.__SYNTAX.Modifiers) {
                var ifcDef = ria.__SYNTAX.parseClassDef(new ria.__SYNTAX.Tokenizer([
                    'MyIfc', [
                        function $() {}
                    ]
                ]));
            }

            assertException(function () {
                ria.__SYNTAX.validateInterfaceDecl(ifcDef);
            }, 'Error');
        },

        testFlags: function() {
            var ifcDef;
            //noinspection WithStatementJS
            with (ria.__SYNTAX.Modifiers) {
                ifcDef = ria.__SYNTAX.parseClassDef(new ria.__SYNTAX.Tokenizer([
                    ABSTRACT, 'MyIfc', []]));
            }

            assertException(function () {
                ria.__SYNTAX.validateInterfaceDecl(ifcDef);
            }, 'Error');

            //noinspection WithStatementJS
            with (ria.__SYNTAX.Modifiers) {
                ifcDef = ria.__SYNTAX.parseClassDef(new ria.__SYNTAX.Tokenizer([
                    OVERRIDE, 'MyIfc', []]));
            }

            assertException(function () {
                ria.__SYNTAX.validateInterfaceDecl(ifcDef);
            }, 'Error');

            //noinspection WithStatementJS
            with (ria.__SYNTAX.Modifiers) {
                ifcDef = ria.__SYNTAX.parseClassDef(new ria.__SYNTAX.Tokenizer([
                    FINAL, 'MyIfc', []]));
            }

            assertException(function () {
                ria.__SYNTAX.validateInterfaceDecl(ifcDef);
            }, 'Error');

            //noinspection WithStatementJS
            with (ria.__SYNTAX.Modifiers) {
                ifcDef = ria.__SYNTAX.parseClassDef(new ria.__SYNTAX.Tokenizer([
                    READONLY, 'MyIfc', []]));
            }

            assertException(function () {
                ria.__SYNTAX.validateInterfaceDecl(ifcDef);
            }, 'Error');
        }
    };

})(ria);