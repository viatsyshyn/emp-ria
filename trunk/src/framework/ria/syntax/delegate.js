/** @namespace ria.__SYNTAX */
ria.__SYNTAX = ria.__SYNTAX || {};

(function () {
    "use strict";

    /**
     * @param {String} name
     * @param {MethodDescriptor} def
     * @return {Function}
     */
    ria.__SYNTAX.buildDelegate = function (name, def) {
        if(def.annotations.length)
            throw Error('Annotations are not supported in delegates');

        if(def.flags.isAbstract || def.flags.isOverride || def.flags.isFinal)
            throw Error('Modifiers are not supported in delegates');

        def.argsTypes.forEach(function(type){
            if(type == ria.__SYNTAX.Modifiers.SELF)
                throw Error('Argument type can\'t be SELF in delegates');
        });

        if(def.retType == ria.__SYNTAX.Modifiers.SELF)
            throw Error('Return type can\'t be SELF in delegates');
        // TODO: warn if has body
        return ria.__API.delegate(name, def.retType, def.argsTypes, def.argsNames);
    };

    ria.__SYNTAX.DELEGATE = function () {
        var def = ria.__SYNTAX.parseMethod([].slice.call(arguments));
        var name = ria.__SYNTAX.getFullName(def.name);
        var delegate = ria.__SYNTAX.buildDelegate(name, def);
        ria.__SYNTAX.define(name, delegate);
    }
})();