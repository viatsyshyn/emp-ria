"use strict";

REQUIRE('hwax.templates.IConverter');

/** @namespace hwax.templates */
NAMESPACE('hwax.templates', function () {

    /** @class hwax.templates.IConverterFactory */
    INTERFACE('IConverterFactory', [
        [Function],
        Boolean, function canCreate(converterClass) {},
        [Function],
        hwax.templates.IConverter, function create(converterClass) {}
    ])
});