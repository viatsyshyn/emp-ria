(function (ria) {
    "use strict";

    TestCase("ClassTestCase").prototype = {
        setUp: function(){
            function Clazz() { ria.__API.init(this, Clazz, Clazz.prototype.$, arguments) }
            ria.__API.clazz(Clazz, 'TestInterface', null, [], []);
            Clazz.prototype.$ = function () { this.testProp = 1; };
            ria.__API.ctor(Clazz, Clazz.prototype.$, [], [], []);
            Clazz.prototype.compare = function () { return this.testProp; };
            ria.__API.method(Clazz, Clazz.prototype.compare, 'compare', Boolean, [String, String], ['_1', '_2'], []);
            ria.__API.compile(Clazz);

            this.Clazz = Clazz;
        },

        testCreate: function () {
            var Clazz = this.Clazz;

            assertFunction(Clazz);
            assertNotUndefined(Clazz.__META);
        },

        testUsage: function() {
            var Clazz = this.Clazz;

            assertNoException(function () {
                new Clazz();
            });

            assertException(function () {
                new Clazz(5);
            }, ria.__API.InvalidArgumentException);
        },

        testMethodSelfBind: function () {
            var Clazz = this.Clazz;

            var instance = new Clazz();

            var method = instance.compare;

            assertEquals(method(), 1);
        }
    }
})(ria);
