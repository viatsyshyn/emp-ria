REQUIRE('ria.async.ICancelable');

NAMESPACE('ria.async', function () {
    "use strict";

    function DefaultDataHanlder(data) { return data; }
    function DefaultErrorHandler(e) { throw e; }

    function FutureBreaker() {}

    ria.async.BREAK = new FutureBreaker();
    Object.defineProperty(ria.async, 'BREAK', { writable: false, configurable: false, enumerable: true });

    /** @class ria.async.FutureDataDelegate */
    DELEGATE(
        [[Object]],
        Object, function FutureDataDelegate(data){});

    /** @class ria.async.FutureProgressDelegate */
    DELEGATE(
        [[Object]],
        Object, function FutureProgressDelegate(data){});

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
                this._canceler = canceler_;
                this._next = null;

                this._onData = null;
                this._onProgress = null;
                this._onError = null;
                this._onComplete = null;
            },

            VOID, function cancel() {
                this._canceler && this._canceler.cancel();
            },

            [[ria.async.FutureDataDelegate, Object]],
            SELF, function then(handler, scope_) {
                this._onData = handler.bind(scope_);
                return this.attach(new SELF);
            },

            [[ria.async.FutureProgressDelegate, Object]],
            SELF, function handleProgress(handler, scope_) {
                this._onProgress = handler.bind(scope_);
                return this.attach(new SELF);
            },

            [[ria.async.FutureErrorDelegate, Object]],
            SELF, function catchError(handler, scope_) {
                this._onError = handler.bind(scope_);
                return this.attach(new SELF);
            },

            // ClassOf(Exception)
            [[Function, ria.async.FutureErrorDelegate, Object]],
            SELF, function catchException(exception, handler, scope_) {
                var me = this;
                this._onError = function (error) {
                    if (error instanceof exception)
                        return handler.call(scope_, error);

                    throw error;
                };

                return this.attach(new SELF);
            },

            [[ria.async.FutureCompleteDelegate, Object]],
            SELF, function complete(handler, scope_) {
                this._onComplete = handler.bind(scope_);
                return this.attach(new SELF);
            },

            [[String, Object]],
            function doCallNext_(method, arg_) {
                if (!this._next) return ;

                var next_protected = (this._next.__PROTECTED || this._next); // this is hack
                var args = []; arg_ !== undefined && args.push(arg_);
                return next_protected[method].apply(next_protected, args);
            },

            VOID, function updateProgress_(data) {
                ria.__API.defer(this, function () {
                    try {
                        this._onProgress && this._onProgress(data);
                    } finally {
                        this.doCallNext_('updateProgress_', data);
                    }
                });
            },

            VOID, function complete_(data) {
                ria.__API.defer(this, function () {
                    try {
                        var result = (this._onData || DefaultDataHanlder).call(this, data);
                        if (result === ria.async.BREAK) {
                            this.doCallNext_('completeBreak_');
                        } else if (result instanceof ria.async.Future) {
                            this.attach(result);
                        } else {
                            this.doCallNext_('complete_', result === undefined ? null : result);
                        }
                    } catch (e) {
                        this.doCallNext_('completeError_', e);
                    } finally {
                        this._onComplete && this._onComplete();
                    }
                });
            },

            VOID, function completeError_(error) {
                if (!this._next)
                    throw error;

                ria.__API.defer(this, function () {
                    try {
                        var result = (this._onError || DefaultErrorHandler).call(this, error);
                        this.doCallNext_('complete_', result === undefined ? null : result);
                    } catch (e) {
                        this.doCallNext_('completeError_', e);
                    } finally {
                        this._onComplete && this._onComplete();
                    }
                });
            },

            VOID, function completeBreak_() {
                ria.__API.defer(this, function () {
                    try {
                        this._onComplete && this._onComplete();
                    } finally {
                        this.doCallNext_('completeBreak_');
                    }
                });
            },

            [[ria.async.ICancelable]],
            VOID, function setCanceler_(canceler) {
                this._canceler = canceler;
            },

            [[SELF]],
            SELF, function attach(future) {
                var old_next = this._next;
                this._next = future;
                this.doCallNext_('setCanceler_', this);
                return this.attachEnd_(old_next || null);
            },

            [[SELF]],
            SELF, function attachEnd_(future) {
                return this._next
                    ? this.doCallNext_('attachEnd_', future)
                    : (future ? (this._next = future) : this);
            }
        ]);

    /* this is hack */
    /** @class ria.async.DeferredData*/
    /** @class ria.async.DeferredAction*/
    ria.async.DeferredAction = ria.async.DeferredData = function (data_, delay_) {
        var future = new ria.async.Future;
        ria.__API.defer(null, (future.__PROTECTED || future).complete_, [data_ || null], delay_|0);
        return future;
    };
});
