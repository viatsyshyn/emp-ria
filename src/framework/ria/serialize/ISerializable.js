NAMESPACE('ria.serialize', function () {
    "use strict";

    /** @class ria.serialize.ISerializable */
    INTERFACE(
        'ISerializable', [
            Object, function serialize() {}
        ])
});