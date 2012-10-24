(function (ria) {
    "use strict";

    TestCase("ExceptionTestCase").prototype = {
        testBuildException: function () {

            var MyExceptionDef = ria.__SYNTAX.parseException(
                'MyException', [
                    String, 'member',

                    function $() {},

                    [String],
                    String, function method(_1) {
                        return 'I think, this is error: ' + _1;
                    }
                ]);

            var MyException;
            assertNoException(function () {
                MyException = ria.__SYNTAX.buildException('MyException', MyExceptionDef);
            });

            assertEquals('MyException', MyException.__META.name);
            assertNotUndefined(MyException);
            assertFunction(MyException);
        },

        testBaseException: function () {
            var baseExceptionDef = ria.__SYNTAX.parseException(
                'BaseException', [
                    function $() {}
                ]);

            var BaseException;
            assertNoException(function () {
                BaseException = ria.__SYNTAX.buildException('MyException', baseExceptionDef);
            });

            var childExceptionDef = ria.__SYNTAX.parseException(
                'ChildException', ria.__SYNTAX.EXTENDS(BaseException), [
                    function $() {}
                ]);

            var ChildException;
            assertNoException(function () {
                ChildException = ria.__SYNTAX.buildException('MyException', childExceptionDef);
            });

            //noinspection JSUnusedAssignment
            var instance = new ChildException();

            assertInstanceOf('Expected to be instance of its ctor.', ChildException, instance);
            assertInstanceOf('Expected to be instance of its parent.', BaseException, instance);
        },

        testBadExtending: function () {
            var baseClassDef = ria.__SYNTAX.parseException(
                'BaseClass', [
                    function $() {}
                ]);

            var BaseClass;
            assertNoException(function () {
                BaseClass = ria.__SYNTAX.buildException('BaseClass', baseClassDef);
            });

            var childExceptionDef = ria.__SYNTAX.parseException(
                'MyException', ria.__SYNTAX.EXTENDS(BaseClass), [
                    function $() {},

                    [String],
                    String, function method(_1) {
                        return 'I think, this is error: ' + _1;
                    }
                ]);

            assertException('Expects invalid parent error.', function () {
                ria.__SYNTAX.buildException('MyException', childExceptionDef);
            });
        }
    };

})(ria);