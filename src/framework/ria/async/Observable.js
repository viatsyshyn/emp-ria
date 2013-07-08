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
        'Observable', [
            function $() {
                this._handlers = [];
            },

            [[ria.async.Observer]],
            ria.async.IObservable, function on(handler) {
                this.off(handler);
                this._handlers.push(handler);
                return this;
            },

            [[ria.async.Observer]],
            ria.async.IObservable, function off(handler) {
                this._handlers = this._handlers
                    .filter(function (_) { return handler !== _});
                return this;
            },

            [[Object]],
            VOID, function notify(data_) {
                var me = this;
                this._handlers
                    .forEach(function (handler) {
                        ria.__API.defer(me, function (handler) {
                            var result = true;
                            try {
                                result = handler(data_);
                            } catch (e) {
                                throw new Exception('Unhandled error occurred while notifying observer', e);
                            } finally {
                                if (result !== false)
                                    this._handlers.push(handler);
                            }
                        }, [handler]);
                    });

                this._handlers = [];
            },

            Number, function count() {
                return this._handlers.length;
            }
        ]);
});