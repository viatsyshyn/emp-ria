REQUIRE('ria.reflection.Reflector');

/** @namespace ria.reflection*/
NS('ria.reflection', function () {
    "use strict";

    /** @class ria.reflection.ReflectionInterface */
    CLASS(
        FINAL, 'ReflectionInterface', EXTENDS(ria.reflection.Reflector), [
            READONLY, Function, 'ifc',

            function $(ifc) {
                ria.__API.checkArg('clazz', [ria.__API.InterfaceDescriptor], ifc.__META);
            },

            String, function getName() { return this.ifc.__META.name; },

            Array, function getMethodsNames() { return Object.keys(this.ifc.methods) },

            Object, function getMethodReturnType(name) { return this.ifc.methods[name].retType; },
            Array, function getMethodArguments(name) { return this.ifc.methods[name].argsNames;},
            Array, function getMethodArgumentsTypes(name) { return this.ifc.methods[name].argsTypes;},

            Boolean, function hasMethod(name) {}
        ]);
});
