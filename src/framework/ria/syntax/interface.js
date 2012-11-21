
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
    ria.__SYNTAX.buildInterface = function (name, def) {

        // throw Error if any flags
        ria.__SYNTAX.Assert(!def.flags.isFinal,    'Can NOT be marked with FINAL');
        ria.__SYNTAX.Assert(!def.flags.isAbstract, 'Can NOT be marked with ABSTRACT');
        ria.__SYNTAX.Assert(!def.flags.isOverride, 'Can NOT be marked with OVERRIDE');
        ria.__SYNTAX.Assert(!def.flags.isReadonly, 'Can NOT be marked with READONLY');

        // throw Error if any annotations;
        ria.__SYNTAX.Assert(def.annotations.length == 0, 'Can NOT be marked with FINAL');

        // TODO: validate no duplicate members
        // TODO: throw Error if any properties
        // TODO: throw Error if any ctors
        // TODO: throw Error if any flags on methods
        // TODO: throw Error if any annotations on methods

        var methods = def.methods.map(
            /**
             * @param {MethodDescriptor} method
             */
            function (method) {
                return [method.name, method.retType, method.argsTypes, method.argsNames];
            });

        var ifc = ria.__API.ifc(name, methods);

        function InterfaceProxy() {
            var members = ria.__SYNTAX.parseMembers([].slice.call(arguments));
            var flags = {isFinal: true };
            var properties = members.filter(function (_1) { return _1 instanceof ria.__SYNTAX.PropertyDescriptor });
            var methods = members.filter(function (_1) { return _1 instanceof ria.__SYNTAX.MethodDescriptor });
            var def = new ria.__SYNTAX.ClassDescriptor('$AnonymousClass', ria.__API.Class, [InterfaceProxy], flags, [], properties, methods);
            var impl = ria.__SYNTAX.buildClass('$AnonymousClass', def);
            return impl();
        }

        InterfaceProxy.__META = ifc.__META;

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
    }
})();
