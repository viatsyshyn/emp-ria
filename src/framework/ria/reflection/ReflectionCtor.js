REQUIRE('ria.reflection.Reflector');

/** @namespace ria.reflection*/
NS('ria.reflection', function () {
    "use strict";

    /** @class ria.reflection.ReflectionCtor */
    CLASS(FINAL,
        'ReflectionCtor', EXTENDS(ria.reflection.Reflector), [
            READONLY, Function, 'clazz',
            READONLY, String, 'name',

            function $(clazz) {
                VALIDATE_ARG('clazz', [ria.__API.ClassDescriptor], clazz.__META);
                this.clazz = clazz;

                this.method = clazz.__META.ctor;
                this.name = 'ctor';
            },

            String, function getName() { return this.clazz.__META.name + '#' + this.name; },

            Array, function getAnnotations() {
                return this.method.annotations;
            },

            ArrayOf(String), function getArguments() { return this.method.argsNames;},
            ArrayOf(String), function getRequiredArguments() {
                return this.getArguments()
                    .filter(function (_) { return !/^.+_$/.test(_) });
            },

            Array, function getArgumentsTypes() { return this.method.argsTypes;},

            Boolean, function isAnnotatedWith(ann) {
                return this.getAnnotations()
                    .some(function (_) { return _.__META == ann.__META });
            }
        ]);
});

