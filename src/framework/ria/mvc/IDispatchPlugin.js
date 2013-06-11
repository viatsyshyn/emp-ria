REQUIRE('ria.mvc.State');

NAMESPACE('ria.mvc', function () {
    "use strict";

    /**
     * @class ria.mvc.IDispatchPlugin
     */
    INTERFACE(
        'IDispatchPlugin', [
            VOID, function dispatchStartup() {},
            [[hwa.mvc.State]],
            VOID, function preDispatch(state) {},
            [[hwa.mvc.State]],
            VOID, function postDispatch(state) {},
            VOID, function dispatchShutdown() {}
        ]);
});