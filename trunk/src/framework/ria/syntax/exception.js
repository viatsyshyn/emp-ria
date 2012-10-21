
/** @namespace ria.__SYNTAX */
ria = ria || {};
ria.__SYNTAX = ria.__SYNTAX || {};

(function () {
    "use strict";

    /**
     * @param {String} name
     * @param {ClassDescriptor} def
     * @return {Function}
     */
    ria.__SYNTAX.buildException = function (name, def) {

        function ClassProxy() {
            return ria.__API.init(this, ClassProxy, ClassProxy.prototype.$, arguments);
        }
        ria.__API.clazz(ClassProxy, name, def.base, def.ifcs, def.annotations);


        ria.__API.compile(ClassProxy);

        return ClassProxy;
    };

    ria.__SYNTAX.EXCEPTION = function () {
        var def = ria.__SYNTAX.parseClass([].slice.call(arguments));
        def.base = ria.__API.Exception;
        var name = ria.__SYNTAX.getFullName(def.name);
        var exception = ria.__SYNTAX.buildException(name, def);
        ria.__SYNTAX.define(name, exception);
    }
})();