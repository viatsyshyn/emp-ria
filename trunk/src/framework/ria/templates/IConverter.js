"use strict";

/** @namespace hwax.templates */
NAMESPACE('hwax.templates', function () {

    /** @class hwax.templates.IConverter */
    INTERFACE('IConverter', [
        Object, function convert(source) {}
    ])
});