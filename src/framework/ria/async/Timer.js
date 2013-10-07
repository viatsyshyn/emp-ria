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
                BASE();
                var me = this;
                var lastCall = new Date();
                this.cleaner = clearInterval.bind(window);
                this.timer = setInterval(function () {
                    handler(me, -(lastCall.getTime() - (lastCall = new Date).getTime() ));
                }, duration < 0 ? 0 : duration);
            },

            VOID, function cancel() {
                this.timer && this.cleaner.call(window, this.timer);
                this.timer = null;
            },

            [[Number, ria.async.TimerDelegate]],
            function $once(duration, handler) {
                var me = this;
                var lastCall = new Date();
                this.cleaner = clearTimeout;
                this.timer = setTimeout(function () {
                    this.timer = null;
                    handler(me, -(lastCall.getTime() - (lastCall = new Date).getTime() ));
                }, duration < 0 ? 0 : duration);
            }

            /*
            [[ria.async.TimerDelegate, Array, Object]],
            STATIC, VOID, function RUN(handler, args_, scope_) {
                ria.__API.defer(scope_ || window, handler, args_ || []);
            }

            ria.async.Timer.RUN(function () {})
            */
        ]);
});