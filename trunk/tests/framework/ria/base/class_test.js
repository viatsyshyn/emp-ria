(function (ria) {
    "use strict";

    TestCase("ClassTestCase").prototype = {
        setUp: function(){
            function Clazz() { return ria.__API.init(this, Clazz, Clazz.prototype.$, arguments) }
            ria.__API.clazz(Clazz, 'TestInterface', null, [], []);
            Clazz.prototype.$ = function () { this.testProp = 1; };
            ria.__API.ctor(Clazz, Clazz.prototype.$, [], [], []);
            Clazz.prototype.compare = function (_1, _2) { return _1 === _2; };
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

            assertNoException(function () { new Clazz(); });

            assertException(function () { new Clazz(5); }, 'Error');
        },

        testCtorInvisible: function() {
            var Clazz = this.Clazz;

            var instance;
            assertNoException(function () { instance = new Clazz(); });

            assertUndefined(instance.$);
            assertUndefined(instance.__PROTECTED.$);
        },

        testMethodSelfBind: function () {
            var Clazz = this.Clazz;

            var instance = new Clazz();

            var method = instance.compare;

            assertEquals(method('1', '2'), false);
        },

        testProtectedVisibility: function () {},

        testClassExtending: function () {
            // TODO: check for parent members, check visibility
        },

        testClassProtectedArea: function () {
            // TODO: check __PROTECTED is instance of same class
            // TODO: check __PROTECTED contains all same public members
            // TODO: check __PROTECTED has all fields initialized
        }
    }
})(ria);
