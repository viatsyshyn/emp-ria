REQUIRE('ria.async.Future');

NAMESPACE('ria.async', function () {
    "use strict";

    /** @class ria.async.Completer */
    CLASS(
        'Completer', IMPLEMENTS(ria.async.ICancelable), [
            READONLY, ria.async.Future, 'future',
            READONLY, Boolean, 'complete',

            [[ria.async.ICancelable]],
            function $(canceler_) {
                this.future = new ria.async.Future(canceler_);
                this.complete = false;
            },

            [[String, Object]],
            function doCallFuture_(method, arg_) {
                if (this.complete) return;

                var future_protected = (this.future.__PROTECTED || this.future); // this is hack
                var args = []; arg_ !== undefined && args.push(arg_);
                return future_protected[method].apply(future_protected, args);
            },

            VOID, function progress(data) {
                this.doCallFuture_('updateProgress_', data);
            },

            VOID, function complete(data) {
                this.complete = true;
                this.doCallFuture_('complete_', data);
            },

            VOID, function completeError(error) {
                this.complete = true;
                this.doCallFuture_('completeError_', error);
            },

            VOID, function cancel() {
                this.complete = true;
                this.doCallFuture_('completeBreak_');
            }
        ])
});