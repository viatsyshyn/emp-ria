REQUIRE('hwa.mvc.IContext');

/** @namespace hwa.mvc */
NAMESPACE('hwa.mvc', function () {
    "use strict";

    /**
     * @class hwa.mvc.IContextable
     * @interface
     */
    INTERFACE('IContextable', [
        [hwa.mvc.IContext],
        VOID, function setContext(context) {}
    ]);
});
