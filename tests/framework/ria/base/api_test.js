(function (ria) {
    "use strict";

    TestCase("APITestCase").prototype = {

        setUp: function() {
            _DEBUG = true;
        },

        testExtend: function () {
            function Base() {}
            function Child() {}

            ria.__API.extend(Child, Base);

            assertInstanceOf(Base, new Child());
        },

        testScoping_DEBUG: function () {
            _DEBUG = true;

            function Clazz() { return ria.__API.init(this, Clazz, Clazz.prototype.$, arguments) }
            ria.__API.clazz(Clazz, 'Clazz', null, [], []);

            ria.__API.ctor('$', Clazz, Clazz.prototype.$ = function (v) {
                this.testProp = v;
            }, [Object], ['v'], []);

            ria.__API.method(Clazz, Clazz.prototype.getP = function () {
                return this.testProp;
            }, 'getP', Object, [], [], []);

            ria.__API.compile(Clazz);

            var instance = new Clazz(123);

            var method = instance.getP;

            assertTrue(_DEBUG);
            assertEquals(123, method());
        },

        testScoping_RELEASE: function () {
            _DEBUG = false;

            function Clazz() { return ria.__API.init(this, Clazz, Clazz.prototype.$, arguments) }
            ria.__API.clazz(Clazz, 'Clazz', null, [], []);

            ria.__API.ctor('$', Clazz, Clazz.prototype.$ = function (v) {
                this.testProp = v;
            }, [Object], ['v'], []);

            ria.__API.method(Clazz, Clazz.prototype.getP = function () {
                return this.testProp;
            }, 'getP', Object, [], [], []);

            ria.__API.compile(Clazz);

            var instance = new Clazz(123);

            var method = instance.getP;

            assertFalse(_DEBUG);
            assertEquals(123, method());

            _DEBUG = true;
        }
    };

})(ria);