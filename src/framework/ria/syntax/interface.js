/** @namespace ria.__SYNTAX */
ria.__SYNTAX = ria.__SYNTAX || {};

(function () {
    "use strict";

    /**
     * @param {String} name
     * @param {ClassDescriptor} def
     * @return {Function}
     */
    ria.__SYNTAX.buildInterface = function (name, def) {

        // throw Error if any flags
        if (def.flags.isFinal)
            throw Error('Interface can NOT be marked with FINAL');

        if (def.flags.isAbstract)
            throw Error('Interface can NOT be marked with ABSTRACT');

        if (def.flags.isOverride)
            throw Error('Interface can NOT be marked with OVERRIDE');

        if (def.flags.isReadonly)
            throw Error('Interface can NOT be marked with READONLY');

        // throw Error if any annotations;
        if (def.annotations.length != 0)
            throw Error('Annotation are not supported on interfaces');

        // TODO: validate no duplicate members
        // TODO: throw Error if any properties
        // TODO: throw Error if any ctors
        // TODO: throw Error if any flags on methods
        // TODO: throw Error if any annotations on methods

        function InterfaceProxy() {
            var members = ria.__SYNTAX.parseMembers([].slice.call(arguments));
            var flags = {isFinal: true };
            var properties = members.filter(function (_1) { return _1 instanceof ria.__SYNTAX.PropertyDescriptor });
            var methods = members.filter(function (_1) { return _1 instanceof ria.__SYNTAX.MethodDescriptor });
            var def = new ria.__SYNTAX.ClassDescriptor('$AnonymousClass', ria.__API.Class, [InterfaceProxy], flags, [], properties, methods);
            var impl = ria.__SYNTAX.buildClass('$AnonymousClass', def);
            return impl();
        }

        var methods = def.methods.map(
            /**
             * @param {MethodDescriptor} method
             */
            function (method) {
                if (method.flags.isAbstract || method.flags.isReadonly || method.flags.isReadonly )
                    throw Error('');

                var types = method.argsTypes.map(function (_) {
                    return _ === ria.__SYNTAX.Modifiers.SELF ? InterfaceProxy : _;
                });

                return [method.name,
                    method.retType === ria.__SYNTAX.Modifiers.SELF ? InterfaceProxy : method.retType,
                    types,
                    method.argsNames];
            });

        ria.__API.ifc(InterfaceProxy, name, methods);

        //#ifdef DEBUG
            Object.freeze(InterfaceProxy);
        //#endif

        return InterfaceProxy;
    };

    ria.__SYNTAX.INTERFACE = function () {
        var def = ria.__SYNTAX.parseClassDef([].slice.call(arguments), null);
        var name = ria.__SYNTAX.getFullName(def.name);
        var clazz = ria.__SYNTAX.buildInterface(name, def);
        ria.__SYNTAX.define(name, clazz);
    };

    //#ifdef DEBUG
    ria.__API.addPipelineMethodCallStage('AfterCall',
        function (body, meta, scope, args, result, callSession) {
            if (meta.ret && ria.__API.isInterface(meta.ret)) {
                var fn = function AnonymousClass() {};
            }

            return result;
        });
    //#endif
})();
