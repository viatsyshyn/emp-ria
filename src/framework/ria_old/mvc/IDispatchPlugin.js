REQUIRE('hwa.mvc.State');

/** @namespace hwa.mvc */
NAMESPACE('hwa.mvc', function () {
    "use strict";

    /**
     * @class hwa.mvc.IDispatchPlugin
     * @interface
     */
    INTERFACE('IDispatchPlugin', [
        VOID, function dispatchStartup() {},
        [hwa.mvc.State],
        VOID, function preDispatch(state) {},
        [hwa.mvc.State],
        VOID, function postDispatch(state) {},
        VOID, function dispatchShutdown() {}
    ]);
});