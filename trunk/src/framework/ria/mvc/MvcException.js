NAMESPACE('ria.mvc', function () {
    "use strict";

    /** @class hwa.mvc.MvcException */
    EXCEPTION(
        'MvcException', [
            [String, Object],
            PUBLIC, function $(message, inner_) {
                BASE(message, inner_);
            }
        ]);
});