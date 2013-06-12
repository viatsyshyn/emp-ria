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
                VALIDATE_ARG('clazz', [ria.__API.ClassDescriptor], clazz.__META);
                this.clazz = clazz;

                this.property = clazz.__META.properties[name];
                VALIDATE_ARG('name', [ria.__API.PropertyDescriptor], this.property.__META);
                this.name = name;
            },

            String, function getName() { return this.clazz.__META.name + '#' + this.name; },
            String, function getShortName() { return this.name; },
            String, function isReadonly() { return this.property.setter == undefined; },
            Array, function getAnnotations() { return this.property.annotations; },
            Object, function getType() { return this.property.type; },

            function invokeGetterOn(instance) {
                VALIDATE_ARG('instance', [this.clazz], instance);
                _DEBUG && (instance = instance.__PROTECTED || instance);
                this.method.getter.call(instance);
            },

            VOID, function invokeSetterOn(instance, value) {
                VALIDATE_ARG('instance', [this.clazz], instance);
                VALIDATE_ARG('value', [this.property.type], value);
                _DEBUG && (instance = instance.__PROTECTED || instance);
                this.method.setter.call(instance, value);
            }
        ]);
});


