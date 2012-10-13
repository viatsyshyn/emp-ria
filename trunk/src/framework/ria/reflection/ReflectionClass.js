REQUIRE('ria.reflection.Reflector');

/** @namespace ria.reflection*/
NS('ria.reflection', function () {
    "use strict";

    /** @class ria.reflection.ReflectionClass */
    CLASS(
        'ReflectionClass', EXTENDS(ria.reflection.Reflector), [
            READONLY, ClassOf(Class), 'clazz',

            function $(clazz) {},

            String, function getName() { return this.clazz.__META.name; },

            Boolean, function isAbstract() { return this.clazz.__META.flags.isAbstract; },
            Boolean, function isFinal() { return this.clazz.__META.flags.isFinal; },

            Array, function getAnnotations() { return this.clazz.__META.annotations; },
            Object, function getBaseClass() {  },
            Array, function getInterfaces() { },
            Array, function getProperties() { },
            Object, function getCtor() { },
            Array, function getMethods() { },
            Array, function getChildren() { },

            Boolean, function annotatedWith(ann) {},
            Boolean, function extendsClass(parent) {},
            Boolean, function implementsIfc(parent) {},
            [String],
            Boolean, function hasProperty(name) {},
            [String],
            Boolean, function hasMethod(name) {},

            [Array],
            Class, function instantiate(args) {}
        ]);
});
