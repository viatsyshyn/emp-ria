REQUIRE('ria.mvc.MvcException');

REQUIRE('ria.mvc.IView');

REQUIRE('ria.reflection.ReflectionFactory');

/** @namespace hwa.mvc */
NAMESPACE('ria.mvc', function () {
    "use strict";

    /**
     * @class ria.mvc.View
     */
    CLASS(
        'View', IMPLEMENTS(hwa.mvc.IView), [
            function $() {
                BASE();
                this.stack = [];
            },

            [[ria.mvc.IActivity, ria.mvc.IActivity]],
            Boolean, function isSameActivityGroup_(a1, a2) {
                var ref1 = hwa.reflection.ReflectionFactory(a1.getClass());
                var ref2 = hwa.reflection.ReflectionFactory(a2.getClass());
                var v1 = ref1.getAnnotation(hwa.mvc.ActivityGroup);
                var v2 = ref2.getAnnotation(hwa.mvc.ActivityGroup);
                return v1 != null && v2 != null && v1.name == v2.name;
            },

            [[hwa.mvc.IActivity]],
            VOID, function push_(activity){
                activity.addCloseCallback(this.onActivityClosed_);
                activity.show();

                this.stack.unshift(activity);
            },

            [[ria.mvc.IActivity]],
            VOID, function onActivityClosed_(activity) {
                while (this.getCurrent() != null) {
                    if (this.getCurrent() === activity) {
                        this.pop(); // stop and start under
                        break;
                    } else {
                        this.pop_(); // just stop current
                    }
                }
            },

            ria.mvc.IActivity, function pop_() {
                return this.stack.shift() || null;
            },

            /**
             * Push activity at the top of stack and hide previous
             * @param {ria.mvc.Activity} activity
             */
            [[hwa.mvc.IActivity]],
            VOID, function push(activity) {
                var top = this.getCurrent();
                if (top) {
                    top.stop();

                    if (this.isSameActivityGroup_(top, activity))
                        this.pop_().stop();
                }

                this.push_(activity);
            },

            /**
             * Shade top of stack with activity
             * @param {ria.mvc.Activity} activity
             */
            [[hwa.mvc.IActivity]],
            VOID, function shade(activity) {
                var top = this.getCurrent();
                if (top) {
                    top.pause();

                    if (this.isSameActivityGroup_(top, activity))
                        this.pop_().stop();
                }

                this.push_(activity);
            },

            /**
             * Pop from stack and show previous
             * @return {ria.mvc.Activity}
             */
            ria.mvc.IActivity, function pop() {
                var pop = this.pop_();
                if (!pop)
                    return null;

                pop.stop();

                var top = this.getCurrent();
                if (top) {
                    top.show();
                }

                return pop;
            },

            /**
             * Return current top of stack
             * @return {ria.mvc.Activity}
             */
            ria.mvc.IActivity, function getCurrent() {
                return this.stack[0] || null;
            },

            /**
             * Pop all from stack with stop and reset engine
             * @return {hwa.mvc.IView}
             */
            VOID, function reset() {
                while (this.getCurrent() !== null)
                    this.pop_().stop();
            },

            ArrayOf(ria.mvc.IActivity), function getStack_() {
                return this.stack.slice();
            }
        ]);
});
