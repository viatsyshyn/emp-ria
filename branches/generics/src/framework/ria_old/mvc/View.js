REQUIRE('hwa.mvc.MvcException');
REQUIRE('hwa.mvc.IActivity');
REQUIRE('hwa.mvc.IView');
REQUIRE('hwa.mvc.ActivityGroup');
REQUIRE('hwa.mvc.IDialogActivity');

REQUIRE('hwa.reflection.ReflectionFactory');

/** @namespace hwa.mvc */
NAMESPACE('hwa.mvc', function () {
    "use strict";

    /**
     * @class hwa.mvc.View
     * @implements hwa.mvc.IView
     */
    CLASS('View', IMPLEMENTS(hwa.mvc.IView), [
        PUBLIC, function __constructor() {
            BASE();
            this.stack = [];
        },

        [hwa.mvc.IActivity, hwa.mvc.IActivity],
        PRIVATE, Boolean, function isSameActivityGroup(a1, a2) {
            var ref1 = hwa.reflection.ReflectionFactory(a1.getClass());
            var ref2 = hwa.reflection.ReflectionFactory(a2.getClass());
            var v1 = ref1.getAnnotation(hwa.mvc.ActivityGroup);
            var v2 = ref2.getAnnotation(hwa.mvc.ActivityGroup);
            return v1 != null && v2 != null && v1.name == v2.name;
        },

        [hwa.mvc.IActivity, Function],
        PROTECTED, VOID, function push_(activity, callback){
            var isModal = typeof callback === 'function';

            if (hwa.mvc.IDialogActivity.implementedBy(activity)) {
                var that = this;
                var cb = function (activity, result) {
                    try {
                        (callback || hwa.emptyFn).apply(this, arguments);
                    } catch (e) {
                        setTimeout(function () {
                            throw new hwa.mvc.MvcException("Uncaught exception in callback of hwa.mvc.IDialogActivity", e);
                        }, 1);
                    } finally {
                        that.pop();
                    }
                };
                activity.setCloseMode(cb, isModal);
            }

            activity.show();

            this.stack.unshift(activity);
        },

        PROTECTED, hwa.mvc.IActivity, function pop_() {
            return this.stack.shift() || null;
        },

        /**
         * Push activity at the top of stack and hide previous
         * @param {hwa.mvc.Activity} activity
         * @return {hwa.mvc.IView}
         */
        [Override],
        [hwa.mvc.IActivity],
        PUBLIC, VOID, function push (activity) {
            var top = this.getCurrent();
            if (top) {
                top.stop();

                if (this.isSameActivityGroup(top, activity))
                    this.pop_().stop();
            }

            this.push_(activity, null);
        },

        /**
         * Shade top of stack with activity
         * @param {hwa.mvc.Activity} activity
         * @return {hwa.mvc.IView}
         */
        [Override],
        [hwa.mvc.IActivity],
        PUBLIC, VOID, function shade (activity) {
            var top = this.getCurrent();
            if (top) {
                top.pause();

                if (this.isSameActivityGroup(top, activity))
                    this.pop_().stop();
            }

            this.push_(activity, null);
        },

        /**
         * Modal show activity over top of stack
         * @param {hwa.mvc.Activity} activity
         * @param {Function} callback
         * @return {hwa.mvc.IView}
         */
        [Override],
        [hwa.mvc.IDialogActivity, Function],
        PUBLIC, VOID, function modal (activity, callback) {
            var top = this.getCurrent();
            if (top) {
                top.pause();

                if (this.isSameActivityGroup(top, activity))
                    this.pop_().stop();
            }

            this.push_(activity, callback);
        },

        /**
         * Pop from stack and show previous
         * @return {hwa.mvc.Activity}
         */
        [Override],
        PUBLIC, hwa.mvc.IActivity, function pop () {
            var pop = this.pop_();
            pop.stop();

            var top = this.getCurrent();
            if (top) {
                top.show();
            } else {
                // let pretend that user clicked Back button if history is not empty
                hwa.global.history.back();
                // TODO: if history has no items, need to go to home
            }

            return pop;
        },

        /**
         * Return current top of stack
         * @return {hwa.mvc.Activity}
         */
        [Override],
        PUBLIC, hwa.mvc.IActivity, function getCurrent () {
            return this.stack[0] || null;
        },

        /**
         * Pop all from stack with stop and reset engine
         * @return {hwa.mvc.IView}
         */
        [Override],
        PUBLIC, VOID, function reset() {
            while (this.getCurrent() !== null)
                this.pop_().stop();
        },

        PROTECTED, Array, function getStack() {
            return this.stack.slice();
        }
    ]);
});
