REQUIRE('ria.reflection.Reflector');

/** @namespace ria.reflection*/
NS('ria.reflection', function () {
    "use strict";

    /** @class ria.reflection.ReflectionCtor */
    CLASS(FINAL,
        'ReflectionCtor', EXTENDS(ria.reflection.Reflector), [
            READONLY, ClassOf(Class), 'clazz',
            READONLY, String, 'name',

            [[ClassOf(Class)]],
            function $(clazz) {
                BASE();
                this.clazz = clazz;

                this.method = clazz.__META.ctor;
                this.name = 'ctor';
            },

            String, function getName() { return this.clazz.__META.name + '#' + this.name; },

            OVERRIDE, Array, function getAnnotations() {
                return this.method.annotations;
            },

            ArrayOf(String), function getArguments() { return this.method.argsNames;},
            ArrayOf(String), function getRequiredArguments() {
                return this.getArguments()
                    .filter(function (_) { return !/^.+_$/.test(_) });
            },

            Array, function getArgumentsTypes() { return this.method.argsTypes;}
        ]);
});

