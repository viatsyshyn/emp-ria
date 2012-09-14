/** @namespace hwa.reflection */
NAMESPACE('hwa.reflection', function () {
    "use strict";

    /**
     * @class hwa.reflection.Reflector
     */
    CLASS(ABSTRACT, 'Reflector', [
        PUBLIC, ABSTRACT, Boolean, function hasAnnotation(annotation) {},
        PUBLIC, ABSTRACT, Object, function getAnnotation(annotation) {},
        PUBLIC, ABSTRACT, Array, function getAnnotations() {},

        PUBLIC, ABSTRACT, String, function getName() {},
        PUBLIC, ABSTRACT, String, function getShortName() {}
    ]);
});