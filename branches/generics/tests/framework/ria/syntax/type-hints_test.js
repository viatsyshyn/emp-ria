(function () {
    "use strict";

    function getErrorMessage(e) {
        return ria.__API.getIdentifierOfValue(e) + '(' + (e.getMessage ? e.getMessage() : e.message) + ')' + '\n' + e.toString();
    }

    function assertNoException(msg, callback) {
        var args = argsWithOptionalMsg_(arguments, 2);
        jstestdriver.assertCount++;

        try {
            args[1]();
        } catch(e) {
            fail(args[0] + 'expected not to throw exception, but threw ' + getErrorMessage(e));
        }
    }

    function assertException(msg, callback, error) {
        if (arguments.length == 1) {
            // assertThrows(callback)
            callback = msg;
            msg = '';
        } else if (arguments.length == 2) {
            if (typeof callback != 'function') {
                // assertThrows(callback, type)
                error = callback;
                callback = msg;
                msg = '';
            } else {
                // assertThrows(msg, callback)
                msg += ' ';
            }
        } else {
            // assertThrows(msg, callback, type)
            msg += ' ';
        }

        jstestdriver.assertCount++;

        try {
            callback();
        } catch(e) {
            if (e.name == 'AssertError') {
                throw e;
            }

            if (error && (e.getMessage ? e.getMessage() : e.message) != error.message) {
                fail(msg + 'expected to throw "' + error.message + '" but threw ' + getErrorMessage(e));
            }

            return true;
        }

        fail(msg + 'expected to throw ' + getErrorMessage(error));
    }

    TestCase("TypeHintsTestCase").prototype = {

        testCheckArgs: function () {
            var d = DELEGATE(
                [[String, Number]],
                Boolean, function TestDelegate(s, n_) {});

            var wrapper = d(function (s, n) { return s === String(n); });

            assertNoException(function () { wrapper('1'); });
            assertNoException(function () { wrapper('1', 2); });

            assertException(function () { wrapper(); }, Error('Bad argument for test.TestDelegate'));
            assertException(function () { wrapper(2, '3'); }, Error('Bad argument for test.TestDelegate'));
            assertException(function () { wrapper('2', 1, 3); }, Error('Bad argument for test.TestDelegate'));
        },

        testCheckReturn: function () {
            var d = DELEGATE(
                [[Object]],
                Boolean, function TestDelegate(s) {});

            var wrapper = d(function (s) { return s; });

            assertNoException(function () { wrapper(true); });
            assertException(function () { wrapper(2); }, Error('Bad return of test.TestDelegate'));
        },

        /*testClassOf: function () {
            //fail('test ClassOf(Class) extends ClassOf(BaseClass)');
        },*/

        testDelegateSpecification: function () {
            var Processor = DELEGATE(
                GENERIC('TSource', 'TResult'),
                [[TSource]],
                TResult, function Processor(source) {});

            var objProcessor = Processor(Object, Object, function (source) { return source; });
            assertNoException(function () { objProcessor(true);});
            assertNoException(function () { objProcessor("Source"); });
            assertNoException(function () { objProcessor(2); });

            var stringProcessor = Processor(String, String, function (source) { return source; });
            assertException(function () { stringProcessor(true); }, Error('Bad argument for test.Processor'));
            assertNoException(function () { stringProcessor("Source"); });
            assertException(function () { stringProcessor(2); }, Error('Bad argument for test.Processor'));

            var stringNumberProcessor = Processor(String, Number, function (source) { return source; });
            assertException(function () { stringNumberProcessor("Source"); }, Error('Bad return of test.Processor'));
        }
    };
})();