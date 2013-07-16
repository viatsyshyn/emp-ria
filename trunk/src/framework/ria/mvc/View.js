REQUIRE('ria.mvc.MvcException');

REQUIRE('ria.mvc.IView');

REQUIRE('ria.async.Observable');

REQUIRE('ria.reflection.ReflectionClass');

NAMESPACE('ria.mvc', function () {
    "use strict";

    /**
     * @class ria.mvc.View
     */
    CLASS(
        'View', IMPLEMENTS(ria.mvc.IView), [
            function $() {
                BASE();
                this._stack = [];
                this._refreshEvents = new ria.async.Observable(ria.mvc.ActivityRefreshedEvent);
            },

            [[ria.mvc.IActivity, ria.mvc.IActivity]],
            Boolean, function isSameActivityGroup_(a1, a2) {
                var ref1 = new ria.reflection.ReflectionClass(a1.getClass());
                var ref2 = new ria.reflection.ReflectionClass(a2.getClass());
                var v1 = ref1.findAnnotation(ria.mvc.ActivityGroup)[0];
                var v2 = ref2.findAnnotation(ria.mvc.ActivityGroup)[0];
                return v1 != null && v2 != null && v1.name == v2.name;
            },

            [[ria.mvc.IActivity]],
            VOID, function push_(activity){
                activity.addCloseCallback(this.onActivityClosed_);
                activity.addRefreshCallback(this.onActivityRefreshed_);
                activity.show();

                this._stack.unshift(activity);
            },

            [[ria.mvc.IActivity]],
            VOID, function onActivityClosed_(activity) {
                while (this.getCurrent() != null) {
                    if (this.getCurrent().equals(activity)) {
                        this.pop(); // stop and start under
                        break;
                    } else {
                        this.pop_(); // just stop current
                    }
                }
            },

            ria.mvc.IActivity, function pop_() {
                return this._stack.shift() || null;
            },

            [[ria.mvc.IActivity, ria.async.Future]],
            VOID, function pushD(activity, data) {
                this.push(activity);
                activity.refreshD(data);
            },

            /**
             * Push activity at the top of stack and hide previous
             * @param {ria.mvc.Activity} activity
             */
            [[ria.mvc.IActivity]],
            VOID, function push(activity) {
                var top = this.getCurrent();
                if (top) {
                    top.stop();

                    if (this.isSameActivityGroup_(top, activity))
                        this.pop_().stop();
                }

                this.push_(activity);
            },

            [[ria.mvc.IActivity, ria.async.Future]],
            VOID, function shadeD(activity, data) {
                this.shade(activity);
                activity.refreshD(data);
            },

            /**
             * Shade top of stack with activity
             * @param {ria.mvc.Activity} activity
             */
            [[ria.mvc.IActivity]],
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

            [[ImplementerOf(ria.mvc.IActivity), ria.async.Future, String]],
            VOID, function updateD(activityClass, data, msg_) {
                this._stack.forEach(function (_) {
                    if (_ instanceof activityClass)
                        _.partialRefreshD(data, msg_);
                })
            },

            /**
             * Return current top of stack
             * @return {ria.mvc.Activity}
             */
            ria.mvc.IActivity, function getCurrent() {
                return this._stack[0] || null;
            },

            /**
             * Pop all from stack with stop and reset engine
             */
            VOID, function reset() {
                while (this.getCurrent() !== null)
                    this.pop_().stop();
            },

            ArrayOf(ria.mvc.IActivity), function getStack_() {
                return this._stack.slice();
            },

            [[ria.mvc.IActivity, Object, String]],
            VOID, function onActivityRefreshed_(activity, model, msg_) {
                this._refreshEvents.notifyAndClear([activity, model, msg_]);
            },

            [[ria.mvc.ActivityRefreshedEvent]],
            VOID, function onActivityRefreshed(callback) {
                this._refreshEvents.on(callback);
            }
        ]);
});
