
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
            }
        ]);
});