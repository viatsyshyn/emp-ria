REQUIRE('ria.reflection.Reflector');

/** @namespace ria.reflection*/
NS('ria.reflection', function () {
    "use strict";

    /** @class ria.reflection.ReflectionProperty */
    CLASS(
        FINAL, 'ReflectionProperty', EXTENDS(ria.reflection.Reflector), [
            READONLY, Function, 'clazz',
            READONLY, String, 'name',

            function $(clazz, name) {
                ria.__API.checkArg('clazz', [ria.__API.ClassDescriptor], clazz.__META);

                this.property = clazz.__META.properties[name];
                ria.__API.checkArg('name', [ria.__API.PropertyDescriptor], this.property.__META);
            },

            String, function getName() { return this.clazz.__META.name + '#' + this.name; },

            Array, function getAnnotations() { return this.property.annotations; },
            Object, function getType() { return this.property.type; },

            function invokeGetterOn(instance) {},
            VOID, function invokeSetterOn(instance, value) {}
        ]);
});


