/**
 * @namespace ria.promises
 */
NS('ria.promises', function () {
    "use strict";

    /**
     * @class ria.promises.ProgressHandler
     */
    DELEGATE(
        [Object],
        VOID, function ProgressHandler(data) {})

    /**
     * @class ria.promises.DataTransformer
     */
    DELEGATE(
        [Object],
        Object, function DataTransformer(data) {})

    /**
     * @class ria.promises.DataHandler
     */
    DELEGATE(
        [Object],
        IFuture, function DataHandler(data) {})

    /**
     * @class ria.promises.ErrorHandler
     */
    DELEGATE(
        [Exception],
        Boolean, function ErrorHandler(exception) {})

    /**
     * @class ria.promises.CompleteHandler
     */
    DELEGATE(
        VOID, function CompleteHandler() {})

    /**
     * @class ria.promises.IFuture
     */
    INTERFACE(
        'IFuture', [
            /**
             * @method chain
             * @param {ria.promises.DataHandler} callback
             */
            [ria.promises.DataHandler],
            SELF, function chain(callback) {},

            [ria.promises.DataTransformer],
            SELF, function done(callback) {},

            [ria.promises.ErrorHandler],
            SELF, function error(errback) {},

            [ria.promises.ProgressHandler],
            SELF, function progress(progback) {},

            [ria.promises.CompleteHandler],
            SELF, function complete(callback) {},

            VOID, function cancel() {}
        ])
});