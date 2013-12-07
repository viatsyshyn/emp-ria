REQUIRE('ria.async.Future');

NAMESPACE('demo', function () {
    "use strict";

    /** @class demo.DemoApplication */
    CLASS(
        'DemoApplication', [
            ria.async.Future, function onInitialize_() {
                return null;
            },

            VOID, function MAIN(settings_) {
                console.info('app start');
            }
        ]);
});