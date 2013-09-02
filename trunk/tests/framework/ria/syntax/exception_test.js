(function (ria) {
    "use strict";

    TestCase("ExceptionTestCase").prototype = {
        testBuildException: function () {

            var MyExceptionDef = ria.__SYNTAX.parseClassDef(new ria.__SYNTAX.Tokenizer([
                'MyException', [
                    String, 'member',

                    function $() {},

                    [String],
                    String, function method(_1) {
                        return 'I think, this is error: ' + _1;
                    }
                ]]));

            assertNoException(function () {
                ria.__SYNTAX.precalcClassOptionalsAndBaseRefs(MyExceptionDef, ria.__API.Exception);
                ria.__SYNTAX.validateException(MyExceptionDef);
            });

            var MyException = ria.__SYNTAX.compileClass('MyException', MyExceptionDef);
            assertEquals('MyException', MyException.__META.name);
            assertNotUndefined(MyException);
            assertFunction(MyException);
        },

        testBaseException: function () {
            var baseExceptionDef = ria.__SYNTAX.parseClassDef(new ria.__SYNTAX.Tokenizer([
                'BaseException', [
                    function $() {}
                ]]));

            assertNoException(function () {
                ria.__SYNTAX.precalcClassOptionalsAndBaseRefs(baseExceptionDef, ria.__API.Exception);
                ria.__SYNTAX.validateException(baseExceptionDef);
            });

            var BaseException = ria.__SYNTAX.compileClass('BaseException', baseExceptionDef);

            var childExceptionDef = ria.__SYNTAX.parseClassDef(new ria.__SYNTAX.Tokenizer([
                'ChildException', ria.__SYNTAX.EXTENDS(BaseException), [
                    function $() {}
                ]]));

            assertNoException(function () {
                ria.__SYNTAX.precalcClassOptionalsAndBaseRefs(childExceptionDef, ria.__API.Exception);
                ria.__SYNTAX.validateException(childExceptionDef);
            });

            var ChildException = ria.__SYNTAX.compileClass('MyException', childExceptionDef);

            //noinspection JSUnusedAssignment
            var instance = new ChildException();

            assertInstanceOf('Expected to be instance of its ctor.', ChildException, instance);
            assertInstanceOf('Expected to be instance of its parent.', BaseException, instance);
        },

        testBadExtending: function () {
            var baseClassDef = ria.__SYNTAX.parseClassDef(new ria.__SYNTAX.Tokenizer([
                'BaseClass', [
                    function $() {}
                ]]));

            ria.__SYNTAX.precalcClassOptionalsAndBaseRefs(baseClassDef, ria.__API.Class);
            ria.__SYNTAX.validateClassDecl(baseClassDef, ria.__API.Class);

            var BaseClass = ria.__SYNTAX.compileClass('BaseClass', baseClassDef);

            var childExceptionDef = ria.__SYNTAX.parseClassDef(new ria.__SYNTAX.Tokenizer([
                'MyException', ria.__SYNTAX.EXTENDS(BaseClass), [
                    function $() {},

                    [String],
                    String, function method(_1) {
                        return 'I think, this is error: ' + _1;
                    }
                ]]));

            assertException('Expects invalid parent error.', function () {
                ria.__SYNTAX.precalcClassOptionalsAndBaseRefs(childExceptionDef, ria.__API.Exception);
                ria.__SYNTAX.validateException(childExceptionDef);
            });
        }
    };

})(ria);