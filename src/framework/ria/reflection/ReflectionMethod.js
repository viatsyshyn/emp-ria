REQUIRE('ria.reflection.Reflector');

/** @namespace ria.reflection*/
NS('ria.reflection', function () {
    "use strict";

    /** @class ria.reflection.ReflectionMethod */
    CLASS(
        FINAL, 'ReflectionMethod', EXTENDS(ria.reflection.Reflector), [
            READONLY, ClassOf(Class), 'clazz',
            READONLY, String, 'name',

            [[ClassOf(Class), String]],
            function $(clazz, name) {
                this.clazz = clazz;
                this.method = clazz.__META.methods[name];
                this.name = name;
            },

            String, function getName() { return this.clazz.__META.name + '#' + this.name; },
            String, function getShortName() { return this.name; },
            //Boolean, function isAbstract() { return this.method.flags.isAbstract;},
            //Boolean, function isFinal() { return this.method.flags.isFinal; },
            //Boolean, function isOverride() { return this.method.flags.isOverride; },

            OVERRIDE, Array, function getAnnotations() { return this.method.annotations; },
            Object, function getReturnType() { return this.method.retType; },

            ArrayOf(String), function getArguments() { return this.method.argsNames;},

            ArrayOf(String), function getRequiredArguments() {
                return this.getArguments()
                    .filter(function (_) { return !/^.+_$/.test(_) });
            },

            Array, function getArgumentsTypes() { return this.method.argsTypes;},

            function invokeOn(instance, args_) {
                VALIDATE_ARG('instance', [this.clazz], instance);
                VALIDATE_ARGS(this.method.argsNames, this.method.argsTypes, args_ || []);
                _DEBUG && (instance = instance.__PROTECTED || instance);
                return this.method.impl.apply(instance, args_ || []);
            }
        ]);
});

