NAMESPACE('ria.reflection', function () {
    "use strict";

    /** @class ria.reflection.Exception */
    EXCEPTION('Exception', [
        [String, Object],
        PUBLIC, function $(message, inner_) {
            BASE(message, inner);
        }
    ]);
});