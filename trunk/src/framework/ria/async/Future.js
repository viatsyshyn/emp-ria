REQUIRE('ria.async.ICancelable');

NAMESPACE('ria.async', function () {
    "use strict";

    function DefaultHandler(e) { throw e; }

    // todo replace with ria.async.Time.run
    function defer(scope, method, args_) {
        setTimeout(function () { method.apply(scope, args_ || []); }, 1);
    }

    /** @class ria.async.FutureDataDelegate */
    DELEGATE(
        [[Object]],
        Object, function FutureDataDelegate(data){});

    /** @class ria.async.FutureErrorDelegate */
    DELEGATE(
        [[Object]],
        Object, function FutureErrorDelegate(error){});

    /** @class ria.async.FutureCompleteDelegate */
    DELEGATE(
        VOID, function FutureCompleteDelegate(){});

    /** @class ria.async.Future */
    CLASS(
        'Future', IMPLEMENTS(ria.async.ICancelable), [

            [[ria.async.ICancelable]],
            function $(canceler_) {
                this.canceler = canceler_;
                this.next = null;

                this.onData = null;
                this.onError = null;
                this.onComplete = null;
                this.broke = false;
            },

            VOID, function cancel() {
                this.canceler && this.canceler.cancel();
            },

            [[ria.async.FutureDataDelegate]],
            SELF, function then(handler) {
                this.onData = handler;
                return this.attach(new SELF(this));
            },

            [[ria.async.FutureErrorDelegate]],
            SELF, function catchError(handler) {
                this.onError = handler;
                return this.attach(new SELF(this));
            },

            // ClassOf(Exception)
            [[Function, ria.async.FutureErrorDelegate]],
            SELF, function catchException(exception, handler) {
                var me = this;
                this.onError = function (error) {
                    if (error instanceof exception)
                        return handler.call(me, error);

                    throw error;
                };

                return this.attach(new SELF(this));
            },

            [[ria.async.FutureCompleteDelegate]],
            SELF, function complete(handler) {
                this.onComplete = handler;
                return this.attach(new SELF(this));
            },

            VOID, function BREAK() {
                this.broke = true;
            },

            [[String, Object]],
            function doCallNext_(method, arg_) {
                if (!this.next) return ;

                var next_protected = (this.next.__PROTECTED || this.next); // this is hack
                var args = []; arg_ !== undefined && args.push(arg_);
                return next_protected[method].apply(next_protected, args);
            },

            VOID, function complete_(data) {
                defer(this, function () {
                    try {
                        if (this.onData) {
                            var result = this.onData(data);
                            if (this.broke) {
                                this.doCallNext_('completeBreak_');
                            } else if (result instanceof ria.async.Future) {
                                result.attach(this.next);
                            } else {
                                this.doCallNext_('complete_', result === undefined ? null : result);
                            }
                        }
                    } catch (e) {
                        this.doCallNext_('completeError_', e);
                    } finally {
                        this.onComplete && this.onComplete();
                    }
                });
            },

            VOID, function completeError_(error) {
                if (!this.next)
                    throw error;

                defer(this, function () {
                    try {
                        var result = (this.onError || DefaultHandler).call(this, error);
                        this.doCallNext_('complete_', result === undefined ? null : result);
                    } catch (e) {
                        this.doCallNext_('completeError_', e);
                    } finally {
                        this.onComplete && this.onComplete();
                    }
                });
            },

            VOID, function completeBreak_() {
                defer(this, function () {
                    try {
                        this.onComplete && this.onComplete();
                    } finally {
                        this.doCallNext_('completeBreak_');
                    }
                });
            },

            [[SELF]],
            SELF, function attach(future) {
                return this.next = future;
            }
        ]);
});
