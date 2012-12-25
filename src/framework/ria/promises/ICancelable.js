
/**
 * @namespace emp.promises
 */
NS('ria.promises', function () {

    /**
     * @class emp.promises.ICancelable
     */
    INTERFACE(
        'ICancelable', [
             VOID, function cancel() {}
        ])
})