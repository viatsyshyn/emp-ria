REQUIRE('ria.async.Future');
REQUIRE('ria.async.ICancelable');

NAMESPACE('ria.async', function () {
    "use strict";

    /** @class ria.async.Completer */
    CLASS(
        'Completer', [
            READONLY, ria.async.Future, 'future',

            [ria.async.ICancelable],
            function $(canceler_) {
                this.future = new ria.async.Future(canceler_);
            },

            [String, Array],
            function doCallFuture_(method, args) {
                if (!this.future)
                    return ;

                var future_protected = (this.future.__PROTECTED || this.future); // this is hack
                return future_protected[method].apply(future_protected, args);
            },

            VOID, function complete(data) {
                this.doCallFuture_('complete_', [data]);
            },

            VOID, function completeError(error) {
                this.doCallFuture_('completeError_', [error]);
            }
        ])
});