REQUIRE('ria.async.Future');

NAMESPACE('ria.async', function () {
    "use strict";

    /** @class ria.async.Completer */
    CLASS(
        'Completer', IMPLEMENTS(ria.async.ICancelable), [
            READONLY, ria.async.Future, 'future',
            READONLY, Boolean, 'completed',

            ria.async.Future, function getFuture() {
                return this.future.getWrapper();
            },

            [[ria.async.ICancelable]],
            function $(canceler_) {
                BASE();
                this.future = new ria.async.FutureImpl(canceler_);
                this.completed = false;
            },

            VOID, function progress(data) {
                this.future.updateProgress(data);
            },

            VOID, function complete(data) {
                this.future.finish(data);
                this.completed = true;
            },

            VOID, function completeError(error) {
                this.future.completeError(error);
                this.completed = true;
            },

            VOID, function cancel() {
                this.future.completeBreak();
                this.completed = true;
            }
        ])
});