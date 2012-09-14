REQUIRE('hwa.mvc.IActivity');

/** @namespace hwa.mvc */
NAMESPACE('hwa.mvc', function () {
    "use strict";

    /**
     * @class hwa.mvc.IView
     * @interface
     */
    INTERFACE('IView', [
        /**
         * Push Activity over current and stop current
         */
        [hwa.mvc.IActivity],
        VOID, function push(activity) {},

        /**
         * Shade current with new Activity (background current)
         */
        [hwa.mvc.IActivity],
        VOID, function shade(activity) {},

        /**
         * Shade current with new Activity and callback on pop (background current)
         */
        [hwa.mvc.IActivity, Function],
        VOID, function modal(activity, callback) {},

        /**
         * Pop current Activity and foreground previous
         */
        hwa.mvc.IActivity, function pop() {},

        /**
         * Return active Activity
         */
        hwa.mvc.IActivity, function getCurrent() {},

        /**
         * Init engine, stop all activities and empty stack
         */
        VOID, function reset() {}
    ]);
});
