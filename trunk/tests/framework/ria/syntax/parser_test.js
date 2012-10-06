(function (ria) {
    //"use strict";

    TestCase("ParserTestCase").prototype = {
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
            assertUndefined(result.retType);
            assertEquals([String, Number, Boolean], result.argsTypes);
            assertEquals(['a', 'b', 'c'], result.argsNames);
            assertEquals([MyAnnotation()], result.annotations);
            assertFunction(result.body);
            assertObject(result.flags);
            assertFalse(results.flags.isPublic);
            assertTrue(results.flags.isAbstract);
            assertTrue(results.flags.isOverride);
            assertTrue(results.flags.isFinal);
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
            assertEquals(String, result.retType);
            assertEquals([MyAnnotation()], result.annotations);
        }
    };

})(ria);
