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
                ria.__SYNTAX.checkArg('clazz', [ria.__API.ClassDescriptor], clazz.__META);

                this.property = clazz.__META.properties[name];
                ria.__SYNTAX.checkArg('name', [ria.__API.PropertyDescriptor], this.property.__META);
            },

            String, function getName() { return this.clazz.__META.name + '#' + this.name; },
            String, function isReadonly() { return this.property.setter == undefined; },

            Array, function getAnnotations() { return this.property.annotations; },
            Object, function getType() { return this.property.type; },

            function invokeGetterOn(instance) {
                ria.__SYNTAX.checkArg('instance', [this.clazz], instance);
                _DEBUG && (instance = instance.__PROTECTED || instance);
                this.method.getter.call(instance);
            },

            VOID, function invokeSetterOn(instance, value) {
                ria.__SYNTAX.checkArg('instance', [this.clazz], instance);
                ria.__SYNTAX.checkArg('value', [this.property.type], value);
                _DEBUG && (instance = instance.__PROTECTED || instance);
                this.method.setter.call(instance, value);
            }
        ]);
});


