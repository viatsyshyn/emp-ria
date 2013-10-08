REQUIRE('ria.mvc.IActivity');

NAMESPACE('ria.mvc', function () {
    "use strict";

    /**
     * @class ria.mvc.IView
     */
    INTERFACE(
        'IView', [
            /**
             * Push Activity over current and stop current
             */
            [[ria.mvc.IActivity]],
            VOID, function push(activity) {},

            /**
             * Push Activity over current and stop current
             */
            [[ria.mvc.IActivity, ria.async.Future]],
            VOID, function pushD(activity, data) {},

            /**
             * Shade current with new Activity (background current)
             */
            [[ria.mvc.IActivity]],
            VOID, function shade(activity) {},

            /**
             * Shade current with new Activity (background current)
             */
            [[ria.mvc.IActivity, ria.async.Future]],
            VOID, function shadeD(activity, data) {},

            /**
             * Shade current with new Activity and callback on pop (background current)
             */
            //[ria.mvc.IActivity, Function],
            //VOID, function modal(activity, callback) {},

            /**
             * Pop current Activity and foreground previous
             */
            ria.mvc.IActivity, function pop() {},

            [[ImplementerOf(ria.mvc.IActivity), ria.async.Future]],
            VOID, function updateD(activityClass, data) {},

            /**
             * Return active Activity
             */
            ria.mvc.IActivity, function getCurrent() {},

            /**
             * Init engine, stop all activities and empty stack
             */
            VOID, function reset() {},

            [[ria.mvc.ActivityRefreshedEvent]],
            VOID, function onActivityRefreshed(callback) {}
        ]);
});
