/**
 * Created with JetBrains WebStorm.
 * User: viatsyshyn
 * Date: 03.07.13
 * Time: 9:45
 * To change this template use File | Settings | File Templates.
 */

REQUIRE('ria.async.IObservable');

NAMESPACE('ria.async', function () {

    /** @class ria.async.Observable */
    CLASS(
        'Observable', IMPLEMENTS(ria.async.IObservable), [
            function $() {
                this._handlers = [];
            },

            [[ria.async.Observer, Object]],
            ria.async.IObservable, function on(handler, scope_) {
                this.off(handler);
                this._handlers.push([handler, scope_]);
                return this;
            },

            [[ria.async.Observer]],
            ria.async.IObservable, function off(handler) {
                this._handlers = this._handlers
                    .filter(function (_) { return handler[0] !== _});
                return this;
            },

            [[Array, Boolean]],
            VOID, function notify_(data, once) {
                var me = this;
                this._handlers.forEach(function (_) {
                    ria.__API.defer(me, function (handler, scope) {
                        var result = true;
                        try {
                            result = handler.apply(scope, data);
                        } catch (e) {
                            throw new Exception('Unhandled error occurred while notifying observer', e);
                        } finally {
                            if (!once && result !== false)
                                this._handlers.push(_);
                        }
                    }, _);
                });

                this._handlers = [];
            },

            [[Array, Boolean]],
            VOID, function notify(data_, once_) {
                this.notify_(data_ || [], false);
            },

            [[Array]],
            VOID, function notifyAndClear(data_) {
                this.notify_(data_ || [], true);
            },

            Number, function count() {
                return this._handlers.length;
            },

            VOID, function clear() {
                this._handlers = [];
            }
        ]);
});