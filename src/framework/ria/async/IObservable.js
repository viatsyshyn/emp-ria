/**
 * Created with JetBrains WebStorm.
 * User: viatsyshyn
 * Date: 08.07.13
 * Time: 19:27
 * To change this template use File | Settings | File Templates.
 */

NAMESPACE('ria.async', function () {

    /** @class ria.async.Observer */
    DELEGATE(
        [[Object]],
        Boolean, function Observer(data_) {});

    /** @class ria.async.IObservable */
    INTERFACE(
        'IObservable', [
            [[ria.async.Observer, Object]],
            SELF, function on(handler, scope_) {},

            [[ria.async.Observer]],
            SELF, function off(handler) {}
        ]);
});