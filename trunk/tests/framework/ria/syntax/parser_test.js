(function (ria) {
    //"use strict";

    TestCase("ParserTestCase").prototype = {

        testParseAnnotations: function () {
            var MyAnnotation = ria.__API.annotation('MyAnnotation', [], []);
            var MyAnnotation2 = ria.__API.annotation('MyAnnotation2', [String, Boolean], ['a', 'b']);

            var result = ria.__SYNTAX.parseAnnotations([
                [MyAnnotation],
                [MyAnnotation2('test', true)]
            ]);

            assertArray(result);
            assertEquals(2, result.length);
            assertTrue(ria.__API.isAnnotation(result[0]));
            assertTrue(ria.__API.isAnnotation(result[1]));
        },

        testParseMethod: function () {

            var MyAnnotation = ria.__API.annotation('MyAnnotation', [], []);

            //noinspection WithStatementJS
            with (ria.__SYNTAX.Modifiers) {
                var result = ria.__SYNTAX.parseMethod([
                    [MyAnnotation],
                    [String, Number, Boolean],
                    FINAL, ABSTRACT, OVERRIDE, VOID, function protected_(a, b, c) {}
                ]);
            }

            assertNotUndefined(result);
            assertInstanceOf(ria.__SYNTAX.MethodDescriptor, result);

            assertEquals('protected_', result.name);
            assertFunction(result.body);

            assertUndefined(result.retType);

            assertArray(result.argsTypes);
            assertEquals(String, result.argsTypes[0]);
            assertEquals(Number, result.argsTypes[1]);
            assertEquals(Boolean, result.argsTypes[2]);

            assertArray(result.argsNames);
            assertEquals('a', result.argsNames[0]);
            assertEquals('b', result.argsNames[1]);
            assertEquals('c', result.argsNames[2]);

            assertArray(result.annotations);
            assertTrue(ria.__API.isAnnotation(result.annotations[0]));

            assertObject(result.flags);
            assertTrue(result.flags.isAbstract);
            assertTrue(result.flags.isOverride);
            assertTrue(result.flags.isFinal);
        },

        testParseProperty: function () {
            var MyAnnotation = ria.__API.annotation('MyAnnotation', [], []);

            //noinspection WithStatementJS
            with (ria.__SYNTAX.Modifiers) {
                var result = ria.__SYNTAX.parseProperty([
                    [MyAnnotation],
                    String, 'prop'
                ]);
            }

            assertNotUndefined(result);
            assertInstanceOf(ria.__SYNTAX.PropertyDescriptor, result);

            assertEquals('prop', result.name);
            assertEquals(String, result.type);
            assertArray(result.annotations);
            assertTrue(ria.__API.isAnnotation(result.annotations[0]));
        },

        testParseMembers: function () {
            var MyAnnotation = ria.__API.annotation('MyAnnotation', [], []);

            var result;
            assertNoException(function () {
                //noinspection WithStatementJS
                with (ria.__SYNTAX.Modifiers) {
                    result = ria.__SYNTAX.parseMembers([
                        [MyAnnotation],
                        Function, 'delegate',

                        function $() {},

                        [MyAnnotation],
                        [String, Number, Boolean],
                        FINAL, VOID, function protected_(a, b, c) {}
                    ]);
                }
            });

            assertArray(result);
            assertEquals(3, result.length);

            assertInstanceOf(ria.__SYNTAX.PropertyDescriptor, result[0]);
            assertInstanceOf(ria.__SYNTAX.MethodDescriptor, result[1]);
            assertInstanceOf(ria.__SYNTAX.MethodDescriptor, result[2]);
        },

        testParseMembersErrorDetection: function () {
            var MyAnnotation = ria.__API.annotation('MyAnnotation', [], []);

            assertException(function () {
                //noinspection WithStatementJS
                with (ria.__SYNTAX.Modifiers) {
                    ria.__SYNTAX.parseMembers([
                        [MyAnnotation],
                        Function, 'delegate'

                        [MyAnnotation],
                        [String, Number, Boolean],
                        FINAL, VOID, function protected_(a, b, c) {}
                    ]);
                }
            }, 'Error');

            assertException(function () {
                //noinspection WithStatementJS
                with (ria.__SYNTAX.Modifiers) {
                    ria.__SYNTAX.parseMembers([
                        [MyAnnotation],
                        Function, 'delegate',

                        [MyAnnotation]
                        [String, Number, Boolean],
                        FINAL, VOID, function protected_(a, b, c) {}
                    ]);
                }
            }, 'Error');

            assertException(function () {
                //noinspection WithStatementJS
                with (ria.__SYNTAX.Modifiers) {
                    ria.__SYNTAX.parseMembers([
                        [MyAnnotation],
                        Function, 'delegate',

                        [MyAnnotation],
                        [String, Number, Boolean],
                        FINAL, VOID, function protected_(a, b, c) {}

                        [MyAnnotation],
                        Function, 'delegate2'
                    ]);
                }
            }, 'Error');
        },

        testParseClass: function () {
            var MyAnnotation = ria.__API.annotation('MyAnnotation', [], []);

            //noinspection WithStatementJS
            with(ria.__SYNTAX.Modifiers) { //noinspection WithStatementJS
                with(ria.__SYNTAX) {
                    var result = ria.__SYNTAX.parseClass([
                        [MyAnnotation],
                        ABSTRACT, FINAL, OVERRIDE, 'MyClass', [
                            String, 'member',

                            function $() {},

                            [MyAnnotation],
                            [String, String],
                            ABSTRACT, FINAL, OVERRIDE, Boolean, function compare(_1, _2) {
                                return _1 === _2;
                            }
                        ]]);
                }
            }

            assertNotUndefined(result);
            assertInstanceOf(ria.__SYNTAX.ClassDescriptor, result);

            assertEquals('MyClass', result.name);
            assertEquals(ria.__API.Class, result.base);

            assertArray(result.ifcs);
            assertEquals(0, result.ifcs.length);

            assertObject(result.flags);
            assertTrue(result.flags.isAbstract);
            assertTrue(result.flags.isFinal);
            assertTrue(result.flags.isOverride);

            assertArray(result.annotations);
            assertEquals(1, result.annotations.length);
            assertTrue(ria.__API.isAnnotation(result.annotations[0]));

            assertArray(result.properties);
            assertEquals(1, result.properties.length);
            assertInstanceOf(ria.__SYNTAX.PropertyDescriptor, result.properties[0]);

            assertArray(result.methods);
            assertEquals(2, result.methods.length);
            assertInstanceOf(ria.__SYNTAX.MethodDescriptor, result.methods[0]);
            assertInstanceOf(ria.__SYNTAX.MethodDescriptor, result.methods[1]);
        },

        testParseClassWithSELF: function () {
            //noinspection WithStatementJS
            with(ria.__SYNTAX.Modifiers) { //noinspection WithStatementJS
                var result = ria.__SYNTAX.parseClass([
                    ABSTRACT, FINAL, OVERRIDE, 'MyClass', [
                        SELF, 'member',

                        [SELF],
                        function $(a) {},

                        SELF, function b() {
                            return this;
                        }
                    ]]);
            }
        }
    };

})(ria);