
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
    ria.__SYNTAX.buildDelegate = function (name, def) {
        // TODO: throw Error if annotations are set
        // TODO: throw Error if has OVERRIDE, ABSTRACT, FINAL
        // TODO: warn if has body
        return ria.__API.delegate(name, def.ret, def.argsTypes, def.argsNames);
    };

    ria.__SYNTAX.DELEGATE = function () {
        var def = ria.__SYNTAX.parseMethod([].slice.call(arguments));
        var name = ria.__SYNTAX.getFullName(def.name);
        var delegate = ria.__SYNTAX.buildDelegate(name, def);
        ria.__SYNTAX.define(name, delegate);
    }
})();