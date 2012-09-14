/** @namespace hwa.mvc */
NAMESPACE('hwa.mvc', function () {
    "use strict";

    /**
     * Base Activity Interface
     *
     * @class hwa.mvc.IActivity
     * @interface
     */
    INTERFACE('IActivity', [
        /**
         * Make this activity visible and active
         */
        VOID, function show() {},

        /**
         * Make this activity non-active
         */
        VOID, function pause() {},

        /**
         * Make this activity non-visible and non-active
         */
        VOID, function stop() {},

        /**
         * Check if activity is active
         * @return {Boolean}
         */
        Boolean, function isForeground() {},

        /**
         * Check if activity is started
         * @return {Boolean}
         */
        Boolean, function isStarted() {}
    ]);
});
