/** @namespace hwa.reflection */
NAMESPACE('hwa.reflection', function () {
    "use strict";

    /** @class hwa.reflection.Exception */
    EXCEPTION('Exception', [
        [String],
        PUBLIC, function __constructor(message) {
            BASE(message)
        },

        [String, Object],
        PUBLIC, function __constructor(message, inner) {
            BASE(message, inner)
        }
    ]);
});