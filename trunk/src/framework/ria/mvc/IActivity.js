NAMESPACE('ria.mvc', function () {
    "use strict";

    /** @class ria.mvc.ActivityGroup */
    ANNOTATION(
        function ActivityGroup(name) {});

    /** @class ria.mvc.ActivityClosedEvent */
    DELEGATE(
        [[Object]],
        VOID, function ActivityClosedEvent(activity) {});

    /** @class ria.mvc.ActivityRefreshedEvent */
    DELEGATE(
        [[Object, Object]],
        VOID, function ActivityRefreshedEvent(activity, model) {});

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
        [[ria.mvc.ActivityClosedEvent]],
        VOID, function addCloseCallback(callback) {},

        [[Object]],
        VOID, function refresh(model) {},

        /**
         * Configure Refresh Event
         */
        [[ria.mvc.ActivityRefreshedEvent]],
        VOID, function addRefreshCallback(callback) {}
    ]);
});
