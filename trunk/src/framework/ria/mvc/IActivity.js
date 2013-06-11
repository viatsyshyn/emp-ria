NAMESPACE('ria.mvc', function () {
    "use strict";

    /** @class ria.mvc.ActivityGroup */
    ANNOTATION(
        function ActivityGroup(name) {});

    /**
     * Base Activity Interface
     *
     * @class ria.mvc.IActivity
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
        Boolean, function isStarted() {},

        /**
         * Close dialog
         */
        VOID, function close() {},

        /**
         * Configure Close Event
         */
        [[Function]],
        VOID, function addCloseCallback(callback) {}
    ]);
});
