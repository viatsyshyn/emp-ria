REQUIRE('ria.reflection.Reflector');

/** @namespace ria.reflection*/
NS('ria.reflection', function () {
    "use strict";

    /** @class ria.reflection.ReflectionClass */
    CLASS(
        FINAL, 'ReflectionClass', EXTENDS(ria.reflection.Reflector), [
            READONLY, Function, 'clazz',

            function $(clazz) {
                ria.__SYNTAX.checkArg('clazz', [ria.__API.ClassDescriptor], clazz.__META);
            },

            String, function getName() { return this.clazz.__META.name; },

            Boolean, function isAbstract() { return this.clazz.__META.flags.isAbstract; },
            Boolean, function isFinal() { return this.clazz.__META.flags.isFinal; },

            Array, function getAnnotations() { return this.clazz.__META.annotations; },
            Function, function getBaseClass() { return this.clazz.__META.base; },
            ArrayOf(Function), function getInterfaces() { return this.clazz.__META.ifcs; },
            ArrayOf(String), function getMethodsNames() { return Object.keys(this.clazz.__META.methods); },
            ArrayOf(String), function getPropertiesNames() { return Object.keys(this.clazz.__META.properties); },
            ArrayOf(Function), function getChildren() { }, // TODO: fast way to get children

            Object, function getCtorAnnotations() { return this.clazz.__META.ctor.annotations; },
            Object, function getCtorArguments() { return this.clazz.__META.ctor.argsNames; },
            Object, function getCtorArgumentsTypes() { return this.clazz.__META.ctor.argsTypes; },

            Boolean, function isAnnotatedWith(ann) {},
            Boolean, function extendsClass(parent) {},
            Boolean, function implementsIfc(parent) {},
            [String],
            Boolean, function hasProperty(name) { return this.clazz.__META.properties.hasOwnProperty(name); },
            [String],
            Boolean, function hasMethod(name) { return this.clazz.__META.methods.hasOwnProperty(name); },

            [Array],
            Class, function instantiate(args) {
                return ria.__API.init(null, this.clazz, this.clazz.__META.ctor.impl, args);
            }
        ]);
});
