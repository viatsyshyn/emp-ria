/** @namespace ria.__SYNTAX */
ria.__SYNTAX = ria.__SYNTAX || {};

(function () {
    "use strict";

    /**
     * @param {MethodDescriptor} def
     */
    ria.__SYNTAX.validateDelegateDecl = function (def) {
        ria.__SYNTAX.validateVarName(def.name);

        if(def.annotations.length)
            throw Error('Annotations are not supported in delegates');

        if(def.flags.isAbstract || def.flags.isOverride || def.flags.isFinal)
            throw Error('Modifiers are not supported in delegates');

        def.argsTypes.forEach(function(type){
            if(type instanceof ria.__SYNTAX.Tokenizer.SelfToken)
                throw Error('Argument type can\'t be SELF in delegates');
        });

        if(def.retType instanceof ria.__SYNTAX.Tokenizer.SelfToken)
            throw Error('Return type can\'t be SELF in delegates');

        // TODO: warn if has body
    };

    /**
     * @param {String} name
     * @param {MethodDescriptor} def
     * @return {Function}
     */
    ria.__SYNTAX.compileDelegate = function (name, def) {
        return ria.__API.delegate(
            name,
            def.retType.value,
            def.argsTypes.map(function (_) { return _.value; }),
            def.argsNames);
    };

    /**
     * @function
     */
    function DELEGATE() {
        var def = ria.__SYNTAX.parseMember(new ria.__SYNTAX.Tokenizer([].slice.call(arguments)));
        ria.__SYNTAX.validateDelegateDecl(def);
        var name = ria.__SYNTAX.getFullName(def.name);
        var delegate = ria.__SYNTAX.compileDelegate(name, def);
        ria.__SYNTAX.isProtected(name) || ria.__SYNTAX.define(name, delegate);
        return delegate;
    }

    ria.__SYNTAX.DELEGATE = DELEGATE;
})();