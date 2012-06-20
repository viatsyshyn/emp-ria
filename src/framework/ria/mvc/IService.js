/** @namespace hwa.mvc */
NAMESPACE('hwa.mvc', function () {
    "use strict";

    /**
     * @class hwa.mvc.IService
     * @interface
     */
    INTERFACE('IService', [
        /**
         * Provides service name
         */
        String, function getName() {}
    ]);
});
