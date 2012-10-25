
/** @namespace ria.__SYNTAX */
ria = ria || {};
ria.__SYNTAX = ria.__SYNTAX || {};

(function () {
    "use strict";
    /**
     * @param {Array} args
     * @return {ClassDescriptor}
     */
    ria.__SYNTAX.parseException = function (args) {
        var def = ria.__SYNTAX.parseClassDef(args, ria.__API.Exception);
        return def;
    };

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

        if(!ria.__SYNTAX.isInstanceOf(def.base ,ria.__API.Exception))
            throw Error('Errors can extend only from other exceptions');

        return ria.__SYNTAX.buildClass(name, def);
    };

    ria.__SYNTAX.EXCEPTION = function () {
        var def = ria.__SYNTAX.parseException([].slice.call(arguments));
        var name = ria.__SYNTAX.getFullName(def.name);
        var exception = ria.__SYNTAX.buildException(name, def);
        ria.__SYNTAX.define(name, exception);
    }
})();