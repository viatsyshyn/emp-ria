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

            [[String]],
            ria.reflection.ReflectionMethod, function getMethodReflector(name) {
                var method = this.clazz.__META.methods[name];
                return method ? new ria.reflection.ReflectionMethod(this.ifc, name) : null;
            },

            ArrayOf(String), function getMethodsReflector() {
                return this.getMethodsNames()
                    .map(function (_) { this.getMethodReflector(_); }.bind(this));
            },

            Boolean, function hasMethod(name) {
                return this.ifc.methods.hasOwnProperty(name);
            }
        ]);
});
