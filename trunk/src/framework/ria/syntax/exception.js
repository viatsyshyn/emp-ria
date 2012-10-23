
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

        if(def.annotations.length)
            throw Error('Annotations are not supported in delegates');

        if(def.flags.isAbstract || def.flags.isOverride || def.flags.isFinal)
            throw Error('Modifiers are not supported in delegates');

        return ria.__SYNTAX.buildClass(name, def);
    };

    ria.__SYNTAX.EXCEPTION = function () {
        var def = ria.__SYNTAX.parseClass([].slice.call(arguments));
        def.base = ria.__API.Exception;
        var name = ria.__SYNTAX.getFullName(def.name);
        var exception = ria.__SYNTAX.buildException(name, def);
        ria.__SYNTAX.define(name, exception);
    }
})();