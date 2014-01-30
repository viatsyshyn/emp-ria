REQUIRE('ria.dom.Dom');

NAMESPACE('test', function () {
    "use strict";

    CLASS(
        'EmptyClass', [
            function $() {
                BASE();
                this._date = new Date();
            }
        ]);

    CLASS(
        'TestClass', [
            function $() {
                BASE();
                this._date = new Date();
            },
            String, 'prop',
            Number, function method() {}
        ]);

    CLASS(
        'ChildClass', EXTENDS(test.EmptyClass), [
            function $() {
                BASE();
                this._date = new Date();
            },
            String, 'prop',
            Number, function method() {}
        ]);

    CLASS(
        GENERIC('T1', 'T2'),
        'GenericClass', EXTENDS(test.EmptyClass), [
            function $() {
                BASE();
                this._date = new Date();
            },
            T1, 'prop',
            T2, function method() {}
        ]);

    function PlainClass() {
        this._date = new Date();
    }

    var TESTS = {
        testPlainClass: function () { new PlainClass(); },
        testClass: function () { Class(); },
        testNewClass: function () { new Class(); },
        testEmptyClass: function () { test.EmptyClass(); },
        testNewEmptyClass: function () { new test.EmptyClass(); },
        testNewTestClass: function () { new test.TestClass(); },
        testNewChildClass: function () { new test.ChildClass(); },
        testNewGenericClass: function () { new test.GenericClass(String, Number); },
        tesGenericClass: function () { test.GenericClass(String, Number); }
    };

    var TEST_LOOPS = 10000,
        TEST_RUNS = 10;

    function avg(a) {
        return a.reduce(function (r, i) { return r + i}, 0) / a.length;
    }

    function runner(testFn, done) {
        setTimeout(function () {
            var started = new Date().getTime();

            for(var i = 0; i < TEST_LOOPS; i++) {
                testFn();
            }

            done(new Date().getTime() - started);
        }, 17);
    }

    function runCase(name, testFn, done) {
        var runs = [], times = TEST_RUNS;

        var $dom = ria.dom.Dom(document.createElement('pre'))
            .setText('Test: ' + name + '\nRuns: ')
            .appendTo('BODY');

        (function run(done) {
            if (--times == 0)
                return done(runs);

            runner(testFn, function (result) {
                runs.push(result);
                $dom.setText($dom.getText() + result + ' ');
                run(done);
            });
        })(function (results) {
            $dom.setText($dom.getText() + '\nAvg: ' + avg(results));
            done();
        });
    }

    function runTests(tests, done) {
        var names = Object.getOwnPropertyNames(tests), results = {};

        (function run(done) {
            if (names.length <= 0)
                return done(results);

            var name = names.shift();
            runCase(name, tests[name], function (result) {
                results[name] = result;
                run(done);
            })
        })(done);
    }

    function main() {
        runTests(TESTS, function () {
            ria.dom.Dom(document.createElement('pre'))
                .setText('Complete.')
                .appendTo('BODY');
        });
    }

    ria.dom.Dom(document.createElement('button'))
        .setText('Start')
        .on('click', main)
        .appendTo('BODY');
});