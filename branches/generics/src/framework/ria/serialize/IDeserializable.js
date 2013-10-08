NAMESPACE('ria.serialize', function () {
    "use strict";

    /** @class ria.serialize.IDeserializable */
    INTERFACE(
        'IDeserializable', [
            VOID, function deserialize(raw) {}
        ])
});