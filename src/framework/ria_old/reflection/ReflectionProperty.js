REQUIRE('hwa.reflection.Reflector');

/** @namespace hwa.reflection */
NAMESPACE('hwa.reflection', function () {
    "use strict";

    /** @class hwa.reflection.ReflectionProperty */
    CLASS('ReflectionProperty', EXTENDS(hwa.reflection.Reflector), [
        [hwa.__API.PropertyDescriptor],
        PUBLIC, function __constructor(property) {
            this.property = property;
        },

        [Override],
        PUBLIC, Boolean, function hasAnnotation(annotation) {
            return this.getAnnotation(annotation) !== null;
        },

        [Override],
        PUBLIC, Object, function getAnnotation(annotation) {
            var a = this.property.annotations;
            var index = a.length;
            for(; index > 0; index--)
                if (a[index - 1] instanceof annotation.__annotationDescriptor.ctor)
                    return a[index - 1];

            return null;
        },

        [Override],
        PUBLIC, Array, function getAnnotations() {
            return this.property.annotations;
        },

        PUBLIC, String, function getShortName() {
            return this.property.name;
        },

        PUBLIC, String, function getName() {
            return this.getShortName();
        },

        PUBLIC, Boolean, function isAbstract() {
            return this.property.isAbstract;
        },

        PUBLIC, Boolean, function isPublic() {
            return this.property.visibility == hwa.__API.Visibility.Public;
        },

        PUBLIC, Boolean, function isStatic() {
            return this.property.isStatic;
        },

        PUBLIC, String, function getSignature() {
            return this.property.getPropertySignature();
        },

        PUBLIC, String, function getGetterName() {
            return this.property.getterName;
        },

        PUBLIC, String, function getSetterName() {
            return this.property.setterName;
        },

        PUBLIC, Object, function getType() {
            return this.property.type;
        }
    ]);
});
