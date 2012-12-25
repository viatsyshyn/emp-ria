REQUIRE('ria.promises.IFuture')

/**
 * @namespace emp.promises
 */
NS('ria.promises', function () {

    /**
     * @class emp.promises.ITask
     */
    INTERFACE(
        'ITask', [
             ria.promises.IFuture, function run() {}
        ])
})