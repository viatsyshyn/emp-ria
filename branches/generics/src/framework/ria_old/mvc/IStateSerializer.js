REQUIRE('hwa.mvc.State');

/** @namespace hwa.mvc */
NAMESPACE('hwa.mvc', function () {
    "use strict";

    /**
     * @class hwa.mvc.IStateSerializer
     * @interface
     */
    INTERFACE('IStateSerializer', [
        [hwa.mvc.State],
        String, function serialize(object) {},

        [String],
        hwa.mvc.State, function deserialize(value) {}
    ]);
});
