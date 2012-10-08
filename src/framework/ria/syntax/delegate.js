
/** @namespace ria.__SYNTAX */
ria = ria || {};
ria.__SYNTAX = ria.__SYNTAX || {};

(function () {
    "use strict";

    /**
     * @param {String} ns
     * @param {MethodDescriptor} def
     * @return {Function}
     */
    ria.__SYNTAX.buildDelegate = function (ns, def) {
        return ria.__API.delegate(def.name, def.ret, def.argsTypes, def.argsNames);
    };

    ria.__SYNTAX.DELEGATE = function () {
        var def = ria.__SYNTAX.parseMethod([].slice.call(arguments));
        var name = ria.__SYNTAX.getFullName(def.name);
        var delegate = ria.__SYNTAX.buildDelegate(name, def);
        ria.__SYNTAX.define(name, delegate);
    }
})();