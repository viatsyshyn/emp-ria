REQUIRE('ria.reflection.Reflector');

/** @namespace ria.reflection*/
NS('ria.reflection', function () {
    "use strict";

    /** @class ria.reflection.ReflectionProperty */
    CLASS(
        FINAL, 'ReflectionProperty', EXTENDS(ria.reflection.Reflector), [
            READONLY, ClassOf(Class), 'clazz',
            READONLY, String, 'name',

            [[ClassOf(Class), String]],
            function $(clazz, name) {
                BASE();
                this.clazz = clazz;
                this.property = clazz.__META.properties[name];
                this.name = name;
            },

            String, function getName() { return this.clazz.__META.name + '#' + this.name; },
            String, function getShortName() { return this.name; },
            Boolean, function isReadonly() { return this.property.setter == undefined; },
            OVERRIDE, Array, function getAnnotations() { return this.property.annotations; },
            Object, function getType() { return this.property.retType; },

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


