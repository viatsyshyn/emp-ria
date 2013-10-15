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
                var getter = this.property.getter;
                _DEBUG && (instance = instance.__PROTECTED || instance);

                if (ria.__CFG.enablePipelineMethodCall && getter.__META) {
                    var genericTypes = this.clazz.__META.genericTypes;
                    var genericSpecs = this.clazz.__META.genericTypes.map(function (type, index) {
                        if (this.clazz.__META.baseSpecs.length > index)
                            return this.clazz.__META.genericTypes[index];

                        return instance.getSpecsOf(type.name);
                    }.bind(this));
                    getter = ria.__API.getPipelineMethodCallProxyFor(getter, getter.__META, instance, genericTypes, genericSpecs);
                }

                return getter.call(instance);
            },

            VOID, function invokeSetterOn(instance, value) {
                VALIDATE_ARG('instance', [this.clazz], instance);
                VALIDATE_ARG('value', [this.property.retType], value);
                var setter = this.property.setter;
                if (_DEBUG) {
                    instance = instance.__PROTECTED || instance;
                }

                if (ria.__CFG.enablePipelineMethodCall && setter.__META) {
                    var genericTypes = this.clazz.__META.genericTypes;
                    var genericSpecs = this.clazz.__META.genericTypes.map(function (type, index) {
                        if (this.clazz.__META.baseSpecs.length > index)
                            return this.clazz.__META.genericTypes[index];

                        return instance.getSpecsOf(type.name);
                    }.bind(this));
                    setter = ria.__API.getPipelineMethodCallProxyFor(setter, setter.__META, instance, genericTypes, genericSpecs);
                }

                setter.call(instance, value);
            }
        ]);
});


