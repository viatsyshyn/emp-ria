(function (ria) {
    "use strict";

    TestCase("ExceptionTestCase").prototype = {
        testBuildException: function () {

            var MyException = EXCEPTION(
                'MyException', [
                    String, 'member',

                    function $() { BASE(''); },

                    [String],
                    String, function method(_1) {
                        return 'I think, this is error: ' + _1;
                    }
                ]);

            assertEquals('test.MyException', MyException.__META.name);
            assertNotUndefined(MyException);
            assertFunction(MyException);
        },

        testBaseException: function () {

            var BaseException = EXCEPTION(
                'BaseException', [
                    function $() {BASE(''); }
                ]);

            var ChildException = EXCEPTION(
                'ChildException', ria.__SYNTAX.EXTENDS(BaseException), [
                    function $() {BASE();}
                ]);

            var instance = new ChildException();

            assertInstanceOf('Expected to be instance of its ctor.', ChildException, instance);
            assertInstanceOf('Expected to be instance of its parent.', BaseException, instance);
        },

        testBadExtending: function () {

            var BaseClass = CLASS(
                'BaseClass', []);

            EXCEPTION_E(Error('Base class must be descendant of Exception'),
                'MyException', ria.__SYNTAX.EXTENDS(BaseClass), [
                    [String],
                    String, function method(_1) {
                        return 'I think, this is error: ' + _1;
                    }
                ]);
        }
    };

})(ria);