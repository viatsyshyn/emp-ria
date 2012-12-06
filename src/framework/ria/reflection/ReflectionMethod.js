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
                ria.__SYNTAX.checkArg('clazz', [ria.__API.ClassDescriptor], clazz.__META);

                this.method = clazz.__META.methods[name];
                ria.__SYNTAX.checkArg('name', [ria.__API.MethodDescriptor], this.method.__META);
            },

            String, function getName() { return this.clazz.__META.name + '#' + this.name; },
            Boolean, function isAbstract() { return this.method.flags.isAbstract;},
            Boolean, function isFinal() { return this.method.flags.isFinal; },
            Boolean, function isOverride() { return this.method.flags.isOverride; },

            Array, function getAnnotations() { return this.method.annotations; },
            Object, function getReturnType() { return this.method.retType; },
            Array, function getArguments() { return this.method.argsNames;},
            Array, function getArgumentsTypes() { return this.method.argsTypes;},

            function invokeOn(instance, args) {
                ria.__SYNTAX.checkArg('instance', [this.clazz], instance);
                ria.__SYNTAX.checkArgs(this.method.argsNames, this.method.argsTypes, args);
                //#ifdef DEBUG
                    instance = instance.__PROTECTED || instance;
                //#endif
                this.method.impl.apply(instance, args);
            }
        ]);
});

