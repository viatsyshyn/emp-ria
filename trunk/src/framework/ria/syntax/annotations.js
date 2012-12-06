/** @namespace ria.__SYNTAX */
ria.__SYNTAX = ria.__SYNTAX || {};

(function () {
    "use strict";

    /**
     * @param {String} name
     * @param {MethodDescriptor} def
     * @return {Function}
     */
    ria.__SYNTAX.buildAnnotation = function (name, def) {
        if(def.annotations.length)
            throw Error('Annotations are not supported in annotations');

        if(def.flags.isAbstract || def.flags.isOverride || def.flags.isFinal)
            throw Error('Modifiers are not supported in annotations');

        if(def.retType !== null)
            throw Error('Return type is not supported in annotations');

        def.argsTypes.forEach(function(type){
            if(type == ria.__SYNTAX.Modifiers.SELF)
                throw Error('Argument type can\'t be SELF in annotations');
        });

        // TODO: warn if has body

        var fn_ = ria.__API.annotation(name, def.argsTypes, def.argsNames);
        return ria.__CFG.enablePipelineMethodCall
            ? ria.__API.getPipelineMethodCallProxyFor(fn_, fn_.__META, window)
            : fn_;
    };

    ria.__SYNTAX.ANNOTATION = function () {
        var def = ria.__SYNTAX.parseMethod([].slice.call(arguments));
        var name = ria.__SYNTAX.getFullName(def.name);
        var annotation = ria.__SYNTAX.buildAnnotation(name, def);
        ria.__SYNTAX.define(name, annotation);
    }
})();