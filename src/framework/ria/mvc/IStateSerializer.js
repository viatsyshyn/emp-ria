REQUIRE('ria.mvc.State');

/** @namespace hwa.mvc */
NAMESPACE('ria.mvc', function () {
    "use strict";

    /**
     * @class ria.mvc.IStateSerializer
     */
    INTERFACE('IStateSerializer', [
        [[ria.mvc.State]],
        String, function serialize(state) {},

        [[String]],
        ria.mvc.State, function deserialize(value) {}
    ]);
});
