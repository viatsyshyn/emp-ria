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
                this.name = name;
            },

            String, function getName() { return this.clazz.__META.name + '#' + this.name; },
            String, function getShortName() { return this.name; },
            Boolean, function isReadonly() { return this.property.setter == undefined; },
            Array, function getAnnotations() { return this.property.annotations; },
            Object, function getType() { return this.property.retType; },

            Boolean, function isAnnotatedWith(ann) {
                return this.getAnnotations()
                    .some(function (_) { return _.__META == ann.__META });
            },

            function invokeGetterOn(instance) {
                VALIDATE_ARG('instance', [this.clazz], instance);
                _DEBUG && (instance = instance.__PROTECTED || instance);
                return this.property.getter.call(instance);
            },

            VOID, function invokeSetterOn(instance, value) {
                VALIDATE_ARG('instance', [this.clazz], instance);
                VALIDATE_ARG('value', [this.property.retType], value);
                _DEBUG && (instance = instance.__PROTECTED || instance);
                this.property.setter.call(instance, value);
            }
        ]);
});


