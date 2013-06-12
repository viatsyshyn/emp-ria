REQUIRE('ria.reflection.Reflector');

/** @namespace ria.reflection*/
NS('ria.reflection', function () {
    "use strict";

    /** @class ria.reflection.ReflectionMethod */
    CLASS(
        FINAL, 'ReflectionMethod', EXTENDS(ria.reflection.Reflector), [
            READONLY, Function, 'clazz',
            READONLY, String, 'name',

            function $(clazz, name) {
                VALIDATE_ARG('clazz', [ria.__API.ClassDescriptor, ria.__API.InterfaceDescriptor], clazz.__META);
                this.clazz = clazz;

                this.method = clazz.__META.methods[name];
                VALIDATE_ARG('name', [ria.__API.MethodDescriptor], this.method.__META);
                this.name = name;
            },

            String, function getName() { return this.clazz.__META.name + '#' + this.name; },
            String, function getShortName() { return this.name; },
            //Boolean, function isAbstract() { return this.method.flags.isAbstract;},
            //Boolean, function isFinal() { return this.method.flags.isFinal; },
            //Boolean, function isOverride() { return this.method.flags.isOverride; },

            Array, function getAnnotations() { return this.method.annotations; },
            Object, function getReturnType() { return this.method.retType; },
            Array, function getArguments() { return this.method.argsNames;},
            Array, function getArgumentsTypes() { return this.method.argsTypes;},

            function invokeOn(instance, args) {
                VALIDATE_ARG('instance', [this.clazz], instance);
                VALIDATE_ARGS(this.method.argsNames, this.method.argsTypes, args);
                _DEBUG && (instance = instance.__PROTECTED || instance);
                this.method.impl.apply(instance, args);
            }
        ]);
});

