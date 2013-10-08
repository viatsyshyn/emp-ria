/** @namespace hwa.mvc */
NAMESPACE('hwa.mvc', function () {
    "use strict";

    /** @class hwa.mvc.MvcException */
    EXCEPTION('MvcException', [
        [String, Object],
        PUBLIC, function __constructor(message, inner) {
            BASE(message, inner);
        },

        [String],
        PUBLIC, function __constructor(message) {
            BASE(message);
        }
    ]);
});