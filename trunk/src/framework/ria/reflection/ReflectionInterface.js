REQUIRE('ria.reflection.Reflector');
REQUIRE('ria.reflection.ReflectionMethod');

/** @namespace ria.reflection*/
NS('ria.reflection', function () {
    "use strict";

    /** @class ria.reflection.ReflectionInterface */
    CLASS(
        FINAL, 'ReflectionInterface', EXTENDS(ria.reflection.Reflector), [
            READONLY, Function, 'ifc',

            function $(ifc) {
                ria.__SYNTAX.checkArg('clazz', [ria.__API.InterfaceDescriptor], ifc.__META);
                this.ifc = ifc;
            },

            String, function getName() {
                return this.ifc.__META.name;
            },

            Array, function getMethodsNames() {
                return Object.keys(this.ifc.methods)
            },

            Object, function getMethodInfo(name) { return this.ifc.methods[name] || null; },
            function getMethodReturnType(name) { return this.ifc.methods[name].retType; },
            ArrayOf(String), function getMethodArguments(name) { return this.ifc.methods[name].argsNames;},
            ArrayOf(Object), function getMethodArgumentsTypes(name) { return this.ifc.methods[name].argsTypes;},

            Boolean, function hasMethod(name) {
                return this.ifc.methods.hasOwnProperty(name);
            }
        ]);
});
