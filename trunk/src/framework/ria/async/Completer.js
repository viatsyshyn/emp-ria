REQUIRE('ria.async.Future');

NAMESPACE('ria.async', function () {
    "use strict";

    /** @class ria.async.Completer */
    CLASS(
        'Completer', [
            READONLY, ria.async.Future, 'future',

            [[ria.async.ICancelable]],
            function $(canceler_) {
                this.future = new ria.async.Future(canceler_);
            },

            [[String, Object]],
            function doCallFuture_(method, arg) {
                if (!this.future)
                    return ;

                var future_protected = (this.future.__PROTECTED || this.future); // this is hack
                return future_protected[method].call(future_protected, arg);
            },

            VOID, function progress(data) {
                this.doCallFuture_('updateProgress_', data);
            },

            VOID, function complete(data) {
                this.doCallFuture_('complete_', data);
            },

            VOID, function completeError(error) {
                this.doCallFuture_('completeError_', error);
            }
        ])
});