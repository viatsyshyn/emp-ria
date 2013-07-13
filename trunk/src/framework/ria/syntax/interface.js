/** @namespace ria.__SYNTAX */
ria.__SYNTAX = ria.__SYNTAX || {};

(function () {
    "use strict";

    /**
     * @param {ClassDescriptor} def
     */
    ria.__SYNTAX.validateInterfaceDecl = function (def) {
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

        // TODO: throw Error if any EXTENDS
        // TODO: throw Error if any IMPLEMENTS
        // TODO: validate no duplicate members
        // TODO: throw Error if any ctors
        // TODO: throw Error if any flags on methods
        // TODO: throw Error if any annotations on methods

        def.methods.map(
            /**
             * @param {MethodDescriptor} method
             */
            function (method) {
                if (method.flags.isAbstract || method.flags.isOverride || method.flags.isReadonly || method.flags.isFinal )
                    throw Error('Interface method can NOT be marked with ABSTRACT, OVERRIDE, READONLY or FINAL');


            });

        def.properties.forEach(
            /**
             * @param {PropertyDescriptor} property
             */
            function (property) {
                if (property.flags.isAbstract || property.flags.isOverride || property.flags.isFinal )
                    throw Error('Interface property can NOT be marked with ABSTRACT, OVERRIDE or FINAL');
            });
    };

    /**
     * @param {String} name
     * @param {ClassDescriptor} def
     * @return {Function}
     */
    ria.__SYNTAX.compileInterface = function (name, def) {
        function InterfaceProxy() {
            // TODO: update to tokenizer

            var members = ria.__SYNTAX.parseMembers([].slice.call(arguments));
            var flags = {isFinal: true };
            var properties = members.filter(function (_1) { return _1 instanceof ria.__SYNTAX.PropertyDescriptor });
            var methods = members.filter(function (_1) { return _1 instanceof ria.__SYNTAX.MethodDescriptor });
            var def = new ria.__SYNTAX.ClassDescriptor('$AnonymousClass', ria.__API.Class, [InterfaceProxy], flags, [], properties, methods);
            var impl = ria.__SYNTAX.buildClass('$AnonymousClass', def);
            return impl();
        }

        // TODO: handle ImplementerOf(SELF)

        var methods = def.methods.map(
            /**
             * @param {MethodDescriptor} method
             */
            function (method) {
                var types = method.argsTypes
                    .map(function (_) { return _ instanceof ria.__SYNTAX.Tokenizer.SelfToken ? InterfaceProxy : _.value; });

                return [
                    method.name,
                    method.retType instanceof ria.__SYNTAX.Tokenizer.SelfToken ? InterfaceProxy : method.retType.value,
                    types,
                    method.argsNames
                ];
            });

        def.properties.forEach(
            /**
             * @param {PropertyDescriptor} property
             */
            function (property) {
                methods.push([
                    property.getGetterName(),
                    property.type instanceof ria.__SYNTAX.Tokenizer.SelfToken ? InterfaceProxy : property.type.value,
                    [],
                    []
                ]);

                if (property.flags.isReadonly)
                    return ;

                methods.push([
                    property.getSetterName(),
                    undefined,
                    [property.type instanceof ria.__SYNTAX.Tokenizer.SelfToken ? InterfaceProxy : property.type.value],
                    ['value']
                ]);
            });

        ria.__API.ifc(InterfaceProxy, name, methods);

        Object.freeze(InterfaceProxy);
        ria.__SYNTAX.Registry.registry(name, InterfaceProxy);

        return InterfaceProxy;
    };

    /**
     * @function
     */
    function INTERFACE() {
        var def = ria.__SYNTAX.parseClassDef(new ria.__SYNTAX.Tokenizer([].slice.call(arguments)));
        ria.__SYNTAX.validateInterfaceDecl(def);
        var name = ria.__SYNTAX.getFullName(def.name);
        var ifc = ria.__SYNTAX.compileInterface(name, def);
        ria.__SYNTAX.isProtected(name) || ria.__SYNTAX.define(name, ifc);
        return ifc;
    }

    ria.__SYNTAX.INTERFACE = INTERFACE;

    if (ria.__CFG.enablePipelineMethodCall && ria.__CFG.checkedMode) {
        ria.__API.addPipelineMethodCallStage('BeforeCall',
            function (body, meta, scope, args, result, callSession) {
                // TODO: wrap args into proxy if it's ifc
            });

        ria.__API.addPipelineMethodCallStage('AfterCall',
            function (body, meta, scope, args, result, callSession) {
                if (meta.ret && ria.__API.isInterface(meta.ret)) {
                    var fn = function AnonymousClass() {};
                    // TODO: wrap result into proxy if it's ifc
                }

                return result;
            });
    }
})();
