REQUIRE('ria.async.Future');

NAMESPACE('ria.async', function () {
    "use strict";

    /** @class ria.async.Completer */
    CLASS(
        'Completer', IMPLEMENTS(ria.async.ICancelable), [
            READONLY, ria.async.Future, 'future',
            READONLY, Boolean, 'completed',

            [[ria.async.ICancelable]],
            function $(canceler_) {
                this.future = new ria.async.Future(canceler_);
                this.completed = false;
            },

            [[String, Object]],
            function doCallFuture_(method, arg_) {
                if (this.completed) return;

                var future_protected = (this.future.__PROTECTED || this.future); // this is hack
                var args = []; arg_ !== undefined && args.push(arg_);
                return future_protected[method].apply(future_protected, args);
            },

            VOID, function progress(data) {
                this.doCallFuture_('updateProgress_', data);
            },

            VOID, function complete(data) {
                this.doCallFuture_('complete_', data);
                this.completed = true;
            },

            VOID, function completeError(error) {
                this.doCallFuture_('completeError_', error);
                this.completed = true;
            },

            VOID, function cancel() {
                this.doCallFuture_('completeBreak_');
                this.completed = true;
            }
        ])
});