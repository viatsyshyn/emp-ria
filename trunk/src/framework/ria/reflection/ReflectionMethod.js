REQUIRE('hwa.reflection.Reflector');

/** @namespace hwa.reflection */
NAMESPACE('hwa.reflection', function () {
    "use strict";

    /**
     * @class hwa.reflection.ReflectionMethod
     * @extends hwa.reflection.Reflector
     */
    CLASS('ReflectionMethod', EXTENDS(hwa.reflection.Reflector), [
        [hwa.__API.MethodDescriptor],
        PUBLIC, function __constructor(method) {
            this.md = method;
        },

        [Override],
        PUBLIC, Boolean, function hasAnnotation(annotation) {
            return this.getAnnotation(annotation) !== null;
        },

        [Override],
        PUBLIC, Object, function getAnnotation(annotation) {
            var a = this.md.annotations;
            var index = a.length;
            for(; index > 0; index--)
                if (a[index - 1] instanceof annotation.__annotationDescriptor.ctor)
                    return a[index - 1];

            return null;
        },

        [Override],
        PUBLIC, Array, function getAnnotations() {
            return this.md.annotations;
        },

        PUBLIC, Number, function getNumberOfParameters() {
            return this.md.body.getParametersCount();
        },

        PUBLIC, ArrayOf(String), function getParameters() {
            return this.md.body.getParameters();
        },

        PUBLIC, String, function getShortName() {
            return this.md.body.getName();
        },

        PUBLIC, String, function getName() {
            return this.md.body.getName();
        },

        PUBLIC, String, function getBody() {
            return this.md.body.getBody();
        },

        PUBLIC, Number, function getRequiredParametersCount() {
            return this.md.body.getRequiredParametersCount();
        },

        PUBLIC, Boolean, function hasVarArgs() {
            return this.md.hasVarArgs;
        },

        PUBLIC, Boolean, function isAbstract() {
            return this.md.isAbstract;
        },

        PUBLIC, Boolean, function isPublic() {
            return this.md.visibility == hwa.__API.Visibility.Public;
        },

        PUBLIC, Boolean, function isStatic() {
            return this.md.isStatic;
        },

        PUBLIC, String, function getSignature() {
            return this.md.getMethodFullSignature();
        }
    ]);
});