
/** @namespace hwa.mvc */
NAMESPACE('hwa.mvc', function () {
    "use strict";

    /**
     * @class hwa.mvc.IAppSession
     * @interface
     */
    INTERFACE('IAppSession', [
        [String, Object],
        Object, function get(key, def) {},

        [String, Object, Boolean],
        VOID, function set(key, value, isPersistent) {},

        [String],
        VOID, function remove(key) {}
    ]);
});
