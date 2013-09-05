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

    /** @class ria.async.FutureImpl */
    CLASS(
        'FutureImpl', IMPLEMENTS(ria.async.ICancelable), [

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

            [[ClassOf(Exception), ria.async.FutureErrorDelegate, Object]],
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

            VOID, function updateProgress(data) {
                ria.__API.defer(this, function () {
                    try {
                        this._onProgress && this._onProgress(data);
                    } finally {
                        this._next && this._next.updateProgress(data);
                    }
                });
            },

            VOID, function finish(data) {
                ria.__API.defer(this, function () {
                    try {
                        var result = (this._onData || DefaultDataHanlder).call(this, data);
                        if (result === ria.async.BREAK) {
                            this._next && this._next.completeBreak();
                        } else if (result instanceof ria.async.FutureImpl) {
                            this.attach(result);
                        } else if (result instanceof ria.async.Future) {
                            this.attach(result.getImpl());
                        } else {
                            this._next && this._next.finish(result === undefined ? null : result);
                        }
                    } catch (e) {
                        this._next && this._next.completeError(e);
                    } finally {
                        this._onComplete && this._onComplete();
                    }
                });
            },

            VOID, function completeError(error) {
                if (!this._next)
                    throw new Exception('Uncaught error', error);

                ria.__API.defer(this, function () {
                    try {
                        var result = (this._onError || DefaultErrorHandler).call(this, error);
                        this._next && this._next.finish(result === undefined ? null : result);
                    } catch (e) {
                        this._next && this._next.completeError(e);
                    } finally {
                        this._onComplete && this._onComplete();
                    }
                });
            },

            VOID, function completeBreak() {
                ria.__API.defer(this, function () {
                    try {
                        this._onComplete && this._onComplete();
                    } finally {
                        this._next && this._next.completeBreak();
                    }
                });
            },

            [[ria.async.ICancelable]],
            VOID, function setCanceler(canceler) {
                this._canceler = canceler;
            },

            [[SELF]],
            SELF, function attach(future) {
                var old_next = this._next;
                this._next = future;
                this._next.setCanceler(this);
                return this.attachEnd(old_next || null);
            },

            [[SELF]],
            SELF, function attachEnd(future) {
                return this._next
                    ? this._next.attachEnd(future)
                    : (future ? (this._next = future) : this);
            },

            function getWrapper() {
                return new ria.async.Future(this);
            }
        ]);

    /** @class ria.async.Future */
    CLASS(
        FINAL, 'Future', IMPLEMENTS(ria.async.ICancelable), [
            [[ria.async.FutureImpl]],
            function $(impl_) {
                this._impl = impl_ || new ria.async.FutureImpl();
            },

            VOID, function cancel() {
                this._impl.cancel();
            },

            [[ria.async.FutureDataDelegate, Object]],
            SELF, function then(handler, scope_) {
                return new SELF(this._impl.then(handler, scope_));
            },

            [[ria.async.FutureProgressDelegate, Object]],
            SELF, function handleProgress(handler, scope_) {
                return new SELF(this._impl.handleProgress(handler, scope_));
            },

            [[ria.async.FutureErrorDelegate, Object]],
            SELF, function catchError(handler, scope_) {
                return new SELF(this._impl.catchError(handler, scope_));
            },

            [[ClassOf(Exception), ria.async.FutureErrorDelegate, Object]],
            SELF, function catchException(exception, handler, scope_) {
                return new SELF(this._impl.catchException(exception, handler, scope_));
            },

            [[ria.async.FutureCompleteDelegate, Object]],
            SELF, function complete(handler, scope_) {
                return new SELF(this._impl.complete(handler, scope_));
            },

            [[SELF]],
            SELF, function attach(future) {
                return new SELF(this._impl.attach(future.getImpl()));
            },

            function getImpl() { return this._impl; }
        ]);

    /** @class ria.async.DeferredData*/
    /** @class ria.async.DeferredAction*/
    ria.async.DeferredAction = ria.async.DeferredData = function (data_, delay_) {
        var future = new ria.async.FutureImpl;
        ria.__API.defer(null, future.finish, [data_ || null], delay_|0);
        return future.getWrapper();
    };
});
