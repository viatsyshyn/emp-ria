
/** @namespace ria.reflection */
NS('ria.reflection', function () {
    "use strict";

    /**
     * @class ria.reflection.Reflector
     */
    CLASS(
        ABSTRACT, 'Reflector', [

            SELF, function getCached(clazz, value) {
                if (ria.reflection.ReflectionFactory)
                    return ria.reflection.ReflectionFactory(value, clazz);

                return new clazz(value);
            },

            ABSTRACT, Array, function getAnnotations() {},

            Boolean, function isAnnotatedWith(ann) {
                return this.getAnnotations()
                    .some(function (_) { return _.__META == ann.__META });
            },

            Array, function findAnnotation(ann) {
                return this.getAnnotations()
                    .filter(function (_) { return _.__META == ann.__META});
            },
        ]);
});