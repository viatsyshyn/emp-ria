REQUIRE('hwa.event.IEvent');

REQUIRE('hwa.mvc.IView');
REQUIRE('hwa.mvc.IAppSession');
REQUIRE('hwa.mvc.IActivity');
REQUIRE('hwa.mvc.IService');
REQUIRE('hwa.mvc.State');

/** @namespace hwa.mvc */
NAMESPACE('hwa.mvc', function () {
    "use strict";

    /**
     * @class hwa.mvc.IContext
     */
    INTERFACE('IContext', [
        hwa.mvc.IView, function getDefaultView() {},

        hwa.mvc.IAppSession, function getAppSession() {},

        hwa.mvc.IService, function getService(clazz) {},

        [hwa.event.IEvent],
        VOID, function addAsyncInitEvent(event) {},

        [Function],
        VOID, function addExtensionMethod(handler) {},

        String, function getCurrentRole() {},

        [Object],
        VOID, function setCurrentRole(role) {},

        VOID, function stateUpdated() {},

        hwa.mvc.State, function getState() {}
    ]);
});