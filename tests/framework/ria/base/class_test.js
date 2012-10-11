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
            assertInstanceOf(ria.__API.ClassDescriptor, Clazz.__META);
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

        testProtectedVisibility: function () {
            fail();
        },

        testClassExtending: function () {

            var BaseClazz = this.Clazz;

            function ChildClazz() { return ria.__API.init(this, ChildClazz, ChildClazz.prototype.$, arguments) }
            ria.__API.clazz(ChildClazz, 'ChildClazz', BaseClazz, [], []);
            ChildClazz.prototype.$ = function () { BaseClazz.prototype.$.call(this); };
            ria.__API.ctor(ChildClazz, ChildClazz.prototype.$, [], [], []);
            ria.__API.compile(ChildClazz);

            assertInstanceOf(ria.__API.ClassDescriptor, ChildClazz.__META);

            var instance = new ChildClazz();

            assertObject(instance);
            assertInstanceOf(ChildClazz, instance);
            assertInstanceOf(BaseClazz, instance);
            assertFunction(instance.compare);

            // TODO: check for parent members, check visibility
        },

        testClassProtectedArea: function () {
            // TODO: check __PROTECTED is instance of same class
            // TODO: check __PROTECTED contains all same public members
            // TODO: check __PROTECTED has all fields initialized
            fail();
        }
    }
})(ria);
