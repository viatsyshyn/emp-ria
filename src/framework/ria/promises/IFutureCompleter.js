
/**
 * @namespace emp.promises
 */
NS('ria.promises', function () {

    /**
     * @class emp.promises.IFutureCompleter
     */
    INTERFACE(
        'IFutureCompleter', [
             VOID, function resolve(data) {},
             VOID, function notify(data) {},
             [Exception],
             VOID, function fail(exception) {}
        ])
})