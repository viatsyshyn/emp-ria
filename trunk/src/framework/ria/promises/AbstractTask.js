REQUIRE('ria.promises.IFuture')
REQUIRE('ria.promises.IFutureCompleter')
REQUIRE('ria.promises.ITask')
REQUIRE('ria.promises.ICancelable')

/**
 * @namespace emp.promises
 */
NS('ria.promises', function () {

    var FutureImpl = PRIVATE_CLASS(
        'FutureImpl', IMPLEMENTS(ria.promises.IFuture, ria.promises.IFutureCompleter, ria.promises.ICancelable), [
            // ria.promises.IFuture
            [ria.promises.ProgressHandler],
            ria.promises.IFuture, function progress(progback) {},
            [ria.promises.DataHandler],
            ria.promises.IFuture, function chain(callback) {},
            [ria.promises.ErrorHandler],
            ria.promises.IFuture, function error(errback) {},
            ria.promises.IFuture, function complete(callback) {},

            // ria.promises.ICancelable
            VOID, function cancel() {},

            [ria.promises.ICancelable],
            function $(cancelable) {}, // Future or Task

            // ria.promises.IFutureCompleter
            VOID, function resolve(data) {},
            VOID, function notify(data) {},
            VOID, function fail(exception) {}
        ])

    /**
     * @class emp.promises.AbstractTask
     */
    CLASS(
        ABSTRACT, 'AbstractTask', IMPLEMENTS(ria.promises.ITask, ria.promises.ICancelable), [
            // ria.promises.ITask
            ABSTRACT, ria.promises.IFuture, function run() {},

            // ria.promises.ICancelable
            VOID, function cancel() {},

            function $() {
                this.promise = FutureImpl(this);
            }
        ])
})