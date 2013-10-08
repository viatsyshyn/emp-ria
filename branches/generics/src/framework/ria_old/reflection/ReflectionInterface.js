REQUIRE('hwa.reflection.Exception');
REQUIRE('hwa.reflection.Reflector');
REQUIRE('hwa.reflection.ReflectionMethod');

/** @namespace hwa.reflection */
NAMESPACE('hwa.reflection', function () {
    "use strict";

    /**
     * @class hwa.reflection.ReflectionInterface
     * @extends hwa.reflection.Reflector
     */
    CLASS('ReflectionInterface', EXTENDS(hwa.reflection.Reflector), [
        PUBLIC, function __constructor(interface_) {
            if (!hwa.__API.InterfaceDescriptor.isInterfaceProxy(interface_))
                throw new hwa.reflection.Exception('ReflectionInterface works only on hwa.base interfaces');

            this.interface_ = interface_.__interfaceDescriptor;
            this.declaration = interface_;
        },

        [Override],
        PUBLIC, Boolean, function hasAnnotation(annotation) {
            return this.getAnnotation(annotation) !== null;
        },

        [Override],
        PUBLIC, Object, function getAnnotation(annotation) {
            var a = this.interface_.annotations;
            var index = a.length;
            for(; index > 0; index--)
                if (a[index - 1] instanceof annotation.__annotationDescriptor.ctor)
                    return a[index - 1];

            return null;
        },

        [Override],
        PUBLIC, Array, function getAnnotations() {
            return this.interface_.annotations;
        },

        [String],
        PUBLIC, Boolean, function hasMethod(name) {
            var m = this.interface_.methods;
            var index = m.length;
            for(;index > 0; index--)
                if (m[index - 1].name == name)
                    return true;

            return false;
        },

        PUBLIC, ArrayOf(hwa.reflection.ReflectionMethod), function getMethods() {
            var result = [].slice.call(this.interface_.methods);
            var index = result.length;
            for(;index > 0; index--)
                result[index - 1] = new hwa.reflection.ReclectionMethod(result[index - 1]);

            return result;
        },

        [Override],
        PUBLIC, String, function getName() {
            return this.declaration.__IDENTIFIER__;
        },

        [Override],
        PUBLIC, String, function getShortName() {
            return this.interface_.name;
        }
    ]);
});