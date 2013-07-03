REQUIRE('ria.async.ICancelable');

NAMESPACE('ria.async', function () {
    "use strict";

    /** @class ria.async.TimerDelegate */
    DELEGATE(
        [[Object, Number]],
        VOID, function TimerDelegate(timer, lag) {});

    /** @class ria.async.Timer */
    CLASS(
        'Timer', IMPLEMENTS(ria.async.ICancelable), [
            [[Number, ria.async.TimerDelegate]],
            function $(duration, handler) {
                var me = this;
                var lastCall = new Date();
                this.cleaner = clearInterval;
                this.timer = setInterval(function () {
                    handler(me, -(lastCall.getTime() - (lastCall = new Date).getTime() ));
                }, duration < 0 ? 0 : duration);
            },

            VOID, function cancel() {
                this.cleaner(this.timer);
            }

            /*
            [[Number, ria.async.TimerDelegate]],
            function $once(duration, handler) {
                var me = this;
                var lastCall = new Date();
                this.cleaner = clearTimeout;
                this.timer = setTimeout(function () {
                    handler(me, -(lastCall.getTime() - (lastCall = new Date).getTime() ));
                }, duration < 0 ? 0 : duration);
            }
            */

            /*
            [[Function, Array, Object]],
            STATIC, VOID, function run(handler, args_, scope_) {
                ria.__API.defer(scope_ || window, handler, args_ || []);
            }
            */
        ]);
});