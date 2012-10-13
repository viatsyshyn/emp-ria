REQUIRE('ria.reflection.Reflector');

/** @namespace ria.reflection*/
NS('ria.reflection', function () {
    "use strict";

    /** @class ria.reflection.ReflectionInterface */
    CLASS(
        'ReflectionInterface', EXTENDS(ria.reflection.Reflector), [
            READONLY, Function, 'ifc',

            function $(ifc) {
                ria.__API.checkArg('clazz', [ria.__API.InterfaceDescriptor], clazz.__META);
            },

            String, function getName() { return this.ifc.__META.name; },

            Array, function getMethodsNames() { },

            Boolean, function hasMethod(name) {}
        ]);
});
