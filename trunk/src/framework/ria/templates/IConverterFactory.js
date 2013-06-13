REQUIRE('ria.templates.IConverter');

NAMESPACE('ria.templates', function () {
    "use strict";

    /** @class ria.templates.IConverterFactory */
    INTERFACE(
        'IConverterFactory', [
            [[Function]],
            Boolean, function canCreate(converterClass) {},

            [[Function]],
            ria.templates.IConverter, function create(converterClass) {}
        ]);
});