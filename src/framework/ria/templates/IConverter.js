NAMESPACE('ria.templates', function () {
    "use strict";

    /** @class ria.templates.IConverter */
    INTERFACE(
        'IConverter', [
            Object, function convert(source) {}
        ])
});