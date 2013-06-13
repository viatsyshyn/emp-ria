REQUIRE('ria.async.Completer');

NAMESPACE('ria.async', function () {
    "use strict";

    /** @class ria.async.Task */
    CLASS(ABSTRACT,
        'Task', IMPLEMENTS(ria.async.ICancelable), [
            function $() {
                this._completer = new ria.async.Completer(this);
            },

            /**
             * Do work here, use this.completer to notify about progress/success/failure
             */
            ABSTRACT, VOID, function do_() {},

            /**
             * Override this if task can be canceled
             */
            VOID, function cancel() {
                this._completer.cancel();
            },

            ria.async.Future, function run() {
                setTimeout(this.do_, 0); // defer start
                return this._completer.getFuture();
            }
        ])
});
